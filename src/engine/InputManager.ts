import { GameInput, TouchGesture, MobileConfig } from '../types/game';

export class InputManager {
  private canvas: HTMLCanvasElement;
  private inputState: GameInput;
  private gameEngine: any; // Reference to GameEngine for callbacks
  private lastMousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private lastPositionTime: number = 0;
  private speedSamples: number[] = []; // For smoothing speed calculation
  private maxSpeedSamples = 5; // Number of samples to average
  
  // Touch tracking
  private touchHistory: Array<{x: number, y: number, time: number}> = [];
  private gestureHistory: TouchGesture[] = [];
  private lastTapTime = 0;
  private pendingDoubleTap = false;
  private mobileConfig: MobileConfig;
  private touchStartTime = 0;
  private isLongPress = false;
  private longPressTimer: number | null = null;
  
  // Event callbacks
  public onMouseMove: ((position: { x: number; y: number }) => void) | null = null;
  public onMouseClick: ((position: { x: number; y: number }) => void) | null = null;
  public onKeyDown: ((key: string) => void) | null = null;
  public onKeyUp: ((key: string) => void) | null = null;
  
  // Touch callbacks
  public onTouchStart: ((position: { x: number; y: number }, touches: Touch[]) => void) | null = null;
  public onTouchMove: ((position: { x: number; y: number }, touches: Touch[]) => void) | null = null;
  public onTouchEnd: ((position: { x: number; y: number }, gesture: TouchGesture) => void) | null = null;
  public onTouchGesture: ((gesture: TouchGesture) => void) | null = null;
  public onOrientationChange: ((orientation: 'portrait' | 'landscape') => void) | null = null;
  
  constructor(canvas: HTMLCanvasElement, gameEngine: any) {
    this.canvas = canvas;
    this.gameEngine = gameEngine;
    
    // Initialize mobile configuration
    this.mobileConfig = {
      touchSensitivity: 1.0,
      gestureTimeout: 500,
      doubleTapThreshold: 300,
      longPressThreshold: 700,
      swipeThreshold: 30,
      hapticFeedback: true,
      showTouchVisualization: false
    };
    
    // Initialize input state with mobile support
    this.inputState = {
      mousePosition: { x: 0, y: 0 },
      isMouseDown: false,
      keyStates: {},
      lastInputTime: 0,
      cursorSpeed: 0,
      cursorVelocity: { x: 0, y: 0 },
      averageCursorSpeed: 0,
      
      // Touch screen support
      isTouchActive: false,
      touchPosition: { x: 0, y: 0 },
      touchStartPosition: { x: 0, y: 0 },
      touchVelocity: { x: 0, y: 0 },
      touchSpeed: 0,
      touchStartTime: 0,
      multiTouchCount: 0,
      activeTouches: [],
      touchGestures: [],
      lastTouchInteraction: 0,
      
      // Mobile device info
      isMobileDevice: this.detectMobileDevice(),
      devicePixelRatio: window.devicePixelRatio || 1,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      orientation: this.getOrientation()
    };
    
    this.lastMousePosition = { x: 0, y: 0 };
    this.lastPositionTime = Date.now();
    this.speedSamples = [];
    
    this.setupEventListeners();
    this.setupMobileOptimizations();
  }
  
