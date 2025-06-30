import { Block, BlockType, WorldArea, AreaType, Temple, God } from '../types/Game';

export class OverworldGenerator {
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  generate(): { world: Block[][]; areas: WorldArea[]; temples: Temple[] } {
    const world: Block[][] = [];
    const areas: WorldArea[] = [];
    const temples: Temple[] = [];
    
    // Initialize with grass
    for (let x = 0; x < this.width; x++) {
      world[x] = [];
      for (let y = 0; y < this.height; y++) {
        world[x][y] = { type: BlockType.GRASS, x, y };
      }
    }

    // Generate terrain features
    this.generateTerrain(world);
    
    // Generate starting town
    const townArea = this.generateTown(world, 20, 20);
    areas.push(townArea);
    
    // Generate temples for each god
    const templePositions = [
      { x: 60, y: 30, godId: 'solaris' },
      { x: 30, y: 60, godId: 'mortis' },
      { x: 90, y: 40, godId: 'tempest' },
      { x: 40, y: 90, godId: 'terra' },
      { x: 80, y: 80, godId: 'chaos' },
      { x: 50, y: 50, godId: 'forge' }
    ];
    
    templePositions.forEach(pos => {
      const temple = this.generateTemple(world, pos.x, pos.y, pos.godId);
      temples.push(temple);
      
      const templeArea: WorldArea = {
        id: `temple_${pos.godId}`,
        name: `Temple of ${pos.godId}`,
        x: pos.x - 5,
        y: pos.y - 5,
        width: 10,
        height: 10,
        type: AreaType.TEMPLE,
        level: 1,
        discovered: false,
        description: `Sacred temple dedicated to ${pos.godId}`
      };
      areas.push(templeArea);
    });
    
    // Generate dungeon entrances
    const dungeonPositions = [
      { x: 70, y: 20, level: 1, name: 'Goblin Caves' },
      { x: 25, y: 75, level: 3, name: 'Ancient Crypt' },
      { x: 85, y: 60, level: 5, name: 'Dragon Lair' },
      { x: 15, y: 40, level: 7, name: 'Shadow Realm' }
    ];
    
    dungeonPositions.forEach(pos => {
      this.generateDungeonEntrance(world, pos.x, pos.y);
      
      const dungeonArea: WorldArea = {
        id: `dungeon_${pos.level}`,
        name: pos.name,
        x: pos.x - 2,
        y: pos.y - 2,
        width: 4,
        height: 4,
        type: AreaType.DUNGEON,
        level: pos.level,
        discovered: false,
        description: `A dangerous dungeon (Level ${pos.level})`
      };
      areas.push(dungeonArea);
    });
    
    // Add wilderness areas
    const wildernessAreas = [
      { x: 10, y: 10, name: 'Dark Forest' },
      { x: 90, y: 10, name: 'Crystal Mountains' },
      { x: 10, y: 90, name: 'Cursed Swamp' },
      { x: 90, y: 90, name: 'Holy Plains' }
    ];
    
    wildernessAreas.forEach(area => {
      const wildArea: WorldArea = {
        id: `wild_${area.name.toLowerCase().replace(' ', '_')}`,
        name: area.name,
        x: area.x,
        y: area.y,
        width: 15,
        height: 15,
        type: AreaType.WILDERNESS,
        level: 2,
        discovered: false,
        description: `Dangerous wilderness area`
      };
      areas.push(wildArea);
    });

    return { world, areas, temples };
  }

