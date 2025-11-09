import { Portal, Whip } from '../types/game';

export class PhysicsEngine {
  private gravity = 9.8;
  private airResistance = 0.98;
  private wormholeElasticity = 0.8;
  private cosmicDamping = 0.9;
  
  // Movement-based physics parameters (no whip types)
  private readonly MOVEMENT_BASED_PHYSICS = {
    baseEnergy: 1.0,
    baseReach: 0.5,
    baseCurve: 0.6
  };
  
  // Portal physics for frequency-based system
  private readonly PORTAL_FREQUENCY_PHYSICS = {
    bass: { 
      gravitationalForce: 2.0, 
      size: 0.08, 
      speed: 0.5, 
      frequency: 60, 
      stability: 0.9 
    },
    snare: { 
      gravitationalForce: 1.0, 
      size: 0.06, 
      speed: 0.8, 
      frequency: 200, 
      stability: 0.7 
    },
    hihat: { 
      gravitationalForce: 0.5, 
      size: 0.04, 
      speed: 1.2, 
      frequency: 8000, 
      stability: 0.5 
    }
  };

  constructor() {
    // Initialize revolutionary physics engine
  }
  
  public update(deltaTime: number): void {
    // Global physics updates handled by individual objects
    // This method can be used for world-level physics
  }
  
  public updateWormholePhysics(whip: Whip, deltaTime: number): void {
    if (!whip.isActive) return;
    
    // Update wormhole extension with cosmic energy
    const targetExtension = whip.isExtending ? 1 : 0;
    const currentExtension = whip.extensionProgress;
    const extensionDelta = (targetExtension - currentExtension) * 0.1;
    
    // Apply cosmic damping
    whip.extensionProgress = Math.max(0, Math.min(1, currentExtension + extensionDelta));
    whip.extensionProgress *= this.cosmicDamping;
    
    // Update cosmic energy based on extension and movement speed
    const speedFactor = Math.min(whip.velocity / 1.0, 2); // Normalize velocity
    const energy = this.MOVEMENT_BASED_PHYSICS.baseEnergy * speedFactor;
    whip.cosmicEnergy = Math.sin(whip.extensionProgress * Math.PI) * energy;
    
    // Update whip length based on reach and progress
    const reach = this.MOVEMENT_BASED_PHYSICS.baseReach * speedFactor;
    whip.whipLength = reach * whip.extensionProgress;
    
    // Update whip angle for natural movement
    this.updateWormholeAngle(whip, deltaTime);
    
    // Update trajectory points for visual trail
    this.updateWormholeTrail(whip, deltaTime);
  }
  
  private updateWormholeAngle(whip: Whip, deltaTime: number): void {
    // Natural wormhole movement with cosmic oscillations
    const naturalOscillation = Math.sin(Date.now() * 0.005) * 0.1;
    whip.whipAngle += naturalOscillation * deltaTime;
  }
  
  private updateWormholeTrail(whip: Whip, deltaTime: number): void {
    const currentPos = this.getWhipCurrentPosition(whip);
    
    // Add current position to trail
    whip.trailPoints.push({
      x: currentPos.x,
      y: currentPos.y,
      alpha: 1.0
    });
    
    // Update existing trail points
    whip.trailPoints.forEach(point => {
      point.alpha -= deltaTime * 2;
    });
    
    // Remove faded trail points
    whip.trailPoints = whip.trailPoints.filter(point => point.alpha > 0);
  }
  
  private getWhipCurrentPosition(whip: Whip): { x: number; y: number } {
    const t = whip.extensionProgress;
    const { start, control, end } = whip.trajectory;
    
    // Bezier curve calculation for curved wormhole trajectory
    const x = Math.pow(1 - t, 2) * start.x + 2 * (1 - t) * t * control.x + Math.pow(t, 2) * end.x;
    const y = Math.pow(1 - t, 2) * start.y + 2 * (1 - t) * t * control.y + Math.pow(t, 2) * end.y;
    
    return { x, y };
  }
  
  public updatePortalPhysics(portal: Portal, deltaTime: number): void {
    // Apply frequency-based physics
    const physics = this.PORTAL_FREQUENCY_PHYSICS[portal.type];
    
    // Update portal size with frequency-based stability
    const stabilityEffect = physics.stability * Math.sin(Date.now() * 0.01 + portal.frequency);
    portal.size = Math.max(0.02, physics.size + stabilityEffect * 0.01);
    
    // Apply gravitational effects
    const gravitationalForce = physics.gravitationalForce * deltaTime * 0.1;
    
    // Update portal color intensity based on frequency and activity
    this.updatePortalFrequencyColor(portal, gravitationalForce);
    
    // Update travel effects
    if (portal.isTraveling && portal.travelProgress !== undefined) {
      portal.travelProgress = Math.min(1, portal.travelProgress + deltaTime * 0.5);
    }
  }
  
