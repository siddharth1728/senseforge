import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { DiyaGraphic } from '../components/DiyaGraphic';
import { FireworksCanvas } from '../components/FireworksCanvas';
import { RoyalDivider, RangoliMandala, MarigoldMotif } from '../components/RangoliPattern';
import { soundscape } from '../utils/audio';
import { RotateCcw, Heart, Sparkles } from 'lucide-react';

interface FinaleSceneProps {
  onReplay: () => void;
}

export const FinaleScene: React.FC<FinaleSceneProps> = ({ onReplay }) => {
  useEffect(() => {
    // Joyful celebration burst on scene enter
    soundscape.playSparkleSound();
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#D9B66F', '#F3D99A', '#FFF5E6', '#B97883', '#55182B'],
    });
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between px-4 py-8 relative overflow-hidden select-none">
      {/* Dynamic Fireworks Canvas */}
      <FireworksCanvas active={true} intensity="celebration" />

      {/* Atmospheric Night Sky Backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(85, 24, 43, 0.6) 0%, rgba(53, 16, 29, 0.85) 50%, #09080D 95%)',
        }}
      />

      {/* Rotating Background Sacred Rangoli */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <RangoliMandala size={600} opacity={0.12} className="animate-[spin_200s_linear_infinite]" />
      </div>

      {/* Header Festoon */}
      <header className="relative z-20 flex items-center justify-center gap-3 pt-2">
        <MarigoldMotif size={24} />
        <span className="font-royal text-xs sm:text-sm tracking-[0.25em] uppercase text-gold-champagne/90">
          Festival of Lights
        </span>
        <MarigoldMotif size={24} />
      </header>

      {/* Main Composition */}
      <main className="relative z-20 flex flex-col items-center text-center max-w-2xl mx-auto my-auto py-6">
        {/* Trio of Celebratory Glowing Diyas */}
        <div className="flex items-center justify-center gap-4 sm:gap-10 mb-6">
          <DiyaGraphic isLit={true} size="md" showGlowSpread={true} className="animate-float-slow" />
          <DiyaGraphic isLit={true} size="hero" showGlowSpread={true} className="-translate-y-3" />
          <DiyaGraphic isLit={true} size="md" showGlowSpread={true} className="animate-float-slow" />
        </div>

        {/* Main Headline */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gold-gradient drop-shadow-[0_4px_30px_rgba(217,182,111,0.5)] mb-3">
          Happy Diwali, Bangarammm
        </h1>

        {/* Supporting Message */}
        <p className="font-serif text-xl sm:text-2xl md:text-3xl text-gold-warm font-light italic tracking-wide mb-4">
          Keep shining. Keep smiling. Keep being you.
        </p>

        <RoyalDivider className="my-5 max-w-sm" />

        {/* Final Line */}
        <div className="space-y-1.5 max-w-md mx-auto px-4 mb-6">
          <p className="font-serif text-base sm:text-lg text-ivory/80 font-light">
            Some celebrations last a night.
          </p>
          <p className="font-serif text-lg sm:text-xl text-rose-petal font-medium italic">
            Some beautiful feelings stay forever.
          </p>
        </div>

        {/* Delicate Golden Heart & Diya Motif */}
        <div className="flex items-center justify-center gap-3 text-gold-champagne my-2" aria-hidden="true">
          <span className="text-sm">✦</span>
          <div className="p-2.5 rounded-full bg-burgundy/80 border border-gold-champagne/50 shadow-[0_0_15px_rgba(217,182,111,0.3)]">
            <Heart className="w-5 h-5 text-gold-warm fill-gold-warm/80 animate-pulse" />
          </div>
          <span className="text-sm">✦</span>
        </div>
      </main>

      {/* Footer Replay Button */}
      <footer className="relative z-20 pb-4">
        <button
          onClick={onReplay}
          className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full glass-burgundy border border-gold-champagne/60 hover:border-gold-warm hover:shadow-[0_0_24px_rgba(243,217,154,0.4)] text-ivory transition-all duration-300 font-serif text-base active:scale-95"
        >
          <RotateCcw className="w-4 h-4 text-gold-champagne group-hover:-rotate-90 transition-transform duration-500" />
          <span className="tracking-wide text-gold-light group-hover:text-gold-bright">
            Experience the magic again ↗
          </span>
        </button>
      </footer>
    </div>
  );
};
