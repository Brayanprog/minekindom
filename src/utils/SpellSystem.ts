import { Spell, Player, Mob, GameState, StatusEffect, Explosion, Particle } from '../types/Game';

export class SpellSystem {
  static readonly SPELLS: Record<string, Spell> = {
    // Offensive Spells
    fireball: {
      id: 'fireball',
      name: 'Fireball',
      manaCost: 15,
      damage: 25,
      range: 8,
      type: 'offensive',
      effect: 'Launches a fiery projectile that explodes on impact'
    },
    lightning_bolt: {
      id: 'lightning_bolt',
      name: 'Lightning Bolt',
      manaCost: 20,
      damage: 35,
      range: 10,
      type: 'offensive',
      effect: 'Strikes target with divine lightning'
    },
    ice_shard: {
      id: 'ice_shard',
      name: 'Ice Shard',
      manaCost: 12,
      damage: 18,
      range: 6,
      type: 'offensive',
      effect: 'Freezes and damages target'
    },
    
    // Dark Magic
    drain_life: {
      id: 'drain_life',
      name: 'Drain Life',
      manaCost: 25,
      damage: 20,
      healing: 15,
      range: 5,
      type: 'dark',
      effect: 'Steals life force from target'
    },
    shadow_bolt: {
      id: 'shadow_bolt',
      name: 'Shadow Bolt',
      manaCost: 18,
      damage: 30,
      range: 7,
      type: 'dark',
      effect: 'Dark energy that bypasses armor'
    },
    curse: {
      id: 'curse',
      name: 'Curse',
      manaCost: 30,
      range: 8,
      type: 'dark',
      effect: 'Weakens target permanently'
    },
    
    // Holy Magic
    holy_light: {
      id: 'holy_light',
      name: 'Holy Light',
      manaCost: 20,
      healing: 40,
      range: 0,
      type: 'holy',
      effect: 'Heals wounds with divine power'
    },
    smite: {
      id: 'smite',
      name: 'Divine Smite',
      manaCost: 35,
      damage: 50,
      range: 6,
      type: 'holy',
      effect: 'Devastating against evil creatures'
    },
    bless: {
      id: 'bless',
      name: 'Blessing',
      manaCost: 25,
      range: 0,
      type: 'holy',
      effect: 'Grants divine protection'
    },
    
    // Defensive Spells
    shield: {
      id: 'shield',
      name: 'Magic Shield',
      manaCost: 15,
      range: 0,
      type: 'defensive',
      effect: 'Creates protective barrier'
    },
    heal: {
      id: 'heal',
      name: 'Heal',
      manaCost: 10,
      healing: 25,
      range: 0,
      type: 'defensive',
      effect: 'Restores health'
    },
    
    // Utility Spells
    teleport: {
      id: 'teleport',
      name: 'Teleport',
      manaCost: 40,
      range: 15,
      type: 'utility',
      effect: 'Instantly travel to target location'
    },
    detect_magic: {
      id: 'detect_magic',
      name: 'Detect Magic',
      manaCost: 5,
      range: 0,
      type: 'utility',
      effect: 'Reveals magical auras'
    },
    invisibility: {
      id: 'invisibility',
      name: 'Invisibility',
      manaCost: 30,
      range: 0,
      type: 'utility',
      effect: 'Become invisible to enemies'
    }
  };

  static castSpell(
    spell: Spell, 
    caster: Player | Mob, 
    gameState: GameState, 
    targetX?: number, 
    targetY?: number
  ): boolean {
    // Check mana cost
    if (caster.mana < spell.manaCost) return false;

    // Deduct mana
    caster.mana -= spell.manaCost;

    // Apply spell effects
    switch (spell.id) {
      case 'fireball':
        this.castFireball(caster, gameState, targetX!, targetY!);
        break;
      case 'lightning_bolt':
        this.castLightningBolt(caster, gameState, targetX!, targetY!);
        break;
      case 'ice_shard':
        this.castIceShard(caster, gameState, targetX!, targetY!);
        break;
      case 'drain_life':
        this.castDrainLife(caster, gameState, targetX!, targetY!);
        break;
      case 'shadow_bolt':
        this.castShadowBolt(caster, gameState, targetX!, targetY!);
        break;
      case 'holy_light':
        this.castHolyLight(caster, gameState);
        break;
      case 'smite':
        this.castSmite(caster, gameState, targetX!, targetY!);
        break;
      case 'shield':
        this.castShield(caster, gameState);
        break;
      case 'heal':
        this.castHeal(caster, gameState);
        break;
      case 'teleport':
        this.castTeleport(caster, gameState, targetX!, targetY!);
        break;
      case 'invisibility':
        this.castInvisibility(caster, gameState);
        break;
      case 'bless':
        this.castBless(caster, gameState);
        break;
      case 'curse':
        this.castCurse(caster, gameState, targetX!, targetY!);
        break;
    }

    return true;
  }

