import { ItemType } from '../types/Game';

export interface ItemProperties {
  name: string;
  stackSize: number;
  isWeapon: boolean;
  isArmor: boolean;
  isConsumable: boolean;
  isTool: boolean;
  damage?: number;
  defense?: number;
  healing?: number;
  manaRestore?: number;
  value: number;
  color: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export const ITEM_PROPERTIES: Record<ItemType, ItemProperties> = {
  // Weapons
  [ItemType.RUSTY_SWORD]: {
    name: 'Rusty Sword', stackSize: 1, isWeapon: true, isArmor: false, isConsumable: false, isTool: false,
    damage: 3, value: 10, color: '#8b4513', description: 'A worn blade, better than bare fists', rarity: 'common'
  },
  [ItemType.IRON_SWORD]: {
    name: 'Iron Sword', stackSize: 1, isWeapon: true, isArmor: false, isConsumable: false, isTool: false,
    damage: 6, value: 50, color: '#c0c0c0', description: 'A reliable weapon for dungeon exploration', rarity: 'common'
  },
  [ItemType.STEEL_SWORD]: {
    name: 'Steel Sword', stackSize: 1, isWeapon: true, isArmor: false, isConsumable: false, isTool: false,
    damage: 10, value: 150, color: '#708090', description: 'Forged with superior craftsmanship', rarity: 'uncommon'
  },
  [ItemType.MAGIC_SWORD]: {
    name: 'Enchanted Blade', stackSize: 1, isWeapon: true, isArmor: false, isConsumable: false, isTool: false,
    damage: 15, value: 500, color: '#9370db', description: 'Glows with magical energy', rarity: 'rare'
  },
  [ItemType.CURSED_BLADE]: {
    name: 'Cursed Blade', stackSize: 1, isWeapon: true, isArmor: false, isConsumable: false, isTool: false,
    damage: 20, value: 300, color: '#8b0000', description: 'Dark weapon that thirsts for blood', rarity: 'epic'
  },
  [ItemType.HOLY_SWORD]: {
    name: 'Holy Sword', stackSize: 1, isWeapon: true, isArmor: false, isConsumable: false, isTool: false,
    damage: 18, value: 800, color: '#ffd700', description: 'Blessed weapon that smites evil', rarity: 'epic'
  },
  [ItemType.DEMON_SLAYER]: {
    name: 'Demon Slayer', stackSize: 1, isWeapon: true, isArmor: false, isConsumable: false, isTool: false,
    damage: 25, value: 1000, color: '#ff4500', description: 'Legendary blade forged to destroy demons', rarity: 'legendary'
  },
  [ItemType.DAGGER]: {
    name: 'Dagger', stackSize: 1, isWeapon: true, isArmor: false, isConsumable: false, isTool: false,
    damage: 4, value: 25, color: '#696969', description: 'Fast and precise, favored by rogues', rarity: 'common'
  },
  [ItemType.MACE]: {
    name: 'War Mace', stackSize: 1, isWeapon: true, isArmor: false, isConsumable: false, isTool: false,
    damage: 8, value: 80, color: '#2f4f4f', description: 'Heavy weapon that crushes armor', rarity: 'uncommon'
  },
  [ItemType.WAR_HAMMER]: {
    name: 'War Hammer', stackSize: 1, isWeapon: true, isArmor: false, isConsumable: false, isTool: false,
    damage: 12, value: 120, color: '#4682b4', description: 'Massive two-handed weapon', rarity: 'uncommon'
  },
  [ItemType.BATTLE_AXE]: {
    name: 'Battle Axe', stackSize: 1, isWeapon: true, isArmor: false, isConsumable: false, isTool: false,
    damage: 14, value: 140, color: '#8b4513', description: 'Fearsome axe for cleaving enemies', rarity: 'uncommon'
  },
  [ItemType.STAFF_OF_POWER]: {
    name: 'Staff of Power', stackSize: 1, isWeapon: true, isArmor: false, isConsumable: false, isTool: false,
    damage: 8, value: 400, color: '#9370db', description: 'Magical staff that amplifies spells', rarity: 'rare'
  },
  [ItemType.DARK_STAFF]: {
    name: 'Dark Staff', stackSize: 1, isWeapon: true, isArmor: false, isConsumable: false, isTool: false,
    damage: 10, value: 350, color: '#4b0082', description: 'Staff imbued with dark magic', rarity: 'rare'
  },

  // Armor
  [ItemType.LEATHER_ARMOR]: {
    name: 'Leather Armor', stackSize: 1, isWeapon: false, isArmor: true, isConsumable: false, isTool: false,
    defense: 2, value: 30, color: '#8b4513', description: 'Basic protection for adventurers', rarity: 'common'
  },
  [ItemType.CHAIN_ARMOR]: {
    name: 'Chain Mail', stackSize: 1, isWeapon: false, isArmor: true, isConsumable: false, isTool: false,
    defense: 4, value: 100, color: '#c0c0c0', description: 'Interlocked metal rings provide good defense', rarity: 'uncommon'
  },
  [ItemType.PLATE_ARMOR]: {
    name: 'Plate Armor', stackSize: 1, isWeapon: false, isArmor: true, isConsumable: false, isTool: false,
    defense: 8, value: 300, color: '#708090', description: 'Heavy armor offering excellent protection', rarity: 'rare'
  },
  [ItemType.MAGIC_ROBE]: {
    name: 'Enchanted Robe', stackSize: 1, isWeapon: false, isArmor: true, isConsumable: false, isTool: false,
    defense: 3, value: 200, color: '#4b0082', description: 'Magical garment that enhances mana', rarity: 'rare'
  },
  [ItemType.DRAGON_SCALE]: {
    name: 'Dragon Scale Armor', stackSize: 1, isWeapon: false, isArmor: true, isConsumable: false, isTool: false,
    defense: 12, value: 800, color: '#dc143c', description: 'Armor crafted from dragon scales', rarity: 'epic'
  },
  [ItemType.DEMON_ARMOR]: {
    name: 'Demon Armor', stackSize: 1, isWeapon: false, isArmor: true, isConsumable: false, isTool: false,
    defense: 10, value: 600, color: '#8b0000', description: 'Dark armor forged in the depths of hell', rarity: 'epic'
  },
  [ItemType.HOLY_ARMOR]: {
    name: 'Holy Armor', stackSize: 1, isWeapon: false, isArmor: true, isConsumable: false, isTool: false,
    defense: 11, value: 900, color: '#ffd700', description: 'Blessed armor that protects against evil', rarity: 'epic'
  },

  // Magic Items
  [ItemType.SPELL_SCROLL]: {
    name: 'Spell Scroll', stackSize: 10, isWeapon: false, isArmor: false, isConsumable: true, isTool: false,
    value: 50, color: '#dda0dd', description: 'Contains a magical spell', rarity: 'uncommon'
  },
  [ItemType.MAGIC_ORB]: {
    name: 'Magic Orb', stackSize: 5, isWeapon: false, isArmor: false, isConsumable: false, isTool: false,
    value: 100, color: '#9370db', description: 'Glowing orb filled with magical energy', rarity: 'rare'
  },
  [ItemType.RUNE_STONE]: {
    name: 'Rune Stone', stackSize: 20, isWeapon: false, isArmor: false, isConsumable: false, isTool: false,
    value: 25, color: '#708090', description: 'Stone carved with ancient runes', rarity: 'uncommon'
  },
  [ItemType.CRYSTAL_SHARD]: {
    name: 'Crystal Shard', stackSize: 50, isWeapon: false, isArmor: false, isConsumable: false, isTool: false,
    value: 15, color: '#87ceeb', description: 'Fragment of a magical crystal', rarity: 'common'
  },
  [ItemType.SOUL_GEM]: {
    name: 'Soul Gem', stackSize: 1, isWeapon: false, isArmor: false, isConsumable: false, isTool: false,
    value: 500, color: '#9400d3', description: 'Gem that contains a trapped soul', rarity: 'legendary'
  },

  // Bombs & Explosives
  [ItemType.BOMB]: {
    name: 'Bomb', stackSize: 10, isWeapon: false, isArmor: false, isConsumable: true, isTool: false,
    value: 30, color: '#2f4f4f', description: 'Explosive device that destroys terrain', rarity: 'uncommon'
  },
  [ItemType.FIRE_BOMB]: {
    name: 'Fire Bomb', stackSize: 10, isWeapon: false, isArmor: false, isConsumable: true, isTool: false,
    value: 40, color: '#ff4500', description: 'Explosive that creates a fiery blast', rarity: 'uncommon'
  },
  [ItemType.ICE_BOMB]: {
    name: 'Ice Bomb', stackSize: 10, isWeapon: false, isArmor: false, isConsumable: true, isTool: false,
    value: 40, color: '#87ceeb', description: 'Explosive that freezes enemies', rarity: 'uncommon'
  },
  [ItemType.POISON_BOMB]: {
    name: 'Poison Bomb', stackSize: 10, isWeapon: false, isArmor: false, isConsumable: true, isTool: false,
    value: 45, color: '#32cd32', description: 'Explosive that creates a toxic cloud', rarity: 'rare'
  },
  [ItemType.HOLY_GRENADE]: {
    name: 'Holy Grenade', stackSize: 5, isWeapon: false, isArmor: false, isConsumable: true, isTool: false,
    value: 100, color: '#ffd700', description: 'Blessed explosive that devastates evil', rarity: 'epic'
  },

  // Tools
  [ItemType.PICKAXE]: {
    name: 'Pickaxe', stackSize: 1, isWeapon: false, isArmor: false, isConsumable: false, isTool: true,
    damage: 2, value: 40, color: '#8b4513', description: 'Useful for breaking through walls', rarity: 'common'
  },
  [ItemType.TORCH]: {
    name: 'Torch', stackSize: 64, isWeapon: false, isArmor: false, isConsumable: false, isTool: true,
    value: 2, color: '#ffa500', description: 'Lights up dark areas', rarity: 'common'
  },
  [ItemType.ROPE]: {
    name: 'Rope', stackSize: 10, isWeapon: false, isArmor: false, isConsumable: false, isTool: true,
    value: 5, color: '#daa520', description: 'Useful for climbing and traversal', rarity: 'common'
  },
  [ItemType.LOCKPICK]: {
    name: 'Lockpick', stackSize: 20, isWeapon: false, isArmor: false, isConsumable: false, isTool: true,
    value: 10, color: '#c0c0c0', description: 'Opens locked doors and chests', rarity: 'common'
  },
  [ItemType.TELEPORT_SCROLL]: {
    name: 'Teleport Scroll', stackSize: 5, isWeapon: false, isArmor: false, isConsumable: true, isTool: false,
    value: 75, color: '#9370db', description: 'Instantly teleports you to a safe location', rarity: 'rare'
  },

  // Consumables
  [ItemType.HEALTH_POTION]: {
    name: 'Health Potion', stackSize: 10, isWeapon: false, isArmor: false, isConsumable: true, isTool: false,
    healing: 25, value: 20, color: '#dc143c', description: 'Restores health when consumed', rarity: 'common'
  },
  [ItemType.MANA_POTION]: {
    name: 'Mana Potion', stackSize: 10, isWeapon: false, isArmor: false, isConsumable: true, isTool: false,
    manaRestore: 30, value: 25, color: '#0000ff', description: 'Restores magical energy', rarity: 'common'
  },
  [ItemType.STRENGTH_POTION]: {
    name: 'Strength Potion', stackSize: 5, isWeapon: false, isArmor: false, isConsumable: true, isTool: false,
    value: 50, color: '#ff6347', description: 'Temporarily increases attack power', rarity: 'uncommon'
  },
  [ItemType.SPEED_POTION]: {
    name: 'Speed Potion', stackSize: 5, isWeapon: false, isArmor: false, isConsumable: true, isTool: false,
    value: 45, color: '#00ff00', description: 'Temporarily increases movement speed', rarity: 'uncommon'
  },
  [ItemType.INVISIBILITY_POTION]: {
    name: 'Invisibility Potion', stackSize: 3, isWeapon: false, isArmor: false, isConsumable: true, isTool: false,
    value: 100, color: '#f0f8ff', description: 'Makes you invisible to enemies', rarity: 'rare'
  },
  [ItemType.BREAD]: {
    name: 'Bread', stackSize: 20, isWeapon: false, isArmor: false, isConsumable: true, isTool: false,
    healing: 5, value: 3, color: '#daa520', description: 'Simple food that restores a little health', rarity: 'common'
  },
  [ItemType.CHEESE]: {
    name: 'Cheese', stackSize: 15, isWeapon: false, isArmor: false, isConsumable: true, isTool: false,
    healing: 8, value: 5, color: '#ffff00', description: 'Nutritious food found in dungeons', rarity: 'common'
  },
  [ItemType.DRAGON_MEAT]: {
    name: 'Dragon Meat', stackSize: 5, isWeapon: false, isArmor: false, isConsumable: true, isTool: false,
    healing: 50, value: 200, color: '#dc143c', description: 'Rare delicacy that greatly restores health', rarity: 'epic'
  },

  // Treasures
  [ItemType.GOLD_COIN]: {
    name: 'Gold Coin', stackSize: 999, isWeapon: false, isArmor: false, isConsumable: false, isTool: false,
    value: 1, color: '#ffd700', description: 'Standard currency of the realm', rarity: 'common'
  },
  [ItemType.SILVER_COIN]: {
    name: 'Silver Coin', stackSize: 999, isWeapon: false, isArmor: false, isConsumable: false, isTool: false,
    value: 10, color: '#c0c0c0', description: 'Valuable silver currency', rarity: 'uncommon'
  },
  [ItemType.GEM]: {
    name: 'Precious Gem', stackSize: 50, isWeapon: false, isArmor: false, isConsumable: false, isTool: false,
    value: 100, color: '#ff1493', description: 'Rare gemstone worth a fortune', rarity: 'rare'
  },
  [ItemType.ARTIFACT]: {
    name: 'Ancient Artifact', stackSize: 1, isWeapon: false, isArmor: false, isConsumable: false, isTool: false,
    value: 1000, color: '#9370db', description: 'Mysterious relic from a bygone era', rarity: 'legendary'
  },
  [ItemType.KEY]: {
    name: 'Dungeon Key', stackSize: 10, isWeapon: false, isArmor: false, isConsumable: false, isTool: true,
    value: 50, color: '#ffd700', description: 'Opens locked doors in the dungeon', rarity: 'uncommon'
  },
  [ItemType.DIVINE_RELIC]: {
    name: 'Divine Relic', stackSize: 1, isWeapon: false, isArmor: false, isConsumable: false, isTool: false,
    value: 2000, color: '#ffd700', description: 'Sacred artifact blessed by the gods', rarity: 'legendary'
  },
  [ItemType.CURSED_ARTIFACT]: {
    name: 'Cursed Artifact', stackSize: 1, isWeapon: false, isArmor: false, isConsumable: false, isTool: false,
    value: 800, color: '#8b0000', description: 'Dark relic tainted by evil magic', rarity: 'epic'
  },

  // Materials
  [ItemType.STONE]: {
    name: 'Stone', stackSize: 64, isWeapon: false, isArmor: false, isConsumable: false, isTool: false,
    value: 1, color: '#696969', description: 'Common building material', rarity: 'common'
  },
  [ItemType.IRON_ORE]: {
    name: 'Iron Ore', stackSize: 64, isWeapon: false, isArmor: false, isConsumable: false, isTool: false,
    value: 5, color: '#cd853f', description: 'Raw iron that can be smelted', rarity: 'common'
  },
  [ItemType.WOOD]: {
    name: 'Wood', stackSize: 64, isWeapon: false, isArmor: false, isConsumable: false, isTool: false,
    value: 2, color: '#8b4513', description: 'Useful crafting material', rarity: 'common'
  },
  [ItemType.DEMON_BONE]: {
    name: 'Demon Bone', stackSize: 20, isWeapon: false, isArmor: false, isConsumable: false, isTool: false,
    value: 50, color: '#2f4f4f', description: 'Bone from a defeated demon', rarity: 'rare'
  },
  [ItemType.ANGEL_FEATHER]: {
    name: 'Angel Feather', stackSize: 10, isWeapon: false, isArmor: false, isConsumable: false, isTool: false,
    value: 100, color: '#f0f8ff', description: 'Pure white feather from a celestial being', rarity: 'epic'
  },
  [ItemType.DRAGON_SCALE_MAT]: {
    name: 'Dragon Scale', stackSize: 20, isWeapon: false, isArmor: false, isConsumable: false, isTool: false,
    value: 75, color: '#dc143c', description: 'Scale from a mighty dragon', rarity: 'rare'
  },

  // Offerings
  [ItemType.INCENSE]: {
    name: 'Incense', stackSize: 20, isWeapon: false, isArmor: false, isConsumable: false, isTool: false,
    value: 10, color: '#dda0dd', description: 'Fragrant offering for the gods', rarity: 'common'
  },
  [ItemType.CANDLE]: {
    name: 'Candle', stackSize: 30, isWeapon: false, isArmor: false, isConsumable: false, isTool: false,
    value: 5, color: '#fffacd', description: 'Sacred candle for temple rituals', rarity: 'common'
  },
  [ItemType.HOLY_WATER]: {
    name: 'Holy Water', stackSize: 10, isWeapon: false, isArmor: false, isConsumable: false, isTool: false,
    value: 25, color: '#87ceeb', description: 'Water blessed by priests', rarity: 'uncommon'
  },
  [ItemType.BLOOD_VIAL]: {
    name: 'Blood Vial', stackSize: 10, isWeapon: false, isArmor: false, isConsumable: false, isTool: false,
    value: 30, color: '#8b0000', description: 'Vial of blood for dark rituals', rarity: 'uncommon'
  },
  [ItemType.FLOWERS]: {
    name: 'Flowers', stackSize: 50, isWeapon: false, isArmor: false, isConsumable: false, isTool: false,
    value: 3, color: '#ff69b4', description: 'Beautiful flowers as offerings', rarity: 'common'
  },
  [ItemType.WINE]: {
    name: 'Wine', stackSize: 10, isWeapon: false, isArmor: false, isConsumable: true, isTool: false,
    healing: 10, value: 15, color: '#800080', description: 'Fine wine for celebrations and offerings', rarity: 'common'
  }
};