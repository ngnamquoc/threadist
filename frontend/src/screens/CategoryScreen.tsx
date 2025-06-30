import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../styles/theme';
import { AuthUser } from '../services/authService';
import { apiService, RedditPost, StoryRecommendation } from '../services/apiService';
import { interestsService, InterestCategory } from '../services/interestsService';
import EnhancedStoryCard from '../components/EnhancedStoryCard';
import AudioPlayer from '../components/AudioPlayer';
import { audioService, AudioPlayerState } from '../services/audioService';

export interface CategoryScreenParams {
  type: 'hot' | 'recommended' | 'followed' | 'interest' | 'subreddit';
  title: string;
  subtitle?: string;
  category?: InterestCategory;
  subreddit?: string;
  userId?: string;
}

interface CategoryScreenProps {
  navigation: any;
  route: {
    params: CategoryScreenParams;
  };
  user?: AuthUser | null;
}

const CategoryScreen: React.FC<CategoryScreenProps> = ({ navigation, route, user }) => {
  const { type, title, subtitle, category, subreddit, userId } = route.params;
  
  console.log('CategoryScreen mounted with params:', route.params);
  
  // Safety check for required props
  if (!type || !title) {
    console.error('CategoryScreen: Missing required props');
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary.blue} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: Invalid screen parameters</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  console.log('CategoryScreen rendered with params:', route.params);
  console.log('Navigation object:', navigation);
  
  const [stories, setStories] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [audioLoading, setAudioLoading] = useState<string | null>(null);
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    isPlaying: false,
    isPaused: false,
    isLoaded: false,
    duration: 0,
    position: 0,
  });

  useEffect(() => {
    try {
      console.log('CategoryScreen useEffect running');
      audioService.setOnStateChange(setPlayerState);
      loadInitialData();
    } catch (error) {
      console.error('Error in CategoryScreen useEffect:', error);
    }
    
    return () => {
      try {
        audioService.setOnStateChange(() => {});
      } catch (error) {
        console.error('Error in CategoryScreen cleanup:', error);
      }
    };
  }, []);

  const loadInitialData = async () => {
    try {
      console.log('Loading initial data for CategoryScreen');
      setLoading(true);
      setPage(1);
      setHasMoreData(true);
      await loadStories(1, true);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStories = async (pageNum: number, isRefresh: boolean = false) => {
    try {
      console.log('Loading stories for type:', type, 'page:', pageNum);
      let newStories: RedditPost[] = [];
      
      switch (type) {
        case 'hot':
          try {
            const hotRecommendations = await apiService.getHotStories(20, pageNum);
            newStories = hotRecommendations.map(rec => rec.post);
            console.log('Loaded hot stories:', newStories.length);
          } catch (error) {
            console.error('Error loading hot stories:', error);
            newStories = [];
          }
          break;
          
        case 'recommended':
          if (userId) {
            try {
              const recommendations = await apiService.getRecommendedStories(userId, 20, pageNum);
              newStories = recommendations.map(rec => rec.post);
              console.log('Loaded recommended stories:', newStories.length);
            } catch (error) {
              console.error('Error loading recommended stories:', error);
              newStories = [];
            }
          }
          break;
          
        case 'followed':
          if (userId) {
            try {
              const followedRecommendations = await apiService.getFollowedSubredditsStories(userId, 20, pageNum);
              newStories = followedRecommendations.map(rec => rec.post);
              console.log('Loaded followed stories:', newStories.length);
            } catch (error) {
              console.error('Error loading followed stories:', error);
              newStories = [];
            }
          }
          break;
          
        case 'interest':
          if (category && userId) {
            try {
              const categoryRecommendations = await apiService.getCategoryStories(category.category_id, userId, 20, pageNum);
              newStories = categoryRecommendations.map(rec => rec.post);
              console.log('Loaded interest stories for', category.label, ':', newStories.length);
            } catch (error) {
              console.error('Error loading interest stories:', error);
              newStories = [];
            }
          }
          break;
          
        case 'subreddit':
          if (subreddit) {
            try {
              const subredditRecommendations = await apiService.getSubredditRecommendations(subreddit, userId, 20, pageNum);
              newStories = subredditRecommendations.map(rec => rec.post);
              console.log('Loaded subreddit stories for', subreddit, ':', newStories.length);
            } catch (error) {
              console.error('Error loading subreddit stories:', error);
              newStories = [];
            }
          }
          break;
      }

      // Remove duplicates based on story ID
      const uniqueStories = newStories.filter((story, index, self) => 
        index === self.findIndex(s => s.id === story.id)
      );

      if (isRefresh) {
        setStories(uniqueStories);
      } else {
        // Filter out stories that already exist to prevent duplicates
        const existingIds = new Set(stories.map(s => s.id));
        const filteredNewStories = uniqueStories.filter(story => !existingIds.has(story.id));
        setStories(prev => [...prev, ...filteredNewStories]);
      }

      // Check if we have more data
      setHasMoreData(uniqueStories.length === 20);
      console.log('Stories loaded successfully:', uniqueStories.length);
      
    } catch (error) {
      console.error('Error loading stories:', error);
      // Don't crash the app, just show empty state
      if (isRefresh) {
        setStories([]);
      }
      setHasMoreData(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMoreData) return;
    
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await loadStories(nextPage);
    setLoadingMore(false);
  }, [loadingMore, hasMoreData, page, stories]);

  const handlePlayAudio = async (story: RedditPost) => {
    if (audioLoading === story.id) return;

    try {
      setAudioLoading(story.id);
      const text = story.selftext || story.title;
      const loaded = await audioService.loadAudioStream(text, undefined, story);
      if (loaded) {
        await audioService.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setAudioLoading(null);
    }
  };

  const renderStory = ({ item: story, index }: { item: RedditPost; index: number }) => (
    <View style={styles.storyContainer}>
      <EnhancedStoryCard
        story={story}
        onPress={() => {/* Handle story press */}}
        isPlaying={playerState.isPlaying}
        isLoading={audioLoading === story.id}
        size="large"
      />
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.neutral.gray[400]} />
        <Text style={styles.loadingText}>Loading more stories...</Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      <View style={styles.underlineBar} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary.blue} />
      
      {/* Header with back button */}
      <LinearGradient
        colors={[theme.colors.primary.blue, theme.colors.secondary.blue]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            console.log('Back button pressed, navigating to Home');
            if (navigation && navigation.goBack) {
              navigation.goBack();
            } else if (navigation && navigation.navigate) {
              navigation.navigate('Home');
            } else {
              console.log('Navigation not available');
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{title}</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.neutral.gray[400]} />
          <Text style={styles.loadingText}>Loading stories...</Text>
        </View>
      ) : (
        <FlatList
          data={stories}
          renderItem={renderStory}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.neutral.gray[400]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.8}
          ListFooterComponent={renderFooter}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Audio Player */}
      {playerState.isLoaded && <AudioPlayer />}
    </SafeAreaView>
  );
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
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40, // Same width as back button for centering
  },
  headerContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.neutral.gray[400],
    marginBottom: theme.spacing.md,
  },
  underlineBar: {
    height: 3,
    backgroundColor: theme.colors.primary.orange,
    width: 60,
    borderRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.neutral.gray[400],
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: theme.spacing.xl,
  },
  storyContainer: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  errorText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  backButtonText: {
    fontSize: 16,
    color: theme.colors.primary.orange,
    fontWeight: '600',
  },
});

export default CategoryScreen;
