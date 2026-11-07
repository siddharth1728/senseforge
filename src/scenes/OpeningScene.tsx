import React, { useState, useEffect } from 'react';
import { DiyaGraphic } from '../components/DiyaGraphic';
import { RoyalDivider } from '../components/RangoliPattern';
import { Sparkles } from 'lucide-react';

interface OpeningSceneProps {
  onProceed: () => void;
}

export const OpeningScene: React.FC<OpeningSceneProps> = ({ onProceed }) => {
  const [step, setStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Cinematic timed reveals
    const timer1 = setTimeout(() => setStep(1), 600); // Line 1
    const timer2 = setTimeout(() => setStep(2), 2200); // Line 2
    const timer3 = setTimeout(() => setStep(3), 3800); // Subtitle
    const timer4 = setTimeout(() => setStep(4), 4800); // Button

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const handleOpenSurprise = () => {
    setIsExiting(true);
    setTimeout(() => {
      onProceed();
    }, 1100);
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden transition-all duration-1000 ${
        isExiting ? 'scale-105 opacity-0 blur-md' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background radial darkness with slight golden warmth around center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 48%, rgba(53, 16, 29, 0.45) 0%, rgba(9, 8, 13, 0.98) 65%, #09080D 100%)',
        }}
      />

      {/* Main cinematic content */}
      <div className="relative z-20 flex flex-col items-center max-w-xl mx-auto text-center">
        {/* Hero Center Diya */}
        <div className="relative mb-8 transform transition-all duration-1000 ease-out">
          <DiyaGraphic
            isLit={true}
            size="hero"
            showGlowSpread={true}
            className="animate-float-slow"
          />
        </div>

        {/* Text Container with Staggered Cinematic Fade */}
        <div className="space-y-4 min-h-[140px] flex flex-col items-center justify-center">
          <p
            className={`font-serif text-xl sm:text-2xl md:text-3xl font-light text-ivory/80 transition-all duration-1000 ${
              step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Some lights make a festival beautiful...
          </p>

          <p
            className={`font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-gold-warm italic transition-all duration-1000 delay-150 ${
              step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Some people make life beautiful.
          </p>

          <div
            className={`w-full pt-2 transition-all duration-1000 ${
              step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <RoyalDivider className="my-3 opacity-60" />
            <p className="font-serif text-base sm:text-lg md:text-xl text-rose-muted/90 font-light tracking-wide">
              Tonight, this little celebration is for you.
            </p>
          </div>
        </div>

        {/* Premium Surprise Button */}
        <div
          className={`mt-10 transition-all duration-1000 ${
            step >= 4 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95 pointer-events-none'
          }`}
        >
          <button
            onClick={handleOpenSurprise}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full overflow-hidden transition-all duration-500 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gold-champagne/50"
          >
            {/* Ambient Button Backlight */}
            <div className="absolute inset-0 bg-gradient-to-r from-burgundy via-royalwine to-burgundy opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 border border-gold-champagne/50 rounded-full group-hover:border-gold-warm group-hover:shadow-[0_0_22px_rgba(243,217,154,0.4)] transition-all duration-500" />
            
            {/* Shimmer light sweep */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            {/* Button Label */}
            <span className="relative z-10 font-serif text-lg sm:text-xl font-medium tracking-wider text-ivory group-hover:text-gold-bright flex items-center gap-2">
              Open your surprise
              <Sparkles className="w-4 h-4 text-gold-warm animate-pulse" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
