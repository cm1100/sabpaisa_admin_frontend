import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    expect(result.current).toBe('initial');

    // Change the value
    rerender({ value: 'updated', delay: 500 });
    
    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time by 500ms
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Now the value should be updated
    expect(result.current).toBe('updated');
  });

  it('should cancel previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    // Rapid changes
    rerender({ value: 'first', delay: 500 });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    rerender({ value: 'second', delay: 500 });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    rerender({ value: 'third', delay: 500 });
    
    // Still should be initial
    expect(result.current).toBe('initial');

    // Complete the delay
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should have the last value
    expect(result.current).toBe('third');
  });

  it('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 1000 },
      }
    );

    rerender({ value: 'updated', delay: 1000 });

    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Should still be initial after 500ms
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Should be updated after 1000ms total
    expect(result.current).toBe('updated');
  });

  it('should work with different data types', () => {
    // Number
    const { result: numberResult } = renderHook(() => useDebounce(42, 500));
    expect(numberResult.current).toBe(42);

    // Object
    const obj = { key: 'value' };
    const { result: objectResult } = renderHook(() => useDebounce(obj, 500));
    expect(objectResult.current).toBe(obj);

    // Array
    const arr = [1, 2, 3];
    const { result: arrayResult } = renderHook(() => useDebounce(arr, 500));
    expect(arrayResult.current).toBe(arr);
  });
});