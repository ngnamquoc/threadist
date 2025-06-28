import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import theme from '../styles/theme';
import { AuthUser } from '../services/authService';
import { CategorySubreddit, interestsService } from '../services/interestsService';

interface SubredditSelectionScreenProps {
  navigation?: any;
  user?: AuthUser | null;
  selectedCategories?: string[];
}

const SubredditSelectionScreen: React.FC<SubredditSelectionScreenProps> = ({ 
  navigation, 
  user, 
  selectedCategories = [] 
}) => {
  const [subreddits, setSubreddits] = useState<CategorySubreddit[]>([]);
  const [selectedSubreddits, setSelectedSubreddits] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedCategories.length > 0) {
      loadSubreddits();
    }
  }, [selectedCategories]);

  const loadSubreddits = async () => {
    try {
      const { subreddits, error } = await interestsService.getCategorySubreddits(selectedCategories);
      
      if (error) {
        Alert.alert('Error', 'Failed to load subreddits');
        return;
      }

      if (subreddits) {
        setSubreddits(subreddits);
        // Pre-select all subreddits by default
        setSelectedSubreddits(subreddits.map(s => s.csid));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load subreddits');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSubreddit = (csid: string) => {
    setSelectedSubreddits(prev => {
      if (prev.includes(csid)) {
        return prev.filter(id => id !== csid);
      } else {
        return [...prev, csid];
      }
    });
  };

  const handleFinish = async () => {
    if (selectedSubreddits.length === 0) {
      Alert.alert('Select Subreddits', 'Please select at least one subreddit to continue.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not found. Please try again.');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await interestsService.saveUserInterestsBySubreddits(user.id, selectedSubreddits);
      
      if (error) {
        Alert.alert('Error', error.message || 'Failed to save interests');
        return;
      }

      // Navigate to home screen
      navigation?.navigate('Home');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save interests');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigation?.navigate('InterestSelection');
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
        <View style={styles.progressFill} />
      </View>
      <Text style={styles.stepText}>STEP 2 OF 2</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary.blue} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading subreddits...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary.blue} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderProgressBar()}
        
        <Text style={styles.title}>
          Choose your favorite subreddits
        </Text>

        <Text style={styles.subtitle}>
          We've pre-selected popular ones, but feel free to customize
        </Text>

        <View style={styles.subredditsContainer}>
          {subreddits.map((subreddit) => (
            <TouchableOpacity
              key={subreddit.csid}
              style={[
                styles.subredditCard,
                selectedSubreddits.includes(subreddit.csid) && styles.selectedCard
              ]}
              onPress={() => toggleSubreddit(subreddit.csid)}
              activeOpacity={0.8}
            >
              <Text style={styles.subredditText}>
                r/{subreddit.subreddit}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.finishButton,
            selectedSubreddits.length === 0 && styles.disabledButton
          ]}
          onPress={handleFinish}
          disabled={isSaving || selectedSubreddits.length === 0}
          activeOpacity={0.8}
        >
          <Text style={styles.finishButtonText}>
            {isSaving ? 'Saving...' : 'Finish'}
          </Text>
        </TouchableOpacity>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.neutral.white,
    fontSize: theme.fontSize.lg,
    fontFamily: 'CeraPro-Regular',
  },
  
  progressContainer: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  progressBar: {
    flexDirection: 'row',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    flex: 1,
    backgroundColor: theme.colors.primary.orange,
  },
  stepText: {
    color: theme.colors.neutral.white,
    fontSize: theme.fontSize.xs,
    fontFamily: 'CeraPro-Medium',
    letterSpacing: 1,
  },
  
  title: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.neutral.white,
    lineHeight: theme.fontSize['2xl'] * 1.3,
    marginBottom: theme.spacing.md,
    fontFamily: 'CeraPro-Bold',
  },
  
  subtitle: {
    fontSize: theme.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: theme.fontSize.base * 1.4,
    marginBottom: theme.spacing.xl,
    fontFamily: 'CeraPro-Regular',
  },
  
  subredditsContainer: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  subredditCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  selectedCard: {
    backgroundColor: 'rgba(255, 133, 51, 0.2)',
    borderColor: theme.colors.primary.orange,
  },
  subredditText: {
    color: theme.colors.neutral.white,
    fontSize: theme.fontSize.base,
    fontFamily: 'CeraPro-Regular',
    lineHeight: theme.fontSize.base * 1.4,
  },
  
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  backButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
  },
  backButtonText: {
    color: theme.colors.neutral.white,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold as any,
    fontFamily: 'CeraPro-Medium',
  },
  finishButton: {
    flex: 2,
    backgroundColor: theme.colors.neutral.gray[400],
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: theme.colors.neutral.gray[600],
    opacity: 0.6,
  },
  finishButtonText: {
    color: theme.colors.primary.blue,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold as any,
    fontFamily: 'CeraPro-Medium',
  },
});

export default SubredditSelectionScreen;
