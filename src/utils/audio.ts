// High-Fidelity Ambient Soundscape Engine (Web Audio API)
// Designed with Indian Classical Tanpura harmonics, warm binaural breathing,
// temple bell resonances, and zero external network dependencies.

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private lfo: OscillatorNode | null = null;
  private delayNode: DelayNode | null = null;
  private feedbackGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.24, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Reverb/Delay line simulation for spatial temple warmth
      this.delayNode = this.ctx.createDelay();
      this.delayNode.delayTime.setValueAtTime(0.32, this.ctx.currentTime);

      this.feedbackGain = this.ctx.createGain();
      this.feedbackGain.gain.setValueAtTime(0.38, this.ctx.currentTime);

      // Lowpass on delay feedback to make it warm and diffuse
      const delayFilter = this.ctx.createBiquadFilter();
      delayFilter.type = 'lowpass';
      delayFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);

      this.delayNode.connect(delayFilter);
      delayFilter.connect(this.feedbackGain);
      this.feedbackGain.connect(this.delayNode);
      delayFilter.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startAmbient() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain || this.isPlaying) return;

      this.isPlaying = true;
      const now = this.ctx.currentTime;

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.0001, now);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.22, now + 3.5);

      // Warm Acoustic Resonance Filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, now);
      filter.Q.setValueAtTime(2.8, now);

      // Slow Breathing LFO (candlelight swell)
      this.lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      this.lfo.frequency.setValueAtTime(0.08, now); // ~12 second breath cycle
      lfoGain.gain.setValueAtTime(160, now);
      this.lfo.connect(filter.frequency);
      this.lfo.start(now);

      // Sacred Tanpura Harmonics in D (D2, A2, D3, F#3, A3, D4)
      const droneNotes = [
        { freq: 73.42, type: 'triangle' as OscillatorType, vol: 0.45, detune: 0 },
        { freq: 110.0, type: 'sine' as OscillatorType, vol: 0.35, detune: -4 },
        { freq: 146.83, type: 'triangle' as OscillatorType, vol: 0.28, detune: 3 },
        { freq: 185.0, type: 'sine' as OscillatorType, vol: 0.22, detune: -2 },
        { freq: 220.0, type: 'sine' as OscillatorType, vol: 0.18, detune: 5 },
        { freq: 293.66, type: 'sine' as OscillatorType, vol: 0.12, detune: -6 },
      ];

      this.oscillators = droneNotes.map((note) => {
        if (!this.ctx || !this.ambientGain) throw new Error();
        const osc = this.ctx.createOscillator();
        const vGain = this.ctx.createGain();

        osc.type = note.type;
        osc.frequency.setValueAtTime(note.freq, now);
        osc.detune.setValueAtTime(note.detune, now);

        vGain.gain.setValueAtTime(note.vol, now);

        osc.connect(vGain);
        vGain.connect(filter);
        osc.start(now);
        return osc;
      });

      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.masterGain);
    } catch {
      this.isPlaying = false;
    }
  }

  public stopAmbient() {
    if (!this.ctx || !this.ambientGain || !this.isPlaying) return;
    try {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.linearRampToValueAtTime(0.0001, now + 1.5);
      setTimeout(() => {
        this.oscillators.forEach((osc) => {
          try { osc.stop(); osc.disconnect(); } catch { /* ignore */ }
        });
        if (this.lfo) {
          try { this.lfo.stop(); this.lfo.disconnect(); } catch { /* ignore */ }
        }
        this.oscillators = [];
        this.lfo = null;
        this.isPlaying = false;
      }, 1600);
    } catch {
      this.isPlaying = false;
    }
  }

  public toggleMute(): boolean {
    if (!this.ctx || !this.masterGain) {
      this.isMuted = !this.isMuted;
      return this.isMuted;
    }
    const now = this.ctx.currentTime;
    if (this.isMuted) {
      this.masterGain.gain.setValueAtTime(0.001, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.24, now + 0.35);
      this.isMuted = false;
    } else {
      this.masterGain.gain.setValueAtTime(0.24, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      this.isMuted = true;
    }
    return this.isMuted;
  }

  // Temple Diya bell chime (rich Tibetan/Indian bell with overtone)
  public playDiyaChime(diyaIndex: number) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain || !this.delayNode) return;

      const now = this.ctx.currentTime;
      // Raga Bhupali pentatonic frequencies: D5, E5, F#5, A5, B5
      const scale = [587.33, 659.25, 739.99, 880.0, 987.77];
      const baseFreq = scale[diyaIndex % scale.length];

      // Fundamental Bell Note
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(baseFreq, now);

      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.exponentialRampToValueAtTime(0.3, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      // Bell Harmonic Overtone (metallic ring)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(baseFreq * 2.76, now);

      gain2.gain.setValueAtTime(0.0001, now);
      gain2.gain.exponentialRampToValueAtTime(0.12, now + 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc1.connect(gain1);
      osc2.connect(gain2);

      gain1.connect(this.masterGain);
      gain2.connect(this.masterGain);

      // Send to spatial delay
      gain1.connect(this.delayNode);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.9);
      osc2.stop(now + 1.3);
    } catch {
      // Ignore
    }
  }

  // Romantic Harp / Glockenspiel arpeggio for letter unseal
  public playLetterOpenChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain || !this.delayNode) return;

      const notes = [293.66, 369.99, 440.0, 587.33, 739.99, 880.0, 1174.66];
      notes.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain || !this.delayNode) return;
        const now = this.ctx.currentTime + i * 0.085;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.18, now + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

        osc.connect(gain);
        gain.connect(this.masterGain);
        gain.connect(this.delayNode);

        osc.start(now);
        osc.stop(now + 2.3);
      });
    } catch {
      // Ignore
    }
  }

  // Sparkling festive glissando
  public playSparkleSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(550, now + 0.4);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.42);
    } catch {
      // Ignore
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }
}

export const soundscape = new SoundscapeEngine();
