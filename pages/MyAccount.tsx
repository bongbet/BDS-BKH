import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../context/ListingContext';
import { Listing, UserRole } from '../types';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ListingCard from '../components/ListingCard';
import { DEFAULT_AVATAR_URL } from '../constants';
import Input from '../components/common/Input';

const MyAccount: React.FC = () => {
  const { user, logout, loading: authLoading, updatePassword } = useAuth();
  const navigate = useNavigate();
  const { listings, favorites, loading: listingsLoading } = useListings();

  const [favoriteListings, setFavoriteListings] = useState<Listing[]>([]);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState<boolean>(false);


  const fetchFavoriteListings = useCallback(() => {
    if (user && favorites && listings) {
      const favoritedIds = new Set(favorites.filter(fav => fav.userId === user.id).map(fav => fav.listingId));
      const filteredListings = listings.filter(listing => favoritedIds.has(listing.id));
      setFavoriteListings(filteredListings);
    } else {
      setFavoriteListings([]);
    }
  }, [user, favorites, listings]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchFavoriteListings();
  }, [fetchFavoriteListings]);


  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);
    setPasswordChangeSuccess(null);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordChangeError('Vui lòng điền đầy đủ các trường.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordChangeError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordChangeError('Mật khẩu mới không được giống mật khẩu hiện tại.');
      return;
    }

    setPasswordChangeLoading(true);
    const success = await updatePassword(currentPassword, newPassword);
    setPasswordChangeLoading(false);

    if (success) {
      setPasswordChangeSuccess('Mật khẩu đã được thay đổi thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowChangePasswordForm(false); // Hide form on success
    } else {
      // Error message is already displayed by AuthContext
      setPasswordChangeError('Đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu hiện tại.');
    }
  };

  if (authLoading || listingsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner message="Đang tải thông tin tài khoản..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-red-600">Bạn chưa đăng nhập</h2>
        <p className="text-gray-600 mt-2">Vui lòng đăng nhập để xem thông tin tài khoản.</p>
        <Button onClick={() => navigate('/login')} className="mt-4">Đăng nhập</Button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">Tài khoản của tôi</h1>

      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
        <img
          src={user.avatarUrl || DEFAULT_AVATAR_URL}
          alt={user.name}
          className="w-24 h-24 rounded-full object-cover border-4 border-indigo-200 shadow-md"
        />
        <div className="text-center sm:text-left">
          <p className="text-2xl font-bold text-gray-900">{user.name}</p>
          <p className="text-gray-600 mt-1">{user.email}</p>
          <p className="text-gray-600">{user.phone}</p>
          <p className="text-indigo-600 font-semibold capitalize mt-2">
            Vai trò: {user.role === UserRole.AGENT ? 'Môi giới / Chủ nhà' : 'Người mua'}
          </p>
        </div>
      </div>

      {passwordChangeSuccess && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
          <p className="font-bold">Thành công!</p>
          <p>{passwordChangeSuccess}</p>
        </div>
      )}

      {/* Change Password Section */}
      <div className="mb-8 border-t pt-4 border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Đổi mật khẩu</h2>
          <Button
            variant="secondary"
            onClick={() => setShowChangePasswordForm(!showChangePasswordForm)}
          >
            {showChangePasswordForm ? 'Hủy' : 'Đổi mật khẩu'}
          </Button>
        </div>

        {showChangePasswordForm && (
          <form onSubmit={handleChangePasswordSubmit} className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            {passwordChangeError && <p className="text-red-500 mb-4 text-center">{passwordChangeError}</p>}
            <Input
              id="current-password"
              label="Mật khẩu hiện tại"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              id="new-password"
              label="Mật khẩu mới"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              id="confirm-new-password"
              label="Xác nhận mật khẩu mới"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
            <Button type="submit" loading={passwordChangeLoading} className="w-full mt-4">
              Cập nhật mật khẩu
            </Button>
          </form>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Tin đã lưu của bạn ({favoriteListings.length})</h2>
        {favoriteListings.length === 0 ? (
          <p className="text-gray-600">Bạn chưa lưu tin nào.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => navigate('/chat')} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Danh sách cuộc trò chuyện
        </Button>
        <Button onClick={handleLogout} variant="danger" className="flex-1">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Đăng xuất
        </Button>
      </div>
    </div>
  );
};

export default MyAccount;