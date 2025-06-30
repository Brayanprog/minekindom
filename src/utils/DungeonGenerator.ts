import { Block, BlockType, DungeonRoom, RoomType, Dungeon, DungeonTheme } from '../types/Game';

export class DungeonGenerator {
  private width: number;
  private height: number;
  private level: number;

  constructor(width: number, height: number, level: number) {
    this.width = width;
    this.height = height;
    this.level = level;
  }

  generate(): { world: Block[][]; dungeon: Dungeon } {
    const world: Block[][] = [];
    
    // Initialize with walls
    for (let x = 0; x < this.width; x++) {
      world[x] = [];
      for (let y = 0; y < this.height; y++) {
        world[x][y] = { type: BlockType.WALL, x, y };
      }
    }

    const theme = this.getDungeonTheme();
    const rooms = this.generateRooms();
    const dungeon: Dungeon = {
      level: this.level,
      width: this.width,
      height: this.height,
      rooms,
      difficulty: this.level,
      theme
    };

    // Carve out rooms
    rooms.forEach(room => {
      this.carveRoom(world, room);
    });

    // Connect rooms with corridors
    this.connectRooms(world, rooms);

    // Add special features
    this.addSpecialFeatures(world, rooms, theme);

    // Add entrance and exit
    this.addEntranceAndExit(world, rooms);

    return { world, dungeon };
  }

  private getDungeonTheme(): DungeonTheme {
    const themes = Object.values(DungeonTheme);
    if (this.level <= 3) return DungeonTheme.CAVE;
    if (this.level <= 6) return DungeonTheme.CRYPT;
    if (this.level <= 9) return DungeonTheme.CASTLE;
    if (this.level <= 12) return DungeonTheme.MINE;
    if (this.level <= 15) return DungeonTheme.TEMPLE;
    return DungeonTheme.HELL;
  }

  private generateRooms(): DungeonRoom[] {
    const rooms: DungeonRoom[] = [];
    const numRooms = 8 + Math.floor(this.level / 2);
    const maxAttempts = numRooms * 10;
    let attempts = 0;

    while (rooms.length < numRooms && attempts < maxAttempts) {
      const width = 6 + Math.floor(Math.random() * 8);
      const height = 6 + Math.floor(Math.random() * 8);
      const x = Math.floor(Math.random() * (this.width - width - 2)) + 1;
      const y = Math.floor(Math.random() * (this.height - height - 2)) + 1;

      const newRoom: DungeonRoom = {
        id: `room_${rooms.length}`,
        x, y, width, height,
        type: this.getRoomType(rooms.length, numRooms),
        connected: false,
        hasChest: Math.random() < 0.3,
        hasTrap: Math.random() < 0.2,
        mobCount: this.getMobCount()
      };

      // Check for overlap
      if (!this.roomOverlaps(newRoom, rooms)) {
        rooms.push(newRoom);
      }

      attempts++;
    }

    return rooms;
  }

  private getRoomType(index: number, total: number): RoomType {
    if (index === 0) return RoomType.ENTRANCE;
    if (index === total - 1) return RoomType.EXIT;
    if (Math.random() < 0.1) return RoomType.TREASURE;
    if (Math.random() < 0.05) return RoomType.BOSS;
    if (Math.random() < 0.08) return RoomType.SHRINE;
    return RoomType.NORMAL;
  }

  private getMobCount(): number {
    const base = 1 + Math.floor(this.level / 3);
    return base + Math.floor(Math.random() * 3);
  }

  private roomOverlaps(room: DungeonRoom, existingRooms: DungeonRoom[]): boolean {
    return existingRooms.some(existing => 
      room.x < existing.x + existing.width + 2 &&
      room.x + room.width + 2 > existing.x &&
      room.y < existing.y + existing.height + 2 &&
      room.y + room.height + 2 > existing.y
    );
  }

