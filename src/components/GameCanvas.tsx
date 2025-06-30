import React, { useRef, useEffect } from 'react';
import { GameState, BlockType, Position } from '../types/Game';
import { BLOCK_PROPERTIES } from '../utils/BlockProperties';

interface GameCanvasProps {
  gameState: GameState;
  onBlockClick: (x: number, y: number, isRightClick: boolean) => void;
  onBuildingAction?: (start: Position, end: Position, isRightClick: boolean) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  onBlockClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const BLOCK_SIZE = 32;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 120; // Leave space for HUD

    const render = () => {
      // Clear canvas with dark background
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate visible area
      const startX = Math.floor(gameState.camera.x / BLOCK_SIZE);
      const endX = Math.ceil((gameState.camera.x + canvas.width) / BLOCK_SIZE);
      const startY = Math.floor(gameState.camera.y / BLOCK_SIZE);
      const endY = Math.ceil((gameState.camera.y + canvas.height) / BLOCK_SIZE);

      // Render world
      for (let x = Math.max(0, startX); x < Math.min(gameState.world.length, endX); x++) {
        for (let y = Math.max(0, startY); y < Math.min(gameState.world[x]?.length || 0, endY); y++) {
          const block = gameState.world[x]?.[y];
          if (!block || block.type === BlockType.AIR) continue;

          const screenX = x * BLOCK_SIZE - gameState.camera.x;
          const screenY = y * BLOCK_SIZE - gameState.camera.y;

          const blockProps = BLOCK_PROPERTIES[block.type];
          
          // Draw block
          ctx.fillStyle = blockProps.color;
          ctx.fillRect(screenX, screenY, BLOCK_SIZE, BLOCK_SIZE);

          // Add texture and special effects based on block type
          addBlockTexture(ctx, screenX, screenY, BLOCK_SIZE, block.type);

          // Block border for solid blocks
          if (blockProps.solid) {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX, screenY, BLOCK_SIZE, BLOCK_SIZE);
          }
        }
      }

      // Render mobs
      gameState.mobs.forEach(mob => {
        const screenX = mob.x * BLOCK_SIZE - gameState.camera.x;
        const screenY = mob.y * BLOCK_SIZE - gameState.camera.y;
        
        // Don't render if off screen
        if (screenX < -BLOCK_SIZE || screenX > canvas.width + BLOCK_SIZE ||
            screenY < -BLOCK_SIZE || screenY > canvas.height + BLOCK_SIZE) {
          return;
        }
        
        renderMob(ctx, mob, screenX, screenY, BLOCK_SIZE);
      });

      // Render player
      const playerScreenX = gameState.player.x * BLOCK_SIZE - gameState.camera.x;
      const playerScreenY = gameState.player.y * BLOCK_SIZE - gameState.camera.y;

