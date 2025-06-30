import { MaterialIcons } from '@expo/vector-icons';
import { ViewStyle, TextStyle } from 'react-native';

// Theme configuration
export const theme = {
  // Colors
  colors: {
    primary: {
      orange: '#FF4500',
      blue: '#032330',
    },
    secondary: {
      blue: '#05314C',
    },
    neutral: {
      white: '#FFFFFF',
      black: '#000000',
      gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
      },
    },
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
    '4xl': 80,
    '5xl': 96,
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
    '7xl': 72,
    '8xl': 96,
    '9xl': 128,
  },

  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Border radius
  borderRadius: {
    none: 0,
    sm: 2,
    base: 4,
    md: 6,
    lg: 8,
    xl: 12,
    '2xl': 16,
    '3xl': 24,
    full: 9999,
  },

  // Shadows
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    base: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.1,
      shadowRadius: 25,
      elevation: 5,
    },
  },

  // Typography presets
  typography: {
    h1: {
      fontSize: 36,
      fontWeight: '700',
      lineHeight: 1.25,
      fontFamily: 'CeraPro-Bold',
    },
    h2: {
      fontSize: 30,
      fontWeight: '700',
      lineHeight: 1.25,
      fontFamily: 'CeraPro-Bold',
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 1.375,
      fontFamily: 'CeraPro-Medium',
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 1.375,
      fontFamily: 'CeraPro-Medium',
    },
    h5: {
      fontSize: 18,
      fontWeight: '500',
      lineHeight: 1.5,
      fontFamily: 'CeraPro-Medium',
    },
    h6: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 1.5,
      fontFamily: 'CeraPro-Medium',
    },
    body1: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
      fontFamily: 'CeraPro-Regular',
    },
    body2: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.5,
      fontFamily: 'CeraPro-Regular',
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 1.5,
      fontFamily: 'CeraPro-Regular',
    },
    button: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 1.5,
      fontFamily: 'CeraPro-Medium',
    },
  },

  // Component styles
  components: {
    button: {
      primary: {
        backgroundColor: '#FF4500',
        color: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'CeraPro-Medium',
      },
      secondary: {
        backgroundColor: '#05314C',
        color: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'CeraPro-Medium',
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#FF4500',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FF4500',
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'CeraPro-Medium',
      },
    },
    input: {
      default: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        fontFamily: 'CeraPro-Regular',
        color: '#111827',
      },
      focused: {
        borderColor: '#FF4500',
        borderWidth: 2,
      },
      error: {
        borderColor: '#EF4444',
        borderWidth: 1,
      },
    },
    card: {
      default: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        ...{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
        },
      },
    },
  },
};

// Export Material Icons
export { MaterialIcons };

// Utility functions
export const getSpacing = (size: keyof typeof theme.spacing) => theme.spacing[size];
export const getFontSize = (size: keyof typeof theme.fontSize) => theme.fontSize[size];
export const getThemeColor = (colorPath: string) => {
  const keys = colorPath.split('.');
  let result: any = theme.colors;
  
  for (const key of keys) {
    result = result[key];
    if (result === undefined) return undefined;
  }
  
  return result;
};

// Type definitions
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
export type ThemeFontSize = typeof theme.fontSize;
export type ThemeTypography = typeof theme.typography;

export default theme;
