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
import { InterestCategory, interestsService } from '../services/interestsService';

interface InterestSelectionScreenProps {
  navigation?: any;
  user?: AuthUser | null;
}

const InterestSelectionScreen: React.FC<InterestSelectionScreenProps> = ({ navigation, user }) => {
  const [categories, setCategories] = useState<InterestCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { categories, error } = await interestsService.getInterestCategories();
      
      if (error) {
        Alert.alert('Error', 'Failed to load interest categories');
        return;
      }

      if (categories) {
        setCategories(categories);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load interest categories');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleNext = () => {
    if (selectedCategories.length === 0) {
      Alert.alert('Select Interests', 'Please select at least one interest category to continue.');
      return;
    }

    // Navigate to subreddit selection screen with selected categories
    navigation?.navigate('SubredditSelection', { selectedCategories });
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
        <View style={styles.progressRemaining} />
      </View>
      <Text style={styles.stepText}>STEP 1 OF 2</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary.blue} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading interests...</Text>
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
          What kind of Reddit stories do you enjoy?
        </Text>

        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.category_id}
              style={[
                styles.categoryCard,
                selectedCategories.includes(category.category_id) && styles.selectedCard
              ]}
              onPress={() => toggleCategory(category.category_id)}
              activeOpacity={0.8}
            >
              <Text style={styles.categoryText}>
                {category.emoji} {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            selectedCategories.length === 0 && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={selectedCategories.length === 0}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            Next
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
  progressRemaining: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    marginBottom: theme.spacing.xl,
    fontFamily: 'CeraPro-Bold',
  },
  
  categoriesContainer: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  categoryCard: {
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
  categoryText: {
    color: theme.colors.neutral.white,
    fontSize: theme.fontSize.base,
    fontFamily: 'CeraPro-Regular',
    lineHeight: theme.fontSize.base * 1.4,
  },
  
  buttonContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  },
  nextButton: {
    backgroundColor: theme.colors.neutral.gray[400],
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: theme.colors.neutral.gray[600],
    opacity: 0.6,
  },
  nextButtonText: {
    color: theme.colors.primary.blue,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold as any,
    fontFamily: 'CeraPro-Medium',
  },
});

export default InterestSelectionScreen;
