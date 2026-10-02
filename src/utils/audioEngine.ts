import { Track } from '../types/music';
import { getLocalTrackBlob } from './db';

export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const EQ_PRESETS: Record<string, number[]> = {
  'Flat': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Bass Boost': [6, 5, 4, 2, 0, 0, 0, 1, 2, 3],
  'Vocal Clarity': [-2, -2, -1, 1, 3, 4, 3, 2, 1, 0],
  'Electronic': [5, 4, 2, 0, -2, 2, 1, 3, 4, 4],
  'Rock & Roll': [4, 3, 1, -1, -2, 1, 2, 3, 4, 4],
  'Acoustic Warmth': [3, 2, 1, 1, 2, 2, 3, 3, 2, 1],
  'Classical Hall': [3, 3, 2, 1, -1, -1, 0, 2, 3, 3],
  'Lo-Fi Mellow': [4, 3, 2, 1, 0, -1, -2, -3, -4, -5],
};

export class AudioEngine {
  private static instance: AudioEngine;

  // Local audio element & Web Audio API
  private audioEl: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private currentObjectUrl: string | null = null;

  // YouTube player references
  private ytPlayer: any = null;
  private ytIframe: HTMLIFrameElement | null = null;
  private isYtReady = false;
  private pendingYtVideoId: string | null = null;

  // Playback state
  private currentTrack: Track | null = null;
  private isPlaying = false;
  private volume = 0.85;
  private isMuted = false;
  private playbackRate = 1.0;
  private currentTime = 0;
  private duration = 0;

  // Progress polling & simulated smooth clock
  private progressInterval: any = null;
  private lastClockTick = 0;

  // State callbacks
  private onTimeUpdateCallback: ((time: number, duration: number) => void) | null = null;
  private onStateChangeCallback: ((isPlaying: boolean, isBuffering: boolean) => void) | null = null;
  private onTrackEndCallback: (() => void) | null = null;

  // Simulated visualizer state for YouTube
  private simPhases: number[] = new Array(64).fill(0);