  private generateTerrain(world: Block[][]): void {
    // Add trees randomly
    for (let i = 0; i < 200; i++) {
      const x = Math.floor(Math.random() * this.width);
      const y = Math.floor(Math.random() * this.height);
      if (world[x][y].type === BlockType.GRASS) {
        world[x][y] = { type: BlockType.TREE, x, y };
      }
    }
    
    // Add rocks
    for (let i = 0; i < 100; i++) {
      const x = Math.floor(Math.random() * this.width);
      const y = Math.floor(Math.random() * this.height);
      if (world[x][y].type === BlockType.GRASS) {
        world[x][y] = { type: BlockType.ROCK, x, y };
      }
    }
    
    // Add water areas
    for (let i = 0; i < 5; i++) {
      const centerX = Math.floor(Math.random() * this.width);
      const centerY = Math.floor(Math.random() * this.height);
      const radius = 3 + Math.floor(Math.random() * 4);
      
      for (let x = centerX - radius; x <= centerX + radius; x++) {
        for (let y = centerY - radius; y <= centerY + radius; y++) {
          if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            if (distance <= radius) {
              world[x][y] = { type: BlockType.WATER, x, y };
            }
          }
        }
      }
    }
  }

  private generateTown(world: Block[][], centerX: number, centerY: number): WorldArea {
    const townSize = 12;
    
    // Clear area for town
    for (let x = centerX - townSize; x <= centerX + townSize; x++) {
      for (let y = centerY - townSize; y <= centerY + townSize; y++) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
          world[x][y] = { type: BlockType.FLOOR, x, y };
        }
      }
    }
    
    // Add town buildings
    const buildings = [
      { x: centerX - 8, y: centerY - 8, type: BlockType.INN, name: 'Inn' },
      { x: centerX + 5, y: centerY - 6, type: BlockType.SHOP, name: 'Shop' },
      { x: centerX - 3, y: centerY + 7, type: BlockType.BLACKSMITH, name: 'Blacksmith' },
      { x: centerX + 8, y: centerY + 8, type: BlockType.TEMPLE, name: 'Town Temple' }
    ];
    
    buildings.forEach(building => {
      if (building.x >= 0 && building.x < this.width && 
          building.y >= 0 && building.y < this.height) {
        world[building.x][building.y] = { type: building.type, x: building.x, y: building.y };
      }
    });
    
    // Add town walls
    for (let x = centerX - townSize; x <= centerX + townSize; x++) {
      if (x >= 0 && x < this.width) {
        if (centerY - townSize >= 0) world[x][centerY - townSize] = { type: BlockType.WALL, x, y: centerY - townSize };
        if (centerY + townSize < this.height) world[x][centerY + townSize] = { type: BlockType.WALL, x, y: centerY + townSize };
      }
    }
    
    for (let y = centerY - townSize; y <= centerY + townSize; y++) {
      if (y >= 0 && y < this.height) {
        if (centerX - townSize >= 0) world[centerX - townSize][y] = { type: BlockType.WALL, x: centerX - townSize, y };
        if (centerX + townSize < this.width) world[centerX + townSize][y] = { type: BlockType.WALL, x: centerX + townSize, y };
      }
    }
    
    // Add town entrance
    world[centerX][centerY - townSize] = { type: BlockType.TOWN_ENTRANCE, x: centerX, y: centerY - townSize };

    return {
      id: 'starting_town',
      name: 'Newbie Town',
      x: centerX - townSize,
      y: centerY - townSize,
      width: townSize * 2,
      height: townSize * 2,
      type: AreaType.TOWN,
      level: 0,
      discovered: true,
      description: 'A peaceful town where new adventurers begin their journey'
    };
  }

  private generateTemple(world: Block[][], centerX: number, centerY: number, godId: string): Temple {
    const templeSize = 6;
    
    // Clear area for temple
    for (let x = centerX - templeSize; x <= centerX + templeSize; x++) {
      for (let y = centerY - templeSize; y <= centerY + templeSize; y++) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
          world[x][y] = { type: BlockType.FLOOR, x, y };
        }
      }
    }
    
    // Add temple walls
    for (let x = centerX - templeSize; x <= centerX + templeSize; x++) {
      if (x >= 0 && x < this.width) {
        if (centerY - templeSize >= 0) world[x][centerY - templeSize] = { type: BlockType.WALL, x, y: centerY - templeSize };
        if (centerY + templeSize < this.height) world[x][centerY + templeSize] = { type: BlockType.WALL, x, y: centerY + templeSize };
      }
    }
    
    for (let y = centerY - templeSize; y <= centerY + templeSize; y++) {
      if (y >= 0 && y < this.height) {
        if (centerX - templeSize >= 0) world[centerX - templeSize][y] = { type: BlockType.WALL, x: centerX - templeSize, y };
        if (centerX + templeSize < this.width) world[centerX + templeSize][y] = { type: BlockType.WALL, x: centerX + templeSize, y };
      }
    }
    
    // Add temple entrance
    world[centerX][centerY - templeSize] = { type: BlockType.TEMPLE_ENTRANCE, x: centerX, y: centerY - templeSize };
    
    // Add altar in center
    world[centerX][centerY] = { type: BlockType.ALTAR, x: centerX, y: centerY };
    
    // Add torches
    world[centerX - 2][centerY - 2] = { type: BlockType.TORCH, x: centerX - 2, y: centerY - 2 };
    world[centerX + 2][centerY - 2] = { type: BlockType.TORCH, x: centerX + 2, y: centerY - 2 };
    world[centerX - 2][centerY + 2] = { type: BlockType.TORCH, x: centerX - 2, y: centerY + 2 };
    world[centerX + 2][centerY + 2] = { type: BlockType.TORCH, x: centerX + 2, y: centerY + 2 };

    return {
      id: `temple_${godId}`,
      godId,
      x: centerX,
      y: centerY,
      name: `Temple of ${godId}`,
      level: 1,
      hasAltar: true,
      hasPriest: true,
      services: ['healing', 'blessing', 'donation'] as any
    };
  }

  private generateDungeonEntrance(world: Block[][], x: number, y: number): void {
    // Clear small area
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const newX = x + dx;
        const newY = y + dy;
        if (newX >= 0 && newX < this.width && newY >= 0 && newY < this.height) {
          world[newX][newY] = { type: BlockType.DIRT, x: newX, y: newY };
        }
      }
    }
    
    // Add dungeon entrance
    world[x][y] = { type: BlockType.DUNGEON_ENTRANCE, x, y };
    
    // Add some rocks around it
    const rockPositions = [
      { x: x - 2, y: y - 1 },
      { x: x + 2, y: y - 1 },
      { x: x - 1, y: y + 2 },
      { x: x + 1, y: y + 2 }
    ];
    
    rockPositions.forEach(pos => {
      if (pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height) {
        world[pos.x][pos.y] = { type: BlockType.ROCK, x: pos.x, y: pos.y };
      }
    });
  }
}