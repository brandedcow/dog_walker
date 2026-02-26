import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHUDLayout } from './useHUDLayout';

describe('useHUDLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window properties
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 768 });
  });

  it('initializes with current window size', () => {
    const { result } = renderHook(() => useHUDLayout());
    expect(result.current.windowSize.width).toBe(1024);
    expect(result.current.isLargeScreen).toBe(true);
  });

  it('updates when window is resized', () => {
    const { result } = renderHook(() => useHUDLayout());
    
    act(() => {
      window.innerWidth = 500;
      window.innerHeight = 800;
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.windowSize.width).toBe(500);
    expect(result.current.isLargeScreen).toBe(false);
  });

  it('calculates uiScale correctly for large screens', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1200 });
    const { result } = renderHook(() => useHUDLayout());
    
    // isLargeScreen (1200 > 1000)
    // uiScale = min(1.5, 1200 / 1200) = 1.0
    expect(result.current.uiScale).toBe(1.0);

    act(() => {
      window.innerWidth = 1800;
      window.dispatchEvent(new Event('resize'));
    });
    // uiScale = min(1.5, 1800 / 1200) = 1.5
    expect(result.current.uiScale).toBe(1.5);
  });

  it('calculates baseOffset correctly', () => {
    // Large screen (1200)
    // baseOffset = min(60, 20 + (1200 - 1000) * 0.1) = min(60, 20 + 20) = 40
    Object.defineProperty(window, 'innerWidth', { value: 1200 });
    const { result } = renderHook(() => useHUDLayout());
    expect(result.current.baseOffset).toBe(40);

    // Small screen (500)
    act(() => {
      window.innerWidth = 500;
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.baseOffset).toBe(20);
  });

  it('provides safe area strings', () => {
    const { result } = renderHook(() => useHUDLayout());
    expect(result.current.topSafe).toContain('env(safe-area-inset-top');
    expect(result.current.bottomSafe).toContain('env(safe-area-inset-bottom');
  });
});
