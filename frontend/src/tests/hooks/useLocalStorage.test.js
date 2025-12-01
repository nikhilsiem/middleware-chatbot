import { describe, test, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

describe('useLocalStorage Hook Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('should initialize with default value when localStorage is empty', () => {
    localStorage.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useLocalStorage('test_key', 'default'));
    
    expect(result.current[0]).toBe('default');
  });

  test('should initialize with value from localStorage', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify('stored_value'));
    
    const { result } = renderHook(() => useLocalStorage('test_key', 'default'));
    
    expect(result.current[0]).toBe('stored_value');
  });

  test('should update localStorage when value changes', () => {
    localStorage.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useLocalStorage('test_key', 'initial'));
    
    act(() => {
      result.current[1]('updated');
    });
    
    expect(localStorage.setItem).toHaveBeenCalledWith('test_key', JSON.stringify('updated'));
    expect(result.current[0]).toBe('updated');
  });

  test('should handle function updates', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify(5));
    
    const { result } = renderHook(() => useLocalStorage('counter', 0));
    
    act(() => {
      result.current[1](prev => prev + 1);
    });
    
    expect(result.current[0]).toBe(6);
  });

  test('should handle objects', () => {
    const obj = { name: 'test', value: 123 };
    localStorage.getItem.mockReturnValue(JSON.stringify(obj));
    
    const { result } = renderHook(() => useLocalStorage('test_obj', {}));
    
    expect(result.current[0]).toEqual(obj);
  });

  test('should handle arrays', () => {
    const arr = [1, 2, 3];
    localStorage.getItem.mockReturnValue(JSON.stringify(arr));
    
    const { result } = renderHook(() => useLocalStorage('test_arr', []));
    
    expect(result.current[0]).toEqual(arr);
  });

  test('should handle parse errors gracefully', () => {
    localStorage.getItem.mockReturnValue('invalid json{');
    console.error = vi.fn();
    
    const { result } = renderHook(() => useLocalStorage('test_key', 'default'));
    
    expect(result.current[0]).toBe('default');
    expect(console.error).toHaveBeenCalled();
  });

  test('should handle localStorage quota exceeded', () => {
    localStorage.getItem.mockReturnValue(null);
    localStorage.setItem.mockImplementation(() => {
      const error = new Error('QuotaExceededError');
      error.name = 'QuotaExceededError';
      throw error;
    });
    console.error = vi.fn();
    console.warn = vi.fn();
    
    const { result } = renderHook(() => useLocalStorage('test_key', 'value'));
    
    act(() => {
      result.current[1]('new_value');
    });
    
    expect(console.error).toHaveBeenCalled();
  });
});
