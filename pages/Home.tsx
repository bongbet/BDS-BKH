import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListings } from '../context/ListingContext';
import { Listing, ListingType, PropertyType } from '../types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ListingCard from '../components/ListingCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home: React.FC = () => {
  const { listings, fetchListings, loading, error } = useListings();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);

  useEffect(() => {
    // Select 6 random listings as "featured"
    if (listings.length > 0) {
      const shuffled = [...listings].sort(() => 0.5 - Math.random());
      setFeaturedListings(shuffled.slice(0, 6));
    }
  }, [listings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/listings?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleQuickFilter = useCallback((filterType: 'type' | 'propertyType', value: ListingType | PropertyType) => {
    const queryParams = new URLSearchParams();
    if (filterType === 'type') {
      queryParams.append('type', value);
    } else if (filterType === 'propertyType') {
      queryParams.append('propertyType', value);
    }
    navigate(`/listings?${queryParams.toString()}`);
  }, [navigate]);

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <section className="bg-indigo-600 text-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4 text-center">Tìm kiếm bất động sản mơ ước của bạn</h1>
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
          <Input
            id="home-search"
            type="text"
            placeholder="Tìm kiếm theo địa chỉ, quận, thành phố, tên dự án..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow !bg-white !text-gray-800 border-none placeholder-gray-500"
            required
          />
          <Button type="submit" className="md:w-auto">
            Tìm kiếm
          </Button>
        </form>
      </section>

      {/* Quick Filters */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Danh mục nổi bật</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Button variant="secondary" onClick={() => handleQuickFilter('type', ListingType.SALE)}>
            Bán
          </Button>
          <Button variant="secondary" onClick={() => handleQuickFilter('type', ListingType.RENT)}>
            Thuê
          </Button>
          <Button variant="secondary" onClick={() => handleQuickFilter('propertyType', PropertyType.APARTMENT)}>
            Căn hộ
          </Button>
          <Button variant="secondary" onClick={() => handleQuickFilter('propertyType', PropertyType.HOUSE)}>
            Nhà phố
          </Button>
          <Button variant="secondary" onClick={() => handleQuickFilter('propertyType', PropertyType.LAND)}>
            Đất
          </Button>
          <Button variant="secondary" onClick={() => handleQuickFilter('propertyType', PropertyType.OFFICE)}>
            Văn phòng
          </Button>
        </div>
      </section>

      {/* Featured Listings */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Tin nổi bật</h2>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Button variant="outline" onClick={() => navigate('/listings')}>
            Xem tất cả tin tức
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;