import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState } from '../types/game';
import { GameEngine } from '../engine/GameEngine';
import { useIsMobile } from '../hooks/use-mobile';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

interface GameProps {
  onGameStateChange: (state: GameState) => void;
}

export const Game: React.FC<GameProps> = ({ onGameStateChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    status: 'menu',
    score: 0,
    combo: 0,
    health: 100,
    level: 1,
    currentSong: 'cosmic_journey',
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

  const [loading, setLoading] = useState(false);
  const [showSongSelect, setShowSongSelect] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const isMobile = useIsMobile();

  // Initialize game engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create game engine
    const gameEngine = new GameEngine(canvas);
    gameEngineRef.current = gameEngine;

    // Set up event handlers
    gameEngine.onGameStateChange = (updates: Partial<GameState>) => {
      setGameState(prev => ({ ...prev, ...updates }));
      onGameStateChange({ ...gameState, ...updates });
    };

    gameEngine.onLoadingComplete = () => {
      setLoading(false);
      console.log('✅ Game engine ready!');
    };

    // Initialize the game
    setLoading(true);
    gameEngine.init();

    // Handle window resize
    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      gameEngine.destroy();
    };
  }, []);



  const handleGameModeSelect = (mode: string) => {
    if (gameEngineRef.current) {
      setGameState(prev => ({ ...prev, gameMode: mode as any }));
      
      if (mode === 'endless') {
        startGame();
      } else {
        setShowSongSelect(true);
      }
    }
  };

  const handleSongSelect = (songId: string) => {
    if (gameEngineRef.current) {
      setGameState(prev => ({ 
        ...prev, 
        currentSong: songId,
        score: 0,
        combo: 0,
        health: 100,
        currentSongProgress: 0
      }));
      setShowSongSelect(false);
      startGame();
    }
  };

  const startGame = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.startGame();
    }
  }, []);

  const pauseGame = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.pauseGame();
    }
  }, []);

  const resumeGame = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.resumeGame();
    }
  }, []);

  const restartGame = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.restartGame();
    }
  }, []);

  if (gameState.status === 'menu' || showSongSelect) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-10">
          <div className="max-w-5xl w-full mx-4">
            {!showSongSelect ? (
              <div className="text-center space-y-8">
                <div className="mb-12">
                  <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-6">
                    WORMHOLE RHYTHM v2.0
                  </h1>
                  <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-4">
                    REVOLUTIONARY FREQUENCY-BASED GAMEPLAY
                  </h2>
                  <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                    Master the horizontal frequency spectrum with wormhole whips! 
                    Travel through musical dimensions with revolutionary portal mechanics.
                  </p>
                  
                  <div className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-xl p-6 mb-8 max-w-4xl mx-auto">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-4">NEW MECHANICS:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-black/30 rounded-lg p-3">
                        <div className="text-purple-400 font-semibold">🌌 Horizontal Portals</div>
                        <div className="text-gray-300">Bass (50-120Hz) • Snare (150-300Hz) • Hi-hat (1-8kHz+)</div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3">
                        <div className="text-cyan-400 font-semibold">🌀 Wormhole Whips</div>
                        <div className="text-gray-300">Curved trajectories with cosmic energy trails</div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3">
                        <div className="text-pink-400 font-semibold">🎯 Portal Travel</div>
                        <div className="text-gray-300">Dimensional progression with spacetime effects</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <button
                    onClick={() => handleGameModeSelect('practice')}
                    className="group flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 px-8 py-6 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                  >
                    <div className="text-3xl">🎯</div>
                    <span>Practice</span>
                    <span className="text-xs text-cyan-200">Learn the mechanics</span>
                  </button>

                  <button
                    onClick={() => handleGameModeSelect('arcade')}
                    className="group flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-purple-600 to-pink-700 hover:from-purple-500 hover:to-pink-600 px-8 py-6 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                  >
                    <div className="text-3xl">🎮</div>
                    <span>Arcade</span>
                    <span className="text-xs text-purple-200">Score-based mode</span>
                  </button>

                  <button
                    onClick={() => handleGameModeSelect('endless')}
                    className="group flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-red-600 to-orange-700 hover:from-red-500 hover:to-orange-600 px-8 py-6 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                  >
                    <div className="text-3xl">♾️</div>
                    <span>Endless</span>
                    <span className="text-xs text-red-200">Infinite dimensions</span>
                  </button>
                  
                  <button
                    onClick={() => handleGameModeSelect('story')}
                    className="group flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-green-600 to-teal-700 hover:from-green-500 hover:to-teal-600 px-8 py-6 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                  >
                    <div className="text-3xl">📖</div>
                    <span>Story</span>
                    <span className="text-xs text-green-200">Epic adventure</span>
                  </button>
                </div>

                <div className="bg-black/40 rounded-xl p-6 max-w-3xl mx-auto">
                  <h3 className="text-xl font-semibold text-cyan-400 mb-4 text-center">CONTROLS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">🎯 Aiming & Firing</h4>
                      <ul className="text-gray-300 space-y-1">
                        <li>• Mouse: Move crosshair</li>
                        <li>• Click: Fire wormhole whip</li>
                        <li>• Aim for moving portals</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">🎮 Game Controls</h4>
                      <ul className="text-gray-300 space-y-1">
                        <li>• <span className="text-cyan-400">Click</span>: Fire wormhole whip</li>
                        <li>• <span className="text-purple-400">Space</span>: Pause/Resume</li>
                        <li>• <span className="text-orange-400">R</span>: Restart game</li>
                        <li>• Speed controlled by movement speed</li>
                      </ul>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-gray-400">
                      <span className="text-cyan-400">Space</span>: Pause/Resume • 
                      <span className="text-purple-400 ml-2">R</span>: Restart
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
                    Select Your Journey
                  </h2>
                  <p className="text-xl text-gray-300">
                    Choose a track to begin your revolutionary wormhole adventure
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { 
                      id: 'cosmic_theme', 
                      name: 'Cosmic Theme', 
                      difficulty: 'Easy', 
                      duration: '3:24',
                      description: 'Gentle introduction to frequency-based gameplay',
                      color: 'from-green-500 to-teal-500'
                    },
                    { 
                      id: 'rhythm_energetic', 
                      name: 'Energetic Beats', 
                      difficulty: 'Medium', 
                      duration: '4:12',
                      description: 'Dynamic portal sequences with varied frequencies',
                      color: 'from-yellow-500 to-orange-500'
                    },
                    { 
                      id: 'fast_rhythm', 
                      name: 'Fast Rhythm', 
                      difficulty: 'Hard', 
                      duration: '2:56',
                      description: 'Intense hi-hat sequences with rapid portal travel',
                      color: 'from-orange-500 to-red-500'
                    },
                    { 
                      id: 'epic_journey', 
                      name: 'Epic Journey', 
                      difficulty: 'Expert', 
                      duration: '5:33',
                      description: 'Ultimate test of precision and dimensional mastery',
                      color: 'from-red-500 to-purple-500'
                    },
                  ].map((song) => (
                    <button
                      key={song.id}
                      onClick={() => handleSongSelect(song.id)}
                      className="group bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600 hover:border-cyan-400 rounded-xl p-6 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {song.name}
                        </h3>
                        <span className="text-sm text-gray-400 bg-gray-700 px-3 py-1 rounded-full">
                          {song.duration}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 mb-4 text-sm">
                        {song.description}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${song.color} text-white`}>
                          {song.difficulty}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-600 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full bg-gradient-to-r ${song.color} ${
                                song.difficulty === 'Easy' ? 'w-1/4' :
                                song.difficulty === 'Medium' ? 'w-1/2' :
                                song.difficulty === 'Hard' ? 'w-3/4' : 'w-full'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="text-center">
                  <button
                    onClick={() => setShowSongSelect(false)}
                    className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 font-semibold px-4 py-2 rounded-lg hover:bg-cyan-400/10 transition-all"
                  >
                    <span>←</span>
                    <span>Back to Menu</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Game UI Overlay - Hidden during play for full immersion */}
      {gameState.status === 'paused' && (
        <div className="absolute top-4 left-4 z-20 space-y-4">
          <div className="bg-black/80 backdrop-blur-sm rounded-xl p-6 space-y-3 border border-cyan-500/30">
            <div className="text-3xl font-bold text-white">
              Score: <span className="text-cyan-400">{gameState.score.toLocaleString()}</span>
            </div>
            <div className="text-xl">
              Combo: <span className="text-orange-400">{gameState.combo}</span>
              <span className="text-sm text-gray-400 ml-2">(Max: {gameState.maxCombo})</span>
            </div>
            <div className="text-lg text-white">
              Health: <span className="text-green-400">{gameState.health}%</span>
            </div>
            <div className="text-sm text-gray-300">
              Level: {gameState.level} • Accuracy: <span className="text-cyan-400">{gameState.accuracy.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Game Controls - Positioned in bottom-left, outside gameplay interaction area */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-1 space-x-1 border border-gray-500/20">
          {gameState.status === 'playing' ? (
            <button
              onClick={pauseGame}
              className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded text-sm transition-colors"
              title="Pause (Space)"
            >
              ⏸️
            </button>
          ) : gameState.status === 'paused' ? (
            <button
              onClick={resumeGame}
              className="p-1.5 bg-green-600/80 hover:bg-green-600 text-white rounded text-sm transition-colors"
              title="Resume (Space)"
            >
              ▶️
            </button>
          ) : null}
          
          <button
            onClick={restartGame}
            className="p-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded text-sm transition-colors"
            title="Restart (R)"
          >
            🔄
          </button>
        </div>
      </div>



      {/* Pause Overlay */}
      {gameState.status === 'paused' && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-black/90 backdrop-blur-sm rounded-2xl p-12 text-center border border-cyan-500/30">
            <h2 className="text-5xl font-bold text-white mb-6">Game Paused</h2>
            <div className="space-y-4">
              <div className="text-2xl text-gray-300">
                Press <span className="text-cyan-400 font-bold">Space</span> to Resume
              </div>
              <div className="text-lg text-gray-400">
                Or use the controls above
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameState.status === 'gameover' && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-black/90 backdrop-blur-sm rounded-2xl p-12 text-center border border-red-500/30">
            <h2 className="text-5xl font-bold text-red-400 mb-6">Game Over</h2>
            <div className="space-y-4 text-white">
              <div className="text-3xl">Final Score: <span className="text-cyan-400">{gameState.score.toLocaleString()}</span></div>
              <div className="text-xl">Max Combo: <span className="text-orange-400">{gameState.maxCombo}</span></div>
              <div className="text-lg">Accuracy: <span className="text-cyan-400">{gameState.accuracy.toFixed(1)}%</span></div>
            </div>
            <div className="mt-8">
              <button
                onClick={restartGame}
                className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all transform hover:scale-105"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
