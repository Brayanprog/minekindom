import React from 'react';
import { Item, Player, GameObjective, Achievement, CombatLogEntry } from '../types/Game';
import { ITEM_PROPERTIES } from '../utils/ItemProperties';
import { Heart, Zap, Star, Sword, Shield, Coins } from 'lucide-react';

interface GameHUDProps {
  inventory: Item[];
  selectedSlot: number;
  onSlotSelect: (slot: number) => void;
  gameMode: 'adventure' | 'creative';
  onToggleGameMode: () => void;
  player: Player;
  time: number;
  objectives: GameObjective[];
  achievements: Achievement[];
  combatLog: CombatLogEntry[];
  dungeonLevel: number;
  nearbyInteractable?: {
    type: 'chest' | 'stairs' | 'altar' | 'temple' | 'shop' | 'npc';
    x: number;
    y: number;
    message: string;
  };
  onInteract: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  inventory,
  selectedSlot,
  onSlotSelect,
  gameMode,
  onToggleGameMode,
  player,
  objectives,
  achievements,
  combatLog,
  dungeonLevel,
  nearbyInteractable,
  onInteract
}) => {
  const currentObjective = objectives.find(obj => !obj.completed);
  const recentAchievement = achievements
    .filter(ach => ach.unlocked)
    .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))[0];

  const recentCombatLogs = combatLog.slice(-5).reverse();

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Player Stats */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <div className="bg-black/90 text-white p-4 rounded-lg backdrop-blur-sm border border-gray-600">
          {/* Health */}
          <div className="flex items-center space-x-2 mb-2">
            <Heart className="text-red-500" size={20} />
            <div className="flex-1">
              <div className="w-32 h-3 bg-gray-700 rounded">
                <div 
                  className="h-3 bg-red-500 rounded transition-all"
                  style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-300">{player.health}/{player.maxHealth}</div>
            </div>
          </div>
          
          {/* Mana */}
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="text-blue-500" size={20} />
            <div className="flex-1">
              <div className="w-32 h-3 bg-gray-700 rounded">
                <div 
                  className="h-3 bg-blue-500 rounded transition-all"
                  style={{ width: `${(player.mana / player.maxMana) * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-300">{player.mana}/{player.maxMana}</div>
            </div>
          </div>
          
          {/* Level and Experience */}
          <div className="flex items-center space-x-2 mb-2">
            <Star className="text-yellow-500" size={20} />
            <div className="flex-1">
              <div className="text-sm font-semibold">Level {player.level}</div>
              <div className="w-32 h-2 bg-gray-700 rounded">
                <div 
                  className="h-2 bg-yellow-500 rounded transition-all"
                  style={{ width: `${(player.experience / (player.level * 100)) * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-300">{player.experience}/{player.level * 100} XP</div>
            </div>
          </div>
          
          {/* Combat Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-1">
              <Sword className="text-orange-500" size={16} />
              <span>{player.attack}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="text-gray-400" size={16} />
              <span>{player.defense}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Coins className="text-yellow-400" size={16} />
              <span>{player.gold}</span>
            </div>
            <div className={`text-sm ${
              player.alignment === 'good' ? 'text-yellow-400' :
              player.alignment === 'evil' ? 'text-red-400' : 'text-gray-400'
            }`}>
              {player.alignment}
            </div>
          </div>
          
          {/* Area Info */}
          <div className="mt-2 pt-2 border-t border-gray-600 text-xs">
            <div className="text-purple-400">
              {dungeonLevel > 0 ? `Dungeon Level ${dungeonLevel}` : 'Overworld'}
            </div>
            <div className="text-gray-400">Karma: {player.karma}</div>
          </div>
        </div>
      </div>

      {/* Interaction Prompt */}
      {nearbyInteractable && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="bg-black/90 text-white p-3 rounded-lg backdrop-blur-sm border border-yellow-400 animate-pulse">
            <div className="text-center">
              <div className="text-yellow-400 font-semibold mb-1">{nearbyInteractable.message}</div>
              <button
                onClick={onInteract}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition-colors"
              >
                Interact (E)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Combat Log */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <div className="bg-black/90 text-white p-4 rounded-lg backdrop-blur-sm border border-gray-600 w-80">
          <h3 className="font-semibold mb-2 text-green-400">Activity Log</h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {recentCombatLogs.map((log) => (
              <div 
                key={log.id} 
                className={`text-xs ${
                  log.type === 'damage' ? 'text-red-300' :
                  log.type === 'heal' ? 'text-green-300' :
                  log.type === 'death' ? 'text-yellow-300' :
                  log.type === 'level_up' ? 'text-purple-300' :
                  log.type === 'loot' ? 'text-blue-300' :
                  log.type === 'divine' ? 'text-yellow-300' :
                  log.type === 'interaction' ? 'text-cyan-300' :
                  'text-gray-300'
                }`}
              >
                {log.message}
              </div>
            ))}
            {recentCombatLogs.length === 0 && (
              <div className="text-xs text-gray-500">No recent activity</div>
            )}
          </div>
        </div>
      </div>

      {/* Current Objective */}
      {currentObjective && (
        <div className="absolute bottom-32 right-4 pointer-events-auto">
          <div className="bg-black/90 text-white p-4 rounded-lg backdrop-blur-sm border border-gray-600 max-w-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Star size={16} className="text-yellow-400" />
              <span className="font-semibold text-yellow-400">Quest</span>
            </div>
            <h3 className="font-bold">{currentObjective.title}</h3>
            <p className="text-sm text-gray-300 mb-2">{currentObjective.description}</p>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all"
                style={{ width: `${(currentObjective.progress / currentObjective.maxProgress) * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {currentObjective.progress}/{currentObjective.maxProgress}
            </div>
          </div>
        </div>
      )}

      {/* Recent Achievement */}
      {recentAchievement && Date.now() - (recentAchievement.unlockedAt || 0) < 5000 && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black p-4 rounded-lg shadow-2xl animate-bounce">
            <div className="flex items-center space-x-2">
              <Star size={20} className="text-yellow-800" />
              <span className="font-bold">Achievement Unlocked!</span>
            </div>
            <h3 className="font-bold text-lg">{recentAchievement.title}</h3>
            <p className="text-sm">{recentAchievement.description}</p>
          </div>
        </div>
      )}

      {/* Hotbar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className="flex space-x-1 bg-gray-900/90 p-3 rounded-lg backdrop-blur-sm shadow-2xl border border-gray-600">
          {Array.from({ length: 9 }, (_, i) => {
            const item = inventory[i];
            const itemProps = item && item.count > 0 ? ITEM_PROPERTIES[item.type] : null;
            
            return (
              <div
                key={i}
                className={`
                  w-16 h-16 border-2 cursor-pointer flex flex-col items-center justify-center text-xs font-bold rounded-lg transition-all relative
                  ${selectedSlot === i 
                    ? 'border-yellow-400 bg-yellow-400/20 shadow-lg scale-105' 
                    : 'border-gray-500 bg-gray-800 hover:bg-gray-700 hover:border-gray-400'
                  }
                `}
                onClick={() => onSlotSelect(i)}
              >
                {item && item.count > 0 && itemProps && (
                  <div className="text-center">
                    <div 
                      className="w-10 h-8 rounded mb-1 border border-gray-400 flex items-center justify-center text-xs"
                      style={{ backgroundColor: itemProps.color }}
                    >
                      {itemProps.isWeapon && '⚔️'}
                      {itemProps.isArmor && '🛡️'}
                      {itemProps.isConsumable && '🧪'}
                      {itemProps.isTool && '🔧'}
                      {!itemProps.isWeapon && !itemProps.isArmor && !itemProps.isConsumable && !itemProps.isTool && '💎'}
                    </div>
                    <div className="text-white text-xs font-semibold">{item.count}</div>
                    
                    {/* Durability bar for weapons/armor */}
                    {item.durability !== undefined && item.maxDurability && (
                      <div className="w-10 h-1 bg-gray-600 rounded mt-1">
                        <div 
                          className="h-1 rounded transition-all"
                          style={{ 
                            width: `${(item.durability / item.maxDurability) * 100}%`,
                            backgroundColor: item.durability / item.maxDurability > 0.5 ? '#10b981' : 
                                           item.durability / item.maxDurability > 0.25 ? '#f59e0b' : '#ef4444'
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
                <div className="absolute -top-1 -left-1 text-xs text-gray-400 font-bold">
                  {i + 1}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-center mt-3 space-x-2">
          <button
            onClick={onToggleGameMode}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg border
              ${gameMode === 'creative' 
                ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500' 
                : 'bg-green-600 hover:bg-green-700 text-white border-green-500'
              }
            `}
          >
            {gameMode === 'creative' ? '🎨 Creative' : '🌍 Adventure'}
          </button>
        </div>
      </div>
    </div>
  );
};