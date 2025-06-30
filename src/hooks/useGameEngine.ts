import { useState, useEffect, useCallback } from 'react';
import { GameState, Player, BlockType, Item, Position, ItemType, Mob, MobType, CombatLogEntry, Spell, AreaType } from '../types/Game';
import { DungeonGenerator } from '../utils/DungeonGenerator';
import { OverworldGenerator } from '../utils/OverworldGenerator';
import { MobAI } from '../utils/MobAI';
import { SpellSystem } from '../utils/SpellSystem';
import { GodSystem } from '../utils/GodSystem';
import { ExplosionSystem } from '../utils/ExplosionSystem';
import { BLOCK_PROPERTIES } from '../utils/BlockProperties';
import { ITEM_PROPERTIES } from '../utils/ItemProperties';

const WORLD_WIDTH = 120;
const WORLD_HEIGHT = 120;
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const MOVE_SPEED = 8;
const MAX_FALL_SPEED = 20;
const FRICTION = 0.85;
const AIR_RESISTANCE = 0.98;
const BLOCK_SIZE = 32;

// Move helper functions before they are used
const getMobTypesForLevel = (level: number): MobType[] => {
  if (level <= 3) return [MobType.GOBLIN, MobType.BAT, MobType.SLIME];
  if (level <= 6) return [MobType.GOBLIN, MobType.ORC, MobType.SKELETON, MobType.SPIDER];
  if (level <= 9) return [MobType.ORC, MobType.SKELETON, MobType.ZOMBIE, MobType.SPIDER, MobType.WRAITH];
  if (level <= 12) return [MobType.TROLL, MobType.OGRE, MobType.GARGOYLE, MobType.MINOTAUR];
  if (level <= 15) return [MobType.DRAGON, MobType.LICH, MobType.DEMON, MobType.WYVERN];
  if (level <= 20) return [MobType.ANCIENT_DRAGON, MobType.DEMON_LORD, MobType.DEATH_KNIGHT];
  return [MobType.EVIL_GOD, MobType.LESSER_GOD, MobType.SHADOW_LORD];
};

// Generate mobs for dungeon rooms
const generateDungeonMobs = (dungeon: any, world: any[][]): Mob[] => {
  const mobs: Mob[] = [];
  
  dungeon.rooms.forEach((room: any) => {
    if (room.type === 'entrance') return; // No mobs in entrance
    
    const mobTypes = getMobTypesForLevel(dungeon.level);
    
    for (let i = 0; i < room.mobCount; i++) {
      const mobType = mobTypes[Math.floor(Math.random() * mobTypes.length)];
      const x = room.x + 1 + Math.floor(Math.random() * (room.width - 2));
      const y = room.y + 1 + Math.floor(Math.random() * (room.height - 2));
      
      // Make sure spawn position is valid
      if (world[x] && world[x][y] && world[x][y].type === BlockType.FLOOR) {
        mobs.push(MobAI.generateMob(mobType, x, y, dungeon.level));
      }
    }
    
    // Add boss mobs in boss rooms
    if (room.type === 'boss' && dungeon.level >= 5) {
      const bossTypes = [MobType.DRAGON, MobType.LICH, MobType.DEMON_LORD, MobType.ANCIENT_DRAGON];
      const bossType = bossTypes[Math.floor(Math.random() * bossTypes.length)];
      const bossX = room.x + Math.floor(room.width / 2);
      const bossY = room.y + Math.floor(room.height / 2);
      
      const boss = MobAI.generateMob(bossType, bossX, bossY, dungeon.level);
      boss.isBoss = true;
      boss.health *= 3;
      boss.maxHealth *= 3;
      boss.attackDamage *= 2;
      boss.experienceReward *= 5;
      boss.goldReward *= 10;
      mobs.push(boss);
    }
  });
  
  return mobs;
};

