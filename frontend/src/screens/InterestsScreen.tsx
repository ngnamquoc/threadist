import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Image,
  Alert,
} from 'react-native';
import theme from '../styles/theme';
import { AuthUser, authService } from '../services/authService';

interface InterestsScreenProps {
  navigation?: any;
  user?: AuthUser | null;
}

const InterestsScreen: React.FC<InterestsScreenProps> = ({ navigation, user }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleTellUsInterests = () => {
    navigation?.navigate('InterestSelection');
  };

  const handleContinue = async () => {
    if (selectedInterests.length === 0) {
      Alert.alert('Select Interests', 'Please select at least one interest to continue.');
      return;
    }

    setIsLoading(true);
    try {
      if (user?.id) {
        const { error } = await authService.saveUserInterests(user.id, selectedInterests);
        
        if (error) {
          Alert.alert('Error', error.message || 'Failed to save interests');
          return;
        }
      }
      
      // Navigate to main app (home screen)
      navigation?.navigate('Home');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save interests');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary.blue} />
      
      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('../../assets/imgs/dog_walking.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Main Content */}
        <View style={styles.textContent}>
          {/* Logo positioned closer to text */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          
          <Text style={styles.title}>
            Read or listen to stories while you{' '}
            <Text style={styles.highlight}>chill</Text>
          </Text>
          
          <Text style={styles.subtitle}>
            Whether you're walking, cooking, or gaming—Threadist brings Reddit to life on the go
          </Text>
        </View>

        {/* Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.interestsButton}
            onPress={handleTellUsInterests}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.interestsButtonText}>
              Tell us your interests
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary.blue,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing['2xl'],
    justifyContent: 'space-between',
  },
  
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  illustration: {
    width: 240,
    height: 200,
  },
  
  textContent: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: theme.spacing['2xl'],
  },
  logoContainer: {
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: theme.fontSize['3xl'],
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.neutral.white,
    lineHeight: theme.fontSize['3xl'] * 1.2,
    marginBottom: theme.spacing.lg,
    fontFamily: 'CeraPro-Bold',
    textAlign: 'left',
  },
  highlight: {
    color: theme.colors.primary.orange,
    fontFamily: 'CeraPro-Black',
  },
  subtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.neutral.gray[300],
    lineHeight: theme.fontSize.base * theme.lineHeight.relaxed,
    fontFamily: 'CeraPro-Regular',
    textAlign: 'left',
  },
  
  buttonContainer: {
    paddingBottom: theme.spacing['2xl'],
  },
  interestsButton: {
    backgroundColor: theme.colors.primary.orange,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    ...theme.shadow.md,
  },
  interestsButtonText: {
    color: theme.colors.neutral.white,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold as any,
    fontFamily: 'CeraPro-Medium',
  },
});

export default InterestsScreen;
