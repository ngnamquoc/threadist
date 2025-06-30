import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import theme, { MaterialIcons } from '../styles/theme';
import { authService } from '../services/authService';

interface LoginScreenProps {
  navigation?: any; // You can replace with proper navigation type
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const { user, error } = await authService.signIn(email, password);
      
      if (error) {
        Alert.alert('Login Failed', error.message);
        return;
      }

      if (user) {
        // Check if email needs confirmation
        if (!authService.isEmailConfirmed(user)) {
          navigation?.navigate('EmailConfirmation', { user });
        } else if (!user.user_metadata?.interests) {
          navigation?.navigate('Interests');
        } else {
          navigation?.navigate('Home');
        }
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { user, error } = await authService.signInWithGoogle();
      
      if (error) {
        Alert.alert('Google Login Failed', error.message);
        return;
      }

      if (!user) {
        Alert.alert('Login Failed', 'Unable to complete Google login. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Google Login Failed', error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary.blue} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Log in</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder=""
                placeholderTextColor={theme.colors.neutral.gray[400]}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                placeholder=""
                placeholderTextColor={theme.colors.neutral.gray[400]}
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>

            {/* Forgot Password & Sign Up Links */}
            <View style={styles.linksContainer}>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.linkText}>Forgot your password?</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.signUpLink}
                onPress={() => navigation?.navigate('SignUp')}
                activeOpacity={0.8}
              >
                <Text style={styles.signUpLinkText}>
                  Don't have an account? <Text style={styles.signUpLinkHighlight}>Sign up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={[styles.socialButton, styles.googleButton]}
              onPress={handleGoogleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary.blue,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
  },

  header: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing['2xl'],
  },
  title: {
    fontSize: theme.fontSize['3xl'],
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.primary.orange,
    fontFamily: 'CeraPro-Bold',
  },

  form: {
    marginBottom: theme.spacing['4xl'],
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.fontSize.base,
    color: theme.colors.neutral.gray[300],
    marginBottom: theme.spacing.xs,
    fontFamily: 'CeraPro-Regular',
  },
  input: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral.gray[600],
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: 0,
    fontSize: theme.fontSize.base,
    color: theme.colors.neutral.white,
    fontFamily: 'CeraPro-Regular',
  },

  loginButton: {
    backgroundColor: theme.colors.primary.orange,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.md,
  },
  loginButtonText: {
    color: theme.colors.neutral.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold as any,
    fontFamily: 'CeraPro-Medium',
  },

  linksContainer: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  linkText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.neutral.white,
    fontFamily: 'CeraPro-Regular',
  },
  signUpLink: {
    alignItems: 'center',
  },
  signUpLinkText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.neutral.gray[300],
    fontFamily: 'CeraPro-Regular',
  },
  signUpLinkHighlight: {
    color: theme.colors.neutral.white,
    fontWeight: theme.fontWeight.medium as any,
    fontFamily: 'CeraPro-Medium',
  },

  socialContainer: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    gap: theme.spacing.sm,
    ...theme.shadow.sm,
  },
  socialButtonText: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium as any,
    fontFamily: 'CeraPro-Medium',
    color: theme.colors.neutral.white,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  googleIcon: {
    color: theme.colors.neutral.white,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    fontFamily: 'CeraPro-Bold',
  },
});

export default LoginScreen;
