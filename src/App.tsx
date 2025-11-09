import React, { useState } from 'react';
import { Game } from './components/Game';
import { GameState } from './types/game';
import './App.css';

function App() {
  const [gameState, setGameState] = useState<GameState>({
    status: 'menu',
    score: 0,
    combo: 0,
    health: 100,
    level: 1,
    currentSong: '',
    currentSongProgress: 0,
    maxCombo: 0,
    accuracy: 100,
    gameMode: 'practice',
    levelProgress: 0,
    portalsHit: 0,
    portalsTotal: 0,
    currentDifficulty: 'easy',
    transitionActive: false
  });

  const handleGameStateChange = (newState: GameState) => {
    setGameState(newState);
  };

  return (
    <div className="App min-h-screen bg-black overflow-hidden">
      <Game onGameStateChange={handleGameStateChange} />
    </div>
  );
}

export default App;