  private updatePortalFrequencyColor(portal: Portal, force: number): void {
    // Color intensity based on frequency and gravitational force
    const intensity = Math.min(1, force / 2);
    
    // Store the intensity for visual renderer
    // (The actual color change is handled by the visual system)
  }
  
  public calculateWormholeCollision(portal: Portal, whip: Whip): { 
    collision: boolean; 
    energy: number; 
    trajectory: { x: number; y: number } 
  } {
    const currentPos = this.getWhipCurrentPosition(whip);
    const portalPos = { x: portal.x, y: portal.y };
    const distance = this.calculateDistance(
      currentPos.x, currentPos.y, 
      portalPos.x, portalPos.y
    );
    
    const collisionRadius = portal.size * 50; // Scale to pixels
    const whipReach = whip.whipLength * 50; // Scale to pixels
    
    if (distance <= collisionRadius + whipReach) {
      // Calculate collision energy based on movement speed and extension
      const speedFactor = Math.min(whip.velocity / 1.0, 2);
      const extensionBonus = whip.extensionProgress * 0.5;
      const totalEnergy = this.MOVEMENT_BASED_PHYSICS.baseEnergy * speedFactor + extensionBonus;
      
      return {
        collision: true,
        energy: totalEnergy,
        trajectory: currentPos
      };
    }
    
    return {
      collision: false,
      energy: 0,
      trajectory: { x: 0, y: 0 }
    };
  }
  
  private calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
  
  public applyWormholeForce(portal: Portal, collision: { energy: number; trajectory: { x: number; y: number } }, deltaTime: number): void {
    // Apply energy to portal based on wormhole collision
    const force = collision.energy;
    
    // Start portal travel sequence for successful hits
    portal.isTraveling = true;
    portal.travelProgress = 0;
    
    // Apply portal-specific effects
    this.applyPortalFrequencyEffects(portal, force);
  }
  
  private applyPortalFrequencyEffects(portal: Portal, energy: number): void {
    const physics = this.PORTAL_FREQUENCY_PHYSICS[portal.type];
    
    switch (portal.type) {
      case 'bass':
        // Bass portals create deep spacetime distortion
        this.createSpacetimeDistortion(portal, energy, 'bass');
        break;
      case 'snare':
        // Snare portals create quantum shock waves
        this.createQuantumShockwave(portal, energy, 'snare');
        break;
      case 'hihat':
        // Hi-hat portals create particle streams
        this.createParticleStream(portal, energy, 'hihat');
        break;
    }
  }
  
  private createSpacetimeDistortion(portal: Portal, energy: number, type: string): void {
    // Create gravitational lensing effect
    // This would be implemented in the visual system
    console.log(`Creating spacetime distortion for ${type} portal with energy ${energy}`);
  }
  
  private createQuantumShockwave(portal: Portal, energy: number, type: string): void {
    // Create quantum field disturbance
    // This would be implemented in the visual system
    console.log(`Creating quantum shockwave for ${type} portal with energy ${energy}`);
  }
  
  private createParticleStream(portal: Portal, energy: number, type: string): void {
    // Create high-energy particle burst
    // This would be implemented in the visual system
    console.log(`Creating particle stream for ${type} portal with energy ${energy}`);
  }
  
  public simulateWormholeTrajectory(whip: Whip, steps: number = 50): Array<{ x: number; y: number; t: number; energy: number }> {
    const trajectory: Array<{ x: number; y: number; t: number; energy: number }> = [];
    const speedFactor = Math.min(whip.velocity / 1.0, 2);
    const energy = this.MOVEMENT_BASED_PHYSICS.baseEnergy * speedFactor;
    
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const { start, control, end } = whip.trajectory;
      
      // Bezier curve position
      const x = Math.pow(1 - t, 2) * start.x + 2 * (1 - t) * t * control.x + Math.pow(t, 2) * end.x;
      const y = Math.pow(1 - t, 2) * start.y + 2 * (1 - t) * t * control.y + Math.pow(t, 2) * end.y;
      
      // Energy decreases along trajectory
      const energyAtPoint = energy * (1 - t) * 0.8;
      
      trajectory.push({
        x, y, t, energy: energyAtPoint
      });
    }
    
