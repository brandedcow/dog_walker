import { create } from 'zustand';

export type GameState = 'START' | 'PLAYING' | 'FINISHED';
export type DogState = 'WALKING' | 'SNIFFING' | 'STANDING' | 'SITTING' | 'IDLING' | 'COMING';

export interface DogMetadata {
  name: string;
  trainingLevel: 'Good boy' | 'Paws-itive influence' | 'Fur-ly Competent' | 'Pawful Mess' | 'Ruff Start';
  characteristic: 'Puller' | 'Reactive' | 'Velcro' | 'Sniffer' | 'Anxious Walker' | 'ADHD';
  size: 'Small' | 'Medium' | 'Large';
  mood: string;
}

interface GameStore {
  gameState: GameState;
  dogState: DogState;
  tension: number;
  distance: number;
  positions: { px: number; pz: number; dx: number; dz: number };
  isMovingForward: boolean;
  isProfileExpanded: boolean;
  dogMetadata: DogMetadata;

  setGameState: (state: GameState) => void;
  setDogState: (state: DogState) => void;
  setTension: (tension: number) => void;
  setDistance: (distance: number) => void;
  setPositions: (positions: { px: number; pz: number; dx: number; dz: number }) => void;
  setIsMovingForward: (isMoving: boolean) => void;
  setIsProfileExpanded: (isExpanded: boolean) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: 'START',
  dogState: 'STANDING',
  tension: 0,
  distance: 0,
  positions: { px: 0, pz: 0, dx: 0, dz: -1 },
  isMovingForward: false,
  isProfileExpanded: false,
  dogMetadata: {
    name: 'BUSTER',
    trainingLevel: 'Fur-ly Competent',
    characteristic: 'ADHD',
    size: 'Small',
    mood: 'Curious',
  },

  setGameState: (gameState) => set({ gameState }),
  setDogState: (dogState) => set({ dogState }),
  setTension: (tension) => set({ tension }),
  setDistance: (distance) => set({ distance }),
  setPositions: (positions) => set({ positions }),
  setIsMovingForward: (isMovingForward) => set({ isMovingForward }),
  setIsProfileExpanded: (isProfileExpanded) => set({ isProfileExpanded }),
}));
