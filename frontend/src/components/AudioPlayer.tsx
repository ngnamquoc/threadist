import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { audioService, AudioPlayerState } from '../services/audioService';
import theme from '../styles/theme';

const { width } = Dimensions.get('window');

interface AudioPlayerProps {
  onClose?: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ onClose }) => {
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    isPlaying: false,
    isPaused: false,
    isLoaded: false,
    duration: 0,
    position: 0,
  });
  const [progress] = useState(new Animated.Value(0));

  useEffect(() => {
    audioService.setOnStateChange(setPlayerState);
    
    return () => {
      audioService.setOnStateChange(() => {});
    };
  }, []);

  useEffect(() => {
    if (playerState.isLoaded && playerState.duration > 0) {
      const progressValue = playerState.position / playerState.duration;
      Animated.timing(progress, {
        toValue: progressValue,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  }, [playerState.position, playerState.duration]);

  const handlePlayPause = async () => {
    if (playerState.isPlaying) {
      await audioService.pause();
    } else {
      await audioService.play();
    }
  };

  const handleStop = async () => {
    await audioService.stop();
    if (onClose) {
      onClose();
    }
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressWidth = () => {
    if (playerState.duration === 0) return 0;
    return (playerState.position / playerState.duration) * (width - 80);
  };

  if (!playerState.isLoaded) {
    return null;
  }

  return (
    <LinearGradient
      colors={[theme.colors.primary.blue, theme.colors.primary.blue + 'CC']}
      style={styles.container}
    >
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, width - 80],
              }),
            },
          ]}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {playerState.currentStory?.title || 'Story'}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            r/{playerState.currentStory?.subreddit || 'subreddit'}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handlePlayPause}
          >
            <Ionicons
              name={playerState.isPlaying ? 'pause' : 'play'}
              size={24}
              color={theme.colors.neutral.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleStop}
          >
            <Ionicons
              name="stop"
              size={20}
              color={theme.colors.neutral.white}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.timeInfo}>
          <Text style={styles.timeText}>
            {formatTime(playerState.position)}
          </Text>
          <Text style={styles.timeText}>
            {formatTime(playerState.duration)}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary.orange,
    borderRadius: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.neutral.white,
    fontWeight: theme.fontWeight.medium as any,
    fontFamily: 'CeraPro-Medium',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.neutral.gray[300],
    fontFamily: 'CeraPro-Regular',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  timeInfo: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.neutral.gray[300],
    fontFamily: 'CeraPro-Regular',
  },
});

export default AudioPlayer; 