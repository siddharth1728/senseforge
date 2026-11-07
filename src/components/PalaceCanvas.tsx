import React, { useEffect, useRef, useState } from 'react';
import { PalaceSceneManager } from '../three/PalaceSceneManager';
import { SceneId } from '../types';

interface PalaceCanvasProps {
  currentScene: SceneId;
  litDiyas: boolean[];
  onDiyaTapped: (index: number) => void;
}

export const PalaceCanvas: React.FC<PalaceCanvasProps> = ({
  currentScene,
  litDiyas,
  onDiyaTapped,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const managerRef = useRef<PalaceSceneManager | null>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);

  // Check WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      if (!gl) {
        setWebGLSupported(false);
      }
    } catch {
      setWebGLSupported(false);
    }
  }, []);

  // Initialize Three.js Scene Manager
  useEffect(() => {
    if (!webGLSupported || !containerRef.current) return;

    const manager = new PalaceSceneManager(containerRef.current);
    managerRef.current = manager;

    manager.onDiyaTapped = (id: number) => {
      // id is 1-based (1..5), callback expects 0-based index
      onDiyaTapped(id - 1);
    };

    return () => {
      manager.dispose();
      managerRef.current = null;
    };
  }, [webGLSupported]);

  // Synchronize Scene Camera on scene change
  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.setSceneCamera(currentScene);
    }
  }, [currentScene]);

  // Synchronize Diya lit states
  useEffect(() => {
    if (!managerRef.current) return;
    litDiyas.forEach((isLit, idx) => {
      if (isLit) {
        managerRef.current?.lightDiya(idx + 1);
      }
    });
  }, [litDiyas]);

  if (!webGLSupported) {
    // Graceful 2D Atmospheric Fallback
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at 50% 40%, #35101D 0%, #09080D 85%)',
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-auto overflow-hidden"
      aria-hidden="true"
    />
  );
};
