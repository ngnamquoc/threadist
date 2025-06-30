import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import theme from '../styles/theme';

interface WelcomeScreenProps {
  navigation?: any; // You can replace with proper navigation type
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary.blue} />

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo/reddit-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Tagline */}
        <Text style={styles.headline}>
          Catch Reddit's{'\n'}
          most viral stories in{'\n'}
          <Text style={styles.highlight}>60 seconds</Text>
        </Text>

        {/* Sub-tagline */}
        <Text style={styles.subheading}>
          Quick reads from AITA, creepy encounters, relationship drama, and more—curated just for you
        </Text>

        {/* CTA buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation?.navigate('SignUp')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation?.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnText}>Login</Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoContainer: {
    marginBottom: theme.spacing['3xl'],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius['3xl'],
  },
  logo: {
    width: 120,
    height: 120,
  },

  headline: {
    fontSize: theme.fontSize['4xl'],
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.neutral.white,
    lineHeight: theme.fontSize['4xl'] * theme.lineHeight.tight,
    textAlign: 'center',
    fontFamily: 'CeraPro-Bold',
    marginBottom: theme.spacing.md,
  },
  highlight: {
    color: theme.colors.primary.orange,
    fontFamily: 'CeraPro-Black',
  },

  subheading: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.neutral.gray[300],
    textAlign: 'center',
    lineHeight: theme.fontSize.sm * theme.lineHeight.relaxed,
    marginBottom: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing.md,
    fontFamily: 'CeraPro-Regular',
  },

  buttonContainer: {
    width: '100%',
    gap: theme.spacing.md,
  },

  primaryBtn: {
    backgroundColor: theme.colors.primary.orange,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    ...theme.shadow.md,
  },
  primaryBtnText: {
    color: theme.colors.neutral.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold as any,
    fontFamily: 'CeraPro-Medium',
  },

  secondaryBtn: {
    backgroundColor: '#05314C',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: theme.colors.neutral.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold as any,
    fontFamily: 'CeraPro-Medium',
  },
});

export default WelcomeScreen;
