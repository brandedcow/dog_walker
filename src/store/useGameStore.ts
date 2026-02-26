import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ResonanceTraits, Progression, ResonanceType as PlayerResonance } from '../types';
import { GameState, DogState, MenuState, TrainingLevel, DogCharacteristic, DogSize, ResonanceType, RESONANCE_STATS } from '../types';
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

export const RESONANCE_ORDER = [
  ResonanceType.ANCHOR,
  ResonanceType.WHISPERER,
  ResonanceType.TACTICIAN,
  ResonanceType.NOMAD,
  ResonanceType.URBANIST,
  ResonanceType.SPECIALIST,
];

export const getResonanceFilter = (playerResonance: PlayerResonance, skillResonance: ResonanceType | 'GENERAL'): number => {
  if (skillResonance === 'GENERAL') return 1.0;
  if (!playerResonance) return 1.0; 
  
  const pIdx = RESONANCE_ORDER.indexOf(playerResonance);
  const sIdx = RESONANCE_ORDER.indexOf(skillResonance);
  
  if (pIdx === -1 || sIdx === -1) return 1.0; 
  
  const diff = Math.abs(pIdx - sIdx);
  const distance = Math.min(diff, RESONANCE_ORDER.length - diff);
  
  if (distance === 0) return 1.0; // Primary Type: 100% Resonance
  if (distance === 1) return 0.8; // Adjacent Type: 80% Resonance
  if (distance === 2) return 0.6; // Secondary Type: 60% Resonance
  return 0.4; // Opposite Type: 40% Resonance
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
  resonanceType: PlayerResonance;
  traits: ResonanceTraits;
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
  setResonanceType: (resonance: PlayerResonance) => void;
}

const DEFAULT_PROG_STATE = {
  resonanceType: ResonanceType.ANCHOR,
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
  traits: RESONANCE_STATS[ResonanceType.ANCHOR],
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

      setResonanceType: (resonanceType: PlayerResonance) => {
        set({ resonanceType, traits: RESONANCE_STATS[resonanceType] });
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
        const { traits = { strength: 1 } } = get();
        // Total Strength affects threshold
        const threshold = 0.78 + (traits.strength * 0.02);

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
        const { distance, hasStrained, playerStats, progression, traits = { awareness: 1 }, totalDistanceWalked } = get();
        const baseGrit = Math.floor(distance / 10);
        const bonusGrit = hasStrained ? 0 : Math.floor(baseGrit * 0.5);
        let totalGrit = baseGrit + bonusGrit;
        
        // Dynamic trait bonus: Awareness grants +5% per level
        const awarenessMultiplier = 1.0 + (traits.awareness * 0.05);
        totalGrit = Math.floor(totalGrit * awarenessMultiplier);

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
        const { playerStats, unlockedSkills, progression, resonanceType = ResonanceType.ANCHOR } = get();
        const canAffordGrit = playerStats.grit >= gritCost;
        const canAffordSP = progression.skillPoints >= spCost;

        if (canAffordGrit && canAffordSP && !unlockedSkills.includes(skillId)) {
          const newSkills = [...unlockedSkills, skillId];
          
          // Recalculate traits based on base + new skill set with filter potency
          const base = RESONANCE_STATS[resonanceType] || RESONANCE_STATS[ResonanceType.ANCHOR];
          const totalTraits = { ...base };
          
          newSkills.forEach(id => {
            const skill = SKILLS.find(s => s.id === id);
            if (skill?.augments) {
              const filterPotency = getResonanceFilter(resonanceType, skill.resonance);
              
              totalTraits.strength += (skill.augments.strength || 0) * filterPotency;
              totalTraits.bond += (skill.augments.bond || 0) * filterPotency;
              totalTraits.awareness += (skill.augments.awareness || 0) * filterPotency;
              totalTraits.speed += (skill.augments.speed || 0) * filterPotency;
              totalTraits.mastery += (skill.augments.mastery || 0) * filterPotency;
            }
          });

          set({
            playerStats: { ...playerStats, grit: playerStats.grit - gritCost },
            progression: { ...progression, skillPoints: progression.skillPoints - spCost },
            unlockedSkills: newSkills,
            traits: totalTraits
          });
          return true;
        }
        return false;
      },

      respecSkills: (gritCost: number) => {
        const { playerStats, progression, resonanceType = ResonanceType.ANCHOR, unlockedSkills } = get();
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
          traits: RESONANCE_STATS[resonanceType] || RESONANCE_STATS[ResonanceType.ANCHOR]
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
        resonanceType: state.resonanceType,
        dogMetadata: state.dogMetadata,
        playerStats: state.playerStats,
        dogStats: state.dogStats,
        unlockedSkills: state.unlockedSkills,
        traits: state.traits,
        progression: state.progression,
        totalDistanceWalked: state.totalDistanceWalked,
      }),
    }
  )
);
