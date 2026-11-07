import React from 'react';
import { DiyaGraphic } from '../components/DiyaGraphic';
import { RangoliMandala, MarigoldMotif, RoyalDivider } from '../components/RangoliPattern';
import { ChevronRight, Sparkles } from 'lucide-react';

interface DiwaliRevealSceneProps {
  onNext: () => void;
}

export const DiwaliRevealScene: React.FC<DiwaliRevealSceneProps> = ({ onNext }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between px-4 py-10 relative overflow-hidden select-none">
      {/* Background Atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 38%, rgba(85, 24, 43, 0.55) 0%, rgba(53, 16, 29, 0.8) 45%, #09080D 95%)',
        }}
      />

      {/* Decorative Rangoli Mandalas in Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <RangoliMandala size={520} opacity={0.16} className="animate-[spin_160s_linear_infinite]" />
      </div>

      {/* Top Garland / Marigold Festoon Header */}
      <header className="relative z-20 flex items-center justify-center gap-3 sm:gap-6 pt-2 pb-4 opacity-90 animate-fade-in">
        <MarigoldMotif size={28} className="animate-spin-slow" />
        <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-r from-transparent via-[#D9B66F]/60 to-transparent" />
        <span className="font-royal text-xs sm:text-sm tracking-[0.25em] uppercase text-gold-champagne/90">
          Shubh Deepavali
        </span>
        <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-r from-transparent via-[#D9B66F]/60 to-transparent" />
        <MarigoldMotif size={28} className="animate-spin-slow" />
      </header>

      {/* Central Festive Reveal Composition */}
      <main className="relative z-20 flex flex-col items-center text-center max-w-2xl mx-auto my-auto py-6">
        {/* Subtle sparkle badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-burgundy/60 border border-gold-subtle/40 mb-6 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-gold-warm" />
          <span className="font-serif text-sm tracking-widest text-gold-champagne uppercase">
            A Diwali Made of Light
          </span>
          <Sparkles className="w-3.5 h-3.5 text-gold-warm" />
        </div>

        {/* Happy Diwali Headline */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-wide text-ivory/90 mb-2 drop-shadow-md">
          Happy Diwali
        </h1>

        {/* Recipient's Nickname - THE VISUAL FOCAL POINT */}
        <div className="my-2 sm:my-4 relative">
          {/* Subtle soft backdrop glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-gold-champagne/20 via-rose-muted/20 to-gold-champagne/20 rounded-full blur-2xl opacity-60 pointer-events-none" />
          
          <h2 className="relative font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gold-gradient drop-shadow-[0_4px_24px_rgba(217,182,111,0.45)]">
            Bangarammm <span className="text-rose-petal inline-block animate-pulse">❤️</span>
          </h2>
        </div>

        <RoyalDivider className="my-6 max-w-xs" />

        {/* Supporting Line */}
        <p className="font-serif text-lg sm:text-2xl md:text-2xl font-light italic text-gold-warm/95 max-w-lg leading-relaxed px-4">
          &ldquo;May your world always shine brighter than a thousand diyas.&rdquo;
        </p>

        {/* Flanking Pair of Glowing Diyas */}
        <div className="flex items-center justify-center gap-6 sm:gap-16 mt-8 sm:mt-10">
          <DiyaGraphic isLit={true} size="md" showGlowSpread={true} />
          <DiyaGraphic isLit={true} size="lg" showGlowSpread={true} className="-translate-y-2" />
          <DiyaGraphic isLit={true} size="md" showGlowSpread={true} />
        </div>
      </main>

      {/* Bottom CTA to Continue to Interactive Diyas */}
      <footer className="relative z-20 pb-4 flex flex-col items-center">
        <button
          onClick={onNext}
          className="group flex items-center gap-2 px-6 py-3 rounded-full glass-burgundy border border-gold-champagne/40 hover:border-gold-warm hover:shadow-[0_0_20px_rgba(217,182,111,0.35)] transition-all duration-300 text-ivory active:scale-95"
        >
          <span className="font-serif text-base sm:text-lg tracking-wider text-gold-warm font-medium">
            Light the 5 Special Diyas
          </span>
          <ChevronRight className="w-4 h-4 text-gold-champagne transition-transform group-hover:translate-x-1" />
        </button>
      </footer>
    </div>
  );
};
