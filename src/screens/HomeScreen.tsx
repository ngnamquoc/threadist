import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import theme from '../styles/theme';

interface HomeScreenProps {
  navigation?: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary.blue} />
      
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Threadist!</Text>
        <Text style={styles.subtitle}>
          Your personalized Reddit stories are coming soon...
        </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize['3xl'],
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.neutral.white,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontFamily: 'CeraPro-Bold',
  },
  subtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.neutral.gray[300],
    textAlign: 'center',
    fontFamily: 'CeraPro-Regular',
  },
});

export default HomeScreen;
