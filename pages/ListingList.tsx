import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useListings } from '../context/ListingContext';
import { ListingFilters, ListingType, PropertyType } from '../types';
import ListingCard from '../components/ListingCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { LISTING_TYPES, PROPERTY_TYPES } from '../constants';
import { formatNumber } from '../utils/helpers';

const ListingsPerPage = 9;

const ListingList: React.FC = () => {
  const { listings, fetchListings, loading, error } = useListings();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<ListingFilters>({
    type: searchParams.get('type') as ListingType || undefined,
    propertyType: searchParams.get('propertyType') as PropertyType || undefined,
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    minArea: searchParams.get('minArea') ? parseFloat(searchParams.get('minArea')!) : undefined,
    maxArea: searchParams.get('maxArea') ? parseFloat(searchParams.get('maxArea')!) : undefined,
    bedrooms: searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined,
    district: searchParams.get('district') || undefined,
    city: searchParams.get('city') || undefined,
    searchQuery: searchParams.get('search') || undefined,
  });

  const [currentPage, setCurrentPage] = useState<number>(1);

  const applyFilters = useCallback(async () => {
    setSearchParams(new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== undefined && value !== '').map(([key, value]) => [key, String(value)])));
    await fetchListings(filters);
    setCurrentPage(1); // Reset to first page on new filters
  }, [filters, fetchListings, setSearchParams]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    applyFilters(); // Apply filters when component mounts or filters state changes
  }, [applyFilters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value === '' ? undefined : (
        ['minPrice', 'maxPrice', 'minArea', 'maxArea', 'bedrooms'].includes(name)
          ? parseFloat(value) || undefined // Convert to number, or undefined if empty/invalid
          : value
      ),
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchParams({});
    fetchListings({}); // Fetch all listings
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(listings.length / ListingsPerPage);
  const currentListings = listings.slice(
    (currentPage - 1) * ListingsPerPage,
    currentPage * ListingsPerPage
  );

  return (
    <div className="min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Danh sách Bất động sản</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Bộ lọc nâng cao</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            id="filter-type"
            label="Loại tin"
            name="type"
            options={LISTING_TYPES}
            value={filters.type || ''}
            onChange={handleFilterChange}
            defaultOptionLabel="Tất cả"
          />
          <Select
            id="filter-propertyType"
            label="Loại BĐS"
            name="propertyType"
            options={PROPERTY_TYPES}
            value={filters.propertyType || ''}
            onChange={handleFilterChange}
            defaultOptionLabel="Tất cả"
          />
          <Input
            id="filter-minPrice"
            label="Giá từ (VNĐ)"
            name="minPrice"
            type="number"
            value={filters.minPrice || ''}
            onChange={handleFilterChange}
            placeholder="Min"
          />
          <Input
            id="filter-maxPrice"
            label="Giá đến (VNĐ)"
            name="maxPrice"
            type="number"
            value={filters.maxPrice || ''}
            onChange={handleFilterChange}
            placeholder="Max"
          />
          <Input
            id="filter-minArea"
            label="Diện tích từ (m²)"
            name="minArea"
            type="number"
            value={filters.minArea || ''}
            onChange={handleFilterChange}
            placeholder="Min"
          />
          <Input
            id="filter-maxArea"
            label="Diện tích đến (m²)"
            name="maxArea"
            type="number"
            value={filters.maxArea || ''}
            onChange={handleFilterChange}
            placeholder="Max"
          />
          <Input
            id="filter-bedrooms"
            label="Số phòng ngủ"
            name="bedrooms"
            type="number"
            value={filters.bedrooms || ''}
            onChange={handleFilterChange}
            placeholder="Số phòng"
            min="0"
          />
          <Input
            id="filter-district"
            label="Quận/Huyện"
            name="district"
            type="text"
            value={filters.district || ''}
            onChange={handleFilterChange}
            placeholder="Ví dụ: Quận 1"
          />
          <Input
            id="filter-city"
            label="Thành phố"
            name="city"
            type="text"
            value={filters.city || ''}
            onChange={handleFilterChange}
            placeholder="Ví dụ: Hồ Chí Minh"
          />
          <Input
            id="filter-searchQuery"
            label="Tìm kiếm chung"
            name="searchQuery"
            type="text"
            value={filters.searchQuery || ''}
            onChange={handleFilterChange}
            placeholder="Từ khóa tìm kiếm"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button onClick={applyFilters} className="flex-1">
            Áp dụng Bộ lọc
          </Button>
          <Button variant="secondary" onClick={handleClearFilters} className="flex-1">
            Xóa Bộ lọc
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : currentListings.length === 0 ? (
        <p className="text-center text-gray-600">Không tìm thấy tin rao phù hợp.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                size="sm"
              >
                Trước
              </Button>
              <span className="text-gray-700">
                Trang {formatNumber(currentPage)} / {formatNumber(totalPages)}
              </span>
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                size="sm"
              >
                Tiếp
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListingList;