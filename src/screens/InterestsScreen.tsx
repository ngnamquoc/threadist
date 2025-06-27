import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import theme from '../styles/theme';

interface InterestsScreenProps {
  navigation?: any;
}

const INTERESTS = [
  'AITA (Am I The Asshole)',
  'Relationship Drama',
  'Creepy Encounters',
  'Funny Stories',
  'Life Pro Tips',
  'Confession',
  'Revenge Stories',
  'Workplace Drama',
  'Family Drama',
  'Dating Stories',
  'Paranormal',
  'True Crime',
  'Wholesome',
  'Cringe Stories',
  'Success Stories',
];

const InterestsScreen: React.FC<InterestsScreenProps> = ({ navigation }) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(item => item !== interest);
      } else {
        return [...prev, interest];
      }
    });
  };

  const handleContinue = async () => {
    if (selectedInterests.length === 0) {
      Alert.alert('Select Interests', 'Please select at least one interest to continue.');
      return;
    }

    setIsLoading(true);
    try {
      // Here you would normally save the interests to your backend
      console.log('Selected interests:', selectedInterests);
      
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
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with illustration */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/imgs/dog_walking.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
          
          <View style={styles.bookmarkIcon}>
            <Image
              source={require('../../assets/logo/logo.png')}
              style={styles.bookmarkImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>
            Read or listen to stories while you{' '}
            <Text style={styles.highlight}>chill</Text>
          </Text>
          
          <Text style={styles.subtitle}>
            Whether you're walking, cooking, or gaming—Threadist brings Reddit to life on the go
          </Text>

          <TouchableOpacity
            style={styles.interestsButton}
            onPress={() => {}}
            activeOpacity={0.8}
          >
            <Text style={styles.interestsButtonText}>Tell us your interests</Text>
          </TouchableOpacity>

          {/* Interests Grid */}
          <View style={styles.interestsGrid}>
            {INTERESTS.map((interest, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.interestChip,
                  selectedInterests.includes(interest) && styles.selectedChip
                ]}
                onPress={() => toggleInterest(interest)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.interestText,
                  selectedInterests.includes(interest) && styles.selectedText
                ]}>
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedInterests.length === 0 && styles.disabledButton
            ]}
            onPress={handleContinue}
            disabled={isLoading || selectedInterests.length === 0}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>
              {isLoading ? 'Saving...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary.blue,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xl,
  },

  header: {
    alignItems: 'center',
    paddingTop: theme.spacing['2xl'],
    paddingHorizontal: theme.spacing.lg,
    position: 'relative',
  },
  illustration: {
    width: 200,
    height: 200,
    marginBottom: theme.spacing.lg,
  },
  bookmarkIcon: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    left: theme.spacing.xl,
    width: 60,
    height: 60,
    backgroundColor: theme.colors.primary.orange,
    borderRadius: theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.md,
  },
  bookmarkImage: {
    width: 30,
    height: 30,
  },

  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.neutral.white,
    lineHeight: theme.fontSize['2xl'] * theme.lineHeight.tight,
    marginBottom: theme.spacing.md,
    fontFamily: 'CeraPro-Bold',
  },
  highlight: {
    color: theme.colors.primary.orange,
    fontFamily: 'CeraPro-Black',
  },
  subtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.neutral.gray[300],
    lineHeight: theme.fontSize.base * theme.lineHeight.relaxed,
    marginBottom: theme.spacing.xl,
    fontFamily: 'CeraPro-Regular',
  },

  interestsButton: {
    backgroundColor: theme.colors.primary.orange,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadow.md,
  },
  interestsButtonText: {
    color: theme.colors.neutral.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold as any,
    fontFamily: 'CeraPro-Medium',
  },

  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  interestChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedChip: {
    backgroundColor: theme.colors.primary.orange,
    borderColor: theme.colors.primary.orange,
  },
  interestText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.neutral.white,
    fontFamily: 'CeraPro-Regular',
  },
  selectedText: {
    fontWeight: theme.fontWeight.medium as any,
    fontFamily: 'CeraPro-Medium',
  },

  continueButton: {
    backgroundColor: theme.colors.primary.orange,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    ...theme.shadow.md,
  },
  disabledButton: {
    backgroundColor: theme.colors.neutral.gray[600],
    opacity: 0.6,
  },
  continueButtonText: {
    color: theme.colors.neutral.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold as any,
    fontFamily: 'CeraPro-Medium',
  },
});

export default InterestsScreen;
