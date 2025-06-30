import { God, Player, GameState, Item, ItemType, TempleService } from '../types/Game';

export class GodSystem {
  static readonly GODS: God[] = [
    {
      id: 'solaris',
      name: 'Solaris the Light Bringer',
      alignment: 'good',
      domain: 'Light, Healing, Justice',
      favor: 0,
      blessings: [
        '+20% healing effectiveness',
        'Immunity to dark magic',
        'Radiant weapon enchantment',
        'Divine protection'
      ],
      curses: [
        'Weakness to holy magic',
        'Reduced mana regeneration'
      ],
      offeringTypes: [ItemType.HOLY_WATER, ItemType.CANDLE, ItemType.FLOWERS, ItemType.INCENSE],
      description: 'The god of light and justice, protector of the innocent and healer of the wounded.'
    },
    {
      id: 'mortis',
      name: 'Mortis the Soul Reaper',
      alignment: 'evil',
      domain: 'Death, Darkness, Necromancy',
      favor: 0,
      blessings: [
        '+30% damage to living creatures',
        'Life drain on attacks',
        'Undead minions',
        'Death magic mastery'
      ],
      curses: [
        'Constant health drain',
        'Weakness to holy magic',
        'Cursed equipment'
      ],
      offeringTypes: [ItemType.BLOOD_VIAL, ItemType.DEMON_BONE, ItemType.CURSED_ARTIFACT, ItemType.SOUL_GEM],
      description: 'The dark god of death and necromancy, master of the undead and harvester of souls.'
    },
    {
      id: 'tempest',
      name: 'Tempest the Storm Lord',
      alignment: 'neutral',
      domain: 'Lightning, Storms, War',
      favor: 0,
      blessings: [
        'Lightning weapon enchantment',
        '+25% movement speed',
        'Storm magic mastery',
        'Electrical immunity'
      ],
      curses: [
        'Random lightning strikes',
        'Equipment malfunction'
      ],
      offeringTypes: [ItemType.CRYSTAL_SHARD, ItemType.MAGIC_ORB, ItemType.STEEL_SWORD, ItemType.GEM],
      description: 'The tempestuous god of storms and war, bringer of lightning and master of the battlefield.'
    },
    {
      id: 'terra',
      name: 'Terra the Earth Mother',
      alignment: 'good',
      domain: 'Nature, Growth, Protection',
      favor: 0,
      blessings: [
        '+50% health regeneration',
        'Plant allies',
        'Earth magic mastery',
        'Natural armor'
      ],
      curses: [
        'Weakness to fire',
        'Slow movement'
      ],
      offeringTypes: [ItemType.FLOWERS, ItemType.BREAD, ItemType.WOOD, ItemType.STONE],
      description: 'The nurturing earth goddess, protector of nature and provider of life and growth.'
    },
    {
      id: 'chaos',
      name: 'Chaos the Mad God',
      alignment: 'evil',
      domain: 'Madness, Destruction, Chaos',
      favor: 0,
      blessings: [
        'Random powerful effects',
        'Chaos magic mastery',
        'Unpredictable abilities',
        'Reality distortion'
      ],
      curses: [
        'Random negative effects',
        'Uncontrollable magic',
        'Mental instability'
      ],
      offeringTypes: [ItemType.MAGIC_SWORD, ItemType.RUNE_STONE, ItemType.ARTIFACT, ItemType.SPELL_SCROLL],
      description: 'The unpredictable god of chaos and madness, bringer of random fortune and misfortune.'
    },
    {
      id: 'forge',
      name: 'Forge the Smith',
      alignment: 'neutral',
      domain: 'Crafting, Fire, Metal',
      favor: 0,
      blessings: [
        '+100% crafting success',
        'Fire immunity',
        'Enhanced weapons',
        'Metal mastery'
      ],
      curses: [
        'Equipment degradation',
        'Weakness to water'
      ],
      offeringTypes: [ItemType.IRON_ORE, ItemType.GOLD_COIN, ItemType.IRON_SWORD, ItemType.PICKAXE],
      description: 'The divine smith, master of forge and flame, creator of legendary weapons and armor.'
    }
  ];

