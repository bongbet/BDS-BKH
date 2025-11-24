import { User, Listing, Agent, Favorite, Conversation, SavedSearch, PasswordResetToken } from '../types';
import { seedUsers, seedListings, seedAgents, seedFavorites, seedConversations, seedPasswordResetTokens } from '../data/seed';
import { getLocalStorageItem, setLocalStorageItem } from './localStorage';

interface Database {
  users: User[];
  listings: Listing[];
  agents: Agent[];
  favorites: Favorite[];
  conversations: Conversation[];
  savedSearches: SavedSearch[];
  passwordResetTokens: PasswordResetToken[]; // New collection for password reset tokens
}

const DB_KEY = 'realEstateAppDB';

const initializeDB = (): Database => {
  const storedDB = getLocalStorageItem<Database>(DB_KEY);
  if (storedDB) {
    // Ensure all collections exist, even if empty in stored DB
    return {
      users: storedDB.users || [],
      listings: storedDB.listings || [],
      agents: storedDB.agents || [],
      favorites: storedDB.favorites || [],
      conversations: storedDB.conversations || [],
      savedSearches: storedDB.savedSearches || [],
      passwordResetTokens: storedDB.passwordResetTokens || [], // Initialize new collection
    };
  }

  // If no stored DB, initialize with seed data
  const initialDB: Database = {
    users: seedUsers,
    listings: seedListings,
    agents: seedAgents,
    favorites: seedFavorites,
    conversations: seedConversations,
    savedSearches: [],
    passwordResetTokens: seedPasswordResetTokens, // Initialize with seed data
  };
  setLocalStorageItem(DB_KEY, initialDB);
  return initialDB;
};

let db: Database = initializeDB();

const saveDB = () => {
  setLocalStorageItem(DB_KEY, db);
};

export const getCollection = <K extends keyof Database>(key: K): Database[K] => {
  return db[key];
};

export const setCollection = <K extends keyof Database>(key: K, data: Database[K]): void => {
  db[key] = data;
  saveDB();
};

export const updateCollection = <K extends keyof Database>(key: K, updater: (items: Database[K]) => Database[K]): void => {
  db[key] = updater(db[key]);
  saveDB();
};

export const resetDB = () => {
  localStorage.removeItem(DB_KEY);
  db = initializeDB();
};

// Helper to generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};