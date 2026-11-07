export type SceneId = 'opening' | 'reveal' | 'diyas' | 'letter' | 'wishes' | 'finale';

export interface DiyaItem {
  id: number;
  title: string;
  keyword: string;
  wish: string;
  isLit: boolean;
  color: string;
}

export interface AudioState {
  isPlaying: boolean;
  isMuted: boolean;
  isInitialized: boolean;
}
