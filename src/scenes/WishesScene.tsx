import React from 'react';
import { RoyalDivider, MarigoldMotif } from '../components/RangoliPattern';
import { Sparkles, ChevronRight, Heart } from 'lucide-react';

interface WishesSceneProps {
  onNext: () => void;
}

const WISHES = [
  {
    id: 1,
    text: 'May your days be filled with happiness.',
    tag: 'Joy',
    icon: '✨',
  },
  {
    id: 2,
    text: 'May your dreams grow bigger and brighter.',
    tag: 'Aspirations',
    icon: '🌟',
  },
  {
    id: 3,
    text: 'May you always find reasons to smile.',
    tag: 'Smile',
    icon: '💫',
  },
  {
    id: 4,
    text: 'May peace find its way into your heart.',
    tag: 'Serenity',
    icon: '🕊️',
  },
  {
    id: 5,
    text: 'May beautiful things keep finding you.',
    tag: 'Wonder',
    icon: '🌸',
  },
];

export const WishesScene: React.FC<WishesSceneProps> = ({ onNext }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between px-4 py-8 relative overflow-hidden select-none">
      {/* Background Ambience - Lighter and Warmer than opening as requested */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(85, 24, 43, 0.45) 0%, rgba(185, 120, 131, 0.12) 40%, rgba(9, 8, 13, 0.98) 90%)',
        }}
      />

      {/* Decorative Golden Ambient Aura */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] rounded-full pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, #F3D99A 0%, #35101D 70%, transparent 100%)',
          filter: 'blur(70px)',
        }}
      />

      {/* Header */}
      <header className="relative z-20 text-center max-w-xl mx-auto pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-burgundy/50 border border-gold-subtle/40 mb-3 backdrop-blur-sm">
          <MarigoldMotif size={18} />
          <span className="font-royal text-xs tracking-widest uppercase text-gold-champagne">
            Five Blessings
          </span>
          <MarigoldMotif size={18} />
        </div>

        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light text-gold-light mb-2">
          Wishes for Bangarammm
        </h2>
        <p className="font-serif text-sm sm:text-base text-rose-muted/90 italic">
          Every thought whispered with genuine warmth and light.
        </p>

        <RoyalDivider className="my-4 max-w-xs opacity-60" />
      </header>

      {/* Staggered Wishes Stack */}
      <main className="relative z-20 w-full max-w-xl mx-auto my-auto py-4 flex flex-col gap-3.5">
        {WISHES.map((wish, index) => (
          <div
            key={wish.id}
            className="group relative rounded-2xl glass-card p-4 sm:p-5 border border-gold-champagne/30 hover:border-gold-warm transition-all duration-500 hover:shadow-[0_8px_25px_rgba(217,182,111,0.2)] hover:-translate-y-0.5"
            style={{
              animationDelay: `${index * 150}ms`,
            }}
          >
            <div className="flex items-center gap-4">
              {/* Diya / Star number icon */}
              <div className="w-10 h-10 rounded-full bg-burgundy border border-gold-champagne/50 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(217,182,111,0.2)] group-hover:scale-105 group-hover:border-gold-warm transition-transform">
                <span className="font-royal text-sm text-gold-champagne">0{wish.id}</span>
              </div>

              {/* Wish content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-royal text-[10px] tracking-widest uppercase text-gold-champagne/75">
                    {wish.tag}
                  </span>
                  <span className="text-xs text-rose-muted">✦</span>
                </div>
                <p className="font-serif text-base sm:text-lg md:text-xl text-ivory font-normal leading-snug group-hover:text-gold-light transition-colors">
                  &ldquo;{wish.text}&rdquo;
                </p>
              </div>

              {/* End Sparkle */}
              <div className="text-sm opacity-50 group-hover:opacity-100 transition-opacity">
                <Sparkles className="w-4 h-4 text-gold-warm" />
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Bottom CTA to Finale */}
      <footer className="relative z-20 pb-4 pt-2">
        <button
          onClick={onNext}
          className="group inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-royalwine via-burgundy to-royalwine border border-gold-champagne hover:border-gold-warm hover:shadow-[0_0_24px_rgba(243,217,154,0.4)] text-ivory transition-all font-serif text-base sm:text-lg active:scale-95"
        >
          <span>The Grand Finale</span>
          <ChevronRight className="w-4 h-4 text-gold-warm group-hover:translate-x-1 transition-transform" />
        </button>
      </footer>
    </div>
  );
};
