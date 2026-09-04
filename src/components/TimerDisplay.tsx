import React from 'react';
import { Text } from 'react-native';

export function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(minutes)}:${pad(seconds)}`;
}

export interface TimerDisplayProps {
  remainingMs: number;
}

export default function TimerDisplay({ remainingMs }: TimerDisplayProps) {
  return (
    <Text testID="timer-display" style={{ fontSize: 48, fontVariant: ['tabular-nums'] }}>
      {formatRemaining(remainingMs)}
    </Text>
  );
}
