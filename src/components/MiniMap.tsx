import React from 'react';
import { GameState, BlockType, MobType } from '../types/Game';
import { Map, X } from 'lucide-react';

interface MiniMapProps {
  gameState: GameState;
  onToggle: () => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({ gameState, onToggle }) => {
  if (!gameState.miniMapVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-4 right-4 bg-black/80 text-white p-2 rounded-lg hover:bg-black/90 transition-colors z-30"
      >
        <Map size={20} />
      </button>
    );
  }

  const mapSize = 200;
  const scale = 4;
  const playerX = gameState.player.x;
  const playerY = gameState.player.y;
  
  const startX = Math.max(0, playerX - mapSize / (2 * scale));
  const endX = Math.min(gameState.world.length, playerX + mapSize / (2 * scale));
  const startY = Math.max(0, playerY - mapSize / (2 * scale));
  const endY = Math.min(gameState.world[0]?.length || 0, playerY + mapSize / (2 * scale));

  const getBlockColor = (blockType: BlockType): string => {
    switch (blockType) {
      case BlockType.WALL: return '#4a5568';
      case BlockType.FLOOR: return '#e2e8f0';
      case BlockType.WATER: return '#3182ce';
      case BlockType.LAVA: return '#e53e3e';
      case BlockType.CHEST: return '#d69e2e';
      case BlockType.STAIRS_DOWN: return '#805ad5';
      case BlockType.STAIRS_UP: return '#38b2ac';
      case BlockType.ALTAR: return '#9f7aea';
      case BlockType.PORTAL: return '#ed64a6';
      case BlockType.SHRINE: return '#f6ad55';
      case BlockType.EVIL_ALTAR: return '#c53030';
      case BlockType.MAGIC_CIRCLE: return '#667eea';
      default: return '#1a202c';
    }
  };

  const getMobColor = (mobType: MobType): string => {
    switch (mobType) {
      case MobType.DEMON:
      case MobType.DEMON_LORD:
      case MobType.EVIL_GOD:
        return '#c53030';
      case MobType.ANGEL:
      case MobType.ARCH_ANGEL:
      case MobType.DIVINE_AVATAR:
        return '#ffd700';
      case MobType.DRAGON:
      case MobType.ANCIENT_DRAGON:
        return '#9f1239';
      case MobType.LICH:
      case MobType.DEATH_KNIGHT:
        return '#6b46c1';
      default:
        return '#f56565';
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-black/90 border border-gray-600 rounded-lg p-4 z-30">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-semibold text-sm">Mini Map</h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      
      <div 
        className="relative border border-gray-500 bg-gray-900"
        style={{ width: mapSize, height: mapSize }}
      >
        {/* Render world blocks */}
        {Array.from({ length: Math.ceil((endX - startX) / scale) }, (_, i) => {
          const worldX = Math.floor(startX + i * scale);
          return Array.from({ length: Math.ceil((endY - startY) / scale) }, (_, j) => {
            const worldY = Math.floor(startY + j * scale);
            const block = gameState.world[worldX]?.[worldY];
            
            if (!block || block.type === BlockType.AIR) return null;
            
            const mapX = ((worldX - startX) / (endX - startX)) * mapSize;
            const mapY = ((worldY - startY) / (endY - startY)) * mapSize;
            
            return (
              <div
                key={`${worldX}-${worldY}`}
                className="absolute"
                style={{
                  left: mapX,
                  top: mapY,
                  width: scale,
                  height: scale,
                  backgroundColor: getBlockColor(block.type),
                  opacity: 0.8
                }}
              />
            );
          });
        })}
        
        {/* Render mobs */}
        {gameState.mobs.map(mob => {
          if (mob.x < startX || mob.x > endX || mob.y < startY || mob.y > endY) return null;
          
          const mapX = ((mob.x - startX) / (endX - startX)) * mapSize;
          const mapY = ((mob.y - startY) / (endY - startY)) * mapSize;
          
          return (
            <div
              key={mob.id}
              className="absolute rounded-full"
              style={{
                left: mapX - 2,
                top: mapY - 2,
                width: 4,
                height: 4,
                backgroundColor: getMobColor(mob.type),
                border: mob.isBoss ? '1px solid #ffd700' : 'none',
                boxShadow: mob.isBoss ? '0 0 4px #ffd700' : 'none'
              }}
            />
          );
        })}
        
        {/* Render explosions */}
        {gameState.explosions.map(explosion => {
          if (explosion.x < startX || explosion.x > endX || explosion.y < startY || explosion.y > endY) return null;
          
          const mapX = ((explosion.x - startX) / (endX - startX)) * mapSize;
          const mapY = ((explosion.y - startY) / (endY - startY)) * mapSize;
          
          return (
            <div
              key={explosion.id}
              className="absolute rounded-full animate-ping"
              style={{
                left: mapX - explosion.radius,
                top: mapY - explosion.radius,
                width: explosion.radius * 2,
                height: explosion.radius * 2,
                backgroundColor: explosion.type === 'fire' ? '#f56565' : 
                               explosion.type === 'ice' ? '#63b3ed' :
                               explosion.type === 'holy' ? '#ffd700' :
                               explosion.type === 'dark' ? '#805ad5' : '#a0aec0',
                opacity: 0.6
              }}
            />
          );
        })}
        
        {/* Player position */}
        <div
          className="absolute rounded-full bg-green-400 border-2 border-white animate-pulse"
          style={{
            left: ((playerX - startX) / (endX - startX)) * mapSize - 3,
            top: ((playerY - startY) / (endY - startY)) * mapSize - 3,
            width: 6,
            height: 6
          }}
        />
        
        {/* Compass */}
        <div className="absolute top-1 left-1 text-white text-xs">
          <div className="bg-black/50 rounded px-1">N</div>
        </div>
      </div>
      
      {/* Area info */}
      <div className="mt-2 text-xs text-gray-300">
        <div>Area: {gameState.currentArea || 'Unknown'}</div>
        <div>Level: {gameState.currentDungeon?.level || 'N/A'}</div>
        <div>Mobs: {gameState.mobs.length}</div>
      </div>
    </div>
  );
};