import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import SplashScreen from './src/components/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import LoginScreen from './src/screens/LoginScreen';
import InterestsScreen from './src/screens/InterestsScreen';
import HomeScreen from './src/screens/HomeScreen';
import theme from './src/styles/theme';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('Welcome');
  const [screenProps, setScreenProps] = useState<any>({});



  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const navigate = (screenName: string, props?: any) => {
    setCurrentScreen(screenName);
    setScreenProps(props || {});
  };

  // Show splash screen
  if (showSplash) {
    return (
      <>
        <SplashScreen onAnimationComplete={handleSplashComplete} />
        <StatusBar style="light" backgroundColor={theme.colors.primary.blue} />
      </>
    );
  }

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'SignUp':
        return <SignUpScreen navigation={{ navigate }} />;
      case 'Login':
        return <LoginScreen navigation={{ navigate }} />;
      case 'Interests':
        return <InterestsScreen navigation={{ navigate }} />;
      case 'Home':
        return <HomeScreen navigation={{ navigate }} />;
      case 'Welcome':
      default:
        return <WelcomeScreen navigation={{ navigate }} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderCurrentScreen()}
      <StatusBar style="light" backgroundColor={theme.colors.primary.blue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
