/**
 * Web Audio API Engine for Embodied Sensory Soundscapes & Somatic Breathing
 * Completely offline, procedural, multi-track audio synthesis.
 */

export type AmbientTrackId = 'rain' | 'fireplace' | 'wind' | 'vinyl' | 'singing_bowl' | 'waves';

export interface AmbientTrackConfig {
  id: AmbientTrackId;
  name: string;
  subname: string;
  description: string;
  icon: string;
  volume: number; // 0 to 1
  enabled: boolean;
}

export interface SoundscapePreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  tracks: Partial<Record<AmbientTrackId, number>>; // volume per track, 0 to 1
}

export const SOUNDSCAPE_PRESETS: SoundscapePreset[] = [
  {
    id: 'rainy_fireside',
    name: '雨夜炉火',
    description: '窗外春雨打瓦，炉内柴火温热噼啪，内敛归心',
    icon: '🔥',
    tracks: {
      fireplace: 0.75,
      rain: 0.55,
      vinyl: 0.2
    }
  },
  {
    id: 'mountain_monastery',
    name: '深山行禅',
    description: '空灵松涛拂过松针，深沉颂钵涤荡心绪杂念',
    icon: '🌲',
    tracks: {
      wind: 0.8,
      singing_bowl: 0.5,
      rain: 0.2
    }
  },
  {
    id: 'darkroom_whisper',
    name: '胶片暗房',
    description: '老式黑胶唱机转动与定影液静默水汽',
    icon: '🎞️',
    tracks: {
      vinyl: 0.75,
      waves: 0.35,
      singing_bowl: 0.15
    }
  },
  {
    id: 'ocean_tide_breath',
    name: '潮汐归真',
    description: '深海浪涌潮起潮落，与呼吸节律天人同频',
    icon: '🌊',
    tracks: {
      waves: 0.85,
      wind: 0.35,
      singing_bowl: 0.3
    }
  }
];

class MultiTrackAmbientEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private trackGains: Map<AmbientTrackId, GainNode> = new Map();
  private trackNodes: Map<AmbientTrackId, { stop: () => void }> = new Map();
  private isMasterPlaying: boolean = false;
  private masterVolume: number = 0.65;
  private sleepTimerId: number | null = null;
  private sleepTimerRemaining: number = 0; // seconds

  private listeners: Set<() => void> = new Set();

  private trackConfigs: Record<AmbientTrackId, AmbientTrackConfig> = {
    rain: {
      id: 'rain',
      name: '初春细雨',
      subname: '打瓦与檐水',
      description: '轻柔粉红噪声双极滤波，点点水滴落在青石与瓦当上',
      icon: '🌧️',
      volume: 0.5,
      enabled: true
    },
    fireplace: {
      id: 'fireplace',
      name: '壁炉柴火',
      subname: '噼啪与暗红余烬',
      description: '低频温润轰鸣与随机微型爆裂声，如掌心的体温',
      icon: '🪵',
      volume: 0.6,
      enabled: true
    },
    wind: {
      id: 'wind',
      name: '远山松涛',
      subname: '山谷微风长吟',
      description: '双峰带通慢速摆动，在林间徐徐吹拂的辽阔风感',
      icon: '🍃',
      volume: 0.45,
      enabled: false
    },
    vinyl: {
      id: 'vinyl',
      name: '黑胶唱针',
      subname: '暗房显影微粒',
      description: '33⅓转温热底噪与机械摩擦微鸣，唤醒时间的质感',
      icon: '📻',
      volume: 0.4,
      enabled: false
    },
    singing_bowl: {
      id: 'singing_bowl',
      name: '静心颂钵',
      subname: '多重泛音回荡',
      description: '纯正基频与复合泛音的舒展颤音，沉入迷走神经共鸣',
      icon: '🔔',
      volume: 0.35,
      enabled: false
    },
    waves: {
      id: 'waves',
      name: '深海潮汐',
      subname: '涌落波澜起伏',
      description: '大自然原生的呼吸周期，浪峰翻涌与沙石退潮',
      icon: '🌊',
      volume: 0.5,
      enabled: false
    }
  };

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.masterGain && this.ctx) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  // Subscribe to state updates
  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  getTracks(): AmbientTrackConfig[] {
    return Object.values(this.trackConfigs);
  }

  getTrack(id: AmbientTrackId): AmbientTrackConfig {
    return this.trackConfigs[id];
  }

  getMasterPlaying(): boolean {
    return this.isMasterPlaying;
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  getActiveTracksCount(): number {
    if (!this.isMasterPlaying) return 0;
    return Object.values(this.trackConfigs).filter(t => t.enabled && t.volume > 0.05).length;
  }

  setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
    this.notify();
  }

  setTrackVolume(id: AmbientTrackId, vol: number) {
    const config = this.trackConfigs[id];
    if (!config) return;
    config.volume = Math.max(0, Math.min(1, vol));
    const gainNode = this.trackGains.get(id);
    if (gainNode && this.ctx) {
      const actualGain = config.enabled && this.isMasterPlaying ? config.volume : 0;
      gainNode.gain.setTargetAtTime(actualGain, this.ctx.currentTime, 0.05);
    }
    this.notify();
  }

  setTrackEnabled(id: AmbientTrackId, enabled: boolean) {
    const config = this.trackConfigs[id];
    if (!config) return;
    config.enabled = enabled;

    if (this.isMasterPlaying) {
      if (enabled) {
        if (!this.trackNodes.has(id)) {
          this.startTrack(id);
        } else {
          const gainNode = this.trackGains.get(id);
          if (gainNode && this.ctx) {
            gainNode.gain.setTargetAtTime(config.volume, this.ctx.currentTime, 0.08);
          }
        }
      } else {
        const gainNode = this.trackGains.get(id);
        if (gainNode && this.ctx) {
          gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);
        }
      }
    }
    this.notify();
  }

  applyPreset(preset: SoundscapePreset) {
    this.initContext();
    // Disable all first or set them specifically
    (Object.keys(this.trackConfigs) as AmbientTrackId[]).forEach((id) => {
      if (id in preset.tracks) {
        this.trackConfigs[id].enabled = true;
        this.trackConfigs[id].volume = preset.tracks[id]!;
      } else {
        this.trackConfigs[id].enabled = false;
      }
    });

    if (!this.isMasterPlaying) {
      this.startMaster();
    } else {
      this.syncAllTracks();
    }
    this.notify();
  }

  toggleMaster() {
    if (this.isMasterPlaying) {
      this.stopMaster();
    } else {
      this.startMaster();
    }
  }

  startMaster() {
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    this.isMasterPlaying = true;
    this.masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(this.masterVolume, ctx.currentTime + 0.8);

    (Object.keys(this.trackConfigs) as AmbientTrackId[]).forEach((id) => {
      if (this.trackConfigs[id].enabled) {
        this.startTrack(id);
      }
    });

    this.notify();
  }

  stopMaster() {
    if (!this.isMasterPlaying) return;
    const ctx = this.ctx;
    if (ctx && this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      setTimeout(() => {
        this.stopAllTracks();
        this.isMasterPlaying = false;
        this.notify();
      }, 850);
    } else {
      this.stopAllTracks();
      this.isMasterPlaying = false;
      this.notify();
    }
  }

  private stopAllTracks() {
    this.trackNodes.forEach((node) => {
      try {
        node.stop();
      } catch {}
    });
    this.trackNodes.clear();
    this.trackGains.clear();
  }

  private syncAllTracks() {
    (Object.keys(this.trackConfigs) as AmbientTrackId[]).forEach((id) => {
      const config = this.trackConfigs[id];
      if (config.enabled) {
        if (!this.trackNodes.has(id)) {
          this.startTrack(id);
        } else {
          const gain = this.trackGains.get(id);
          if (gain && this.ctx) {
            gain.gain.setTargetAtTime(config.volume, this.ctx.currentTime, 0.05);
          }
        }
      } else {
        const gain = this.trackGains.get(id);
        if (gain && this.ctx) {
          gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
        }
      }
    });
  }

  private startTrack(id: AmbientTrackId) {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    if (this.trackNodes.has(id)) {
      const gainNode = this.trackGains.get(id);
      if (gainNode) {
        gainNode.gain.setTargetAtTime(this.trackConfigs[id].volume, ctx.currentTime, 0.05);
      }
      return;
    }

    const trackGain = ctx.createGain();
    const targetVol = this.trackConfigs[id].enabled ? this.trackConfigs[id].volume : 0;
    trackGain.gain.setValueAtTime(0.001, ctx.currentTime);
    trackGain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 0.6);
    trackGain.connect(this.masterGain);
    this.trackGains.set(id, trackGain);

    let stopFn: () => void = () => {};

    if (id === 'rain') {
      stopFn = this.synthRain(ctx, trackGain);
    } else if (id === 'fireplace') {
      stopFn = this.synthFireplace(ctx, trackGain);
    } else if (id === 'wind') {
      stopFn = this.synthWind(ctx, trackGain);
    } else if (id === 'vinyl') {
      stopFn = this.synthVinyl(ctx, trackGain);
    } else if (id === 'singing_bowl') {
      stopFn = this.synthSingingBowl(ctx, trackGain);
    } else if (id === 'waves') {
      stopFn = this.synthWaves(ctx, trackGain);
    }

    this.trackNodes.set(id, { stop: stopFn });
  }

  // --- Synthesis Subroutines ---

  private synthRain(ctx: AudioContext, dest: GainNode): () => void {
    // Pink noise base for continuous rainfall
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const out = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      out[i] = (b0 + b1 + b2 + white * 0.1) * 0.45;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter1 = ctx.createBiquadFilter();
    filter1.type = 'lowpass';
    filter1.frequency.setValueAtTime(1400, ctx.currentTime);

    const filter2 = ctx.createBiquadFilter();
    filter2.type = 'highpass';
    filter2.frequency.setValueAtTime(180, ctx.currentTime);

    noiseSource.connect(filter1);
    filter1.connect(filter2);
    filter2.connect(dest);
    noiseSource.start();

    // Random raindrops
    let dropTimer: number;
    const scheduleDrop = () => {
      try {
        const osc = ctx.createOscillator();
        const dropGain = ctx.createGain();
        osc.type = 'sine';
        const startFreq = 800 + Math.random() * 900;
        osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 0.35, ctx.currentTime + 0.08);

        dropGain.gain.setValueAtTime(0.04, ctx.currentTime);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

        osc.connect(dropGain);
        dropGain.connect(dest);
        osc.start();
        osc.stop(ctx.currentTime + 0.09);
      } catch {}

      dropTimer = window.setTimeout(scheduleDrop, 120 + Math.random() * 450);
    };
    scheduleDrop();

    return () => {
      try { noiseSource.stop(); } catch {}
      clearTimeout(dropTimer);
    };
  }

  private synthFireplace(ctx: AudioContext, dest: GainNode): () => void {
    // Low rumble bed
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const out = noiseBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      out[i] = last * 4.0;
    }

    const rumble = ctx.createBufferSource();
    rumble.buffer = noiseBuffer;
    rumble.loop = true;

    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(220, ctx.currentTime);

    rumble.connect(rumbleFilter);
    rumbleFilter.connect(dest);
    rumble.start();

    // Crackle & spark pops
    let crackleTimer: number;
    const scheduleCrackle = () => {
      try {
        const isBigSnap = Math.random() > 0.7;
        const popDuration = isBigSnap ? 0.04 : 0.015;
        const popOsc = ctx.createOscillator();
        const popGain = ctx.createGain();
        popOsc.type = 'triangle';
        popOsc.frequency.setValueAtTime(140 + Math.random() * 600, ctx.currentTime);

        const vol = isBigSnap ? 0.12 : 0.04;
        popGain.gain.setValueAtTime(vol, ctx.currentTime);
        popGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + popDuration);

        popOsc.connect(popGain);
        popGain.connect(dest);
        popOsc.start();
        popOsc.stop(ctx.currentTime + popDuration + 0.01);
      } catch {}

      crackleTimer = window.setTimeout(scheduleCrackle, 80 + Math.random() * 280);
    };
    scheduleCrackle();

    return () => {
      try { rumble.stop(); } catch {}
      clearTimeout(crackleTimer);
    };
  }

  private synthWind(ctx: AudioContext, dest: GainNode): () => void {
    const bufferSize = ctx.sampleRate * 3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const out = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      out[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);
    filter.Q.setValueAtTime(3.0, ctx.currentTime);

    // Wandering wind LFO
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // slow swell
    lfoGain.gain.setValueAtTime(180, ctx.currentTime);
    lfo.connect(filter.frequency);
    lfo.start();

    noise.connect(filter);
    filter.connect(dest);
    noise.start();

    return () => {
      try {
        noise.stop();
        lfo.stop();
      } catch {}
    };
  }

  private synthVinyl(ctx: AudioContext, dest: GainNode): () => void {
    // 50Hz subtle power amp hum
    const humOsc = ctx.createOscillator();
    const humGain = ctx.createGain();
    humOsc.type = 'sine';
    humOsc.frequency.setValueAtTime(50, ctx.currentTime);
    humGain.gain.setValueAtTime(0.02, ctx.currentTime);
    humOsc.connect(humGain);
    humGain.connect(dest);
    humOsc.start();

    // Rhythmic needle ticks (33 RPM ~ 1.8 seconds period)
    let tickTimer: number;
    const scheduleTick = () => {
      try {
        const tickOsc = ctx.createOscillator();
        const tickGain = ctx.createGain();
        tickOsc.type = 'square';
        tickOsc.frequency.setValueAtTime(2500 + Math.random() * 1200, ctx.currentTime);

        tickGain.gain.setValueAtTime(0.03, ctx.currentTime);
        tickGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.008);

        tickOsc.connect(tickGain);
        tickGain.connect(dest);
        tickOsc.start();
        tickOsc.stop(ctx.currentTime + 0.01);
      } catch {}

      // Slight variation around turntable rotation
      tickTimer = window.setTimeout(scheduleTick, 1780 + (Math.random() * 40 - 20));
    };
    scheduleTick();

    // High subtle surface noise
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const out = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      out[i] = (Math.random() * 2 - 1) * 0.12;
    }
    const surfaceNoise = ctx.createBufferSource();
    surfaceNoise.buffer = noiseBuffer;
    surfaceNoise.loop = true;

    const surfaceFilter = ctx.createBiquadFilter();
    surfaceFilter.type = 'highpass';
    surfaceFilter.frequency.setValueAtTime(3200, ctx.currentTime);

    surfaceNoise.connect(surfaceFilter);
    surfaceFilter.connect(dest);
    surfaceNoise.start();

    return () => {
      try {
        humOsc.stop();
        surfaceNoise.stop();
      } catch {}
      clearTimeout(tickTimer);
    };
  }

  private synthSingingBowl(ctx: AudioContext, dest: GainNode): () => void {
    // Rich harmonic bell chords (F#4 fundamental ~ 370Hz with detuned overtones)
    const baseFreq = 370;
    const harmonics = [
      { ratio: 1.0, gain: 0.12, detune: 0 },
      { ratio: 2.76, gain: 0.06, detune: 1.5 },
      { ratio: 5.4, gain: 0.03, detune: -1.0 }
    ];

    const activeOscs: OscillatorNode[] = [];
    const activeLfos: OscillatorNode[] = [];

    harmonics.forEach((h, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * h.ratio, ctx.currentTime);

      // Tremolo / beat frequency
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.18 + idx * 0.06, ctx.currentTime);
      lfoGain.gain.setValueAtTime(h.gain * 0.35, ctx.currentTime);
      lfo.connect(oscGain.gain);
      lfo.start();

      oscGain.gain.setValueAtTime(h.gain, ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(dest);
      osc.start();

      activeOscs.push(osc);
      activeLfos.push(lfo);
    });

    return () => {
      activeOscs.forEach(o => { try { o.stop(); } catch {} });
      activeLfos.forEach(l => { try { l.stop(); } catch {} });
    };
  }

  private synthWaves(ctx: AudioContext, dest: GainNode): () => void {
    // Pink noise swept by a smooth periodic wave swell (8s cycle)
    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const out = noiseBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.025 * white) / 1.025;
      out[i] = last * 4.2;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(380, ctx.currentTime);
    filter.Q.setValueAtTime(1.1, ctx.currentTime);

    // Swell LFO
    const swellLfo = ctx.createOscillator();
    const swellGain = ctx.createGain();
    swellLfo.type = 'sine';
    swellLfo.frequency.setValueAtTime(0.125, ctx.currentTime); // 8-second wave period
    swellGain.gain.setValueAtTime(260, ctx.currentTime);
    swellLfo.connect(filter.frequency);
    swellLfo.start();

    // Volume modulation for rhythmic surge
    const swellVol = ctx.createGain();
    const volLfo = ctx.createOscillator();
    volLfo.type = 'sine';
    volLfo.frequency.setValueAtTime(0.125, ctx.currentTime);
    const volLfoGain = ctx.createGain();
    volLfoGain.gain.setValueAtTime(0.3, ctx.currentTime);
    volLfo.connect(volLfoGain);
    volLfoGain.connect(swellVol.gain);
    swellVol.gain.setValueAtTime(0.4, ctx.currentTime);
    volLfo.start();

    noise.connect(filter);
    filter.connect(swellVol);
    swellVol.connect(dest);
    noise.start();

    return () => {
      try {
        noise.stop();
        swellLfo.stop();
        volLfo.stop();
      } catch {}
    };
  }

  // --- Somatic Bell Chime (for breath phase transition) ---
  playBreathChime(type: 'inhale' | 'hold' | 'exhale') {
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const freq = type === 'inhale' ? 528 : type === 'hold' ? 639 : 396; // Solfeggio frequencies
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.9);
    } catch {}
  }

  // --- Tactile Paper / Postcard Flip Sound ---
  playPaperFlipSound() {
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      // Filtered pink-ish noise burst for cotton paper flutter & air swoosh
      const bufferSize = Math.floor(ctx.sampleRate * 0.16); // 160ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.96 * b1 + white * 0.1;
        b2 = 0.86 * b2 + white * 0.2;
        data[i] = (b0 + b1 + b2) * 0.4;
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.14);
      filter.Q.value = 1.2;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseNode.start();
      noiseNode.stop(ctx.currentTime + 0.17);
    } catch {}
  }
}

export const playPaperFlip = () => ambientMixer.playPaperFlipSound();

export const ambientMixer = new MultiTrackAmbientEngine();

// Retain legacy backwards-compatible ambientPlayer for existing components
class AmbientAudioPlayerCompat {
  playAmbient(type: 'rain' | 'ocean' | 'warmth' | 'breeze' = 'warmth', durationSeconds: number = 18): () => void {
    if (type === 'rain') {
      ambientMixer.applyPreset(SOUNDSCAPE_PRESETS[0]);
    } else if (type === 'ocean') {
      ambientMixer.applyPreset(SOUNDSCAPE_PRESETS[3]);
    } else {
      ambientMixer.applyPreset(SOUNDSCAPE_PRESETS[1]);
    }

    const timer = window.setTimeout(() => {
      ambientMixer.stopMaster();
    }, durationSeconds * 1000);

    return () => {
      clearTimeout(timer);
      ambientMixer.stopMaster();
    };
  }

  stop() {
    ambientMixer.stopMaster();
  }

  getPlaying() {
    return ambientMixer.getMasterPlaying();
  }
}

export const ambientPlayer = new AmbientAudioPlayerCompat();

/**
 * Convert audio blob to base64 data string for permanent offline persistence
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
