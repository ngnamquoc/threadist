import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';
import { AuthUser, authService } from '../services/authService';
import { apiService, RedditPost, StoryRecommendation } from '../services/apiService';
import { audioService, AudioPlayerState } from '../services/audioService';
import EnhancedStoryCard from '../components/EnhancedStoryCard';

interface ExploreScreenProps {
  navigation?: any;
  user?: AuthUser | null;
}

const ExploreScreen: React.FC<ExploreScreenProps> = ({ navigation, user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RedditPost[]>([]);
  const [trendingStories, setTrendingStories] = useState<StoryRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
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
    loadTrendingStories();
    
    return () => {
      audioService.setOnStateChange(() => {});
    };
  }, []);

  const loadTrendingStories = async () => {
    try {
      setLoading(true);
      const stories = await apiService.getTrendingStories();
      setTrendingStories(stories);
    } catch (error) {
      console.error('Error loading trending stories:', error);
      Alert.alert('Error', 'Failed to load trending stories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const results = await apiService.searchStories(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching stories:', error);
      Alert.alert('Error', 'Failed to search stories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTrendingStories();
    if (searchQuery.trim()) {
      await handleSearch(searchQuery);
    }
    setRefreshing(false);
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

  const handlePlayStory = async (story: RedditPost) => {
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

  const renderStoryCard = (story: RedditPost, cardSize: 'small' | 'large' = 'large') => (
    <EnhancedStoryCard
      key={story.id}
      story={story}
      onPress={handlePlayStory}
      isPlaying={playerState.isPlaying && playerState.currentStory?.id === story.id}
      isLoading={audioLoading === story.id}
      size={cardSize}
    />
  );

  const renderTrendingSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trending Now</Text>
        <Text style={styles.sectionSubtitle}>Most popular stories across all topics</Text>
      </View>
      <FlatList
        data={trendingStories.slice(0, 8)} // Show more items for horizontal scrolling
        renderItem={({ item }) => renderStoryCard(item.post, 'small')}
        keyExtractor={(item) => item.post.id}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );

  const renderSearchResults = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Search Results</Text>
        <Text style={styles.sectionSubtitle}>{searchResults.length} stories found</Text>
      </View>
      <FlatList
        data={searchResults.slice(0, 8)} // Show more items for horizontal scrolling  
        renderItem={({ item }) => renderStoryCard(item, 'small')}
        keyExtractor={(item) => item.id}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Explore</Text>
          <View style={styles.headerUnderline} />
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.neutral.white} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.colors.neutral.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stories..."
            placeholderTextColor={theme.colors.neutral.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch(searchQuery)}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setSearchResults([]);
            }}>
              <Ionicons name="close-circle" size={20} color={theme.colors.neutral.gray[400]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {loading && searchResults.length === 0 && trendingStories.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.orange} />
          <Text style={styles.loadingText}>Loading stories...</Text>
        </View>
      ) : (
        <FlatList
          data={[{ type: searchQuery.trim() ? 'search' : 'trending' }]}
          renderItem={() => searchQuery.trim() ? renderSearchResults() : renderTrendingSection()}
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
    </View>
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
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  headerContent: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.neutral.white,
    fontFamily: 'CeraPro-Bold',
    marginBottom: theme.spacing.xs,
  },
  headerUnderline: {
    width: 60,
    height: 3,
    backgroundColor: theme.colors.primary.orange,
    borderRadius: 2,
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
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral.gray[800],
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.base,
    color: theme.colors.neutral.white,
    fontFamily: 'CeraPro-Regular',
  },
  mainContent: {
    paddingBottom: 100,
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

export default ExploreScreen;
