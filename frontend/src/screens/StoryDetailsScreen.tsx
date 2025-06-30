import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
  Alert,
  Linking,
  Modal,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RedditPost } from '../services/apiService';
import { AuthUser } from '../services/authService';
import { audioService, AudioPlayerState } from '../services/audioService';
import theme from '../styles/theme';

interface StoryDetailsScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  route: {
    params: {
      story: RedditPost;
    };
  };
  user?: AuthUser | null;
}

export default function StoryDetailsScreen({ navigation, route, user }: StoryDetailsScreenProps) {
  const { story } = route.params;
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    isPlaying: false,
    isPaused: false,
    isLoaded: false,
    currentStory: null,
    duration: 0,
    position: 0,
  });
  const [audioLoading, setAudioLoading] = useState(false);
  const [showMediaPlayer, setShowMediaPlayer] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [modalHeight, setModalHeight] = useState(200);
  const [isDragging, setIsDragging] = useState(false);

  // Pan responder for modal height adjustment
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        console.log('Pan responder granted');
        setIsDragging(true);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Use dy directly to adjust height - negative dy means dragging up (increase height)
        const newHeight = Math.max(180, Math.min(400, 200 + (-gestureState.dy)));
        console.log('Dragging, new height:', newHeight, 'dy:', gestureState.dy);
        setModalHeight(newHeight);
      },
      onPanResponderRelease: (evt, gestureState) => {
        console.log('Pan responder released, velocity:', gestureState.vy);
        setIsDragging(false);
        // Snap to predefined heights based on final position
        const velocityThreshold = 0.5;
        if (gestureState.vy > velocityThreshold) {
          // Fast downward swipe - minimize
          console.log('Snapping to minimum height');
          setModalHeight(180);
        } else if (gestureState.vy < -velocityThreshold) {
          // Fast upward swipe - maximize
          console.log('Snapping to maximum height');
          setModalHeight(350);
        } else {
          // Snap to nearest based on current height
          const currentHeight = Math.max(180, Math.min(400, 200 + (-gestureState.dy)));
          const newHeight = currentHeight < 250 ? 180 : 350;
          console.log('Snapping to nearest height:', newHeight);
          setModalHeight(newHeight);
        }
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
      },
    })
  ).current;

  useEffect(() => {
    // Subscribe to audio player state changes
    audioService.setOnStateChange(setPlayerState);
    
    // Get initial state
    setPlayerState(audioService.getCurrentState());
    
    return () => {
      // Clean up
      audioService.setOnStateChange(() => {});
    };
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handlePlayPress = async () => {
    // If currently playing this story, show the player
    if (playerState.isPlaying && playerState.currentStory?.id === story.id) {
      setShowMediaPlayer(true);
      return;
    }

    // If this story is loaded but paused, resume and show player
    if (playerState.isPaused && playerState.currentStory?.id === story.id) {
      await audioService.play();
      setShowMediaPlayer(true);
      return;
    }

    // Otherwise, load and play new story
    try {
      setAudioLoading(true);
      
      // Load and play the story using streaming
      const success = await audioService.loadAudioStream(
        story.content, 
        "JBFqnCBsd6RMkjVDRZzb", // Default storytelling voice
        story
      );
      
      if (success) {
        await audioService.play();
        setShowMediaPlayer(true); // Show media player when audio starts
      } else {
        Alert.alert('Error', 'Failed to generate audio for this story');
      }
    } catch (error) {
      console.error('Error playing story:', error);
      Alert.alert('Error', 'Failed to play audio');
    } finally {
      setAudioLoading(false);
    }
  };

  const handleMediaPlayerToggle = async () => {
    if (playerState.isPlaying) {
      await audioService.pause();
    } else {
      await audioService.play();
    }
  };

  const handleSpeedChange = async () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    await audioService.setPlaybackSpeed(nextSpeed);
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSharePress = async () => {
    try {
      await Share.share({
        message: `${story.title}\n\nShared from Threadist`,
        url: story.url,
      });
    } catch (error) {
      console.error('Error sharing story:', error);
    }
  };

  const handleOpenReddit = async () => {
    try {
      await Linking.openURL(story.url);
    } catch (error) {
      console.error('Error opening Reddit link:', error);
      Alert.alert('Error', 'Could not open Reddit link');
    }
  };

  const isCurrentlyPlaying = playerState.isPlaying && playerState.currentStory?.id === story.id;
  const isCurrentlyPaused = playerState.isPaused && playerState.currentStory?.id === story.id;
  const isCurrentlyLoaded = playerState.isLoaded && playerState.currentStory?.id === story.id;

  // Determine button text and icon
  const getPlayButtonContent = () => {
    if (audioLoading) {
      return {
        icon: <ActivityIndicator size="small" color="#FFFFFF" />,
        text: 'Generating...'
      };
    }
    
    if (isCurrentlyPlaying) {
      return {
        icon: <Ionicons name="headset" size={24} color="#FFFFFF" />,
        text: 'Show Player'
      };
    }
    
    if (isCurrentlyPaused || (isCurrentlyLoaded && !isCurrentlyPlaying)) {
      return {
        icon: <Ionicons name="play" size={24} color="#FFFFFF" />,
        text: 'Resume Audio'
      };
    }
    
    return {
      icon: <Ionicons name="play" size={24} color="#FFFFFF" />,
      text: 'Play Audio'
    };
  };

  const playButtonContent = getPlayButtonContent();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.neutral.gray[800]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Story Details</Text>
        <TouchableOpacity onPress={handleSharePress} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={theme.colors.neutral.gray[800]} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Subreddit Badge */}
        <View style={styles.subredditBadge}>
          <Text style={styles.subredditText}>r/{story.subreddit}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{story.title}</Text>

        {/* Metadata */}
        <View style={styles.metadata}>
          <View style={styles.metadataItem}>
            <Ionicons name="person-outline" size={16} color={theme.colors.neutral.gray[600]} />
            <Text style={styles.metadataText}>u/{story.author}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Ionicons name="time-outline" size={16} color={theme.colors.neutral.gray[600]} />
            <Text style={styles.metadataText}>{formatDate(story.created_utc)}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="arrow-up" size={18} color={theme.colors.primary.orange} />
            <Text style={styles.statText}>{formatNumber(story.score)}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={18} color={theme.colors.neutral.gray[600]} />
            <Text style={styles.statText}>{formatNumber(story.num_comments)}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Story Content</Text>
          <Text style={styles.storyContent}>{story.content}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.playButton]} 
            onPress={handlePlayPress}
            disabled={audioLoading}
          >
            {playButtonContent.icon}
            <Text style={styles.playButtonText}>
              {playButtonContent.text}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Media Player Modal */}
      {showMediaPlayer && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showMediaPlayer}
          onRequestClose={async () => {
            // Pause audio when modal is closed via system back button
            if (playerState.isPlaying) {
              await audioService.pause();
            }
            setShowMediaPlayer(false);
          }}
          presentationStyle="overFullScreen"
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={styles.overlayTouchable}
              activeOpacity={1}
              onPress={async () => {
                // Pause audio when clicking outside
                if (playerState.isPlaying) {
                  await audioService.pause();
                }
                setShowMediaPlayer(false);
              }}
            />
            <View style={[styles.mediaPlayerModal, { height: modalHeight }]}>
              {/* Draggable Handle Area */}
              <View style={[styles.dragArea, isDragging && styles.dragAreaActive]} {...panResponder.panHandlers}>
                <View style={styles.handleBar} />
                <Text style={styles.dragText}>
                  {isDragging ? 'Dragging...' : 'Drag to resize'}
                </Text>
              </View>
              
              {/* Simplified Controls Layout */}
              <View style={styles.simplifiedControls}>
                {/* Play/Pause Button */}
                <TouchableOpacity onPress={handleMediaPlayerToggle} style={styles.playPauseButton}>
                  <Ionicons 
                    name={playerState.isPlaying ? "pause" : "play"} 
                    size={40} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
                
                {/* Speed Control */}
                <TouchableOpacity onPress={handleSpeedChange} style={styles.speedControlButton}>
                  <Text style={styles.speedControlText}>{playbackSpeed}X</Text>
                </TouchableOpacity>
              </View>
              
              {/* Handle bar at bottom */}
              <View style={styles.bottomHandleBar} />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral.gray[200],
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.neutral.gray[800],
  },
  shareButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subredditBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary.blue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  subredditText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.neutral.gray[800],
    lineHeight: 32,
    marginBottom: 16,
  },
  metadata: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metadataText: {
    fontSize: 14,
    fontWeight: '400',
    color: theme.colors.neutral.gray[600],
  },
  stats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.neutral.gray[800],
  },
  contentSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.neutral.gray[800],
    marginBottom: 12,
  },
  storyContent: {
    fontSize: 16,
    fontWeight: '400',
    color: theme.colors.neutral.gray[800],
    lineHeight: 24,
  },
  actionButtons: {
    gap: 12,
    paddingBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  playButton: {
    backgroundColor: theme.colors.primary.blue,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  redditButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF4500',
  },
  redditButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4500',
  },
  mediaPlayerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  mediaPlayerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  mediaPlayerContent: {
    zIndex: 1,
  },
  currentStoryInfo: {
    marginBottom: 12,
  },
  currentStoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  currentStoryAuthor: {
    fontSize: 14,
    fontWeight: '400',
    color: theme.colors.neutral.gray[300],
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  controlButton: {
    padding: 12,
    borderRadius: 24,
    marginHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  seekbarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  seekbar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.neutral.gray[600],
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  seekbarProgress: {
    height: '100%',
    backgroundColor: theme.colors.primary.blue,
  },
  currentTime: {
    fontSize: 12,
    fontWeight: '400',
    color: '#FFFFFF',
    minWidth: 40,
    textAlign: 'right',
  },
  duration: {
    fontSize: 12,
    fontWeight: '400',
    color: '#FFFFFF',
    minWidth: 40,
    textAlign: 'left',
  },
  speedControlContainer: {
    alignItems: 'center',
  },
  speedControlButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 60,
    alignItems: 'center',
  },
  speedControlText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // New Media Player Modal Styles
  mediaPlayerModal: {
    backgroundColor: '#2D3748',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 16,
    position: 'relative',
    minHeight: 180,
    maxHeight: 400,
  },
  simplifiedControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    marginVertical: 20,
    marginBottom: 30, // Added margin bottom for buttons
  },
  timeDisplay: {
    alignItems: 'center',
    marginVertical: 10,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  handleBar: {
    width: 60,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    opacity: 0.7,
    marginBottom: 4,
  },
  dragArea: {
    alignItems: 'center',
    paddingVertical: 15,
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 10,
  },
  dragAreaActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  playPauseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  bottomHandleBar: {
    width: 140,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    opacity: 0.7,
    marginTop: 16,
  },
  dragText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '400',
    marginTop: 8,
  },
});
