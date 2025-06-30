import { Explosion, GameState, Particle, ItemType } from '../types/Game';
import { BLOCK_PROPERTIES } from './BlockProperties';

export class ExplosionSystem {
  static createExplosion(
    x: number, 
    y: number, 
    radius: number, 
    damage: number, 
    type: 'fire' | 'ice' | 'holy' | 'dark' | 'normal',
    gameState: GameState
  ): void {
    const explosion: Explosion = {
      id: `explosion_${Date.now()}_${Math.random()}`,
      x,
      y,
      radius,
      damage,
      type,
      duration: 1000
    };
    
    gameState.explosions.push(explosion);
    
    // Damage mobs in radius
    gameState.mobs.forEach(mob => {
      const distance = Math.sqrt(Math.pow(mob.x - x, 2) + Math.pow(mob.y - y, 2));
      if (distance <= radius) {
        const actualDamage = Math.floor(damage * (1 - distance / radius));
        mob.health -= actualDamage;
        
        // Apply special effects based on explosion type
        switch (type) {
          case 'fire':
            mob.statusEffects.push({
              type: 'burning',
              duration: 5000,
              power: 5
            });
            break;
          case 'ice':
            mob.statusEffects.push({
              type: 'frozen',
              duration: 3000,
              power: 1
            });
            break;
          case 'holy':
            if (mob.alignment === 'evil') {
              mob.health -= actualDamage; // Double damage to evil
            }
            break;
          case 'dark':
            if (mob.alignment === 'good') {
              mob.health -= actualDamage; // Double damage to good
            }
            break;
        }
        
        this.addCombatLog(gameState, `${mob.type} takes ${actualDamage} ${type} damage from explosion!`, 'explosion');
      }
    });
    
    // Damage player if in radius
    const playerDistance = Math.sqrt(Math.pow(gameState.player.x - x, 2) + Math.pow(gameState.player.y - y, 2));
    if (playerDistance <= radius) {
      const playerDamage = Math.floor(damage * (1 - playerDistance / radius));
      gameState.player.health = Math.max(0, gameState.player.health - playerDamage);
      this.addCombatLog(gameState, `You take ${playerDamage} damage from the explosion!`, 'explosion');
    }
    
    // Destroy blocks in smaller radius
    const destructionRadius = Math.floor(radius / 2);
    for (let dx = -destructionRadius; dx <= destructionRadius; dx++) {
      for (let dy = -destructionRadius; dy <= destructionRadius; dy++) {
        const blockX = Math.floor(x + dx);
        const blockY = Math.floor(y + dy);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= destructionRadius && 
            blockX >= 0 && blockX < gameState.world.length &&
            blockY >= 0 && blockY < gameState.world[0].length) {
          
          const block = gameState.world[blockX][blockY];
          const blockProps = BLOCK_PROPERTIES[block.type];
          
          // Only destroy certain block types
          if (block.type === 'wall' || block.type === 'door' || block.type === 'chest') {
            gameState.world[blockX][blockY] = { type: 'floor' as any, x: blockX, y: blockY };
          }
        }
      }
    }
    
    // Create particles
    this.createExplosionParticles(x, y, radius, type, gameState);
  }
  
  static createExplosionParticles(
    x: number, 
    y: number, 
    radius: number, 
    type: string, 
    gameState: GameState
  ): void {
    const particleCount = radius * 8;
    const colors = {
      fire: ['#ff4500', '#ff6347', '#ffa500'],
      ice: ['#87ceeb', '#b0e0e6', '#add8e6'],
      holy: ['#ffd700', '#ffffe0', '#fffacd'],
      dark: ['#800080', '#4b0082', '#8b008b'],
      normal: ['#a0a0a0', '#808080', '#696969']
    };
    
    const particleColors = colors[type as keyof typeof colors] || colors.normal;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 5 + Math.random() * 10;
      const color = particleColors[Math.floor(Math.random() * particleColors.length)];
      
      const particle: Particle = {
        id: `particle_${Date.now()}_${i}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 500 + Math.random() * 1000,
        maxLife: 500 + Math.random() * 1000,
        type: type as any
      };
      
      gameState.particles.push(particle);
    }
  }
  
  static useBomb(bombType: ItemType, targetX: number, targetY: number, gameState: GameState): void {
    switch (bombType) {
      case ItemType.BOMB:
        this.createExplosion(targetX, targetY, 4, 40, 'normal', gameState);
        break;
      case ItemType.FIRE_BOMB:
        this.createExplosion(targetX, targetY, 5, 35, 'fire', gameState);
        break;
      case ItemType.ICE_BOMB:
        this.createExplosion(targetX, targetY, 4, 25, 'ice', gameState);
        break;
      case ItemType.POISON_BOMB:
        this.createExplosion(targetX, targetY, 6, 20, 'normal', gameState);
        // Add poison cloud
        this.createPoisonCloud(targetX, targetY, gameState);
        break;
      case ItemType.HOLY_GRENADE:
        this.createExplosion(targetX, targetY, 6, 60, 'holy', gameState);
        break;
    }
  }
  
  private static createPoisonCloud(x: number, y: number, gameState: GameState): void {
    // Create poison particles
    for (let i = 0; i < 50; i++) {
      const particle: Particle = {
        id: `poison_${Date.now()}_${i}`,
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: '#32cd32',
        life: 10000,
        maxLife: 10000,
        type: 'magic'
      };
      gameState.particles.push(particle);
    }
    
    // Poison nearby mobs
    gameState.mobs.forEach(mob => {
      const distance = Math.sqrt(Math.pow(mob.x - x, 2) + Math.pow(mob.y - y, 2));
      if (distance <= 6) {
        mob.statusEffects.push({
          type: 'poison',
          duration: 15000,
          power: 3
        });
      }
    });
  }
  
  static updateExplosions(gameState: GameState, deltaTime: number): void {
    gameState.explosions = gameState.explosions.filter(explosion => {
      explosion.duration -= deltaTime;
      return explosion.duration > 0;
    });
  }
  
  static updateParticles(gameState: GameState, deltaTime: number): void {
    gameState.particles = gameState.particles.filter(particle => {
      particle.life -= deltaTime;
      particle.x += particle.vx * (deltaTime / 1000);
      particle.y += particle.vy * (deltaTime / 1000);
      
      // Apply gravity to some particles
      if (particle.type === 'spark' || particle.type === 'blood') {
        particle.vy += 5 * (deltaTime / 1000);
      }
      
      // Fade particles
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      
      return particle.life > 0;
    });
  }
  
  private static addCombatLog(gameState: GameState, message: string, type: any): void {
    const entry = {
      id: `log_${Date.now()}_${Math.random()}`,
      message,
      timestamp: gameState.time,
      type
    };
    
    gameState.combatLog.push(entry);
    
    if (gameState.combatLog.length > 50) {
      gameState.combatLog = gameState.combatLog.slice(-50);
    }
  }
}