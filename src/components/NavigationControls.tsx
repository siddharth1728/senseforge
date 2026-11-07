import React from 'react';
import { SceneId } from '../types';

interface NavigationControlsProps {
  currentScene: SceneId;
  onSelectScene: (scene: SceneId) => void;
}

const SCENE_ORDER: { id: SceneId; label: string }[] = [
  { id: 'opening', label: 'Opening' },
  { id: 'reveal', label: 'Greeting' },
  { id: 'diyas', label: 'Diyas' },
  { id: 'letter', label: 'Letter' },
  { id: 'wishes', label: 'Wishes' },
  { id: 'finale', label: 'Finale' },
];

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentScene,
  onSelectScene,
}) => {
  // Hide scene switcher during the very first mysterious opening until interaction begins
  if (currentScene === 'opening') return null;

  return (
    <nav
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-burgundy border border-gold-subtle/40 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
      aria-label="Scene progress"
    >
      {SCENE_ORDER.map((item, index) => {
        const isActive = currentScene === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectScene(item.id)}
            className={`group relative flex items-center justify-center p-1.5 rounded-full transition-all duration-300 focus:outline-none`}
            title={`Go to ${item.label}`}
            aria-label={`Go to ${item.label}`}
          >
            <span
              className={`block rounded-full transition-all duration-500 ${
                isActive
                  ? 'w-6 h-2 bg-gradient-to-r from-[#F3D99A] to-[#D9B66F] shadow-[0_0_8px_#F3D99A]'
                  : 'w-2 h-2 bg-white/20 hover:bg-gold-champagne/60'
              }`}
            />
            {/* Tooltip on hover */}
            <span className="absolute -top-7 scale-0 group-hover:scale-100 transition-transform font-royal text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-burgundy border border-gold-champagne/40 text-gold-warm shadow-md pointer-events-none whitespace-nowrap">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
