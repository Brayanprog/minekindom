export interface Position {
  x: number;
  y: number;
}

export interface Block {
  type: BlockType;
  x: number;
  y: number;
  metadata?: any;
}

export enum BlockType {
  AIR = 'air',
  WALL = 'wall',
  FLOOR = 'floor',
  DOOR = 'door',
  STAIRS_DOWN = 'stairs_down',
  STAIRS_UP = 'stairs_up',
  CHEST = 'chest',
  TORCH = 'torch',
  TRAP = 'trap',
  WATER = 'water',
  LAVA = 'lava',
  PILLAR = 'pillar',
  ALTAR = 'altar',
  PORTAL = 'portal',
  SHRINE = 'shrine',
  RUNE_STONE = 'rune_stone',
  CRYSTAL = 'crystal',
  BONE_PILE = 'bone_pile',
  BLOOD_POOL = 'blood_pool',
  EVIL_ALTAR = 'evil_altar',
  MAGIC_CIRCLE = 'magic_circle',
  GRASS = 'grass',
  TREE = 'tree',
  ROCK = 'rock',
  DIRT = 'dirt',
  SAND = 'sand',
  TEMPLE_ENTRANCE = 'temple_entrance',
  DUNGEON_ENTRANCE = 'dungeon_entrance',
  TOWN_ENTRANCE = 'town_entrance',
  SHOP = 'shop',
  INN = 'inn',
  BLACKSMITH = 'blacksmith',
  TEMPLE = 'temple'
}

export enum ItemType {
  // Weapons
  RUSTY_SWORD = 'rusty_sword',
  IRON_SWORD = 'iron_sword',
  STEEL_SWORD = 'steel_sword',
  MAGIC_SWORD = 'magic_sword',
  CURSED_BLADE = 'cursed_blade',
  HOLY_SWORD = 'holy_sword',
  DEMON_SLAYER = 'demon_slayer',
  DAGGER = 'dagger',
  MACE = 'mace',
  WAR_HAMMER = 'war_hammer',
  BATTLE_AXE = 'battle_axe',
  STAFF_OF_POWER = 'staff_of_power',
  DARK_STAFF = 'dark_staff',
  
  // Armor
  LEATHER_ARMOR = 'leather_armor',
  CHAIN_ARMOR = 'chain_armor',
  PLATE_ARMOR = 'plate_armor',
  MAGIC_ROBE = 'magic_robe',
  DRAGON_SCALE = 'dragon_scale',
  DEMON_ARMOR = 'demon_armor',
  HOLY_ARMOR = 'holy_armor',
  
  // Magic Items
  SPELL_SCROLL = 'spell_scroll',
  MAGIC_ORB = 'magic_orb',
  RUNE_STONE = 'rune_stone',
  CRYSTAL_SHARD = 'crystal_shard',
  SOUL_GEM = 'soul_gem',
  
  // Bombs & Explosives
  BOMB = 'bomb',
  FIRE_BOMB = 'fire_bomb',
  ICE_BOMB = 'ice_bomb',
  POISON_BOMB = 'poison_bomb',
  HOLY_GRENADE = 'holy_grenade',
  
  // Tools
  PICKAXE = 'pickaxe',
  TORCH = 'torch',
  ROPE = 'rope',
  LOCKPICK = 'lockpick',
  TELEPORT_SCROLL = 'teleport_scroll',
  
  // Consumables
  HEALTH_POTION = 'health_potion',
  MANA_POTION = 'mana_potion',
  STRENGTH_POTION = 'strength_potion',
  SPEED_POTION = 'speed_potion',
  INVISIBILITY_POTION = 'invisibility_potion',
  BREAD = 'bread',
  CHEESE = 'cheese',
  DRAGON_MEAT = 'dragon_meat',
  
  // Treasures
  GOLD_COIN = 'gold_coin',
  SILVER_COIN = 'silver_coin',
  GEM = 'gem',
  ARTIFACT = 'artifact',
  KEY = 'key',
  DIVINE_RELIC = 'divine_relic',
  CURSED_ARTIFACT = 'cursed_artifact',
  
