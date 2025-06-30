import { Mob, MobType, Player, Item, ItemType } from '../types/Game';
import { BLOCK_PROPERTIES } from '../utils/BlockProperties';

export class MobAI {
  static updateMob(mob: Mob, world: any[][], player: Player, time: number): Mob {
    const updated = { ...mob };
    
    // Basic physics
    if (!updated.onGround) {
      updated.vy += 0.5; // Gravity
    }
    
    // AI behavior based on type and hostility
    if (updated.isHostile) {
      this.updateHostileAI(updated, player, time);
    } else {
      this.updatePassiveAI(updated, time);
    }
    
    // Apply movement with collision detection
    this.applyMovement(updated, world);
    
    return updated;
  }
  
  private static updateHostileAI(mob: Mob, player: Player, time: number): void {
    const distanceToPlayer = Math.sqrt(
      Math.pow(player.x - mob.x, 2) + Math.pow(player.y - mob.y, 2)
    );
    
    // Detection and pursuit
    if (distanceToPlayer <= mob.detectionRange) {
      // Move towards player
      const dx = player.x - mob.x;
      const dy = player.y - mob.y;
      const angle = Math.atan2(dy, dx);
      
      mob.vx = Math.cos(angle) * mob.moveSpeed;
      mob.vy = Math.sin(angle) * mob.moveSpeed;
      mob.direction = angle;
      
      // Attack if in range
      if (distanceToPlayer <= mob.attackRange && time - mob.lastAttack > 1000) {
        this.attackPlayer(mob, player, time);
      }
    } else {
      // Random wandering when not pursuing
      if (Math.random() < 0.02) {
        mob.direction = Math.random() * Math.PI * 2;
        mob.vx = Math.cos(mob.direction) * mob.moveSpeed * 0.3;
        mob.vy = Math.sin(mob.direction) * mob.moveSpeed * 0.3;
      }
    }
    
    // Type-specific behaviors
    this.applyMobSpecificBehavior(mob, player, time);
  }
  
  private static updatePassiveAI(mob: Mob, time: number): void {
    // Simple random movement for passive mobs
    if (Math.random() < 0.01) {
      mob.direction = Math.random() * Math.PI * 2;
      mob.vx = Math.cos(mob.direction) * mob.moveSpeed * 0.5;
      mob.vy = Math.sin(mob.direction) * mob.moveSpeed * 0.5;
    }
  }
  
  private static applyMobSpecificBehavior(mob: Mob, player: Player, time: number): void {
    switch (mob.type) {
      case MobType.SPIDER:
        // Spiders can move faster and jump
        if (Math.random() < 0.1 && mob.onGround) {
          mob.vy = -8;
          mob.onGround = false;
        }
        break;
        
      case MobType.BAT:
        // Bats can fly (ignore gravity)
        mob.vy = Math.sin(mob.direction) * mob.moveSpeed;
        mob.onGround = false;
        break;
        
      case MobType.GHOST:
        // Ghosts can phase through walls (handled in movement)
        mob.vy = Math.sin(mob.direction) * mob.moveSpeed;
        break;
        
      case MobType.SLIME:
        // Slimes bounce
        if (mob.onGround && Math.random() < 0.3) {
          mob.vy = -6;
          mob.onGround = false;
        }
        break;
        
      case MobType.TROLL:
        // Trolls are slow but powerful
        mob.vx *= 0.7;
        mob.vy *= 0.7;
        break;
        
      case MobType.RABBIT:
        // Rabbits are fast and jumpy
        if (Math.random() < 0.2 && mob.onGround) {
          mob.vy = -5;
          mob.onGround = false;
        }
        break;
        
      case MobType.DEER:
        // Deer are graceful and can leap
        if (Math.random() < 0.1 && mob.onGround) {
          mob.vy = -6;
          mob.onGround = false;
        }
        break;
    }
  }
  
  private static attackPlayer(mob: Mob, player: Player, time: number): void {
    // This will be handled by the game engine
    mob.lastAttack = time;
  }
  