  private static castFireball(caster: Player | Mob, gameState: GameState, targetX: number, targetY: number) {
    // Create explosion
    const explosion: Explosion = {
      id: `explosion_${Date.now()}`,
      x: targetX,
      y: targetY,
      radius: 3,
      damage: 25,
      type: 'fire',
      duration: 1000
    };
    
    gameState.explosions.push(explosion);
    
    // Add fire particles
    for (let i = 0; i < 20; i++) {
      const particle: Particle = {
        id: `particle_${Date.now()}_${i}`,
        x: targetX,
        y: targetY,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        color: '#ff4500',
        life: 500,
        maxLife: 500,
        type: 'spark'
      };
      gameState.particles.push(particle);
    }
    
    this.addCombatLog(gameState, `Fireball explodes at (${targetX}, ${targetY})!`, 'spell');
  }

  private static castLightningBolt(caster: Player | Mob, gameState: GameState, targetX: number, targetY: number) {
    // Find target mob
    const target = gameState.mobs.find(mob => 
      Math.floor(mob.x) === targetX && Math.floor(mob.y) === targetY
    );
    
    if (target) {
      const damage = 35;
      target.health -= damage;
      this.addCombatLog(gameState, `Lightning strikes ${target.type} for ${damage} damage!`, 'spell');
      
      // Lightning particles
      for (let i = 0; i < 15; i++) {
        const particle: Particle = {
          id: `particle_${Date.now()}_${i}`,
          x: targetX,
          y: targetY,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          color: '#87ceeb',
          life: 300,
          maxLife: 300,
          type: 'spark'
        };
        gameState.particles.push(particle);
      }
    }
  }

  private static castIceShard(caster: Player | Mob, gameState: GameState, targetX: number, targetY: number) {
    const target = gameState.mobs.find(mob => 
      Math.floor(mob.x) === targetX && Math.floor(mob.y) === targetY
    );
    
    if (target) {
      const damage = 18;
      target.health -= damage;
      
      // Add frozen status effect
      const frozenEffect: StatusEffect = {
        type: 'frozen',
        duration: 3000,
        power: 1
      };
      target.statusEffects.push(frozenEffect);
      
      this.addCombatLog(gameState, `Ice shard hits ${target.type} for ${damage} damage and freezes them!`, 'spell');
    }
  }

  private static castDrainLife(caster: Player | Mob, gameState: GameState, targetX: number, targetY: number) {
    const target = gameState.mobs.find(mob => 
      Math.floor(mob.x) === targetX && Math.floor(mob.y) === targetY
    );
    
    if (target) {
      const damage = 20;
      const healing = 15;
      target.health -= damage;
      caster.health = Math.min(caster.maxHealth, caster.health + healing);
      
      this.addCombatLog(gameState, `Drained ${damage} life from ${target.type}, healed for ${healing}`, 'spell');
      
      // Dark particles
      for (let i = 0; i < 10; i++) {
        const particle: Particle = {
          id: `particle_${Date.now()}_${i}`,
          x: targetX,
          y: targetY,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          color: '#800080',
          life: 800,
          maxLife: 800,
          type: 'dark'
        };
        gameState.particles.push(particle);
      }
    }
  }

  private static castShadowBolt(caster: Player | Mob, gameState: GameState, targetX: number, targetY: number) {
    const target = gameState.mobs.find(mob => 
      Math.floor(mob.x) === targetX && Math.floor(mob.y) === targetY
    );
    
    if (target) {
      const damage = 30; // Bypasses armor
      target.health -= damage;
      this.addCombatLog(gameState, `Shadow bolt pierces ${target.type} for ${damage} damage!`, 'spell');
    }
  }

  private static castHolyLight(caster: Player | Mob, gameState: GameState) {
    const healing = 40;
    caster.health = Math.min(caster.maxHealth, caster.health + healing);
    
    // Remove negative status effects
    if ('statusEffects' in caster) {
      caster.statusEffects = caster.statusEffects.filter(effect => 
        !['poison', 'cursed', 'burning'].includes(effect.type)
      );
    }
    
    this.addCombatLog(gameState, `Holy light heals for ${healing} and removes curses`, 'heal');
  }

