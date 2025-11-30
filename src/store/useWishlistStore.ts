import { create } from 'zustand';
import type { Card, Stack } from '../types';
import { mockApi } from '../api/mockApi';
import { generateStackCover, getCardCount } from '../utils';
import { storage } from '../utils/storage';

interface WishlistState {
  stacks: Stack[];
  cards: Card[];
  isLoading: boolean;
  error: string | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  searchQuery: string;
  
  // Actions
  loadStacks: () => Promise<void>;
  loadCards: (stackId?: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  
  // Optimistic stack operations
  createStack: (name: string, cover?: string) => Promise<void>;
  updateStack: (stackId: string, updates: Partial<Stack>) => Promise<void>;
  deleteStack: (stackId: string) => Promise<void>;
  
  // Optimistic card operations
  createCard: (
    cover: string,
    name: string,
    description: string | undefined,
    stackId: string
  ) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  moveCard: (cardId: string, newStackId: string) => Promise<void>;
  copyCard: (cardId: string, newStackId: string) => Promise<void>;
  
  // Helpers
  getCardsByStack: (stackId: string) => Card[];
  getStackCardCount: (stackId: string) => number;
  getFilteredStacks: () => Stack[];
}

// Load initial data from localStorage
const initialStacks = storage.getStacks();
const initialCards = storage.getCards();

export const useWishlistStore = create<WishlistState>((set, get) => ({
  stacks: initialStacks,
  cards: initialCards,
  isLoading: false,
  error: null,
  syncStatus: 'idle',
  searchQuery: '',
  
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  loadStacks: async () => {
    set({ isLoading: true, error: null });
    try {
      // First try localStorage
      const localStacks = storage.getStacks();
      if (localStacks.length > 0) {
        set({ stacks: localStacks, isLoading: false });
      }
      
      // Then sync with API
      const response = await mockApi.getStacks();
      if (response.success && response.data) {
        set({ stacks: response.data, isLoading: false });
        storage.saveStacks(response.data);
      } else if (localStacks.length === 0) {
        set({ error: response.error || 'Failed to load stacks', isLoading: false });
      }
    } catch (error) {
      // Fallback to localStorage if API fails
      const localStacks = storage.getStacks();
      set({ stacks: localStacks, isLoading: false, error: null });
    }
  },

  loadCards: async (stackId?: string) => {
    set({ isLoading: true, error: null });
    try {
      // First try localStorage
      const localCards = storage.getCards();
      const filteredCards = stackId 
        ? localCards.filter(c => c.stackId === stackId)
        : localCards;
      
      if (filteredCards.length > 0 || !stackId) {
        set({ cards: localCards, isLoading: false });
      }
      
      // Then sync with API
      const response = await mockApi.getCards(stackId);
      if (response.success && response.data) {
        if (stackId) {
          // Merge cards: keep existing, update/add from API
          const existingCards = get().cards.filter(c => c.stackId !== stackId);
          set({ cards: [...existingCards, ...response.data], isLoading: false });
        } else {
          set({ cards: response.data, isLoading: false });
        }
        storage.saveCards(get().cards);
      } else if (filteredCards.length === 0 && stackId) {
        set({ error: response.error || 'Failed to load cards', isLoading: false });
      }
    } catch (error) {
      // Fallback to localStorage if API fails
      const localCards = storage.getCards();
      set({ cards: localCards, isLoading: false, error: null });
    }
  },

  createStack: async (name: string, cover?: string) => {
    const tempId = `temp-${Date.now()}`;
    const stackCover = cover || generateStackCover();
    
    // Optimistic update
    const optimisticStack: Stack = {
      id: tempId,
      name,
      cover: stackCover,
      createdAt: Date.now(),
    };
    
    set(state => ({
      stacks: [...state.stacks, optimisticStack],
      syncStatus: 'syncing',
    }));

    try {
      const response = await mockApi.createStack(name, stackCover);
      if (response.success && response.data) {
        // Replace temp with real data
        set(state => {
          const updatedStacks = state.stacks.map(s => s.id === tempId ? response.data! : s);
          storage.saveStacks(updatedStacks);
          return {
            stacks: updatedStacks,
            syncStatus: 'idle',
          };
        });
      } else {
        // Rollback
        set(state => ({
          stacks: state.stacks.filter(s => s.id !== tempId),
          error: response.error || 'Failed to create stack',
          syncStatus: 'error',
        }));
      }
    } catch (error) {
      // Rollback
      set(state => ({
        stacks: state.stacks.filter(s => s.id !== tempId),
        error: 'Failed to create stack',
        syncStatus: 'error',
      }));
    }
  },

  updateStack: async (stackId: string, updates: Partial<Stack>) => {
    const originalStack = get().stacks.find(s => s.id === stackId);
    if (!originalStack) return;

    // Ensure cover is always a string - use existing cover if not provided
    const finalUpdates: Partial<Stack> = {
      ...updates,
      cover: updates.cover || originalStack.cover || generateStackCover(),
    };

    // Optimistic update
    set(state => ({
      stacks: state.stacks.map(s =>
        s.id === stackId ? { ...s, ...finalUpdates } : s
      ),
      syncStatus: 'syncing',
    }));

    try {
      const response = await mockApi.updateStack(stackId, finalUpdates);
      if (!response.success) {
        // Rollback
        set(state => ({
          stacks: state.stacks.map(s => s.id === stackId ? originalStack : s),
          error: response.error || 'Failed to update stack',
          syncStatus: 'error',
        }));
      } else {
        set({ syncStatus: 'idle' });
        storage.saveStacks(get().stacks);
      }
    } catch (error) {
      // Rollback
      set(state => {
        const rolledBackStacks = state.stacks.map(s => s.id === stackId ? originalStack : s);
        storage.saveStacks(rolledBackStacks);
        return {
          stacks: rolledBackStacks,
          error: 'Failed to update stack',
          syncStatus: 'error',
        };
      });
    }
  },

  deleteStack: async (stackId: string) => {
    const stack = get().stacks.find(s => s.id === stackId);
    const stackCards = get().getCardsByStack(stackId);
    
    // Optimistic update
    set(state => ({
      stacks: state.stacks.filter(s => s.id !== stackId),
      cards: state.cards.filter(c => c.stackId !== stackId),
      syncStatus: 'syncing',
    }));

    try {
      const response = await mockApi.deleteStack(stackId);
      if (!response.success) {
        // Rollback
        set(state => ({
          stacks: [...state.stacks, stack!].sort((a, b) => a.createdAt - b.createdAt),
          cards: [...state.cards, ...stackCards],
          error: response.error || 'Failed to delete stack',
          syncStatus: 'error',
        }));
      } else {
        set({ syncStatus: 'idle' });
        storage.saveStacks(get().stacks);
        storage.saveCards(get().cards);
      }
    } catch (error) {
      // Rollback
      set(state => {
        const rolledBackStacks = [...state.stacks, stack!].sort((a, b) => a.createdAt - b.createdAt);
        const rolledBackCards = [...state.cards, ...stackCards];
        storage.saveStacks(rolledBackStacks);
        storage.saveCards(rolledBackCards);
        return {
          stacks: rolledBackStacks,
          cards: rolledBackCards,
          error: 'Failed to delete stack',
          syncStatus: 'error',
        };
      });
    }
  },

  createCard: async (
    cover: string,
    name: string,
    description: string | undefined,
    stackId: string
  ) => {
    const tempId = `temp-${Date.now()}`;
    
    // Optimistic update
    const optimisticCard: Card = {
      id: tempId,
      cover,
      name,
      description,
      stackId,
      createdAt: Date.now(),
    };
    
    set(state => ({
      cards: [...state.cards, optimisticCard],
      syncStatus: 'syncing',
    }));

    try {
      const response = await mockApi.createCard(cover, name, description, stackId);
      if (response.success && response.data) {
        set(state => {
          const updatedCards = state.cards.map(c => c.id === tempId ? response.data! : c);
          storage.saveCards(updatedCards);
          return {
            cards: updatedCards,
            syncStatus: 'idle',
          };
        });
      } else {
        set(state => ({
          cards: state.cards.filter(c => c.id !== tempId),
          error: response.error || 'Failed to create card',
          syncStatus: 'error',
        }));
      }
    } catch (error) {
      set(state => ({
        cards: state.cards.filter(c => c.id !== tempId),
        error: 'Failed to create card',
        syncStatus: 'error',
      }));
    }
  },

  updateCard: async (cardId: string, updates: Partial<Card>) => {
    const originalCard = get().cards.find(c => c.id === cardId);
    if (!originalCard) return;

    // Optimistic update
    set(state => ({
      cards: state.cards.map(c =>
        c.id === cardId ? { ...c, ...updates } : c
      ),
      syncStatus: 'syncing',
    }));

    try {
      const response = await mockApi.updateCard(cardId, updates);
      if (!response.success) {
        // Rollback
        set(state => ({
          cards: state.cards.map(c => c.id === cardId ? originalCard : c),
          error: response.error || 'Failed to update card',
          syncStatus: 'error',
        }));
      } else {
        set({ syncStatus: 'idle' });
        storage.saveCards(get().cards);
      }
    } catch (error) {
      // Rollback
      set(state => {
        const rolledBackCards = state.cards.map(c => c.id === cardId ? originalCard : c);
        storage.saveCards(rolledBackCards);
        return {
          cards: rolledBackCards,
          error: 'Failed to update card',
          syncStatus: 'error',
        };
      });
    }
  },

  deleteCard: async (cardId: string) => {
    const card = get().cards.find(c => c.id === cardId);
    
    // Optimistic update
    set(state => ({
      cards: state.cards.filter(c => c.id !== cardId),
      syncStatus: 'syncing',
    }));

    try {
      const response = await mockApi.deleteCard(cardId);
      if (!response.success) {
        // Rollback
        set(state => ({
          cards: [...state.cards, card!].sort((a, b) => a.createdAt - b.createdAt),
          error: response.error || 'Failed to delete card',
          syncStatus: 'error',
        }));
      } else {
        set({ syncStatus: 'idle' });
        storage.saveCards(get().cards);
      }
    } catch (error) {
      // Rollback
      set(state => {
        const rolledBackCards = [...state.cards, card!].sort((a, b) => a.createdAt - b.createdAt);
        storage.saveCards(rolledBackCards);
        return {
          cards: rolledBackCards,
          error: 'Failed to delete card',
          syncStatus: 'error',
        };
      });
    }
  },

  moveCard: async (cardId: string, newStackId: string) => {
    await get().updateCard(cardId, { stackId: newStackId });
  },

  copyCard: async (cardId: string, newStackId: string) => {
    const card = get().cards.find(c => c.id === cardId);
    if (!card) return;
    
    // Create a new card with the same content but new ID and stackId
    await get().createCard(card.cover, card.name, card.description, newStackId);
  },

  getCardsByStack: (stackId: string) => {
    return get().cards.filter(c => c.stackId === stackId);
  },

  getStackCardCount: (stackId: string) => {
    return getCardCount(stackId, get().cards);
  },

  getFilteredStacks: () => {
    const { stacks, searchQuery } = get();
    if (!searchQuery.trim()) {
      return stacks;
    }
    const query = searchQuery.toLowerCase();
    return stacks.filter(stack => 
      stack.name.toLowerCase().includes(query)
    );
  },
}));

