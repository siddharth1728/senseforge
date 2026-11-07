import React from 'react';
import { RoyalDivider, MarigoldMotif } from '../components/RangoliPattern';
import { Sparkles, ChevronRight } from 'lucide-react';

interface WishesSceneProps {
  onNext: () => void;
}

const WISHES = [
  'May your days be filled with happiness.',
  'May your dreams grow bigger and brighter.',
  'May you always find reasons to smile.',
  'May peace find its way into your heart.',
  'May beautiful things keep finding you.',
];

export const WishesScene: React.FC<WishesSceneProps> = ({ onNext }) => {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-between px-3 sm:px-6 py-6 sm:py-8 pb-24 sm:pb-12 relative overflow-y-auto select-none">
      {/* Background Ambience - Lighter and Warmer than opening as requested */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 28%, rgba(85, 24, 43, 0.45) 0%, rgba(185, 120, 131, 0.12) 42%, rgba(9, 8, 13, 0.98) 90%)',
        }}
      />

      {/* Decorative Golden Ambient Aura */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] rounded-full pointer-events-none opacity-25"
        style={{
          background: 'radial-gradient(circle, #F3D99A 0%, #35101D 70%, transparent 100%)',
          filter: 'blur(75px)',
        }}
      />

      {/* Header */}
      <header className="relative z-20 text-center max-w-xl mx-auto pt-1 sm:pt-2">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-burgundy/50 border border-gold-subtle/40 mb-1.5 sm:mb-2.5 backdrop-blur-sm">
          <MarigoldMotif size={16} />
          <span className="font-royal text-[10px] sm:text-xs tracking-widest uppercase text-gold-champagne">
            Five Blessings
          </span>
          <MarigoldMotif size={16} />
        </div>

        <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-light text-gold-light mb-1 sm:mb-2 drop-shadow-md">
          Wishes for Bangarammm
        </h2>
        <p className="font-serif text-xs sm:text-base text-rose-muted/95 italic">
          Every thought whispered with genuine warmth and light.
        </p>

        <RoyalDivider className="my-3 sm:my-4 max-w-xs opacity-60" />
      </header>

      {/* Staggered Floating Blessing Plaques */}
      <main className="relative z-20 w-full max-w-lg mx-auto my-auto py-2 flex flex-col gap-2.5 sm:gap-3.5 px-1">
        {WISHES.map((wishText, index) => (
          <div
            key={index}
            className="group relative rounded-2xl glass-card p-3 sm:p-5 border border-gold-champagne/35 hover:border-gold-warm transition-all duration-500 hover:shadow-[0_8px_25px_rgba(217,182,111,0.22)] hover:-translate-y-0.5"
            style={{
              animationDelay: `${index * 140}ms`,
            }}
          >
            <div className="flex items-center gap-2.5 sm:gap-4">
              {/* Sacred Diya / Lotus Emblem */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-burgundy/90 border border-gold-champagne/50 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(217,182,111,0.2)] group-hover:scale-105 group-hover:border-gold-warm transition-transform">
                <span className="text-xs sm:text-sm">🪔</span>
              </div>

              {/* Wish Statement */}
              <div className="flex-1">
                <p className="font-serif text-sm sm:text-lg md:text-xl text-ivory font-normal leading-snug group-hover:text-gold-light transition-colors">
                  &ldquo;{wishText}&rdquo;
                </p>
              </div>

              {/* End Sparkle */}
              <div className="text-xs sm:text-sm opacity-40 group-hover:opacity-100 transition-opacity">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-warm" />
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Bottom CTA to Finale */}
      <footer className="relative z-20 pb-2 sm:pb-4 pt-1 sm:pt-2">
        <button
          onClick={onNext}
          className="group inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-royalwine via-burgundy to-royalwine border border-gold-champagne hover:border-gold-warm hover:shadow-[0_0_24px_rgba(243,217,154,0.4)] text-ivory transition-all font-serif text-sm sm:text-lg active:scale-95"
        >
          <span>The Grand Finale</span>
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-warm group-hover:translate-x-1 transition-transform" />
        </button>
      </footer>
    </div>
  );
};
