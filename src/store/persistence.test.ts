import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './useGameStore';

describe('useGameStore Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    // Re-initialize the store's state
    useGameStore.getState().resetProgress();
  });

  it('serializes progression data to localStorage', () => {
    // Modify long-term progression data
    useGameStore.setState({ 
      playerStats: { strength: 1, grit: 123 },
      unlockedSkills: ['FOUNDATION', 'TEST_SKILL'],
      attributes: { strength: 3, focus: 1, agility: 1, bond: 1, awareness: 1 }
    });

    // Zustand persistence is usually async-ish or triggered on changes
    // We can check if localStorage contains our key
    const savedData = JSON.parse(localStorage.getItem('barking-mad-save') || '{}');
    
    expect(savedData.state.playerStats.grit).toBe(123);
    expect(savedData.state.unlockedSkills).toContain('TEST_SKILL');
    expect(savedData.state.attributes.strength).toBe(3);
    expect(savedData.state.attributes.awareness).toBe(1);
  });

  it('excludes transient session data from localStorage', () => {
    // Modify transient data
    useGameStore.setState({ 
      distance: 500,
      tension: 0.9,
      isMovingForward: true
    });

    const savedData = JSON.parse(localStorage.getItem('barking-mad-save') || '{}');
    
    // These should not exist in the 'state' object because of partialize
    expect(savedData.state.distance).toBeUndefined();
    expect(savedData.state.tension).toBeUndefined();
    expect(savedData.state.isMovingForward).toBeUndefined();
  });
});
