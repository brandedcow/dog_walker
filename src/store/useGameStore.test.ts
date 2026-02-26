import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './useGameStore';
import { GameState, DogState, MenuState, ResonanceType, RESONANCE_STATS } from '../types';

describe('useGameStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const initialState = useGameStore.getState();
    useGameStore.setState({
      ...initialState,
      gameState: GameState.HOME,
      dogState: DogState.STANDING,
      menuState: MenuState.IDLE,
      resonanceType: ResonanceType.ANCHOR,
      tension: 0,
      distance: 0,
      playerStats: { strength: 1, grit: 0 },
      traits: RESONANCE_STATS[ResonanceType.ANCHOR],
      progression: { walkerRank: 1, xp: 0, skillPoints: 0 },
      unlockedSkills: ['FOUNDATION'],
      hasStrained: false,
    });
  });

  it('correctly calculates Grit and XP upon walk finalization', () => {
    const store = useGameStore.getState();
    
    // Simulate a 100m walk with no strain
    useGameStore.setState({ distance: 100, hasStrained: false });
    store.finalizeWalk();

    const updatedState = useGameStore.getState();
    
    // Base Grit = distance / 10 = 10
    // Bonus Grit = 10 * 0.5 = 5 (No strain)
    // Total Grit (before awareness) = 15
    // Awareness 1 multiplier (Anchor base) = 1.0 + (1 * 0.05) = 1.05
    // Total Grit = floor(15 * 1.05) = 15
    expect(updatedState.playerStats.grit).toBe(15);
    
    // XP = distance * 10 = 100 * 10 = 1000
    // Rank should level up (Initial 0 + 1000 = 1000, floor(1000/1000) + 1 = 2)
    // Skill Points should be 2 (2 SP per rank gain)
    expect(updatedState.progression.xp).toBe(1000);
    expect(updatedState.progression.walkerRank).toBe(2);
    expect(updatedState.progression.skillPoints).toBe(2);
  });

  it('scales Grit reward based on Awareness trait', () => {
    const store = useGameStore.getState();
    
    // Set high Awareness (Level 10)
    useGameStore.setState({ 
      distance: 100, 
      hasStrained: false,
      traits: { strength: 4, bond: 2, focus: 2, awareness: 10, speed: 1, mastery: 1 }
    });
    
    store.finalizeWalk();

    const updatedState = useGameStore.getState();
    
    // Base + Bonus = 15
    // Awareness 10 multiplier = 1.0 + (10 * 0.05) = 1.5
    // Total Grit = floor(15 * 1.5) = 22
    expect(updatedState.playerStats.grit).toBe(22);
  });

  it('correctly handles leash strain threshold based on Strength', () => {
    const store = useGameStore.getState();
    
    // Strength 4 (Anchor): threshold = 0.78 + (4 * 0.02) = 0.86
    store.setTension(0.85);
    expect(useGameStore.getState().hasStrained).toBe(false);
    
    store.setTension(0.87);
    expect(useGameStore.getState().hasStrained).toBe(true);

    // Reset and increase Strength
    useGameStore.setState({ hasStrained: false, traits: { strength: 8, bond: 2, focus: 2, awareness: 2, speed: 1, mastery: 1 } });
    
    // Strength 8: threshold = 0.78 + (8 * 0.02) = 0.94
    store.setTension(0.93);
    expect(useGameStore.getState().hasStrained).toBe(false);
    
    store.setTension(0.95);
    expect(useGameStore.getState().hasStrained).toBe(true);
  });

  it('manages skill purchases correctly with potency', () => {
    const store = useGameStore.getState();
    
    // Initial state: 0 Grit, 0 SP
    let success = store.purchaseSkill('STR_1', 50, 1);
    expect(success).toBe(false);
    expect(useGameStore.getState().unlockedSkills).not.toContain('STR_1');

    // Grant resources
    useGameStore.setState({ 
      playerStats: { strength: 1, grit: 500 },
      progression: { walkerRank: 5, xp: 5000, skillPoints: 5 }
    });

    // Anchor player buying Anchor skill (Potency 100%)
    success = useGameStore.getState().purchaseSkill('STR_1', 50, 1);
    expect(success).toBe(true);
    
    const intermediateState = useGameStore.getState();
    expect(intermediateState.unlockedSkills).toContain('STR_1');
    // STR_1 adds +1 Strength: Anchor Base (4) + STR_1 (1) = 5
    expect(intermediateState.traits.strength).toBe(5);

    // Anchor player buying Nomad skill (Distance 3 = 40% potency)
    success = useGameStore.getState().purchaseSkill('SPD_1', 50, 1);
    expect(success).toBe(true);
    
    const finalState = useGameStore.getState();
    // SPD_1 adds +1 Speed: Anchor Base (1) + 1 skill = 2 raw. 2 * 0.4 potency = 0.8
    expect(finalState.traits.speed).toBe(0.8);
  });

  it('resets progress back to default values', () => {
    const store = useGameStore.getState();
    
    // Set non-default state
    useGameStore.setState({ 
      resonanceType: ResonanceType.NOMAD,
      playerStats: { strength: 1, grit: 500 },
      progression: { walkerRank: 10, xp: 9000, skillPoints: 8 },
      unlockedSkills: ['FOUNDATION', 'STR_1', 'SPD_1'],
      traits: { strength: 5, bond: 5, focus: 5, awareness: 5, speed: 5, mastery: 5 }
    });

    store.resetProgress();
    
    const finalState = useGameStore.getState();
    expect(finalState.resonanceType).toBe(ResonanceType.ANCHOR);
    expect(finalState.playerStats.grit).toBe(0);
    expect(finalState.progression.walkerRank).toBe(1);
    expect(finalState.unlockedSkills).toEqual(['FOUNDATION']);
    // Anchor Base Strength is 4
    expect(finalState.traits.strength).toBe(4);
  });
});
