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
  secondaryFocus: PlayerResonance | null;
  traits: ResonanceTraits; // Final Output (Raw * Filter)
  rawTraits: ResonanceTraits; // Raw Organic Level
  progression: Progression;
  affinityXP: Record<ResonanceType, number>;

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
  addXP: (amount: number, category?: ResonanceType) => void;
  setHasStrained: (strained: boolean) => void;
  finalizeWalk: () => void;
  purchaseSkill: (skillId: string, gritCost: number, spCost?: number) => boolean;
  respecSkills: (gritCost: number) => boolean;
  resetProgress: () => void;
  setResonanceType: (resonance: PlayerResonance) => void;
}

const calculateFinalTraits = (
  resonanceType: ResonanceType, 
  affinityXP: Record<ResonanceType, number>, 
  unlockedSkills: string[]
): { raw: ResonanceTraits, final: ResonanceTraits } => {
  const base = RESONANCE_STATS[resonanceType];
  const raw: ResonanceTraits = { ...base };
  
  // 1. Organic Growth from XP (100 XP = +1 Raw Level for MVP)
  raw.strength += Math.floor(affinityXP[ResonanceType.ANCHOR] / 100);
  raw.bond += Math.floor(affinityXP[ResonanceType.WHISPERER] / 100);
  raw.focus += Math.floor(affinityXP[ResonanceType.TACTICIAN] / 100);
  raw.speed += Math.floor(affinityXP[ResonanceType.NOMAD] / 100);
  raw.awareness += Math.floor(affinityXP[ResonanceType.URBANIST] / 100);
  raw.mastery += Math.floor(affinityXP[ResonanceType.SPECIALIST] / 100);

  // 2. Skill Augments (Apply to Raw)
  unlockedSkills.forEach(id => {
    const skill = SKILLS.find(s => s.id === id);
    if (skill?.augments) {
      raw.strength += (skill.augments.strength || 0);
      raw.bond += (skill.augments.bond || 0);
      raw.focus += (skill.augments.focus || 0);
      raw.speed += (skill.augments.speed || 0);
      raw.awareness += (skill.augments.awareness || 0);
      raw.mastery += (skill.augments.mastery || 0);
    }
  });

  // 3. Neural Filter Potency (Raw * Filter = Final)
  const final: ResonanceTraits = {
    strength: raw.strength * getResonanceFilter(resonanceType, ResonanceType.ANCHOR),
    bond: raw.bond * getResonanceFilter(resonanceType, ResonanceType.WHISPERER),
    focus: raw.focus * getResonanceFilter(resonanceType, ResonanceType.TACTICIAN),
    speed: raw.speed * getResonanceFilter(resonanceType, ResonanceType.NOMAD),
    awareness: raw.awareness * getResonanceFilter(resonanceType, ResonanceType.URBANIST),
    mastery: raw.mastery * getResonanceFilter(resonanceType, ResonanceType.SPECIALIST),
  };

  return { raw, final };
};

const DEFAULT_PROG_STATE = {
  resonanceType: ResonanceType.ANCHOR,
  secondaryFocus: null,
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
  rawTraits: RESONANCE_STATS[ResonanceType.ANCHOR],
  progression: {
    walkerRank: 1,
    xp: 0,
    skillPoints: 0,
  },
  affinityXP: {
    [ResonanceType.ANCHOR]: 0,
    [ResonanceType.WHISPERER]: 0,
    [ResonanceType.TACTICIAN]: 0,
    [ResonanceType.NOMAD]: 0,
    [ResonanceType.URBANIST]: 0,
    [ResonanceType.SPECIALIST]: 0,
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
        const { affinityXP, unlockedSkills } = get();
        const { raw, final } = calculateFinalTraits(resonanceType, affinityXP, unlockedSkills);
        set({ resonanceType, rawTraits: raw, traits: final });
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
      
      addXP: (amount, category) => set((state) => {
        const newTotalXP = state.progression.xp + amount;
        const xpPerLevel = 1000;
        const newRank = Math.floor(newTotalXP / xpPerLevel) + 1;
        const rankGained = newRank > state.progression.walkerRank;
        
        const newAffinityXP = { ...state.affinityXP };
        if (category) newAffinityXP[category] += amount;

        const entries = Object.entries(newAffinityXP) as [ResonanceType, number][];
        const sorted = entries.filter(([type]) => type !== state.resonanceType).sort((a, b) => b[1] - a[1]);
        const secondaryFocus = sorted[0][1] > 0 ? sorted[0][0] : null;

        const { raw, final } = calculateFinalTraits(state.resonanceType, newAffinityXP, state.unlockedSkills);

        return {
          progression: {
            ...state.progression,
            xp: newTotalXP,
            walkerRank: newRank,
            skillPoints: state.progression.skillPoints + (rankGained ? 2 : 0)
          },
          affinityXP: newAffinityXP,
          secondaryFocus,
          rawTraits: raw,
          traits: final
        };
      }),

      setHasStrained: (hasStrained) => set({ hasStrained }),
      
      finalizeWalk: () => {
        const { distance, hasStrained, playerStats, progression, traits, dogMetadata, affinityXP, resonanceType, unlockedSkills } = get();
        const baseGrit = Math.floor(distance / 10);
        const bonusGrit = hasStrained ? 0 : Math.floor(baseGrit * 0.5);
        let totalGrit = baseGrit + bonusGrit;
        
        const awarenessMultiplier = 1.0 + (traits.awareness * 0.05);
        totalGrit = Math.floor(totalGrit * awarenessMultiplier);

        const earnedXP = Math.floor(distance * 10);
        
        let category: ResonanceType = ResonanceType.URBANIST; 
        if (dogMetadata.size === DogSize.LARGE) category = ResonanceType.ANCHOR;
        else if (dogMetadata.characteristic === DogCharacteristic.VELCRO) category = ResonanceType.WHISPERER;
        else if (dogMetadata.characteristic === DogCharacteristic.ADHD || dogMetadata.characteristic === DogCharacteristic.PULLER) category = ResonanceType.TACTICIAN;
        else if (dogMetadata.characteristic === DogCharacteristic.SNIFFER) category = ResonanceType.NOMAD;
        else if (dogMetadata.characteristic === DogCharacteristic.REACTIVE) category = ResonanceType.SPECIALIST;

        const newTotalXP = progression.xp + earnedXP;
        const xpPerLevel = 1000;
        const newRank = Math.floor(newTotalXP / xpPerLevel) + 1;
        const rankGained = newRank > progression.walkerRank;

        const newAffinityXP = { ...affinityXP };
        newAffinityXP[category] += earnedXP;

        const entries = Object.entries(newAffinityXP) as [ResonanceType, number][];
        const sorted = entries.filter(([type]) => type !== resonanceType).sort((a, b) => b[1] - a[1]);
        const secondaryFocus = sorted[0][1] > 0 ? sorted[0][0] : null;

        const { raw, final } = calculateFinalTraits(resonanceType, newAffinityXP, unlockedSkills);
        
        set({ 
          sessionGrit: totalGrit,
          totalDistanceWalked: get().totalDistanceWalked + distance,
          playerStats: { ...playerStats, grit: playerStats.grit + totalGrit },
          progression: {
            ...progression,
            xp: newTotalXP,
            walkerRank: newRank,
            skillPoints: progression.skillPoints + (rankGained ? 2 : 0)
          },
          affinityXP: newAffinityXP,
          secondaryFocus,
          rawTraits: raw,
          traits: final
        });
      },

      purchaseSkill: (skillId, gritCost, spCost = 0) => {
        const { playerStats, unlockedSkills, progression, resonanceType, affinityXP } = get();
        if (playerStats.grit >= gritCost && progression.skillPoints >= spCost && !unlockedSkills.includes(skillId)) {
          const newSkills = [...unlockedSkills, skillId];
          const { raw, final } = calculateFinalTraits(resonanceType, affinityXP, newSkills);
          set({
            playerStats: { ...playerStats, grit: playerStats.grit - gritCost },
            progression: { ...progression, skillPoints: progression.skillPoints - spCost },
            unlockedSkills: newSkills,
            rawTraits: raw,
            traits: final
          });
          return true;
        }
        return false;
      },

      respecSkills: (gritCost: number) => {
        const { playerStats, progression, resonanceType, affinityXP } = get();
        if (playerStats.grit < gritCost) return false;
        const newSkills = ['FOUNDATION'];
        const { raw, final } = calculateFinalTraits(resonanceType, affinityXP, newSkills);
        set({
          playerStats: { ...playerStats, grit: playerStats.grit - gritCost },
          progression: { ...progression, skillPoints: progression.skillPoints + (get().unlockedSkills.length - 1) },
          unlockedSkills: newSkills,
          rawTraits: raw,
          traits: final
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
        secondaryFocus: state.secondaryFocus,
        dogMetadata: state.dogMetadata,
        playerStats: state.playerStats,
        dogStats: state.dogStats,
        unlockedSkills: state.unlockedSkills,
        traits: state.traits,
        rawTraits: state.rawTraits,
        progression: state.progression,
        affinityXP: state.affinityXP,
        totalDistanceWalked: state.totalDistanceWalked,
      }),
    }
  )
);
