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
import InterestSelectionScreen from './src/screens/InterestSelectionScreen';
import SubredditSelectionScreen from './src/screens/SubredditSelectionScreen';
import HomeScreen from './src/screens/HomeScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import StoryDetailsScreen from './src/screens/StoryDetailsScreen';
import theme from './src/styles/theme';
import { AuthUser, authService } from './src/services/authService';
import { interestsService } from './src/services/interestsService';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('Welcome');
  const [screenProps, setScreenProps] = useState<any>({});
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['Welcome']);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkUserOnboardingStatus = async (user: AuthUser) => {
    // Check if email is confirmed first
    if (!authService.isEmailConfirmed(user)) {
      setCurrentScreen('EmailConfirmation');
      return;
    }

    // Check if user has completed interests selection
    const { hasCompleted, error } = await interestsService.hasUserCompletedInterestSelection(user.id);
    
    if (error) {
      console.error('Error checking interest completion:', error);
      // Default to interests screen if we can't determine status
      setCurrentScreen('Interests');
      return;
    }

    if (hasCompleted) {
      setCurrentScreen('Home');
    } else {
      setCurrentScreen('Interests');
    }
  };

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
          checkUserOnboardingStatus(user);
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
      checkUserOnboardingStatus(user);
    } else {
      setCurrentScreen('Welcome');
    }
  };

  const navigate = (screenName: string, props?: any) => {
    setNavigationHistory(prev => [...prev, screenName]);
    setCurrentScreen(screenName);
    setScreenProps(props || {});
  };

  const goBack = () => {
    setNavigationHistory(prev => {
      const newHistory = [...prev];
      newHistory.pop(); // Remove current screen
      const previousScreen = newHistory[newHistory.length - 1] || 'Home';
      setCurrentScreen(previousScreen);
      setScreenProps({});
      return newHistory.length > 0 ? newHistory : ['Home'];
    });
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
      case 'InterestSelection':
        return <InterestSelectionScreen navigation={{ navigate }} user={user} />;
      case 'SubredditSelection':
        return <SubredditSelectionScreen navigation={{ navigate }} user={user} selectedCategories={screenProps.selectedCategories} />;
      case 'Home':
        return <HomeScreen navigation={{ navigate }} user={user} />;
      case 'CategoryScreen':
        return <CategoryScreen navigation={{ navigate, goBack }} route={{ params: screenProps }} user={user} />;
      case 'StoryDetails':
        return <StoryDetailsScreen navigation={{ navigate, goBack }} route={{ params: screenProps }} user={user} />;
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
