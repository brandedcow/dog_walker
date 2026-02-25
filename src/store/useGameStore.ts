import { create } from 'zustand';

export type GameState = 'START' | 'PLAYING' | 'FINISHED';
export type DogState = 'WALKING' | 'SNIFFING' | 'STANDING' | 'SITTING' | 'IDLING' | 'COMING';

interface GameStore {
  gameState: GameState;
  dogState: DogState;
  tension: number;
  distance: number;
  positions: { px: number; pz: number; dx: number; dz: number };
  isMovingForward: boolean;

  setGameState: (state: GameState) => void;
  setDogState: (state: DogState) => void;
  setTension: (tension: number) => void;
  setDistance: (distance: number) => void;
  setPositions: (positions: { px: number; pz: number; dx: number; dz: number }) => void;
  setIsMovingForward: (isMoving: boolean) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: 'START',
  dogState: 'STANDING',
  tension: 0,
  distance: 0,
  positions: { px: 0, pz: 0, dx: 0, dz: -1 },
  isMovingForward: false,

  setGameState: (gameState) => set({ gameState }),
  setDogState: (dogState) => set({ dogState }),
  setTension: (tension) => set({ tension }),
  setDistance: (distance) => set({ distance }),
  setPositions: (positions) => set({ positions }),
  setIsMovingForward: (isMovingForward) => set({ isMovingForward }),
}));
