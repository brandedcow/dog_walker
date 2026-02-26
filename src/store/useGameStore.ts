import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PlayerAttributes, Progression, AffinityType as PlayerAffinity } from '../types';
import { GameState, DogState, MenuState, TrainingLevel, DogCharacteristic, DogSize, AffinityType, AFFINITY_STATS } from '../types';
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

export const AFFINITY_ORDER = [
  AffinityType.ANCHOR,
  AffinityType.WHISPERER,
  AffinityType.TACTICIAN,
  AffinityType.NOMAD,
  AffinityType.URBANIST,
  AffinityType.SPECIALIST,
];

export const getSkillEfficiency = (playerAffinity: PlayerAffinity, skillAffinity: AffinityType | 'GENERAL'): number => {
  if (skillAffinity === 'GENERAL') return 1.0;
  if (!playerAffinity) return 1.0; // Fallback for undefined affinity
  
  const pIdx = AFFINITY_ORDER.indexOf(playerAffinity);
  const sIdx = AFFINITY_ORDER.indexOf(skillAffinity);
  
  if (pIdx === -1 || sIdx === -1) return 1.0; // Fallback if not found
  
  const diff = Math.abs(pIdx - sIdx);
  const distance = Math.min(diff, AFFINITY_ORDER.length - diff);
  
  if (distance === 0) return 1.0;
  if (distance === 1) return 0.8;
  if (distance === 2) return 0.6;
  return 0.4; // distance 3 (Opposite)
};

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
  affinityType: PlayerAffinity;
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
  setAffinityType: (affinity: PlayerAffinity) => void;
}

const DEFAULT_PROG_STATE = {
  affinityType: AffinityType.ANCHOR,
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
  attributes: AFFINITY_STATS[AffinityType.ANCHOR],
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

      setAffinityType: (affinityType: PlayerAffinity) => {
        set({ affinityType, attributes: AFFINITY_STATS[affinityType] });
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
        const { attributes = { strength: 1 } } = get();
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
        const { distance, hasStrained, playerStats, progression, attributes = { focus: 1 }, totalDistanceWalked } = get();
        const baseGrit = Math.floor(distance / 10);
        const bonusGrit = hasStrained ? 0 : Math.floor(baseGrit * 0.5);
        let totalGrit = baseGrit + bonusGrit;
        
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
        const { playerStats, unlockedSkills, progression, affinityType = AffinityType.ANCHOR } = get();
        const canAffordGrit = playerStats.grit >= gritCost;
        const canAffordSP = progression.skillPoints >= spCost;

        if (canAffordGrit && canAffordSP && !unlockedSkills.includes(skillId)) {
          const newSkills = [...unlockedSkills, skillId];
          
          // Recalculate attributes based on base + new skill set with efficiency
          const base = AFFINITY_STATS[affinityType] || AFFINITY_STATS[AffinityType.ANCHOR];
          const totalAttrs = { ...base };
          
          newSkills.forEach(id => {
            const skill = SKILLS.find(s => s.id === id);
            if (skill?.augments) {
              const efficiency = getSkillEfficiency(affinityType, skill.affinity);
              
              totalAttrs.strength += (skill.augments.strength || 0) * efficiency;
              totalAttrs.agility += (skill.augments.agility || 0) * efficiency;
              totalAttrs.focus += (skill.augments.focus || 0) * efficiency;
              totalAttrs.bond += (skill.augments.bond || 0) * efficiency;
              totalAttrs.awareness += (skill.augments.awareness || 0) * efficiency;
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
        const { playerStats, progression, affinityType = AffinityType.ANCHOR, unlockedSkills } = get();
        if (playerStats.grit < gritCost) return false;

        // Calculate total SP spent
        let totalSPSpent = 0;
        unlockedSkills.forEach(id => {
          if (id === 'FOUNDATION') return;
          const skill = SKILLS.find(s => s.id === id);
          if (skill) totalSPSpent += skill.spCost;
        });

        set({
          playerStats: { ...playerStats, grit: playerStats.grit - gritCost },
          progression: { ...progression, skillPoints: progression.skillPoints + totalSPSpent },
          unlockedSkills: ['FOUNDATION'],
          attributes: AFFINITY_STATS[affinityType] || AFFINITY_STATS[AffinityType.ANCHOR]
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
        affinityType: state.affinityType,
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

