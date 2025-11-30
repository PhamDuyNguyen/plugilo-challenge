/**
 * Design Tokens - Update these values to match Figma design
 * 
 * To get values from Figma:
 * 1. Select an element in Figma
 * 2. Check the right sidebar for exact values
 * 3. Update the corresponding token below
 */

export const designTokens = {
  // Dock Button
  dockButton: {
    size: 64, // width and height in pixels
    borderRadius: 16, // border radius in pixels
    backgroundColor: '#6366f1', // primary color
    iconColor: '#ffffff',
    position: {
      bottom: 24, // pixels from bottom
      right: 24, // pixels from right
    },
  },

  // Panel
  panel: {
    width: 420, // max width in pixels
    height: 680, // max height in pixels
    borderRadius: 24, // border radius in pixels
    backgroundColor: {
      light: '#ffffff',
      dark: '#1a1a1a',
    },
    borderColor: {
      light: '#e5e7eb',
      dark: '#2a2a2a',
    },
    shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    position: {
      bottom: 100, // pixels from bottom
      right: 24, // pixels from right
    },
  },

  // Stack Cards
  stackCard: {
    borderRadius: 16, // border radius in pixels
    coverHeight: 144, // cover image height in pixels
    spacing: 16, // gap between cards in pixels
    backgroundColor: {
      light: '#ffffff',
      dark: '#1f1f1f',
    },
    borderColor: {
      light: '#f3f4f6',
      dark: '#2a2a2a',
    },
  },

  // Typography
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: 20,
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 18,
      fontWeight: 600,
      lineHeight: 1.3,
    },
    body: {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.5,
    },
    small: {
      fontSize: 12,
      fontWeight: 400,
      lineHeight: 1.4,
    },
  },

  // Colors
  colors: {
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    text: {
      light: '#111827',
      dark: '#ffffff',
    },
    textSecondary: {
      light: '#6b7280',
      dark: '#9ca3af',
    },
    background: {
      light: '#ffffff',
      dark: '#1a1a1a',
    },
    border: {
      light: '#e5e7eb',
      dark: '#2a2a2a',
    },
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

