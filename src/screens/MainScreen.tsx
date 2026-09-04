import React, { useState } from 'react';
import { View, Pressable, Text, SafeAreaView } from 'react-native';
import { useTimer } from '../timer/useTimer';
import CrowDisplay from '../components/CrowDisplay';
import TimerDisplay from '../components/TimerDisplay';
import Controls from '../components/Controls';
import SettingsSheet from '../components/SettingsSheet';
import { notifySessionComplete } from '../notifications';

export default function MainScreen() {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const timer = useTimer({
    onPhaseComplete: (finishedPhase) => {
      notifySessionComplete(finishedPhase);
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <Pressable
        testID="open-settings-button"
        onPress={() => setSettingsVisible(true)}
        style={{ position: 'absolute', top: 16, right: 16 }}
      >
        <Text>Settings</Text>
      </Pressable>
      <CrowDisplay phase={timer.phase} />
      <TimerDisplay remainingMs={timer.remainingMs} />
      <Controls isRunning={timer.isRunning} onStart={timer.start} onPause={timer.pause} onReset={timer.reset} />
      <SettingsSheet
        visible={settingsVisible}
        focusMinutes={timer.focusDurationMs / 60_000}
        breakMinutes={timer.breakDurationMs / 60_000}
        onClose={() => setSettingsVisible(false)}
        onSave={(focusMinutes, breakMinutes) => {
          timer.setDurations(focusMinutes, breakMinutes);
          setSettingsVisible(false);
        }}
      />
      <View />
    </SafeAreaView>
  );
}
