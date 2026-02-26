import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Mock WebGL and ResizeObserver
if (typeof window !== 'undefined') {
  (window as any).ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
}

// Mock PointerEvents (used by R3F and HUD)
if (typeof window !== 'undefined') {
  window.PointerEvent = class PointerEvent extends Event {
    clientX: number = 0;
    clientY: number = 0;
    button: number = 0;
    pointerId: number = 0;
    pointerType: string = 'mouse';
    constructor(type: string, params: any = {}) {
      super(type, params);
      this.clientX = params.clientX || 0;
      this.clientY = params.clientY || 0;
      this.button = params.button || 0;
      this.pointerId = params.pointerId || 0;
      this.pointerType = params.pointerType || 'mouse';
    }
  } as any;
}

// Reset zustand store before each test (optional, but good practice)
// This depends on whether we want persistent state across tests.
// For unit tests, we usually want a fresh state.
import { useGameStore } from '../store/useGameStore';

beforeEach(() => {
  // Reset the store to its initial state
  useGameStore.setState(useGameStore.getState());
});
