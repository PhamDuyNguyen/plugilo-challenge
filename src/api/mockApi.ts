import type { Card, Stack, ApiResponse } from '../types';
import { generateId } from '../utils';
import { storage } from '../utils/storage';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Load from localStorage on initialization
let mockStacks: Stack[] = storage.getStacks();
let mockCards: Card[] = storage.getCards();

export const mockApi = {
  // Stack operations
  async getStacks(): Promise<ApiResponse<Stack[]>> {
    await delay(300);
    return { success: true, data: [...mockStacks] };
  },

  async createStack(name: string, cover: string): Promise<ApiResponse<Stack>> {
    await delay(500);
    const stack: Stack = {
      id: generateId(),
      name,
      cover,
      createdAt: Date.now(),
    };
    mockStacks.push(stack);
    storage.saveStacks(mockStacks);
    return { success: true, data: stack };
  },

  async updateStack(
    stackId: string,
    updates: Partial<Stack>
  ): Promise<ApiResponse<Stack>> {
    await delay(400);
    const index = mockStacks.findIndex(s => s.id === stackId);
    if (index === -1) {
      return { success: false, error: 'Stack not found' };
    }
    mockStacks[index] = { ...mockStacks[index], ...updates };
    storage.saveStacks(mockStacks);
    return { success: true, data: mockStacks[index] };
  },

  async deleteStack(stackId: string): Promise<ApiResponse<void>> {
    await delay(400);
    mockStacks = mockStacks.filter(s => s.id !== stackId);
    mockCards = mockCards.filter(c => c.stackId !== stackId);
    storage.saveStacks(mockStacks);
    storage.saveCards(mockCards);
    return { success: true };
  },

  // Card operations
  async getCards(stackId?: string): Promise<ApiResponse<Card[]>> {
    await delay(300);
    const cards = stackId
      ? mockCards.filter(c => c.stackId === stackId)
      : [...mockCards];
    return { success: true, data: cards };
  },

  async createCard(
    cover: string,
    name: string,
    description: string | undefined,
    stackId: string
  ): Promise<ApiResponse<Card>> {
    await delay(500);
    const card: Card = {
      id: generateId(),
      cover,
      name,
      description,
      stackId,
      createdAt: Date.now(),
    };
    mockCards.push(card);
    storage.saveCards(mockCards);
    return { success: true, data: card };
  },

  async updateCard(
    cardId: string,
    updates: Partial<Card>
  ): Promise<ApiResponse<Card>> {
    await delay(400);
    const index = mockCards.findIndex(c => c.id === cardId);
    if (index === -1) {
      return { success: false, error: 'Card not found' };
    }
    mockCards[index] = { ...mockCards[index], ...updates };
    storage.saveCards(mockCards);
    return { success: true, data: mockCards[index] };
  },

  async deleteCard(cardId: string): Promise<ApiResponse<void>> {
    await delay(400);
    mockCards = mockCards.filter(c => c.id !== cardId);
    storage.saveCards(mockCards);
    return { success: true };
  },

  async moveCard(
    cardId: string,
    newStackId: string
  ): Promise<ApiResponse<Card>> {
    await delay(400);
    return this.updateCard(cardId, { stackId: newStackId });
  },
};

