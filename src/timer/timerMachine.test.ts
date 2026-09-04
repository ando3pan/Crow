import {
  createInitialState,
  timerReducer,
  DEFAULT_FOCUS_DURATION_MS,
  DEFAULT_BREAK_DURATION_MS,
} from './timerMachine';

const T0 = 1_000_000;

describe('timerReducer', () => {
  test('START from idle begins a focus phase ending at now + focusDurationMs', () => {
    const state = createInitialState(DEFAULT_FOCUS_DURATION_MS, DEFAULT_BREAK_DURATION_MS);
    const next = timerReducer(state, { type: 'START', now: T0 });
    expect(next.phase).toBe('focus');
    expect(next.isRunning).toBe(true);
    expect(next.endAt).toBe(T0 + DEFAULT_FOCUS_DURATION_MS);
    expect(next.remainingMs).toBe(DEFAULT_FOCUS_DURATION_MS);
  });

  test('PAUSE mid-focus freezes remainingMs and clears endAt', () => {
    let state = createInitialState(DEFAULT_FOCUS_DURATION_MS, DEFAULT_BREAK_DURATION_MS);
    state = timerReducer(state, { type: 'START', now: T0 });
    state = timerReducer(state, { type: 'TICK', now: T0 + 60_000 });
    const paused = timerReducer(state, { type: 'PAUSE', now: T0 + 60_000 });
    expect(paused.isRunning).toBe(false);
    expect(paused.endAt).toBeNull();
    expect(paused.remainingMs).toBe(DEFAULT_FOCUS_DURATION_MS - 60_000);
  });

  test('START while paused resumes from remainingMs', () => {
    let state = createInitialState(DEFAULT_FOCUS_DURATION_MS, DEFAULT_BREAK_DURATION_MS);
    state = timerReducer(state, { type: 'START', now: T0 });
    state = timerReducer(state, { type: 'TICK', now: T0 + 60_000 });
    state = timerReducer(state, { type: 'PAUSE', now: T0 + 60_000 });
    const resumed = timerReducer(state, { type: 'START', now: T0 + 90_000 });
    expect(resumed.isRunning).toBe(true);
    expect(resumed.endAt).toBe(T0 + 90_000 + (DEFAULT_FOCUS_DURATION_MS - 60_000));
  });

  test('TICK past focus end moves to complete with nextPhaseAfterComplete = break', () => {
    let state = createInitialState(DEFAULT_FOCUS_DURATION_MS, DEFAULT_BREAK_DURATION_MS);
    state = timerReducer(state, { type: 'START', now: T0 });
    const finished = timerReducer(state, { type: 'TICK', now: T0 + DEFAULT_FOCUS_DURATION_MS + 1 });
    expect(finished.phase).toBe('complete');
    expect(finished.isRunning).toBe(false);
    expect(finished.remainingMs).toBe(0);
    expect(finished.nextPhaseAfterComplete).toBe('break');
  });

  test('ACKNOWLEDGE_COMPLETE after focus starts a running break phase', () => {
    let state = createInitialState(DEFAULT_FOCUS_DURATION_MS, DEFAULT_BREAK_DURATION_MS);
    state = timerReducer(state, { type: 'START', now: T0 });
    state = timerReducer(state, { type: 'TICK', now: T0 + DEFAULT_FOCUS_DURATION_MS + 1 });
    const onBreak = timerReducer(state, { type: 'ACKNOWLEDGE_COMPLETE', now: T0 + DEFAULT_FOCUS_DURATION_MS + 500 });
    expect(onBreak.phase).toBe('break');
    expect(onBreak.isRunning).toBe(true);
    expect(onBreak.endAt).toBe(T0 + DEFAULT_FOCUS_DURATION_MS + 500 + DEFAULT_BREAK_DURATION_MS);
  });

  test('TICK past break end then ACKNOWLEDGE_COMPLETE returns to idle', () => {
    let state = createInitialState(DEFAULT_FOCUS_DURATION_MS, DEFAULT_BREAK_DURATION_MS);
    state = timerReducer(state, { type: 'START', now: T0 });
    state = timerReducer(state, { type: 'TICK', now: T0 + DEFAULT_FOCUS_DURATION_MS + 1 });
    state = timerReducer(state, { type: 'ACKNOWLEDGE_COMPLETE', now: T0 + DEFAULT_FOCUS_DURATION_MS + 500 });
    const breakEnd = T0 + DEFAULT_FOCUS_DURATION_MS + 500 + DEFAULT_BREAK_DURATION_MS;
    state = timerReducer(state, { type: 'TICK', now: breakEnd + 1 });
    expect(state.phase).toBe('complete');
    expect(state.nextPhaseAfterComplete).toBe('idle');
    const idle = timerReducer(state, { type: 'ACKNOWLEDGE_COMPLETE', now: breakEnd + 500 });
    expect(idle.phase).toBe('idle');
    expect(idle.isRunning).toBe(false);
    expect(idle.remainingMs).toBe(DEFAULT_FOCUS_DURATION_MS);
  });

  test('RESET from any state returns to idle at full focus duration', () => {
    let state = createInitialState(DEFAULT_FOCUS_DURATION_MS, DEFAULT_BREAK_DURATION_MS);
    state = timerReducer(state, { type: 'START', now: T0 });
    state = timerReducer(state, { type: 'TICK', now: T0 + 60_000 });
    const reset = timerReducer(state, { type: 'RESET' });
    expect(reset.phase).toBe('idle');
    expect(reset.isRunning).toBe(false);
    expect(reset.endAt).toBeNull();
    expect(reset.remainingMs).toBe(DEFAULT_FOCUS_DURATION_MS);
  });

  test('SET_DURATIONS while idle updates remainingMs to the new focus duration', () => {
    const state = createInitialState(DEFAULT_FOCUS_DURATION_MS, DEFAULT_BREAK_DURATION_MS);
    const updated = timerReducer(state, {
      type: 'SET_DURATIONS',
      focusDurationMs: 10 * 60_000,
      breakDurationMs: 2 * 60_000,
    });
    expect(updated.focusDurationMs).toBe(10 * 60_000);
    expect(updated.breakDurationMs).toBe(2 * 60_000);
    expect(updated.remainingMs).toBe(10 * 60_000);
  });
});
