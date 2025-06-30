import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';

interface BottomNavigationProps {
  activeTab: 'for-you' | 'explore';
  onTabPress: (tab: 'for-you' | 'explore') => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabPress }) => {
  const renderTab = (
    tabKey: 'for-you' | 'explore',
    icon: string,
    label: string
  ) => {
    const isActive = activeTab === tabKey;
    
    return (
      <TouchableOpacity
        key={tabKey}
        style={styles.tabButton}
        onPress={() => onTabPress(tabKey)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={icon as any}
          size={24}
          color={isActive ? theme.colors.primary.orange : theme.colors.neutral.gray[400]}
        />
        <Text style={[
          styles.tabLabel,
          isActive && styles.activeTabLabel
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {renderTab('for-you', 'home', 'For You')}
        {renderTab('explore', 'search', 'Explore')}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.primary.blue,
    paddingBottom: 34, // Safe area padding for iPhone
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  tabLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.neutral.gray[400],
    fontFamily: 'CeraPro-Medium',
    marginTop: theme.spacing.xs,
  },
  activeTabLabel: {
    color: theme.colors.primary.orange,
  },
});

export default BottomNavigation;
