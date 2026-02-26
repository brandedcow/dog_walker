import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDogAI } from './useDogAI';
import { Vector3 } from 'three';
import { DogState } from '../../types';

describe('useDogAI', () => {
  const playerPos = new Vector3(0, 0, 0);
  const delta = 1/60;

  it('initializes dog position and state correctly', () => {
    const { result } = renderHook(() => useDogAI());
    expect(result.current.dogPos.current).toBeInstanceOf(Vector3);
    expect(result.current.dogDistance.current).toBe(0);
  });

  it('transitions from STANDING to IDLING after stationary time threshold', () => {
    const { result } = renderHook(() => useDogAI());
    const setDogState = vi.fn();
    
    // Simulate 5.1 seconds of standing
    act(() => {
      for (let i = 0; i < 60 * 5.1; i++) {
        result.current.update(delta, playerPos, DogState.STANDING, setDogState);
      }
    });

    expect(setDogState).toHaveBeenCalledWith(DogState.IDLING);
  });

  it('moves toward player in COMING state and respects BOND attribute', () => {
    const { result } = renderHook(() => useDogAI());
    const setDogState = vi.fn();
    
    // Initial dog pos is (1, 0, 2), distance to player (0,0,0) is ~2.23m
    // With BOND 1: recallSpeed = 12 + 1.5 = 13.5
    // With BOND 10: recallSpeed = 12 + 15 = 27
    
    const initialPos = result.current.dogPos.current.clone();
    
    act(() => {
      result.current.update(delta, playerPos, DogState.COMING, setDogState, [], { strength: 1, focus: 1, agility: 1, bond: 1, awareness: 1 });
    });
    
    const moveDist1 = initialPos.distanceTo(result.current.dogPos.current);

    // Reset and try with BOND 10
    result.current.dogPos.current.copy(initialPos);
    act(() => {
      result.current.update(delta, playerPos, DogState.COMING, setDogState, [], { strength: 1, focus: 1, agility: 1, bond: 10, awareness: 1 });
    });
    
    const moveDist10 = initialPos.distanceTo(result.current.dogPos.current);
    expect(moveDist10).toBeGreaterThan(moveDist1);
  });

  it('calculates rotation based on displacement', () => {
    const { result } = renderHook(() => useDogAI());
    const setDogState = vi.fn();
    
    // Set dog at origin and move it to (1, 0, 0)
    result.current.dogPos.current.set(0, 0, 0);
    act(() => {
      result.current.startWalking(Math.PI / 2); // Facing +X
      result.current.update(delta, playerPos, DogState.WALKING, setDogState);
    });

    // Rotation should move towards targetRot (Math.atan2(1, 0) = PI/2)
    expect(result.current.currentRotation.current).toBeGreaterThan(0);
  });

  it('respects furniture collision zones', () => {
    const { result } = renderHook(() => useDogAI());
    const setDogState = vi.fn();
    
    // Desk Area: { minX: -3.5, maxX: -0.5, minZ: -4.0, maxZ: -2.5 }
    // Place dog near desk and try to move into it via IDLING
    result.current.dogPos.current.set(-0.4, 0, -3.0);
    
    act(() => {
      // Simulate IDLING which rolls targets and moves
      for (let i = 0; i < 100; i++) {
        result.current.update(delta, playerPos, DogState.IDLING, setDogState);
      }
    });

    // Dog should not be inside the desk zone
    const p = result.current.dogPos.current;
    const inDesk = p.x >= -3.5 && p.x <= -0.5 && p.z >= -4.0 && p.z <= -2.5;
    expect(inDesk).toBe(false);
  });

  it('respects room boundaries', () => {
    const { result } = renderHook(() => useDogAI());
    const setDogState = vi.fn();
    
    // Place dog at edge and force movement out
    result.current.dogPos.current.set(4.4, 0, 0);
    
    act(() => {
      // Simulate IDLING movement
      for (let i = 0; i < 100; i++) {
        result.current.update(delta, playerPos, DogState.IDLING, setDogState);
      }
    });

    expect(result.current.dogPos.current.x).toBeLessThanOrEqual(4.5);
    expect(result.current.dogPos.current.x).toBeGreaterThanOrEqual(-4.5);
  });
});
