import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../context/ListingContext';
import { Listing, UserRole, ListingStatus } from '../types';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatArea, formatNumber } from '../utils/helpers';
import { DEFAULT_LISTING_IMAGE_URL } from '../constants';

const AgentDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { listings, fetchListings, deleteListing, loading: listingsLoading, error } = useListings();

  const [agentListings, setAgentListings] = useState<Listing[]>([]);
  const [totalViews, setTotalViews] = useState<number>(0);
  const [totalContactClicks, setTotalContactClicks] = useState<number>(0);

  const filterAgentListings = useCallback(() => {
    if (user && listings) {
      const filtered = listings.filter(l => l.postedByUserId === user.id);
      setAgentListings(filtered);
      setTotalViews(filtered.reduce((sum, l) => sum + (l.views || 0), 0));
      setTotalContactClicks(filtered.reduce((sum, l) => sum + (l.contactClicks || 0), 0));
    }
  }, [user, listings]);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== UserRole.AGENT) {
        alert('Bạn không có quyền truy cập trang này.');
        navigate('/home');
      } else {
        fetchListings(); // Ensure listings are up-to-date
      }
    }
  }, [user, authLoading, navigate, fetchListings]);

  useEffect(() => {
    filterAgentListings();
  }, [listings, user, filterAgentListings]);

  const handleDelete = async (listingId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tin rao này không?')) {
      const success = await deleteListing(listingId);
      if (success) {
        alert('Tin rao đã được xóa thành công.');
        fetchListings(); // Re-fetch to update the list
      } else {
        alert('Xóa tin rao thất bại.');
      }
    }
  };

  if (authLoading || listingsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner message="Đang tải dashboard..." />
      </div>
    );
  }

  if (!user || user.role !== UserRole.AGENT) {
    return null; // Should be redirected by ProtectedRoute
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Môi giới</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-indigo-100 p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-indigo-800">Tổng lượt xem</h2>
          <p className="text-3xl font-bold text-indigo-700">{formatNumber(totalViews)}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-green-800">Tổng lượt liên hệ</h2>
          <p className="text-3xl font-bold text-green-700">{formatNumber(totalContactClicks)}</p>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <Button onClick={() => navigate('/post-listing')} className="px-6 py-3">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Đăng tin mới
        </Button>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-4">Tin rao của bạn ({agentListings.length})</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {agentListings.length === 0 ? (
        <p className="text-center text-gray-600">Bạn chưa có tin rao nào. Hãy đăng tin đầu tiên!</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ảnh
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiêu đề & Địa chỉ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá & Diện tích
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lượt xem / LH
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agentListings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={listing.images[0] || DEFAULT_LISTING_IMAGE_URL}
                      alt={listing.title}
                      className="h-16 w-16 object-cover rounded-md"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 line-clamp-2">{listing.title}</div>
                    <div className="text-sm text-gray-500">{listing.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(listing.price, listing.priceUnit)}</div>
                    <div className="text-sm text-gray-500">{formatArea(listing.area)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Xem: {formatNumber(listing.views)}</div>
                    <div className="text-sm text-gray-500">LH: {formatNumber(listing.contactClicks)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    {/* FIX: Use ListingStatus enum for comparison */}
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      listing.status === ListingStatus.ACTIVE ? 'bg-green-100 text-green-800' :
                      (listing.status === ListingStatus.SOLD || listing.status === ListingStatus.RENTED) ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {/* FIX: Use ListingStatus enum for display text */}
                      {listing.status === ListingStatus.ACTIVE ? 'Đang hiển thị' : listing.status === ListingStatus.SOLD ? 'Đã bán' : listing.status === ListingStatus.RENTED ? 'Đã thuê' : listing.status === ListingStatus.EXPIRED ? 'Hết hạn' : listing.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/edit-listing/${listing.id}`)} className="mr-2">
                      Sửa
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(listing.id)}>
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;