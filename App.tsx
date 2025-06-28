import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { Session } from '@supabase/supabase-js';

import SplashScreen from './src/components/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import LoginScreen from './src/screens/LoginScreen';
import EmailConfirmationScreen from './src/screens/EmailConfirmationScreen';
import InterestsScreen from './src/screens/InterestsScreen';
import HomeScreen from './src/screens/HomeScreen';
import theme from './src/styles/theme';
import { AuthUser, authService } from './src/services/authService';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('Welcome');
  const [screenProps, setScreenProps] = useState<any>({});
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Auto sign out on app reload/restart (useful for development)
    const autoSignOut = async () => {
      await authService.signOut();
      setIsLoading(false);
    };
    
    autoSignOut();

    // Listen to auth changes
    const { data: { subscription } } = authService.onAuthStateChanged((user, session) => {
      setUser(user);
      setSession(session);
      
      // Navigate based on auth state after splash screen
      if (!showSplash) {
        if (user) {
          // Check if email is confirmed first
          if (!authService.isEmailConfirmed(user)) {
            setCurrentScreen('EmailConfirmation');
          }
          // Then check if user has completed interests selection
          else if (!user.user_metadata?.interests) {
            setCurrentScreen('Interests');
          } else {
            setCurrentScreen('Home');
          }
        } else {
          setCurrentScreen('Welcome');
        }
      }
    });

    return () => subscription?.unsubscribe();
  }, [showSplash]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    // Navigate based on current auth state
    if (user) {
      // Check if email is confirmed first
      if (!authService.isEmailConfirmed(user)) {
        setCurrentScreen('EmailConfirmation');
      }
      // Then check if user has completed interests selection
      else if (!user.user_metadata?.interests) {
        setCurrentScreen('Interests');
      } else {
        setCurrentScreen('Home');
      }
    } else {
      setCurrentScreen('Welcome');
    }
  };

  const navigate = (screenName: string, props?: any) => {
    setCurrentScreen(screenName);
    setScreenProps(props || {});
  };

  // Show splash screen
  if (showSplash || isLoading) {
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
      case 'EmailConfirmation':
        return <EmailConfirmationScreen navigation={{ navigate }} user={screenProps.user || user} />;
      case 'Interests':
        return <InterestsScreen navigation={{ navigate }} user={user} />;
      case 'Home':
        return <HomeScreen navigation={{ navigate }} user={user} />;
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
