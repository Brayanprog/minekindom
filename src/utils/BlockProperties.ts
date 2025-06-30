import { BlockType } from '../types/Game';

export interface BlockProperties {
  name: string;
  color: string;
  solid: boolean;
  transparent: boolean;
  category: 'structure' | 'interactive' | 'hazard' | 'decoration' | 'terrain';
  description?: string;
  interactable?: boolean;
}

export const BLOCK_PROPERTIES: Record<BlockType, BlockProperties> = {
  [BlockType.AIR]: {
    name: 'Air',
    color: 'transparent',
    solid: false,
    transparent: true,
    category: 'structure'
  },
  [BlockType.WALL]: {
    name: 'Stone Wall',
    color: '#4a5568',
    solid: true,
    transparent: false,
    category: 'structure',
    description: 'Solid dungeon wall'
  },
  [BlockType.FLOOR]: {
    name: 'Stone Floor',
    color: '#718096',
    solid: false,
    transparent: true,
    category: 'structure',
    description: 'Walkable dungeon floor'
  },
  [BlockType.DOOR]: {
    name: 'Wooden Door',
    color: '#d69e2e',
    solid: true,
    transparent: false,
    category: 'interactive',
    description: 'Can be opened with a key',
    interactable: true
  },
  [BlockType.STAIRS_DOWN]: {
    name: 'Stairs Down',
    color: '#2d3748',
    solid: false,
    transparent: true,
    category: 'interactive',
    description: 'Leads to the next dungeon level',
    interactable: true
  },
  [BlockType.STAIRS_UP]: {
    name: 'Stairs Up',
    color: '#4a5568',
    solid: false,
    transparent: true,
    category: 'interactive',
    description: 'Leads to the previous dungeon level',
    interactable: true
  },
  [BlockType.CHEST]: {
    name: 'Treasure Chest',
    color: '#d69e2e',
    solid: true,
    transparent: false,
    category: 'interactive',
    description: 'Contains valuable loot',
    interactable: true
  },
  [BlockType.TORCH]: {
    name: 'Torch',
    color: '#f6ad55',
    solid: false,
    transparent: true,
    category: 'decoration',
    description: 'Provides light in dark dungeons'
  },
  [BlockType.TRAP]: {
    name: 'Spike Trap',
    color: '#e53e3e',
    solid: false,
    transparent: true,
    category: 'hazard',
    description: 'Damages players who step on it'
  },
  [BlockType.WATER]: {
    name: 'Water',
    color: '#3182ce',
    solid: false,
    transparent: true,
    category: 'hazard',
    description: 'Slows movement'
  },
  [BlockType.LAVA]: {
    name: 'Lava',
    color: '#e53e3e',
    solid: false,
    transparent: true,
    category: 'hazard',
    description: 'Deals fire damage over time'
  },
  [BlockType.PILLAR]: {
    name: 'Stone Pillar',
    color: '#2d3748',
    solid: true,
    transparent: false,
    category: 'structure',
    description: 'Decorative stone column'
  },
  [BlockType.ALTAR]: {
    name: 'Ancient Altar',
    color: '#805ad5',
    solid: true,
    transparent: false,
    category: 'interactive',
    description: 'Sacred altar for worship and offerings',
    interactable: true
  },
  [BlockType.PORTAL]: {
    name: 'Magic Portal',
    color: '#ed64a6',
    solid: false,
    transparent: true,
    category: 'interactive',
    description: 'Teleports to another location',
    interactable: true
  },
  [BlockType.SHRINE]: {
    name: 'Shrine',
    color: '#f6ad55',
    solid: true,
    transparent: false,
    category: 'interactive',
    description: 'Small shrine for prayers',
    interactable: true
  },
  [BlockType.RUNE_STONE]: {
    name: 'Rune Stone',
    color: '#9f7aea',
    solid: true,
    transparent: false,
    category: 'interactive',
    description: 'Ancient stone with magical runes',
    interactable: true
  },
  [BlockType.CRYSTAL]: {
    name: 'Magic Crystal',
    color: '#667eea',
    solid: true,
    transparent: false,
    category: 'interactive',
    description: 'Glowing magical crystal',
    interactable: true
  },
  [BlockType.BONE_PILE]: {
    name: 'Bone Pile',
    color: '#f5f5dc',
    solid: false,
    transparent: true,
    category: 'decoration',
    description: 'Remains of fallen adventurers'
  },
  [BlockType.BLOOD_POOL]: {
    name: 'Blood Pool',
    color: '#8b0000',
    solid: false,
    transparent: true,
    category: 'hazard',
    description: 'Pool of dark blood'
  },
  [BlockType.EVIL_ALTAR]: {
    name: 'Evil Altar',
    color: '#c53030',
    solid: true,
    transparent: false,
    category: 'interactive',
    description: 'Dark altar for evil rituals',
    interactable: true
  },
  [BlockType.MAGIC_CIRCLE]: {
    name: 'Magic Circle',
    color: '#667eea',
    solid: false,
    transparent: true,
    category: 'interactive',
    description: 'Magical summoning circle',
    interactable: true
  },
  [BlockType.GRASS]: {
    name: 'Grass',
    color: '#48bb78',
    solid: false,
    transparent: true,
    category: 'terrain',
    description: 'Green grass'
  },
  [BlockType.TREE]: {
    name: 'Tree',
    color: '#38a169',
    solid: true,
    transparent: false,
    category: 'terrain',
    description: 'Large tree'
  },
  [BlockType.ROCK]: {
    name: 'Rock',
    color: '#718096',
    solid: true,
    transparent: false,
    category: 'terrain',
    description: 'Large rock'
  },
  [BlockType.DIRT]: {
    name: 'Dirt',
    color: '#8b4513',
    solid: false,
    transparent: true,
    category: 'terrain',
    description: 'Dirt path'
  },
  [BlockType.SAND]: {
    name: 'Sand',
    color: '#f6e05e',
    solid: false,
    transparent: true,
    category: 'terrain',
    description: 'Sandy ground'
  },
  [BlockType.TEMPLE_ENTRANCE]: {
    name: 'Temple Entrance',
    color: '#ffd700',
    solid: false,
    transparent: true,
    category: 'interactive',
    description: 'Entrance to a sacred temple',
    interactable: true
  },
  [BlockType.DUNGEON_ENTRANCE]: {
    name: 'Dungeon Entrance',
    color: '#2d3748',
    solid: false,
    transparent: true,
    category: 'interactive',
    description: 'Entrance to a dangerous dungeon',
    interactable: true
  },
  [BlockType.TOWN_ENTRANCE]: {
    name: 'Town Gate',
    color: '#d69e2e',
    solid: false,
    transparent: true,
    category: 'interactive',
    description: 'Entrance to town',
    interactable: true
  },
  [BlockType.SHOP]: {
    name: 'Shop',
    color: '#38b2ac',
    solid: true,
    transparent: false,
    category: 'interactive',
    description: 'Buy and sell items',
    interactable: true
  },
  [BlockType.INN]: {
    name: 'Inn',
    color: '#ed8936',
    solid: true,
    transparent: false,
    category: 'interactive',
    description: 'Rest and recover',
    interactable: true
  },
  [BlockType.BLACKSMITH]: {
    name: 'Blacksmith',
    color: '#e53e3e',
    solid: true,
    transparent: false,
    category: 'interactive',
    description: 'Forge and repair equipment',
    interactable: true
  },
  [BlockType.TEMPLE]: {
    name: 'Temple',
    color: '#ffd700',
    solid: true,
    transparent: false,
    category: 'interactive',
    description: 'Place of worship',
    interactable: true
  }
};