  private static applyMovement(mob: Mob, world: any[][]): void {
    const newX = mob.x + mob.vx * 0.016;
    const newY = mob.y + mob.vy * 0.016;
    
    // Ghosts can phase through walls
    if (mob.type === MobType.GHOST) {
      mob.x = newX;
      mob.y = newY;
      return;
    }
    
    // Collision detection for other mobs
    const bounds = {
      left: newX,
      right: newX + 0.8,
      top: newY,
      bottom: newY + 0.8
    };
    
    // Check horizontal collision
    let canMoveX = true;
    const leftTile = Math.floor(bounds.left);
    const rightTile = Math.floor(bounds.right);
    const topTile = Math.floor(mob.y);
    const bottomTile = Math.floor(mob.y + 0.8);
    
    for (let x = leftTile; x <= rightTile; x++) {
      for (let y = topTile; y <= bottomTile; y++) {
        if (x >= 0 && x < world.length && y >= 0 && y < world[0].length) {
          const block = world[x]?.[y];
          if (block && BLOCK_PROPERTIES[block.type].solid) {
            canMoveX = false;
            mob.vx = 0;
            break;
          }
        }
      }
      if (!canMoveX) break;
    }
    
    if (canMoveX) {
      mob.x = newX;
    }
    
    // Check vertical collision (except for flying mobs)
    if (mob.type !== MobType.BAT) {
      let canMoveY = true;
      const leftTileY = Math.floor(mob.x);
      const rightTileY = Math.floor(mob.x + 0.8);
      const topTileY = Math.floor(newY);
      const bottomTileY = Math.floor(newY + 0.8);
      
      for (let x = leftTileY; x <= rightTileY; x++) {
        for (let y = topTileY; y <= bottomTileY; y++) {
          if (x >= 0 && x < world.length && y >= 0 && y < world[0].length) {
            const block = world[x]?.[y];
            if (block && BLOCK_PROPERTIES[block.type].solid) {
              canMoveY = false;
              if (mob.vy > 0) {
                mob.onGround = true;
              }
              mob.vy = 0;
              break;
            }
          }
        }
        if (!canMoveY) break;
      }
      
      if (canMoveY) {
        mob.y = newY;
        if (mob.vy > 0) {
          mob.onGround = false;
        }
      }
    } else {
      mob.y = newY;
    }
    
    // Apply friction
    mob.vx *= 0.9;
    if (mob.type !== MobType.BAT) {
      mob.vy *= 0.9;
    }
  }
  
