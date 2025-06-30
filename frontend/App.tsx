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
  const [isManualNavigation, setIsManualNavigation] = useState(false);

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
      console.log('✅ User onboarding complete, setting Home screen and proper navigation history');
      setCurrentScreen('Home');
      // Ensure proper navigation history when user reaches Home
      setNavigationHistory(['Welcome', 'Home']);
    } else {
      setCurrentScreen('Interests');
    }
  };

  useEffect(() => {
    // Comment out auto sign out for development - this was causing issues with navigation
    // const autoSignOut = async () => {
    //   await authService.signOut();
    //   setIsLoading(false);
    // };
    // autoSignOut();

    setIsLoading(false);

    // Listen to auth changes
    const { data: { subscription } } = authService.onAuthStateChanged((user, session) => {
      console.log('🔐 Auth state changed - User:', user ? `${user.email} (${user.id})` : 'null');
      console.log('🔐 Auth state changed - Session:', session ? 'exists' : 'null');
      console.log('🔐 Current screen:', currentScreen);
      console.log('🔐 Show splash:', showSplash);
      console.log('🔐 Is manual navigation:', isManualNavigation);
      
      setUser(user);
      setSession(session);
      
      // Only navigate based on auth state if not manually navigating and splash is done
      if (!showSplash && !isManualNavigation) {
        if (user) {
          console.log('🔐 User exists, checking onboarding status...');
          checkUserOnboardingStatus(user);
        } else {
          console.log('🔐 No user, navigating to Welcome');
          setCurrentScreen('Welcome');
        }
      } else {
        console.log('🔐 Skipping auth navigation - manual navigation or splash showing');
      }
    });

    return () => subscription?.unsubscribe();
  }, [showSplash]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    // Navigate based on current auth state
    if (user) {
      console.log('🎬 Splash complete, user authenticated, checking onboarding...');
      checkUserOnboardingStatus(user);
    } else {
      console.log('🎬 Splash complete, no user, showing Welcome');
      setCurrentScreen('Welcome');
      setNavigationHistory(['Welcome']);
    }
  };

  const navigate = (screenName: string, props?: any) => {
    console.log('🚀 Navigate called:', screenName, 'with props:', props);
    console.log('🚀 Current history before navigation:', navigationHistory);
    setIsManualNavigation(true);
    setNavigationHistory(prev => {
      const newHistory = [...prev, screenName];
      console.log('🚀 New history after navigation:', newHistory);
      return newHistory;
    });
    setCurrentScreen(screenName);
    setScreenProps(props || {});
    
    // Reset manual navigation flag after a delay
    setTimeout(() => {
      setIsManualNavigation(false);
    }, 1000);
  };

  const goBack = () => {
    console.log('🔙 GoBack called');
    console.log('🔙 Current history:', navigationHistory);
    console.log('🔙 Current screen:', currentScreen);
    console.log('🔙 Current user:', user ? user.email : 'null');
    
    setIsManualNavigation(true);
    
    setNavigationHistory(prev => {
      const newHistory = [...prev];
      newHistory.pop(); // Remove current screen
      let previousScreen = newHistory[newHistory.length - 1] || 'Home';
      
      // Safety check: if user is authenticated and we're going back to Welcome, go to Home instead
      if (user && previousScreen === 'Welcome') {
        previousScreen = 'Home';
        // Update history to reflect this
        const correctedHistory = ['Welcome', 'Home'];
        console.log('🔙 Corrected navigation: User is authenticated, redirecting to Home instead of Welcome');
        console.log('🔙 Previous screen (corrected):', previousScreen);
        console.log('🔙 New history (corrected):', correctedHistory);
        
        setCurrentScreen(previousScreen);
        setScreenProps({});
        return correctedHistory;
      }
      
      console.log('🔙 Previous screen:', previousScreen);
      console.log('🔙 New history:', newHistory);
      
      setCurrentScreen(previousScreen);
      // Clear props when going back - the previous screen should handle its own state
      setScreenProps({});
      return newHistory.length > 0 ? newHistory : ['Home'];
    });
    
    // Reset manual navigation flag after a delay
    setTimeout(() => {
      setIsManualNavigation(false);
    }, 1000);
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