  static worship(godId: string, player: Player, gameState: GameState, templeId?: string): void {
    const god = this.GODS.find(g => g.id === godId);
    if (!god) return;

    // Worshipping at a temple gives more favor
    const favorGain = templeId ? 3 + Math.floor(Math.random() * 5) : 1 + Math.floor(Math.random() * 3);
    player.godFavor[godId] = (player.godFavor[godId] || 0) + favorGain;

    // Alignment affects favor gain
    if (god.alignment === player.alignment) {
      player.godFavor[godId] += 2; // Bonus for matching alignment
    } else if ((god.alignment === 'good' && player.alignment === 'evil') ||
               (god.alignment === 'evil' && player.alignment === 'good')) {
      player.godFavor[godId] -= 1; // Penalty for opposing alignment
    }

    this.addCombatLog(gameState, `You worship ${god.name} at their temple (+${favorGain} favor)`, 'divine');

    // Random divine intervention at temples
    if (templeId && Math.random() < 0.15) {
      this.divineIntervention(god, player, gameState);
    }

    // Apply blessings/curses based on favor
    this.updateDivineFavor(god, player, gameState);
  }

  static makeOffering(godId: string, itemSlot: number, player: Player, gameState: GameState): void {
    const god = this.GODS.find(g => g.id === godId);
    const item = gameState.inventory[itemSlot];
    
    if (!god || !item || item.count <= 0) return;

    // Check if item is acceptable offering
    let favorGain = Math.floor((item.value || 10) / 5);
    
    if (god.offeringTypes.includes(item.type)) {
      favorGain *= 3; // Triple favor for preferred offerings
      this.addCombatLog(gameState, `${god.name} is pleased with your offering!`, 'divine');
    } else {
      favorGain = Math.max(1, Math.floor(favorGain / 2)); // Half favor for non-preferred
      this.addCombatLog(gameState, `${god.name} accepts your offering, though it's not their preference.`, 'divine');
    }

    // Special items give more favor
    if (item.type === ItemType.DIVINE_RELIC) favorGain *= 10;
    if (item.type === ItemType.CURSED_ARTIFACT && god.alignment === 'evil') favorGain *= 5;
    if (item.type === ItemType.ARTIFACT) favorGain *= 3;
    if (item.blessed && god.alignment === 'good') favorGain *= 2;
    if (item.cursed && god.alignment === 'evil') favorGain *= 2;

    // Alignment affects offering value
    if (god.alignment === player.alignment) {
      favorGain = Math.floor(favorGain * 1.5);
    }

    // Remove item and gain favor
    item.count--;
    if (item.count <= 0) {
      gameState.inventory[itemSlot] = { type: ItemType.GOLD_COIN, count: 0 };
    }

    player.godFavor[godId] = (player.godFavor[godId] || 0) + favorGain;

    this.addCombatLog(gameState, `Offered ${item.type} to ${god.name} (+${favorGain} favor)`, 'divine');

    // Major divine intervention for valuable offerings
    if (favorGain >= 15) {
      this.majorDivineIntervention(god, player, gameState);
    }

    this.updateDivineFavor(god, player, gameState);
  }

