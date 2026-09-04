import React from 'react';
import { View, Pressable, Text } from 'react-native';

export interface ControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export default function Controls({ isRunning, onStart, onPause, onReset }: ControlsProps) {
  return (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      {isRunning ? (
        <Pressable testID="pause-button" onPress={onPause}>
          <Text>Pause</Text>
        </Pressable>
      ) : (
        <Pressable testID="start-button" onPress={onStart}>
          <Text>Start</Text>
        </Pressable>
      )}
      <Pressable testID="reset-button" onPress={onReset}>
        <Text>Reset</Text>
      </Pressable>
    </View>
  );
}
