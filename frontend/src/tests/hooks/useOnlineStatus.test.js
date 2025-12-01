import { describe, test, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

describe('useOnlineStatus Hook Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return true when navigator.onLine is true', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
    
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  test('should return false when navigator.onLine is false', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });
    
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
  });

  test('should update when online event fires', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });
    
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
    
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });
      window.dispatchEvent(new Event('online'));
    });
    
    expect(result.current).toBe(true);
  });

  test('should update when offline event fires', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
    
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
    
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      window.dispatchEvent(new Event('offline'));
    });
    
    expect(result.current).toBe(false);
  });

  test('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => useOnlineStatus());
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
  });
});
