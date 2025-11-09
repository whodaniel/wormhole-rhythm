import { Howl, Howler } from 'howler';

export class AudioManager {
  private sounds: { [key: string]: Howl } = {};
  private music: { [key: string]: Howl } = {};
  private currentMusic: Howl | null = null;
  private masterVolume = 0.8;
  private musicVolume = 0.7;
  private effectVolume = 0.6;
  
  constructor() {
    // Set up Howler.js for spatial audio
    Howler.volume(this.masterVolume);
    Howler.pos(0, 0, 0); // Listener position
    
    // Enable 3D audio
    Howler.autoUnlock = true;
  }
  
  public async loadAudioFiles(fileNames: string[]): Promise<void> {
    const loadPromises = fileNames.map(fileName => this.loadAudioFile(fileName));
    await Promise.all(loadPromises);
  }
  
  private loadAudioFile(fileName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const isMusic = fileName.includes('music') || fileName.includes('theme') || fileName.includes('cosmic_journey');
      const category = isMusic ? 'music' : 'sounds';
      const path = `/${fileName}`; // Files are now in public root
      
      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.warn(`Timeout loading audio file: ${fileName}`);
        resolve(); // Continue anyway
      }, 5000); // 5 second timeout
      
      const howl = new Howl({
        src: [path],
        volume: isMusic ? this.musicVolume : this.effectVolume,
        // spatial: true, // Enable 3D spatial audio - not available in howler.js types
        html5: true, // Use HTML5 audio for better compatibility
        onload: () => {
          clearTimeout(timeout);
          this[category][fileName] = howl;
          console.log(`✅ Loaded audio: ${fileName}`);
          resolve();
        },
        onloaderror: (id, error) => {
          clearTimeout(timeout);
          console.warn(`⚠️ Error loading audio file ${fileName}:`, error);
          resolve(); // Continue loading other files
        }
      });
    });
  }
  
  public playSound(soundName: string, volume: number = 1): void {
    const sound = this.sounds[soundName];
    if (sound) {
      sound.volume(Math.min(volume * this.effectVolume, 1));
      sound.play();
    } else {
      console.warn(`Sound ${soundName} not found`);
    }
  }
  
  public playMusic(musicName: string, volume: number = 1): void {
    // Stop current music
    if (this.currentMusic) {
      this.currentMusic.stop();
    }
    
    const music = this.music[musicName];
    if (music) {
      music.volume(Math.min(volume * this.musicVolume, 1));
      music.loop(true); // Loop the music
      music.play();
      this.currentMusic = music;
    } else {
      console.warn(`Music ${musicName} not found`);
    }
  }
  
  public stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }
  
  public pauseAll(): void {
    // Pause all sounds
    Object.values(this.sounds).forEach(sound => {
      if (sound.playing()) {
        sound.pause();
      }
    });
    
    // Pause music
    if (this.currentMusic && this.currentMusic.playing()) {
      this.currentMusic.pause();
    }
  }
  
  public resumeAll(): void {
    // Resume sounds (they'll automatically continue)
    Object.values(this.sounds).forEach(sound => {
      // Sounds that were playing will automatically resume
    });
    
    // Resume music
    if (this.currentMusic) {
      this.currentMusic.play();
    }
  }
  
  public stopAll(): void {
    // Stop all sounds
    Object.values(this.sounds).forEach(sound => {
      sound.stop();
    });
    
    // Stop music
    this.stopMusic();
  }
  
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    Howler.volume(this.masterVolume);
  }
  
  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    
    // Update current music volume
    if (this.currentMusic) {
      this.currentMusic.volume(this.musicVolume);
    }
  }
  
  public setEffectVolume(volume: number): void {
    this.effectVolume = Math.max(0, Math.min(1, volume));
    
    // Update all sound volumes
    Object.values(this.sounds).forEach(sound => {
      sound.volume(this.effectVolume);
    });
  }
  
  // Spatial audio methods for positioning sounds in 3D space
  public setSoundPosition(soundName: string, x: number, y: number, z: number = 0): void {
    const sound = this.sounds[soundName];
    if (sound) {
      sound.pos(x, y, z);
    }
  }
  
  public setListenerPosition(x: number, y: number, z: number = 0): void {
    Howler.pos(x, y, z);
  }
  
  // Frequency-based audio effects
  public playFrequencyTone(frequency: number, duration: number, volume: number = 0.1): void {
    // Create a Web Audio API oscillator for precise frequency tones
    const audioContext = Howler.ctx;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }
  
  // Dynamic music adaptation
  public setMusicPitch(pitch: number): void {
    if (this.currentMusic) {
      // Howler.js doesn't directly support pitch shifting
      // In a real implementation, you'd use a more advanced audio library
      console.log(`Music pitch changed to: ${pitch}`);
    }
  }
  
  public getCurrentMusic(): string | null {
    if (this.currentMusic) {
      return Object.keys(this.music).find(key => this.music[key] === this.currentMusic) || null;
    }
    return null;
  }
  
  public isMusicPlaying(): boolean {
    return this.currentMusic ? this.currentMusic.playing() : false;
  }
  
  public getMusicProgress(): number {
    if (this.currentMusic) {
      return this.currentMusic.seek() || 0;
    }
    return 0;
  }
}