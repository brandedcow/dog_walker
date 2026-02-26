import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './useGameStore';
import { GameState, DogState, MenuState, AffinityType, AFFINITY_STATS } from '../types';

describe('useGameStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const initialState = useGameStore.getState();
    useGameStore.setState({
      ...initialState,
      gameState: GameState.HOME,
      dogState: DogState.STANDING,
      menuState: MenuState.IDLE,
      affinityType: AffinityType.ANCHOR,
      tension: 0,
      distance: 0,
      playerStats: { strength: 1, grit: 0 },
      attributes: AFFINITY_STATS[AffinityType.ANCHOR],
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
    // Total Grit (before focus) = 15
    // Focus 2 multiplier (Anchor base) = 1.0 + (2 * 0.05) = 1.1
    // Total Grit = floor(15 * 1.1) = 16
    expect(updatedState.playerStats.grit).toBe(16);
    
    // XP = distance * 10 = 100 * 10 = 1000
    // Rank should level up (Initial 0 + 1000 = 1000, floor(1000/1000) + 1 = 2)
    // Skill Points should be 2 (2 SP per rank gain)
    expect(updatedState.progression.xp).toBe(1000);
    expect(updatedState.progression.walkerRank).toBe(2);
    expect(updatedState.progression.skillPoints).toBe(2);
  });

  it('scales Grit reward based on Focus attribute', () => {
    const store = useGameStore.getState();
    
    // Set high Focus (Level 10)
    useGameStore.setState({ 
      distance: 100, 
      hasStrained: false,
      attributes: { strength: 4, focus: 10, agility: 1, bond: 2, awareness: 1 }
    });
    
    store.finalizeWalk();

    const updatedState = useGameStore.getState();
    
    // Base + Bonus = 15
    // Focus 10 multiplier = 1.0 + (10 * 0.05) = 1.5
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
    useGameStore.setState({ hasStrained: false, attributes: { strength: 8, focus: 2, agility: 1, bond: 2, awareness: 1 } });
    
    // Strength 8: threshold = 0.78 + (8 * 0.02) = 0.94
    store.setTension(0.93);
    expect(useGameStore.getState().hasStrained).toBe(false);
    
    store.setTension(0.95);
    expect(useGameStore.getState().hasStrained).toBe(true);
  });

  it('manages skill purchases correctly with efficiency', () => {
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

    // Anchor player buying Anchor skill (Efficiency 100%)
    success = useGameStore.getState().purchaseSkill('STR_1', 50, 1);
    expect(success).toBe(true);
    
    const intermediateState = useGameStore.getState();
    expect(intermediateState.unlockedSkills).toContain('STR_1');
    // STR_1 adds +1 Strength: Anchor Base (4) + STR_1 (1) = 5
    expect(intermediateState.attributes.strength).toBe(5);

    // Anchor player buying Nomad skill (Opposite of Anchor is Nomad in some interpretations, 
    // but in our order: Anchor (0), Whisperer (1), Tactician (2), Nomad (3) -> distance 3 = 40% efficiency)
    success = useGameStore.getState().purchaseSkill('AGI_1', 50, 1);
    expect(success).toBe(true);
    
    const finalState = useGameStore.getState();
    // AGI_1 adds +1 Agility: Anchor Base (1) + (1 * 0.4 efficiency) = 1.4
    expect(finalState.attributes.agility).toBe(1.4);
  });

  it('resets progress back to default values', () => {
    const store = useGameStore.getState();
    
    // Set non-default state
    useGameStore.setState({ 
      affinityType: AffinityType.NOMAD,
      playerStats: { strength: 1, grit: 500 },
      progression: { walkerRank: 10, xp: 9000, skillPoints: 8 },
      unlockedSkills: ['FOUNDATION', 'STR_1', 'AGI_1'],
      attributes: { strength: 5, focus: 5, agility: 5, bond: 5, awareness: 5 }
    });

    store.resetProgress();
    
    const finalState = useGameStore.getState();
    expect(finalState.affinityType).toBe(AffinityType.ANCHOR);
    expect(finalState.playerStats.grit).toBe(0);
    expect(finalState.progression.walkerRank).toBe(1);
    expect(finalState.unlockedSkills).toEqual(['FOUNDATION']);
    // Anchor Base Strength is 4
    expect(finalState.attributes.strength).toBe(4);
  });
});