      renderPlayer(ctx, playerScreenX, playerScreenY, BLOCK_SIZE, gameState.player.health, gameState.player.maxHealth);
    };

    render();
  }, [gameState]);

  const addBlockTexture = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, blockType: BlockType) => {
    switch (blockType) {
      case BlockType.WALL:
        // Stone brick pattern
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
          ctx.strokeRect(x, y + i * 8, size, 8);
          ctx.strokeRect(x + (i % 2) * 16, y + i * 8, 16, 8);
        }
        break;
        
      case BlockType.FLOOR:
        // Stone tile pattern
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, size, size);
        break;
        
      case BlockType.CHEST:
        // Chest details
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 4, y + 8, size - 8, size - 12);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + size/2 - 2, y + size/2 - 2, 4, 4);
        break;
        
      case BlockType.TORCH:
        // Flame effect
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(x + size/2 - 3, y + 4, 6, 8);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + size/2 - 2, y + 6, 4, 4);
        break;
        
      case BlockType.STAIRS_DOWN:
        // Stairs pattern
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(x + i * 8, y + i * 8, size - i * 8, 8);
        }
        break;
        
      case BlockType.STAIRS_UP:
        // Reverse stairs pattern
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(x, y + i * 8, size - i * 8, 8);
        }
        break;
        
      case BlockType.LAVA:
        // Animated lava effect
        const time = Date.now() * 0.01;
        ctx.fillStyle = '#FF6600';
        for (let i = 0; i < 8; i++) {
          const waveY = y + size/2 + Math.sin(time + i) * 4;
          ctx.fillRect(x + i * 4, waveY, 4, size - (waveY - y));
        }
        break;
        
      case BlockType.WATER:
        // Water wave effect
        const waterTime = Date.now() * 0.005;
        ctx.fillStyle = 'rgba(100, 149, 237, 0.7)';
        for (let i = 0; i < 8; i++) {
          const waveY = y + size/2 + Math.sin(waterTime + i * 0.5) * 2;
          ctx.fillRect(x + i * 4, waveY, 4, size - (waveY - y));
        }
        break;
        
      case BlockType.ALTAR:
        // Mystical glow
        ctx.shadowColor = '#9370DB';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#9370DB';
        ctx.fillRect(x + 8, y + 8, size - 16, size - 16);
        ctx.shadowBlur = 0;
        break;
    }
  };

  const renderMob = (ctx: CanvasRenderingContext2D, mob: any, x: number, y: number, size: number) => {
    const colors = {
      goblin: '#228B22',
      orc: '#8B4513',
      skeleton: '#F5F5DC',
      zombie: '#556B2F',
      spider: '#800080',
      bat: '#2F4F4F',
      slime: '#32CD32',
      troll: '#696969',
      dragon: '#DC143C',
      ghost: '#F0F8FF',
      minotaur: '#8B4513',
      demon: '#8B0000'
    };
    
    const color = colors[mob.type as keyof typeof colors] || '#666666';
    
    // Mob body
    ctx.fillStyle = color;
    ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
    
    // Health bar
    if (mob.health < mob.maxHealth) {
      const barWidth = size - 4;
      const barHeight = 4;
      const healthPercent = mob.health / mob.maxHealth;
      
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(x + 2, y - 6, barWidth, barHeight);
      ctx.fillStyle = '#00FF00';
      ctx.fillRect(x + 2, y - 6, barWidth * healthPercent, barHeight);
    }
    
    // Special mob features
    switch (mob.type) {
      case 'spider':
        // Spider legs
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const legX = x + size/2 + Math.cos(angle) * size/3;
          const legY = y + size/2 + Math.sin(angle) * size/3;
          ctx.beginPath();
          ctx.moveTo(x + size/2, y + size/2);
          ctx.lineTo(legX, legY);
          ctx.stroke();
        }
        break;
        
      case 'bat':
        // Wing flap animation
        const flapTime = Date.now() * 0.01;
        const wingSpread = Math.sin(flapTime) * 8 + 12;
        ctx.fillStyle = color;
        ctx.fillRect(x + size/2 - wingSpread/2, y + size/2 - 4, wingSpread, 8);
        break;
        
      case 'ghost':
        // Transparency effect
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = color;
        ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
        ctx.globalAlpha = 1.0;
        break;
        
      case 'dragon':
        // Dragon wings
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(x - 8, y + 8, 16, 16);
        ctx.fillRect(x + size - 8, y + 8, 16, 16);
        break;
    }
    
    // Eyes
    ctx.fillStyle = mob.isHostile ? '#FF0000' : '#FFFFFF';
    ctx.fillRect(x + size/2 - 6, y + size/2 - 4, 3, 3);
    ctx.fillRect(x + size/2 + 3, y + size/2 - 4, 3, 3);
  };

  const renderPlayer = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, health: number, maxHealth: number) => {
    // Player shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + 6, y + size - 2, size - 12, 4);

    // Player body
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(x + 8, y + 8, size - 16, size - 8);

    // Player head
    ctx.fillStyle = '#F4A460';
    ctx.fillRect(x + 10, y, size - 20, 12);

    // Player eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 12, y + 3, 2, 2);
    ctx.fillRect(x + size - 14, y + 3, 2, 2);

    // Health bar above player
    if (health < maxHealth) {
      const barWidth = size;
      const barHeight = 4;
      const healthPercent = health / maxHealth;
      
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(x, y - 8, barWidth, barHeight);
      ctx.fillStyle = '#00FF00';
      ctx.fillRect(x, y - 8, barWidth * healthPercent, barHeight);
    }

    // Player outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 8, y, size - 16, size);
  };

  const getBlockPosition = (clientX: number, clientY: number): Position => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left + gameState.camera.x;
    const y = clientY - rect.top + gameState.camera.y;

    return {
      x: Math.floor(x / BLOCK_SIZE),
      y: Math.floor(y / BLOCK_SIZE)
    };
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getBlockPosition(event.clientX, event.clientY);
    onBlockClick(pos.x, pos.y, event.button === 2);
  };

  return (
    <canvas
      ref={canvasRef}
      className="block cursor-crosshair"
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
};