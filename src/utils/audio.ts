// Ambient Audio Engine using Web Audio API
// Generates warm, atmospheric Diwali ambient music and melodic chimes
// Zero network dependencies, 100% reliable across mobile and desktop.

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private lfo: OscillatorNode | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
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

      // Create drone gain node
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.001, now);
      // Smooth fade in over 3 seconds
      this.droneGain.gain.exponentialRampToValueAtTime(0.18, now + 3);

      // Lowpass warm filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.Q.setValueAtTime(2.5, now);

      // LFO for filter breathing (gentle candlelight pulse)
      this.lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      this.lfo.frequency.setValueAtTime(0.12, now); // slow breathing
      lfoGain.gain.setValueAtTime(140, now);
      this.lfo.connect(filter.frequency);
      this.lfo.start(now);

      // Warm Tanpura / Indian Classical Ambient Harmonics (D - A - D' - F#' - A')
      // Frequencies in Hz: D3 (146.83), A3 (220.0), D4 (293.66), F#4 (369.99), A4 (440.0)
      const freqs = [146.83, 220.0, 293.66, 369.99, 440.0];
      const types: OscillatorType[] = ['triangle', 'sine', 'triangle', 'sine', 'sine'];

      this.oscillators = freqs.map((freq, idx) => {
        if (!this.ctx || !this.droneGain) throw new Error();
        const osc = this.ctx.createOscillator();
        const voiceGain = this.ctx.createGain();
        osc.type = types[idx];
        osc.frequency.setValueAtTime(freq, now);

        // Individual voice subtle detuning for rich chorus
        const detune = (idx - 2) * 3;
        osc.detune.setValueAtTime(detune, now);

        const volume = idx === 0 ? 0.35 : idx === 1 ? 0.25 : 0.18;
        voiceGain.gain.setValueAtTime(volume, now);

        osc.connect(voiceGain);
        voiceGain.connect(filter);
        osc.start(now);
        return osc;
      });

      filter.connect(this.droneGain);
      this.droneGain.connect(this.masterGain);
    } catch {
      // Audio not supported or blocked; graceful degradation
      this.isPlaying = false;
    }
  }

  public stopAmbient() {
    if (!this.ctx || !this.droneGain || !this.isPlaying) return;
    try {
      const now = this.ctx.currentTime;
      this.droneGain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
      setTimeout(() => {
        this.oscillators.forEach(osc => {
          try { osc.stop(); osc.disconnect(); } catch { /* ignore */ }
        });
        if (this.lfo) {
          try { this.lfo.stop(); this.lfo.disconnect(); } catch { /* ignore */ }
        }
        this.oscillators = [];
        this.lfo = null;
        this.isPlaying = false;
      }, 1300);
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
      this.masterGain.gain.exponentialRampToValueAtTime(0.22, now + 0.3);
      this.isMuted = false;
    } else {
      this.masterGain.gain.setValueAtTime(0.22, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      this.isMuted = true;
    }
    return this.isMuted;
  }

  // Play a soft sacred bell chime when a diya is lit
  public playDiyaChime(diyaIndex: number) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      // Pentatonic notes in D: D5, E5, F#5, A5, B5, D6
      const scale = [587.33, 659.25, 739.99, 880.0, 987.77, 1174.66];
      const freq = scale[diyaIndex % scale.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Quick bell attack and long warm decay
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 2.5);
    } catch {
      // Ignore
    }
  }

  // Play gentle harp flourish for letter opening
  public playLetterOpenChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const notes = [293.66, 369.99, 440.0, 587.33, 739.99, 880.0];
      notes.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime + i * 0.09;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.18, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 1.9);
      });
    } catch {
      // Ignore
    }
  }

  // Play sparkling fireworks sound
  public playSparkleSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200 + Math.random() * 400, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.35);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.36);
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
