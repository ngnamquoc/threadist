import { Audio } from 'expo-av';
import { apiService, AudioStreamResponse } from './apiService';

export interface AudioPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoaded: boolean;
  duration: number;
  position: number;
  currentStory?: any;
}

class AudioService {
  private sound: Audio.Sound | null = null;
  private currentAudioUrl: string | null = null;
  private onStateChange?: (state: AudioPlayerState) => void;

  constructor() {
    this.setupAudio();
  }

  private async setupAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error setting up audio mode:', error);
    }
  }

  public setOnStateChange(callback: (state: AudioPlayerState) => void) {
    this.onStateChange = callback;
  }

  private notifyStateChange(state: Partial<AudioPlayerState>) {
    if (this.onStateChange) {
      this.onStateChange({
        isPlaying: false,
        isPaused: false,
        isLoaded: false,
        duration: 0,
        position: 0,
        ...state,
      });
    }
  }

  public async loadAudio(text: string, story?: any): Promise<boolean> {
    try {
      // Unload previous audio
      await this.unloadAudio();

      // Generate audio from text
      const audioResponse: AudioStreamResponse = await apiService.generateAudio(text);
      const audioUrl = apiService.getAudioUrl(audioResponse.audio_url.split('/').pop()!);

      // Load the audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false },
        this.onPlaybackStatusUpdate.bind(this)
      );

      this.sound = sound;
      this.currentAudioUrl = audioUrl;

      this.notifyStateChange({
        isLoaded: true,
        currentStory: story,
      });

      return true;
    } catch (error) {
      console.error('Error loading audio:', error);
      this.notifyStateChange({
        isLoaded: false,
        currentStory: undefined,
      });
      return false;
    }
  }

  public async play(): Promise<void> {
    if (this.sound && this.currentAudioUrl) {
      try {
        await this.sound.playAsync();
        this.notifyStateChange({ isPlaying: true, isPaused: false });
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  }

  public async pause(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.pauseAsync();
        this.notifyStateChange({ isPlaying: false, isPaused: true });
      } catch (error) {
        console.error('Error pausing audio:', error);
      }
    }
  }

  public async stop(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.setPositionAsync(0);
        this.notifyStateChange({ isPlaying: false, isPaused: false, position: 0 });
      } catch (error) {
        console.error('Error stopping audio:', error);
      }
    }
  }

  public async seekTo(position: number): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.setPositionAsync(position);
      } catch (error) {
        console.error('Error seeking audio:', error);
      }
    }
  }

  public async unloadAudio(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
        this.sound = null;
        this.currentAudioUrl = null;
        this.notifyStateChange({
          isPlaying: false,
          isPaused: false,
          isLoaded: false,
          duration: 0,
          position: 0,
          currentStory: undefined,
        });
      } catch (error) {
        console.error('Error unloading audio:', error);
      }
    }
  }

  private onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      this.notifyStateChange({
        isPlaying: status.isPlaying,
        isPaused: status.isPaused,
        isLoaded: true,
        duration: status.durationMillis || 0,
        position: status.positionMillis || 0,
      });

      // Auto-stop when audio finishes
      if (status.didJustFinish) {
        this.notifyStateChange({
          isPlaying: false,
          isPaused: false,
          position: 0,
        });
      }
    }
  };

  public getCurrentState(): AudioPlayerState {
    return {
      isPlaying: false,
      isPaused: false,
      isLoaded: false,
      duration: 0,
      position: 0,
    };
  }

  public async cleanup(): Promise<void> {
    await this.unloadAudio();
    this.onStateChange = undefined;
  }
}

export const audioService = new AudioService(); 