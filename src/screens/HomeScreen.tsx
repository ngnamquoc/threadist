import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import theme from '../styles/theme';
import { AuthUser, authService } from '../services/authService';

interface HomeScreenProps {
  navigation?: any;
  user?: AuthUser | null;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, user }) => {
  const handleSignOut = async () => {
    try {
      const { error } = await authService.signOut();
      if (error) {
        Alert.alert('Error', 'Failed to sign out');
      }
      // Navigation will be handled by the auth state change listener in App.tsx
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign out');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary.blue} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Threadist!</Text>
        {user?.email && (
          <Text style={styles.userInfo}>Logged in as: {user.email}</Text>
        )}
        <Text style={styles.subtitle}>
          Your personalized Reddit stories are coming soon...
        </Text>
        
        {user?.user_metadata?.interests && user.user_metadata.interests.length > 0 && (
          <View style={styles.interestsContainer}>
            <Text style={styles.interestsTitle}>Your Interests:</Text>
            {user.user_metadata.interests.map((interest, index) => (
              <Text key={index} style={styles.interestItem}>• {interest}</Text>
            ))}
          </View>
        )}
      </View>
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
    justifyContent: 'flex-end',
    padding: theme.spacing.lg,
  },
  signOutButton: {
    backgroundColor: theme.colors.primary.orange,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  signOutText: {
    color: theme.colors.neutral.white,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    fontFamily: 'CeraPro-Medium',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.primary.orange,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    fontFamily: 'CeraPro-Bold',
  },
  userInfo: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.neutral.gray[300],
    marginBottom: theme.spacing.lg,
    fontFamily: 'CeraPro-Regular',
  },
  subtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.neutral.white,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    fontFamily: 'CeraPro-Regular',
  },
  interestsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    maxWidth: 300,
  },
  interestsTitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.primary.orange,
    fontWeight: theme.fontWeight.semibold as any,
    marginBottom: theme.spacing.sm,
    fontFamily: 'CeraPro-Medium',
  },
  interestItem: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.neutral.white,
    marginBottom: theme.spacing.xs,
    fontFamily: 'CeraPro-Regular',
  },
});

export default HomeScreen;
