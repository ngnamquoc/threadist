import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../styles/theme';
import { AuthUser, authService } from '../services/authService';
import { apiService, RedditPost, StoryRecommendation } from '../services/apiService';
import { audioService, AudioPlayerState } from '../services/audioService';
import { interestsService, InterestCategory } from '../services/interestsService';
import StoryCard from '../components/StoryCard';
import AudioPlayer from '../components/AudioPlayer';
import BottomNavigation from '../components/BottomNavigation';
import ExploreScreen from './ExploreScreen';
import EnhancedStoryCard from '../components/EnhancedStoryCard';

interface HomeScreenProps {
  navigation?: any;
  user?: AuthUser | null;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, user }) => {
  const [activeTab, setActiveTab] = useState<'for-you' | 'explore'>('for-you');
  const [hotThreadStories, setHotThreadStories] = useState<RedditPost[]>([]);
  const [followedStories, setFollowedStories] = useState<RedditPost[]>([]);
  const [recommendedStories, setRecommendedStories] = useState<RedditPost[]>([]);
  const [userInterestSections, setUserInterestSections] = useState<Array<{
    category: InterestCategory;
    stories: RedditPost[];
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [audioLoading, setAudioLoading] = useState<string | null>(null);
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    isPlaying: false,
    isPaused: false,
    isLoaded: false,
    duration: 0,
    position: 0,
  });

  useEffect(() => {
    audioService.setOnStateChange(setPlayerState);
    loadInitialData();
    
    return () => {
      audioService.setOnStateChange(() => {});
    };
  }, []);

  const loadUserInterestSections = async (userId: string, allStories: RedditPost[], usedStories: RedditPost[] = []) => {
    try {
      const { interestsData, error } = await interestsService.getUserInterestsWithCategories(userId);
      
      if (error || !interestsData) {
        console.error('Error loading user interests:', error);
        return;
      }

      // Get IDs of already used stories to avoid duplicates
      const usedStoryIds = new Set(usedStories.map(story => story.id));

      // Create sections for each user interest category
      const sections = interestsData.map(({ category, subreddits }) => {
        // Find stories from the user's interested subreddits that haven't been used
        const categoryStories = allStories.filter(story => 
          !usedStoryIds.has(story.id) && 
          subreddits.some(subreddit => 
            story.subreddit.toLowerCase() === subreddit.toLowerCase()
          )
        );

        // If we don't have enough stories from this category, supplement with related ones
        const diverseStories = createDiverseStoriesForCategory(categoryStories, allStories, subreddits, usedStoryIds);

        // Add the selected stories to the used set to prevent future duplicates
        diverseStories.forEach(story => usedStoryIds.add(story.id));

        return {
          category,
          stories: diverseStories.slice(0, 6) // Limit to 6 stories per section
        };
      }).filter(section => section.stories.length > 0); // Only include sections with stories

      setUserInterestSections(sections);
    } catch (error) {
      console.error('Error in loadUserInterestSections:', error);
    }
  };

  const createDiverseStoriesForCategory = (
    categoryStories: RedditPost[], 
    allStories: RedditPost[], 
    targetSubreddits: string[],
    usedStoryIds: Set<string> = new Set()
  ): RedditPost[] => {
    const diverseStories = [...categoryStories];
    
    // If we need more stories, find similar ones or trending content
    if (diverseStories.length < 4) {
      const additionalStories = allStories.filter(story => 
        !diverseStories.some(existing => existing.id === story.id) &&
        !usedStoryIds.has(story.id) &&
        !targetSubreddits.some(subreddit => 
          story.subreddit.toLowerCase() === subreddit.toLowerCase()
        )
      );
      
      // Add random stories to fill the section
      while (diverseStories.length < 6 && additionalStories.length > 0) {
        const randomIndex = Math.floor(Math.random() * additionalStories.length);
        diverseStories.push(additionalStories.splice(randomIndex, 1)[0]);
      }
    }

    return diverseStories;
  };

  const createDiverseFollowedStories = (allStories: RedditPost[]): RedditPost[] => {
    // Ensure we have diverse subreddits for followed stories
    const targetSubreddits = [
      'technology', 'gaming', 'movies', 'music', 'news', 'science', 
      'fitness', 'cooking', 'books', 'sports', 'funny', 'askreddit'
    ];
    
    const diverseStories: RedditPost[] = [];
    const usedSubreddits = new Set<string>();
    
    // First, try to get stories from target subreddits
    for (const targetSub of targetSubreddits) {
      const story = allStories.find(s => 
        s.subreddit.toLowerCase() === targetSub && !usedSubreddits.has(s.subreddit)
      );
      if (story && diverseStories.length < 6) {
        diverseStories.push(story);
        usedSubreddits.add(story.subreddit);
      }
    }
    
    // Fill remaining slots with unique subreddits from available stories
    for (const story of allStories) {
      if (!usedSubreddits.has(story.subreddit) && diverseStories.length < 6) {
        diverseStories.push(story);
        usedSubreddits.add(story.subreddit);
      }
    }
    
    return diverseStories;
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load hot thread of the day (trending stories)
      const trending = await apiService.getTrendingStories(15); // Get more for diversity
      const hotStories = trending.map(rec => rec.post);
      setHotThreadStories(hotStories);

      if (user?.id) {
        // Load personalized recommendations
        const recs = await apiService.getRecommendedStories(user.id, 20); // Get more for diversity
        const recStories = recs.map(rec => rec.post);
        setRecommendedStories(recStories);
        
        // Create diverse followed stories from combined data
        const combinedStories = [
          ...hotStories,
          ...recStories
        ];
        
        const diverseFollowedStories = createDiverseFollowedStories(combinedStories);
        setFollowedStories(diverseFollowedStories);

        // Load personalized interest-based sections
        await loadUserInterestSections(user.id, combinedStories, [
          ...hotStories,
          ...diverseFollowedStories,
          ...recStories
        ]);
      } else {
        // For non-authenticated users, show trending content with diversity
        setRecommendedStories(hotStories.slice(3, 8));
        
        const diverseFollowedStories = createDiverseFollowedStories(hotStories);
        setFollowedStories(diverseFollowedStories);
        
        // Clear user interest sections for non-authenticated users
        setUserInterestSections([]);
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      Alert.alert('Error', 'Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleStoryPress = async (story: RedditPost) => {
    try {
      setAudioLoading(story.id);
      
      // Load and play the story using streaming
      const success = await audioService.loadAudioStream(
        story.content, 
        "JBFqnCBsd6RMkjVDRZzb", // Default storytelling voice
        story
      );
      
      if (success) {
        await audioService.play();
        // Success - audio will start playing automatically
      } else {
        console.error('Failed to generate audio for story:', story.id);
        // Could add a subtle toast notification here if needed
      }
    } catch (error) {
      console.error('Error playing story:', error);
      // Could add a subtle toast notification here if needed
    } finally {
      setAudioLoading(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await audioService.cleanup();
      const { error } = await authService.signOut();
      if (error) {
        Alert.alert('Error', 'Failed to sign out');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign out');
    }
  };

  const renderStoryCard = (story: RedditPost, size: 'small' | 'large' = 'large', sectionKey: string = '') => (
    <EnhancedStoryCard
      story={story}
      onPress={handleStoryPress}
      isPlaying={playerState.isPlaying && playerState.currentStory?.id === story.id}
      isLoading={audioLoading === story.id}
      size={size}
    />
  );

  const renderSection = (title: string, stories: RedditPost[], sectionKey: string, cardSize: 'small' | 'large' = 'large') => {
    // Generate subtitle based on section title
    const getSubtitle = (sectionTitle: string) => {
      if (sectionTitle === 'Hot Thread of the Day') {
        return 'Top-voted drama picked by our curators';
      } else if (sectionTitle === 'Followed Subreddits') {
        return 'Trending stories from topics you follow';
      } else if (sectionTitle === 'Recommended for you') {
        return 'We think you\'ll like these';
      } else if (sectionTitle.includes('🔥')) {
        return 'Stories & humor from your interests';
      } else if (sectionTitle.includes('👻')) {
        return 'Horror stories you subscribed to';
      } else if (sectionTitle.includes('❤️')) {
        return 'Relationship advice and moral dilemmas';
      } else if (sectionTitle.includes('🤯')) {
        return 'Mind-blowing facts and mysteries';
      } else if (sectionTitle.includes('💡')) {
        return 'Self-improvement and motivation';
      } else if (sectionTitle.includes('🎬')) {
        return 'Pop culture and entertainment';
      } else {
        return 'Personalized content based on your interests';
      }
    };

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSubtitle}>{getSubtitle(title)}</Text>
        </View>
        <FlatList
          data={stories.slice(0, 6)} // Show more items for horizontal scrolling
          renderItem={({ item, index }) => renderStoryCard(item, 'small', sectionKey)} // Pass section key
          keyExtractor={(item, index) => `${sectionKey}-${item.id}-${index}`} // Create unique key with index
          horizontal={true} // Make all sections horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          ItemSeparatorComponent={() => <View style={{ width: 0 }} />} // No separator needed as margin is handled in card
        />
      </View>
    );
  };

  const handleTabPress = (tab: 'for-you' | 'explore') => {
    setActiveTab(tab);
  };

  const renderForYouContent = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>For You</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.neutral.white} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.orange} />
          <Text style={styles.loadingText}>Loading stories...</Text>
        </View>
      ) : (
        <FlatList
          data={[
            { type: 'hot', stories: hotThreadStories },
            { type: 'followed', stories: followedStories },
            ...userInterestSections.map((section, index) => ({
              type: `interest-${section.category.category_id}-${index}`, // Use category ID for uniqueness
              category: section.category,
              stories: section.stories
            })),
            { type: 'recommended', stories: recommendedStories }
          ]}
          renderItem={({ item }: { item: any }) => {
            switch (item.type) {
              case 'hot':
                return renderSection('Hot Thread of the Day', item.stories, 'hot');
              case 'followed':
                return renderSection('Followed Subreddits', item.stories, 'followed');
              case 'recommended':
                return renderSection('Recommended for you', item.stories, 'recommended');
              default:
                // Handle user interest sections
                if (item.type.startsWith('interest-') && item.category) {
                  return renderSection(
                    `${item.category.emoji} ${item.category.label}`, 
                    item.stories,
                    item.type
                  );
                }
                return null;
            }
          }}
          keyExtractor={(item) => item.type}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary.orange}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.mainContent}
        />
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary.blue} />
      
      {activeTab === 'for-you' ? renderForYouContent() : (
        <ExploreScreen navigation={navigation} user={user} />
      )}

      {/* Audio Player */}
      {playerState.isLoaded && <AudioPlayer />}

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

const formatTime = (timestamp: number) => {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  if (diff < 3600) {
    return `${Math.floor(diff / 60)}m ago`;
  } else if (diff < 86400) {
    return `${Math.floor(diff / 3600)}h ago`;
  } else {
    return `${Math.floor(diff / 86400)}d ago`;
  }
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary.blue,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.neutral.white,
    fontFamily: 'CeraPro-Bold',
  },
  signOutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    paddingBottom: 120, // Extra space for bottom navigation
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral.gray[900],
  },
  loadingText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.neutral.gray[400],
    marginTop: theme.spacing.md,
    fontFamily: 'CeraPro-Regular',
  },
  section: {
    backgroundColor: theme.colors.neutral.gray[900],
    paddingVertical: theme.spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.neutral.white,
    fontFamily: 'CeraPro-Bold',
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.neutral.gray[400],
    fontFamily: 'CeraPro-Regular',
  },
  horizontalList: {
    paddingHorizontal: theme.spacing.lg,
  },
  verticalList: {
    paddingHorizontal: theme.spacing.lg,
  },
});

export default HomeScreen;
