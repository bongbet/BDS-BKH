import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { UserRole } from '../types';

const Login: React.FC = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu.');
      return;
    }

    const loggedInUser = await login(email, password); // login now returns User | null
    if (loggedInUser) {
      // FIX: Added null check for loggedInUser before accessing its properties
      if (loggedInUser.role === UserRole.ADMIN) {
        navigate('/admin-dashboard'); // Redirect admin to admin dashboard
      } else if (loggedInUser.role === UserRole.AGENT) {
        navigate('/dashboard'); // Redirect agent to agent dashboard
      } else {
        navigate('/home'); // Default redirect to home
      }
    } else {
      // Error message already shown by AuthContext.login if response.message exists
      // If AuthContext.login does not show a specific message, a generic one can be set here.
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Đăng nhập</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <Input
            id="login-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john.doe@example.com"
            required
            aria-required="true"
          />
          <Input
            id="login-password"
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
            aria-required="true"
          />
          <Button type="submit" loading={loading} className="w-full mt-6" aria-live="polite">
            Đăng nhập
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
            Quên mật khẩu?
          </Link>
        </p>
        <p className="text-center text-sm text-gray-600 mt-2">
          Chưa có tài khoản?{' '}
          <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;