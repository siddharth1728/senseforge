import React, { useState } from 'react';
import { MarigoldMotif } from '../components/RangoliPattern';
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
    }, 850);
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-start sm:justify-center px-3 sm:px-6 py-6 sm:py-10 pb-28 sm:pb-14 relative overflow-y-auto select-none">
      {/* Background Ambience */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(85, 24, 43, 0.5) 0%, rgba(53, 16, 29, 0.8) 55%, #09080D 100%)',
        }}
      />

      {/* Main Container */}
      <div className="relative z-20 w-full max-w-xl mx-auto flex flex-col items-center my-auto">
        {/* Scene Header */}
        <div className="text-center mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-burgundy/60 border border-gold-subtle/40 mb-2 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-warm" />
            <span className="font-serif text-[10px] sm:text-sm tracking-wider uppercase text-gold-champagne">
              From the Heart
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-3xl md:text-4xl text-gold-light font-normal drop-shadow-md">
            A little letter for my Bangarammm
          </h2>
        </div>

        {/* Closed Envelope View */}
        {!isOpen && (
          <div
            className={`w-full max-w-md transition-all duration-700 transform ${
              isOpening ? 'scale-105 opacity-70 blur-[1px]' : 'scale-100 opacity-100'
            }`}
          >
            {/* The Physical Digital Envelope */}
            <div className="relative rounded-2xl bg-gradient-to-b from-[#4A1828] via-[#35101D] to-[#1F070F] border-2 border-[#D9B66F]/60 shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-5 sm:p-10 flex flex-col items-center text-center overflow-hidden">
              {/* Envelope Flap Triangle Graphic with Realistic Fold Shadow */}
              <div
                className={`absolute top-0 inset-x-0 h-24 sm:h-28 bg-[#300E1A] border-b-2 border-[#D9B66F]/70 transform origin-top transition-transform duration-700 ${
                  isOpening ? '-rotate-x-180' : 'rotate-x-0'
                }`}
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.6)',
                }}
              />

              {/* Gold Filigree Corner Accents */}
              <div className="absolute top-2.5 left-2.5 text-[#D9B66F]/50 text-xs">✦</div>
              <div className="absolute top-2.5 right-2.5 text-[#D9B66F]/50 text-xs">✦</div>
              <div className="absolute bottom-2.5 left-2.5 text-[#D9B66F]/50 text-xs">✦</div>
              <div className="absolute bottom-2.5 right-2.5 text-[#D9B66F]/50 text-xs">✦</div>

              {/* Envelope Stamp / Calligraphy address */}
              <div className="mt-5 sm:mt-7 mb-4 sm:mb-5 z-10 flex flex-col items-center">
                <span className="font-royal text-[9px] sm:text-xs tracking-[0.32em] uppercase text-[#D9B66F]/80 mb-1">
                  Private & Special
                </span>
                <span className="font-display text-xl sm:text-3xl font-medium text-gold-warm drop-shadow-md">
                  To: Bangarammm ❤️
                </span>
              </div>

              {/* Wax Seal Button (Tactile 3D appearance) */}
              <div className="my-2 sm:my-3 z-20">
                <button
                  onClick={handleOpenLetter}
                  disabled={isOpening}
                  className="group relative w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#9E203E] via-[#631427] to-[#360813] border-2 border-[#F3D99A] shadow-[0_8px_25px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none"
                  aria-label="Open your letter"
                >
                  {/* Wax rim relief */}
                  <div className="absolute inset-1 rounded-full border border-[#F3D99A]/50 shadow-inner" />
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-[#FFF5E6] fill-[#FFF5E6]/95 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
                </button>
              </div>

              {/* Open Button */}
              <div className="mt-2 sm:mt-3 z-10">
                <button
                  onClick={handleOpenLetter}
                  disabled={isOpening}
                  className="group inline-flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full glass-burgundy border border-gold-champagne/60 text-ivory hover:border-gold-warm hover:shadow-[0_0_20px_rgba(217,182,111,0.4)] transition-all text-xs sm:text-sm font-serif tracking-wider"
                >
                  <MailOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-warm group-hover:rotate-12 transition-transform" />
                  <span>{isOpening ? 'Unsealing...' : 'Open your letter'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unfolded Warm Ivory Parchment Letter View */}
        {isOpen && (
          <div className="w-full max-w-xl animate-fade-in transition-all duration-700">
            <div className="relative rounded-2xl letter-paper text-[#26150F] p-4 sm:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.95)] border-2 border-[#D9B66F]/80">
              {/* Decorative Stamp in Corner */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1 opacity-85 pointer-events-none">
                <MarigoldMotif size={20} />
                <span className="font-royal text-[8px] sm:text-[9px] tracking-widest text-[#80341B] uppercase border border-[#80341B]/40 px-1 py-0.5 rounded">
                  Diwali
                </span>
              </div>

              {/* Top Flourish */}
              <div className="flex items-center justify-center gap-2 mb-4 sm:mb-5">
                <div className="h-[1px] w-8 sm:w-12 bg-[#B38C43]/40" />
                <span className="text-[#80341B] text-xs">✦ 🪔 ✦</span>
                <div className="h-[1px] w-8 sm:w-12 bg-[#B38C43]/40" />
              </div>

              {/* Letter Content - Mobile Readable with proper leading and spacing */}
              <div className="space-y-3 sm:space-y-4 font-serif text-[14px] sm:text-[17px] md:text-[18px] leading-relaxed text-[#2B1810]">
                <p className="font-display font-semibold text-lg sm:text-2xl text-[#6B1D2F]">
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

                <div className="pt-3 sm:pt-4 border-t border-[#D9B66F]/40 space-y-0.5 sm:space-y-1">
                  <p className="font-handwriting text-lg sm:text-2xl text-[#6B1D2F]">
                    With lots of warmth and affection,
                  </p>
                  <p className="font-display font-bold text-base sm:text-xl text-[#8A1C36]">
                    Happy Diwali, Bangarammm. ❤️
                  </p>
                </div>
              </div>

              {/* Re-fold option */}
              <div className="mt-4 sm:mt-5 pt-3 flex items-center justify-between border-t border-[#D9B66F]/20">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-sans text-[#80341B]/70 hover:text-[#80341B] inline-flex items-center gap-1 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" /> Re-fold envelope
                </button>
              </div>
            </div>

            {/* Next Step CTA */}
            <div className="mt-5 sm:mt-7 text-center">
              <button
                onClick={onNext}
                className="group inline-flex items-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-full glass-burgundy border border-gold-champagne hover:border-gold-warm text-ivory hover:shadow-[0_0_24px_rgba(243,217,154,0.4)] transition-all font-serif text-sm sm:text-lg active:scale-95"
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
