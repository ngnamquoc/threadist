import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Alert,
} from 'react-native';
import theme, { MaterialIcons } from '../styles/theme';
import { authService, AuthUser } from '../services/authService';

interface EmailConfirmationScreenProps {
  navigation?: any;
  user?: AuthUser | null;
}

const EmailConfirmationScreen: React.FC<EmailConfirmationScreenProps> = ({ navigation, user: propUser }) => {
  const [isResending, setIsResending] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(propUser || null);
  const [isChecking, setIsChecking] = useState(false);

  // If no user prop provided, get current user from authService
  useEffect(() => {
    if (!propUser) {
      authService.getCurrentUser().then((user) => {
        setCurrentUser(user);
      });
    }
  }, [propUser]);

  // Poll for email confirmation status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentUser && !authService.isEmailConfirmed(currentUser)) {
      interval = setInterval(async () => {
        setIsChecking(true);
        try {
          const updatedUser = await authService.getCurrentUser();
          if (updatedUser && authService.isEmailConfirmed(updatedUser)) {
            setCurrentUser(updatedUser);
            // Email is confirmed, navigate based on user completion status
            if (!updatedUser.user_metadata?.interests) {
              navigation?.navigate('Interests');
            } else {
              navigation?.navigate('Home');
            }
          }
        } catch (error) {
          console.error('Error checking email confirmation:', error);
        } finally {
          setIsChecking(false);
        }
      }, 3000); // Check every 3 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [currentUser, navigation]);

  const user = currentUser;

  const handleResendConfirmation = async () => {
    if (!user?.email) {
      Alert.alert('Error', 'No email address found');
      return;
    }

    setIsResending(true);
    try {
      const { error } = await authService.resendConfirmation(user.email);
      
      if (error) {
        Alert.alert('Error', error.message || 'Failed to resend confirmation email');
      } else {
        Alert.alert(
          'Email Sent',
          'A new confirmation email has been sent. Please check your inbox.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend confirmation email');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = () => {
    navigation?.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary.blue} />
      
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <MaterialIcons
            name="mark-email-unread"
            size={80}
            color={theme.colors.primary.orange}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Confirm your email</Text>
        
        {/* Description */}
        <Text style={styles.description}>
          We've sent a confirmation link to:
        </Text>
        
        <Text style={styles.email}>
          {user?.email || 'your email address'}
        </Text>
        
        <Text style={styles.description}>
          Please check your inbox and click the confirmation link to continue.
        </Text>

        {/* Checking status */}
        {isChecking && (
          <Text style={styles.checkingText}>
            Checking for confirmation...
          </Text>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendConfirmation}
            disabled={isResending}
            activeOpacity={0.8}
          >
            <Text style={styles.resendButtonText}>
              {isResending ? 'Sending...' : 'Resend confirmation email'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleGoToLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.signOutButtonText}>
              Login
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Can't find the email? Check your spam folder or try resending.
          </Text>
        </View>
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
    paddingTop: theme.spacing['3xl'],
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.primary.orange,
    fontFamily: 'CeraPro-Bold',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  description: {
    fontSize: theme.fontSize.base,
    color: theme.colors.neutral.white,
    fontFamily: 'CeraPro-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.sm,
  },
  email: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.primary.orange,
    fontFamily: 'CeraPro-Medium',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    fontWeight: theme.fontWeight.medium as any,
  },
  actions: {
    width: '100%',
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  resendButton: {
    backgroundColor: theme.colors.primary.orange,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
  },
  resendButtonText: {
    color: theme.colors.neutral.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold as any,
    fontFamily: 'CeraPro-Medium',
  },
  signOutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.neutral.gray[500],
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: theme.colors.neutral.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium as any,
    fontFamily: 'CeraPro-Regular',
  },
  infoContainer: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.neutral.gray[400],
    fontFamily: 'CeraPro-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  checkingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary.orange,
    fontFamily: 'CeraPro-Medium',
    textAlign: 'center',
    marginVertical: theme.spacing.sm,
    fontStyle: 'italic',
  },
});

export default EmailConfirmationScreen;