  private constructor() {
    this.initHtml5Audio();
    this.initYouTubeListener();
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  // Attach the permanently mounted YouTube iframe
  public registerYouTubeIframe(iframe: HTMLIFrameElement) {
    this.ytIframe = iframe;

    // Attach YouTube API if available
    this.initYtPlayerOnIframe(iframe);
  }

  private initHtml5Audio() {
    if (typeof window === 'undefined') return;

    this.audioEl = new Audio();
    this.audioEl.crossOrigin = 'anonymous';

    this.audioEl.addEventListener('timeupdate', () => {
      if (this.currentTrack?.source === 'local' && this.audioEl) {
        const cur = this.audioEl.currentTime || 0;
        const dur = this.audioEl.duration || this.currentTrack.duration || 0;
        this.currentTime = cur;
        if (dur > 0) this.duration = dur;
        this.onTimeUpdateCallback?.(cur, dur);
      }
    });

    this.audioEl.addEventListener('play', () => {
      if (this.currentTrack?.source === 'local') {
        this.isPlaying = true;
        this.onStateChangeCallback?.(true, false);
      }
    });

    this.audioEl.addEventListener('pause', () => {
      if (this.currentTrack?.source === 'local') {
        this.isPlaying = false;
        this.onStateChangeCallback?.(false, false);
      }
    });

    this.audioEl.addEventListener('waiting', () => {
      if (this.currentTrack?.source === 'local') {
        this.onStateChangeCallback?.(this.isPlaying, true);
      }
    });

    this.audioEl.addEventListener('playing', () => {
      if (this.currentTrack?.source === 'local') {
        this.isPlaying = true;
        this.onStateChangeCallback?.(true, false);
      }
    });

    this.audioEl.addEventListener('ended', () => {
      if (this.currentTrack?.source === 'local') {
        this.onTrackEndCallback?.();
      }
    });
  }

  private setupWebAudio() {
    if (!this.audioEl || this.audioCtx) return;

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      const source = this.audioCtx.createMediaElementSource(this.audioEl);

      // Create 10-band equalizer filters
      this.eqFilters = EQ_FREQUENCIES.map((freq) => {
        const filter = this.audioCtx!.createBiquadFilter();
        if (freq <= 32) {
          filter.type = 'lowshelf';
        } else if (freq >= 16000) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.4;
        }
        filter.frequency.value = freq;
        filter.gain.value = 0;
        return filter;
      });

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      let lastNode: AudioNode = source;
      for (const filter of this.eqFilters) {
        lastNode.connect(filter);
        lastNode = filter;
      }
      lastNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    } catch (e) {
      console.warn('Web Audio API setup notice:', e);
    }
  }

  private initYouTubeListener() {
    if (typeof window === 'undefined') return;

    // Listen to postMessage from YouTube Iframe
    window.addEventListener('message', (event) => {
      try {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);
          if (data.event === 'onReady') {
            this.isYtReady = true;
            this.sendYtCommand('setVolume', [Math.round(this.volume * 100)]);
            if (this.isMuted) this.sendYtCommand('mute');
            if (this.pendingYtVideoId) {
              const id = this.pendingYtVideoId;
              this.pendingYtVideoId = null;
              this.playYouTubeVideo(id);
            }
          } else if (data.event === 'onStateChange') {
            // State: 1 = playing, 2 = paused, 0 = ended, 3 = buffering
            const state = data.info;
            if (state === 1) {
              this.isPlaying = true;
              this.onStateChangeCallback?.(true, false);
            } else if (state === 2) {
              this.isPlaying = false;
              this.onStateChangeCallback?.(false, false);
            } else if (state === 3) {
              this.onStateChangeCallback?.(this.isPlaying, true);
            } else if (state === 0) {
              this.isPlaying = false;
              this.onTrackEndCallback?.();
            }
          } else if (data.event === 'infoDelivery' && data.info) {
            if (typeof data.info.currentTime === 'number') {
              this.currentTime = data.info.currentTime;
              if (data.info.duration) this.duration = data.info.duration;
              this.onTimeUpdateCallback?.(this.currentTime, this.duration);
            }
            if (data.info.playerState === 1 && !this.isPlaying) {
              this.isPlaying = true;
              this.onStateChangeCallback?.(true, false);
            }
          }
        }
      } catch {}
    });

    // Check for YT.Player global
    const initYt = () => {
      if ((window as any).YT && (window as any).YT.Player && this.ytIframe) {
        this.initYtPlayerOnIframe(this.ytIframe);
      }
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initYt();
    } else {
      (window as any).onYouTubeIframeAPIReady = () => {
        initYt();
      };
      setTimeout(initYt, 1000);
      setTimeout(initYt, 2500);
    }
  }

  private initYtPlayerOnIframe(iframe: HTMLIFrameElement) {
    if (this.ytPlayer || !(window as any).YT || !(window as any).YT.Player) return;

    try {
      this.ytPlayer = new (window as any).YT.Player(iframe, {
        events: {
          onReady: () => {
            this.isYtReady = true;
            this.applyVolumeToPlayers();
            if (this.pendingYtVideoId) {
              const vid = this.pendingYtVideoId;
              this.pendingYtVideoId = null;
              this.playYouTubeVideo(vid);
            }
          },
          onStateChange: (event: any) => {
            if (this.currentTrack?.source !== 'youtube') return;
            const state = event.data;
            if (state === 1) {
              this.isPlaying = true;
              this.onStateChangeCallback?.(true, false);
            } else if (state === 2) {
              this.isPlaying = false;
              this.onStateChangeCallback?.(false, false);
            } else if (state === 3) {
              this.onStateChangeCallback?.(this.isPlaying, true);
            } else if (state === 0) {
              this.isPlaying = false;
              this.onTrackEndCallback?.();
            }
          },
        },
      });
    } catch (err) {
      console.warn('Notice attaching YT.Player to iframe:', err);
    }
  }

  // Send native postMessage command to YouTube iframe
  public sendYtCommand(func: string, args: any[] = []) {
    if (this.ytIframe && this.ytIframe.contentWindow) {
      this.ytIframe.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func,
          args,
        }),
        '*'
      );
    }
    // Also try YT Player instance if available
    if (this.ytPlayer && typeof this.ytPlayer[func] === 'function') {
      try {
        this.ytPlayer[func](...args);
      } catch {}
    }
  }

  // Play track (YouTube or Local)
  public async playTrack(track: Track): Promise<void> {
    this.currentTrack = track;
    this.currentTime = 0;
    this.duration = track.duration || 0;
    this.isPlaying = true;
    this.lastClockTick = performance.now();

    // Notify UI immediately that track has started
    this.onStateChangeCallback?.(true, true);
    this.onTimeUpdateCallback?.(0, this.duration);
    this.startProgressPolling();

    if (track.source === 'local') {
      // Pause YouTube
      this.sendYtCommand('pauseVideo');

      // Setup Web Audio on user gesture
      this.setupWebAudio();
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      if (this.currentObjectUrl) {
        URL.revokeObjectURL(this.currentObjectUrl);
        this.currentObjectUrl = null;
      }

      const blob = await getLocalTrackBlob(track.id);
      if (!blob) {
        throw new Error('Local audio file not found in storage');
      }

      this.currentObjectUrl = URL.createObjectURL(blob);
      if (this.audioEl) {
        this.audioEl.src = this.currentObjectUrl;
        this.audioEl.playbackRate = this.playbackRate;
        this.applyVolumeToPlayers();
        await this.audioEl.play();
      }
    } else {
      // Source is YouTube
      if (this.audioEl) {
        this.audioEl.pause();
      }

      this.playYouTubeVideo(track.id);
    }
  }

  private playYouTubeVideo(videoId: string) {
    this.pendingYtVideoId = videoId;

    // Load via iframe src or postMessage/YT.Player
    if (this.ytIframe) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const targetSrc = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1&playsinline=1&controls=0&origin=${encodeURIComponent(
        origin
      )}`;

      // If iframe currently has a different video, update its src or load video
      if (!this.ytIframe.src.includes(videoId)) {
        this.ytIframe.src = targetSrc;
      }
    }

    // Call load and play commands
    this.sendYtCommand('loadVideoById', [
      {
        videoId,
        startSeconds: 0,
        suggestedQuality: 'small',
      },
    ]);
    this.sendYtCommand('playVideo');
    this.applyVolumeToPlayers();
  }

  // Active smooth clock for continuous progress bar updates
  private startProgressPolling() {
    this.stopProgressPolling();
    this.lastClockTick = performance.now();

    this.progressInterval = setInterval(() => {
      const now = performance.now();
      const deltaSec = (now - this.lastClockTick) / 1000;
      this.lastClockTick = now;

      if (!this.isPlaying) return;

      if (this.currentTrack?.source === 'youtube') {
        // Query current time from YT Player if available
        let ytTime: number | null = null;
        if (this.ytPlayer && typeof this.ytPlayer.getCurrentTime === 'function') {
          try {
            ytTime = this.ytPlayer.getCurrentTime();
            const d = this.ytPlayer.getDuration();
            if (d && d > 0) this.duration = d;
          } catch {}
        }

        // If YT Player provided a valid current time, synchronize
        if (ytTime !== null && ytTime > 0) {
          this.currentTime = ytTime;
        } else {
          // Smooth increment fallback while buffering/playing
          this.currentTime = Math.min(this.duration || 9999, this.currentTime + deltaSec * this.playbackRate);
        }

        this.onTimeUpdateCallback?.(this.currentTime, this.duration);

        // Check track finish
        if (this.duration > 0 && this.currentTime >= this.duration) {
          this.onTrackEndCallback?.();
        }
      }
    }, 250);
  }

  private stopProgressPolling() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.currentTrack?.source === 'local') {
      this.audioEl?.pause();
    } else {
      this.sendYtCommand('pauseVideo');
    }
    this.onStateChangeCallback?.(false, false);
  }

  public resume(): void {
    this.isPlaying = true;
    this.lastClockTick = performance.now();
    this.startProgressPolling();

    if (this.currentTrack?.source === 'local') {
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      this.audioEl?.play();
    } else {
      this.sendYtCommand('playVideo');
    }
    this.onStateChangeCallback?.(true, false);
  }

  public seek(seconds: number): void {
    if (isNaN(seconds) || seconds < 0) return;
    this.currentTime = seconds;
    this.lastClockTick = performance.now();

    if (this.currentTrack?.source === 'local') {
      if (this.audioEl) {
        this.audioEl.currentTime = seconds;
      }
    } else {
      this.sendYtCommand('seekTo', [seconds, true]);
    }

    this.onTimeUpdateCallback?.(this.currentTime, this.duration);
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    this.applyVolumeToPlayers();
  }

  public setMute(muted: boolean): void {
    this.isMuted = muted;
    this.applyVolumeToPlayers();
  }

  private applyVolumeToPlayers(): void {
    const effectiveVol = this.isMuted ? 0 : this.volume;

    if (this.audioEl) {
      this.audioEl.volume = effectiveVol;
    }

    const ytVol = Math.round(effectiveVol * 100);
    this.sendYtCommand('setVolume', [ytVol]);
    if (this.isMuted) {
      this.sendYtCommand('mute');
    } else {
      this.sendYtCommand('unMute');
    }
  }

  public setPlaybackRate(rate: number): void {
    this.playbackRate = rate;
    if (this.audioEl) {
      this.audioEl.playbackRate = rate;
    }
    this.sendYtCommand('setPlaybackRate', [rate]);
  }

  public setEqualizerBand(index: number, gainDb: number): void {
    if (this.eqFilters[index]) {
      this.eqFilters[index].gain.value = gainDb;
    }
  }

  public setEqualizerPreset(gains: number[]): void {
    gains.forEach((gain, idx) => {
      this.setEqualizerBand(idx, gain);
    });
  }

  // Get frequency data for visualizer
  public getFrequencyData(outputArray: Uint8Array): void {
    if (this.currentTrack?.source === 'local' && this.analyser) {
      this.analyser.getByteFrequencyData(outputArray as any);
      return;
    }

    // Simulated responsive audio frequency for YouTube stream
    if (!this.isPlaying) {
      for (let i = 0; i < outputArray.length; i++) {
        outputArray[i] = Math.max(0, outputArray[i] * 0.85 - 2);
      }
      return;
    }

    const t = performance.now() * 0.003;
    const len = outputArray.length;
    for (let i = 0; i < len; i++) {
      const freqRatio = i / len;
      this.simPhases[i % this.simPhases.length] = (this.simPhases[i % this.simPhases.length] || 0) + 0.05;

      const bassBoost = Math.exp(-freqRatio * 3.5);
      const wave1 = Math.sin(t * 1.5 + i * 0.3) * 0.5 + 0.5;
      const wave2 = Math.cos(t * 2.8 + i * 0.6) * 0.5 + 0.5;
      const beatPulse = Math.pow(Math.sin(t * 2.0), 4) * (freqRatio < 0.2 ? 70 : 20);

      const val = (wave1 * 100 + wave2 * 60 + beatPulse) * (0.4 + bassBoost * 0.8) * this.volume;
      outputArray[i] = Math.min(255, Math.max(10, Math.floor(val)));
    }
  }

  // Bind UI callbacks
  public onTimeUpdate(cb: (time: number, duration: number) => void): void {
    this.onTimeUpdateCallback = cb;
  }

  public onStateChange(cb: (isPlaying: boolean, isBuffering: boolean) => void): void {
    this.onStateChangeCallback = cb;
  }

  public onTrackEnd(cb: () => void): void {
    this.onTrackEndCallback = cb;
  }
}
