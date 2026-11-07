import React, { useState } from 'react';
import { RoyalDivider, MarigoldMotif } from '../components/RangoliPattern';
import { soundscape } from '../utils/audio';
import { Heart, Sparkles, ChevronRight, MailOpen, Mail } from 'lucide-react';

interface LoveLetterSceneProps {
  onNext: () => void;
}

export const LoveLetterScene: React.FC<LoveLetterSceneProps> = ({ onNext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenLetter = () => {
    if (isOpen) return;
    setIsOpening(true);
    soundscape.playLetterOpenChime();
    setTimeout(() => {
      setIsOpen(true);
      setIsOpening(false);
    }, 900);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden select-none">
      {/* Background Ambience */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(85, 24, 43, 0.5) 0%, rgba(53, 16, 29, 0.8) 55%, #09080D 100%)',
        }}
      />

      {/* Main Container */}
      <div className="relative z-20 w-full max-w-xl mx-auto flex flex-col items-center">
        {/* Scene Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-burgundy/60 border border-gold-subtle/40 mb-3 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-gold-warm" />
            <span className="font-serif text-xs sm:text-sm tracking-wider uppercase text-gold-champagne">
              From the Heart
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-gold-light font-normal">
            A little letter for my Bangarammm
          </h2>
        </div>

        {/* Closed Envelope View */}
        {!isOpen && (
          <div
            className={`w-full max-w-md transition-all duration-700 transform ${
              isOpening ? 'scale-105 opacity-80' : 'scale-100 opacity-100'
            }`}
          >
            {/* The Envelope */}
            <div className="relative rounded-2xl bg-gradient-to-b from-[#4A1828] to-[#250812] border-2 border-[#D9B66F]/50 shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-8 sm:p-10 flex flex-col items-center text-center overflow-hidden">
              {/* Envelope Flap Triangle Graphic */}
              <div
                className={`absolute top-0 inset-x-0 h-28 bg-[#35101D] border-b-2 border-[#D9B66F]/60 transform origin-top transition-transform duration-700 ${
                  isOpening ? '-rotate-x-180' : 'rotate-x-0'
                }`}
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                }}
              />

              {/* Gold Filigree Corner Accents */}
              <div className="absolute top-2 left-2 text-[#D9B66F]/40 text-sm">✦</div>
              <div className="absolute top-2 right-2 text-[#D9B66F]/40 text-sm">✦</div>
              <div className="absolute bottom-2 left-2 text-[#D9B66F]/40 text-sm">✦</div>
              <div className="absolute bottom-2 right-2 text-[#D9B66F]/40 text-sm">✦</div>

              {/* Envelope Stamp / Calligraphy address */}
              <div className="mt-8 mb-6 z-10 flex flex-col items-center">
                <span className="font-royal text-xs tracking-[0.3em] uppercase text-[#D9B66F]/70 mb-1">
                  Private & Special
                </span>
                <span className="font-display text-2xl sm:text-3xl font-medium text-gold-warm">
                  To: Bangarammm ❤️
                </span>
              </div>

              {/* Wax Seal Button */}
              <div className="my-4 z-20">
                <button
                  onClick={handleOpenLetter}
                  disabled={isOpening}
                  className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#8A1C36] via-[#5E1224] to-[#3B0915] border-2 border-[#D9B66F] shadow-[0_6px_20px_rgba(0,0,0,0.7)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none"
                  aria-label="Open your letter"
                >
                  {/* Wax rim ring */}
                  <div className="absolute inset-1 rounded-full border border-[#F3D99A]/40" />
                  <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-[#FFF5E6] fill-[#FFF5E6]/90 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                </button>
              </div>

              {/* Open Button */}
              <div className="mt-4 z-10">
                <button
                  onClick={handleOpenLetter}
                  disabled={isOpening}
                  className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-full glass-burgundy border border-gold-champagne/60 text-ivory hover:border-gold-warm hover:shadow-[0_0_18px_rgba(217,182,111,0.35)] transition-all text-sm font-serif tracking-wider"
                >
                  <MailOpen className="w-4 h-4 text-gold-warm group-hover:rotate-12 transition-transform" />
                  <span>{isOpening ? 'Unsealing...' : 'Open your letter'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unfolded Warm Ivory Parchment Letter View */}
        {isOpen && (
          <div className="w-full max-w-xl animate-fade-in transition-all duration-700">
            <div className="relative rounded-2xl letter-paper text-[#26150F] p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.9)] border-2 border-[#D9B66F]/80">
              {/* Decorative Vintage Stamp in Corner */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-80 pointer-events-none">
                <MarigoldMotif size={24} />
                <span className="font-royal text-[10px] tracking-widest text-[#80341B] uppercase border border-[#80341B]/30 px-1.5 py-0.5 rounded">
                  Diwali 2026
                </span>
              </div>

              {/* Decorative Top Flourish */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="h-[1px] w-12 bg-[#B38C43]/40" />
                <span className="text-[#80341B] text-xs">✦ 🪔 ✦</span>
                <div className="h-[1px] w-12 bg-[#B38C43]/40" />
              </div>

              {/* Letter Content - Exact text provided in prompt */}
              <div className="space-y-4 font-serif text-[15px] sm:text-[17px] md:text-[18px] leading-relaxed text-[#2B1810]">
                <p className="font-display font-semibold text-xl sm:text-2xl text-[#6B1D2F]">
                  My dearest Bangarammm,
                </p>

                <p className="font-medium text-[#7D2438]">
                  Happy Diwali, my favourite person. ❤️
                </p>

                <p>
                  Among all the beautiful lights that make this festival special, I hope you never forget how beautifully you light up the world around you.
                </p>

                <p>
                  On this special occasion, I wish you endless happiness, a peaceful heart, the courage to chase every dream, and countless reasons to smile.
                </p>

                <p>
                  May every little diya remind you that even the smallest lights can make the darkest nights beautiful.
                </p>

                <p>
                  I hope life gives you more beautiful surprises than you expect, more happiness than you imagine, and memories that stay close to your heart forever.
                </p>

                <p>
                  Keep smiling, keep shining, and never stop being the wonderful person you are.
                </p>

                <p className="font-medium italic text-[#55182B]">
                  And if I could make one wish this Diwali, it would simply be to see you happy.
                </p>

                <div className="pt-4 border-t border-[#D9B66F]/40 space-y-1">
                  <p className="font-handwriting text-xl sm:text-2xl text-[#6B1D2F]">
                    With lots of warmth and affection,
                  </p>
                  <p className="font-display font-bold text-lg sm:text-xl text-[#8A1C36]">
                    Happy Diwali, Bangarammm. ❤️
                  </p>
                </div>
              </div>

              {/* Re-fold option */}
              <div className="mt-6 pt-4 flex items-center justify-between">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-sans text-[#80341B]/70 hover:text-[#80341B] inline-flex items-center gap-1 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" /> Re-fold envelope
                </button>
              </div>
            </div>

            {/* Next Step CTA */}
            <div className="mt-8 text-center">
              <button
                onClick={onNext}
                className="group inline-flex items-center gap-2 px-7 py-3 rounded-full glass-burgundy border border-gold-champagne hover:border-gold-warm text-ivory hover:shadow-[0_0_22px_rgba(243,217,154,0.35)] transition-all font-serif text-base sm:text-lg active:scale-95"
              >
                <span>Special Wishes For You</span>
                <ChevronRight className="w-4 h-4 text-gold-champagne group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