  static useTempleService(service: TempleService, godId: string, player: Player, gameState: GameState): boolean {
    const god = this.GODS.find(g => g.id === godId);
    if (!god) return false;

    const favor = player.godFavor[godId] || 0;
    let cost = 0;
    let success = true;

    switch (service) {
      case TempleService.HEALING:
        cost = 50;
        if (player.gold >= cost && favor >= 0) {
          player.gold -= cost;
          player.health = player.maxHealth;
          this.addCombatLog(gameState, `${god.name} heals your wounds completely!`, 'heal');
        } else {
          success = false;
        }
        break;

      case TempleService.BLESSING:
        cost = 100;
        if (player.gold >= cost && favor >= 20) {
          player.gold -= cost;
          player.statusEffects.push({
            type: 'blessed',
            duration: 300000, // 5 minutes
            power: 10
          });
          this.addCombatLog(gameState, `${god.name} grants you a powerful blessing!`, 'divine');
        } else {
          success = false;
        }
        break;

      case TempleService.CURSE_REMOVAL:
        cost = 75;
        if (player.gold >= cost && favor >= 10) {
          player.gold -= cost;
          player.statusEffects = player.statusEffects.filter(effect => 
            !['poison', 'cursed', 'burning', 'frozen'].includes(effect.type)
          );
          this.addCombatLog(gameState, `${god.name} removes all curses from you!`, 'divine');
        } else {
          success = false;
        }
        break;

      case TempleService.TRAINING:
        cost = 200;
        if (player.gold >= cost && favor >= 50) {
          player.gold -= cost;
          player.experience += player.level * 50;
          this.addCombatLog(gameState, `${god.name} grants you divine knowledge!`, 'divine');
        } else {
          success = false;
        }
        break;

      case TempleService.DONATION:
        cost = Math.min(player.gold, 25 + Math.floor(Math.random() * 100));
        if (player.gold >= cost) {
          player.gold -= cost;
          const favorGain = Math.floor(cost / 10);
          player.godFavor[godId] = (player.godFavor[godId] || 0) + favorGain;
          this.addCombatLog(gameState, `You donate ${cost} gold to ${god.name} (+${favorGain} favor)`, 'divine');
        } else {
          success = false;
        }
        break;

      case TempleService.CONFESSION:
        if (favor >= -10) {
          // Remove some negative karma
          player.karma = Math.min(100, player.karma + 10);
          // Slightly reduce negative favor with opposing gods
          Object.keys(player.godFavor).forEach(otherGodId => {
            const otherGod = this.GODS.find(g => g.id === otherGodId);
            if (otherGod && otherGod.alignment !== god.alignment && player.godFavor[otherGodId] < 0) {
              player.godFavor[otherGodId] = Math.min(0, player.godFavor[otherGodId] + 5);
            }
          });
          this.addCombatLog(gameState, `You confess your sins to ${god.name} and feel cleansed.`, 'divine');
        } else {
          success = false;
        }
        break;
    }

    if (!success) {
      this.addCombatLog(gameState, `You cannot use this service (insufficient gold or favor).`, 'divine');
    }

    return success;
  }

  private static divineIntervention(god: God, player: Player, gameState: GameState): void {
    const favor = player.godFavor[god.id] || 0;
    
    if (favor > 0) {
      // Positive intervention
      const interventions = [
        () => {
          player.health = player.maxHealth;
          player.mana = player.maxMana;
          this.addCombatLog(gameState, `${god.name} fully restores your health and mana!`, 'divine');
        },
        () => {
          const goldGain = 100 + Math.floor(Math.random() * 200);
          player.gold += goldGain;
          this.addCombatLog(gameState, `${god.name} blesses you with ${goldGain} gold!`, 'divine');
        },
        () => {
          // Remove all negative status effects
          player.statusEffects = player.statusEffects.filter(effect => 
            !['poison', 'cursed', 'burning', 'frozen'].includes(effect.type)
          );
          this.addCombatLog(gameState, `${god.name} purifies you of all ailments!`, 'divine');
        },
        () => {
          const expGain = player.level * 25;
          player.experience += expGain;
          this.addCombatLog(gameState, `${god.name} grants you divine wisdom (+${expGain} XP)!`, 'divine');
        }
      ];
      
      const intervention = interventions[Math.floor(Math.random() * interventions.length)];
      intervention();
    } else if (favor < -30) {
      // Negative intervention
      const punishments = [
        () => {
          const damage = Math.floor(player.maxHealth * 0.3);
          player.health = Math.max(1, player.health - damage);
          this.addCombatLog(gameState, `${god.name} punishes you for ${damage} damage!`, 'divine');
        },
        () => {
          player.mana = Math.floor(player.mana / 3);
          this.addCombatLog(gameState, `${god.name} drains most of your mana!`, 'divine');
        },
        () => {
          const goldLoss = Math.min(player.gold, 50 + Math.floor(Math.random() * 100));
          player.gold -= goldLoss;
          this.addCombatLog(gameState, `${god.name} takes ${goldLoss} gold as punishment!`, 'divine');
        }
      ];
      
      const punishment = punishments[Math.floor(Math.random() * punishments.length)];
      punishment();
    }
  }

