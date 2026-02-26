import { create } from 'zustand';
import type { PlayerAttributes, Progression } from '../types';
import { GameState, DogState, MenuState, TrainingLevel, DogCharacteristic, DogSize } from '../types';

export interface DogMetadata {
  name: string;
  trainingLevel: TrainingLevel;
  characteristic: DogCharacteristic;
  size: DogSize;
  mood: string;
}

export interface PlayerStats {
  strength: number;
  grit: number;
}

export interface DogStats {
  trainingLevel: number;
  trust: number;
  recallSpeed: number;
}

interface GameStore {
  gameState: GameState;
  dogState: DogState;
  menuState: MenuState;
  tension: number;
  distance: number;
  positions: { px: number; pz: number; dx: number; dz: number };
  isMovingForward: boolean;
  isProfileExpanded: boolean;
  dogMetadata: DogMetadata;
  playerStats: PlayerStats;
  dogStats: DogStats;
  sessionGrit: number;
  hasStrained: boolean;
  unlockedSkills: string[];
  isMenuReady: boolean;
  
  // New Progression Stats
  attributes: PlayerAttributes;
  progression: Progression;

  setGameState: (state: GameState) => void;
  setDogState: (state: DogState) => void;
  setMenuState: (state: MenuState) => void;
  setIsMenuReady: (ready: boolean) => void;
  setTension: (tension: number) => void;
  setDistance: (distance: number) => void;
  setPositions: (positions: { px: number; pz: number; dx: number; dz: number }) => void;
  setIsMovingForward: (isMoving: boolean) => void;
  setIsProfileExpanded: (isExpanded: boolean) => void;
  updatePlayerStats: (stats: Partial<PlayerStats>) => void;
  updateDogStats: (stats: Partial<DogStats>) => void;
  updateAttributes: (attrs: Partial<PlayerAttributes>) => void;
  addXP: (amount: number) => void;
  setHasStrained: (strained: boolean) => void;
  finalizeWalk: () => void;
  purchaseSkill: (skillId: string, cost: number, spCost?: number) => boolean;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: GameState.HOME,
  dogState: DogState.STANDING,
  menuState: MenuState.IDLE,
  tension: 0,
  distance: 0,
  positions: { px: 0, pz: 0, dx: 0, dz: -1 },
  isMovingForward: false,
  isProfileExpanded: false,
  dogMetadata: {
    name: 'BUSTER',
    trainingLevel: TrainingLevel.COMPETENT,
    characteristic: DogCharacteristic.ADHD,
    size: DogSize.SMALL,
    mood: 'Curious',
  },
  playerStats: {
    strength: 1,
    grit: 0,
  },
  dogStats: {
    trainingLevel: 1,
    trust: 0,
    recallSpeed: 12.0,
  },
  sessionGrit: 0,
  hasStrained: false,
  unlockedSkills: ['FOUNDATION'],
  isMenuReady: false,
  
  // Initial Progression Values
  attributes: {
    strength: 1,
    focus: 1,
    agility: 1,
    bond: 1,
  },
  progression: {
    walkerRank: 1,
    xp: 0,
    skillPoints: 0,
  },

  setGameState: (gameState) => {
    if (gameState === GameState.PLAYING) {
      set({ distance: 0, tension: 0, sessionGrit: 0, hasStrained: false });
    }
    if (gameState === GameState.HOME) {
      set({ dogState: DogState.STANDING, menuState: MenuState.IDLE, isMovingForward: false });
    }
    set({ gameState });
  },
  setDogState: (dogState) => set({ dogState }),
  setMenuState: (menuState) => set({ menuState, isMenuReady: false }),
  setIsMenuReady: (isMenuReady) => set({ isMenuReady }),
  setTension: (tension) => {
    const { attributes } = get();
    // Strength 1 = 0.8, Strength 10 = 0.98
    const threshold = 0.78 + (attributes.strength * 0.02);

    if (tension > threshold) set({ hasStrained: true });
    set({ tension });
  },
  setDistance: (distance) => set({ distance }),
  setPositions: (positions) => set({ positions }),
  setIsMovingForward: (isMovingForward) => set({ isMovingForward }),
  setIsProfileExpanded: (isExpanded: boolean) => set({ isProfileExpanded: isExpanded }),
  updatePlayerStats: (stats) => set((state) => ({ playerStats: { ...state.playerStats, ...stats } })),
  updateDogStats: (stats) => set((state) => ({ dogStats: { ...state.dogStats, ...stats } })),
  updateAttributes: (attrs) => set((state) => ({ attributes: { ...state.attributes, ...attrs } })),
  
  addXP: (amount) => set((state) => {
    const newXP = state.progression.xp + amount;
    const xpPerLevel = 1000;
    const newRank = Math.floor(newXP / xpPerLevel) + 1;
    const rankGained = newRank > state.progression.walkerRank;
    
    return {
      progression: {
        ...state.progression,
        xp: newXP,
        walkerRank: newRank,
        skillPoints: state.progression.skillPoints + (rankGained ? 1 : 0)
      }
    };
  }),

  setHasStrained: (hasStrained) => set({ hasStrained }),
  
  finalizeWalk: () => {
    const { distance, hasStrained, playerStats, unlockedSkills, progression, attributes } = get();
    const baseGrit = Math.floor(distance / 10);
    const bonusGrit = hasStrained ? 0 : Math.floor(baseGrit * 0.5);
    let totalGrit = baseGrit + bonusGrit;
    
    // Skill bonus
    if (unlockedSkills.includes('GRIT_FOCUS')) {
      totalGrit = Math.floor(totalGrit * 1.25);
    }

    // Attribute bonus: Focus grants +5% per level
    const focusMultiplier = 1.0 + (attributes.focus * 0.05);
    totalGrit = Math.floor(totalGrit * focusMultiplier);

    // Award XP based on distance (1m = 10 XP)
    const earnedXP = Math.floor(distance * 10);
    const newXP = progression.xp + earnedXP;
    const xpPerLevel = 1000;
    const newRank = Math.floor(newXP / xpPerLevel) + 1;
    const rankGained = newRank > progression.walkerRank;
    
    set({ 
      sessionGrit: totalGrit,
      playerStats: { ...playerStats, grit: playerStats.grit + totalGrit },
      progression: {
        ...progression,
        xp: newXP,
        walkerRank: newRank,
        skillPoints: progression.skillPoints + (rankGained ? 1 : 0)
      }
    });
  },

  purchaseSkill: (skillId, cost, spCost = 0) => {
    const { playerStats, unlockedSkills, progression } = get();
    const canAffordGrit = playerStats.grit >= cost;
    const canAffordSP = progression.skillPoints >= spCost;

    if (canAffordGrit && canAffordSP && !unlockedSkills.includes(skillId)) {
      set({
        playerStats: { ...playerStats, grit: playerStats.grit - cost },
        progression: { ...progression, skillPoints: progression.skillPoints - spCost },
        unlockedSkills: [...unlockedSkills, skillId]
      });
      return true;
    }
    return false;
  }
}));
