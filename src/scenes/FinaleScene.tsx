import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { DiyaGraphic } from '../components/DiyaGraphic';
import { FireworksCanvas } from '../components/FireworksCanvas';
import { RoyalDivider, RangoliMandala, MarigoldMotif } from '../components/RangoliPattern';
import { soundscape } from '../utils/audio';
import { RotateCcw, Heart } from 'lucide-react';

interface FinaleSceneProps {
  onReplay: () => void;
}

export const FinaleScene: React.FC<FinaleSceneProps> = ({ onReplay }) => {
  useEffect(() => {
    soundscape.playSparkleSound();
    confetti({
      particleCount: 110,
      spread: 95,
      origin: { y: 0.5 },
      colors: ['#D9B66F', '#F3D99A', '#FFF5E6', '#B97883', '#55182B'],
    });
  }, []);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-between px-3 sm:px-6 py-6 sm:py-8 pb-24 sm:pb-12 relative overflow-y-auto select-none">
      {/* Dynamic Weeping Golden Fireworks */}
      <FireworksCanvas active={true} intensity="celebration" />

      {/* Atmospheric Night Sky Backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 38%, rgba(85, 24, 43, 0.6) 0%, rgba(53, 16, 29, 0.85) 50%, #09080D 95%)',
        }}
      />

      {/* Rotating Background Sacred Rangoli */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <RangoliMandala size={480} opacity={0.12} className="animate-[spin_210s_linear_infinite]" />
      </div>

      {/* Header Festoon */}
      <header className="relative z-20 flex items-center justify-center gap-2 sm:gap-3 pt-1 sm:pt-2">
        <MarigoldMotif size={20} />
        <span className="font-royal text-[10px] sm:text-sm tracking-[0.2em] sm:tracking-[0.25em] uppercase text-gold-champagne/90">
          Festival of Lights
        </span>
        <MarigoldMotif size={20} />
      </header>

      {/* Main Composition */}
      <main className="relative z-20 flex flex-col items-center text-center max-w-2xl mx-auto my-auto py-2 sm:py-4 px-2">
        {/* Responsive Trio of Celebratory Glowing Diyas */}
        <div className="flex items-center justify-center gap-2 sm:gap-8 mb-3 sm:mb-5">
          <div className="hidden sm:block">
            <DiyaGraphic isLit={true} size="sm" showGlowSpread={true} className="animate-float-slow" />
          </div>
          <DiyaGraphic isLit={true} size="md" showGlowSpread={true} className="-translate-y-1 sm:-translate-y-2 scale-90 sm:scale-100" />
          <div className="hidden sm:block">
            <DiyaGraphic isLit={true} size="sm" showGlowSpread={true} className="animate-float-slow" />
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gold-gradient drop-shadow-[0_4px_30px_rgba(217,182,111,0.5)] mb-1 sm:mb-2 break-words">
          Happy Diwali, Bangarammm
        </h1>

        {/* Supporting Message */}
        <p className="font-serif text-base sm:text-2xl md:text-3xl text-gold-warm font-light italic tracking-wide mb-2 sm:mb-3">
          Keep shining. Keep smiling. Keep being you.
        </p>

        <RoyalDivider className="my-3 sm:my-4 max-w-sm" />

        {/* Final Line */}
        <div className="space-y-1 max-w-md mx-auto px-2 mb-3 sm:mb-5">
          <p className="font-serif text-sm sm:text-lg text-ivory/85 font-light">
            Some celebrations last a night.
          </p>
          <p className="font-serif text-base sm:text-xl text-rose-petal font-medium italic">
            Some beautiful feelings stay forever.
          </p>
        </div>

        {/* Delicate Golden Heart Jewel Motif */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 text-gold-champagne my-1 sm:my-2" aria-hidden="true">
          <span className="text-[10px] sm:text-xs">✦</span>
          <div className="p-2 sm:p-2.5 rounded-full bg-burgundy/80 border border-gold-champagne/60 shadow-[0_0_16px_rgba(217,182,111,0.35)]">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gold-warm fill-gold-warm/80 animate-pulse" />
          </div>
          <span className="text-[10px] sm:text-xs">✦</span>
        </div>
      </main>

      {/* Footer Replay Button */}
      <footer className="relative z-20 pb-2 sm:pb-4">
        <button
          onClick={onReplay}
          className="group inline-flex items-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-full glass-burgundy border border-gold-champagne/60 hover:border-gold-warm hover:shadow-[0_0_24px_rgba(243,217,154,0.4)] text-ivory transition-all duration-300 font-serif text-sm sm:text-base active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-champagne group-hover:-rotate-90 transition-transform duration-500" />
          <span className="tracking-wide text-gold-light group-hover:text-gold-bright">
            Experience the magic again ↗
          </span>
        </button>
      </footer>
    </div>
  );
};
