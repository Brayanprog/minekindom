import React from 'react';
import { God, Player } from '../types/Game';
import { Crown, Heart, Skull, Shield, Zap, Star } from 'lucide-react';

interface GodSystemProps {
  gods: God[];
  player: Player;
  onPray: (godId: string) => void;
  onSacrifice: (godId: string, itemSlot: number) => void;
  visible: boolean;
  onToggle: () => void;
}

export const GodSystem: React.FC<GodSystemProps> = ({
  gods,
  player,
  onPray,
  onSacrifice,
  visible,
  onToggle
}) => {
  const getGodIcon = (god: God) => {
    switch (god.alignment) {
      case 'good': return <Star size={20} className="text-yellow-400" />;
      case 'evil': return <Skull size={20} className="text-red-400" />;
      default: return <Shield size={20} className="text-gray-400" />;
    }
  };

  const getFavorColor = (favor: number) => {
    if (favor >= 80) return 'text-green-400';
    if (favor >= 50) return 'text-yellow-400';
    if (favor >= 20) return 'text-orange-400';
    if (favor >= -20) return 'text-gray-400';
    if (favor >= -50) return 'text-red-400';
    return 'text-red-600';
  };

  const getFavorText = (favor: number) => {
    if (favor >= 80) return 'Blessed';
    if (favor >= 50) return 'Favored';
    if (favor >= 20) return 'Liked';
    if (favor >= -20) return 'Neutral';
    if (favor >= -50) return 'Disliked';
    return 'Cursed';
  };

  if (!visible) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-20 right-4 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors z-20"
      >
        <Crown size={20} />
      </button>
    );
  }

  return (
    <div className="fixed top-20 right-4 bg-black/90 border border-purple-500 rounded-lg p-4 w-96 z-20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-bold text-lg flex items-center">
          <Crown size={20} className="mr-2 text-purple-400" />
          Divine Pantheon
        </h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>

      {/* Player alignment */}
      <div className="mb-4 p-3 bg-gray-800 rounded border border-gray-600">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Your Alignment:</span>
          <span className={`font-semibold capitalize ${
            player.alignment === 'good' ? 'text-yellow-400' :
            player.alignment === 'evil' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {player.alignment}
          </span>
        </div>
      </div>

      {/* Gods list */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {gods.map(god => {
          const favor = player.godFavor[god.id] || 0;
          
          return (
            <div key={god.id} className="bg-gray-800 border border-gray-600 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {getGodIcon(god)}
                  <div className="ml-2">
                    <h4 className="font-semibold text-white">{god.name}</h4>
                    <p className="text-xs text-gray-400">{god.domain}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${getFavorColor(favor)}`}>
                    {getFavorText(favor)}
                  </div>
                  <div className="text-xs text-gray-400">{favor}</div>
                </div>
              </div>

              {/* Favor bar */}
              <div className="mb-3">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      favor >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, Math.abs(favor))}%`,
                      marginLeft: favor < 0 ? `${100 - Math.min(100, Math.abs(favor))}%` : '0'
                    }}
                  />
                </div>
              </div>

              {/* Blessings/Curses */}
              {favor >= 50 && god.blessings.length > 0 && (
                <div className="mb-2">
                  <h5 className="text-xs font-semibold text-green-400 mb-1">Active Blessings:</h5>
                  <div className="text-xs text-green-300">
                    {god.blessings.slice(0, 2).map((blessing, i) => (
                      <div key={i}>• {blessing}</div>
                    ))}
                  </div>
                </div>
              )}

              {favor <= -50 && god.curses.length > 0 && (
                <div className="mb-2">
                  <h5 className="text-xs font-semibold text-red-400 mb-1">Active Curses:</h5>
                  <div className="text-xs text-red-300">
                    {god.curses.slice(0, 2).map((curse, i) => (
                      <div key={i}>• {curse}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => onPray(god.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded transition-colors"
                >
                  Pray
                </button>
                <button
                  onClick={() => onSacrifice(god.id, player.selectedSlot)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs py-1 px-2 rounded transition-colors"
                >
                  Sacrifice
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Divine events */}
      <div className="mt-4 p-2 bg-purple-900/30 border border-purple-400 rounded">
        <div className="text-xs text-purple-300 text-center">
          The gods watch your every action...
        </div>
      </div>
    </div>
  );
};