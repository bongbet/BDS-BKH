import { User, UserRole, PasswordResetToken } from '../types';
import { getCollection, updateCollection, generateId } from './db';
import { getLocalStorageItem, setLocalStorageItem, removeLocalStorageItem } from './localStorage';

const CURRENT_USER_KEY = 'currentUser';

interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export const getCurrentUser = (): User | null => {
  return getLocalStorageItem<User>(CURRENT_USER_KEY);
};

export const setCurrentUser = (user: User): void => {
  setLocalStorageItem(CURRENT_USER_KEY, user);
};

export const removeCurrentUser = (): void => {
  removeLocalStorageItem(CURRENT_USER_KEY);
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call delay

  const users = getCollection('users');
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    // Only store essential user info, omit password
    const userWithoutPassword: User = { ...user };
    delete userWithoutPassword.password;
    setCurrentUser(userWithoutPassword);
    return { success: true, user: userWithoutPassword };
  } else {
    return { success: false, message: 'Email hoặc mật khẩu không đúng.' };
  }
};

export const signup = async (name: string, email: string, phone: string, password: string, role: UserRole = UserRole.BUYER): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call delay

  const users = getCollection('users');
  if (users.some(u => u.email === email)) {
    return { success: false, message: 'Email đã tồn tại.' };
  }

  const newUser: User = {
    id: generateId(),
    name,
    email,
    phone,
    password, // Store password for simulation, in real app this would be hashed
    role,
    avatarUrl: `https://picsum.photos/40/40?random=${Math.floor(Math.random() * 100)}`,
  };

  updateCollection('users', (prevUsers) => [...prevUsers, newUser]);

  // Auto-login after signup
  const userWithoutPassword: User = { ...newUser };
  delete userWithoutPassword.password;
  setCurrentUser(userWithoutPassword);

  return { success: true, user: userWithoutPassword };
};

export const logout = async (): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call delay
  removeCurrentUser();
  return true;
};

export const updateUserPassword = async (userId: string, currentPasswordRaw: string, newPasswordRaw: string): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call delay

  const users = getCollection('users');
  let userFound = false;
  let updatedUser: User | undefined;

  updateCollection('users', prevUsers =>
    prevUsers.map(u => {
      if (u.id === userId) {
        userFound = true;
        if (u.password !== currentPasswordRaw) {
          throw new Error('Mật khẩu hiện tại không đúng.');
        }
        updatedUser = { ...u, password: newPasswordRaw };
        return updatedUser;
      }
      return u;
    })
  );

  if (!userFound) {
    return { success: false, message: 'Người dùng không tồn tại.' };
  }

  if (updatedUser) {
    const userWithoutPassword: User = { ...updatedUser };
    delete userWithoutPassword.password;
    // Update the current user in local storage if it's the logged-in user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(userWithoutPassword);
    }
    return { success: true, user: userWithoutPassword, message: 'Mật khẩu đã được thay đổi thành công!' };
  } else {
    // This case should ideally not be reached if userFound is true and no error was thrown
    return { success: false, message: 'Đã có lỗi xảy ra khi cập nhật mật khẩu.' };
  }
};

export const requestPasswordReset = async (email: string): Promise<{ success: boolean; message?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay

  const users = getCollection('users');
  const user = users.find(u => u.email === email);

  // Always return success to prevent email enumeration, unless specific error is truly client-facing
  if (!user) {
    return { success: true, message: 'Nếu email tồn tại, một liên kết đặt lại mật khẩu đã được gửi đến hộp thư của bạn.' };
  }

  // Clear any existing tokens for this user
  updateCollection('passwordResetTokens', prevTokens => prevTokens.filter(t => t.userId !== user.id));

  const token = generateId() + '-' + Date.now().toString(36); // Simple unique token
  const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString(); // 1 hour from now

  const newResetToken: PasswordResetToken = {
    id: generateId(),
    userId: user.id,
    token,
    expiresAt,
  };

  updateCollection('passwordResetTokens', prevTokens => [...prevTokens, newResetToken]);

  // Simulate sending email - in a real app, integrate with email service
  console.log(`Password reset link for ${email}: #/reset-password/${token}`);

  return { success: true, message: 'Nếu email tồn tại, một liên kết đặt lại mật khẩu đã được gửi đến hộp thư của bạn.' };
};

export const resetPassword = async (token: string, newPasswordRaw: string): Promise<{ success: boolean; message?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay

  const resetTokens = getCollection('passwordResetTokens');
  const foundToken = resetTokens.find(t => t.token === token);

  if (!foundToken) {
    return { success: false, message: 'Liên kết đặt lại mật khẩu không hợp lệ.' };
  }

  if (new Date(foundToken.expiresAt) < new Date()) {
    updateCollection('passwordResetTokens', prevTokens => prevTokens.filter(t => t.id !== foundToken.id)); // Clean up expired token
    return { success: false, message: 'Liên kết đặt lại mật khẩu đã hết hạn.' };
  }

  let userFound = false;
  updateCollection('users', prevUsers =>
    prevUsers.map(u => {
      if (u.id === foundToken.userId) {
        userFound = true;
        return { ...u, password: newPasswordRaw };
      }
      return u;
    })
  );

  if (!userFound) {
    return { success: false, message: 'Người dùng liên quan đến liên kết này không tồn tại.' };
  }

  // Invalidate the token after use
  updateCollection('passwordResetTokens', prevTokens => prevTokens.filter(t => t.id !== foundToken.id));

  return { success: true, message: 'Mật khẩu của bạn đã được đặt lại thành công!' };
};