  // Materials
  STONE = 'stone',
  IRON_ORE = 'iron_ore',
  WOOD = 'wood',
  DEMON_BONE = 'demon_bone',
  ANGEL_FEATHER = 'angel_feather',
  DRAGON_SCALE_MAT = 'dragon_scale_mat',
  
  // Offerings
  INCENSE = 'incense',
  CANDLE = 'candle',
  HOLY_WATER = 'holy_water',
  BLOOD_VIAL = 'blood_vial',
  FLOWERS = 'flowers',
  WINE = 'wine'
}

export interface Item {
  type: ItemType;
  count: number;
  durability?: number;
  maxDurability?: number;
  enchantments?: string[];
  value?: number;
  magicPower?: number;
  cursed?: boolean;
  blessed?: boolean;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  selectedSlot: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  experience: number;
  level: number;
  attack: number;
  defense: number;
  magicPower: number;
  gold: number;
  dungeonLevel: number;
  lastAttack: number;
  statusEffects: StatusEffect[];
  alignment: 'good' | 'neutral' | 'evil';
  godFavor: Record<string, number>;
  spellsKnown: Spell[];
  worldX: number;
  worldY: number;
  currentArea: AreaType;
  karma: number;
  reputation: number;
}

export interface StatusEffect {
  type: 'poison' | 'strength' | 'speed' | 'invisibility' | 'blessed' | 'cursed' | 'burning' | 'frozen';
  duration: number;
  power: number;
}

export interface Spell {
  id: string;
  name: string;
  manaCost: number;
  damage?: number;
  healing?: number;
  effect?: string;
  range: number;
  type: 'offensive' | 'defensive' | 'utility' | 'dark' | 'holy';
}

export interface Mob {
  id: string;
  type: MobType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  health: number;
  maxHealth: number;
  onGround: boolean;
  direction: number;
  lastMove: number;
  isHostile: boolean;
  attackDamage: number;
  defense: number;
  drops: Item[];
  lastAttack: number;
  experienceReward: number;
  goldReward: number;
  detectionRange: number;
  attackRange: number;
  moveSpeed: number;
  magicResistance: number;
  statusEffects: StatusEffect[];
  alignment: 'good' | 'neutral' | 'evil';
  isBoss: boolean;
  spells?: Spell[];
}

export enum MobType {
  // Basic Monsters
  GOBLIN = 'goblin',
  ORC = 'orc',
  SKELETON = 'skeleton',
  ZOMBIE = 'zombie',
  SPIDER = 'spider',
  BAT = 'bat',
  SLIME = 'slime',
  
  // Mid-tier Monsters
  TROLL = 'troll',
  OGRE = 'ogre',
  WRAITH = 'wraith',
  GARGOYLE = 'gargoyle',
  MINOTAUR = 'minotaur',
  BASILISK = 'basilisk',
  WYVERN = 'wyvern',
  
  // High-tier Monsters
  DRAGON = 'dragon',
  LICH = 'lich',
  DEMON = 'demon',
  ANGEL = 'angel',
  PHOENIX = 'phoenix',
  KRAKEN = 'kraken',
  
  // Boss Monsters
  DEMON_LORD = 'demon_lord',
  ARCH_ANGEL = 'arch_angel',
  ANCIENT_DRAGON = 'ancient_dragon',
  DEATH_KNIGHT = 'death_knight',
  SHADOW_LORD = 'shadow_lord',
  
  // Divine/Evil Entities
  LESSER_GOD = 'lesser_god',
  EVIL_GOD = 'evil_god',
  FALLEN_ANGEL = 'fallen_angel',
  DIVINE_AVATAR = 'divine_avatar',
  
  // Neutral Creatures
  MERCHANT = 'merchant',
  PRIEST = 'priest',
  WIZARD = 'wizard',
  BLACKSMITH = 'blacksmith',
  
  // Wildlife
  WOLF = 'wolf',
  BEAR = 'bear',
  DEER = 'deer',
  RABBIT = 'rabbit',
  HAWK = 'hawk'
}

