import type { Card, Stack } from '../types';

const STORAGE_KEYS = {
  STACKS: 'wishlist_stacks',
  CARDS: 'wishlist_cards',
} as const;

export const storage = {
  // Stacks
  getStacks: (): Stack[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STACKS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading stacks from localStorage:', error);
      return [];
    }
  },

  saveStacks: (stacks: Stack[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.STACKS, JSON.stringify(stacks));
    } catch (error) {
      console.error('Error saving stacks to localStorage:', error);
    }
  },

  // Cards
  getCards: (): Card[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CARDS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading cards from localStorage:', error);
      return [];
    }
  },

  saveCards: (cards: Card[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
    } catch (error) {
      console.error('Error saving cards to localStorage:', error);
    }
  },

  // Clear all data
  clearAll: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.STACKS);
      localStorage.removeItem(STORAGE_KEYS.CARDS);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