  private carveRoom(world: Block[][], room: DungeonRoom): void {
    for (let x = room.x; x < room.x + room.width; x++) {
      for (let y = room.y; y < room.y + room.height; y++) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
          world[x][y] = { type: BlockType.FLOOR, x, y };
        }
      }
    }
  }

  private connectRooms(world: Block[][], rooms: DungeonRoom[]): void {
    // Connect each room to the next one
    for (let i = 0; i < rooms.length - 1; i++) {
      const roomA = rooms[i];
      const roomB = rooms[i + 1];
      
      this.createCorridor(world, 
        roomA.x + Math.floor(roomA.width / 2),
        roomA.y + Math.floor(roomA.height / 2),
        roomB.x + Math.floor(roomB.width / 2),
        roomB.y + Math.floor(roomB.height / 2)
      );
      
      roomA.connected = true;
      roomB.connected = true;
    }

    // Add some additional connections for complexity
    for (let i = 0; i < Math.floor(rooms.length / 3); i++) {
      const roomA = rooms[Math.floor(Math.random() * rooms.length)];
      const roomB = rooms[Math.floor(Math.random() * rooms.length)];
      
      if (roomA !== roomB) {
        this.createCorridor(world,
          roomA.x + Math.floor(roomA.width / 2),
          roomA.y + Math.floor(roomA.height / 2),
          roomB.x + Math.floor(roomB.width / 2),
          roomB.y + Math.floor(roomB.height / 2)
        );
      }
    }
  }

  private createCorridor(world: Block[][], x1: number, y1: number, x2: number, y2: number): void {
    let currentX = x1;
    let currentY = y1;

    // Move horizontally first
    while (currentX !== x2) {
      if (currentX >= 0 && currentX < this.width && currentY >= 0 && currentY < this.height) {
        world[currentX][currentY] = { type: BlockType.FLOOR, x: currentX, y: currentY };
      }
      currentX += currentX < x2 ? 1 : -1;
    }

    // Then move vertically
    while (currentY !== y2) {
      if (currentX >= 0 && currentX < this.width && currentY >= 0 && currentY < this.height) {
        world[currentX][currentY] = { type: BlockType.FLOOR, x: currentX, y: currentY };
      }
      currentY += currentY < y2 ? 1 : -1;
    }
  }

  private addSpecialFeatures(world: Block[][], rooms: DungeonRoom[], theme: DungeonTheme): void {
    rooms.forEach(room => {
      // Add chests
      if (room.hasChest) {
        const chestX = room.x + 1 + Math.floor(Math.random() * (room.width - 2));
        const chestY = room.y + 1 + Math.floor(Math.random() * (room.height - 2));
        world[chestX][chestY] = { type: BlockType.CHEST, x: chestX, y: chestY };
      }

      // Add torches for lighting
      if (Math.random() < 0.7) {
        const torchX = room.x + Math.floor(Math.random() * room.width);
        const torchY = room.y + Math.floor(Math.random() * room.height);
        if (world[torchX][torchY].type === BlockType.FLOOR) {
          world[torchX][torchY] = { type: BlockType.TORCH, x: torchX, y: torchY };
        }
      }

      // Add pillars in larger rooms
      if (room.width > 8 && room.height > 8 && Math.random() < 0.4) {
        const pillarX = room.x + Math.floor(room.width / 2);
        const pillarY = room.y + Math.floor(room.height / 2);
        world[pillarX][pillarY] = { type: BlockType.PILLAR, x: pillarX, y: pillarY };
      }

      // Theme-specific features
      this.addThemeFeatures(world, room, theme);
    });
  }

  private addThemeFeatures(world: Block[][], room: DungeonRoom, theme: DungeonTheme): void {
    switch (theme) {
      case DungeonTheme.TEMPLE:
        if (room.type === RoomType.SHRINE && Math.random() < 0.8) {
          const altarX = room.x + Math.floor(room.width / 2);
          const altarY = room.y + Math.floor(room.height / 2);
          world[altarX][altarY] = { type: BlockType.ALTAR, x: altarX, y: altarY };
        }
        break;
      case DungeonTheme.MINE:
        // Add water pools
        if (Math.random() < 0.3) {
          const waterX = room.x + 1 + Math.floor(Math.random() * (room.width - 2));
          const waterY = room.y + 1 + Math.floor(Math.random() * (room.height - 2));
          world[waterX][waterY] = { type: BlockType.WATER, x: waterX, y: waterY };
        }
        break;
      case DungeonTheme.HELL:
        // Add lava
        if (Math.random() < 0.4) {
          const lavaX = room.x + 1 + Math.floor(Math.random() * (room.width - 2));
          const lavaY = room.y + 1 + Math.floor(Math.random() * (room.height - 2));
          world[lavaX][lavaY] = { type: BlockType.LAVA, x: lavaX, y: lavaY };
        }
        break;
    }
  }

  private addEntranceAndExit(world: Block[][], rooms: DungeonRoom[]): void {
    const entranceRoom = rooms.find(r => r.type === RoomType.ENTRANCE);
    const exitRoom = rooms.find(r => r.type === RoomType.EXIT);

    if (entranceRoom) {
      const stairsX = entranceRoom.x + Math.floor(entranceRoom.width / 2);
      const stairsY = entranceRoom.y + Math.floor(entranceRoom.height / 2);
      world[stairsX][stairsY] = { type: BlockType.STAIRS_UP, x: stairsX, y: stairsY };
    }

    if (exitRoom) {
      const stairsX = exitRoom.x + Math.floor(exitRoom.width / 2);
      const stairsY = exitRoom.y + Math.floor(exitRoom.height / 2);
      world[stairsX][stairsY] = { type: BlockType.STAIRS_DOWN, x: stairsX, y: stairsY };
    }
  }
}