export interface Card {
  id: string;
  cover: string;
  name: string;
  description?: string;
  stackId: string;
  createdAt: number;
}

export interface Stack {
  id: string;
  name: string;
  cover: string; // URL or color/gradient
  createdAt: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type Theme = 'light' | 'dark';

