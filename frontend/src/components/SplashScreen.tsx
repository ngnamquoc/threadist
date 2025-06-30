import React, { useEffect, useState } from 'react';
import { View, Animated, Dimensions, StyleSheet, Image } from 'react-native';
import theme from '../styles/theme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  const [logoScale] = useState(new Animated.Value(0.5));
  const [logoOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    // Start the logo animation
    Animated.sequence([
      // Fade in and scale up
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Hold for a moment
      Animated.delay(1500),
      // Slight bounce effect
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      // Hold again
      Animated.delay(500),
    ]).start(() => {
      // Animation complete, notify parent
      setTimeout(onAnimationComplete, 300);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        {/* App Logo */}
        <View style={styles.logoWrapper}>
          <Image 
            source={require('../../assets/logo/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 100,
    height: 100,
  },
});

export default SplashScreen;
