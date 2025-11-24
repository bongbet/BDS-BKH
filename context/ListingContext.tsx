import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Listing, ListingFilters, Favorite } from '../types';
import * as listingService from '../services/listingService';
import { useAuth } from './AuthContext';

interface ListingContextType {
  listings: Listing[];
  favorites: Favorite[];
  fetchListings: (filters?: ListingFilters) => Promise<void>;
  getListingDetails: (id: string) => Promise<Listing | null>;
  addListing: (newListing: Omit<Listing, 'id' | 'postedAt' | 'views' | 'contactClicks' | 'isHidden'>) => Promise<Listing | null>;
  updateListing: (id: string, updatedFields: Partial<Listing>) => Promise<Listing | null>;
  deleteListing: (id: string) => Promise<boolean>;
  addFavorite: (listingId: string) => Promise<boolean>;
  removeFavorite: (listingId: string) => Promise<boolean>;
  isFavorite: (listingId: string) => boolean;
  incrementContactClicks: (listingId: string) => Promise<void>;
  toggleListingVisibility: (id: string, isHidden: boolean) => Promise<Listing | null>; // Added for admin
  loading: boolean;
  error: string | null;
}

const ListingContext = createContext<ListingContextType | undefined>(undefined);

export const ListingProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async (filters?: ListingFilters) => {
    setLoading(true);
    setError(null);
    try {
      // FIX: Add type guard to ensure response.data is Listing[]
      // For public views, always filter out hidden listings unless specifically requested by admin.
      const publicFilters = { ...filters, includeHidden: filters?.includeHidden || false };
      const response = await listingService.getListings(publicFilters);
      if (response.success && response.data && Array.isArray(response.data) && (response.data.length === 0 || 'title' in response.data[0])) {
        setListings(response.data as Listing[]);
      } else {
        setError(response.message || 'Failed to fetch listings.');
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('An unexpected error occurred while fetching listings.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFavorites = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      // FIX: Add type guard to ensure response.data is Favorite[]
      const response = await listingService.getFavorites(userId);
      if (response.success && response.data && Array.isArray(response.data) && (response.data.length === 0 || 'listingId' in response.data[0])) {
        setFavorites(response.data as Favorite[]);
      } else {
        setError(response.message || 'Failed to fetch favorites.');
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('An unexpected error occurred while fetching favorites.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) { // Only fetch listings once auth status is known
      fetchListings(); 
    }
  }, [authLoading, fetchListings]); // Depend on authLoading and fetchListings

  useEffect(() => {
    if (user) {
      fetchFavorites(user.id);
    } else {
      setFavorites([]); // Clear favorites if no user
    }
  }, [user, fetchFavorites]);

  const getListingDetails = useCallback(async (id: string): Promise<Listing | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await listingService.getListingById(id);
      if (response.success && response.data && !Array.isArray(response.data)) {
        // Update the local listings state with the new view count
        setListings(prevListings =>
          prevListings.map(l => (l.id === id ? (response.data as Listing) : l))
        );
        return response.data as Listing;
      } else {
        setError(response.message || 'Listing not found.');
        return null;
      }
    } catch (err) {
      console.error(`Error fetching listing ${id}:`, err);
      setError('An unexpected error occurred while fetching listing details.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addListing = useCallback(async (newListing: Omit<Listing, 'id' | 'postedAt' | 'views' | 'contactClicks' | 'isHidden'>): Promise<Listing | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await listingService.createListing(newListing);
      if (response.success && response.data && !Array.isArray(response.data)) {
        setListings(prevListings => [response.data as Listing, ...prevListings]);
        return response.data as Listing;
      } else {
        setError(response.message || 'Failed to add listing.');
        return null;
      }
    } catch (err) {
      console.error('Error adding listing:', err);
      setError('An unexpected error occurred while adding listing.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateListing = useCallback(async (id: string, updatedFields: Partial<Listing>): Promise<Listing | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await listingService.updateListing(id, updatedFields);
      if (response.success && response.data && !Array.isArray(response.data)) {
        setListings(prevListings =>
          prevListings.map(l => (l.id === id ? (response.data as Listing) : l))
        );
        return response.data as Listing;
      } else {
        setError(response.message || 'Failed to update listing.');
        return null;
      }
    } catch (err) {
      console.error(`Error updating listing ${id}:`, err);
      setError('An unexpected error occurred while updating listing.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteListing = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await listingService.deleteListing(id);
      if (response.success) {
        setListings(prevListings => prevListings.filter(l => l.id !== id));
        setFavorites(prevFavorites => prevFavorites.filter(fav => fav.listingId !== id)); // Also remove related favorites
        return true;
      } else {
        setError(response.message || 'Failed to delete listing.');
        return false;
      }
    } catch (err) {
      console.error(`Error deleting listing ${id}:`, err);
      setError('An unexpected error occurred while deleting listing.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const addFavorite = useCallback(async (listingId: string): Promise<boolean> => {
    if (!user) {
      alert('Bạn cần đăng nhập để lưu tin.');
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await listingService.addFavorite(user.id, listingId);
      if (response.success && response.data && !Array.isArray(response.data)) {
        setFavorites(prevFavorites => [...prevFavorites, response.data as Favorite]);
        return true;
      } else {
        alert(response.message || 'Không thể lưu tin.');
        return false;
      }
    } catch (err) {
      console.error('Error adding favorite:', err);
      setError('An unexpected error occurred while adding favorite.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const removeFavorite = useCallback(async (listingId: string): Promise<boolean> => {
    if (!user) return false;
    setLoading(true);
    setError(null);
    try {
      const response = await listingService.removeFavorite(user.id, listingId);
      if (response.success) {
        setFavorites(prevFavorites => prevFavorites.filter(fav => fav.listingId !== listingId));
        return true;
      } else {
        alert(response.message || 'Không thể bỏ lưu tin.');
        return false;
      }
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError('An unexpected error occurred while removing favorite.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const isFavorite = useCallback((listingId: string): boolean => {
    return user ? favorites.some(fav => fav.userId === user.id && fav.listingId === listingId) : false;
  }, [user, favorites]);

  const incrementContactClicks = useCallback(async (listingId: string) => {
    try {
      const response = await listingService.incrementContactClicks(listingId);
      if (response.success) {
        // Update the local listings state
        setListings(prevListings =>
          prevListings.map(l => (l.id === listingId ? { ...l, contactClicks: (l.contactClicks || 0) + 1 } : l))
        );
      }
    } catch (err) {
      console.error('Error incrementing contact clicks:', err);
    }
  }, []);

  const toggleListingVisibility = useCallback(async (id: string, isHidden: boolean): Promise<Listing | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await listingService.toggleListingVisibility(id, isHidden);
      if (response.success && response.data && !Array.isArray(response.data)) {
        setListings(prevListings =>
          prevListings.map(l => (l.id === id ? (response.data as Listing) : l))
        );
        return response.data as Listing;
      } else {
        setError(response.message || 'Failed to update listing visibility.');
        return null;
      }
    } catch (err) {
      console.error(`Error toggling visibility for listing ${id}:`, err);
      setError('An unexpected error occurred while toggling listing visibility.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = React.useMemo(() => ({
    listings,
    favorites,
    fetchListings,
    getListingDetails,
    addListing,
    updateListing,
    deleteListing,
    addFavorite,
    removeFavorite,
    isFavorite,
    incrementContactClicks,
    toggleListingVisibility, // Added to value
    loading,
    error,
  }), [
    listings,
    favorites,
    fetchListings,
    getListingDetails,
    addListing,
    updateListing,
    deleteListing,
    addFavorite,
    removeFavorite,
    isFavorite,
    incrementContactClicks,
    toggleListingVisibility, // Added to dependency array
    loading,
    error,
  ]);

  return (
    <ListingContext.Provider value={value}>
      {children}
    </ListingContext.Provider>
  );
};

export const useListings = (): ListingContextType => {
  const context = useContext(ListingContext);
  if (context === undefined) {
    throw new Error('useListings must be used within a ListingProvider');
  }
  return context;
};