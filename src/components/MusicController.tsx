import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { soundscape } from '../utils/audio';

interface MusicControllerProps {
  hasStartedInteraction?: boolean;
}

export const MusicController: React.FC<MusicControllerProps> = ({
  hasStartedInteraction = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // If user interacts and sound wasn't started yet, allow gentle initialization if user prefers
  }, [hasStartedInteraction]);

  const toggleSound = () => {
    if (!isPlaying) {
      soundscape.startAmbient();
      setIsPlaying(true);
      setIsMuted(false);
    } else {
      const muted = soundscape.toggleMute();
      setIsMuted(muted);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <button
        onClick={toggleSound}
        className="group flex items-center gap-2.5 px-3.5 py-2 rounded-full glass-burgundy border border-gold-subtle/50 hover:border-gold-champagne/80 text-ivory transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] active:scale-95"
        title={isPlaying ? (isMuted ? 'Unmute Diwali Music' : 'Mute Music') : 'Play Ambient Music'}
        aria-label={isPlaying ? (isMuted ? 'Unmute Diwali Music' : 'Mute Music') : 'Play Ambient Music'}
      >
        <span className="text-gold-champagne transition-transform group-hover:scale-110">
          {!isPlaying ? (
            <Music className="w-4 h-4 opacity-80" />
          ) : isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-muted" />
          ) : (
            <Volume2 className="w-4 h-4 text-gold-warm" />
          )}
        </span>

        {/* Animated Soundwave bars when playing and not muted */}
        {isPlaying && !isMuted ? (
          <div className="flex items-center gap-0.5 h-3.5" aria-hidden="true">
            <span className="w-0.5 bg-gold-champagne rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-2.5" />
            <span className="w-0.5 bg-gold-warm rounded-full animate-[pulse_1.2s_ease-in-out_infinite_0.2s] h-3.5" />
            <span className="w-0.5 bg-gold-champagne rounded-full animate-[pulse_0.9s_ease-in-out_infinite_0.4s] h-2" />
          </div>
        ) : (
          <span className="text-xs font-serif tracking-wider text-ivory/70 group-hover:text-gold-warm">
            {!isPlaying ? 'Music' : 'Muted'}
          </span>
        )}
      </button>
    </div>
  );
};
