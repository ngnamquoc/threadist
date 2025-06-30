import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RedditPost } from '../services/apiService';
import theme from '../styles/theme';

interface StoryCardProps {
  story: RedditPost;
  onPress: (story: RedditPost) => void;
  isPlaying?: boolean;
  showPlayButton?: boolean;
}

const { width } = Dimensions.get('window');

const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onPress,
  isPlaying = false,
  showPlayButton = true,
}) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(story)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.subredditContainer}>
            <Text style={styles.subreddit}>r/{story.subreddit}</Text>
            <Text style={styles.time}>{formatTime(story.created_utc)}</Text>
          </View>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Ionicons name="arrow-up" size={12} color={theme.colors.primary.orange} />
              <Text style={styles.statText}>{story.score}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="chatbubble-outline" size={12} color={theme.colors.neutral.gray[400]} />
              <Text style={styles.statText}>{story.num_comments}</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.title} numberOfLines={2}>
          {story.title}
        </Text>
        
        <Text style={styles.contentText} numberOfLines={3}>
          {truncateText(story.content, 150)}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.author}>by u/{story.author}</Text>
          {showPlayButton && (
            <TouchableOpacity
              style={[styles.playButton, isPlaying && styles.playingButton]}
              onPress={() => onPress(story)}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={16}
                color={theme.colors.neutral.white}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.neutral.gray[800],
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  subredditContainer: {
    flex: 1,
  },
  subreddit: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary.orange,
    fontWeight: theme.fontWeight.medium as any,
    fontFamily: 'CeraPro-Medium',
  },
  time: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.neutral.gray[400],
    fontFamily: 'CeraPro-Regular',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  statText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.neutral.gray[400],
    marginLeft: 2,
    fontFamily: 'CeraPro-Regular',
  },
  title: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.neutral.white,
    fontWeight: theme.fontWeight.semibold as any,
    marginBottom: theme.spacing.sm,
    fontFamily: 'CeraPro-Medium',
    lineHeight: 22,
  },
  contentText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.neutral.gray[300],
    lineHeight: 18,
    marginBottom: theme.spacing.md,
    fontFamily: 'CeraPro-Regular',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.neutral.gray[400],
    fontFamily: 'CeraPro-Regular',
  },
  playButton: {
    backgroundColor: theme.colors.primary.orange,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingButton: {
    backgroundColor: theme.colors.primary.blue,
  },
});

export default StoryCard; 