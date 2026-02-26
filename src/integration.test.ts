import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStore } from './store/useGameStore';
import { GameState, DogState } from './types';

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
    
    // Base Grit (100/10=10) + Bonus (5) = 15. Focus 1 mult = 15.
    expect(finalState.playerStats.grit).toBeGreaterThan(0);
    expect(finalState.playerStats.grit).toBe(15);
    
    // XP (100 * 10 = 1000). Rank should be 2.
    expect(finalState.progression.xp).toBe(1000);
    expect(finalState.progression.walkerRank).toBe(2);
    expect(finalState.progression.skillPoints).toBe(1);

    // 6. Purchase a Skill
    act(() => {
      const success = finalState.purchaseSkill('SPEED_WALKER', 10, 1);
      expect(success).toBe(true);
    });

    expect(useGameStore.getState().unlockedSkills).toContain('SPEED_WALKER');
    expect(useGameStore.getState().playerStats.grit).toBe(5);
  });
});