  static generateMob(type: MobType, x: number, y: number, dungeonLevel: number): Mob {
    const baseStats = this.getMobBaseStats(type);
    const levelMultiplier = 1 + (dungeonLevel - 1) * 0.3;
    
    return {
      id: `mob_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      x,
      y,
      vx: 0,
      vy: 0,
      health: Math.floor(baseStats.health * levelMultiplier),
      maxHealth: Math.floor(baseStats.health * levelMultiplier),
      onGround: true,
      direction: Math.random() * Math.PI * 2,
      lastMove: 0,
      isHostile: baseStats.isHostile,
      attackDamage: Math.floor(baseStats.attackDamage * levelMultiplier),
      defense: Math.floor(baseStats.defense * levelMultiplier),
      drops: this.generateDrops(type, dungeonLevel),
      lastAttack: 0,
      experienceReward: Math.floor(baseStats.experienceReward * levelMultiplier),
      goldReward: Math.floor(baseStats.goldReward * levelMultiplier),
      detectionRange: baseStats.detectionRange,
      attackRange: baseStats.attackRange,
      moveSpeed: baseStats.moveSpeed,
      statusEffects: [],
      alignment: 'neutral',
      isBoss: false,
      spells: []
    };
  }
  
  private static getMobBaseStats(type: MobType) {
    const stats = {
      [MobType.GOBLIN]: {
        health: 15, attackDamage: 3, defense: 1, experienceReward: 10, goldReward: 5,
        detectionRange: 8, attackRange: 1.5, moveSpeed: 2, isHostile: true
      },
      [MobType.ORC]: {
        health: 25, attackDamage: 5, defense: 2, experienceReward: 20, goldReward: 10,
        detectionRange: 10, attackRange: 1.5, moveSpeed: 1.5, isHostile: true
      },
      [MobType.SKELETON]: {
        health: 20, attackDamage: 4, defense: 1, experienceReward: 15, goldReward: 8,
        detectionRange: 12, attackRange: 3, moveSpeed: 1.8, isHostile: true
      },
      [MobType.ZOMBIE]: {
        health: 30, attackDamage: 4, defense: 2, experienceReward: 18, goldReward: 6,
        detectionRange: 6, attackRange: 1.2, moveSpeed: 1, isHostile: true
      },
      [MobType.SPIDER]: {
        health: 18, attackDamage: 6, defense: 0, experienceReward: 25, goldReward: 12,
        detectionRange: 15, attackRange: 1.8, moveSpeed: 3, isHostile: true
      },
      [MobType.BAT]: {
        health: 8, attackDamage: 2, defense: 0, experienceReward: 8, goldReward: 3,
        detectionRange: 20, attackRange: 1, moveSpeed: 4, isHostile: true
      },
      [MobType.SLIME]: {
        health: 12, attackDamage: 2, defense: 3, experienceReward: 12, goldReward: 4,
        detectionRange: 5, attackRange: 1, moveSpeed: 1.5, isHostile: true
      },
      [MobType.TROLL]: {
        health: 80, attackDamage: 12, defense: 5, experienceReward: 100, goldReward: 50,
        detectionRange: 8, attackRange: 2, moveSpeed: 0.8, isHostile: true
      },
      [MobType.DRAGON]: {
        health: 200, attackDamage: 25, defense: 10, experienceReward: 500, goldReward: 200,
        detectionRange: 20, attackRange: 4, moveSpeed: 2, isHostile: true
      },
      [MobType.GHOST]: {
        health: 35, attackDamage: 8, defense: 0, experienceReward: 40, goldReward: 20,
        detectionRange: 15, attackRange: 2, moveSpeed: 2.5, isHostile: true
      },
      [MobType.MINOTAUR]: {
        health: 120, attackDamage: 15, defense: 8, experienceReward: 200, goldReward: 80,
        detectionRange: 12, attackRange: 2.5, moveSpeed: 1.2, isHostile: true
      },
      [MobType.DEMON]: {
        health: 150, attackDamage: 20, defense: 12, experienceReward: 300, goldReward: 120,
        detectionRange: 18, attackRange: 3, moveSpeed: 2.2, isHostile: true
      },
      // Overworld mobs
      [MobType.DEER]: {
        health: 20, attackDamage: 2, defense: 0, experienceReward: 15, goldReward: 8,
        detectionRange: 12, attackRange: 1, moveSpeed: 2.5, isHostile: false
      },
      [MobType.RABBIT]: {
        health: 8, attackDamage: 1, defense: 0, experienceReward: 5, goldReward: 2,
        detectionRange: 8, attackRange: 0.5, moveSpeed: 3, isHostile: false
      },
      [MobType.WOLF]: {
        health: 25, attackDamage: 6, defense: 1, experienceReward: 30, goldReward: 15,
        detectionRange: 15, attackRange: 1.5, moveSpeed: 2.8, isHostile: true
      },
      [MobType.BEAR]: {
        health: 60, attackDamage: 10, defense: 4, experienceReward: 80, goldReward: 40,
        detectionRange: 10, attackRange: 2, moveSpeed: 1.5, isHostile: true
      }
    };
    
    return stats[type];
  }
  
  private static generateDrops(type: MobType, dungeonLevel: number): Item[] {
    const drops: Item[] = [];
    
    // Common drops
    if (Math.random() < 0.3) {
      drops.push({ type: ItemType.GOLD_COIN, count: 1 + Math.floor(Math.random() * dungeonLevel) });
    }
    
    // Type-specific drops
    switch (type) {
      case MobType.GOBLIN:
        if (Math.random() < 0.2) drops.push({ type: ItemType.DAGGER, count: 1 });
        if (Math.random() < 0.1) drops.push({ type: ItemType.HEALTH_POTION, count: 1 });
        break;
        
      case MobType.ORC:
        if (Math.random() < 0.3) drops.push({ type: ItemType.IRON_SWORD, count: 1 });
        if (Math.random() < 0.2) drops.push({ type: ItemType.CHAIN_ARMOR, count: 1 });
        break;
        
      case MobType.SKELETON:
        if (Math.random() < 0.4) drops.push({ type: ItemType.STONE, count: 1 + Math.floor(Math.random() * 3) });
        break;
        
      case MobType.DRAGON:
        drops.push({ type: ItemType.ARTIFACT, count: 1 });
        drops.push({ type: ItemType.GEM, count: 2 + Math.floor(Math.random() * 3) });
        if (Math.random() < 0.5) drops.push({ type: ItemType.MAGIC_SWORD, count: 1 });
        break;
        
      case MobType.TROLL:
        if (Math.random() < 0.4) drops.push({ type: ItemType.MACE, count: 1 });
        drops.push({ type: ItemType.GOLD_COIN, count: 10 + Math.floor(Math.random() * 20) });
        break;
        
      // Overworld mob drops
      case MobType.DEER:
        if (Math.random() < 0.6) drops.push({ type: ItemType.FOOD, count: 2 + Math.floor(Math.random() * 3) });
        break;
        
      case MobType.RABBIT:
        if (Math.random() < 0.4) drops.push({ type: ItemType.FOOD, count: 1 });
        break;
        
      case MobType.WOLF:
        if (Math.random() < 0.3) drops.push({ type: ItemType.FOOD, count: 1 + Math.floor(Math.random() * 2) });
        if (Math.random() < 0.1) drops.push({ type: ItemType.LEATHER_ARMOR, count: 1 });
        break;
        
      case MobType.BEAR:
        if (Math.random() < 0.5) drops.push({ type: ItemType.FOOD, count: 3 + Math.floor(Math.random() * 4) });
        if (Math.random() < 0.2) drops.push({ type: ItemType.LEATHER_ARMOR, count: 1 });
        drops.push({ type: ItemType.GOLD_COIN, count: 5 + Math.floor(Math.random() * 10) });
        break;
    }
    
    return drops;
  }
}