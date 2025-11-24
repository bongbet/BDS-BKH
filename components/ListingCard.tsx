import React from 'react';
import { Listing, ListingType } from '../types';
import { Link } from 'react-router-dom';
import { formatCurrency, formatArea } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../context/ListingContext';

interface ListingCardProps {
  listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const { user } = useAuth();
  const { addFavorite, removeFavorite, isFavorite } = useListings();

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Bạn cần đăng nhập để lưu tin!');
      return;
    }
    if (isFavorite(listing.id)) {
      await removeFavorite(listing.id);
    } else {
      await addFavorite(listing.id);
    }
  };

  const favoriteIcon = isFavorite(listing.id) ? (
    <svg className="h-6 w-6 text-red-500 fill-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  ) : (
    <svg className="h-6 w-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  );

  return (
    <Link to={`/listings/${listing.id}`} className="block">
      <div className="relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full flex flex-col">
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={listing.images[0] || 'https://picsum.photos/800/600?random=1'}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 p-1 bg-white rounded-full cursor-pointer" onClick={handleFavoriteClick}>
            {favoriteIcon}
          </div>
          <div className="absolute bottom-2 left-2 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-full capitalize">
            {listing.type === ListingType.SALE ? 'Bán' : 'Thuê'}
          </div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate-2-lines">
            {listing.title}
          </h3>
          <p className="text-xl font-bold text-indigo-700 mb-2">
            {formatCurrency(listing.price, listing.priceUnit)}
          </p>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <svg className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12l4 4V19z" />
              <path d="M18 11V7" />
              <path d="M13 11V7" />
            </svg>
            <span>{formatArea(listing.area)}</span>
            <span className="mx-2">|</span>
            <svg className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="15 9 12 12 9 9" />
            </svg>
            <span>{listing.bedrooms} PN</span>
          </div>
          <p className="text-sm text-gray-500 mt-auto flex items-center">
            <svg className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="3" />
            </svg>
            {listing.district}, {listing.city}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;