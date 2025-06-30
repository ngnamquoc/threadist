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
import StoryCard from '../components/StoryCard';
import AudioPlayer from '../components/AudioPlayer';

interface HomeScreenProps {
  navigation?: any;
  user?: AuthUser | null;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, user }) => {
  const [stories, setStories] = useState<RedditPost[]>([]);
  const [recommendations, setRecommendations] = useState<StoryRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RedditPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'recommended' | 'trending' | 'search'>('recommended');
  const [audioLoading, setAudioLoading] = useState<string | null>(null); // Track which story is loading
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

  const loadInitialData = async () => {
    setLoading(true);
    try {
      if (user?.id) {
        const recs = await apiService.getRecommendedStories(user.id, 15);
        setRecommendations(recs);
        setStories(recs.map(rec => rec.post));
      } else {
        const trending = await apiService.getTrendingStories(15);
        setRecommendations(trending);
        setStories(trending.map(rec => rec.post));
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await apiService.searchStories(searchQuery, undefined, 20);
      setSearchResults(results);
      setActiveTab('search');
    } catch (error) {
      console.error('Error searching stories:', error);
      Alert.alert('Error', 'Failed to search stories');
    } finally {
      setIsSearching(false);
    }
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

  const renderStoryItem = ({ item }: { item: RedditPost }) => (
    <StoryCard
      story={item}
      onPress={handleStoryPress}
      isPlaying={playerState.isPlaying && playerState.currentStory?.id === item.id}
      isLoading={audioLoading === item.id}
    />
  );

  const renderRecommendationItem = ({ item }: { item: StoryRecommendation }) => (
    <StoryCard
      story={item.post}
      onPress={handleStoryPress}
      isPlaying={playerState.isPlaying && playerState.currentStory?.id === item.post.id}
      isLoading={audioLoading === item.post.id}
    />
  );

  const renderTabButton = (
    title: string,
    tab: 'recommended' | 'trending' | 'search',
    icon: string
  ) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={activeTab === tab ? theme.colors.primary.orange : theme.colors.neutral.gray[400]}
      />
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const getCurrentData = () => {
    switch (activeTab) {
      case 'recommended':
        return recommendations.map(rec => rec.post);
      case 'trending':
        return stories;
      case 'search':
        return searchResults;
      default:
        return [];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary.blue} />
      
      <LinearGradient
        colors={[theme.colors.primary.blue, theme.colors.primary.blue + 'DD']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good {getGreeting()}</Text>
            <Text style={styles.userName}>{user?.email?.split('@')[0] || 'User'}</Text>
          </View>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color={theme.colors.neutral.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={theme.colors.neutral.gray[400]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search stories..."
              placeholderTextColor={theme.colors.neutral.gray[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={theme.colors.neutral.gray[400]} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.tabsContainer}>
          {renderTabButton('Recommended', 'recommended', 'heart')}
          {renderTabButton('Trending', 'trending', 'trending-up')}
          {searchResults.length > 0 && renderTabButton('Search', 'search', 'search')}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary.orange} />
            <Text style={styles.loadingText}>Loading stories...</Text>
          </View>
        ) : (
          <FlatList
            data={getCurrentData()}
            renderItem={renderStoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.storiesList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={theme.colors.primary.orange}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {playerState.isLoaded && <AudioPlayer />}
    </SafeAreaView>
  );
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
    backgroundColor: theme.colors.neutral.gray[900],
  },
  header: {
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.neutral.gray[300],
    fontFamily: 'CeraPro-Regular',
  },
  userName: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.neutral.white,
    fontWeight: theme.fontWeight.bold as any,
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
  searchContainer: {
    marginBottom: theme.spacing.lg,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.neutral.white,
    fontSize: theme.fontSize.base,
    marginLeft: theme.spacing.sm,
    fontFamily: 'CeraPro-Regular',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeTabButton: {
    backgroundColor: theme.colors.primary.orange,
  },
  tabText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.neutral.gray[300],
    marginLeft: theme.spacing.xs,
    fontFamily: 'CeraPro-Medium',
  },
  activeTabText: {
    color: theme.colors.neutral.white,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.neutral.gray[900],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.neutral.gray[400],
    marginTop: theme.spacing.md,
    fontFamily: 'CeraPro-Regular',
  },
  storiesList: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
});

export default HomeScreen;
