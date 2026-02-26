import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/useGameStore';
import { GameState, DogState, MenuState } from '../types';

describe('useGameStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const initialState = useGameStore.getState();
    useGameStore.setState({
      ...initialState,
      gameState: GameState.HOME,
      dogState: DogState.STANDING,
      menuState: MenuState.IDLE,
      tension: 0,
      distance: 0,
      playerStats: { strength: 1, grit: 0 },
      attributes: { strength: 1, focus: 1, agility: 1, bond: 1 },
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
    // Focus 1 multiplier = 1.0 + (1 * 0.05) = 1.05
    // Total Grit = floor(15 * 1.05) = 15
    expect(updatedState.playerStats.grit).toBe(15);
    
    // XP = distance * 10 = 100 * 10 = 1000
    // Rank should level up (Initial 0 + 1000 = 1000, floor(1000/1000) + 1 = 2)
    expect(updatedState.progression.xp).toBe(1000);
    expect(updatedState.progression.walkerRank).toBe(2);
    expect(updatedState.progression.skillPoints).toBe(1);
  });

  it('scales Grit reward based on Focus attribute', () => {
    const store = useGameStore.getState();
    
    // Set high Focus (Level 10)
    useGameStore.setState({ 
      distance: 100, 
      hasStrained: false,
      attributes: { strength: 1, focus: 10, agility: 1, bond: 1 }
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
    
    // Strength 1: threshold = 0.78 + (1 * 0.02) = 0.8
    store.setTension(0.79);
    expect(useGameStore.getState().hasStrained).toBe(false);
    
    store.setTension(0.81);
    expect(useGameStore.getState().hasStrained).toBe(true);

    // Reset and increase Strength
    useGameStore.setState({ hasStrained: false, attributes: { strength: 5, focus: 1, agility: 1, bond: 1 } });
    
    // Strength 5: threshold = 0.78 + (5 * 0.02) = 0.88
    store.setTension(0.85);
    expect(useGameStore.getState().hasStrained).toBe(false);
    
    store.setTension(0.89);
    expect(useGameStore.getState().hasStrained).toBe(true);
  });

  it('manages skill purchases correctly', () => {
    const store = useGameStore.getState();
    
    // Initial state: 0 Grit, 0 SP
    let success = store.purchaseSkill('SPEED_WALKER', 10, 1);
    expect(success).toBe(false);
    expect(useGameStore.getState().unlockedSkills).not.toContain('SPEED_WALKER');

    // Grant resources
    useGameStore.setState({ 
      playerStats: { strength: 1, grit: 50 },
      progression: { walkerRank: 5, xp: 5000, skillPoints: 5 }
    });

    success = useGameStore.getState().purchaseSkill('SPEED_WALKER', 10, 1);
    expect(success).toBe(true);
    
    const finalState = useGameStore.getState();
    expect(finalState.unlockedSkills).toContain('SPEED_WALKER');
    expect(finalState.playerStats.grit).toBe(40);
    expect(finalState.progression.skillPoints).toBe(4);
  });

  it('resets progress back to default values', () => {
    const store = useGameStore.getState();
    
    // Set non-default state
    useGameStore.setState({ 
      playerStats: { strength: 1, grit: 500 },
      progression: { walkerRank: 10, xp: 9000, skillPoints: 8 },
      unlockedSkills: ['FOUNDATION', 'SPEED_WALKER', 'GRIT_FOCUS'],
      attributes: { strength: 5, focus: 5, agility: 5, bond: 5 }
    });

    store.resetProgress();
    
    const finalState = useGameStore.getState();
    expect(finalState.playerStats.grit).toBe(0);
    expect(finalState.progression.walkerRank).toBe(1);
    expect(finalState.unlockedSkills).toEqual(['FOUNDATION']);
    expect(finalState.attributes.strength).toBe(1);
  });
});
