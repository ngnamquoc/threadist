import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import SplashScreen from './src/components/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import theme from './src/styles/theme';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return (
      <>
        <SplashScreen onAnimationComplete={handleSplashComplete} />
        <StatusBar style="light" backgroundColor={theme.colors.primary.blue} />
      </>
    );
  }

  return (
    <View style={styles.container}>
      <WelcomeScreen />
      <StatusBar style="light" backgroundColor={theme.colors.primary.blue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
