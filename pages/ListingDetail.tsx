import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useListings } from '../context/ListingContext';
import { Listing, UserRole } from '../types';
import ImageCarousel from '../components/ImageCarousel';
import AgentInfoCard from '../components/AgentInfoCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { formatCurrency, formatArea, formatNumber } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_LISTING_IMAGE_URL } from '../constants';

const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getListingDetails,
    isFavorite,
    addFavorite,
    removeFavorite,
    deleteListing,
    loading,
    error,
  } = useListings();

  const [listing, setListing] = useState<Listing | null>(null);

  const fetchDetails = useCallback(async () => {
    if (id) {
      const fetchedListing = await getListingDetails(id);
      if (fetchedListing) {
        setListing(fetchedListing);
      } else {
        alert('Không tìm thấy tin rao hoặc có lỗi xảy ra.');
        navigate('/listings'); // Redirect if listing not found
      }
    }
  }, [id, getListingDetails, navigate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchDetails();
  }, [fetchDetails]);

  const handleFavoriteClick = async () => {
    if (!listing) return;
    if (!user) {
      alert('Bạn cần đăng nhập để lưu tin!');
      navigate('/login');
      return;
    }
    if (isFavorite(listing.id)) {
      await removeFavorite(listing.id);
      alert('Đã bỏ lưu tin!');
    } else {
      await addFavorite(listing.id);
      alert('Đã lưu tin thành công!');
    }
  };

  const handleDeleteListing = async () => {
    if (!listing || !user || (user.id !== listing.postedByUserId && user.role !== UserRole.ADMIN)) {
      alert('Bạn không có quyền xóa tin này.');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa tin rao này không?')) {
      const success = await deleteListing(listing.id);
      if (success) {
        alert('Tin rao đã được xóa thành công.');
        if (user.role === UserRole.ADMIN) {
          navigate('/admin-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        alert('Xóa tin rao thất bại.');
      }
    }
  };

  const handleEditListing = () => {
    if (listing && user && user.id === listing.postedByUserId) {
      navigate(`/edit-listing/${listing.id}`);
    } else {
      alert('Bạn không có quyền chỉnh sửa tin này.');
    }
  };

  if (loading || !listing) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner message="Đang tải chi tiết tin..." />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center py-8">{error}</p>;
  }

  const listingImages = listing.images.length > 0 ? listing.images : [DEFAULT_LISTING_IMAGE_URL];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      {listing.isHidden && user?.role === UserRole.ADMIN && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Tin này đang bị ẩn bởi quản trị viên.</p>
          <p className="text-sm">Người dùng thông thường không thể thấy tin này.</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ImageCarousel images={listingImages} />

          <h1 className="text-3xl font-bold text-gray-900 mt-6 mb-2">{listing.title}</h1>
          <p className="text-4xl font-extrabold text-indigo-700 mb-4">
            {formatCurrency(listing.price, listing.priceUnit)}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-gray-700 text-base mb-6 border-b pb-4">
            <p className="flex items-center">
              <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 012-2h12l4 4V19z" />
                <path d="M18 11V7" />
                <path d="M13 11V7" />
              </svg>
              {formatArea(listing.area)}
            </p>
            <p className="flex items-center">
              <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 18v-4M8 14h8" />
              </svg>
              {formatNumber(listing.bedrooms)} PN
            </p>
            <p className="flex items-center">
              <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M14 10h-4c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2zM12 7V4" />
              </svg>
              {formatNumber(listing.bathrooms)} WC
            </p>
            <p className="flex items-center">
              <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="3" />
              </svg>
              {listing.address}, {listing.district}, {listing.city}
            </p>
            <p className="flex items-center capitalize">
              <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19V6a3 3 0 00-3-3H4c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2zM9 19V6a3 3 0 013-3h2c1.1 0 2 .9 2 2v13c0 1.1-.9 2-2 2h-2a3 3 0 01-3-3zM14 5h-4" />
              </svg>
              {listing.propertyType === 'apartment' ? 'Căn hộ' : listing.propertyType === 'house' ? 'Nhà phố' : listing.propertyType === 'land' ? 'Đất' : listing.propertyType}
            </p>
            <p className="flex items-center capitalize">
              <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Đăng ngày: {new Date(listing.postedAt).toLocaleDateString('vi-VN')}
            </p>
          </div>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Mô tả chi tiết</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
          </section>

          {/* Map Section */}
          {/* Removed MapDisplay component since it's deleted and functionality is no longer needed. */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Vị trí trên bản đồ</h2>
            <div className="w-full h-[300px] bg-gray-200 flex items-center justify-center rounded-lg shadow-md overflow-hidden">
              <p className="text-gray-500">Chức năng bản đồ đã bị vô hiệu hóa.</p>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <Button
            onClick={handleFavoriteClick}
            className={`w-full py-3 rounded-lg flex items-center justify-center text-lg ${
              isFavorite(listing.id)
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            }`}
          >
            <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {isFavorite(listing.id) ? 'Bỏ lưu tin' : 'Lưu tin'}
          </Button>

          {(user?.id === listing.postedByUserId || user?.role === UserRole.ADMIN) && (
            <div className="flex gap-2">
              {user?.id === listing.postedByUserId && ( // Only agent can edit their own listing
                <Button variant="secondary" onClick={handleEditListing} className="flex-1">
                  Chỉnh sửa tin
                </Button>
              )}
              <Button variant="danger" onClick={handleDeleteListing} className="flex-1">
                Xóa tin
              </Button>
            </div>
          )}

          <AgentInfoCard agentUserId={listing.postedByUserId} listingId={listing.id} />

          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Thống kê tin rao</h3>
            <p className="text-gray-700 mb-2">Lượt xem: <span className="font-bold">{formatNumber(listing.views)}</span></p>
            <p className="text-gray-700">Lượt liên hệ: <span className="font-bold">{formatNumber(listing.contactClicks)}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;