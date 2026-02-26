import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PlayerAttributes, Progression, Race as PlayerRace } from '../types';
import { GameState, DogState, MenuState, TrainingLevel, DogCharacteristic, DogSize, Race, RACE_STATS } from '../types';
import { SKILLS } from '../config/skills';

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
  totalDistanceWalked: number;
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
  
  // Refined Progression
  race: PlayerRace;
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
  addXP: (amount: number) => void;
  setHasStrained: (strained: boolean) => void;
  finalizeWalk: () => void;
  purchaseSkill: (skillId: string, gritCost: number, spCost?: number) => boolean;
  respecSkills: (gritCost: number) => boolean;
  resetProgress: () => void;
  setRace: (race: PlayerRace) => void;
}

const DEFAULT_PROG_STATE = {
  race: Race.HUMAN,
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
  unlockedSkills: ['FOUNDATION'],
  attributes: RACE_STATS[Race.HUMAN],
  progression: {
    walkerRank: 1,
    xp: 0,
    skillPoints: 0,
  },
  totalDistanceWalked: 0,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      gameState: GameState.HOME,
      dogState: DogState.STANDING,
      menuState: MenuState.IDLE,
      tension: 0,
      distance: 0,
      positions: { px: 0, pz: 0, dx: 0, dz: -1 },
      isMovingForward: false,
      isProfileExpanded: false,
      ...DEFAULT_PROG_STATE,
      sessionGrit: 0,
      hasStrained: false,
      isMenuReady: false,

      setRace: (race: PlayerRace) => {
        set({ race, attributes: RACE_STATS[race] });
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
        // Total Strength affects threshold
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
            skillPoints: state.progression.skillPoints + (rankGained ? 2 : 0) // 2 SP per rank
          }
        };
      }),

      setHasStrained: (hasStrained) => set({ hasStrained }),
      
      finalizeWalk: () => {
        const { distance, hasStrained, playerStats, unlockedSkills, progression, attributes, totalDistanceWalked } = get();
        const baseGrit = Math.floor(distance / 10);
        const bonusGrit = hasStrained ? 0 : Math.floor(baseGrit * 0.5);
        let totalGrit = baseGrit + bonusGrit;
        
        // Skill bonuses
        if (unlockedSkills.includes('GRIT_FOCUS')) {
          totalGrit = Math.floor(totalGrit * 1.25);
        }

        // Dynamic attribute bonus: Focus grants +5% per level
        const focusMultiplier = 1.0 + (attributes.focus * 0.05);
        totalGrit = Math.floor(totalGrit * focusMultiplier);

        const earnedXP = Math.floor(distance * 10);
        const newXP = progression.xp + earnedXP;
        const xpPerLevel = 1000;
        const newRank = Math.floor(newXP / xpPerLevel) + 1;
        const rankGained = newRank > progression.walkerRank;
        
        set({ 
          sessionGrit: totalGrit,
          totalDistanceWalked: totalDistanceWalked + distance,
          playerStats: { ...playerStats, grit: playerStats.grit + totalGrit },
          progression: {
            ...progression,
            xp: newXP,
            walkerRank: newRank,
            skillPoints: progression.skillPoints + (rankGained ? 2 : 0) // 2 SP per rank
          }
        });
      },

      purchaseSkill: (skillId, gritCost, spCost = 0) => {
        const { playerStats, unlockedSkills, progression, race } = get();
        const canAffordGrit = playerStats.grit >= gritCost;
        const canAffordSP = progression.skillPoints >= spCost;

        if (canAffordGrit && canAffordSP && !unlockedSkills.includes(skillId)) {
          const newSkills = [...unlockedSkills, skillId];
          
          // Recalculate attributes based on race + new skill set
          const base = RACE_STATS[race];
          const totalAttrs = { ...base };
          
          newSkills.forEach(id => {
            const skill = SKILLS.find(s => s.id === id);
            if (skill?.augments) {
              totalAttrs.strength += (skill.augments.strength || 0);
              totalAttrs.agility += (skill.augments.agility || 0);
              totalAttrs.focus += (skill.augments.focus || 0);
              totalAttrs.bond += (skill.augments.bond || 0);
            }
          });

          set({
            playerStats: { ...playerStats, grit: playerStats.grit - gritCost },
            progression: { ...progression, skillPoints: progression.skillPoints - spCost },
            unlockedSkills: newSkills,
            attributes: totalAttrs
          });
          return true;
        }
        return false;
      },

      respecSkills: (gritCost: number) => {
        const { playerStats, progression, race, unlockedSkills } = get();
        if (playerStats.grit < gritCost) return false;

        // Calculate total SP spent (excluding FOUNDATION which is free/base)
        let totalSPSpent = 0;
        unlockedSkills.forEach(id => {
          if (id === 'FOUNDATION') return;
          // Note: In current SKILLS config, cost is in Grit, we need SP cost mapping
          // For now, let's assume 1 SP per skill for MVP logic
          totalSPSpent += 1; 
        });

        set({
          playerStats: { ...playerStats, grit: playerStats.grit - gritCost },
          progression: { ...progression, skillPoints: progression.skillPoints + totalSPSpent },
          unlockedSkills: ['FOUNDATION'],
          attributes: RACE_STATS[race] // Reset to base race stats
        });
        return true;
      },

      resetProgress: () => {
        set({ ...DEFAULT_PROG_STATE });
      },
    }),
    {
      name: 'barking-mad-save',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        race: state.race,
        dogMetadata: state.dogMetadata,
        playerStats: state.playerStats,
        dogStats: state.dogStats,
        unlockedSkills: state.unlockedSkills,
        attributes: state.attributes,
        progression: state.progression,
        totalDistanceWalked: state.totalDistanceWalked,
      }),
    }
  )
);

