import { Portal, Whip, VisualEffect, GameState } from '../types/game';

export class VisualRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  
  // Asset management
  private images: { [key: string]: HTMLImageElement } = {};
  private loadedAssets = new Set<string>();
  
  // Game state
  private backgroundImage: HTMLImageElement | null = null;
  private lastFrameTime = 0;
  private animationTime = 0;
  
  // Frequency spectrum display
  private readonly frequencyLabels = {
    bass: { text: '50-120Hz', color: '#8B5A96' },
    snare: { text: '150-300Hz', color: '#00FFFF' },
    hihat: { text: '1-8kHz+', color: '#FFFF00' }
  };
  
  // Dimension effects
  private dimensionEffects: { [key: string]: any } = {
    cosmic_void: { bgColor: '#0a0a1a', particleColor: '#8B5A96' },
    stellar_nebula: { bgColor: '#1a0a2a', particleColor: '#ff6b9d' },
    quantum_field: { bgColor: '#2a1a0a', particleColor: '#00ffff' },
    temporal_rift: { bgColor: '#0a2a1a', particleColor: '#ffff00' },
    dark_matter_cloud: { bgColor: '#2a2a2a', particleColor: '#666666' },
    plasma_storm: { bgColor: '#2a0a0a', particleColor: '#ff0000' },
    crystal_galaxy: { bgColor: '#0a2a2a', particleColor: '#00ff00' },
    void_walker_realm: { bgColor: '#000000', particleColor: '#ffffff' }
  };

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }
  
  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }
  
  public async loadAssets(assetNames: string[]): Promise<void> {
    console.log('🎨 Loading visual assets...');
    
    const loadPromises = assetNames.map(assetName => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        
        const timeout = setTimeout(() => {
          console.warn(`⚠️ Timeout loading image: ${assetName}`);
          this.createFallbackImage(assetName);
          resolve();
        }, 3000);
        
        img.onload = () => {
          clearTimeout(timeout);
          this.images[assetName] = img;
          this.loadedAssets.add(assetName);
          console.log(`✅ Loaded: ${assetName}`);
          resolve();
        };
        
        img.onerror = () => {
          clearTimeout(timeout);
          console.warn(`⚠️ Failed to load: ${assetName}`);
          this.createFallbackImage(assetName);
          resolve();
        };
        
        // Load from public folder
        img.src = `/${assetName}`;
      });
    });
    
    await Promise.all(loadPromises);
    console.log('✅ All visual assets loaded!');
  }
  
  private createFallbackImage(assetName: string): void {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Create a colorful placeholder
    const colors = ['#8B5A96', '#00FFFF', '#FFFF00', '#FF6B9D', '#00FF00'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(assetName.replace('.png', '').replace('_', ' '), 128, 128);
    
    const img = new Image();
    img.src = canvas.toDataURL();
    this.images[assetName] = img;
    this.loadedAssets.add(assetName);
  }
  
  public update(
    portals: Portal[], 
    whips: Whip[], 
    effects: VisualEffect[], 
    gameState: GameState,
    crosshairPosition: { x: number; y: number },
    currentDimension: string
  ): void {
    this.animationTime += 0.016; // 60fps assumption
    
    // Clear and draw background
    this.drawBackground(currentDimension);
    
    // Draw frequency spectrum
    this.drawFrequencySpectrum();
    
    // Draw portals (horizontal frequency-based)
    this.drawPortals(portals);
    
    // Draw wormhole whips
    this.drawWormholeWhips(whips);
    
    // Draw visual effects
    this.drawVisualEffects(effects);
    
    // Draw crosshair
    this.drawCrosshair(crosshairPosition);
    
    // Draw UI
    this.drawUI(gameState, currentDimension);
  }
  
  private drawBackground(dimension: string): void {
    const effect = this.dimensionEffects[dimension] || this.dimensionEffects.cosmic_void;
    
    // Gradient background
    const gradient = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, 0,
      this.width / 2, this.height / 2, Math.max(this.width, this.height) / 2
    );
    
    gradient.addColorStop(0, effect.bgColor);
    gradient.addColorStop(1, '#000000');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Add cosmic background texture if available
    if (this.images['spacetime_background.png']) {
      this.ctx.globalAlpha = 0.3;
      this.ctx.drawImage(
        this.images['spacetime_background.png'],
        0, 0, this.width, this.height
      );
      this.ctx.globalAlpha = 1.0;
    }
    
    // Animated stars/particles
    this.drawCosmicParticles(dimension);
  }
  
  private drawCosmicParticles(dimension: string): void {
    const effect = this.dimensionEffects[dimension];
    const particleCount = 50;
    
    this.ctx.save();
    this.ctx.fillStyle = effect.particleColor;
    this.ctx.globalAlpha = 0.6;
    
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.sin(this.animationTime + i * 0.5) * 0.5 + 0.5) * this.width;
      const y = (Math.cos(this.animationTime * 0.7 + i) * 0.5 + 0.5) * this.height;
      const size = Math.sin(this.animationTime * 2 + i) * 0.5 + 1;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.restore();
  }
  
  private drawFrequencySpectrum(): void {
    // Draw frequency spectrum labels
    this.ctx.save();
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'center';
    
    const y = this.height * 0.9;
    
    // Bass frequency (left)
    this.ctx.fillStyle = this.frequencyLabels.bass.color;
    this.ctx.fillText(this.frequencyLabels.bass.text, this.width * 0.15, y);
    
    // Snare frequency (center)
    this.ctx.fillStyle = this.frequencyLabels.snare.color;
    this.ctx.fillText(this.frequencyLabels.snare.text, this.width * 0.5, y);
    
    // Hi-hat frequency (right)
    this.ctx.fillStyle = this.frequencyLabels.hihat.color;
    this.ctx.fillText(this.frequencyLabels.hihat.text, this.width * 0.85, y);
    
    // Debug: Draw a test rectangle to verify function is called
    this.ctx.fillStyle = '#FF0000';
    this.ctx.fillRect(this.width * 0.7, 10, 20, 20);
    
    this.ctx.restore();
    
    console.log('🎵 Frequency spectrum drawn - Width:', this.width, 'Height:', this.height);
  }
  
  private drawPortals(portals: Portal[]): void {
    portals.forEach(portal => {
      this.drawPortal(portal);
    });
  }
  
  private drawPortal(portal: Portal): void {
    const x = portal.x * this.width;
    const y = portal.y * this.height;
    const size = portal.size * Math.min(this.width, this.height);
    
    this.ctx.save();
    
    // Portal animation based on position
    const timeUntilTarget = (portal.targetTime - Date.now()) / 1000;
    let scale = 1;
    let alpha = 1;
    let rotation = 0;
    
    if (timeUntilTarget > 2) {
      // Approaching - fade in
      const progress = Math.max(0, 1 - timeUntilTarget / 2);
      alpha = progress;
      scale = 0.5 + progress * 0.5;
    } else if (timeUntilTarget > 0) {
      // Active - full size with pulsing
      scale = 1 + Math.sin(this.animationTime * 8) * 0.1;
      alpha = 0.9 + Math.sin(this.animationTime * 4) * 0.1;
      rotation = this.animationTime * 2;
    } else {
      // Missed - fade out
      const progress = Math.min(1, -timeUntilTarget / 0.5);
      alpha = 0.9 * (1 - progress);
    }
    
    // Draw portal with travel effect if traveling
    if (portal.isTraveling) {
      this.drawPortalTravel(portal, x, y, size, scale, alpha);
    } else {
      this.drawNormalPortal(portal, x, y, size, scale, alpha, rotation);
    }
    
    // Draw frequency indicator
    this.drawFrequencyIndicator(portal, x, y, size);
    
    this.ctx.restore();
  }
  
  private drawNormalPortal(portal: Portal, x: number, y: number, size: number, scale: number, alpha: number, rotation: number): void {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(rotation);
    this.ctx.scale(scale, scale);
    this.ctx.globalAlpha = alpha;
    
    // Use enhanced portal images if available
    const imageKey = `enhanced_${portal.type}_portal.png`;
    if (this.images[imageKey]) {
      this.ctx.drawImage(this.images[imageKey], -size/2, -size/2, size, size);
    } else {
      // Fallback geometric portal
      this.drawFallbackPortal(portal, size);
    }
    
    this.ctx.restore();
  }
  
  private drawFallbackPortal(portal: Portal, size: number): void {
    this.ctx.fillStyle = portal.color;
    this.ctx.strokeStyle = portal.color;
    this.ctx.lineWidth = 2;
    
    switch (portal.type) {
      case 'bass':
        // Large ring for bass
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
        this.ctx.stroke();
        break;
        
      case 'snare':
        // Solid circle for snare
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
        break;
        
      case 'hihat':
        // Small ring for hi-hat
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
        this.ctx.stroke();
        break;
    }
  }
  
  private drawPortalTravel(portal: Portal, x: number, y: number, size: number, scale: number, alpha: number): void {
    if (portal.travelProgress !== undefined) {
      const progress = portal.travelProgress;
      const distortionSize = size * (1 + progress * 0.5);
      
      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.globalAlpha = alpha * (1 - progress);
      
      // Use portal travel transition image
      if (this.images['portal_travel_transition.png']) {
        this.ctx.drawImage(
          this.images['portal_travel_transition.png'],
          -distortionSize/2, -distortionSize/2, distortionSize, distortionSize
        );
      } else {
        // Fallback distortion effect
        this.drawDistortionEffect(distortionSize, progress);
      }
      
      this.ctx.restore();
    }
  }
  
  private drawDistortionEffect(size: number, progress: number): void {
    const rings = 5;
    for (let i = 0; i < rings; i++) {
      const ringSize = (size * (i + 1) / rings) * (1 + progress);
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * (1 - progress)})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, ringSize/2, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }
  
  private drawFrequencyIndicator(portal: Portal, x: number, y: number, size: number): void {
    this.ctx.save();
    this.ctx.fillStyle = portal.color;
    this.ctx.font = 'bold 12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.globalAlpha = 0.8;
    this.ctx.fillText(portal.frequencyRange, x, y - size * 0.8);
    this.ctx.restore();
  }
  
  private drawWormholeWhips(whips: Whip[]): void {
    whips.forEach(whip => {
      this.drawWormholeWhip(whip);
    });
  }
  
  private drawWormholeWhip(whip: Whip): void {
    this.ctx.save();
    
    // Draw cosmic energy trail
    if (whip.trailPoints.length > 0) {
      this.drawWhipTrail(whip);
    }
    
    // Draw main whip
    if (whip.isActive) {
      this.drawMainWhip(whip);
    }
    
    this.ctx.restore();
  }
  
  private drawWhipTrail(whip: Whip): void {
    if (whip.trailPoints.length < 2) return;
    
    this.ctx.save();
    this.ctx.globalAlpha = 0.6;
    
    for (let i = 1; i < whip.trailPoints.length; i++) {
      const prev = whip.trailPoints[i - 1];
      const curr = whip.trailPoints[i];
      
      this.ctx.strokeStyle = `rgba(0, 255, 255, ${curr.alpha * 0.5})`;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(prev.x, prev.y);
      this.ctx.lineTo(curr.x, curr.y);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }
  
  private drawMainWhip(whip: Whip): void {
    const currentPos = this.getWhipCurrentPosition(whip);
    const canvasCenter = { x: this.width / 2, y: this.height / 2 };
    
    // Always use wave-based drawing for consistent movement-based speed
    this.drawWaveWhip(whip, canvasCenter, currentPos);
    
    // Add cosmic energy effect
    this.drawCosmicEnergy(currentPos, whip.cosmicEnergy);
  }
  
  private getWhipCurrentPosition(whip: Whip): { x: number; y: number } {
    const t = whip.extensionProgress;
    const { start, control, end } = whip.trajectory;
    
    // Bezier curve calculation
    const x = Math.pow(1 - t, 2) * start.x + 2 * (1 - t) * t * control.x + Math.pow(t, 2) * end.x;
    const y = Math.pow(1 - t, 2) * start.y + 2 * (1 - t) * t * control.y + Math.pow(t, 2) * end.y;
    
    return { x, y };
  }
  
  private drawWaveWhip(whip: Whip, startPos: { x: number; y: number }, currentPos: { x: number; y: number }): void {
    this.ctx.save();
    
    // Calculate wave pattern based on cursor speed and whip movement
    const wavePattern = whip.wavePattern;
    const time = (Date.now() - whip.createdTime) / 1000;
    const t = whip.extensionProgress;
    
    // Draw the main whip trajectory with wave
    this.ctx.strokeStyle = '#00FFFF';
    this.ctx.lineWidth = 4;
    this.ctx.globalAlpha = 0.8;
    
    this.ctx.beginPath();
    this.ctx.moveTo(startPos.x, startPos.y);
    
    // Draw bezier curve with wave modulation
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      if (progress > t) break; // Only draw up to current extension
      
      // Bezier curve position
      const bezierPos = this.getBezierPoint(progress, whip.trajectory);
      
      // Apply wave pattern
      const waveOffset = this.calculateWaveOffset(
        progress, 
        wavePattern, 
        time, 
        startPos, 
        currentPos
      );
      
      const x = bezierPos.x + waveOffset.x;
      const y = bezierPos.y + waveOffset.y;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.stroke();
    
    // Draw whip head with wave effect
    this.ctx.fillStyle = '#00FFFF';
    this.ctx.beginPath();
    this.ctx.arc(currentPos.x, currentPos.y, 6, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Add wave trail effect
    this.drawWaveTrail(whip, startPos, currentPos);
    
    this.ctx.restore();
  }
  
  private getBezierPoint(t: number, trajectory: any): { x: number; y: number } {
    const { start, control, end } = trajectory;
    const x = Math.pow(1 - t, 2) * start.x + 2 * (1 - t) * t * control.x + Math.pow(t, 2) * end.x;
    const y = Math.pow(1 - t, 2) * start.y + 2 * (1 - t) * t * control.y + Math.pow(t, 2) * end.y;
    return { x, y };
  }
  
  private calculateWaveOffset(
    progress: number, 
    wavePattern: any, 
    time: number, 
    start: { x: number; y: number }, 
    current: { x: number; y: number }
  ): { x: number; y: number } {
    const distance = Math.sqrt(
      Math.pow(current.x - start.x, 2) + Math.pow(current.y - start.y, 2)
    );
    
    const waveValue = this.getWaveValue(wavePattern, time, progress * distance);
    
    // Apply wave perpendicular to trajectory
    const direction = {
      x: (current.x - start.x) / distance,
      y: (current.y - start.y) / distance
    };
    
    const perpendicular = {
      x: -direction.y,
      y: direction.x
    };
    
    return {
      x: perpendicular.x * waveValue,
      y: perpendicular.y * waveValue
    };
  }
  
  private getWaveValue(wavePattern: any, time: number, distance: number): number {
    const { amplitude, frequency, phase, waveType } = wavePattern;
    
    let wave;
    const argument = frequency * (time + distance / 1000) + phase;
    
    switch (waveType) {
      case 'sine':
        wave = Math.sin(argument);
        break;
      case 'cosine':
        wave = Math.cos(argument);
        break;
      case 'sawtooth':
        wave = 2 * (argument / (2 * Math.PI) - Math.floor(argument / (2 * Math.PI) + 0.5));
        break;
      case 'square':
        wave = Math.sign(Math.sin(argument));
        break;
      default:
        wave = Math.sin(argument);
    }
    
    return amplitude * wave;
  }
  
  private drawWaveTrail(whip: Whip, startPos: { x: number; y: number }, currentPos: { x: number; y: number }): void {
    const wavePattern = whip.wavePattern;
    const time = (Date.now() - whip.createdTime) / 1000;
    const trailLength = Math.min(whip.extensionProgress, 0.8) * 0.3;
    
    // Draw trailing wave effects
    for (let i = 0; i < 5; i++) {
      const trailProgress = (i / 5) * trailLength;
      const alpha = 0.5 * (1 - i / 5);
      
      this.ctx.globalAlpha = alpha;
      this.ctx.strokeStyle = '#00FFFF';
      this.ctx.lineWidth = 2;
      
      const trailPos = this.getBezierPoint(trailProgress, whip.trajectory);
      const waveOffset = this.calculateWaveOffset(
        trailProgress, 
        wavePattern, 
        time - i * 0.1, 
        startPos, 
        currentPos
      );
      
      this.ctx.beginPath();
      this.ctx.arc(
        trailPos.x + waveOffset.x, 
        trailPos.y + waveOffset.y, 
        4 - i * 0.5, 
        0, 
        Math.PI * 2
      );
      this.ctx.stroke();
    }
  }
  
  private drawCosmicEnergy(position: { x: number; y: number }, energy: number): void {
    this.ctx.save();
    this.ctx.globalAlpha = energy * 0.5;
    this.ctx.strokeStyle = '#00FFFF';
    this.ctx.lineWidth = 2;
    
    // Draw energy rings
    for (let i = 0; i < 3; i++) {
      const radius = (20 + i * 10) * energy;
      this.ctx.beginPath();
      this.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }
  
  private drawVisualEffects(effects: VisualEffect[]): void {
    effects.forEach(effect => {
      this.drawVisualEffect(effect);
    });
  }
  
  private drawVisualEffect(effect: VisualEffect): void {
    const progress = (Date.now() - effect.startTime) / effect.duration;
    const x = effect.position.x * this.width;
    const y = effect.position.y * this.height;
    
    this.ctx.save();
    
    switch (effect.type) {
      case 'portal_hit':
        this.drawPortalHitEffect(effect, x, y, progress);
        break;
      case 'portal_travel':
        this.drawPortalTravelEffect(effect, x, y, progress);
        break;
      case 'particle':
        this.drawParticleEffect(effect, x, y, progress);
        break;
      case 'level_transition':
        this.drawLevelTransitionEffect(effect, x, y, progress);
        break;
      case 'wave_trail':
        this.drawWaveTrailEffect(effect, x, y, progress);
        break;
      case 'beat_pulse':
        this.drawBeatPulseEffect(effect, x, y, progress);
        break;
    }
    
    this.ctx.restore();
  }
  
  private drawPortalHitEffect(effect: VisualEffect, x: number, y: number, progress: number): void {
    const quality = effect.data.quality;
    const colors = {
      perfect: '#FFFF00',
      great: '#00FFFF',
      good: '#FF00FF',
      hit: '#FF6B9D'
    };
    
    const color = colors[quality] || '#FFFFFF';
    const size = Math.max(0, 50 + progress * 100); // Ensure size is never negative
    const alpha = Math.max(0, 1 - progress); // Ensure alpha is never negative
    
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    this.ctx.globalAlpha = alpha;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, Math.PI * 2);
    this.ctx.stroke();
  }
  
  private drawPortalTravelEffect(effect: VisualEffect, x: number, y: number, progress: number): void {
    const alpha = Math.max(0, 1 - progress) * 0.8;
    this.ctx.globalAlpha = alpha;
    
    // Use spacetime distortion if available
    if (this.images['spacetime_distortion.png']) {
      const size = Math.max(0, 100 + progress * 200);
      this.ctx.drawImage(
        this.images['spacetime_distortion.png'],
        x - size/2, y - size/2, size, size
      );
    } else {
      // Fallback distortion
      this.drawDistortionEffect(Math.max(0, 200), progress);
    }
  }
  
  private drawParticleEffect(effect: VisualEffect, x: number, y: number, progress: number): void {
    const particleCount = effect.data.particleCount || 20;
    this.ctx.fillStyle = effect.data.color || '#FF0000';
    this.ctx.globalAlpha = Math.max(0, 1 - progress);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = progress * 100;
      const px = x + Math.cos(angle) * distance;
      const py = y + Math.sin(angle) * distance;
      const size = Math.max(0, 3 * (1 - progress)); // Ensure size is never negative
      
      this.ctx.beginPath();
      this.ctx.arc(px, py, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
  private drawTouchVisualization(touchPoints: Array<{x: number, y: number, time: number}>): void {
    this.ctx.save();
    this.ctx.globalAlpha = 0.5;
    
    touchPoints.forEach((point, index) => {
      const age = (Date.now() - point.time) / 1000;
      const alpha = Math.max(0, 0.8 - age * 0.5);
      
      this.ctx.globalAlpha = alpha;
      this.ctx.strokeStyle = '#00FFFF';
      this.ctx.lineWidth = 3;
      
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 20, 0, Math.PI * 2);
      this.ctx.stroke();
      
      // Add center dot
      this.ctx.fillStyle = '#00FFFF';
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    this.ctx.restore();
  }
  
  private drawLevelTransitionEffect(effect: VisualEffect, x: number, y: number, progress: number): void {
    const alpha = Math.sin(progress * Math.PI) * 0.8;
    this.ctx.globalAlpha = alpha;
    
    // Draw swirling wormhole effect
    const radius = progress * this.width;
    const rotation = progress * Math.PI * 4;
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + rotation;
      const spiralRadius = radius * (1 - i / 8);
      
      this.ctx.fillStyle = `hsl(${240 + i * 30}, 80%, 60%)`;
      this.ctx.beginPath();
      this.ctx.arc(
        x + Math.cos(angle) * spiralRadius,
        y + Math.sin(angle) * spiralRadius,
        10 - i,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }
  }
  
  private drawWaveTrailEffect(effect: VisualEffect, x: number, y: number, progress: number): void {
    const waveCount = 5;
    this.ctx.strokeStyle = '#00FFFF';
    this.ctx.lineWidth = 2;
    this.ctx.globalAlpha = Math.max(0, 1 - progress);
    
    for (let i = 0; i < waveCount; i++) {
      const waveProgress = (progress * waveCount - i) / waveCount;
      if (waveProgress <= 0) continue;
      
      const radius = waveProgress * 50;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }
  
  private drawBeatPulseEffect(effect: VisualEffect, x: number, y: number, progress: number): void {
    const beatType = effect.data.beatType || 'bass';
    const colors = {
      bass: '#8B5A96',
      snare: '#00FFFF', 
      hihat: '#FFFF00'
    };
    
    const color = colors[beatType] || '#FFFFFF';
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    this.ctx.globalAlpha = Math.max(0, 1 - progress);
    
    const size = 30 + progress * 100;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, Math.PI * 2);
    this.ctx.stroke();
  }
  
  private drawCrosshair(position: { x: number; y: number }): void {
    this.ctx.save();
    this.ctx.strokeStyle = '#00FFFF';
    this.ctx.lineWidth = 2;
    this.ctx.globalAlpha = 0.8;
    
    // Draw crosshair
    const size = 20;
    this.ctx.beginPath();
    this.ctx.moveTo(position.x - size, position.y);
    this.ctx.lineTo(position.x + size, position.y);
    this.ctx.moveTo(position.x, position.y - size);
    this.ctx.lineTo(position.x, position.y + size);
    this.ctx.stroke();
    
    // Draw center dot
    this.ctx.fillStyle = '#00FFFF';
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }
  
  private drawUI(
    gameState: GameState, 
    currentDimension: string
  ): void {
    this.ctx.save();
    
    // Calculate responsive font sizes based on screen size
    const baseFontSize = Math.max(12, Math.min(this.width, this.height) / 60);
    const smallFontSize = Math.max(10, baseFontSize * 0.7);
    const largeFontSize = Math.max(16, baseFontSize * 1.3);
    
    // Check if mobile device (for UI scaling)
    const isMobile = this.width < 768 || this.height < 768;
    const scaleFactor = isMobile ? 0.8 : 1.0;
    
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = `bold ${largeFontSize * scaleFactor}px Arial`;
    this.ctx.textAlign = 'left';
    
    // Score
    this.ctx.fillText(`Score: ${gameState.score}`, 20 * scaleFactor, 30 * scaleFactor);
    
    // Combo
    this.ctx.fillText(`Combo: ${gameState.combo}`, 20 * scaleFactor, (30 + 25) * scaleFactor);
    
    // Health
    this.ctx.fillText(`Health: ${gameState.health}`, 20 * scaleFactor, (30 + 50) * scaleFactor);
    
    // Level Progress
    if (gameState.levelProgress !== undefined) {
      this.ctx.fillText(`Level Progress: ${Math.floor(gameState.levelProgress)}%`, 20 * scaleFactor, (30 + 75) * scaleFactor);
    }
    
    // Current dimension
    this.ctx.fillText(`Dimension: ${currentDimension.replace('_', ' ').toUpperCase()}`, 20 * scaleFactor, (30 + 100) * scaleFactor);
    
    // Portals hit counter
    if (gameState.portalsHit !== undefined && gameState.portalsTotal !== undefined) {
      this.ctx.fillText(`Portals: ${gameState.portalsHit}/${gameState.portalsTotal}`, 20 * scaleFactor, (30 + 125) * scaleFactor);
    }
    


    
    // Game status
    this.ctx.textAlign = 'center';
    if (gameState.status === 'level_complete') {
      this.ctx.fillStyle = '#00FF00';
      this.ctx.font = `bold ${largeFontSize * 1.5 * scaleFactor}px Arial`;
      this.ctx.fillText('LEVEL COMPLETE!', this.width / 2, this.height / 2 - 50 * scaleFactor);
    } else if (gameState.status === 'transitioning') {
      this.ctx.fillStyle = '#00FFFF';
      this.ctx.font = `bold ${largeFontSize * scaleFactor}px Arial`;
      this.ctx.fillText('TRAVELING THROUGH WORMHOLE...', this.width / 2, this.height / 2);
    }
    
    // Instructions (scaled for mobile)
    this.ctx.textAlign = 'center';
    this.ctx.font = `${smallFontSize * scaleFactor}px Arial`;
    this.ctx.fillStyle = '#CCCCCC';
    
    if (isMobile) {
      // Mobile instructions
      this.ctx.fillText('Tap to shoot | Long-press to pause', this.width / 2, this.height - 40 * scaleFactor);
    } else {
      // Desktop instructions
      this.ctx.fillText('Click to shoot | Space: Pause | R: Restart', this.width / 2, this.height - 20 * scaleFactor);
    }
    
    this.ctx.restore();
  }
  

}
