import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Phase } from '../timer/timerMachine';

const POSE_SOURCES: Record<Phase, ReturnType<typeof require>> = {
  idle: require('../../assets/crow/idle.png'),
  focus: require('../../assets/crow/focus.png'),
  break: require('../../assets/crow/break.png'),
  complete: require('../../assets/crow/complete.png'),
};

export interface CrowDisplayProps {
  phase: Phase;
}

export default function CrowDisplay({ phase }: CrowDisplayProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [phase, opacity]);

  return (
    <Animated.Image
      testID="crow-image"
      source={POSE_SOURCES[phase]}
      style={{ width: 240, height: 240, opacity }}
      resizeMode="contain"
    />
  );
}
