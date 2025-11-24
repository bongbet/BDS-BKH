import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../context/ListingContext';
import { Listing, UserRole, ListingStatus, User } from '../types';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatArea, formatNumber } from '../utils/helpers';
import { DEFAULT_LISTING_IMAGE_URL } from '../constants';
import * as userService from '../services/userService'; // Import userService

const AdminDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { listings, fetchListings, deleteListing, toggleListingVisibility, loading: listingsLoading, error } = useListings();

  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [usersMap, setUsersMap] = useState<Map<string, User>>(new Map());

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const response = await userService.getUserById(''); // Fetch all users
      if (response.success && Array.isArray(response.data)) {
        const fetchedUsers = response.data as User[];
        const map = new Map<string, User>();
        fetchedUsers.forEach(u => map.set(u.id, u));
        setUsersMap(map);
      } else {
        console.error("Failed to fetch all users:", response.message);
      }
    } catch (err) {
      console.error("Error fetching all users:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (!authLoading && !loadingUsers) {
      if (!user || user.role !== UserRole.ADMIN) {
        alert('Bạn không có quyền truy cập trang này.');
        navigate('/home');
      } else {
        // Fetch ALL listings, including hidden ones, for admin dashboard
        fetchListings({ includeHidden: true }); 
      }
    }
  }, [user, authLoading, navigate, fetchListings, loadingUsers]);

  useEffect(() => {
    setAllListings(listings);
  }, [listings]);

  const handleDelete = async (listingId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tin rao này không? Hành động này không thể hoàn tác.')) {
      const success = await deleteListing(listingId);
      if (success) {
        alert('Tin rao đã được xóa thành công.');
        fetchListings({ includeHidden: true }); // Re-fetch to update the list, including hidden ones
      } else {
        alert('Xóa tin rao thất bại.');
      }
    }
  };

  const handleToggleVisibility = async (listingId: string, currentIsHidden: boolean) => {
    const action = currentIsHidden ? 'hiển thị' : 'ẩn';
    if (window.confirm(`Bạn có chắc chắn muốn ${action} tin rao này không?`)) {
      const success = await toggleListingVisibility(listingId, !currentIsHidden);
      if (success) {
        alert(`Tin rao đã được ${action} thành công.`);
        fetchListings({ includeHidden: true }); // Re-fetch to update the list
      } else {
        alert(`Thao tác ${action} tin rao thất bại.`);
      }
    }
  };

  if (authLoading || listingsLoading || loadingUsers) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner message="Đang tải dữ liệu quản trị..." />
      </div>
    );
  }

  if (!user || user.role !== UserRole.ADMIN) {
    return null; // Should be redirected by ProtectedRoute
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard - Quản lý Tin rao</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {allListings.length === 0 ? (
        <p className="text-center text-gray-600">Không có tin rao nào để quản lý.</p>
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
                  Người đăng
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá & Diện tích
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hiển thị
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allListings.map((listing) => (
                <tr key={listing.id} className={listing.isHidden ? 'bg-gray-50 text-gray-400' : 'hover:bg-gray-50'}>
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
                    <Link to={`/listings/${listing.id}`} className="text-indigo-600 hover:text-indigo-800 text-xs mt-1 block">
                      Xem chi tiết
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{usersMap.get(listing.postedByUserId)?.name || 'Unknown User'}</div>
                    <div className="text-sm text-gray-500">{usersMap.get(listing.postedByUserId)?.email || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(listing.price, listing.priceUnit)}</div>
                    <div className="text-sm text-gray-500">{formatArea(listing.area)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      listing.status === ListingStatus.ACTIVE ? 'bg-green-100 text-green-800' :
                      (listing.status === ListingStatus.SOLD || listing.status === ListingStatus.RENTED) ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {listing.status === ListingStatus.ACTIVE ? 'Đang hiển thị' : listing.status === ListingStatus.SOLD ? 'Đã bán' : listing.status === ListingStatus.RENTED ? 'Đã thuê' : listing.status === ListingStatus.EXPIRED ? 'Hết hạn' : listing.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      listing.isHidden ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-800'
                    }`}>
                      {listing.isHidden ? 'Đã ẩn' : 'Hiển thị'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/edit-listing/${listing.id}`)}
                      className="mr-2"
                    >
                      Sửa
                    </Button>
                    <Button
                      variant={listing.isHidden ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleVisibility(listing.id, listing.isHidden)}
                      className="mr-2"
                    >
                      {listing.isHidden ? 'Hiển thị tin' : 'Ẩn tin'}
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

export default AdminDashboard;