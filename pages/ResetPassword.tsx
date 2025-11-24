import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { resetPassword, loading } = useAuth();

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean>(true); // Assume valid until checked

  useEffect(() => {
    // In a real app, you might make an initial call here to validate the token
    // without resetting, just to check its existence and expiry.
    // For this simulation, we'll validate during submission.
    if (!token) {
      setMessage('Liên kết đặt lại mật khẩu không hợp lệ.');
      setIsError(true);
      setIsTokenValid(false);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsError(false);

    if (!token) {
      setMessage('Liên kết đặt lại mật khẩu không hợp lệ.');
      setIsError(true);
      return;
    }

    if (!newPassword || !confirmNewPassword) {
      setMessage('Vui lòng điền đầy đủ mật khẩu mới và xác nhận mật khẩu.');
      setIsError(true);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setMessage('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      setIsError(true);
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Mật khẩu mới phải có ít nhất 6 ký tự.');
      setIsError(true);
      return;
    }

    try {
      const response = await resetPassword(token, newPassword);
      if (response.success) {
        setMessage(response.message || 'Mật khẩu của bạn đã được đặt lại thành công!');
        setIsError(false);
        setTimeout(() => navigate('/login'), 3000); // Redirect to login after success
      } else {
        setMessage(response.message || 'Đặt lại mật khẩu thất bại. Liên kết có thể không hợp lệ hoặc đã hết hạn.');
        setIsError(true);
        setIsTokenValid(false); // Token might be invalid or expired
      }
    } catch (err) {
      console.error('Reset password submission error:', err);
      setMessage('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
      setIsError(true);
    }
  };

  if (!isTokenValid) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Lỗi</h1>
          <p className="text-gray-700 mb-6">{message || 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.'}</p>
          <Button onClick={() => navigate('/forgot-password')}>Yêu cầu liên kết mới</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Đặt lại mật khẩu của bạn</h1>
        {message && (
          <div className={`p-3 rounded-md mb-4 text-center ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <Input
            id="new-password"
            label="Mật khẩu mới"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="********"
            required
            aria-required="true"
          />
          <Input
            id="confirm-new-password"
            label="Xác nhận mật khẩu mới"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            placeholder="********"
            required
            aria-required="true"
          />
          <Button type="submit" loading={loading} className="w-full mt-6" aria-live="polite">
            Đặt lại mật khẩu
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;