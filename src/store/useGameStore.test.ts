import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './useGameStore';
import { GameState, DogState, MenuState, Race, RACE_STATS } from '../types';

describe('useGameStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const initialState = useGameStore.getState();
    useGameStore.setState({
      ...initialState,
      gameState: GameState.HOME,
      dogState: DogState.STANDING,
      menuState: MenuState.IDLE,
      race: Race.HUMAN,
      tension: 0,
      distance: 0,
      playerStats: { strength: 1, grit: 0 },
      attributes: RACE_STATS[Race.HUMAN],
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
    // Focus 2 multiplier (Human base) = 1.0 + (2 * 0.05) = 1.1
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
      attributes: { strength: 2, focus: 10, agility: 2, bond: 3 }
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
    
    // Strength 2 (Human): threshold = 0.78 + (2 * 0.02) = 0.82
    store.setTension(0.81);
    expect(useGameStore.getState().hasStrained).toBe(false);
    
    store.setTension(0.83);
    expect(useGameStore.getState().hasStrained).toBe(true);

    // Reset and increase Strength
    useGameStore.setState({ hasStrained: false, attributes: { strength: 5, focus: 2, agility: 2, bond: 3 } });
    
    // Strength 5: threshold = 0.78 + (5 * 0.02) = 0.88
    store.setTension(0.85);
    expect(useGameStore.getState().hasStrained).toBe(false);
    
    store.setTension(0.89);
    expect(useGameStore.getState().hasStrained).toBe(true);
  });

  it('manages skill purchases correctly', () => {
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

    success = useGameStore.getState().purchaseSkill('STR_1', 50, 1);
    expect(success).toBe(true);
    
    const finalState = useGameStore.getState();
    expect(finalState.unlockedSkills).toContain('STR_1');
    expect(finalState.playerStats.grit).toBe(450);
    expect(finalState.progression.skillPoints).toBe(4);
    // STR_1 adds +1 Strength: Human Base (2) + STR_1 (1) = 3
    expect(finalState.attributes.strength).toBe(3);
  });

  it('resets progress back to default values', () => {
    const store = useGameStore.getState();
    
    // Set non-default state
    useGameStore.setState({ 
      race: Race.ELF,
      playerStats: { strength: 1, grit: 500 },
      progression: { walkerRank: 10, xp: 9000, skillPoints: 8 },
      unlockedSkills: ['FOUNDATION', 'STR_1', 'AGI_1'],
      attributes: { strength: 5, focus: 5, agility: 5, bond: 5 }
    });

    store.resetProgress();
    
    const finalState = useGameStore.getState();
    expect(finalState.race).toBe(Race.HUMAN);
    expect(finalState.playerStats.grit).toBe(0);
    expect(finalState.progression.walkerRank).toBe(1);
    expect(finalState.unlockedSkills).toEqual(['FOUNDATION']);
    // Human Base Strength is 2
    expect(finalState.attributes.strength).toBe(2);
  });
});