// Generate overworld wildlife
const generateOverworldMobs = (world: any[][], areas: any[]): Mob[] => {
  const mobs: Mob[] = [];
  
  // Add peaceful wildlife
  for (let i = 0; i < 50; i++) {
    const x = Math.floor(Math.random() * WORLD_WIDTH);
    const y = Math.floor(Math.random() * WORLD_HEIGHT);
    
    if (world[x] && world[x][y] && world[x][y].type === BlockType.GRASS) {
      const wildlifeTypes = [MobType.DEER, MobType.RABBIT];
      const mobType = wildlifeTypes[Math.floor(Math.random() * wildlifeTypes.length)];
      const mob = MobAI.generateMob(mobType, x, y, 1);
      mob.isHostile = false;
      mobs.push(mob);
    }
  }
  
  // Add some hostile creatures in wilderness
  areas.forEach(area => {
    if (area.type === AreaType.WILDERNESS) {
      for (let i = 0; i < 10; i++) {
        const x = area.x + Math.floor(Math.random() * area.width);
        const y = area.y + Math.floor(Math.random() * area.height);
        
        if (world[x] && world[x][y] && world[x][y].type === BlockType.GRASS) {
          const hostileTypes = [MobType.WOLF, MobType.BEAR, MobType.GOBLIN];
          const mobType = hostileTypes[Math.floor(Math.random() * hostileTypes.length)];
          mobs.push(MobAI.generateMob(mobType, x, y, area.level));
        }
      }
    }
  });
  
  return mobs;
};

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    // Generate overworld instead of dungeon
    const overworldGenerator = new OverworldGenerator(WORLD_WIDTH, WORLD_HEIGHT);
    const { world, areas, temples } = overworldGenerator.generate();
    
    // Find starting town
    const startingTown = areas.find(area => area.id === 'starting_town');
    let spawnX = Math.floor(WORLD_WIDTH / 2);
    let spawnY = Math.floor(WORLD_HEIGHT / 2);
    
    if (startingTown) {
      spawnX = startingTown.x + Math.floor(startingTown.width / 2);
      spawnY = startingTown.y + Math.floor(startingTown.height / 2);
    }

    const player: Player = {
      x: spawnX,
      y: spawnY,
      vx: 0,
      vy: 0,
      onGround: false,
      selectedSlot: 0,
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      experience: 0,
      level: 1,
      attack: 5,
      defense: 1,
      magicPower: 1,
      gold: 100,
      dungeonLevel: 0,
      lastAttack: 0,
      statusEffects: [],
      alignment: 'neutral',
      godFavor: {},
      spellsKnown: SpellSystem.getStartingSpells(1, 'neutral'),
      worldX: 0,
      worldY: 0,
      currentArea: AreaType.OVERWORLD,
      karma: 0,
      reputation: 0
    };

    const inventory: Item[] = Array.from({ length: 36 }, () => ({ type: ItemType.GOLD_COIN, count: 0 }));
    
    // Enhanced starting equipment for new adventurer
    inventory[0] = { type: ItemType.RUSTY_SWORD, count: 1, durability: 30, maxDurability: 30 };
    inventory[1] = { type: ItemType.HEALTH_POTION, count: 3 };
    inventory[2] = { type: ItemType.BREAD, count: 5 };
    inventory[3] = { type: ItemType.TORCH, count: 5 };
    inventory[4] = { type: ItemType.ROPE, count: 2 };
    inventory[5] = { type: ItemType.FLOWERS, count: 3 }; // For temple offerings
    inventory[6] = { type: ItemType.CANDLE, count: 2 }; // For temple offerings

    // Generate overworld mobs
    const mobs = generateOverworldMobs(world, areas);

    return {
      world,
      player,
      inventory,
      camera: { x: spawnX * BLOCK_SIZE - 400, y: spawnY * BLOCK_SIZE - 300 },
      gameMode: 'adventure' as const,
      time: 0,
      mobs,
      currentDungeon: undefined,
      gameObjectives: [
        {
          id: 'explore_world',
          title: 'New to the World',
          description: 'Explore the overworld and discover new areas',
          completed: false,
          progress: 0,
          maxProgress: 5,
          type: 'explore'
        },
        {
          id: 'visit_temple',
          title: 'Seek Divine Guidance',
          description: 'Visit a temple and worship a god',
          completed: false,
          progress: 0,
          maxProgress: 1,
          type: 'divine'
        },
        {
          id: 'enter_dungeon',
          title: 'Brave the Depths',
          description: 'Enter your first dungeon',
          completed: false,
          progress: 0,
          maxProgress: 1,
          type: 'explore'
        }
      ],
      achievements: [],
      combatLog: [
        {
          id: 'welcome',
          message: 'Welcome to the world, young adventurer! Explore and discover your destiny.',
          timestamp: 0,
          type: 'interaction'
        }
      ],
      isInCombat: false,
      lootOpen: false,
      worldAreas: areas,
      gods: GodSystem.GODS,
      temples,
      activeSpells: [],
      explosions: [],
      particles: [],
      miniMapVisible: true,
      currentArea: 'Overworld - Starting Area',
      nearbyInteractable: undefined
    };
  });

  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [spellSystemVisible, setSpellSystemVisible] = useState(false);
  const [godSystemVisible, setGodSystemVisible] = useState(false);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.key.toLowerCase()));
      
      // Number keys for hotbar selection
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        handleSlotSelect(num - 1);
      }
      
      // Use item
      if (e.key.toLowerCase() === 'f') {
        useSelectedItem();
      }
      
      // Attack
      if (e.key.toLowerCase() === 'x') {
        attackNearbyMob();
      }
      
      // Interact with nearby objects
      if (e.key.toLowerCase() === 'e') {
        interactWithNearby();
      }
      
      // Jump with spacebar only
      if (e.key === ' ') {
        e.preventDefault(); // Prevent page scroll
        jumpPlayer();
      }
      
      // Toggle spell system
      if (e.key.toLowerCase() === 'z') {
        setSpellSystemVisible(!spellSystemVisible);
      }
      
      // Toggle god system
      if (e.key.toLowerCase() === 'g') {
        setGodSystemVisible(!godSystemVisible);
      }
      
      // Toggle minimap
      if (e.key.toLowerCase() === 'm') {
        toggleMiniMap();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key.toLowerCase());
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [spellSystemVisible, godSystemVisible]);

  // Game physics and update loop
  useEffect(() => {
    const gameLoop = () => {
      setGameState(prevState => {
        const newState = { ...prevState };
        const player = { ...newState.player };

        // Update time
        newState.time += 16; // 60 FPS

        // Handle movement input - WASD for 4-directional movement
        let targetVx = 0;
        let targetVy = 0;
        
        // Horizontal movement
        if (keys.has('a') || keys.has('arrowleft')) {
          targetVx = -MOVE_SPEED;
        }
        if (keys.has('d') || keys.has('arrowright')) {
          targetVx = MOVE_SPEED;
        }
        
        // Vertical movement (up/down)
        if (keys.has('w') || keys.has('arrowup')) {
          targetVy = -MOVE_SPEED; // Move up
        }
        if (keys.has('s') || keys.has('arrowdown')) {
          targetVy = MOVE_SPEED; // Move down
        }

        // Apply movement with smooth acceleration
        if (targetVx !== 0) {
          player.vx = targetVx; // Instant response for better feel
        } else {
          player.vx *= FRICTION; // Apply friction when no input
        }
        
        if (targetVy !== 0) {
          player.vy = targetVy; // Direct vertical movement
        } else {
          player.vy *= FRICTION; // Apply friction when no input
        }

        // Apply air resistance for more realistic movement
        player.vx *= AIR_RESISTANCE;
        player.vy *= AIR_RESISTANCE;

        // Update position with improved collision detection
        updatePlayerPosition(player, newState.world);

        // Check for nearby interactables
        checkNearbyInteractables(newState, player);

        // Update current area
        updateCurrentArea(newState, player);

        // Update status effects
        updateStatusEffects(player, newState);

        // Update mobs
        newState.mobs = newState.mobs.map(mob => 
          MobAI.updateMob(mob, newState.world, player, newState.time)
        );

        // Update mob status effects
        newState.mobs.forEach(mob => updateStatusEffects(mob, newState));

        // Check for mob attacks on player
        checkMobAttacks(newState, player);

        // Check for environmental hazards
        checkEnvironmentalHazards(newState, player);

        // Update explosions and particles
        ExplosionSystem.updateExplosions(newState, 16);
        ExplosionSystem.updateParticles(newState, 16);

        // Update active spells
        updateActiveSpells(newState, 16);

        // Regenerate mana
        if (player.mana < player.maxMana) {
          player.mana = Math.min(player.maxMana, player.mana + 0.1);
        }

        // Smooth camera following
        const targetCameraX = player.x * BLOCK_SIZE - window.innerWidth / 2;
        const targetCameraY = player.y * BLOCK_SIZE - window.innerHeight / 2;
        
        // Smooth camera interpolation
        const cameraSpeed = 0.1;
        newState.camera = {
          x: Math.max(0, Math.min(
            newState.camera.x + (targetCameraX - newState.camera.x) * cameraSpeed,
            WORLD_WIDTH * BLOCK_SIZE - window.innerWidth
          )),
          y: Math.max(0, Math.min(
            newState.camera.y + (targetCameraY - newState.camera.y) * cameraSpeed,
            WORLD_HEIGHT * BLOCK_SIZE - window.innerHeight
          ))
        };

        newState.player = player;
        return newState;
      });
    };

    const intervalId = setInterval(gameLoop, 16); // ~60 FPS
    return () => clearInterval(intervalId);
  }, [keys]);

  const checkNearbyInteractables = (gameState: GameState, player: Player) => {
    const playerX = Math.floor(player.x);
    const playerY = Math.floor(player.y);
    
    // Check surrounding tiles for interactables
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const x = playerX + dx;
        const y = playerY + dy;
        
        if (x >= 0 && x < WORLD_WIDTH && y >= 0 && y < WORLD_HEIGHT) {
          const block = gameState.world[x][y];
          const blockProps = BLOCK_PROPERTIES[block.type];
          
          if (blockProps.interactable) {
            let message = '';
            let type: any = 'chest';
            
            switch (block.type) {
              case BlockType.CHEST:
                message = 'Press E to open chest';
                type = 'chest';
                break;
              case BlockType.STAIRS_DOWN:
                message = 'Press E to descend';
                type = 'stairs';
                break;
              case BlockType.STAIRS_UP:
                message = 'Press E to ascend';
                type = 'stairs';
                break;
              case BlockType.ALTAR:
                message = 'Press E to pray at altar';
                type = 'altar';
                break;
              case BlockType.TEMPLE_ENTRANCE:
                message = 'Press E to enter temple';
                type = 'temple';
                break;
              case BlockType.DUNGEON_ENTRANCE:
                message = 'Press E to enter dungeon';
                type = 'temple';
                break;
              case BlockType.SHOP:
                message = 'Press E to enter shop';
                type = 'shop';
                break;
              case BlockType.INN:
                message = 'Press E to rest at inn';
                type = 'shop';
                break;
              case BlockType.BLACKSMITH:
                message = 'Press E to visit blacksmith';
                type = 'shop';
                break;
              case BlockType.TEMPLE:
                message = 'Press E to enter temple';
                type = 'temple';
                break;
            }
            
            gameState.nearbyInteractable = { type, x, y, message };
            return;
          }
        }
      }
    }
    
    gameState.nearbyInteractable = undefined;
  };

  const updateCurrentArea = (gameState: GameState, player: Player) => {
    const playerX = Math.floor(player.x);
    const playerY = Math.floor(player.y);
    
    // Check if player is in any defined area
    const currentArea = gameState.worldAreas.find(area => 
      playerX >= area.x && playerX < area.x + area.width &&
      playerY >= area.y && playerY < area.y + area.height
    );
    
    if (currentArea) {
      if (!currentArea.discovered) {
        currentArea.discovered = true;
        addCombatLog(gameState, `Discovered: ${currentArea.name}!`, 'interaction');
        
        // Update exploration objective
        const exploreObjective = gameState.gameObjectives.find(obj => obj.id === 'explore_world');
        if (exploreObjective && !exploreObjective.completed) {
          exploreObjective.progress++;
          if (exploreObjective.progress >= exploreObjective.maxProgress) {
            exploreObjective.completed = true;
            addCombatLog(gameState, 'Quest completed: New to the World!', 'level_up');
          }
        }
      }
      
      gameState.currentArea = currentArea.name;
      player.currentArea = currentArea.type;
    } else {
      gameState.currentArea = 'Overworld - Unexplored';
      player.currentArea = AreaType.OVERWORLD;
    }
  };

  const interactWithNearby = useCallback(() => {
    setGameState(prevState => {
      if (!prevState.nearbyInteractable) return prevState;
      
      const newState = { ...prevState };
      const { type, x, y } = newState.nearbyInteractable;
      const block = newState.world[x][y];
      
      switch (block.type) {
        case BlockType.CHEST:
          openChest(newState, x, y);
          break;
        case BlockType.STAIRS_DOWN:
          if (newState.player.currentArea === AreaType.DUNGEON) {
            descendToNextLevel(newState);
          } else {
            addCombatLog(newState, 'These stairs lead deeper into the dungeon.', 'interaction');
          }
          break;
        case BlockType.STAIRS_UP:
          if (newState.player.currentArea === AreaType.DUNGEON) {
            ascendToPreviousLevel(newState);
          } else {
            addCombatLog(newState, 'These stairs lead up from the dungeon.', 'interaction');
          }
          break;
        case BlockType.ALTAR:
          interactWithAltar(newState, x, y);
          break;
        case BlockType.TEMPLE_ENTRANCE:
        case BlockType.TEMPLE:
          enterTemple(newState, x, y);
          break;
        case BlockType.DUNGEON_ENTRANCE:
          enterDungeon(newState, x, y);
          break;
        case BlockType.SHOP:
          addCombatLog(newState, 'Welcome to the shop! (Shop system coming soon)', 'interaction');
          break;
        case BlockType.INN:
          restAtInn(newState);
          break;
        case BlockType.BLACKSMITH:
          addCombatLog(newState, 'Welcome to the blacksmith! (Crafting system coming soon)', 'interaction');
          break;
      }
      
      return newState;
    });
  }, []);

  const openChest = (gameState: GameState, x: number, y: number) => {
    const loot = generateChestLoot(gameState.player.level);
    loot.forEach(item => {
      addToInventory(gameState.inventory, item);
      addCombatLog(gameState, `Found: ${ITEM_PROPERTIES[item.type].name} x${item.count}`, 'loot');
    });
    
    // Replace chest with floor
    gameState.world[x][y] = { type: BlockType.FLOOR, x, y };
    gameState.nearbyInteractable = undefined;
  };

  const interactWithAltar = (gameState: GameState, x: number, y: number) => {
    // Find which temple this altar belongs to
    const temple = gameState.temples.find(t => 
      Math.abs(t.x - x) <= 6 && Math.abs(t.y - y) <= 6
    );
    
    if (temple) {
      const god = GodSystem.GODS.find(g => g.id === temple.godId);
      if (god) {
        addCombatLog(gameState, `You approach the altar of ${god.name}. You feel their divine presence.`, 'divine');
        addCombatLog(gameState, `${god.description}`, 'divine');
        addCombatLog(gameState, 'Use the God System (G key) to worship or make offerings.', 'interaction');
      }
    } else {
      // Random altar
      addCombatLog(gameState, 'You feel a mysterious divine presence at this ancient altar.', 'divine');
      if (Math.random() < 0.3) {
        gameState.player.statusEffects.push({
          type: 'blessed',
          duration: 30000,
          power: 3
        });
        addCombatLog(gameState, 'The altar grants you a minor blessing!', 'divine');
      }
    }
  };

  const enterTemple = (gameState: GameState, x: number, y: number) => {
    const temple = gameState.temples.find(t => 
      Math.abs(t.x - x) <= 6 && Math.abs(t.y - y) <= 6
    );
    
    if (temple) {
      const god = GodSystem.GODS.find(g => g.id === temple.godId);
      if (god) {
        addCombatLog(gameState, `You enter the sacred temple of ${god.name}.`, 'divine');
        addCombatLog(gameState, `The temple offers: Healing (50g), Blessing (100g), Curse Removal (75g)`, 'interaction');
        
        // Update temple visit objective
        const templeObjective = gameState.gameObjectives.find(obj => obj.id === 'visit_temple');
        if (templeObjective && !templeObjective.completed) {
          templeObjective.progress = 1;
          templeObjective.completed = true;
          addCombatLog(gameState, 'Quest completed: Seek Divine Guidance!', 'level_up');
        }
      }
    }
  };

  const enterDungeon = (gameState: GameState, x: number, y: number) => {
    // Find which dungeon this entrance leads to
    const dungeonArea = gameState.worldAreas.find(area => 
      area.type === AreaType.DUNGEON &&
      Math.abs((area.x + area.width/2) - x) <= 2 &&
      Math.abs((area.y + area.height/2) - y) <= 2
    );
    
    if (dungeonArea) {
      // Generate dungeon
      const dungeonGenerator = new DungeonGenerator(80, 60, dungeonArea.level);
      const { world, dungeon } = dungeonGenerator.generate();
      
      // Find entrance room for spawn
      const entranceRoom = dungeon.rooms.find(r => r.type === 'entrance');
      if (entranceRoom) {
        gameState.player.x = entranceRoom.x + Math.floor(entranceRoom.width / 2);
        gameState.player.y = entranceRoom.y + Math.floor(entranceRoom.height / 2);
        gameState.player.currentArea = AreaType.DUNGEON;
      }
      
      gameState.world = world;
      gameState.currentDungeon = dungeon;
      gameState.mobs = generateDungeonMobs(dungeon, world);
      gameState.currentArea = `${dungeonArea.name} - Level ${dungeonArea.level}`;
      
      addCombatLog(gameState, `Entered ${dungeonArea.name}! Beware of the dangers within.`, 'interaction');
      
      // Update dungeon objective
      const dungeonObjective = gameState.gameObjectives.find(obj => obj.id === 'enter_dungeon');
      if (dungeonObjective && !dungeonObjective.completed) {
        dungeonObjective.progress = 1;
        dungeonObjective.completed = true;
        addCombatLog(gameState, 'Quest completed: Brave the Depths!', 'level_up');
      }
    }
  };

  const restAtInn = (gameState: GameState) => {
    const cost = 25;
    if (gameState.player.gold >= cost) {
      gameState.player.gold -= cost;
      gameState.player.health = gameState.player.maxHealth;
      gameState.player.mana = gameState.player.maxMana;
      
      // Remove negative status effects
      gameState.player.statusEffects = gameState.player.statusEffects.filter(effect => 
        !['poison', 'cursed', 'burning', 'frozen'].includes(effect.type)
      );
      
      addCombatLog(gameState, `Rested at the inn for ${cost} gold. Fully restored!`, 'heal');
    } else {
      addCombatLog(gameState, `You need ${cost} gold to rest at the inn.`, 'interaction');
    }
  };

  const updateStatusEffects = (entity: Player | Mob, gameState: GameState) => {
    if (!entity.statusEffects) {
      entity.statusEffects = [];
      return;
    }
    
    entity.statusEffects = entity.statusEffects.filter(effect => {
      effect.duration -= 16;
      
      // Apply effect
      switch (effect.type) {
        case 'poison':
          if (gameState.time % 1000 < 16) { // Every second
            entity.health -= effect.power;
            addCombatLog(gameState, `Poison deals ${effect.power} damage`, 'damage');
          }
          break;
        case 'burning':
          if (gameState.time % 500 < 16) { // Every half second
            entity.health -= effect.power;
            addCombatLog(gameState, `Fire deals ${effect.power} damage`, 'damage');
          }
          break;
        case 'frozen':
          // Reduce movement speed
          if ('vx' in entity && 'vy' in entity) {
            entity.vx *= 0.5;
            entity.vy *= 0.5;
          }
          break;
      }
      
      return effect.duration > 0;
    });
  };

  const updateActiveSpells = (gameState: GameState, deltaTime: number) => {
    gameState.activeSpells = gameState.activeSpells.filter(activeSpell => {
      activeSpell.duration -= deltaTime;
      
      // Apply ongoing spell effects here if needed
      
      return activeSpell.duration > 0;
    });
  };

  const jumpPlayer = useCallback(() => {
    setGameState(prevState => {
      const newState = { ...prevState };
      const player = { ...newState.player };
      
      // Simple jump that moves player up temporarily
      if (player.onGround) {
        player.vy = JUMP_FORCE;
        player.onGround = false;
      }
      
      newState.player = player;
      return newState;
    });
  }, []);

  const updatePlayerPosition = (player: Player, world: any[][]) => {
    // Store old position for collision resolution
    const oldX = player.x;
    const oldY = player.y;
    
    // Calculate new position
    const deltaTime = 0.016; // 60 FPS
    const newX = player.x + player.vx * deltaTime;
    const newY = player.y + player.vy * deltaTime;

    // Player size (smaller hitbox for better feel)
    const playerWidth = 0.6;
    const playerHeight = 0.8;
    const playerOffsetX = (1 - playerWidth) / 2;
    const playerOffsetY = 1 - playerHeight;

    // Test horizontal movement first
    player.x = newX;
    if (checkCollision(player.x + playerOffsetX, player.y + playerOffsetY, playerWidth, playerHeight, world)) {
      player.x = oldX; // Revert if collision
      player.vx = 0;
    }

    // Test vertical movement
    player.y = newY;
    const verticalCollision = checkCollision(player.x + playerOffsetX, player.y + playerOffsetY, playerWidth, playerHeight, world);
    
    if (verticalCollision) {
      player.y = oldY; // Revert if collision
      player.vy = 0;
    }

    // Simple ground detection - player is on ground if not jumping
    player.onGround = !keys.has(' ');

    // Keep player in bounds
    player.x = Math.max(0, Math.min(player.x, WORLD_WIDTH - 1));
    player.y = Math.max(0, Math.min(player.y, WORLD_HEIGHT - 1));
  };

  const checkCollision = (x: number, y: number, width: number, height: number, world: any[][]): boolean => {
    const left = Math.floor(x);
    const right = Math.floor(x + width);
    const top = Math.floor(y);
    const bottom = Math.floor(y + height);

    for (let tileX = left; tileX <= right; tileX++) {
      for (let tileY = top; tileY <= bottom; tileY++) {
        if (tileX >= 0 && tileX < WORLD_WIDTH && tileY >= 0 && tileY < WORLD_HEIGHT) {
          const block = world[tileX]?.[tileY];
          if (block && BLOCK_PROPERTIES[block.type].solid) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const checkMobAttacks = (gameState: GameState, player: Player) => {
    gameState.mobs.forEach(mob => {
      if (!mob.isHostile) return;
      
      const distance = Math.sqrt(
        Math.pow(player.x - mob.x, 2) + Math.pow(player.y - mob.y, 2)
      );
      
      if (distance <= mob.attackRange && gameState.time - mob.lastAttack > 1000) {
        let damage = Math.max(1, mob.attackDamage - player.defense);
        
        // Apply status effect bonuses/penalties
        const shieldEffect = player.statusEffects.find(e => e.type === 'blessed');
        if (shieldEffect) damage = Math.max(1, damage - shieldEffect.power);
        
        player.health = Math.max(0, player.health - damage);
        mob.lastAttack = gameState.time;
        
        addCombatLog(gameState, `${mob.type} attacks you for ${damage} damage!`, 'damage');
        
        if (player.health <= 0) {
          addCombatLog(gameState, 'You have died!', 'death');
          // Handle player death
          respawnPlayer(gameState);
        }
      }
    });
  };

  const checkEnvironmentalHazards = (gameState: GameState, player: Player) => {
    const playerTileX = Math.floor(player.x);
    const playerTileY = Math.floor(player.y);
    
    if (playerTileX >= 0 && playerTileX < WORLD_WIDTH && 
        playerTileY >= 0 && playerTileY < WORLD_HEIGHT) {
      const currentBlock = gameState.world[playerTileX][playerTileY];
      
      if (currentBlock.type === BlockType.LAVA) {
        if (gameState.time % 500 === 0) { // Damage every 500ms
          const damage = 5;
          player.health = Math.max(0, player.health - damage);
          addCombatLog(gameState, `Lava burns you for ${damage} damage!`, 'damage');
          
          // Add burning effect
          if (!player.statusEffects.some(e => e.type === 'burning')) {
            player.statusEffects.push({
              type: 'burning',
              duration: 3000,
              power: 2
            });
          }
        }
      } else if (currentBlock.type === BlockType.TRAP) {
        const damage = 10;
        player.health = Math.max(0, player.health - damage);
        addCombatLog(gameState, `You triggered a trap for ${damage} damage!`, 'damage');
        // Remove trap after triggering
        gameState.world[playerTileX][playerTileY] = { type: BlockType.FLOOR, x: playerTileX, y: playerTileY };
      }
    }
  };

  const addCombatLog = (gameState: GameState, message: string, type: CombatLogEntry['type']) => {
    const entry: CombatLogEntry = {
      id: `log_${Date.now()}_${Math.random()}`,
      message,
      timestamp: gameState.time,
      type
    };
    
    gameState.combatLog.push(entry);
    
    // Keep only last 50 entries
    if (gameState.combatLog.length > 50) {
      gameState.combatLog = gameState.combatLog.slice(-50);
    }
  };

  const respawnPlayer = (gameState: GameState) => {
    if (gameState.player.currentArea === AreaType.DUNGEON && gameState.currentDungeon) {
      // Respawn at dungeon entrance
      const entranceRoom = gameState.currentDungeon.rooms.find(r => r.type === 'entrance');
      if (entranceRoom) {
        gameState.player.x = entranceRoom.x + Math.floor(entranceRoom.width / 2);
        gameState.player.y = entranceRoom.y + Math.floor(entranceRoom.height / 2);
      }
    } else {
      // Respawn at starting town
      const startingTown = gameState.worldAreas.find(area => area.id === 'starting_town');
      if (startingTown) {
        gameState.player.x = startingTown.x + Math.floor(startingTown.width / 2);
        gameState.player.y = startingTown.y + Math.floor(startingTown.height / 2);
        gameState.player.currentArea = AreaType.TOWN;
        
        // Return to overworld
        const overworldGenerator = new OverworldGenerator(WORLD_WIDTH, WORLD_HEIGHT);
        const { world } = overworldGenerator.generate();
        gameState.world = world;
        gameState.currentDungeon = undefined;
        gameState.mobs = generateOverworldMobs(world, gameState.worldAreas);
      }
    }
    
    gameState.player.health = gameState.player.maxHealth;
    gameState.player.vx = 0;
    gameState.player.vy = 0;
    
    // Lose some gold and experience
    gameState.player.gold = Math.floor(gameState.player.gold * 0.8);
    gameState.player.experience = Math.floor(gameState.player.experience * 0.9);
    
    addCombatLog(gameState, 'You have been resurrected, but at a cost...', 'heal');
  };

  const attackNearbyMob = useCallback(() => {
    setGameState(prevState => {
      if (prevState.time - prevState.player.lastAttack < 500) return prevState; // Attack cooldown
      
      const newState = { ...prevState };
      const player = { ...newState.player };
      
      // Find nearest mob within attack range
      let nearestMob: Mob | null = null;
      let nearestDistance = Infinity;
      
      newState.mobs.forEach(mob => {
        const distance = Math.sqrt(
          Math.pow(player.x - mob.x, 2) + Math.pow(player.y - mob.y, 2)
        );
        
        if (distance <= 2 && distance < nearestDistance) {
          nearestMob = mob;
          nearestDistance = distance;
        }
      });
      
      if (nearestMob) {
        const weapon = newState.inventory[player.selectedSlot];
        let damage = player.attack;
        
        if (weapon && ITEM_PROPERTIES[weapon.type].isWeapon) {
          damage += ITEM_PROPERTIES[weapon.type].damage || 0;
        }
        
        // Apply status effect bonuses
        const strengthEffect = player.statusEffects.find(e => e.type === 'strength');
        if (strengthEffect) damage += strengthEffect.power;
        
        const blessedEffect = player.statusEffects.find(e => e.type === 'blessed');
        if (blessedEffect) damage += blessedEffect.power;
        
        const finalDamage = Math.max(1, damage - nearestMob.defense);
        nearestMob.health -= finalDamage;
        player.lastAttack = newState.time;
        
        // Create blood particles
        for (let i = 0; i < 5; i++) {
          const particle = {
            id: `blood_${Date.now()}_${i}`,
            x: nearestMob.x,
            y: nearestMob.y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            color: '#8B0000',
            life: 1000,
            maxLife: 1000,
            type: 'blood' as const
          };
          newState.particles.push(particle);
        }
        
        addCombatLog(newState, `You attack ${nearestMob.type} for ${finalDamage} damage!`, 'damage');
        
        // Update alignment based on mob type
        if (nearestMob.alignment === 'good') {
          GodSystem.updateAlignment(player, 'evil');
        } else if (nearestMob.alignment === 'evil') {
          GodSystem.updateAlignment(player, 'good');
        }
        
        if (nearestMob.health <= 0) {
          // Mob defeated
          addCombatLog(newState, `You defeated ${nearestMob.type}!`, 'death');
          
          // Give experience and gold
          player.experience += nearestMob.experienceReward;
          player.gold += nearestMob.goldReward;
          
          // Check for level up
          const expNeeded = player.level * 100;
          if (player.experience >= expNeeded) {
            player.level++;
            player.experience -= expNeeded;
            player.maxHealth += 15;
            player.health = player.maxHealth;
            player.maxMana += 10;
            player.mana = player.maxMana;
            player.attack += 3;
            player.defense += 2;
            player.magicPower += 2;
            
            // Learn new spells
            const newSpells = SpellSystem.getStartingSpells(player.level, player.alignment);
            newSpells.forEach(spell => {
              if (!player.spellsKnown.some(s => s.id === spell.id)) {
                player.spellsKnown.push(spell);
                addCombatLog(newState, `Learned new spell: ${spell.name}!`, 'spell');
              }
            });
            
            addCombatLog(newState, `Level up! You are now level ${player.level}!`, 'level_up');
          }
          
          // Drop loot
          nearestMob.drops.forEach(drop => {
            addToInventory(newState.inventory, drop);
            addCombatLog(newState, `Found: ${ITEM_PROPERTIES[drop.type].name} x${drop.count}`, 'loot');
          });
          
          // Remove mob
          newState.mobs = newState.mobs.filter(m => m.id !== nearestMob!.id);
        }
      }
      
      newState.player = player;
      return newState;
    });
  }, []);

  const useSelectedItem = useCallback(() => {
    setGameState(prevState => {
      const selectedItem = prevState.inventory[prevState.player.selectedSlot];
      if (!selectedItem || selectedItem.count <= 0) return prevState;
      
      const itemProps = ITEM_PROPERTIES[selectedItem.type];
      const newState = { ...prevState };
      const player = { ...newState.player };
      
      // Handle different item types
      if (itemProps.isConsumable) {
        // Apply item effects
        if (itemProps.healing) {
          player.health = Math.min(player.maxHealth, player.health + itemProps.healing);
          addCombatLog(newState, `Used ${itemProps.name}, restored ${itemProps.healing} health`, 'heal');
        }
        
        if (itemProps.manaRestore) {
          player.mana = Math.min(player.maxMana, player.mana + itemProps.manaRestore);
          addCombatLog(newState, `Used ${itemProps.name}, restored ${itemProps.manaRestore} mana`, 'heal');
        }
        
        // Consume item
        selectedItem.count--;
        if (selectedItem.count <= 0) {
          newState.inventory[prevState.player.selectedSlot] = { type: ItemType.GOLD_COIN, count: 0 };
        }
      } else if (selectedItem.type === ItemType.TELEPORT_SCROLL) {
        // Teleport to random safe location
        const safeSpots = [];
        for (let x = 0; x < WORLD_WIDTH; x++) {
          for (let y = 0; y < WORLD_HEIGHT; y++) {
            if (newState.world[x][y].type === BlockType.FLOOR || newState.world[x][y].type === BlockType.GRASS) {
              safeSpots.push({ x, y });
            }
          }
        }
        
        if (safeSpots.length > 0) {
          const randomSpot = safeSpots[Math.floor(Math.random() * safeSpots.length)];
          player.x = randomSpot.x;
          player.y = randomSpot.y;
          addCombatLog(newState, 'Teleported to safety!', 'spell');
          
          selectedItem.count--;
          if (selectedItem.count <= 0) {
            newState.inventory[prevState.player.selectedSlot] = { type: ItemType.GOLD_COIN, count: 0 };
          }
        }
      }
      
      newState.player = player;
      return newState;
    });
  }, []);

  const castSpell = useCallback((spell: Spell, targetX?: number, targetY?: number) => {
    setGameState(prevState => {
      const newState = { ...prevState };
      const success = SpellSystem.castSpell(spell, newState.player, newState, targetX, targetY);
      
      if (success) {
        addCombatLog(newState, `Cast ${spell.name}!`, 'spell');
      } else {
        addCombatLog(newState, 'Not enough mana!', 'spell');
      }
      
      return newState;
    });
  }, []);

  const prayToGod = useCallback((godId: string) => {
    setGameState(prevState => {
      const newState = { ...prevState };
      
      // Check if player is at a temple
      const nearbyTemple = newState.temples.find(temple => {
        const distance = Math.sqrt(
          Math.pow(newState.player.x - temple.x, 2) + 
          Math.pow(newState.player.y - temple.y, 2)
        );
        return distance <= 8 && temple.godId === godId;
      });
      
      if (nearbyTemple) {
        GodSystem.worship(godId, newState.player, newState, nearbyTemple.id);
      } else {
        addCombatLog(newState, 'You must be at a temple to properly worship a god.', 'divine');
      }
      
      return newState;
    });
  }, []);

  const sacrificeToGod = useCallback((godId: string, itemSlot: number) => {
    setGameState(prevState => {
      const newState = { ...prevState };
      
      // Check if player is at a temple
      const nearbyTemple = newState.temples.find(temple => {
        const distance = Math.sqrt(
          Math.pow(newState.player.x - temple.x, 2) + 
          Math.pow(newState.player.y - temple.y, 2)
        );
        return distance <= 8 && temple.godId === godId;
      });
      
      if (nearbyTemple) {
        GodSystem.makeOffering(godId, itemSlot, newState.player, newState);
      } else {
        addCombatLog(newState, 'You must be at a temple to make offerings to a god.', 'divine');
      }
      
      return newState;
    });
  }, []);

  const useBomb = useCallback((bombType: ItemType, targetX: number, targetY: number) => {
    setGameState(prevState => {
      const newState = { ...prevState };
      ExplosionSystem.useBomb(bombType, targetX, targetY, newState);
      return newState;
    });
  }, []);

  const toggleMiniMap = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      miniMapVisible: !prevState.miniMapVisible
    }));
  }, []);

  const addToInventory = (inventory: Item[], item: Item): boolean => {
    // Try to stack with existing items
    for (let i = 0; i < inventory.length; i++) {
      if (inventory[i].type === item.type && inventory[i].count > 0) {
        const maxStack = ITEM_PROPERTIES[item.type].stackSize;
        const canAdd = Math.min(item.count, maxStack - inventory[i].count);
        if (canAdd > 0) {
          inventory[i].count += canAdd;
          item.count -= canAdd;
          if (item.count === 0) return true;
        }
      }
    }
    
    // Find empty slot
    for (let i = 0; i < inventory.length; i++) {
      if (inventory[i].count === 0) {
        inventory[i] = { ...item };
        return true;
      }
    }
    
    return false; // Inventory full
  };

  const handleBlockClick = useCallback((x: number, y: number, isRightClick: boolean) => {
    // Block clicking is now handled by the interact system
    // This prevents accidental interactions
  }, []);

  const generateChestLoot = (playerLevel: number): Item[] => {
    const loot: Item[] = [];
    
    // Always some gold
    loot.push({ type: ItemType.GOLD_COIN, count: 10 + Math.floor(Math.random() * playerLevel * 5) });
    
    // Random items based on level
    const possibleItems = [
      ItemType.HEALTH_POTION,
      ItemType.MANA_POTION,
      ItemType.BREAD,
      ItemType.CHEESE,
      ItemType.TORCH,
      ItemType.ROPE
    ];
    
    if (playerLevel >= 3) {
      possibleItems.push(ItemType.IRON_SWORD, ItemType.CHAIN_ARMOR);
    }
    
    if (playerLevel >= 6) {
      possibleItems.push(ItemType.STEEL_SWORD, ItemType.PLATE_ARMOR, ItemType.GEM);
    }
    
    // Add 1-3 random items
    const numItems = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numItems; i++) {
      const randomItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
      const count = ITEM_PROPERTIES[randomItem].stackSize > 1 ? 1 + Math.floor(Math.random() * 2) : 1;
      loot.push({ type: randomItem, count });
    }
    
    return loot;
  };

  const descendToNextLevel = (gameState: GameState) => {
    if (!gameState.currentDungeon) return;
    
    const nextLevel = gameState.currentDungeon.level + 1;
    const dungeonGenerator = new DungeonGenerator(80, 60, nextLevel);
    const { world, dungeon } = dungeonGenerator.generate();
    
    // Find entrance room for spawn
    const entranceRoom = dungeon.rooms.find(r => r.type === 'entrance');
    if (entranceRoom) {
      gameState.player.x = entranceRoom.x + Math.floor(entranceRoom.width / 2);
      gameState.player.y = entranceRoom.y + Math.floor(entranceRoom.height / 2);
    }
    
    gameState.world = world;
    gameState.currentDungeon = dungeon;
    gameState.mobs = generateDungeonMobs(dungeon, world);
    gameState.currentArea = `Dungeon Level ${nextLevel}`;
    
    addCombatLog(gameState, `Descended to dungeon level ${nextLevel}`, 'level_up');
  };

  const ascendToPreviousLevel = (gameState: GameState) => {
    if (!gameState.currentDungeon || gameState.currentDungeon.level <= 1) {
      // Exit to overworld
      const overworldGenerator = new OverworldGenerator(WORLD_WIDTH, WORLD_HEIGHT);
      const { world } = overworldGenerator.generate();
      
      // Find the dungeon entrance we came from
      const dungeonArea = gameState.worldAreas.find(area => area.type === AreaType.DUNGEON);
      if (dungeonArea) {
        gameState.player.x = dungeonArea.x + Math.floor(dungeonArea.width / 2);
        gameState.player.y = dungeonArea.y + Math.floor(dungeonArea.height / 2);
      }
      
      gameState.world = world;
      gameState.currentDungeon = undefined;
      gameState.mobs = generateOverworldMobs(world, gameState.worldAreas);
      gameState.currentArea = 'Overworld';
      gameState.player.currentArea = AreaType.OVERWORLD;
      
      addCombatLog(gameState, 'Returned to the overworld', 'interaction');
    } else {
      // Go up one dungeon level
      const prevLevel = gameState.currentDungeon.level - 1;
      const dungeonGenerator = new DungeonGenerator(80, 60, prevLevel);
      const { world, dungeon } = dungeonGenerator.generate();
      
      // Find exit room for spawn
      const exitRoom = dungeon.rooms.find(r => r.type === 'exit');
      if (exitRoom) {
        gameState.player.x = exitRoom.x + Math.floor(exitRoom.width / 2);
        gameState.player.y = exitRoom.y + Math.floor(exitRoom.height / 2);
      }
      
      gameState.world = world;
      gameState.currentDungeon = dungeon;
      gameState.mobs = generateDungeonMobs(dungeon, world);
      gameState.currentArea = `Dungeon Level ${prevLevel}`;
      
      addCombatLog(gameState, `Ascended to dungeon level ${prevLevel}`, 'level_up');
    }
  };

  const handleSlotSelect = useCallback((slot: number) => {
    setGameState(prevState => ({
      ...prevState,
      player: { ...prevState.player, selectedSlot: slot }
    }));
  }, []);

  const toggleGameMode = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      gameMode: prevState.gameMode === 'adventure' ? 'creative' : 'adventure'
    }));
  }, []);

  return {
    gameState,
    handleBlockClick,
    handleSlotSelect,
    toggleGameMode,
    attackNearbyMob,
    useSelectedItem,
    castSpell,
    prayToGod,
    sacrificeToGod,
    useBomb,
    toggleMiniMap,
    spellSystemVisible,
    setSpellSystemVisible,
    godSystemVisible,
    setGodSystemVisible,
    interactWithNearby
  };
};