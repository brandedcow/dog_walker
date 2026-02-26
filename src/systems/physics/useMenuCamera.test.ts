import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMenuCamera } from './useMenuCamera';
import { PerspectiveCamera } from 'three';
import { useGameStore } from '../../store/useGameStore';
import { MenuState } from '../../types';

// Global to hold the camera for the mock
const testCamera = new PerspectiveCamera();
let frameCallback: any = null;
let currentSize = { width: 1000, height: 1000 };

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn((cb) => {
    frameCallback = cb;
  }),
  useThree: vi.fn(() => ({
    camera: testCamera,
    size: currentSize
  }))
}));

describe('useMenuCamera', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    testCamera.position.set(0, 0, 0);
    testCamera.quaternion.set(0, 0, 0, 1);
    currentSize = { width: 1000, height: 1000 };
    
    useGameStore.setState({ 
      menuState: MenuState.IDLE,
      isMenuReady: false,
      setIsMenuReady: (ready: boolean) => useGameStore.setState({ isMenuReady: ready })
    });
  });

  it('interpolates towards TRAINING target', () => {
    useGameStore.setState({ menuState: MenuState.TRAINING });
    renderHook(() => useMenuCamera());
    
    // TRAINING pos is [0, 4.5 + zOffset, -4]
    // Move camera away
    testCamera.position.set(10, 10, 10);

    act(() => {
      frameCallback({ camera: testCamera, size: currentSize }, 0.1);
    });

    // Should have moved closer to target
    expect(testCamera.position.y).toBeLessThan(10);
    expect(testCamera.position.x).toBeLessThan(10);
  });

  it('applies dynamic zoom on narrow viewports', () => {
    currentSize = { width: 400, height: 800 }; // aspect = 0.5
    useGameStore.setState({ menuState: MenuState.TRAINING });
    
    renderHook(() => useMenuCamera());
    
    act(() => {
      frameCallback({ camera: testCamera, size: currentSize }, 1/60);
    });

    // Base position for TRAINING is [0, 4.5, -4]
    // After one frame of lerp, it should be moving from 0 towards 5.01
    expect(testCamera.position.y).toBeGreaterThan(0.1);
  });
});
