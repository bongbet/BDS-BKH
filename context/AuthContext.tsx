import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, AuthContextType } from '../types';
import * as authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // Removed useNavigate from here as login/signup functions no longer use it directly
  // const navigate = useNavigate();

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const storedUser = authService.getCurrentUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Failed to get current user from local storage:', error);
      } finally {
        setLoading(false);
      }
    };
    checkCurrentUser();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.success && response.user) {
        setUser(response.user);
        return response.user; // Return the user object
      } else {
        alert(response.message || 'Đăng nhập thất bại.');
        return null; // Return null on failure
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Đã có lỗi xảy ra trong quá trình đăng nhập.');
      return null; // Return null on error
    } finally {
      setLoading(false);
    }
  }, []); // Removed navigate from dependency array

  const signup = useCallback(async (name: string, email: string, phone: string, password: string, role: UserRole = UserRole.BUYER): Promise<User | null> => {
    setLoading(true);
    try {
      const response = await authService.signup(name, email, phone, password, role);
      if (response.success && response.user) {
        setUser(response.user);
        return response.user; // Return the user object
      } else {
        alert(response.message || 'Đăng ký thất bại.');
        return null; // Return null on failure
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Đã có lỗi xảy ra trong quá trình đăng ký.');
      return null; // Return null on error
    } finally {
      setLoading(false);
    }
  }, []); // Removed navigate from dependency array

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      // NOTE: Redirection logic is handled by components using this context (e.g., Navbar, MyAccount)
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) {
      alert('Bạn cần đăng nhập để đổi mật khẩu.');
      return false;
    }
    setLoading(true);
    try {
      const response = await authService.updateUserPassword(user.id, currentPassword, newPassword);
      if (response.success) {
        alert(response.message || 'Mật khẩu đã được thay đổi thành công!');
        // No need to update user state here as password is not part of the `user` object in context.
        return true;
      } else {
        alert(response.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu hiện tại.');
        return false;
      }
    } catch (error: any) {
      console.error('Update password error:', error);
      alert(error.message || 'Đã có lỗi xảy ra khi đổi mật khẩu.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const requestPasswordReset = useCallback(async (email: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    try {
      const response = await authService.requestPasswordReset(email);
      if (response.success) {
        return { success: true, message: response.message };
      } else {
        alert(response.message || 'Yêu cầu đặt lại mật khẩu thất bại.');
        return { success: false, message: response.message || 'Yêu cầu đặt lại mật khẩu thất bại.' };
      }
    } catch (error: any) {
      console.error('Request password reset error:', error);
      alert('Đã có lỗi xảy ra khi yêu cầu đặt lại mật khẩu.');
      return { success: false, message: 'Đã có lỗi xảy ra khi yêu cầu đặt lại mật khẩu.' };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    try {
      const response = await authService.resetPassword(token, newPassword);
      if (response.success) {
        return { success: true, message: response.message };
      } else {
        alert(response.message || 'Đặt lại mật khẩu thất bại.');
        return { success: false, message: response.message || 'Đặt lại mật khẩu thất bại.' };
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      alert('Đã có lỗi xảy ra khi đặt lại mật khẩu.');
      return { success: false, message: 'Đã có lỗi xảy ra khi đặt lại mật khẩu.' };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = React.useMemo(() => ({
    user,
    login,
    signup,
    logout,
    updatePassword, // Added to context value
    requestPasswordReset, // Added to context value
    resetPassword, // Added to context value
    loading,
  }), [user, login, signup, logout, updatePassword, requestPasswordReset, resetPassword, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};