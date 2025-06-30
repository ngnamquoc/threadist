import React, { useState, useEffect, useRef } from 'react';
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
import theme from './src/styles/theme';
import { AuthUser, authService } from './src/services/authService';
import { interestsService } from './src/services/interestsService';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('Welcome');
  const [screenProps, setScreenProps] = useState<any>({});
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const allowAuthNavigation = useRef(true);

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
    // Comment out auto sign out for development - this was causing issues with navigation
    // const autoSignOut = async () => {
    //   await authService.signOut();
    //   setIsLoading(false);
    // };
    // autoSignOut();

    setIsLoading(false);

    // Listen to auth changes
    const { data: { subscription } } = authService.onAuthStateChanged(async (user, session) => {
      console.log('Auth state changed:', user ? 'logged in' : 'logged out');
      setUser(user);
      setSession(session);
      
      // Only handle auth navigation if not currently navigating manually
      if (!isNavigating && allowAuthNavigation.current) {
        if (user) {
          console.log('User logged in, checking onboarding status...');
          await checkUserOnboardingStatus(user);
        } else {
          console.log('User logged out, navigating to Welcome');
          setCurrentScreen('Welcome');
          setScreenProps({});
        }
      } else {
        console.log('Skipping auth navigation - manual navigation in progress or disabled');
      }
    });

    return () => subscription?.unsubscribe();
  }, [showSplash]);

  // Debug useEffect to track currentScreen changes
  useEffect(() => {
    console.log('currentScreen changed to:', currentScreen);
  }, [currentScreen]);

  // Debug useEffect to track screenProps changes  
  useEffect(() => {
    console.log('screenProps changed to:', screenProps);
  }, [screenProps]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    allowAuthNavigation.current = false; // Disable auth navigation during manual setup
    // Navigate based on current auth state
    if (user) {
      checkUserOnboardingStatus(user);
    } else {
      setCurrentScreen('Welcome');
    }
    // Re-enable auth navigation after a delay
    setTimeout(() => {
      allowAuthNavigation.current = true;
    }, 2000);
  };

  const navigate = (screenName: string, props?: any) => {
    console.log('Navigating to:', screenName, 'with props:', props);
    console.log('Current screen before navigation:', currentScreen);
    allowAuthNavigation.current = false; // Disable auth navigation
    setIsNavigating(true);
    setCurrentScreen(screenName);
    setScreenProps(props || {});
    console.log('State updated - new screen should be:', screenName);
    // Reset navigation flag after a delay
    setTimeout(() => {
      console.log('Navigation timeout completed');
      setIsNavigating(false);
      allowAuthNavigation.current = true;
    }, 1000); // Longer delay to ensure screen renders
  };

  const goBack = () => {
    console.log('Going back to Home');
    allowAuthNavigation.current = false; // Disable auth navigation
    setIsNavigating(true);
    setCurrentScreen('Home');
    setScreenProps({});
    setTimeout(() => {
      setIsNavigating(false);
      allowAuthNavigation.current = true;
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
    console.log('renderCurrentScreen called - Current screen:', currentScreen, 'with props:', screenProps);
    try {
      switch (currentScreen) {
        case 'SignUp':
          console.log('Rendering SignUpScreen');
          return <SignUpScreen navigation={{ navigate, goBack }} />;
        case 'Login':
          console.log('Rendering LoginScreen');
          return <LoginScreen navigation={{ navigate, goBack }} />;
        case 'EmailConfirmation':
          console.log('Rendering EmailConfirmationScreen');
          return <EmailConfirmationScreen navigation={{ navigate, goBack }} user={screenProps.user || user} />;
        case 'Interests':
          console.log('Rendering InterestsScreen');
          return <InterestsScreen navigation={{ navigate, goBack }} user={user} />;
        case 'InterestSelection':
          console.log('Rendering InterestSelectionScreen');
          return <InterestSelectionScreen navigation={{ navigate, goBack }} user={user} />;
        case 'SubredditSelection':
          console.log('Rendering SubredditSelectionScreen');
          return <SubredditSelectionScreen navigation={{ navigate, goBack }} user={user} selectedCategories={screenProps.selectedCategories} />;
        case 'Home':
          console.log('Rendering HomeScreen');
          return <HomeScreen navigation={{ navigate, goBack }} user={user} />;
        case 'CategoryScreen':
          console.log('Rendering CategoryScreen with params:', screenProps);
          return <CategoryScreen navigation={{ navigate, goBack }} route={{ params: screenProps }} user={user} />;
        case 'Welcome':
          console.log('Rendering WelcomeScreen');
          return <WelcomeScreen navigation={{ navigate, goBack }} />;
        default:
          console.log('Rendering default WelcomeScreen for unknown screen:', currentScreen);
          return <WelcomeScreen navigation={{ navigate, goBack }} />;
      }
    } catch (error) {
      console.error('Error rendering screen:', error);
      // Fallback to welcome screen if there's an error
      return <WelcomeScreen navigation={{ navigate, goBack }} />;
    }
  };

  return (
    <View style={styles.container}>
      {(() => {
        console.log('About to render current screen, currentScreen is:', currentScreen);
        return renderCurrentScreen();
      })()}
      <StatusBar style="light" backgroundColor={theme.colors.primary.blue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
