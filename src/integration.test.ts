import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useGameStore } from './store/useGameStore';
import { GameState, ResonanceType, RESONANCE_STATS } from './types';

describe('Golden Path Integration', () => {
  beforeEach(() => {
    // Reset store to initial state
    const initialState = useGameStore.getState();
    useGameStore.setState({
      ...initialState,
      gameState: GameState.HOME,
      playerStats: { strength: 1, grit: 0 },
      progression: { walkerRank: 1, xp: 0, skillPoints: 0 },
      distance: 0,
      resonanceType: ResonanceType.ANCHOR,
      traits: RESONANCE_STATS[ResonanceType.ANCHOR],
      unlockedSkills: ['FOUNDATION'],
    });
  });

  it('completes a full walk loop and awards Grit/XP', () => {
    const store = useGameStore.getState();

    // 1. Initial State
    expect(store.gameState).toBe(GameState.HOME);
    expect(store.playerStats.grit).toBe(0);

    // 2. Start Walk
    act(() => {
      store.setGameState(GameState.PLAYING);
    });
    expect(useGameStore.getState().gameState).toBe(GameState.PLAYING);

    // 3. Simulate Walking
    act(() => {
      useGameStore.setState({ distance: 100 }); // 100m walk
    });
    expect(useGameStore.getState().distance).toBe(100);

    // 4. Return Home (Finalize)
    act(() => {
      useGameStore.getState().finalizeWalk();
      useGameStore.getState().setGameState(GameState.HOME);
    });

    // 5. Verify Rewards
    const finalState = useGameStore.getState();
    expect(finalState.gameState).toBe(GameState.HOME);
    
    // Base Grit (100/10=10) + Bonus (5) = 15. 
    // Anchor Awareness is 1. Multiplier = 1.0 + (1 * 0.05) = 1.05
    // Total Grit = floor(15 * 1.05) = 15
    expect(finalState.playerStats.grit).toBe(15);
    
    // XP (100 * 10 = 1000). Rank should be 2.
    expect(finalState.progression.xp).toBe(1000);
    expect(finalState.progression.walkerRank).toBe(2);
    expect(finalState.progression.skillPoints).toBe(2);

    // 6. Purchase a Skill
    act(() => {
      // STR_1 costs 50 Grit and 1 SP
      // Wait, we only have 15 Grit! Need to give more grit to test purchase.
      useGameStore.setState({ playerStats: { strength: 1, grit: 100 } });
    });

    act(() => {
      const success = useGameStore.getState().purchaseSkill('STR_1', 50, 1);
      expect(success).toBe(true);
    });

    expect(useGameStore.getState().unlockedSkills).toContain('STR_1');
    expect(useGameStore.getState().playerStats.grit).toBe(50);
  });
});
