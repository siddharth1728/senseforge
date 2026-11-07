import React from 'react';
import { DiyaGraphic } from '../components/DiyaGraphic';
import { RangoliMandala, MarigoldMotif, RoyalDivider } from '../components/RangoliPattern';
import { ChevronRight, Sparkles } from 'lucide-react';

interface DiwaliRevealSceneProps {
  onNext: () => void;
}

export const DiwaliRevealScene: React.FC<DiwaliRevealSceneProps> = ({ onNext }) => {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-between px-3 sm:px-6 py-6 sm:py-10 pb-24 sm:pb-12 relative overflow-hidden select-none">
      {/* Background Atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 36%, rgba(85, 24, 43, 0.55) 0%, rgba(53, 16, 29, 0.8) 48%, #09080D 95%)',
        }}
      />

      {/* Rotating Background Sacred Rangoli */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <RangoliMandala size={480} opacity={0.14} className="animate-[spin_180s_linear_infinite]" />
      </div>

      {/* Traditional Marigold Toran Header */}
      <header className="relative z-20 flex items-center justify-center gap-2 sm:gap-6 pt-1 sm:pt-2 pb-1 opacity-95">
        <MarigoldMotif size={22} />
        <div className="h-[1px] w-8 sm:w-24 bg-gradient-to-r from-transparent via-[#D9B66F]/60 to-transparent" />
        <span className="font-royal text-[10px] sm:text-sm tracking-[0.22em] sm:tracking-[0.28em] uppercase text-gold-champagne/90">
          Shubh Deepavali
        </span>
        <div className="h-[1px] w-8 sm:w-24 bg-gradient-to-r from-transparent via-[#D9B66F]/60 to-transparent" />
        <MarigoldMotif size={22} />
      </header>

      {/* Central Festive Reveal Composition */}
      <main className="relative z-20 flex flex-col items-center text-center max-w-2xl mx-auto my-auto py-2 sm:py-4 px-2">
        {/* Subtle pill badge */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 rounded-full bg-burgundy/60 border border-gold-subtle/50 mb-3 sm:mb-5 backdrop-blur-md shadow-sm">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-warm" />
          <span className="font-serif text-[11px] sm:text-sm tracking-widest text-gold-champagne uppercase">
            A Diwali Made of Light
          </span>
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-warm" />
        </div>

        {/* Happy Diwali Headline */}
        <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-light tracking-wide text-ivory/90 mb-1 drop-shadow-md">
          Happy Diwali
        </h1>

        {/* Recipient's Nickname - Responsive and Never Cut Off */}
        <div className="my-1 sm:my-3 relative w-full">
          {/* Subtle soft backdrop glow */}
          <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-r from-gold-champagne/25 via-rose-muted/20 to-gold-champagne/25 rounded-full blur-2xl opacity-70 pointer-events-none" />

          <h2 className="relative font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gold-gradient drop-shadow-[0_4px_28px_rgba(217,182,111,0.5)] break-words">
            Bangarammm <span className="text-rose-petal inline-block animate-pulse">❤️</span>
          </h2>
        </div>

        <RoyalDivider className="my-3 sm:my-5 max-w-xs" />

        {/* Supporting Line */}
        <p className="font-serif text-base sm:text-xl md:text-2xl font-light italic text-gold-warm/95 max-w-lg leading-relaxed px-2">
          &ldquo;May your world always shine brighter than a thousand diyas.&rdquo;
        </p>

        {/* Responsive Diya Arrangement: Single on mobile, Trio on tablet/desktop */}
        <div className="flex items-center justify-center gap-3 sm:gap-8 mt-5 sm:mt-8">
          <div className="hidden sm:block">
            <DiyaGraphic isLit={true} size="sm" showGlowSpread={true} className="translate-y-1" />
          </div>
          <DiyaGraphic isLit={true} size="md" showGlowSpread={true} className="-translate-y-1 sm:-translate-y-2 scale-90 sm:scale-100" />
          <div className="hidden sm:block">
            <DiyaGraphic isLit={true} size="sm" showGlowSpread={true} className="translate-y-1" />
          </div>
        </div>
      </main>

      {/* Bottom CTA to Interactive Diyas */}
      <footer className="relative z-20 pb-2 sm:pb-4 flex flex-col items-center">
        <button
          onClick={onNext}
          className="group flex items-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-full glass-burgundy border border-gold-champagne/50 hover:border-gold-warm hover:shadow-[0_0_24px_rgba(217,182,111,0.4)] transition-all duration-300 text-ivory active:scale-95"
        >
          <span className="font-serif text-sm sm:text-lg tracking-wider text-gold-warm font-medium">
            Kindle the 5 Sacred Diyas
          </span>
          <ChevronRight className="w-4 h-4 text-gold-champagne transition-transform group-hover:translate-x-1" />
        </button>
      </footer>
    </div>
  );
};
