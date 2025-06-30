import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RedditPost } from '../services/apiService';
import theme from '../styles/theme';

interface EnhancedStoryCardProps {
  story: RedditPost;
  onPress: (story: RedditPost) => void;
  isPlaying?: boolean;
  isLoading?: boolean;
  size?: 'small' | 'large';
  topicColor?: string;
}

// Topic color mapping based on subreddit categories
const getTopicColor = (subreddit: string): string => {
  const topicColors: { [key: string]: string } = {
    // Technology & Gaming
    'technology': '#6366F1', // Indigo
    'gaming': '#8B5CF6', // Purple
    'pcgaming': '#8B5CF6',
    'buildapc': '#6366F1',
    'webdev': '#6366F1',
    'programming': '#6366F1',
    
    // Entertainment & Media
    'movies': '#EF4444', // Red
    'television': '#EF4444',
    'tv': '#EF4444',
    'music': '#F59E0B', // Amber
    'books': '#10B981', // Emerald
    'netflix': '#EF4444',
    
    // News & Politics
    'news': '#3B82F6', // Blue
    'worldnews': '#3B82F6',
    'politics': '#DC2626', // Red
    'upliftingnews': '#10B981',
    
    // Science & Education
    'science': '#059669', // Emerald
    'askscience': '#059669',
    'todayilearned': '#0D9488', // Teal
    'explainlikeimfive': '#0D9488',
    'til': '#0D9488',
    
    // Lifestyle & Health
    'fitness': '#16A34A', // Green
    'health': '#16A34A',
    'food': '#F97316', // Orange
    'cooking': '#F97316',
    'recipes': '#F97316',
    
    // Sports
    'sports': '#EA580C', // Orange
    'nfl': '#EA580C',
    'soccer': '#16A34A',
    'football': '#16A34A',
    'basketball': '#F59E0B',
    'baseball': '#3B82F6',
    
    // Finance & Business
    'investing': '#065F46', // Dark Green
    'stocks': '#065F46',
    'personalfinance': '#0F766E', // Teal
    'wallstreetbets': '#EF4444',
    
    // Relationships & Social
    'relationships': '#EC4899', // Pink
    'dating_advice': '#EC4899',
    'socialskills': '#A855F7', // Purple
    'askreddit': '#A855F7',
    
    // Funny & Memes
    'funny': '#F59E0B', // Amber
    'memes': '#8B5CF6', // Purple
    'dankmemes': '#8B5CF6',
    'wholesomememes': '#10B981',
    
    // Default colors for unknown topics
    'default': '#032330', // theme.colors.primary.blue
  };

  const subredditLower = subreddit.toLowerCase();
  
  // Try exact match first
  if (topicColors[subredditLower]) {
    return topicColors[subredditLower];
  }
  
  // Try partial matches for compound subreddit names
  for (const [key, color] of Object.entries(topicColors)) {
    if (key !== 'default' && (subredditLower.includes(key) || key.includes(subredditLower))) {
      return color;
    }
  }
  
  // Generate a deterministic color based on subreddit name if no match found
  const predefinedColors = [
    '#6366F1', // Indigo
    '#8B5CF6', // Purple  
    '#EF4444', // Red
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#EC4899', // Pink
    '#16A34A', // Green
    '#EA580C', // Orange
    '#0D9488', // Teal
    '#DC2626', // Dark Red
    '#065F46', // Dark Green
  ];
  
  let hash = 0;
  for (let i = 0; i < subreddit.length; i++) {
    const char = subreddit.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const colorIndex = Math.abs(hash) % predefinedColors.length;
  return predefinedColors[colorIndex];
};

// Calculate reading and narration time estimates
const calculateTimeEstimates = (story: RedditPost) => {
  const wordsPerMinuteReading = 200; // Average reading speed
  const wordsPerMinuteNarration = 150; // Average narration speed
  
  // Count words in title and content
  const titleWords = story.title.split(/\s+/).length;
  const contentWords = story.content ? story.content.split(/\s+/).length : 0;
  const totalWords = titleWords + contentWords;
  
  // If no content, estimate based on typical Reddit post length
  const estimatedWords = totalWords > 0 ? totalWords : Math.max(50, story.num_comments * 5);
  
  const readingTime = Math.max(1, Math.ceil(estimatedWords / wordsPerMinuteReading));
  const narrationTime = Math.max(1, Math.ceil(estimatedWords / wordsPerMinuteNarration));
  
  return {
    readingTime: `${readingTime} min read`,
    narrationTime: `${narrationTime} min narration`
  };
};

const EnhancedStoryCard: React.FC<EnhancedStoryCardProps> = ({
  story,
  onPress,
  isPlaying = false,
  isLoading = false,
  size = 'large',
  topicColor,
}) => {
  const cardColor = topicColor || getTopicColor(story.subreddit);
  const timeEstimates = calculateTimeEstimates(story);
  
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

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: cardColor },
        size === 'small' && styles.smallContainer
      ]}
      onPress={() => onPress(story)}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {/* Subreddit Tag */}
        <Text style={styles.subredditTag}>r/{story.subreddit}</Text>
        
        {/* Title */}
        <Text 
          style={[styles.title, size === 'small' && styles.smallTitle]} 
          numberOfLines={size === 'small' ? 2 : 3}
        >
          {story.title}
        </Text>
        
        {/* Time Estimates */}
        <View style={styles.timeEstimates}>
          <View style={styles.timeItem}>
            <Ionicons name="headset-outline" size={12} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.timeText}>{timeEstimates.narrationTime}</Text>
          </View>
          <View style={styles.timeItem}>
            <Ionicons name="reader-outline" size={12} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.timeText}>{timeEstimates.readingTime}</Text>
          </View>
        </View>
        
        {/* Meta Information */}
        <View style={styles.metaContainer}>
          <View style={styles.metaLeft}>
            <View style={styles.metaItem}>
              <Ionicons name="arrow-up" size={12} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.metaText}>{story.score.toLocaleString()}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="chatbubble-outline" size={12} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.metaText}>{story.num_comments.toLocaleString()}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={12} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.metaText}>{formatTime(story.created_utc)}</Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Loading/Playing Indicators */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="rgba(255, 255, 255, 0.9)" />
        </View>
      )}
      
      {isPlaying && (
        <View style={styles.playingIndicator}>
          <Ionicons name="volume-high" size={16} color="rgba(255, 255, 255, 0.9)" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    position: 'relative',
    minHeight: 140,
  },
  smallContainer: {
    width: 300, // Increased width for better content display
    marginRight: theme.spacing.md,
    marginBottom: 0,
    minHeight: 160, // Increased height to accommodate time estimates
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  subredditTag: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'CeraPro-Medium',
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.neutral.white,
    fontFamily: 'CeraPro-Medium',
    lineHeight: theme.fontSize.lg * 1.3,
    marginBottom: theme.spacing.sm,
    flex: 1,
  },
  smallTitle: {
    fontSize: theme.fontSize.base,
    lineHeight: theme.fontSize.base * 1.3,
  },
  timeEstimates: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  timeText: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'CeraPro-Medium',
    fontWeight: '500',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaText: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'CeraPro-Regular',
  },
  loadingOverlay: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
  },
  playingIndicator: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EnhancedStoryCard;