export interface DungeonRoom {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: RoomType;
  connected: boolean;
  hasChest: boolean;
  hasTrap: boolean;
  mobCount: number;
  difficulty: number;
}

export enum RoomType {
  NORMAL = 'normal',
  TREASURE = 'treasure',
  BOSS = 'boss',
  ENTRANCE = 'entrance',
  EXIT = 'exit',
  SHRINE = 'shrine',
  LIBRARY = 'library',
  ARMORY = 'armory',
  TEMPLE = 'temple',
  CRYPT = 'crypt',
  RITUAL_CHAMBER = 'ritual_chamber',
  PORTAL_ROOM = 'portal_room'
}

export interface Dungeon {
  level: number;
  width: number;
  height: number;
  rooms: DungeonRoom[];
  difficulty: number;
  theme: DungeonTheme;
  bossDefeated: boolean;
}

export enum DungeonTheme {
  CAVE = 'cave',
  CRYPT = 'crypt',
  CASTLE = 'castle',
  MINE = 'mine',
  TEMPLE = 'temple',
  HELL = 'hell',
  HEAVEN = 'heaven',
  SHADOW_REALM = 'shadow_realm',
  CRYSTAL_CAVERN = 'crystal_cavern',
  DEMON_FORTRESS = 'demon_fortress'
}

export enum AreaType {
  OVERWORLD = 'overworld',
  TOWN = 'town',
  DUNGEON = 'dungeon',
  TEMPLE = 'temple',
  WILDERNESS = 'wilderness'
}

export interface WorldArea {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: AreaType;
  level: number;
  discovered: boolean;
  description: string;
}

export interface God {
  id: string;
  name: string;
  alignment: 'good' | 'evil' | 'neutral';
  domain: string;
  favor: number;
  blessings: string[];
  curses: string[];
  avatar?: MobType;
  templeLocation?: Position;
  offeringTypes: ItemType[];
  description: string;
}

export interface Temple {
  id: string;
  godId: string;
  x: number;
  y: number;
  name: string;
  level: number;
  hasAltar: boolean;
  hasPriest: boolean;
  services: TempleService[];
}

export enum TempleService {
  HEALING = 'healing',
  BLESSING = 'blessing',
  CURSE_REMOVAL = 'curse_removal',
  TRAINING = 'training',
  DONATION = 'donation',
  CONFESSION = 'confession'
}

export interface GameState {
  world: Block[][];
  player: Player;
  inventory: Item[];
  camera: Position;
  gameMode: 'adventure' | 'creative';
  time: number;
  mobs: Mob[];
  currentDungeon?: Dungeon;
  gameObjectives: GameObjective[];
  achievements: Achievement[];
  combatLog: CombatLogEntry[];
  isInCombat: boolean;
  targetedMob?: string;
  lootOpen: boolean;
  selectedLoot?: Position;
  worldAreas: WorldArea[];
  gods: God[];
  temples: Temple[];
  activeSpells: ActiveSpell[];
  explosions: Explosion[];
  particles: Particle[];
  miniMapVisible: boolean;
  currentArea: string;
  nearbyInteractable?: {
    type: 'chest' | 'stairs' | 'altar' | 'temple' | 'shop' | 'npc';
    x: number;
    y: number;
    message: string;
  };
}

export interface ActiveSpell {
  id: string;
  spell: Spell;
  caster: string;
  target?: Position;
  duration: number;
  power: number;
}

export interface Explosion {
  id: string;
  x: number;
  y: number;
  radius: number;
  damage: number;
  type: 'fire' | 'ice' | 'holy' | 'dark' | 'normal';
  duration: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'spark' | 'blood' | 'magic' | 'holy' | 'dark';
}

export interface GameObjective {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  progress: number;
  maxProgress: number;
  reward?: Item;
  type: 'kill' | 'explore' | 'collect' | 'survive' | 'divine';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface CombatLogEntry {
  id: string;
  message: string;
  timestamp: number;
  type: 'damage' | 'heal' | 'death' | 'level_up' | 'loot' | 'spell' | 'divine' | 'explosion' | 'interaction';
}