export interface GameState {
  status: 'menu' | 'playing' | 'paused' | 'gameover' | 'level_complete' | 'transitioning';
  score: number;
  combo: number;
  health: number;
  level: number;
  currentSong: string;
  currentSongProgress: number;
  maxCombo: number;
  accuracy: number;
  gameMode: 'practice' | 'arcade' | 'endless' | 'story';
  levelProgress: number; // 0-100 completion percentage
  portalsHit: number;
  portalsTotal: number;
  currentDifficulty: 'easy' | 'normal' | 'hard' | 'expert';
  transitionActive: boolean; // Wormhole transition in progress
}

export interface Portal {
  id: string;
  type: 'bass' | 'snare' | 'hihat';
  x: number; // Horizontal position (0-1, moves left to right)
  y: number; // Vertical position
  z: number; // Depth for visual layering
  size: number;
  speed: number; // Movement speed (left to right)
  horizontalSpeed: number; // Continuous left-to-right movement speed
  color: string;
  frequency: number; // Hz range for each type
  frequencyRange: string; // Display string (e.g., "50-120Hz")
  spawnTime: number;
  targetTime: number;
  position: 'approach' | 'active' | 'missed';
  hitQuality?: 'perfect' | 'great' | 'good' | 'hit' | 'miss';
  reachedTime?: number;
  isTraveling?: boolean; // Portal is in travel sequence
  travelProgress?: number; // 0-1 progress of travel
  isMoving: boolean; // Continuous movement flag
  travelLane: number; // Which horizontal lane (0-3)
  beatMatch: boolean; // Matches current beat timing
}

export interface Whip {
  id: string;
  position: { x: number; y: number };
  targetPosition: { x: number; y: number };
  trajectory: { start: {x: number, y: number}; control: {x: number, y: number}; end: {x: number, y: number} };
  velocity: number;
  isActive: boolean;
  isExtending: boolean;
  extensionProgress: number; // 0-1
  trailPoints: Array<{x: number, y: number, alpha: number}>;
  cosmicEnergy: number; // Visual effect intensity
  whipLength: number;
  whipAngle: number;
  createdTime: number;
  hitDetection: boolean;
  wavePattern: WavePattern; // Wave-based movement
  cursorSpeed: number; // Speed of cursor movement that created this whip
}

export interface GameAudio {
  masterVolume: number;
  musicVolume: number;
  effectVolume: number;
  spatialAudioEnabled: boolean;
}

export interface VisualEffect {
  id: string;
  type: 'crack' | 'portal_hit' | 'portal_travel' | 'particle' | 'level_transition' | 'wave_trail' | 'beat_pulse';
  position: { x: number; y: number; z: number };
  startTime: number;
  duration: number;
  data: any;
}

export interface WavePattern {
  amplitude: number; // Wave height
  frequency: number; // Wave frequency
  phase: number; // Wave phase offset
  decay: number; // How quickly waves fade
  waveType: 'sine' | 'cosine' | 'sawtooth' | 'square';
}

export interface LevelData {
  id: number;
  name: string;
  description: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  requiredHits: number;
  portalSpeed: number;
  spawnRate: number; // Portals per second
  background: string;
  music: string;
  timeLimit: number; // Seconds
  bonusScore: number;
}

export interface TouchGesture {
  type: 'tap' | 'double_tap' | 'long_press' | 'swipe' | 'pinch' | 'rotate' | 'drag';
  startTime: number;
  endTime?: number;
  startPosition: { x: number; y: number };
  endPosition?: { x: number; y: number };
  velocity?: { x: number; y: number };
  distance?: number;
  duration?: number;
  touches?: Touch[]; // All touch points involved
}

export interface MobileConfig {
  touchSensitivity: number; // How sensitive touch input is
  gestureTimeout: number; // Time before gestures are recognized
  doubleTapThreshold: number; // Time between taps for double tap
  longPressThreshold: number; // Time for long press
  swipeThreshold: number; // Distance for swipe gesture
  hapticFeedback: boolean; // Enable haptic feedback
  showTouchVisualization: boolean; // Show touch points for debugging
}

export interface GameInput {
  mousePosition: { x: number; y: number };
  isMouseDown: boolean;
  keyStates: { [key: string]: boolean };
  lastInputTime: number;
  cursorSpeed: number; // Pixels per second
  cursorVelocity: { x: number; y: number }; // Current movement vector
  averageCursorSpeed: number; // Smoothed average speed
  
  // Touch screen support
  isTouchActive: boolean;
  touchPosition: { x: number; y: number }; // Current touch position
  touchStartPosition: { x: number; y: number }; // Touch start position
  touchVelocity: { x: number; y: number }; // Touch movement vector
  touchSpeed: number; // Touch movement speed
  touchStartTime: number; // When touch started
  multiTouchCount: number; // Number of active touches
  activeTouches: Touch[]; // All active touch points
  touchGestures: string[]; // Detected gestures
  lastTouchInteraction: number; // Timestamp of last touch
  
  // Mobile device info
  isMobileDevice: boolean;
  devicePixelRatio: number;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
}

export interface SongData {
  id: string;
  name: string;
  duration: number;
  bpm: number;
  difficulty: string;
  audioPath: string;
  chartData: PortalPattern[];
}

export interface PortalPattern {
  time: number;
  type: 'bass' | 'snare' | 'hihat';
  frequency: number; // Specific frequency within range
  frequencyRange: string;
  horizontalPosition: number; // 0-1 left to right
  travelTarget: string; // Destination dimension
  holdDuration?: number;
}