    return trajectory;
  }
  
  public calculateOptimalWormholeTrajectory(whip: Whip, targetX: number, targetY: number): { 
    start: { x: number; y: number }; 
    control: { x: number; y: number }; 
    end: { x: number; y: number } 
  } {
    const start = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const end = { x: targetX, y: targetY };
    
    // Calculate control point for curved trajectory
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    
    // Add curve based on movement speed
    const speedFactor = Math.min(whip.velocity / 1.0, 2);
    const curveOffset = 100 * this.MOVEMENT_BASED_PHYSICS.baseCurve * speedFactor;
    
    const control = {
      x: midX + (Math.random() - 0.5) * curveOffset,
      y: midY - curveOffset // Curve upward for dramatic effect
    };
    
    return { start, control, end };
  }
  
  public getMovementBasedPhysics(velocity: number): { 
    speed: number; 
    reach: number; 
    energy: number; 
    curve: number;
  } {
    const speedFactor = Math.min(velocity / 1.0, 2);
    return {
      speed: velocity,
      reach: this.MOVEMENT_BASED_PHYSICS.baseReach * speedFactor,
      energy: this.MOVEMENT_BASED_PHYSICS.baseEnergy * speedFactor,
      curve: this.MOVEMENT_BASED_PHYSICS.baseCurve * speedFactor
    };
  }
  
  public getPortalPhysics(portalType: 'bass' | 'snare' | 'hihat'): {
    size: number;
    speed: number;
    gravitationalForce: number;
    frequency: number;
    stability: number;
  } {
    return this.PORTAL_FREQUENCY_PHYSICS[portalType];
  }
  
  public calculateTimingAccuracy(expectedTime: number, actualTime: number): {
    accuracy: number;
    quality: 'perfect' | 'great' | 'good' | 'hit' | 'miss';
    tolerance: number;
  } {
    const timeDiff = Math.abs(actualTime - expectedTime);
    
    let quality: 'perfect' | 'great' | 'good' | 'hit' | 'miss';
    let accuracy: number;
    let tolerance: number;
    
    if (timeDiff <= 15) {
      quality = 'perfect';
      accuracy = 100;
      tolerance = 15;
    } else if (timeDiff <= 30) {
      quality = 'great';
      accuracy = 90;
      tolerance = 30;
    } else if (timeDiff <= 50) {
      quality = 'good';
      accuracy = 80;
      tolerance = 50;
    } else if (timeDiff <= 100) {
      quality = 'hit';
      accuracy = 60;
      tolerance = 100;
    } else {
      quality = 'miss';
      accuracy = 0;
      tolerance = 100;
    }
    
    return { accuracy, quality, tolerance };
  }
  
  public predictPortalHitChance(whip: Whip, portal: Portal, currentTime: number): number {
    // Calculate if the player has a realistic chance to hit the portal
    const timeUntilTarget = (portal.targetTime - currentTime) / 1000;
    const distance = this.calculateDistance(portal.x, portal.y, 0.5, 0.5); // Distance from center
    const speedFactor = Math.min(whip.velocity / 1.0, 2);
    const reach = this.MOVEMENT_BASED_PHYSICS.baseReach * speedFactor;
    
    // Check if portal is within wormhole reach
    if (distance > reach) {
      return 0;
    }
    
    // Check if there's enough time
    const minTimeNeeded = distance / whip.velocity;
    if (timeUntilTarget < minTimeNeeded) {
      return 0;
    }
    
    // Calculate hit probability based on timing and positioning
    const timingWindow = this.getTimingWindow(speedFactor);
    const timingDiff = Math.abs(timeUntilTarget - minTimeNeeded);
    const timingScore = Math.max(0, 1 - (timingDiff / timingWindow));
    
    // Factor in distance accuracy
    const distanceScore = Math.max(0, 1 - (distance / reach));
    
    return Math.max(0, Math.min(1, (timingScore + distanceScore) / 2));
  }
  
  private getTimingWindow(speedFactor: number): number {
    // Faster movement = smaller timing window for challenge
    const baseWindow = 0.15; // 150ms base window
    return Math.max(0.05, baseWindow / speedFactor); // Minimum 50ms window
  }
  
  public enableRealisticPhysics(): void {
    // Enable more realistic physics simulation
    this.gravity = 9.81; // Real gravity
    this.airResistance = 0.99; // More air resistance
    this.wormholeElasticity = 0.9; // More elastic wormholes
  }
  
  public enableArcadePhysics(): void {
    // Enable more arcade-style physics
    this.gravity = 4.9; // Reduced gravity
    this.airResistance = 0.95; // Less air resistance
    this.wormholeElasticity = 0.7; // Less elastic wormholes
  }
  
  public setPhysicsMode(mode: 'realistic' | 'arcade'): void {
    if (mode === 'realistic') {
      this.enableRealisticPhysics();
    } else {
      this.enableArcadePhysics();
    }
  }
  
  public getDebugInfo(): {
    gravity: number;
    airResistance: number;
    wormholeElasticity: number;
    activeWormholeTypes: number;
    activePortalTypes: number;
  } {
    return {
      gravity: this.gravity,
      airResistance: this.airResistance,
      wormholeElasticity: this.wormholeElasticity,
      activeWormholeTypes: 1, // Now uses movement-based physics
      activePortalTypes: Object.keys(this.PORTAL_FREQUENCY_PHYSICS).length
    };
  }
}
