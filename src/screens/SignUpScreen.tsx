import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import theme, { MaterialIcons } from '../styles/theme';

interface SignUpScreenProps {
  navigation?: any;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
  
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
    } catch (error: any) {
      Alert.alert('Google Sign Up Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary.blue} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create your account</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email address</Text>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder=""
                placeholderTextColor={theme.colors.neutral.gray[500]}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder=""
                  placeholderTextColor={theme.colors.neutral.gray[500]}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={theme.colors.neutral.gray[500]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Create Account Button */}
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleSignUp}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.createButtonText}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation?.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginLinkHighlight}>Login</Text>
              </Text>
            </TouchableOpacity>

          </View>

          {/* Social Sign Up Options */}
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignUp}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing['2xl'],
    paddingBottom: theme.spacing.xl,
  },

  // Header
  header: {
    marginBottom: theme.spacing['2xl'],
  },
  title: {
    fontSize: theme.fontSize['3xl'],
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.primary.orange,
    fontFamily: 'CeraPro-Bold',
    textAlign: 'left',
  },

  // Form
  form: {
    marginBottom: theme.spacing['3xl'],
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.neutral.gray[400],
    fontFamily: 'CeraPro-Regular',
    marginBottom: theme.spacing.xs,
  },
  textInput: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral.gray[600],
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSize.base,
    color: theme.colors.neutral.white,
    fontFamily: 'CeraPro-Regular',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral.gray[600],
  },
  passwordInput: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSize.base,
    color: theme.colors.neutral.white,
    fontFamily: 'CeraPro-Regular',
  },
  eyeButton: {
    padding: theme.spacing.xs,
  },

  // Buttons
  createButton: {
    backgroundColor: theme.colors.primary.orange,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  createButtonText: {
    color: theme.colors.neutral.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold as any,
    fontFamily: 'CeraPro-Medium',
  },

  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.neutral.gray[300],
    fontFamily: 'CeraPro-Regular',
  },
  loginLinkHighlight: {
    color: theme.colors.neutral.white,
    fontWeight: theme.fontWeight.medium as any,
    fontFamily: 'CeraPro-Medium',
  },

  // Social Sign Up
  socialContainer: {
    gap: theme.spacing.md,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    gap: theme.spacing.sm,
  },
  googleIcon: {
    color: theme.colors.neutral.white,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    fontFamily: 'CeraPro-Bold',
  },
  googleButtonText: {
    color: theme.colors.neutral.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium as any,
    fontFamily: 'CeraPro-Medium',
  },
});

export default SignUpScreen;
