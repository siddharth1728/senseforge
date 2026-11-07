import React, { useState, useEffect, useCallback } from 'react';
import { SceneId } from './types';
import { PalaceCanvas } from './components/PalaceCanvas';
import { MusicController } from './components/MusicController';
import { NavigationControls } from './components/NavigationControls';
import { OpeningScene } from './scenes/OpeningScene';
import { DiwaliRevealScene } from './scenes/DiwaliRevealScene';
import { InteractiveDiyasScene } from './scenes/InteractiveDiyasScene';
import { LoveLetterScene } from './scenes/LoveLetterScene';
import { WishesScene } from './scenes/WishesScene';
import { FinaleScene } from './scenes/FinaleScene';
import { soundscape } from './utils/audio';

export const App: React.FC = () => {
  const [currentScene, setCurrentScene] = useState<SceneId>('opening');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 5 Diyas state
  const [litDiyas, setLitDiyas] = useState<boolean[]>([false, false, false, false, false]);
  const [activeWishIndex, setActiveWishIndex] = useState<number | null>(null);

  const transitionTo = useCallback((scene: SceneId) => {
    setIsTransitioning(true);
    setHasInteracted(true);
    setTimeout(() => {
      setCurrentScene(scene);
      setIsTransitioning(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 450);
  }, []);

  const handleLightDiya = useCallback((index: number) => {
    soundscape.playDiyaChime(index);
    setLitDiyas((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    setActiveWishIndex(index);
  }, []);

  const handleNext = () => {
    switch (currentScene) {
      case 'opening':
        transitionTo('reveal');
        break;
      case 'reveal':
        transitionTo('diyas');
        break;
      case 'diyas':
        transitionTo('letter');
        break;
      case 'letter':
        transitionTo('wishes');
        break;
      case 'wishes':
        transitionTo('finale');
        break;
      case 'finale':
        transitionTo('opening');
        break;
    }
  };

  const handleReplay = () => {
    setLitDiyas([false, false, false, false, false]);
    setActiveWishIndex(null);
    transitionTo('opening');
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentScene !== 'opening') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScene]);

  return (
    <div className="relative min-h-screen bg-[#09080D] text-[#FFF5E6] font-sans overflow-x-hidden selection:bg-[#55182B] selection:text-[#F3D99A]">
      {/* 3D Immersive Palace Courtyard WebGL Canvas */}
      <PalaceCanvas
        currentScene={currentScene}
        litDiyas={litDiyas}
        onDiyaTapped={handleLightDiya}
      />

      {/* Top Floating Music Controller */}
      <MusicController hasStartedInteraction={hasInteracted} />

      {/* Scene Content with Smooth Cinematic Cross-fade */}
      <div
        className={`w-full min-h-screen transition-all duration-500 ease-out relative z-10 ${
          isTransitioning
            ? 'opacity-0 scale-[0.985] filter blur-[3px]'
            : 'opacity-100 scale-100 filter-none'
        }`}
      >
        {currentScene === 'opening' && (
          <OpeningScene onProceed={() => transitionTo('reveal')} />
        )}
        {currentScene === 'reveal' && (
          <DiwaliRevealScene onNext={() => transitionTo('diyas')} />
        )}
        {currentScene === 'diyas' && (
          <InteractiveDiyasScene
            litDiyas={litDiyas}
            activeWishIndex={activeWishIndex}
            onLightDiya={handleLightDiya}
            onNext={() => transitionTo('letter')}
          />
        )}
        {currentScene === 'letter' && (
          <LoveLetterScene onNext={() => transitionTo('wishes')} />
        )}
        {currentScene === 'wishes' && (
          <WishesScene onNext={() => transitionTo('finale')} />
        )}
        {currentScene === 'finale' && (
          <FinaleScene onReplay={handleReplay} />
        )}
      </div>

      {/* Bottom Scene Progress Indicator Navigation */}
      <NavigationControls
        currentScene={currentScene}
        onSelectScene={transitionTo}
      />
    </div>
  );
};

export default App;