  private static majorDivineIntervention(god: God, player: Player, gameState: GameState): void {
    switch (god.id) {
      case 'solaris':
        this.grantDivineItem(player, gameState, ItemType.HOLY_SWORD);
        this.addCombatLog(gameState, `${god.name} grants you a holy weapon!`, 'divine');
        break;
      case 'mortis':
        this.grantDivineItem(player, gameState, ItemType.CURSED_BLADE);
        this.addCombatLog(gameState, `${god.name} grants you a cursed weapon!`, 'divine');
        break;
      case 'tempest':
        this.grantDivineItem(player, gameState, ItemType.STAFF_OF_POWER);
        this.addCombatLog(gameState, `${god.name} grants you a staff of power!`, 'divine');
        break;
      case 'terra':
        this.grantDivineItem(player, gameState, ItemType.DRAGON_SCALE);
        this.addCombatLog(gameState, `${god.name} grants you natural armor!`, 'divine');
        break;
      case 'chaos':
        const chaosItems = [ItemType.MAGIC_SWORD, ItemType.DEMON_ARMOR, ItemType.SOUL_GEM, ItemType.ARTIFACT];
        const randomItem = chaosItems[Math.floor(Math.random() * chaosItems.length)];
        this.grantDivineItem(player, gameState, randomItem);
        this.addCombatLog(gameState, `${god.name} grants you a chaotic gift!`, 'divine');
        break;
      case 'forge':
        this.grantDivineItem(player, gameState, ItemType.DRAGON_SCALE_MAT);
        this.addCombatLog(gameState, `${god.name} grants you rare crafting materials!`, 'divine');
        break;
    }
  }

  private static grantDivineItem(player: Player, gameState: GameState, itemType: ItemType): void {
    // Find empty slot
    for (let i = 0; i < gameState.inventory.length; i++) {
      if (gameState.inventory[i].count === 0) {
        gameState.inventory[i] = {
          type: itemType,
          count: 1,
          blessed: true,
          durability: 100,
          maxDurability: 100
        };
        return;
      }
    }
  }

  private static updateDivineFavor(god: God, player: Player, gameState: GameState): void {
    const favor = player.godFavor[god.id] || 0;
    
    // Apply blessings for high favor
    if (favor >= 100 && !player.statusEffects.some(e => e.type === 'blessed')) {
      player.statusEffects.push({
        type: 'blessed',
        duration: 600000, // 10 minutes
        power: 15
      });
      this.addCombatLog(gameState, `${god.name} grants you a powerful divine blessing!`, 'divine');
    }
    
    // Apply curses for low favor
    if (favor <= -75 && !player.statusEffects.some(e => e.type === 'cursed')) {
      player.statusEffects.push({
        type: 'cursed',
        duration: 300000, // 5 minutes
        power: 10
      });
      this.addCombatLog(gameState, `${god.name} curses you for your transgressions!`, 'divine');
    }
  }

  static updateAlignment(player: Player, action: 'good' | 'evil' | 'neutral'): void {
    // Track alignment changes based on actions
    switch (action) {
      case 'good':
        if (player.alignment === 'evil') player.alignment = 'neutral';
        else if (player.alignment === 'neutral') player.alignment = 'good';
        player.karma = Math.min(100, player.karma + 5);
        break;
      case 'evil':
        if (player.alignment === 'good') player.alignment = 'neutral';
        else if (player.alignment === 'neutral') player.alignment = 'evil';
        player.karma = Math.max(-100, player.karma - 5);
        break;
    }
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