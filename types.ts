export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export enum ModelType {
  FLASH = 'gemini-2.5-flash',
  PRO = 'gemini-3-pro-preview'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: number;
  lastUpdated: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  isAdmin: boolean;
  avatar?: string;
  joinedAt: number;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  date: number;
  status: 'success' | 'failed';
}

export interface GenerateConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  thinkingBudget?: number;
}