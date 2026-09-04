import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTimer } from './useTimer';
import { DEFAULT_FOCUS_DURATION_MS, DEFAULT_BREAK_DURATION_MS } from './timerMachine';

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test('starts idle with default durations', async () => {
  const { result } = await renderHook(() => useTimer());
  expect(result.current.phase).toBe('idle');
  expect(result.current.focusDurationMs).toBe(DEFAULT_FOCUS_DURATION_MS);
  expect(result.current.breakDurationMs).toBe(DEFAULT_BREAK_DURATION_MS);
});

test('start() moves to focus and remainingMs counts down on ticks', async () => {
  const { result } = await renderHook(() => useTimer());
  await act(async () => result.current.start());
  expect(result.current.phase).toBe('focus');
  await act(async () => {
    jest.advanceTimersByTime(1000);
  });
  expect(result.current.remainingMs).toBeLessThan(DEFAULT_FOCUS_DURATION_MS);
});

test('onPhaseComplete fires once when a focus phase ends', async () => {
  const onPhaseComplete = jest.fn();
  const { result } = await renderHook(() =>
    useTimer({ onPhaseComplete })
  );
  await act(async () => result.current.setDurations(0.01, 0.01)); // 600ms focus/break, fast test
  await act(async () => result.current.start());
  await act(async () => {
    // TICK_INTERVAL_MS is 250ms, so the completing tick for a 600ms phase
    // lands at +750ms (250 -> 500 -> 750); advance past that boundary.
    jest.advanceTimersByTime(800);
  });
  expect(onPhaseComplete).toHaveBeenCalledWith('focus');
  expect(onPhaseComplete).toHaveBeenCalledTimes(1);
});

test('setDurations persists to AsyncStorage', async () => {
  const { result } = await renderHook(() => useTimer());
  await act(async () => result.current.setDurations(10, 2));
  await act(async () => {
    await Promise.resolve();
  });
  const stored = await AsyncStorage.getItem('loaf-and-focus:durations');
  expect(JSON.parse(stored as string)).toEqual({
    focusDurationMs: 10 * 60_000,
    breakDurationMs: 2 * 60_000,
  });
});

test('reset() returns to idle at the configured focus duration', async () => {
  const { result } = await renderHook(() => useTimer());
  await act(async () => result.current.start());
  await act(async () => {
    jest.advanceTimersByTime(1000);
  });
  await act(async () => result.current.reset());
  expect(result.current.phase).toBe('idle');
  expect(result.current.remainingMs).toBe(DEFAULT_FOCUS_DURATION_MS);
});

test('loads valid persisted durations on mount', async () => {
  await AsyncStorage.setItem(
    'loaf-and-focus:durations',
    JSON.stringify({ focusDurationMs: 10 * 60_000, breakDurationMs: 2 * 60_000 })
  );
  const { result } = await renderHook(() => useTimer());
  await act(async () => {
    await Promise.resolve();
  });
  expect(result.current.focusDurationMs).toBe(10 * 60_000);
  expect(result.current.breakDurationMs).toBe(2 * 60_000);
});

test('ignores corrupt persisted durations and keeps defaults', async () => {
  await AsyncStorage.setItem('loaf-and-focus:durations', 'not valid json{');
  const { result } = await renderHook(() => useTimer());
  await act(async () => {
    await Promise.resolve();
  });
  expect(result.current.focusDurationMs).toBe(DEFAULT_FOCUS_DURATION_MS);
  expect(result.current.breakDurationMs).toBe(DEFAULT_BREAK_DURATION_MS);
});

test('setDurations ignores non-finite or non-positive values', async () => {
  const { result } = await renderHook(() => useTimer());
  await act(async () => {
    result.current.setDurations(NaN, 5);
  });
  expect(result.current.focusDurationMs).toBe(DEFAULT_FOCUS_DURATION_MS);
  await act(async () => {
    result.current.setDurations(0, 5);
  });
  expect(result.current.focusDurationMs).toBe(DEFAULT_FOCUS_DURATION_MS);
});
