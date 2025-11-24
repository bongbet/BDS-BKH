import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const ForgotPassword: React.FC = () => {
  const { requestPasswordReset, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsError(false);

    if (!email) {
      setMessage('Vui lòng nhập địa chỉ email của bạn.');
      setIsError(true);
      return;
    }

    try {
      const response = await requestPasswordReset(email);
      if (response.success) {
        setMessage(response.message || 'Yêu cầu đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email của bạn.');
        setIsError(false);
        // Optionally navigate back to login after a short delay
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setMessage(response.message || 'Đã xảy ra lỗi khi gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại.');
        setIsError(true);
      }
    } catch (err) {
      console.error('Forgot password submission error:', err);
      setMessage('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
      setIsError(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Quên mật khẩu?</h1>
        <p className="text-center text-gray-600 mb-6">
          Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
        </p>
        {message && (
          <div className={`p-3 rounded-md mb-4 text-center ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <Input
            id="forgot-password-email"
            label="Email của bạn"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john.doe@example.com"
            required
            aria-required="true"
          />
          <Button type="submit" loading={loading} className="w-full mt-6" aria-live="polite">
            Gửi yêu cầu đặt lại mật khẩu
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;