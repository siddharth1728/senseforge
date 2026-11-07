import React, { useState, useEffect, useCallback } from 'react';
import { SceneId } from './types';
import { ParticleBackground } from './components/ParticleBackground';
import { MusicController } from './components/MusicController';
import { NavigationControls } from './components/NavigationControls';
import { OpeningScene } from './scenes/OpeningScene';
import { DiwaliRevealScene } from './scenes/DiwaliRevealScene';
import { InteractiveDiyasScene } from './scenes/InteractiveDiyasScene';
import { LoveLetterScene } from './scenes/LoveLetterScene';
import { WishesScene } from './scenes/WishesScene';
import { FinaleScene } from './scenes/FinaleScene';

export const App: React.FC = () => {
  const [currentScene, setCurrentScene] = useState<SceneId>('opening');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transitionTo = useCallback((scene: SceneId) => {
    setIsTransitioning(true);
    setHasInteracted(true);
    setTimeout(() => {
      setCurrentScene(scene);
      setIsTransitioning(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
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
    transitionTo('opening');
  };

  // Keyboard accessibility: Left / Right arrows
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
    <div className="relative min-h-screen bg-[#09080D] text-[#FFF5E6] font-sans overflow-x-hidden">
      {/* Persistent Floating Golden Particles */}
      <ParticleBackground />

      {/* Top Floating Music Controller */}
      <MusicController hasStartedInteraction={hasInteracted} />

      {/* Scene Content with Smooth Cinematic Cross-fade */}
      <div
        className={`w-full min-h-screen transition-opacity duration-500 ease-in-out ${
          isTransitioning ? 'opacity-0 scale-[0.99] filter blur-[2px]' : 'opacity-100 scale-100 filter-none'
        }`}
      >
        {currentScene === 'opening' && (
          <OpeningScene onProceed={() => transitionTo('reveal')} />
        )}
        {currentScene === 'reveal' && (
          <DiwaliRevealScene onNext={() => transitionTo('diyas')} />
        )}
        {currentScene === 'diyas' && (
          <InteractiveDiyasScene onNext={() => transitionTo('letter')} />
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
