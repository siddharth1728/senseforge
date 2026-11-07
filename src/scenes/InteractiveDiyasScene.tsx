import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { DiyaGraphic } from '../components/DiyaGraphic';
import { RoyalDivider } from '../components/RangoliPattern';
import { soundscape } from '../utils/audio';
import { Sparkles, Heart, ChevronRight, Check } from 'lucide-react';
import { DiyaItem } from '../types';

interface InteractiveDiyasSceneProps {
  onNext: () => void;
}

const INITIAL_DIYAS: DiyaItem[] = [
  {
    id: 1,
    title: 'Happiness',
    keyword: 'Joy & Laughter',
    wish: 'May your smile never lose its magic.',
    isLit: false,
    color: '#F3D99A',
  },
  {
    id: 2,
    title: 'Peace',
    keyword: 'Serenity',
    wish: 'May your heart always find its beautiful moments of peace.',
    isLit: false,
    color: '#FFF5E6',
  },
  {
    id: 3,
    title: 'Success',
    keyword: 'Dreams & Courage',
    wish: 'May every dream you hold find its way into reality.',
    isLit: false,
    color: '#D9B66F',
  },
  {
    id: 4,
    title: 'Beautiful Memories',
    keyword: 'Treasured Moments',
    wish: 'May life surprise you with countless moments worth remembering.',
    isLit: false,
    color: '#B97883',
  },
  {
    id: 5,
    title: 'Endless Love',
    keyword: 'Warmth & Affection',
    wish: 'May you always be surrounded by warmth, kindness, and love.',
    isLit: false,
    color: '#FFDF95',
  },
];