  private static castSmite(caster: Player | Mob, gameState: GameState, targetX: number, targetY: number) {
    const target = gameState.mobs.find(mob => 
      Math.floor(mob.x) === targetX && Math.floor(mob.y) === targetY
    );
    
    if (target) {
      let damage = 50;
      
      // Extra damage against evil creatures
      if (target.alignment === 'evil') {
        damage *= 2;
      }
      
      target.health -= damage;
      this.addCombatLog(gameState, `Divine smite hits ${target.type} for ${damage} holy damage!`, 'spell');
      
      // Holy particles
      for (let i = 0; i < 25; i++) {
        const particle: Particle = {
          id: `particle_${Date.now()}_${i}`,
          x: targetX,
          y: targetY,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12,
          color: '#ffd700',
          life: 1000,
          maxLife: 1000,
          type: 'holy'
        };
        gameState.particles.push(particle);
      }
    }
  }

  private static castShield(caster: Player | Mob, gameState: GameState) {
    const shieldEffect: StatusEffect = {
      type: 'blessed',
      duration: 30000,
      power: 10 // +10 defense
    };
    
    if ('statusEffects' in caster) {
      caster.statusEffects.push(shieldEffect);
    }
    
    this.addCombatLog(gameState, 'Magic shield activated (+10 defense)', 'spell');
  }

  private static castHeal(caster: Player | Mob, gameState: GameState) {
    const healing = 25;
    caster.health = Math.min(caster.maxHealth, caster.health + healing);
    this.addCombatLog(gameState, `Healed for ${healing} health`, 'heal');
  }

  private static castTeleport(caster: Player | Mob, gameState: GameState, targetX: number, targetY: number) {
    // Check if target location is valid
    if (targetX >= 0 && targetX < gameState.world.length && 
        targetY >= 0 && targetY < gameState.world[0].length) {
      const targetBlock = gameState.world[targetX][targetY];
      
      if (!targetBlock || targetBlock.type === 'floor' || targetBlock.type === 'air') {
        caster.x = targetX;
        caster.y = targetY;
        this.addCombatLog(gameState, `Teleported to (${targetX}, ${targetY})`, 'spell');
        
        // Teleport particles
        for (let i = 0; i < 30; i++) {
          const particle: Particle = {
            id: `particle_${Date.now()}_${i}`,
            x: targetX,
            y: targetY,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            color: '#9370db',
            life: 1500,
            maxLife: 1500,
            type: 'magic'
          };
          gameState.particles.push(particle);
        }
      }
    }
  }

  private static castInvisibility(caster: Player | Mob, gameState: GameState) {
    const invisEffect: StatusEffect = {
      type: 'invisibility',
      duration: 15000,
      power: 1
    };
    
    if ('statusEffects' in caster) {
      caster.statusEffects.push(invisEffect);
    }
    
    this.addCombatLog(gameState, 'Became invisible', 'spell');
  }

  private static castBless(caster: Player | Mob, gameState: GameState) {
    const blessEffect: StatusEffect = {
      type: 'blessed',
      duration: 60000,
      power: 5 // +5 to all stats
    };
    
    if ('statusEffects' in caster) {
      caster.statusEffects.push(blessEffect);
    }
    
    this.addCombatLog(gameState, 'Received divine blessing (+5 all stats)', 'divine');
  }

  private static castCurse(caster: Player | Mob, gameState: GameState, targetX: number, targetY: number) {
    const target = gameState.mobs.find(mob => 
      Math.floor(mob.x) === targetX && Math.floor(mob.y) === targetY
    );
    
    if (target) {
      const curseEffect: StatusEffect = {
        type: 'cursed',
        duration: 30000,
        power: 5 // -5 to all stats
      };
      target.statusEffects.push(curseEffect);
      
      this.addCombatLog(gameState, `Cursed ${target.type} (-5 all stats)`, 'spell');
    }
  }

  private static addCombatLog(gameState: GameState, message: string, type: any) {
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

  static getStartingSpells(playerLevel: number, alignment: string): Spell[] {
    const spells: Spell[] = [];
    
    // Basic spells for everyone
    spells.push(this.SPELLS.heal);
    spells.push(this.SPELLS.shield);
    
    if (playerLevel >= 2) {
      if (alignment === 'good') {
        spells.push(this.SPELLS.holy_light);
        spells.push(this.SPELLS.bless);
      } else if (alignment === 'evil') {
        spells.push(this.SPELLS.drain_life);
        spells.push(this.SPELLS.curse);
      } else {
        spells.push(this.SPELLS.fireball);
        spells.push(this.SPELLS.teleport);
      }
    }
    
    if (playerLevel >= 5) {
      spells.push(this.SPELLS.lightning_bolt);
      spells.push(this.SPELLS.invisibility);
    }
    
    if (playerLevel >= 8) {
      if (alignment === 'good') {
        spells.push(this.SPELLS.smite);
      } else if (alignment === 'evil') {
        spells.push(this.SPELLS.shadow_bolt);
      }
    }
    
    return spells;
  }
}