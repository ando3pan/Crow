export type Phase = 'idle' | 'focus' | 'break' | 'complete';

export interface TimerState {
  phase: Phase;
  remainingMs: number;
  endAt: number | null;
  isRunning: boolean;
  focusDurationMs: number;
  breakDurationMs: number;
  nextPhaseAfterComplete: 'break' | 'idle' | null;
}

export type TimerAction =
  | { type: 'START'; now: number }
  | { type: 'PAUSE'; now: number }
  | { type: 'RESET' }
  | { type: 'TICK'; now: number }
  | { type: 'ACKNOWLEDGE_COMPLETE'; now: number }
  | { type: 'SET_DURATIONS'; focusDurationMs: number; breakDurationMs: number };

export const DEFAULT_FOCUS_DURATION_MS = 25 * 60 * 1000;
export const DEFAULT_BREAK_DURATION_MS = 5 * 60 * 1000;

export function createInitialState(focusDurationMs: number, breakDurationMs: number): TimerState {
  return {
    phase: 'idle',
    remainingMs: focusDurationMs,
    endAt: null,
    isRunning: false,
    focusDurationMs,
    breakDurationMs,
    nextPhaseAfterComplete: null,
  };
}

export function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START': {
      if (state.isRunning) return state;
      if (state.phase === 'idle') {
        return {
          ...state,
          phase: 'focus',
          isRunning: true,
          remainingMs: state.focusDurationMs,
          endAt: action.now + state.focusDurationMs,
        };
      }
      if (state.phase === 'focus' || state.phase === 'break') {
        return {
          ...state,
          isRunning: true,
          endAt: action.now + state.remainingMs,
        };
      }
      return state;
    }

    case 'PAUSE': {
      if (!state.isRunning || state.endAt === null) return state;
      const remainingMs = Math.max(0, state.endAt - action.now);
      return { ...state, isRunning: false, endAt: null, remainingMs };
    }

    case 'TICK': {
      if (!state.isRunning || state.endAt === null) return state;
      if (action.now < state.endAt) {
        return { ...state, remainingMs: state.endAt - action.now };
      }
      const nextPhaseAfterComplete: 'break' | 'idle' = state.phase === 'focus' ? 'break' : 'idle';
      return {
        ...state,
        phase: 'complete',
        isRunning: false,
        endAt: null,
        remainingMs: 0,
        nextPhaseAfterComplete,
      };
    }

    case 'ACKNOWLEDGE_COMPLETE': {
      if (state.phase !== 'complete') return state;
      if (state.nextPhaseAfterComplete === 'break') {
        return {
          ...state,
          phase: 'break',
          isRunning: true,
          endAt: action.now + state.breakDurationMs,
          remainingMs: state.breakDurationMs,
          nextPhaseAfterComplete: null,
        };
      }
      return {
        ...state,
        phase: 'idle',
        isRunning: false,
        endAt: null,
        remainingMs: state.focusDurationMs,
        nextPhaseAfterComplete: null,
      };
    }

    case 'RESET': {
      return createInitialState(state.focusDurationMs, state.breakDurationMs);
    }

    case 'SET_DURATIONS': {
      const next = {
        ...state,
        focusDurationMs: action.focusDurationMs,
        breakDurationMs: action.breakDurationMs,
      };
      if (state.phase === 'idle') {
        next.remainingMs = action.focusDurationMs;
      }
      return next;
    }

    default:
      return state;
  }
}