  private detectMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0);
  }
  
  private getOrientation(): 'portrait' | 'landscape' {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }
  
  private setupMobileOptimizations() {
    // Prevent default mobile behaviors
    document.addEventListener('touchstart', this.preventDefaultBehaviors.bind(this), { passive: false });
    document.addEventListener('touchmove', this.preventDefaultBehaviors.bind(this), { passive: false });
    document.addEventListener('touchend', this.preventDefaultBehaviors.bind(this), { passive: false });
    
    // Handle orientation changes
    window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
    window.addEventListener('resize', this.handleOrientationChange.bind(this));
    
    // Prevent zoom on mobile
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    document.addEventListener('gestureend', (e) => e.preventDefault());
    
    // Enable touch callouts for better UX
    (this.canvas.style as any).webkitUserSelect = 'none';
    this.canvas.style.userSelect = 'none';
    (this.canvas.style as any).webkitTouchCallout = 'none';
    (this.canvas.style as any).webkitTapHighlightColor = 'transparent';
  }
  
  private preventDefaultBehaviors(event: TouchEvent) {
    // Prevent scrolling, zooming, and other default behaviors during gameplay
    if (this.inputState.isTouchActive) {
      event.preventDefault();
    }
  }
  
  private handleOrientationChange() {
    this.inputState.screenWidth = window.innerWidth;
    this.inputState.screenHeight = window.innerHeight;
    this.inputState.orientation = this.getOrientation();
    
    // Update canvas size
    this.canvas.width = window.innerWidth * this.inputState.devicePixelRatio;
    this.canvas.height = window.innerHeight * this.inputState.devicePixelRatio;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    
    if (this.onOrientationChange) {
      this.onOrientationChange(this.inputState.orientation);
    }
  }
  
  private setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('click', this.handleClick.bind(this));
    
    // Enhanced touch events for mobile
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });
    
    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Prevent context menu
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Window resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  private getCanvasCoordinates(event: MouseEvent | TouchEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }
  
  private handleMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.inputState.isMouseDown = true;
    this.inputState.lastInputTime = Date.now();
    
    const pos = this.getCanvasCoordinates(event);
    this.inputState.mousePosition = pos;
  }
  
  private handleMouseUp(event: MouseEvent): void {
    event.preventDefault();
    this.inputState.isMouseDown = false;
  }
  
  private handleMouseMove(event: MouseEvent): void {
    const pos = this.getCanvasCoordinates(event);
    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastPositionTime) / 1000; // Convert to seconds
    
    // Calculate cursor velocity and speed
    const deltaX = pos.x - this.lastMousePosition.x;
    const deltaY = pos.y - this.lastMousePosition.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Calculate speed in pixels per second
    const currentSpeed = deltaTime > 0 ? distance / deltaTime : 0;
    
    // Update speed samples for smoothing
    this.speedSamples.push(currentSpeed);
    if (this.speedSamples.length > this.maxSpeedSamples) {
      this.speedSamples.shift();
    }
    
    // Calculate smoothed average speed
    const averageSpeed = this.speedSamples.reduce((sum, speed) => sum + speed, 0) / this.speedSamples.length;
    
    // Update input state with cursor movement data
    this.inputState.mousePosition = pos;
    this.inputState.cursorSpeed = currentSpeed;
    this.inputState.cursorVelocity = { x: deltaX, y: deltaY };
    this.inputState.averageCursorSpeed = averageSpeed;
    
    // Update tracking variables
    this.lastMousePosition = pos;
    this.lastPositionTime = currentTime;
    
    if (this.onMouseMove) {
      this.onMouseMove(pos);
    }
  }
  
  private handleClick(event: MouseEvent): void {
    event.preventDefault();
    const pos = this.getCanvasCoordinates(event);
    
    if (this.onMouseClick) {
      this.onMouseClick(pos);
    }
  }
  
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    
    const touches = Array.from(event.touches);
    const mainTouch = touches[0];
    const pos = this.getCanvasCoordinatesFromTouch(mainTouch);
    
    // Update touch state
    this.inputState.isTouchActive = true;
    this.inputState.isMouseDown = true;
    this.inputState.touchPosition = pos;
    this.inputState.touchStartPosition = pos;
    this.inputState.touchStartTime = Date.now();
    this.inputState.multiTouchCount = touches.length;
    this.inputState.activeTouches = touches;
    this.inputState.lastTouchInteraction = Date.now();
    this.inputState.lastInputTime = Date.now();
    
    // Clear touch history and start new gesture
    this.touchHistory = [{ x: pos.x, y: pos.y, time: Date.now() }];
    this.isLongPress = false;
    
    // Start long press timer
    this.longPressTimer = window.setTimeout(() => {
      this.isLongPress = true;
      this.handleLongPress();
    }, this.mobileConfig.longPressThreshold);
    
    // Check for double tap (track for gesture analysis)
    const now = Date.now();
    this.pendingDoubleTap = (now - this.lastTapTime < this.mobileConfig.doubleTapThreshold);
    this.lastTapTime = now;
    
    // Add to touch history for gesture analysis
    this.addToTouchHistory(pos);
    
    // Call touch start callback
    if (this.onTouchStart) {
      this.onTouchStart(pos, touches);
    }
  }
  
  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    
    const touches = Array.from(event.touches);
    const mainTouch = touches[0];
    const pos = this.getCanvasCoordinatesFromTouch(mainTouch);
    
    // Update touch state
    this.inputState.touchPosition = pos;
    this.inputState.multiTouchCount = touches.length;
    this.inputState.activeTouches = touches;
    this.inputState.lastTouchInteraction = Date.now();
    
    // Calculate touch velocity and speed
    if (this.touchHistory.length > 0) {
      const lastPoint = this.touchHistory[this.touchHistory.length - 1];
      const deltaTime = (Date.now() - lastPoint.time) / 1000;
      
      if (deltaTime > 0) {
        this.inputState.touchVelocity = {
          x: (pos.x - lastPoint.x) / deltaTime,
          y: (pos.y - lastPoint.y) / deltaTime
        };
        
        this.inputState.touchSpeed = Math.sqrt(
          Math.pow(this.inputState.touchVelocity.x, 2) + 
          Math.pow(this.inputState.touchVelocity.y, 2)
        );
      }
    }
    
    // Add to touch history
    this.touchHistory.push({ x: pos.x, y: pos.y, time: Date.now() });
    
    // Keep only recent history
    if (this.touchHistory.length > 10) {
      this.touchHistory.shift();
    }
    
    // Cancel long press if moving
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    
    // Detect swipe gesture
    this.detectSwipeGesture();
    
    // Add to touch history for gesture analysis
    this.addToTouchHistory(pos);
    
    // Call touch move callback
    if (this.onTouchMove) {
      this.onTouchMove(pos, touches);
    }
  }
  
  private addToTouchHistory(position: { x: number; y: number }) {
    this.touchHistory.push({ x: position.x, y: position.y, time: Date.now() });
    
    // Keep only recent points for analysis (max 10 points)
    if (this.touchHistory.length > 10) {
      this.touchHistory.shift();
    }
  }
  
  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    
    const touches = event.touches;
    const changedTouches = Array.from(event.changedTouches);
    const mainTouch = changedTouches[0];
    const pos = this.getCanvasCoordinatesFromTouch(mainTouch);
    
    // Update touch state
    this.inputState.isTouchActive = false;
    this.inputState.isMouseDown = false;
    this.inputState.multiTouchCount = touches.length;
    this.inputState.activeTouches = Array.from(touches);
    this.inputState.lastTouchInteraction = Date.now();
    
    // Cancel long press timer
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    
    // Create and analyze gesture
    const gesture = this.createTouchGesture(pos);
    
    // Call touch end callback with gesture
    if (this.onTouchEnd) {
      this.onTouchEnd(pos, gesture);
    }
    
    // Handle gesture-based actions
    this.handleGesture(gesture);
    
    // Clear gesture flags
    this.isLongPress = false;
  }
  
  private handleTouchCancel(event: TouchEvent): void {
    event.preventDefault();
    
    // Reset touch state
    this.inputState.isTouchActive = false;
    this.inputState.isMouseDown = false;
    this.inputState.multiTouchCount = 0;
    this.inputState.activeTouches = [];
    
    // Cancel long press timer
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    
    this.isLongPress = false;
  }
  
  private handleKeyDown(event: KeyboardEvent): void {
    event.preventDefault();
    this.inputState.keyStates[event.code] = true;
    this.inputState.lastInputTime = Date.now();
    
    // Handle key-specific actions
    switch (event.code) {
      case 'Space':
      case 'KeyR':
      case 'KeyP':
        if (this.onKeyDown) {
          this.onKeyDown(event.code);
        }
        break;
    }
  }
  
  private handleKeyUp(event: KeyboardEvent): void {
    event.preventDefault();
    this.inputState.keyStates[event.code] = false;
    
    if (this.onKeyUp) {
      this.onKeyUp(event.code);
    }
  }
  
  // Remove resize handler as GameEngine handles this
  private handleResize(): void {
    // Resize is handled by GameEngine
  }
  
  public getInputState(): GameInput {
    return { ...this.inputState };
  }
  
  public getCursorSpeed(): number {
    return this.inputState.cursorSpeed;
  }
  
  public getAverageCursorSpeed(): number {
    return this.inputState.averageCursorSpeed;
  }
  
  public getCursorVelocity(): { x: number; y: number } {
    return { ...this.inputState.cursorVelocity };
  }
  
  public isKeyPressed(key: string): boolean {
    return !!this.inputState.keyStates[key];
  }
  
  public getMousePosition(): { x: number; y: number } {
    return { ...this.inputState.mousePosition };
  }
  
  public isMouseDown(): boolean {
    return this.inputState.isMouseDown;
  }
  
  public getLastInputTime(): number {
    return this.inputState.lastInputTime;
  }
  
  public getTimeSinceLastInput(): number {
    return Date.now() - this.inputState.lastInputTime;
  }
  
  // Enhanced touch and gesture methods
  private getCanvasCoordinatesFromTouch(touch: Touch): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    };
  }
  
  private createTouchGesture(endPosition: { x: number; y: number }): TouchGesture {
    const startTime = this.inputState.touchStartTime;
    const endTime = Date.now();
    const duration = endTime - startTime;
    const startPos = this.inputState.touchStartPosition;
    const distance = Math.sqrt(
      Math.pow(endPosition.x - startPos.x, 2) + 
      Math.pow(endPosition.y - startPos.y, 2)
    );
    
    // Determine gesture type based on movement and timing
    let gestureType: TouchGesture['type'] = 'tap';
    
    // Check for double tap first (highest priority for quick gestures)
    if (this.pendingDoubleTap && duration < 300 && distance < 15) {
      gestureType = 'double_tap';
    }
    // Check for long press (timer-based)
    else if (this.isLongPress && duration >= this.mobileConfig.longPressThreshold - 50) {
      gestureType = 'long_press';
    }
    // Check for tap (quick, minimal movement)
    else if (duration < 200 && distance < 10) {
      gestureType = 'tap';
    }
    // Check for swipe (significant movement)
    else if (distance > this.mobileConfig.swipeThreshold) {
      gestureType = 'swipe';
    }
    // Check for drag (moderate movement over time)
    else if (duration > 200 && duration < 1000 && distance > 5) {
      gestureType = 'drag';
    }
    
    // Calculate velocity for dynamic gestures
    let velocity: { x: number; y: number } | undefined;
    if (this.touchHistory.length >= 2) {
      const firstPoint = this.touchHistory[0];
      const lastPoint = this.touchHistory[this.touchHistory.length - 1];
      const timeDiff = (lastPoint.time - firstPoint.time) / 1000;
      
      if (timeDiff > 0) {
        velocity = {
          x: (lastPoint.x - firstPoint.x) / timeDiff,
          y: (lastPoint.y - firstPoint.y) / timeDiff
        };
      }
    }
    
    const gesture: TouchGesture = {
      type: gestureType,
      startTime,
      endTime,
      startPosition: startPos,
      endPosition,
      velocity,
      distance,
      duration,
      touches: this.inputState.activeTouches
    };
    
    this.gestureHistory.push(gesture);
    
    // Keep only recent gestures
    if (this.gestureHistory.length > 20) {
      this.gestureHistory.shift();
    }
    
    return gesture;
  }
  
  private handleGesture(gesture: TouchGesture): void {
    if (this.onTouchGesture) {
      this.onTouchGesture(gesture);
    }
    
    // Handle gesture-specific actions
    switch (gesture.type) {
      case 'tap':
        this.handleTapGesture(gesture.endPosition!);
        break;
      case 'double_tap':
        this.handleDoubleTap(gesture.endPosition!);
        break;
      case 'long_press':
        this.handleLongPress();
        break;
      case 'swipe':
        this.handleSwipeGesture(gesture);
        break;
      case 'drag':
        this.handleDragGesture(gesture);
        break;
    }
  }
  
  private handleTapGesture(position: { x: number; y: number }): void {
    // Trigger fire action on tap
    if (this.onMouseClick) {
      this.onMouseClick(position);
    }
  }
  
  private handleDoubleTap(position: { x: number; y: number }): void {
    // Handle whip type switching or special actions
    console.log('Double tap detected at', position);
    // Could switch whip types or trigger special effects
  }
  
  private handleLongPress(): void {
    // Handle long press for whip type selection or menu
    console.log('Long press detected');
    // Could open menu or change whip types
  }
  
  private handleSwipeGesture(gesture: TouchGesture): void {
    const { velocity } = gesture;
    if (!velocity) return;
    
    // Determine swipe direction
    const absX = Math.abs(velocity.x);
    const absY = Math.abs(velocity.y);
    
    if (absX > absY) {
      // Horizontal swipe
      if (velocity.x > 0) {
        console.log('Swipe right - could change whip type');
      } else {
        console.log('Swipe left - could change whip type');
      }
    } else {
      // Vertical swipe
      if (velocity.y > 0) {
        console.log('Swipe down - could pause/resume');
      } else {
        console.log('Swipe up - could access menu');
      }
    }
  }
  
  private handleDragGesture(gesture: TouchGesture): void {
    // Handle drag gestures for aiming or special actions
    console.log('Drag gesture detected');
  }
  
  private detectSwipeGesture(): void {
    if (this.touchHistory.length < 3) return;
    
    const recent = this.touchHistory.slice(-3);
    const start = recent[0];
    const end = recent[recent.length - 1];
    const timeDiff = (end.time - start.time) / 1000;
    
    if (timeDiff > 0) {
      const distance = Math.sqrt(
        Math.pow(end.x - start.x, 2) + 
        Math.pow(end.y - start.y, 2)
      );
      
      if (distance > this.mobileConfig.swipeThreshold) {
        const velocity = {
          x: (end.x - start.x) / timeDiff,
          y: (end.y - start.y) / timeDiff
        };
        
        // This would trigger swipe detection
        // Implementation depends on game requirements
      }
    }
  }
  
  // Public methods for accessing touch state
  public getTouchState(): GameInput {
    return { ...this.inputState };
  }
  
  public isMobileDevice(): boolean {
    return this.inputState.isMobileDevice;
  }
  
  public getCurrentTouchSpeed(): number {
    return this.inputState.touchSpeed;
  }
  
  public getTouchVelocity(): { x: number; y: number } {
    return { ...this.inputState.touchVelocity };
  }
  
  public getActiveTouches(): Touch[] {
    return [...this.inputState.activeTouches];
  }
  
  public hasActiveTouch(): boolean {
    return this.inputState.isTouchActive;
  }
  
  public getLastTouchInteraction(): number {
    return this.inputState.lastTouchInteraction;
  }
  
  public getGestureHistory(): TouchGesture[] {
    return [...this.gestureHistory];
  }
  
  // Input buffering for better responsiveness
  private inputBuffer: Array<{ type: string; data: any; timestamp: number }> = [];
  
  public bufferInput(type: string, data: any): void {
    this.inputBuffer.push({
      type,
      data,
      timestamp: Date.now(),
    });
    
    // Remove old inputs (older than 100ms)
    this.inputBuffer = this.inputBuffer.filter(
      input => Date.now() - input.timestamp < 100
    );
  }
  
  public getBufferedInputs(): Array<{ type: string; data: any; timestamp: number }> {
    return [...this.inputBuffer];
  }
  
  public clearInputBuffer(): void {
    this.inputBuffer = [];
  }
  
  // Gesture recognition for mobile
  public getTouchGestures(): string[] {
    const gestures: string[] = [];
    // This would be implemented with more sophisticated touch analysis
    // For now, just return basic touch detection
    if (this.inputState.isMouseDown) {
      gestures.push('touch');
    }
    return gestures;
  }
  
  // Mouse wheel support
  public setupWheelHandler(callback: (deltaY: number) => void): void {
    this.canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      callback(event.deltaY);
    });
  }
  
  // Focus/blur handling
  public setupFocusHandlers(onFocus: () => void, onBlur: () => void): void {
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
  }
  
  // Cleanup
  public destroy(): void {
    // Remove all event listeners
    this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.removeEventListener('click', this.handleClick.bind(this));
    this.canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.canvas.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.removeEventListener('touchcancel', this.handleTouchCancel.bind(this));
    this.canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
    this.canvas.removeEventListener('wheel', this.handleWheel.bind(this));
    
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    window.removeEventListener('resize', this.handleResize.bind(this));
    window.removeEventListener('orientationchange', this.handleOrientationChange.bind(this));
    
    // Remove mobile optimization listeners
    document.removeEventListener('touchstart', this.preventDefaultBehaviors.bind(this));
    document.removeEventListener('touchmove', this.preventDefaultBehaviors.bind(this));
    document.removeEventListener('touchend', this.preventDefaultBehaviors.bind(this));
    
    // Clear timers
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    
    // Clear gesture history
    this.touchHistory = [];
    this.gestureHistory = [];
  }
  
  private handleWheel(event: WheelEvent): void {
    event.preventDefault();
    // Handle mouse wheel for UI scaling or other interactions
  }
}