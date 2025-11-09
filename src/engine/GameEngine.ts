import { GameState, Portal, Whip, VisualEffect, PortalPattern, LevelData, WavePattern } from '../types/game';
import { AudioManager } from './AudioManager';
import { VisualRenderer } from './VisualRenderer';
import { PhysicsEngine } from './PhysicsEngine';
import { InputManager } from './InputManager';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private audioManager: AudioManager;
  private visualRenderer: VisualRenderer;
  private physicsEngine: PhysicsEngine;
  private inputManager: InputManager;
  
  // Revolutionary horizontal frequency system
  private portals: Portal[] = [];
  private activeWhips: Whip[] = [];
  private visualEffects: VisualEffect[] = [];
  private crosshairPosition: { x: number; y: number } = { x: 0.5, y: 0.5 };
  
  // Level progression system
  private levels: LevelData[] = [
    {
      id: 1,
      name: 'Cosmic Void',
      description: 'Welcome to the wormhole dimensions',
      difficulty: 'easy',
      requiredHits: 10,
      portalSpeed: 0.3,
      spawnRate: 0.5,
      background: 'cosmic_void',
      music: 'cosmic_theme_music.mp3',
      timeLimit: 60,
      bonusScore: 1000
    },
    {
      id: 2,
      name: 'Stellar Nebula',
      description: 'Navigate through the stellar clouds',
      difficulty: 'normal',
      requiredHits: 15,
      portalSpeed: 0.4,
      spawnRate: 0.7,
      background: 'stellar_nebula',
      music: 'rhythm_game_energetic.mp3',
      timeLimit: 75,
      bonusScore: 2000
    },
    {
      id: 3,
      name: 'Quantum Field',
      description: 'Master the quantum beats',
      difficulty: 'hard',
      requiredHits: 20,
      portalSpeed: 0.5,
      spawnRate: 0.9,
      background: 'quantum_field',
      music: 'epic_journey_music.mp3',
      timeLimit: 90,
      bonusScore: 3000
    }
  ];
  private currentLevelIndex = 0;
  private levelStartTime = 0;
  
  // Wormhole mechanics
  private currentDimension: string = 'cosmic_void';
  private availableDimensions: string[] = [
    'cosmic_void', 'stellar_nebula', 'quantum_field', 'temporal_rift',
    'dark_matter_cloud', 'plasma_storm', 'crystal_galaxy', 'void_walker_realm'
  ];
  
  // Frequency mapping - horizontal spectrum
  private readonly FREQUENCY_MAPPING = {
    bass: { min: 50, max: 120, range: '50-120Hz', x: 0.15, image: 'enhanced_bass_portal.png' },
    snare: { min: 150, max: 300, range: '150-300Hz', x: 0.5, image: 'enhanced_snare_portal.png' },
    hihat: { min: 1000, max: 8000, range: '1-8kHz+', x: 0.85, image: 'enhanced_hihat_portal.png' }
  };
  
  // Frogger-style portal movement system
  private readonly FROGGER_LANES = 3;
  private portalSpawnTimer = 0;
  private beatTimer = 0;
  private currentBeat = 0;
  private beatInterval = 500; // ms between beats (120 BPM)
  private audioEnabled = true;
  private spatialAudioEnabled = true;
  
  // Animation and timing
  private animationId: number | null = null;
  private lastTime = 0;
  private gameTime = 0;
  private gameStartTime = 0;
  
  // Event callbacks
  public onGameStateChange: ((state: Partial<GameState>) => void) | null = null;
  public onLoadingComplete: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    // Initialize game state
    this.gameState = {
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
    };
    
    // Initialize managers
    this.audioManager = new AudioManager();
    this.visualRenderer = new VisualRenderer(this.ctx, this.canvas.width, this.canvas.height);
    this.physicsEngine = new PhysicsEngine();
    this.inputManager = new InputManager(canvas, this);
    
    this.setupEventListeners();
    this.resize();
  }
  
  private setupEventListeners() {
    // Input handlers with cursor speed tracking
    this.inputManager.onMouseMove = (position) => {
      this.crosshairPosition = position;
    };
    
    this.inputManager.onMouseClick = (position) => {
      this.fireWhip(position);
    };
    
    // Enhanced touch event handlers
    this.inputManager.onTouchStart = (position, touches) => {
      this.crosshairPosition = position;
    };
    
    this.inputManager.onTouchMove = (position, touches) => {
      this.crosshairPosition = position;
    };
    
    this.inputManager.onTouchEnd = (position, gesture) => {
      this.handleTouchEnd(position, gesture);
    };
    
    this.inputManager.onTouchGesture = (gesture) => {
      this.handleTouchGesture(gesture);
    };
    
    this.inputManager.onOrientationChange = (orientation) => {
      this.handleOrientationChange(orientation);
    };
    
    this.inputManager.onKeyDown = (key) => {
      switch (key) {
        case 'Space':
          this.togglePause();
          break;
        case 'KeyR':
          this.restartGame();
          break;
        case 'KeyA':
          this.toggleAudio();
          break;
      }
    };
  }
  
  private resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.visualRenderer.resize(this.canvas.width, this.canvas.height);
  }
  
  public async init() {
    console.log('🚀 Initializing Enhanced Wormhole Rhythm Game v3.0...');
    
    try {
      // Load all game assets
      await this.loadGameAssets();
      
      // Initialize level system
      this.initializeLevelSystem();
      
      // Start game loop
      this.gameLoop();
      
      // Complete initialization
      if (this.onLoadingComplete) {
        this.onLoadingComplete();
      }
      
      console.log('✅ Enhanced game initialized successfully!');
    } catch (error) {
      console.error('❌ Game initialization failed:', error);
    }
  }
  
  private async loadGameAssets() {
    console.log('📦 Loading enhanced game assets...');
    
    // Load all audio files with error handling
    const audioFiles = [
      'bass_drum_thud.mp3',
      'snare_drum_crack.mp3', 
      'hi_hat_tinkle.mp3',
      'heavy_whip_crack.mp3',
      'light_whip_crack.mp3',
      'perfect_hit_chime.mp3',
      'good_hit_buzz.mp3',
      'miss_alert.mp3',
      'combo_bonus.mp3',
      'portal_travel_swoosh.mp3',
      'cosmic_theme_music.mp3',
      'rhythm_game_energetic.mp3',
      'epic_journey_music.mp3',
      'ambient_space_ambience.mp3',
      'fast_rhythm_beats.mp3'
    ];
    
    await this.audioManager.loadAudioFiles(audioFiles);
    
    // Load visual assets
    await this.visualRenderer.loadAssets([
      'enhanced_bass_portal.png',
      'enhanced_snare_portal.png', 
      'enhanced_hihat_portal.png',
      'light_whip.png',
      'medium_whip.png',
      'heavy_whip.png',
      'cosmic_background.png',
      'hero_main_visual.png',
      'portal_travel_sequence.png',
      'spacetime_distortion.png'
    ]);
    
    console.log('✅ All enhanced assets loaded!');
  }
  
  private generateProceduralChart() {
    console.log('🎵 Generating procedural chart...');
    
    // Generate chart for 60 seconds
    const totalDuration = 60;
    const bpm = 120;
    const beatInterval = 60 / bpm;
    const totalBeats = Math.floor(totalDuration / beatInterval);
    
    const patterns: PortalPattern[] = [];
    
    for (let i = 0; i < totalBeats; i++) {
      const time = i * beatInterval;
      
      // Different patterns based on musical structure
      if (i % 16 === 0) { // Every 4 bars - big bass hit
        patterns.push({
          time,
          type: 'bass',
          frequency: 60,
          frequencyRange: this.FREQUENCY_MAPPING.bass.range,
          horizontalPosition: this.FREQUENCY_MAPPING.bass.x,
          travelTarget: this.getRandomDimension()
        });
      } else if (i % 4 === 0) { // Every beat - snare
        patterns.push({
          time,
          type: 'snare', 
          frequency: 200,
          frequencyRange: this.FREQUENCY_MAPPING.snare.range,
          horizontalPosition: this.FREQUENCY_MAPPING.snare.x,
          travelTarget: this.getRandomDimension()
        });
      } else if (i % 2 === 0) { // Every half beat - hi-hat
        patterns.push({
          time,
          type: 'hihat',
          frequency: 5000,
          frequencyRange: this.FREQUENCY_MAPPING.hihat.range, 
          horizontalPosition: this.FREQUENCY_MAPPING.hihat.x,
          travelTarget: this.getRandomDimension()
        });
      }
    }
    
    this.createPortalsFromPatterns(patterns);
    console.log(`✅ Generated ${patterns.length} portal patterns`);
  }
  
  private getRandomDimension(): string {
    return this.availableDimensions[Math.floor(Math.random() * this.availableDimensions.length)];
  }
  
  private createPortalsFromPatterns(patterns: PortalPattern[]) {
    this.portals = patterns.map((pattern, index) => {
      const targetTime = Date.now() + 2000 + (pattern.time * 1000); // Start in 2 seconds + pattern time
      const spawnTime = targetTime - 3000; // Spawn 3 seconds before target
      const speed = this.getPortalSpeed(pattern.type);
      
      return {
        id: `portal_${index}`,
        type: pattern.type,
        x: pattern.horizontalPosition, // Horizontal position based on frequency
        y: 0.5 + (Math.random() - 0.5) * 0.3, // Slight vertical variation
        z: 0,
        size: this.getPortalSize(pattern.type),
        speed: speed,
        horizontalSpeed: speed * 0.5, // Default horizontal speed for old system
        color: this.getPortalColor(pattern.type),
        frequency: pattern.frequency,
        frequencyRange: pattern.frequencyRange,
        spawnTime,
        targetTime,
        position: 'approach',
        isTraveling: false,
        travelProgress: 0,
        isMoving: false, // Old system doesn't use continuous movement
        travelLane: 0, // Default lane
        beatMatch: false // Will be determined during gameplay
      };
    });
  }
  
  private getPortalSize(type: string): number {
    switch (type) {
      case 'bass': return 0.08; // Large bass portals
      case 'snare': return 0.06; // Medium snare portals
      case 'hihat': return 0.04; // Small hi-hat portals
      default: return 0.05;
    }
  }
  
  private getPortalSpeed(type: string): number {
    switch (type) {
      case 'bass': return 0.5; // Slow movement for bass
      case 'snare': return 0.8; // Medium movement for snare
      case 'hihat': return 1.2; // Fast movement for hi-hat
      default: return 0.8;
    }
  }
  
  private getPortalColor(type: string): string {
    switch (type) {
      case 'bass': return '#8B5A96'; // Deep purple for bass
      case 'snare': return '#00FFFF'; // Cyan for snare
      case 'hihat': return '#FFFF00'; // Yellow for hi-hat
      default: return '#FFFFFF';
    }
  }
  
  private gameLoop = () => {
    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    if (this.gameState.status === 'playing') {
      this.update(deltaTime);
    }
    
    this.render();
    this.animationId = requestAnimationFrame(this.gameLoop);
  };
  
  // Level system initialization
  private initializeLevelSystem() {
    console.log('🎮 Initializing level system...');
    this.currentLevelIndex = 0;
    this.updateCurrentLevel();
  }
  
  private updateCurrentLevel() {
    const currentLevel = this.levels[this.currentLevelIndex];
    if (currentLevel) {
      this.gameState.currentDifficulty = currentLevel.difficulty;
      this.gameState.currentSong = currentLevel.music;
      console.log(`🎯 Level ${currentLevel.id}: ${currentLevel.name} - ${currentLevel.description}`);
    }
  }
  
  private getCurrentLevel(): LevelData | null {
    return this.levels[this.currentLevelIndex] || null;
  }
  
  private update(deltaTime: number) {
    this.gameTime += deltaTime;
    this.beatTimer += deltaTime * 1000; // Convert to milliseconds
    
    // Handle beat-based spawning and audio
    this.updateBeatSystem(deltaTime);
    
    // Update Frogger-style portals
    this.updateFroggerPortals(deltaTime);
    
    // Update whips with wave patterns
    this.updateWhips(deltaTime);
    
    // Update visual effects
    this.updateVisualEffects(deltaTime);
    
    // Check collisions
    this.checkCollisions();
    
    // Update level progress
    this.updateLevelProgress();
    
    // Update game time
    this.updateGameState({ currentSongProgress: (this.gameTime / 60) * 100 });
  }
  
  private updateBeatSystem(deltaTime: number) {
    // Beat timer and spawning
    if (this.beatTimer >= this.beatInterval) {
      this.beatTimer = 0;
      this.currentBeat++;
      
      // Play beat sound based on beat pattern
      this.playBeatSound();
      
      // Spawn portals on beats
      this.spawnPortalOnBeat();
      
      // Create beat pulse visual effect
      this.createBeatPulseEffect();
    }
  }
  
  private playBeatSound() {
    if (!this.audioEnabled) return;
    
    // Play different sounds based on beat pattern
    if (this.currentBeat % 4 === 0) {
      // Bass beat every 4 beats
      this.audioManager.playSound('bass_drum_thud.mp3', 0.8);
    } else if (this.currentBeat % 2 === 0) {
      // Snare every 2 beats
      this.audioManager.playSound('snare_drum_crack.mp3', 0.7);
    } else {
      // Hi-hat on other beats
      this.audioManager.playSound('hi_hat_tinkle.mp3', 0.5);
    }
  }
  
  private createBeatPulseEffect() {
    const beatType = this.currentBeat % 4 === 0 ? 'bass' : 
                     this.currentBeat % 2 === 0 ? 'snare' : 'hihat';
    
    this.visualEffects.push({
      id: `beat_${Date.now()}`,
      type: 'beat_pulse',
      position: { x: 0.5, y: 0.5, z: 0 }, // Center of screen
      startTime: Date.now(),
      duration: 300,
      data: { beatType }
    });
  }
  
  private updateFroggerPortals(deltaTime: number) {
    this.portals.forEach(portal => {
      if (portal.isMoving) {
        // Move portal from left to right (Frogger-style)
        portal.x += portal.horizontalSpeed * deltaTime;
        
        // Remove portal when it goes off-screen
        if (portal.x > 1.2) {
          this.portals = this.portals.filter(p => p.id !== portal.id);
          return;
        }
        
        // Portal is active when it's in the middle region of screen
        portal.position = (portal.x > 0.3 && portal.x < 0.7) ? 'active' : 'approach';
        
        // Beat matching - portal matches beat when active
        portal.beatMatch = portal.position === 'active';
      }
    });
    
    // Spawn new portals based on current level
    this.spawnPortals(deltaTime);
  }
  
  private spawnPortals(deltaTime: number) {
    const currentLevel = this.getCurrentLevel();
    if (!currentLevel) return;
    
    this.portalSpawnTimer += deltaTime;
    const spawnInterval = 1 / currentLevel.spawnRate; // Convert spawn rate to interval
    
    if (this.portalSpawnTimer >= spawnInterval) {
      this.portalSpawnTimer = 0;
      this.spawnRandomPortal();
    }
  }
  
  private spawnPortalOnBeat() {
    // Higher chance to spawn on strong beats
    let spawnChance = 0.3; // Base chance
    
    if (this.currentBeat % 4 === 0) {
      spawnChance = 0.8; // High chance on bass beats
    } else if (this.currentBeat % 2 === 0) {
      spawnChance = 0.6; // Medium chance on snare beats
    }
    
    if (Math.random() < spawnChance) {
      this.spawnRandomPortal();
    }
  }
  
  private spawnRandomPortal() {
    const portalTypes: ('bass' | 'snare' | 'hihat')[] = ['bass', 'snare', 'hihat'];
    const type = portalTypes[Math.floor(Math.random() * portalTypes.length)];
    
    // Random lane (0-2) and slight vertical variation
    const lane = Math.floor(Math.random() * this.FROGGER_LANES);
    const laneYPositions = [0.3, 0.5, 0.7]; // Three horizontal lanes
    const y = laneYPositions[lane] + (Math.random() - 0.5) * 0.1;
    
    const currentLevel = this.getCurrentLevel();
    const speed = currentLevel ? currentLevel.portalSpeed : 0.3;
    
    const newPortal: Portal = {
      id: `portal_${Date.now()}_${Math.random()}`,
      type,
      x: -0.1, // Start off-screen left
      y,
      z: 0,
      size: this.getPortalSize(type),
      speed: speed,
      horizontalSpeed: speed * (0.5 + Math.random() * 0.5), // Add speed variation
      color: this.getPortalColor(type),
      frequency: this.FREQUENCY_MAPPING[type].min + Math.random() * (this.FREQUENCY_MAPPING[type].max - this.FREQUENCY_MAPPING[type].min),
      frequencyRange: this.FREQUENCY_MAPPING[type].range,
      spawnTime: Date.now(),
      targetTime: Date.now() + 2000, // 2 seconds to cross screen
      position: 'approach',
      isMoving: true,
      travelLane: lane,
      beatMatch: false
    };
    
    this.portals.push(newPortal);
  }
  
  private updateWhips(deltaTime: number) {
    this.activeWhips = this.activeWhips.filter(whip => {
      // Update whip movement along trajectory
      whip.extensionProgress += deltaTime * 2;
      
      if (whip.extensionProgress >= 1) {
        whip.extensionProgress = 1;
        whip.isActive = false;
        return false;
      }
      
      // Update trail points
      whip.trailPoints = whip.trailPoints.filter(point => {
        point.alpha -= deltaTime * 2;
        return point.alpha > 0;
      });
      
      return true;
    });
  }
  
  private updateVisualEffects(deltaTime: number) {
    this.visualEffects = this.visualEffects.filter(effect => {
      const effectProgress = (Date.now() - effect.startTime) / effect.duration;
      return effectProgress <= 1;
    });
  }
  
  private checkCollisions() {
    this.activeWhips.forEach(whip => {
      if (!whip.hitDetection) return;
      
      this.portals.forEach(portal => {
        if (portal.position !== 'active') return;
        
        // Calculate collision based on whip trajectory
        if (this.isWhipCollidingWithPortal(whip, portal)) {
          console.log(`⚡ Collision detected! Whip at ${this.getWhipCurrentPosition(whip).x.toFixed(0)}, ${this.getWhipCurrentPosition(whip).y.toFixed(0)} | Portal at ${(portal.x * this.canvas.width).toFixed(0)}, ${(portal.y * this.canvas.height).toFixed(0)}`);
          this.handlePortalHit(portal, whip);
        }
      });
    });
  }
  
  private isWhipCollidingWithPortal(whip: Whip, portal: Portal): boolean {
    const currentPos = this.getWhipCurrentPosition(whip);
    const portalPos = { x: portal.x * this.canvas.width, y: portal.y * this.canvas.height };
    const distance = Math.sqrt(
      Math.pow(currentPos.x - portalPos.x, 2) + 
      Math.pow(currentPos.y - portalPos.y, 2)
    );
    
    // Increased hit detection radius for better playability
    const hitRadius = portal.size * this.canvas.width * 0.8; // Increased from 0.5 to 0.8
    
    return distance < hitRadius;
  }
  
  private getWhipCurrentPosition(whip: Whip): { x: number; y: number } {
    const t = whip.extensionProgress;
    const { start, control, end } = whip.trajectory;
    
    // Bezier curve calculation
    const x = Math.pow(1 - t, 2) * start.x + 2 * (1 - t) * t * control.x + Math.pow(t, 2) * end.x;
    const y = Math.pow(1 - t, 2) * start.y + 2 * (1 - t) * t * control.y + Math.pow(t, 2) * end.y;
    
    return { x, y };
  }
  
  private fireWhip(targetPosition: { x: number; y: number }) {
    if (this.gameState.status !== 'playing') return;
    
    const canvasCenter = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
    
    console.log('🔫 Firing movement-based wormhole whip at', targetPosition);
    
    // Get cursor or touch speed for wave pattern
    let cursorSpeed = 0;
    let cursorVelocity = { x: 0, y: 0 };
    let isTouchInput = false;
    
    // Check if using touch input
    if (this.inputManager.hasActiveTouch()) {
      cursorSpeed = this.inputManager.getCurrentTouchSpeed();
      cursorVelocity = this.inputManager.getTouchVelocity();
      isTouchInput = true;
      console.log('📱 Using touch input - Speed:', cursorSpeed.toFixed(0), 'Velocity:', cursorVelocity);
    } else {
      cursorSpeed = this.inputManager.getAverageCursorSpeed();
      cursorVelocity = this.inputManager.getCursorVelocity();
      console.log('🖱️ Using mouse input - Speed:', cursorSpeed.toFixed(0), 'Velocity:', cursorVelocity);
    }
    
    // Create wave pattern based on input type and speed
    const wavePattern = this.createWavePattern(cursorSpeed, cursorVelocity);
    
    // Create curved trajectory with control point
    const trajectory = {
      start: canvasCenter,
      control: {
        x: (canvasCenter.x + targetPosition.x) / 2 + (Math.random() - 0.5) * 200,
        y: (canvasCenter.y + targetPosition.y) / 2 + (Math.random() - 0.5) * 200
      },
      end: targetPosition
    };
    
    // Calculate velocity based on cursor speed for movement-based speed control
    const speedFactor = Math.min(cursorSpeed / 500, 2); // Normalize speed, cap at 2x
    const whipVelocity = 0.5 + speedFactor * 0.5; // 0.5x to 1.5x based on movement
    
    const newWhip: Whip = {
      id: `whip_${Date.now()}`,
      position: canvasCenter,
      targetPosition,
      trajectory,
      velocity: whipVelocity,
      isActive: true,
      isExtending: true,
      extensionProgress: 0,
      trailPoints: [],
      cosmicEnergy: 1.0,
      whipLength: 0,
      whipAngle: 0,
      createdTime: Date.now(),
      hitDetection: true,
      wavePattern,
      cursorSpeed
    };
    
    this.activeWhips.push(newWhip);
    
    // Play appropriate whip sound based on speed
    const whipSound = speedFactor > 1 ? 'heavy_whip_crack.mp3' : 'light_whip_crack.mp3';
    this.audioManager.playSound(whipSound, 0.7);
    
    // Enhanced visual feedback for touch input
    this.createTouchVisualFeedback(targetPosition, isTouchInput);
    
    // Create wave trail visual effect
    this.visualEffects.push({
      id: `whip_trail_${Date.now()}`,
      type: 'wave_trail',
      position: { x: targetPosition.x / this.canvas.width, y: targetPosition.y / this.canvas.height, z: 0 },
      startTime: Date.now(),
      duration: 1000,
      data: { wavePattern, speedFactor, isTouchInput }
    });
    
    console.log('✅ Movement-based wormhole whip created, active whips:', this.activeWhips.length);
  }
  
  private createTouchVisualFeedback(position: { x: number; y: number }, isTouchInput: boolean) {
    if (isTouchInput) {
      // Create special visual feedback for touch input
      this.visualEffects.push({
        id: `touch_feedback_${Date.now()}`,
        type: 'particle',
        position: { x: position.x / this.canvas.width, y: position.y / this.canvas.height, z: 0 },
        startTime: Date.now(),
        duration: 300,
        data: { 
          type: 'touch_pulse',
          color: '#00FFFF',
          particleCount: 8
        }
      });
      
      // Add haptic-like feedback through visual effects
      console.log('🎯 Touch feedback visual effect created');
    }
  }
  
  private createWavePattern(cursorSpeed: number, cursorVelocity: { x: number; y: number }) {
    // Normalize cursor speed to determine wave characteristics
    const speedFactor = Math.min(cursorSpeed / 1000, 2); // Cap at 2x speed
    
    return {
      amplitude: 20 + speedFactor * 30, // Higher speed = bigger waves
      frequency: 2 + speedFactor * 3, // Higher speed = faster waves
      phase: Math.random() * Math.PI * 2, // Random phase
      decay: 0.8, // Wave decay rate
      waveType: speedFactor > 1 ? 'sawtooth' : 'sine' as 'sine' | 'cosine' | 'sawtooth' | 'square'
    };
  }
  
  // Touch event handlers for mobile support
  private handleTouchEnd(position: { x: number; y: number }, gesture: any) {
    // Handle touch end based on gesture type
    if (gesture.type === 'tap') {
      this.fireWhip(position);
    } else if (gesture.type === 'double_tap') {
      // Double tap - no action needed, speed controlled by movement
    } else if (gesture.type === 'long_press') {
      // Long press could pause or open settings
      this.togglePause();
    }
  }
  
  private handleTouchGesture(gesture: any) {
    switch (gesture.type) {
      case 'swipe':
        this.handleSwipeGesture(gesture);
        break;
      case 'drag':
        // Handle drag for continuous aiming
        break;
    }
  }
  
  private handleSwipeGesture(gesture: any) {
    const { velocity } = gesture;
    if (!velocity) return;
    
    const absX = Math.abs(velocity.x);
    const absY = Math.abs(velocity.y);
    
    if (absX > absY) {
      // Horizontal swipe - no action needed, speed controlled by movement
      if (velocity.x > 0) {
        // Swipe right detected
      } else {
        // Swipe left detected
      }
    } else {
      // Vertical swipe - game controls
      if (velocity.y > 0) {
        // Swipe down - could pause
        this.togglePause();
      } else {
        // Swipe up - could open menu
        // Menu handling could be added here
      }
    }
  }
  
  private handleOrientationChange(orientation: 'portrait' | 'landscape') {
    console.log('Orientation changed to:', orientation);
    
    // Adjust game UI for mobile orientation
    if (orientation === 'portrait') {
      // Optimize for portrait mode
      this.adjustUIForMobile('portrait');
    } else {
      // Optimize for landscape mode
      this.adjustUIForMobile('landscape');
    }
  }
  
  private adjustUIForMobile(orientation: 'portrait' | 'landscape') {
    // Adjust game settings based on mobile orientation
    if (this.inputManager.isMobileDevice()) {
      // Increase touch sensitivity for mobile
      // Adjust UI elements for smaller screens
      // Handle different aspect ratios
      console.log('Adjusted UI for mobile', orientation, 'mode');
    }
  }
  

  
  private handlePortalHit(portal: Portal, whip: Whip) {
    const timeDiff = Math.abs(Date.now() - portal.targetTime);
    let quality: 'perfect' | 'great' | 'good' | 'hit' | 'miss' = 'miss';
    let score = 0;
    
    // More forgiving timing windows
    if (portal.beatMatch && timeDiff <= 100) {
      // Bonus for hitting on beat with more forgiving timing
      quality = timeDiff <= 30 ? 'perfect' : timeDiff <= 60 ? 'great' : 'good';
      score = quality === 'perfect' ? 1500 : quality === 'great' ? 1200 : 900;
    } else {
      // Standard timing windows (more forgiving)
      quality = timeDiff <= 30 ? 'perfect' : timeDiff <= 60 ? 'great' : timeDiff <= 100 ? 'good' : timeDiff <= 200 ? 'hit' : 'miss';
      score = quality === 'perfect' ? 1000 : quality === 'great' ? 800 : quality === 'good' ? 600 : quality === 'hit' ? 400 : 0;
    }
    
    if (quality !== 'miss') {
      portal.hitQuality = quality;
      this.handleScore(quality, score);
      this.triggerPortalTravel(portal);
      this.createHitEffect(portal, quality);
      
      // Play hit sound with spatial positioning
      const soundName = quality === 'perfect' ? 'perfect_hit_chime.mp3' : 'good_hit_buzz.mp3';
      this.audioManager.playSound(soundName, 0.8);
      
      // Update level progress
      this.updateGameState({ 
        portalsHit: this.gameState.portalsHit + 1,
        portalsTotal: this.gameState.portalsTotal + 1
      });
      
      // Debug logging
      console.log(`🎯 Portal hit! Quality: ${quality}, Score: ${score}, Time diff: ${timeDiff}ms`);
      
      // Check for level completion
      this.checkLevelCompletion();
      
      // Remove portal
      this.portals = this.portals.filter(p => p.id !== portal.id);
      whip.hitDetection = false;
    } else {
      console.log(`❌ Missed portal. Time diff: ${timeDiff}ms, Beat match: ${portal.beatMatch}`);
    }
  }
  
  private triggerPortalTravel(portal: Portal) {
    // Start portal travel sequence
    portal.isTraveling = true;
    portal.travelProgress = 0;
    
    // Play travel sound with spatial positioning
    this.audioManager.playSound('portal_travel_swoosh.mp3', 0.9);
    
    // Create travel effect
    this.visualEffects.push({
      id: `travel_${Date.now()}`,
      type: 'portal_travel',
      position: { x: portal.x, y: portal.y, z: portal.z },
      startTime: Date.now(),
      duration: 2000,
      data: { portalType: portal.type, dimension: portal.id }
    });
    
    // Check if this should trigger level transition
    const currentLevel = this.getCurrentLevel();
    if (currentLevel && this.gameState.portalsHit >= currentLevel.requiredHits) {
      setTimeout(() => {
        this.triggerLevelTransition();
      }, 1000);
    }
  }
  
  private triggerLevelTransition() {
    if (this.gameState.status !== 'playing') return;
    
    this.updateGameState({ 
      status: 'level_complete',
      transitionActive: true 
    });
    
    // Play level completion sound
    this.audioManager.playSound('combo_bonus.mp3', 0.8);
    
    // Create level transition effect
    this.visualEffects.push({
      id: `level_transition_${Date.now()}`,
      type: 'level_transition',
      position: { x: 0.5, y: 0.5, z: 0 },
      startTime: Date.now(),
      duration: 3000,
      data: { levelIndex: this.currentLevelIndex }
    });
    
    // Transition to next level after 3 seconds
    setTimeout(() => {
      this.proceedToNextLevel();
    }, 3000);
  }
  
  private proceedToNextLevel() {
    const currentLevel = this.getCurrentLevel();
    
    if (currentLevel) {
      // Award bonus score for level completion
      const bonusScore = currentLevel.bonusScore;
      this.updateGameState({ 
        score: this.gameState.score + bonusScore,
        level: this.gameState.level + 1
      });
      
      console.log(`🎉 Level ${currentLevel.id} completed! Bonus: ${bonusScore} points`);
    }
    
    // Move to next level
    this.currentLevelIndex++;
    
    if (this.currentLevelIndex < this.levels.length) {
      // Continue to next level
      this.updateGameState({ 
        status: 'playing',
        transitionActive: false,
        portalsHit: 0,
        portalsTotal: 0
      });
      
      this.updateCurrentLevel();
      this.changeDimension();
      
      // Clear existing portals and start fresh
      this.portals = [];
      this.levelStartTime = Date.now();
      
      console.log(`🚀 Starting Level ${this.levels[this.currentLevelIndex].name}`);
    } else {
      // Game completed!
      this.updateGameState({ status: 'gameover' });
      this.audioManager.stopAll();
      console.log('🏆 All levels completed! Game finished!');
    }
  }
  
  private checkLevelCompletion() {
    const currentLevel = this.getCurrentLevel();
    if (!currentLevel) return;
    
    const progress = (this.gameState.portalsHit / currentLevel.requiredHits) * 100;
    this.updateGameState({ levelProgress: progress });
    
    if (this.gameState.portalsHit >= currentLevel.requiredHits) {
      this.triggerLevelTransition();
    }
  }
  
  private updateLevelProgress() {
    const currentLevel = this.getCurrentLevel();
    if (!currentLevel || this.gameState.status !== 'playing') return;
    
    // Update time-based progress
    const elapsedTime = (Date.now() - this.levelStartTime) / 1000;
    const timeProgress = (elapsedTime / currentLevel.timeLimit) * 100;
    
    // Combine hit-based and time-based progress
    const hitProgress = (this.gameState.portalsHit / currentLevel.requiredHits) * 100;
    const combinedProgress = Math.max(hitProgress, timeProgress * 0.7); // Weight hits more heavily
    
    this.updateGameState({ levelProgress: Math.min(combinedProgress, 100) });
  }
  
  private changeDimension() {
    const newDimension = this.getRandomDimension();
    this.currentDimension = newDimension;
    
    // Update background and music for new dimension
    this.audioManager.playMusic(`${newDimension}_theme.mp3`, 0.6);
  }
  
  private handlePortalMiss(portal: Portal) {
    portal.hitQuality = 'miss';
    this.updateCombo(0); // Reset combo
    this.updateHealth(-1); // Reduced penalty from -5 to -1
    
    // Play miss sound
    this.audioManager.playSound('miss_alert.mp3', 0.6);
    
    // Create miss effect
    this.createMissEffect(portal);
  }
  
  private handleScore(quality: string, baseScore: number) {
    const comboMultiplier = Math.min(1 + (this.gameState.combo * 0.02), 3);
    const finalScore = Math.floor(baseScore * comboMultiplier);
    
    this.updateGameState({ 
      score: this.gameState.score + finalScore,
    });
    
    this.updateCombo(1);
    
    // Play combo bonus for high combos
    if (this.gameState.combo > 0 && this.gameState.combo % 10 === 0) {
      this.audioManager.playSound('combo_bonus.mp3', 0.5);
    }
  }
  
  private updateCombo(increment: number) {
    const newCombo = Math.max(0, this.gameState.combo + increment);
    const maxCombo = Math.max(this.gameState.maxCombo, newCombo);
    
    this.updateGameState({ 
      combo: newCombo,
      maxCombo: maxCombo,
    });
  }
  
  private updateHealth(change: number) {
    const newHealth = Math.max(0, Math.min(100, this.gameState.health + change));
    this.updateGameState({ health: newHealth });
    
    if (newHealth <= 0) {
      this.endGame();
    }
  }
  
  private createHitEffect(portal: Portal, quality: string) {
    this.visualEffects.push({
      id: `hit_${Date.now()}_${Math.random()}`,
      type: 'portal_hit',
      position: { x: portal.x, y: portal.y, z: portal.z },
      startTime: Date.now(),
      duration: 1000,
      data: { quality, portalType: portal.type },
    });
  }
  
  private createMissEffect(portal: Portal) {
    this.visualEffects.push({
      id: `miss_${Date.now()}_${Math.random()}`,
      type: 'particle',
      position: { x: portal.x, y: portal.y, z: portal.z },
      startTime: Date.now(),
      duration: 500,
      data: { type: 'miss' },
    });
  }
  

  
  private togglePause() {
    if (this.gameState.status === 'playing') {
      this.pauseGame();
    } else if (this.gameState.status === 'paused') {
      this.resumeGame();
    }
  }
  
  public startGame() {
    this.gameState.status = 'playing';
    this.gameStartTime = Date.now();
    this.levelStartTime = Date.now();
    this.gameTime = 0;
    this.currentBeat = 0;
    this.beatTimer = 0;
    
    // Reset level progress
    this.updateGameState({ 
      status: 'playing',
      levelProgress: 0,
      portalsHit: 0,
      portalsTotal: 0,
      transitionActive: false
    });
    
    // Clear existing game objects
    this.portals = [];
    this.activeWhips = [];
    this.visualEffects = [];
    
    // Start background music for current level
    const currentLevel = this.getCurrentLevel();
    if (currentLevel) {
      this.audioManager.playMusic(currentLevel.music, 0.7);
    } else {
      this.audioManager.playMusic('cosmic_theme_music.mp3', 0.7);
    }
    
    console.log('🎮 Enhanced game started with level progression!');
  }
  
  public pauseGame() {
    this.gameState.status = 'paused';
    this.updateGameState({ status: 'paused' });
    this.audioManager.pauseAll();
  }
  
  public resumeGame() {
    this.gameState.status = 'playing';
    this.updateGameState({ status: 'playing' });
    this.audioManager.resumeAll();
  }
  
  public restartGame() {
    this.gameState = {
      ...this.gameState,
      status: 'menu',
      score: 0,
      combo: 0,
      health: 100,
      level: 1,
      maxCombo: 0,
      accuracy: 100,
      currentSongProgress: 0,
      levelProgress: 0,
      portalsHit: 0,
      portalsTotal: 0,
      currentDifficulty: 'easy',
      transitionActive: false
    };
    
    // Reset level system
    this.currentLevelIndex = 0;
    this.updateCurrentLevel();
    
    // Clear all game objects
    this.portals = [];
    this.activeWhips = [];
    this.visualEffects = [];
    
    // Reset timers
    this.gameStartTime = 0;
    this.gameTime = 0;
    this.levelStartTime = 0;
    this.currentBeat = 0;
    this.beatTimer = 0;
    
    this.audioManager.stopAll();
    this.updateGameState(this.gameState);
    
    console.log('🔄 Game restarted - Enhanced mechanics ready!');
  }
  
  private toggleAudio() {
    this.audioEnabled = !this.audioEnabled;
    
    if (this.audioEnabled) {
      this.audioManager.resumeAll();
      console.log('🔊 Audio enabled');
    } else {
      this.audioManager.pauseAll();
      console.log('🔇 Audio disabled');
    }
  }
  
  private endGame() {
    this.gameState.status = 'gameover';
    this.updateGameState({ status: 'gameover' });
    this.audioManager.stopAll();
  }
  
  private updateGameState(updates: Partial<GameState>) {
    this.gameState = { ...this.gameState, ...updates };
    if (this.onGameStateChange) {
      this.onGameStateChange(updates);
    }
  }
  
  private render() {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render using visual renderer
    this.visualRenderer.update(
      this.portals, 
      this.activeWhips, 
      this.visualEffects, 
      this.gameState,
      this.crosshairPosition,
      this.currentDimension
    );
  }
  
  public destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    this.audioManager.stopAll();
  }
}
