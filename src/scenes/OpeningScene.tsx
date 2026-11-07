import React, { useState, useEffect } from 'react';
import { DiyaGraphic } from '../components/DiyaGraphic';
import { RoyalDivider } from '../components/RangoliPattern';
import { soundscape } from '../utils/audio';
import { Sparkles } from 'lucide-react';

interface OpeningSceneProps {
  onProceed: () => void;
}

export const OpeningScene: React.FC<OpeningSceneProps> = ({ onProceed }) => {
  const [isLit, setIsLit] = useState(false);
  const [step, setStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Auto-awaken diya or allow tap
  useEffect(() => {
    const lightTimer = setTimeout(() => {
      handleIgnite();
    }, 1200);

    return () => clearTimeout(lightTimer);
  }, []);

  const handleIgnite = () => {
    if (isLit) return;
    setIsLit(true);
    soundscape.playDiyaChime(0);

    // Staggered reveals
    setTimeout(() => setStep(1), 600);   // Line 1
    setTimeout(() => setStep(2), 2400);  // Line 2
    setTimeout(() => setStep(3), 4200);  // Divider & Line 3
    setTimeout(() => setStep(4), 5400);  // Premium CTA Button
  };

  const handleOpenSurprise = () => {
    soundscape.playLetterOpenChime();
    setIsExiting(true);
    setTimeout(() => {
      onProceed();
    }, 900);
  };

  return (
    <div
      className={`min-h-[100dvh] w-full flex flex-col items-center justify-between sm:justify-center px-4 py-8 sm:py-10 pb-24 sm:pb-10 relative overflow-hidden select-none transition-all duration-1000 ${
        isExiting ? 'scale-105 opacity-0 blur-md' : 'opacity-100 scale-100'
      }`}
    >
      {/* Cinematic Deep Midnight Background with Expanding Radial Warmth */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: isLit
            ? 'radial-gradient(circle at 50% 46%, rgba(53, 16, 29, 0.55) 0%, rgba(9, 8, 13, 0.98) 70%, #09080D 100%)'
            : 'radial-gradient(circle at 50% 46%, rgba(20, 7, 12, 0.6) 0%, #09080D 85%)',
        }}
      />

      <div className="hidden sm:block" />

      {/* Main Composition */}
      <div className="relative z-20 flex flex-col items-center max-w-xl mx-auto text-center px-2 my-auto">
        {/* Centerpiece Diya with Responsive Mobile Scaling */}
        <div className="relative mb-4 sm:mb-8 transform transition-all duration-1000 ease-out scale-90 sm:scale-100">
          <DiyaGraphic
            isLit={isLit}
            size="lg"
            showGlowSpread={true}
            onClick={!isLit ? handleIgnite : undefined}
            className="animate-float-slow"
          />
          {!isLit && (
            <p className="mt-2 font-serif text-[11px] sm:text-sm tracking-widest uppercase text-gold-champagne/70 animate-pulse">
              Touch the diya to kindle the light
            </p>
          )}
        </div>

        {/* Cinematic Poetry Revealed Staggered */}
        <div className="space-y-2.5 sm:space-y-3.5 min-h-[130px] sm:min-h-[150px] flex flex-col items-center justify-center">
          <p
            className={`font-serif text-lg sm:text-2xl md:text-3xl font-light text-ivory/80 tracking-wide transition-all duration-1000 ease-out ${
              step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Some lights make a festival beautiful...
          </p>

          <p
            className={`font-serif text-xl sm:text-3xl md:text-4xl font-normal text-gold-warm italic tracking-wide transition-all duration-1000 ease-out delay-100 ${
              step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Some people make life beautiful.
          </p>

          <div
            className={`w-full pt-1.5 transition-all duration-1000 ease-out ${
              step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <RoyalDivider className="my-2.5 sm:my-3 opacity-60 max-w-xs" />
            <p className="font-serif text-sm sm:text-lg md:text-xl text-rose-muted/95 font-light tracking-wider">
              Tonight, this little celebration is for you.
            </p>
          </div>
        </div>

        {/* Premium Surprise Button */}
        <div
          className={`mt-6 sm:mt-10 transition-all duration-1000 ease-out ${
            step >= 4 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95 pointer-events-none'
          }`}
        >
          <button
            onClick={handleOpenSurprise}
            className="group relative inline-flex items-center justify-center gap-2.5 sm:gap-3 px-7 sm:px-10 py-3 sm:py-3.5 rounded-full overflow-hidden transition-all duration-500 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gold-champagne/50"
          >
            {/* Ambient Button Backlight */}
            <div className="absolute inset-0 bg-gradient-to-r from-burgundy via-royalwine to-burgundy opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 border border-gold-champagne/60 rounded-full group-hover:border-gold-warm group-hover:shadow-[0_0_24px_rgba(243,217,154,0.4)] transition-all duration-500" />

            {/* Shimmer light sweep */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Button Label */}
            <span className="relative z-10 font-serif text-base sm:text-xl font-medium tracking-wider text-ivory group-hover:text-gold-bright flex items-center gap-2">
              Open your surprise
              <Sparkles className="w-4 h-4 text-gold-warm animate-pulse" />
            </span>
          </button>
        </div>
      </div>

      <div className="h-6 sm:h-0" />
    </div>
  );
};
