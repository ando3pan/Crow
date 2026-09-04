# Loaf & Focus — Design Spec

Date: 2026-09-04

## Overview

A single-screen mobile Pomodoro timer where a crow companion embodies the
current timer phase instead of showing a plain progress bar. Local-only app:
no accounts, no task list, no backend. Open the app, pick a duration, watch
the crow.

## Screens

One main screen:

- Large timer display (MM:SS), with the crow illustration filling most of
  the screen above/behind it.
- Start / Pause / Reset controls.
- A settings sheet for adjusting focus and break lengths. Defaults: 25 min
  focus / 5 min break (classic Pomodoro).

## Crow states

Four illustrated poses, one active at a time:

1. **Idle** — before starting, or after a completed session settles. Calm,
   sitting with its loaf.
2. **Focus** — alert "guard" pose (wide-eyed, watchful) for the entire
   focus interval.
3. **Break** — relaxed, nibbling the bread.
4. **Complete** — brief celebration flap / sparkle-eyes when a session
   ends, then returns to Idle.

Transitions between states are simple image swaps with a cross-fade — no
frame-by-frame animation required for the MVP.

## Timer logic

- Two phases: Focus and Break, lengths configurable in settings
  (persisted locally).
- Start / Pause / Reset controls the countdown.
- On Focus → 0: fire local notification + haptic buzz, switch to Complete
  state briefly, then Break state, and restart the countdown for Break.
- On Break → 0: fire local notification + haptic buzz, switch to Complete
  state briefly, then Idle, ready for the next Focus session.
- Timer must keep correct wall-clock time across app backgrounding
  (compute remaining time from a stored end-timestamp, not a decrementing
  in-memory counter alone).

## Tech stack

- React Native + Expo (single codebase for iOS/Android, testable live via
  Expo Go during development without a full native build).
- Local persistence via AsyncStorage: focus/break durations only (no
  session history for MVP).
- `expo-notifications` for the end-of-session local notification.
- `expo-haptics` for the completion buzz.

## Art pipeline

Four crow poses (Idle, Focus, Break, Complete) generated as static
illustrations matching the hand-inked style of the reference art
(consistent line weight, proportions, and coloring), exported as
transparent PNGs, bundled as static image assets in the app.

## Out of scope for MVP

- Accounts / sync
- Session history, streaks, or stats
- Task list / labeling sessions
- Sound (beyond the notification + haptic)
- Custom animation beyond cross-fade

## Testing / verification

UI + timer logic, not business rules with many edge cases. Verify:

- Timer counts down correctly through pause/resume/reset.
- Phase transitions fire at the correct time and in the correct order
  (Focus → Complete → Break → Complete → Idle).
- Remaining time is correct after backgrounding and returning to the app.
- App runs cleanly in Expo Go on a real device.
