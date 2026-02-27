import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLeash } from './useLeash';
import { Vector3 } from 'three';
import { MAX_LEASH_LENGTH, LEASH_NODES } from '../../config/constants';

describe('useLeash', () => {
  const playerPos = new Vector3(0, 0, 0);
  const dogPos = new Vector3(0, 0, 5); // 5m away
  const dogRotation = 0;
  const delta = 1/60;

  it('initializes nodes correctly', () => {
    const { result } = renderHook(() => useLeash());
    expect(result.current.nodes.current.length).toBe(LEASH_NODES);
    expect(result.current.nodes.current[0]).toBeInstanceOf(Vector3);
  });

  it('updates node positions based on player and dog movement', () => {
    const { result } = renderHook(() => useLeash());
    
    act(() => {
      result.current.update(delta, playerPos, dogPos, dogRotation);
    });

    const handPos = playerPos.clone().add(new Vector3(0.8, -1.2, -0.5));
    // Check if the first node is pinned to the hand position
    expect(result.current.nodes.current[0].x).toBeCloseTo(handPos.x);
    expect(result.current.nodes.current[0].y).toBeCloseTo(handPos.y);
    expect(result.current.nodes.current[0].z).toBeCloseTo(handPos.z);
  });

  it('calculates tension correctly based on distance', () => {
    const { result } = renderHook(() => useLeash());
    
    // Very close: tension should be 0
    let tensionData: any;
    act(() => {
      tensionData = result.current.update(delta, playerPos, new Vector3(0, 0, 1), dogRotation);
    });
    expect(tensionData?.rawTension).toBe(0);

    // At 50% max distance
    act(() => {
      tensionData = result.current.update(delta, playerPos, new Vector3(0, 0, MAX_LEASH_LENGTH / 2), dogRotation);
    });
    expect(tensionData?.rawTension).toBeGreaterThan(0);
    expect(tensionData?.rawTension).toBeLessThan(1);

    // At max distance
    act(() => {
      tensionData = result.current.update(delta, playerPos, new Vector3(0, 0, MAX_LEASH_LENGTH), dogRotation);
    });
    expect(tensionData?.rawTension).toBe(1);
  });

  it('enforces MAX_LEASH_LENGTH on dog position', () => {
    const { result } = renderHook(() => useLeash());
    const farDogPos = new Vector3(0, 0, MAX_LEASH_LENGTH + 5); // 5m past limit
    
    act(() => {
      result.current.update(delta, playerPos, farDogPos, dogRotation);
    });

    const distance = playerPos.distanceTo(farDogPos);
    expect(distance).toBeLessThanOrEqual(MAX_LEASH_LENGTH + 0.01);
  });

  it('applies tug recoil and reduces tension', () => {
    const { result } = renderHook(() => useLeash());
    
    act(() => {
      result.current.applyTug();
      // First update to initialize physics state
      result.current.update(delta, playerPos, new Vector3(0, 0, MAX_LEASH_LENGTH), dogRotation);
    });

    expect(result.current.tugRecoil.current).toBeGreaterThan(0);
    
    // With recoil, tension should be reduced relative to raw tension
    const updateResult = result.current.update(delta, playerPos, new Vector3(0, 0, MAX_LEASH_LENGTH), dogRotation);
    expect(updateResult.tension).toBeLessThan(updateResult.rawTension);
    expect(updateResult.tension).toBeGreaterThanOrEqual(0);
  });

  it('prevents NaN propagation (Input Safety)', () => {
    const { result } = renderHook(() => useLeash());
    const nanPos = new Vector3(NaN, 0, 0);
    
    act(() => {
      result.current.update(delta, nanPos, dogPos, dogRotation);
    });

    const n = result.current.nodes.current;
    expect(n[0].x).toBeDefined();
  });
});
