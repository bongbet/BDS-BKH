import { Listing, ListingFilters, Favorite, ListingStatus } from '../types';
import { getCollection, setCollection, updateCollection, generateId } from './db';

// Refined interfaces for responses
interface GetListingsResponse {
  success: boolean;
  data?: Listing[];
  message?: string;
}

interface GetListingByIdResponse {
  success: boolean;
  data?: Listing;
  message?: string;
}

interface CreateUpdateListingResponse {
  success: boolean;
  data?: Listing; // For create/update, returns the created/updated listing
  message?: string;
}

interface DeleteListingResponse {
  success: boolean;
  message?: string;
}

interface GetFavoritesResponse {
  success: boolean;
  data?: Favorite[];
  message?: string;
}

interface AddRemoveFavoriteResponse {
  success: boolean;
  data?: Favorite; // For add, returns the new favorite
  message?: string;
}

interface IncrementContactClicksResponse {
  success: boolean;
  message?: string;
}

export const getListings = async (filters: ListingFilters = {}): Promise<GetListingsResponse> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call delay
  let listings = getCollection('listings');

  // Filter out hidden listings by default, unless explicitly requested to include them
  if (!filters.includeHidden) {
    listings = listings.filter(l => !l.isHidden);
  }

  // Apply filters
  if (filters.type) {
    listings = listings.filter(l => l.type === filters.type);
  }
  if (filters.propertyType) {
    listings = listings.filter(l => l.propertyType === filters.propertyType);
  }
  if (filters.minPrice !== undefined) {
    listings = listings.filter(l => l.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    listings = listings.filter(l => l.price <= filters.maxPrice!);
  }
  if (filters.minArea !== undefined) {
    listings = listings.filter(l => l.area >= filters.minArea!);
  }
  if (filters.maxArea !== undefined) {
    listings = listings.filter(l => l.area <= filters.maxArea!);
  }
  if (filters.bedrooms !== undefined) {
    listings = listings.filter(l => l.bedrooms >= filters.bedrooms!);
  }
  if (filters.district) {
    const searchDistrict = filters.district.toLowerCase();
    listings = listings.filter(l => l.district.toLowerCase().includes(searchDistrict));
  }
  if (filters.city) {
    const searchCity = filters.city.toLowerCase();
    listings = listings.filter(l => l.city.toLowerCase().includes(searchCity));
  }
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    listings = listings.filter(l => 
      l.title.toLowerCase().includes(query) || 
      l.description.toLowerCase().includes(query) ||
      l.address.toLowerCase().includes(query)
    );
  }

  // Sort by postedAt (newest first)
  listings.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  return { success: true, data: listings };
};

export const getListingById = async (id: string): Promise<GetListingByIdResponse> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call delay
  const listings = getCollection('listings');
  const listing = listings.find(l => l.id === id);

  if (listing) {
    // Increment view count (for simulation)
    updateCollection('listings', prevListings =>
      prevListings.map(l => (l.id === id ? { ...l, views: (l.views || 0) + 1 } : l))
    );
    return { success: true, data: { ...listing, views: (listing.views || 0) + 1 } }; // Return updated view count
  } else {
    return { success: false, message: 'Listing not found.' };
  }
};

export const createListing = async (newListing: Omit<Listing, 'id' | 'postedAt' | 'views' | 'contactClicks' | 'isHidden'>): Promise<CreateUpdateListingResponse> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call delay
  const listing: Listing = {
    ...newListing,
    id: generateId(),
    postedAt: new Date().toISOString(),
    views: 0,
    contactClicks: 0,
    status: ListingStatus.ACTIVE, // Default status
    isHidden: false, // New listings are not hidden by default
  };
  updateCollection('listings', prevListings => [...prevListings, listing]);
  return { success: true, data: listing };
};

export const updateListing = async (id: string, updatedFields: Partial<Listing>): Promise<CreateUpdateListingResponse> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call delay
  let listingFound = false;
  updateCollection('listings', prevListings =>
    prevListings.map(l => {
      if (l.id === id) {
        listingFound = true;
        return { ...l, ...updatedFields };
      }
      return l;
    })
  );
  if (listingFound) {
    const updatedListing = getCollection('listings').find(l => l.id === id);
    return { success: true, data: updatedListing };
  } else {
    return { success: false, message: 'Listing not found.' };
  }
};

export const deleteListing = async (id: string): Promise<DeleteListingResponse> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call delay
  const initialLength = getCollection('listings').length;
  updateCollection('listings', prevListings => prevListings.filter(l => l.id !== id));
  // Also remove from favorites that might reference this listing
  updateCollection('favorites', prevFavorites => prevFavorites.filter(fav => fav.listingId !== id));

  if (getCollection('listings').length < initialLength) {
    return { success: true, message: 'Listing deleted successfully.' };
  } else {
    return { success: false, message: 'Listing not found.' };
  }
};

export const getFavorites = async (userId: string): Promise<GetFavoritesResponse> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const favorites = getCollection('favorites');
  const userFavorites = favorites.filter(fav => fav.userId === userId);
  return { success: true, data: userFavorites };
};

export const addFavorite = async (userId: string, listingId: string): Promise<AddRemoveFavoriteResponse> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const favorites = getCollection('favorites');
  if (favorites.some(fav => fav.userId === userId && fav.listingId === listingId)) {
    return { success: false, message: 'Listing already in favorites.' };
  }
  const newFavorite: Favorite = {
    id: generateId(),
    userId,
    listingId,
    createdAt: new Date().toISOString(),
  };
  updateCollection('favorites', prevFavorites => [...prevFavorites, newFavorite]);
  return { success: true, data: newFavorite };
};

export const removeFavorite = async (userId: string, listingId: string): Promise<AddRemoveFavoriteResponse> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const initialLength = getCollection('favorites').length;
  updateCollection('favorites', prevFavorites =>
    prevFavorites.filter(fav => !(fav.userId === userId && fav.listingId === listingId))
  );
  if (getCollection('favorites').length < initialLength) {
    return { success: true, message: 'Listing removed from favorites.' };
  } else {
    return { success: false, message: 'Favorite not found.' };
  }
};

export const incrementContactClicks = async (listingId: string): Promise<IncrementContactClicksResponse> => {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate quick update
  let listingFound = false;
  updateCollection('listings', prevListings =>
    prevListings.map(l => {
      if (l.id === listingId) {
        listingFound = true;
        return { ...l, contactClicks: (l.contactClicks || 0) + 1 };
      }
      return l;
    })
  );
  if (listingFound) {
    return { success: true, message: 'Contact clicks incremented.' };
  } else {
    return { success: false, message: 'Listing not found.' };
  }
};

export const toggleListingVisibility = async (id: string, isHidden: boolean): Promise<CreateUpdateListingResponse> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call delay
  const listings = getCollection('listings');
  const listingIndex = listings.findIndex(l => l.id === id);

  if (listingIndex > -1) {
    const updatedListing = { ...listings[listingIndex], isHidden };
    updateCollection('listings', prevListings =>
      prevListings.map(l => (l.id === id ? updatedListing : l))
    );
    return { success: true, data: updatedListing };
  } else {
    return { success: false, message: 'Listing not found.' };
  }
};