export const InteractiveDiyasScene: React.FC<InteractiveDiyasSceneProps> = ({ onNext }) => {
  const [diyas, setDiyas] = useState<DiyaItem[]>(INITIAL_DIYAS);
  const [activeWishIndex, setActiveWishIndex] = useState<number | null>(null);

  const litCount = diyas.filter((d) => d.isLit).length;
  const allLit = litCount === 5;

  const handleLightDiya = (index: number) => {
    soundscape.playDiyaChime(index);

    const isFirstTimeLighting = !diyas[index].isLit;

    setDiyas((prev) =>
      prev.map((d, i) => (i === index ? { ...d, isLit: true } : d))
    );
    setActiveWishIndex(index);

    // If this was the 5th diya being lit
    if (isFirstTimeLighting && litCount === 4) {
      setTimeout(() => {
        triggerCelebration();
      }, 500);
    }
  };

  const triggerCelebration = () => {
    soundscape.playLetterOpenChime();
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#D9B66F', '#F3D99A', '#FFF5E6', '#B97883', '#55182B'],
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between px-3 sm:px-6 py-6 sm:py-8 relative overflow-hidden select-none">
      {/* Dynamic Ambient Radial Lighting */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: allLit
            ? 'radial-gradient(circle at 50% 45%, rgba(85, 24, 43, 0.65) 0%, rgba(53, 16, 29, 0.85) 50%, #09080D 100%)'
            : 'radial-gradient(circle at 50% 45%, rgba(53, 16, 29, 0.5) 0%, rgba(9, 8, 13, 0.95) 75%, #09080D 100%)',
        }}
      />

      {/* Header section */}
      <header className="relative z-20 text-center max-w-lg mx-auto pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-burgundy/50 border border-gold-subtle/30 mb-2.5 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-gold-warm" />
          <span className="font-serif text-xs sm:text-sm tracking-wider uppercase text-gold-champagne">
            A Diwali Ritual for Bangarammm
          </span>
        </div>

        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-normal text-gold-light mb-1.5">
          Kindle Each Diya to Awaken a Wish
        </h2>
        <p className="font-serif text-xs sm:text-sm md:text-base text-ivory/70 max-w-sm mx-auto">
          Five sacred lights, each holding an intimate blessing for you.
        </p>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mt-3 text-xs font-serif text-gold-champagne/80">
          <span>{litCount} of 5 Diyas Kindled</span>
          <div className="flex gap-1.5 ml-2">
            {diyas.map((d, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  d.isLit
                    ? 'bg-gold-warm shadow-[0_0_8px_#F3D99A]'
                    : 'bg-white/15'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Interactive Arrangement: The 5 Diyas */}
      <main className="relative z-20 w-full max-w-4xl mx-auto my-auto py-4 flex flex-col items-center">
        {/* Diyas Arc - Perfectly responsive: single row with flex-wrap:nowrap and overflow-x-auto on small devices */}
        <div className="flex items-end justify-center gap-2 sm:gap-6 w-full max-w-3xl px-2 py-2">
          {diyas.map((diya, index) => {
            const isSelected = activeWishIndex === index;
            return (
              <div
                key={diya.id}
                className={`flex flex-col items-center transition-all duration-500 ${
                  index === 0 || index === 4
                    ? 'translate-y-2 sm:translate-y-3'
                    : index === 1 || index === 3
                    ? 'translate-y-1 sm:translate-y-1'
                    : '-translate-y-1 sm:-translate-y-2'
                }`}
              >
                <div
                  className={`p-1.5 sm:p-2.5 rounded-2xl transition-all duration-500 ${
                    isSelected
                      ? 'bg-royalwine/40 ring-1 ring-gold-champagne/70 shadow-[0_0_24px_rgba(243,217,154,0.3)]'
                      : ''
                  }`}
                >
                  <DiyaGraphic
                    isLit={diya.isLit}
                    size="sm"
                    label={diya.title}
                    onClick={() => handleLightDiya(index)}
                    showGlowSpread={true}
                  />
                </div>

                {/* Status indicator */}
                <div className="mt-1 flex items-center gap-1 text-[10px] sm:text-[11px] font-sans">
                  {diya.isLit ? (
                    <span className="text-gold-champagne inline-flex items-center gap-0.5 font-medium">
                      <Check className="w-2.5 h-2.5 text-gold-warm" /> Kindled
                    </span>
                  ) : (
                    <span className="text-ivory/40 animate-pulse text-[9px] sm:text-[10px]">
                      Tap to light
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Wish Reveal Card */}
        <div className="mt-6 w-full max-w-lg px-4 min-h-[140px] flex items-center justify-center">
          {activeWishIndex !== null ? (
            <div className="glass-card rounded-2xl p-5 sm:p-6 w-full text-center relative border border-gold-champagne/40 shadow-[0_8px_32px_rgba(0,0,0,0.65)] animate-fade-in">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-burgundy/80 text-[10px] sm:text-[11px] font-royal tracking-widest text-gold-champagne uppercase mb-2">
                Wish #{activeWishIndex + 1}: {diyas[activeWishIndex].title}
              </div>
              <p className="font-serif text-lg sm:text-xl md:text-2xl text-gold-light italic leading-relaxed">
                &ldquo;{diyas[activeWishIndex].wish}&rdquo;
              </p>
            </div>
          ) : (
            <div className="text-center text-ivory/50 font-serif italic text-xs sm:text-sm">
              Tap any diya above to reveal its blessing for you ✨
            </div>
          )}
        </div>

        {/* Special Celebration Banner once all 5 are lit */}
        {allLit && (
          <div className="mt-4 w-full max-w-lg px-4 text-center animate-fade-in">
            <div className="glass-burgundy rounded-2xl p-4 sm:p-5 border-gold-glow">
              <p className="font-serif text-lg sm:text-2xl text-gold-warm font-normal flex items-center justify-center gap-2">
                Look at that... you just made this little world brighter.
                <Heart className="w-5 h-5 text-rose-petal fill-rose-petal inline animate-pulse" />
              </p>
              <RoyalDivider className="my-2.5 opacity-60" />
              <button
                onClick={onNext}
                className="mt-1 group inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-royalwine to-burgundy border border-gold-warm text-ivory font-serif text-sm sm:text-base tracking-wide hover:shadow-[0_0_22px_rgba(243,217,154,0.45)] transition-all duration-300 active:scale-95"
              >
                <span>Read your letter for Bangarammm</span>
                <ChevronRight className="w-4 h-4 text-gold-warm group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Navigation skip/continue helper */}
      <footer className="relative z-20 pb-2">
        {!allLit && (
          <button
            onClick={() => {
              setDiyas((prev) => prev.map((d) => ({ ...d, isLit: true })));
              triggerCelebration();
            }}
            className="text-xs font-serif text-ivory/40 hover:text-gold-champagne transition-colors underline underline-offset-4"
          >
            Light all 5 diyas at once ✦
          </button>
        )}
      </footer>
    </div>
  );
};
