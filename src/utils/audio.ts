/**
 * Web Audio synthesizer for playful sound effects (Meows, Chimes, Clicks)
 */

class SoundEffects {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playMeow(variant: number = 0) {
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Frequency contours for playful meows
    const pitches = [
      { start: 500, mid: 880, end: 400, dur: 0.65 },
      { start: 600, mid: 1050, end: 500, dur: 0.8 },
      { start: 350, mid: 700, end: 300, dur: 0.9 }, // deep dramatic
      { start: 700, mid: 1200, end: 600, dur: 0.5 }, // kitten squeak
    ];

    const p = pitches[variant % pitches.length];

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(p.start, now);
    osc.frequency.exponentialRampToValueAtTime(p.mid, now + p.dur * 0.4);
    osc.frequency.exponentialRampToValueAtTime(p.end, now + p.dur);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + p.dur);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + p.dur);
  }

  playChime() {
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chord

    freqs.forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.05);

      gain.gain.setValueAtTime(0.001, now + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.05 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.8);
    });
  }

  playClick() {
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }
}

export const sfx = new SoundEffects();
