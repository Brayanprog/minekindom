import React, { useState } from 'react';
import { Player, Spell } from '../types/Game';
import { Zap, Flame, Shield, Heart, Eye, Skull, Sun, Moon } from 'lucide-react';

interface SpellSystemProps {
  player: Player;
  onCastSpell: (spell: Spell, targetX?: number, targetY?: number) => void;
  visible: boolean;
  onToggle: () => void;
}

export const SpellSystem: React.FC<SpellSystemProps> = ({
  player,
  onCastSpell,
  visible,
  onToggle
}) => {
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [targetMode, setTargetMode] = useState(false);

  const spellCategories = {
    offensive: player.spellsKnown.filter(s => s.type === 'offensive'),
    defensive: player.spellsKnown.filter(s => s.type === 'defensive'),
    utility: player.spellsKnown.filter(s => s.type === 'utility'),
    dark: player.spellsKnown.filter(s => s.type === 'dark'),
    holy: player.spellsKnown.filter(s => s.type === 'holy')
  };

  const getSpellIcon = (spell: Spell) => {
    switch (spell.type) {
      case 'offensive': return <Flame size={16} className="text-red-400" />;
      case 'defensive': return <Shield size={16} className="text-blue-400" />;
      case 'utility': return <Eye size={16} className="text-green-400" />;
      case 'dark': return <Skull size={16} className="text-purple-400" />;
      case 'holy': return <Sun size={16} className="text-yellow-400" />;
      default: return <Zap size={16} className="text-gray-400" />;
    }
  };

  const canCastSpell = (spell: Spell) => {
    return player.mana >= spell.manaCost;
  };

  const handleSpellClick = (spell: Spell) => {
    if (!canCastSpell(spell)) return;
    
    setSelectedSpell(spell);
    if (spell.range > 0) {
      setTargetMode(true);
    } else {
      onCastSpell(spell);
      setSelectedSpell(null);
    }
  };

  if (!visible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-32 right-4 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors z-20"
      >
        <Zap size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-32 right-4 bg-black/90 border border-purple-500 rounded-lg p-4 w-80 z-20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-bold text-lg flex items-center">
          <Zap size={20} className="mr-2 text-purple-400" />
          Spellbook
        </h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>

      {/* Mana bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Mana</span>
          <span>{player.mana}/{player.maxMana}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${(player.mana / player.maxMana) * 100}%` }}
          />
        </div>
      </div>

      {/* Spell categories */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {Object.entries(spellCategories).map(([category, spells]) => {
          if (spells.length === 0) return null;
          
          return (
            <div key={category}>
              <h4 className="text-sm font-semibold text-gray-300 capitalize mb-2 flex items-center">
                {category === 'offensive' && <Flame size={14} className="mr-1 text-red-400" />}
                {category === 'defensive' && <Shield size={14} className="mr-1 text-blue-400" />}
                {category === 'utility' && <Eye size={14} className="mr-1 text-green-400" />}
                {category === 'dark' && <Skull size={14} className="mr-1 text-purple-400" />}
                {category === 'holy' && <Sun size={14} className="mr-1 text-yellow-400" />}
                {category}
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                {spells.map(spell => (
                  <button
                    key={spell.id}
                    onClick={() => handleSpellClick(spell)}
                    disabled={!canCastSpell(spell)}
                    className={`
                      p-2 rounded border text-left transition-all text-xs
                      ${canCastSpell(spell)
                        ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-purple-400 text-white'
                        : 'bg-gray-900 border-gray-700 text-gray-500 cursor-not-allowed'
                      }
                      ${selectedSpell?.id === spell.id ? 'border-purple-400 bg-purple-900/30' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{spell.name}</span>
                      {getSpellIcon(spell)}
                    </div>
                    <div className="text-xs text-gray-400">
                      Cost: {spell.manaCost} MP
                    </div>
                    {spell.damage && (
                      <div className="text-xs text-red-300">
                        Damage: {spell.damage}
                      </div>
                    )}
                    {spell.healing && (
                      <div className="text-xs text-green-300">
                        Heal: {spell.healing}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Target mode indicator */}
      {targetMode && selectedSpell && (
        <div className="mt-4 p-2 bg-purple-900/50 border border-purple-400 rounded text-center">
          <div className="text-purple-300 text-sm">
            Click to target {selectedSpell.name}
          </div>
          <button
            onClick={() => {
              setTargetMode(false);
              setSelectedSpell(null);
            }}
            className="mt-1 text-xs text-gray-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Spell descriptions */}
      {selectedSpell && !targetMode && (
        <div className="mt-4 p-3 bg-gray-800 border border-gray-600 rounded">
          <h4 className="font-semibold text-white mb-1">{selectedSpell.name}</h4>
          <p className="text-xs text-gray-300 mb-2">
            Range: {selectedSpell.range === 0 ? 'Self' : `${selectedSpell.range} tiles`}
          </p>
          {selectedSpell.effect && (
            <p className="text-xs text-gray-400">{selectedSpell.effect}</p>
          )}
        </div>
      )}
    </div>
  );
};