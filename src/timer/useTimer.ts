import { useCallback, useEffect, useReducer, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createInitialState,
  timerReducer,
  DEFAULT_FOCUS_DURATION_MS,
  DEFAULT_BREAK_DURATION_MS,
  Phase,
} from './timerMachine';

const STORAGE_KEY = 'loaf-and-focus:durations';
const TICK_INTERVAL_MS = 250;
const COMPLETE_DISPLAY_MS = 2000;

export interface UseTimerResult {
  phase: Phase;
  remainingMs: number;
  isRunning: boolean;
  focusDurationMs: number;
  breakDurationMs: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setDurations: (focusMinutes: number, breakMinutes: number) => void;
}

export function useTimer(options?: {
  onPhaseComplete?: (finishedPhase: 'focus' | 'break') => void;
}): UseTimerResult {
  const [state, dispatch] = useReducer(
    timerReducer,
    createInitialState(DEFAULT_FOCUS_DURATION_MS, DEFAULT_BREAK_DURATION_MS)
  );
  const onPhaseCompleteRef = useRef(options?.onPhaseComplete);
  onPhaseCompleteRef.current = options?.onPhaseComplete;
  const notifiedRef = useRef(false);

  // Load persisted durations once on mount.
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored) return;
        const parsed = JSON.parse(stored) as { focusDurationMs?: unknown; breakDurationMs?: unknown };
        const isValidDuration = (ms: unknown): ms is number =>
          typeof ms === 'number' && Number.isFinite(ms) && ms > 0;
        if (isValidDuration(parsed.focusDurationMs) && isValidDuration(parsed.breakDurationMs)) {
          dispatch({
            type: 'SET_DURATIONS',
            focusDurationMs: parsed.focusDurationMs,
            breakDurationMs: parsed.breakDurationMs,
          });
        }
      } catch (error) {
        console.warn('Failed to load persisted timer durations', error);
      }
    })();
  }, []);

  // Tick loop while running.
  useEffect(() => {
    if (!state.isRunning) return;
    const interval = setInterval(() => {
      dispatch({ type: 'TICK', now: Date.now() });
    }, TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [state.isRunning]);

  // Fire the completion callback once, then auto-advance out of 'complete'.
  useEffect(() => {
    if (state.phase !== 'complete') {
      notifiedRef.current = false;
      return;
    }
    if (!notifiedRef.current) {
      notifiedRef.current = true;
      const finishedPhase = state.nextPhaseAfterComplete === 'break' ? 'focus' : 'break';
      onPhaseCompleteRef.current?.(finishedPhase);
    }
    const timeout = setTimeout(() => {
      dispatch({ type: 'ACKNOWLEDGE_COMPLETE', now: Date.now() });
    }, COMPLETE_DISPLAY_MS);
    return () => clearTimeout(timeout);
  }, [state.phase, state.nextPhaseAfterComplete]);

  const start = useCallback(() => dispatch({ type: 'START', now: Date.now() }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE', now: Date.now() }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
  const setDurations = useCallback((focusMinutes: number, breakMinutes: number) => {
    const focusDurationMs = Math.round(focusMinutes * 60_000);
    const breakDurationMs = Math.round(breakMinutes * 60_000);
    if (
      !Number.isFinite(focusDurationMs) ||
      focusDurationMs <= 0 ||
      !Number.isFinite(breakDurationMs) ||
      breakDurationMs <= 0
    ) {
      return;
    }
    dispatch({ type: 'SET_DURATIONS', focusDurationMs, breakDurationMs });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ focusDurationMs, breakDurationMs }));
  }, []);

  return {
    phase: state.phase,
    remainingMs: state.remainingMs,
    isRunning: state.isRunning,
    focusDurationMs: state.focusDurationMs,
    breakDurationMs: state.breakDurationMs,
    start,
    pause,
    reset,
    setDurations,
  };
}
