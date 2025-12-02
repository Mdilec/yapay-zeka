import { User, ChatSession, Transaction } from '../types';

// Keys for LocalStorage
const USERS_KEY = 'nexarion_users';
const CURRENT_USER_KEY = 'nexarion_current_user';
const CHATS_KEY = 'nexarion_chats';
const TRANSACTIONS_KEY = 'nexarion_transactions';

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- User Management ---

export const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

export const saveUser = (user: User) => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // If updating current user, update session too
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === user.id) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
};

export const loginUser = async (email: string): Promise<User> => {
  await delay(800); // Fake network delay
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (user) {
    // Reset admin status on login to prevent persistent admin access if key is missing
    // In a real app, admin status is in the DB. Here we handle it via the "secret key" logic in App.tsx mainly.
    // But we preserve the flag if it was already set in DB.
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  }
  
  // Register new user
  const newUser: User = {
    id: Date.now().toString(),
    email,
    name: email.split('@')[0],
    isPremium: false,
    isAdmin: false, // Default is false, only secret key enables admin panel view
    joinedAt: Date.now()
  };
  
  saveUser(newUser);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  return newUser;
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

// --- Chat History Management ---

export const getUserChats = (userId: string): ChatSession[] => {
  const allChats = localStorage.getItem(CHATS_KEY);
  const parsedChats: ChatSession[] = allChats ? JSON.parse(allChats) : [];
  return parsedChats.filter(chat => chat.userId === userId).sort((a, b) => b.lastUpdated - a.lastUpdated);
};

export const saveChatSession = (session: ChatSession) => {
  const allChatsRaw = localStorage.getItem(CHATS_KEY);
  let allChats: ChatSession[] = allChatsRaw ? JSON.parse(allChatsRaw) : [];
  
  const existingIndex = allChats.findIndex(c => c.id === session.id);
  if (existingIndex >= 0) {
    allChats[existingIndex] = session;
  } else {
    allChats.push(session);
  }
  
  localStorage.setItem(CHATS_KEY, JSON.stringify(allChats));
};

export const deleteChatSession = (chatId: string) => {
  const allChatsRaw = localStorage.getItem(CHATS_KEY);
  let allChats: ChatSession[] = allChatsRaw ? JSON.parse(allChatsRaw) : [];
  allChats = allChats.filter(c => c.id !== chatId);
  localStorage.setItem(CHATS_KEY, JSON.stringify(allChats));
};

// --- Admin & Payments ---

export const processPayment = async (userId: string, amount: number, cardDetails: any): Promise<boolean> => {
  await delay(2000); // Simulate Bank API call time
  
  // Basic validation simulation
  if (!cardDetails.cardNumber || cardDetails.cardNumber.length < 16) return false;

  const user = getUsers().find(u => u.id === userId);
  if (!user) return false;

  // Update user status
  user.isPremium = true;
  saveUser(user);

  // Record transaction
  const transactionsRaw = localStorage.getItem(TRANSACTIONS_KEY);
  const transactions: Transaction[] = transactionsRaw ? JSON.parse(transactionsRaw) : [];
  
  transactions.push({
    id: 'TRX-' + Date.now().toString().slice(-8),
    userId: user.id,
    userEmail: user.email,
    amount: amount,
    date: Date.now(),
    status: 'success'
  });
  
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  return true;
};

export const getAdminStats = () => {
  const users = getUsers();
  const transactionsRaw = localStorage.getItem(TRANSACTIONS_KEY);
  const transactions: Transaction[] = transactionsRaw ? JSON.parse(transactionsRaw) : [];
  
  const totalRevenue = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  
  return {
    totalUsers: users.length,
    activeProUsers: users.filter(u => u.isPremium).length,
    totalRevenue,
    transactions: transactions.sort((a, b) => b.date - a.date)
  };
};