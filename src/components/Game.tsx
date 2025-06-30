import React from 'react';
import { GameCanvas } from './GameCanvas';
import { GameHUD } from './GameHUD';
import { MiniMap } from './MiniMap';
import { SpellSystem } from './SpellSystem';
import { GodSystem } from './GodSystem';
import { useGameEngine } from '../hooks/useGameEngine';

export const Game: React.FC = () => {
  const { 
    gameState, 
    handleBlockClick, 
    handleSlotSelect, 
    toggleGameMode,
    attackNearbyMob,
    useSelectedItem,
    castSpell,
    prayToGod,
    sacrificeToGod,
    toggleMiniMap,
    spellSystemVisible,
    setSpellSystemVisible,
    godSystemVisible,
    setGodSystemVisible,
    interactWithNearby
  } = useGameEngine();

  return (
    <div className="w-full h-screen bg-gradient-to-b from-blue-900 via-green-900 to-brown-900 overflow-hidden relative">
      {/* Game Canvas */}
      <GameCanvas 
        gameState={gameState} 
        onBlockClick={handleBlockClick}
      />
      
      {/* Mini Map */}
      <MiniMap
        gameState={gameState}
        onToggle={toggleMiniMap}
      />
      
      {/* Spell System */}
      <SpellSystem
        player={gameState.player}
        onCastSpell={castSpell}
        visible={spellSystemVisible}
        onToggle={() => setSpellSystemVisible(!spellSystemVisible)}
      />
      
      {/* God System */}
      <GodSystem
        gods={gameState.gods}
        player={gameState.player}
        onPray={prayToGod}
        onSacrifice={sacrificeToGod}
        visible={godSystemVisible}
        onToggle={() => setGodSystemVisible(!godSystemVisible)}
      />
      
      {/* Game HUD */}
      <GameHUD
        inventory={gameState.inventory.slice(0, 9)} // Only hotbar for HUD
        selectedSlot={gameState.player.selectedSlot}
        onSlotSelect={handleSlotSelect}
        gameMode={gameState.gameMode}
        onToggleGameMode={toggleGameMode}
        player={gameState.player}
        time={gameState.time}
        objectives={gameState.gameObjectives}
        achievements={gameState.achievements}
        combatLog={gameState.combatLog}
        dungeonLevel={gameState.currentDungeon?.level || 0}
        nearbyInteractable={gameState.nearbyInteractable}
        onInteract={interactWithNearby}
      />
      
      {/* Enhanced Instructions */}
      <div className="fixed bottom-4 left-4 bg-black/90 text-white p-4 rounded-lg backdrop-blur-sm max-w-sm z-10 border border-green-500">
        <h3 className="font-bold mb-3 text-lg text-green-400">🌍 Open World Adventure</h3>
        <div className="space-y-1 text-sm">
          <div><kbd className="bg-gray-700 px-2 py-1 rounded">WASD</kbd> - Move</div>
          <div><kbd className="bg-gray-700 px-2 py-1 rounded">Space</kbd> - Jump</div>
          <div><kbd className="bg-gray-700 px-2 py-1 rounded">E</kbd> - Interact</div>
          <div><kbd className="bg-gray-700 px-2 py-1 rounded">X</kbd> - Attack</div>
          <div><kbd className="bg-gray-700 px-2 py-1 rounded">F</kbd> - Use item</div>
          <div><kbd className="bg-gray-700 px-2 py-1 rounded">Z</kbd> - Spells</div>
          <div><kbd className="bg-gray-700 px-2 py-1 rounded">G</kbd> - Gods</div>
          <div><kbd className="bg-gray-700 px-2 py-1 rounded">M</kbd> - Mini Map</div>
          <div><kbd className="bg-gray-700 px-2 py-1 rounded">1-9</kbd> - Select item</div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-green-600">
          <h4 className="font-semibold mb-2 text-yellow-400">🏛️ Temple System</h4>
          <div className="space-y-1 text-xs">
            <div>• Visit temples to worship gods</div>
            <div>• Make offerings for divine favor</div>
            <div>• Use temple services (healing, blessings)</div>
            <div>• Your alignment affects god relationships</div>
            <div>• Explore the overworld to find temples</div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-green-600">
          <h4 className="font-semibold mb-2 text-blue-400">🗺️ Exploration</h4>
          <div className="space-y-1 text-xs">
            <div>• Start in the overworld, not dungeons</div>
            <div>• Discover towns, temples, and dungeons</div>
            <div>• Enter dungeons through entrances</div>
            <div>• Rest at inns to recover</div>
            <div>• Trade at shops and blacksmiths</div>
          </div>
        </div>
      </div>
    </div>
  );
};