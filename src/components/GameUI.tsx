import React, { useState } from 'react';
import { GameState } from '../types/game';
import { Play, Pause, RotateCcw, Settings, Volume2, Music, Trophy } from 'lucide-react';

interface GameUIProps {
  gameState: GameState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onSongSelect: (songId: string) => void;
  onGameModeChange: (mode: string) => void;
  isMobile: boolean;
}

const songs = [
  { id: 'cosmic_theme', name: 'Cosmic Theme', difficulty: 'Easy', duration: '3:24' },
  { id: 'rhythm_energetic', name: 'Energetic Beats', difficulty: 'Medium', duration: '4:12' },
  { id: 'fast_rhythm', name: 'Fast Rhythm', difficulty: 'Hard', duration: '2:56' },
  { id: 'epic_journey', name: 'Epic Journey', difficulty: 'Expert', duration: '5:33' },
];

export const GameUI: React.FC<GameUIProps> = ({
  gameState,
  onStart,
  onPause,
  onResume,
  onRestart,
  onSongSelect,
  onGameModeChange,
  isMobile,
}) => {
  const [showSongSelect, setShowSongSelect] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Real game mode handling
  const handleGameModeSelect = (mode: 'practice' | 'arcade' | 'endless' | 'story') => {
    console.log(`🎮 Selected game mode: ${mode}`);
    onGameModeChange(mode);
    
    switch (mode) {
      case 'practice':
        setShowSongSelect(true);
        break;
      case 'arcade':
        setShowSongSelect(true);
        break;
      case 'endless':
        // Endless mode doesn't need song selection
        setShowSongSelect(false);
        break;
      case 'story':
        setShowSongSelect(true);
        break;
    }
  };

  const getStatusMessage = () => {
    switch (gameState.status) {
      case 'menu':
        return 'Press Start to Begin Your Journey';
      case 'paused':
        return 'Game Paused';
      case 'gameover':
        return 'Game Over - Wormhole Stabilized';
      default:
        return '';
    }
  };

  const getScoreColor = () => {
    if (gameState.score >= 100000) return 'text-yellow-400';
    if (gameState.score >= 50000) return 'text-cyan-400';
    if (gameState.score >= 10000) return 'text-purple-400';
    return 'text-white';
  };

  const getComboColor = () => {
    if (gameState.combo >= 50) return 'text-red-400';
    if (gameState.combo >= 25) return 'text-orange-400';
    if (gameState.combo >= 10) return 'text-yellow-400';
    return 'text-cyan-400';
  };

  if (gameState.status === 'menu' || showSongSelect) {
    return (
      <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-10">
        <div className="max-w-4xl w-full mx-4">
          {!showSongSelect ? (
            <div className="text-center space-y-8">
              <div className="mb-12">
                <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-4">
                  WORMHOLE RHYTHM
                </h1>
                <p className="text-xl text-gray-300 mb-8">
                  Master the spacetime with your whip. Travel through musical dimensions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <button
                  onClick={() => handleGameModeSelect('practice')}
                  className="flex items-center justify-center space-x-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 px-6 py-4 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  <Settings className="w-5 h-5" />
                  <span>Practice</span>
                </button>

                <button
                  onClick={() => handleGameModeSelect('arcade')}
                  className="flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-4 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  <Music className="w-5 h-5" />
                  <span>Arcade</span>
                </button>

                <button
                  onClick={() => handleGameModeSelect('endless')}
                  className="flex items-center justify-center space-x-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 px-6 py-4 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  <Trophy className="w-5 h-5" />
                  <span>Endless</span>
                </button>
                
                <button
                  onClick={() => handleGameModeSelect('story')}
                  className="flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 px-6 py-4 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  <Play className="w-5 h-5" />
                  <span>Story</span>
                </button>
              </div>

              <div className="text-center text-gray-400">
                <p className="mb-2">Controls:</p>
                <p>Mouse: Aim and click to crack whip</p>
                <p>Space: Pause/Resume</p>
                <p>R: Restart level</p>
                <p>Speed controlled by movement speed</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-cyan-400 mb-4">Select Your Journey</h2>
                <p className="text-gray-300">Choose a track to begin your wormhole adventure</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {songs.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => {
                      onSongSelect(song.id);
                      setShowSongSelect(false);
                    }}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-cyan-400 rounded-lg p-6 text-left transition-all duration-200 transform hover:scale-105"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-white">{song.name}</h3>
                      <span className="text-sm text-gray-400">{song.duration}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-400">{song.difficulty}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              song.difficulty === 'Easy' ? 'bg-green-400' :
                              song.difficulty === 'Medium' ? 'bg-yellow-400' :
                              song.difficulty === 'Hard' ? 'bg-orange-400' : 'bg-red-400'
                            }`}
                            style={{ width: song.difficulty === 'Easy' ? '25%' : song.difficulty === 'Medium' ? '50%' : song.difficulty === 'Hard' ? '75%' : '100%' }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{song.difficulty}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-center">
                <button
                  onClick={() => setShowSongSelect(false)}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  ← Back to Menu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Game Stats Overlay */}
      <div className="absolute top-4 left-4 z-20 space-y-4">
        <div className="bg-black bg-opacity-60 rounded-lg p-4 space-y-2">
          <div className="text-2xl font-bold text-white">
            Score: <span className={getScoreColor()}>{gameState.score.toLocaleString()}</span>
          </div>
          <div className="text-xl">
            Combo: <span className={getComboColor()}>{gameState.combo}</span>
            <span className="text-sm text-gray-400 ml-2">(Max: {gameState.maxCombo})</span>
          </div>
          <div className="text-lg text-white">
            Health: <span className="text-green-400">{gameState.health}%</span>
          </div>
          <div className="text-sm text-gray-300">
            Level: {gameState.level}
          </div>
          <div className="text-sm text-gray-300">
            Accuracy: <span className="text-cyan-400">{gameState.accuracy.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="absolute top-4 right-4 z-20 space-y-2">
        <div className="bg-black bg-opacity-60 rounded-lg p-2 space-x-2">
          {gameState.status === 'playing' ? (
            <button
              onClick={onPause}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              <Pause className="w-4 h-4" />
            </button>
          ) : gameState.status === 'paused' ? (
            <button
              onClick={onResume}
              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              <Play className="w-4 h-4" />
            </button>
          ) : null}
          
          <button
            onClick={onRestart}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Song Progress */}
      {gameState.currentSong && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-black bg-opacity-60 rounded-lg p-4 min-w-80">
            <div className="text-center text-white font-semibold mb-2">
              {songs.find(s => s.id === gameState.currentSong)?.name}
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-100"
                style={{ width: `${gameState.currentSongProgress}%` }}
              />
            </div>
            <div className="text-center text-sm text-gray-400 mt-1">
              {gameState.currentSongProgress.toFixed(1)}% Complete
            </div>
          </div>
        </div>
      )}

      {/* Status Message */}
      {getStatusMessage() && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-black bg-opacity-80 rounded-lg p-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">{getStatusMessage()}</h2>
            {gameState.status === 'gameover' && (
              <div className="space-y-4">
                <div className="text-xl text-gray-300">Final Score: {gameState.score.toLocaleString()}</div>
                <div className="text-lg text-gray-300">Max Combo: {gameState.maxCombo}</div>
                <div className="text-lg text-gray-300">Accuracy: {gameState.accuracy.toFixed(1)}%</div>
                <button
                  onClick={onRestart}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-30">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-white mb-4">Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Audio Volume</label>
                <input type="range" min="0" max="100" defaultValue="70" className="w-full" />
              </div>
              <div>
                <label className="block text-white mb-2">Master Volume</label>
                <input type="range" min="0" max="100" defaultValue="80" className="w-full" />
              </div>
              <div>
                <label className="block text-white mb-2">Effect Volume</label>
                <input type="range" min="0" max="100" defaultValue="60" className="w-full" />
              </div>
            </div>
            <div className="mt-6 flex space-x-4">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};