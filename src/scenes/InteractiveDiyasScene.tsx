import React from 'react';
import confetti from 'canvas-confetti';
import { RoyalDivider } from '../components/RangoliPattern';
import { soundscape } from '../utils/audio';
import { Sparkles, Heart, ChevronRight, Check } from 'lucide-react';
import { DiyaItem } from '../types';

export const DIYA_DATA: Omit<DiyaItem, 'isLit'>[] = [
  {
    id: 1,
    title: 'Happiness',
    keyword: 'Joy & Laughter',
    wish: 'May your smile never lose its magic.',
    color: '#F3D99A',
  },
  {
    id: 2,
    title: 'Peace',
    keyword: 'Serenity',
    wish: 'May your heart always find its beautiful moments of peace.',
    color: '#FFF5E6',
  },
  {
    id: 3,
    title: 'Success',
    keyword: 'Dreams & Courage',
    wish: 'May every dream you hold find its way into reality.',
    color: '#D9B66F',
  },
  {
    id: 4,
    title: 'Beautiful Memories',
    keyword: 'Treasured Moments',
    wish: 'May life surprise you with countless moments worth remembering.',
    color: '#B97883',
  },
  {
    id: 5,
    title: 'Endless Love',
    keyword: 'Warmth & Affection',
    wish: 'May you always be surrounded by warmth, kindness, and love.',
    color: '#FFDF95',
  },
];

interface InteractiveDiyasSceneProps {
  litDiyas: boolean[];
  activeWishIndex: number | null;
  onLightDiya: (index: number) => void;
  onNext: () => void;
}

export const InteractiveDiyasScene: React.FC<InteractiveDiyasSceneProps> = ({
  litDiyas,
  activeWishIndex,
  onLightDiya,
  onNext,
}) => {
  const litCount = litDiyas.filter(Boolean).length;
  const allLit = litCount === 5;

  const handleLightAll = () => {
    soundscape.playLetterOpenChime();
    [0, 1, 2, 3, 4].forEach((idx) => onLightDiya(idx));
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#D9B66F', '#F3D99A', '#FFF5E6', '#B97883', '#55182B'],
    });
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-between px-3 sm:px-6 py-4 sm:py-8 pb-24 sm:pb-12 relative overflow-y-auto select-none pointer-events-none">
      {/* Header section */}
      <header className="relative z-20 text-center max-w-lg mx-auto pt-1 sm:pt-2 pointer-events-auto">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-burgundy/60 border border-gold-subtle/40 mb-1.5 sm:mb-2 backdrop-blur-md">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-warm" />
          <span className="font-serif text-[10px] sm:text-sm tracking-wider uppercase text-gold-champagne">
            Palace Courtyard Sanctuary
          </span>
        </div>

        <h2 className="font-display text-xl sm:text-3xl md:text-4xl font-normal text-gold-light mb-1 drop-shadow-md">
          Kindle Each 3D Diya to Awaken a Wish
        </h2>
        <p className="font-serif text-[11px] sm:text-sm md:text-base text-ivory/80 max-w-sm mx-auto">
          Tap the glowing brass diyas in the courtyard or select below.
        </p>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mt-2 sm:mt-3 text-[11px] sm:text-xs font-serif text-gold-champagne/90">
          <span>{litCount} of 5 Diyas Kindled</span>
          <div className="flex gap-1.5 ml-1 sm:ml-2">
            {litDiyas.map((isLit, i) => (
              <span
                key={i}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-500 ${
                  isLit
                    ? 'bg-gold-warm shadow-[0_0_10px_#F3D99A]'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Interactive Arrangement: 5 Wish Pills */}
      <main className="relative z-20 w-full max-w-3xl mx-auto my-auto py-2 sm:py-4 flex flex-col items-center pointer-events-auto">
        {/* Responsive Quick Kindling Bar */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 w-full px-1 py-1 sm:py-2">
          {DIYA_DATA.map((diya, index) => {
            const isLit = litDiyas[index];
            const isSelected = activeWishIndex === index;
            return (
              <button
                key={diya.id}
                onClick={() => onLightDiya(index)}
                className={`group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border transition-all duration-300 backdrop-blur-md active:scale-95 ${
                  isSelected
                    ? 'bg-royalwine/80 border-gold-warm text-gold-bright shadow-[0_0_20px_rgba(243,217,154,0.35)]'
                    : isLit
                    ? 'bg-burgundy/60 border-gold-champagne/40 text-ivory'
                    : 'bg-midnight/70 border-white/20 text-ivory/60 hover:border-gold-champagne/60 hover:text-ivory'
                }`}
              >
                <span className="text-xs sm:text-sm">{isLit ? '🔥' : '🪔'}</span>
                <span className="font-serif text-[11px] sm:text-sm tracking-wide">
                  {diya.title}
                </span>
                {isLit && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gold-warm ml-0.5" />}
              </button>
            );
          })}
        </div>

        {/* Dynamic Wish Reveal Card */}
        <div className="mt-3 sm:mt-4 w-full max-w-lg px-2 sm:px-4 min-h-[110px] sm:min-h-[140px] flex items-center justify-center">
          {activeWishIndex !== null ? (
            <div className="glass-card rounded-2xl p-4 sm:p-6 w-full text-center relative border border-gold-champagne/50 shadow-[0_12px_40px_rgba(0,0,0,0.7)] animate-fade-in">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-burgundy/90 text-[9px] sm:text-[11px] font-royal tracking-widest text-gold-champagne uppercase mb-1.5">
                Wish #{activeWishIndex + 1}: {DIYA_DATA[activeWishIndex].title}
              </div>
              <p className="font-serif text-base sm:text-xl md:text-2xl text-gold-light italic leading-relaxed">
                &ldquo;{DIYA_DATA[activeWishIndex].wish}&rdquo;
              </p>
            </div>
          ) : (
            <div className="text-center text-ivory/60 font-serif italic text-[11px] sm:text-sm bg-midnight/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10 backdrop-blur-sm">
              Tap any 3D diya in the courtyard to awaken its blessing ✨
            </div>
          )}
        </div>

        {/* Special Celebration Banner once all 5 are lit */}
        {allLit && (
          <div className="mt-3 sm:mt-4 w-full max-w-lg px-2 sm:px-4 text-center animate-fade-in">
            <div className="glass-burgundy rounded-2xl p-3.5 sm:p-5 border-gold-glow">
              <p className="font-serif text-base sm:text-2xl text-gold-warm font-normal flex items-center justify-center gap-1.5">
                Look at that... you just made this little world brighter.
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-petal fill-rose-petal inline animate-pulse" />
              </p>
              <RoyalDivider className="my-2 opacity-60" />
              <button
                onClick={onNext}
                className="mt-1 group inline-flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-royalwine to-burgundy border border-gold-warm text-ivory font-serif text-xs sm:text-base tracking-wide hover:shadow-[0_0_24px_rgba(243,217,154,0.45)] transition-all duration-300 active:scale-95"
              >
                <span>Enter the Royal Pavilion Letter</span>
                <ChevronRight className="w-3.5 h-3.5 text-gold-warm group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Navigation skip helper */}
      <footer className="relative z-20 pb-2 pointer-events-auto">
        {!allLit && (
          <button
            onClick={handleLightAll}
            className="text-[11px] sm:text-xs font-serif text-ivory/50 hover:text-gold-champagne transition-colors underline underline-offset-4"
          >
            Kindle all 5 palace diyas at once ✦
          </button>
        )}
      </footer>
    </div>
  );
};
