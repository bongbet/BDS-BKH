import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const FooterNav: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { name: 'Trang chủ', icon: 'M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10', path: '/home' },
    { name: 'Tin tức', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M18 16V6a4 4 0 00-4-4H8a4 4 0 00-4 4v10a4 4 0 004 4h12a4 4 0 004-4v-2', path: '/listings' },
    { name: 'Đăng tin', icon: 'M12 4v16m8-8H4', path: '/post-listing', roles: [UserRole.AGENT] },
    { name: 'Chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', path: '/chat' },
    { name: 'Tài khoản', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 4 0 00-7-7z', path: '/account' },
    { name: 'Admin', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.12 1.12 0 001.954.954l3.41 3.41a1.12 1.12 0 00.954 1.954c1.756.426 1.756 2.924 0 3.35a1.12 1.12 0 00-.954 1.954l-3.41 3.41a1.12 1.12 0 00-1.954.954c-.426 1.756-2.924 1.756-3.35 0a1.12 1.12 0 00-1.954-.954l-3.41-3.41a1.12 1.12 0 00-.954-1.954c-1.756-.426-1.756-2.924 0-3.35a1.12 1.12 0 00.954-1.954l3.41-3.41a1.12 1.12 0 001.954-.954zM12 10a2 2 0 100 4 2 2 0 000-4z', path: '/admin-dashboard', roles: [UserRole.ADMIN] }, // New Admin item
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-lg md:hidden z-40">
      <nav className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          if (item.roles && (!user || !item.roles.includes(user.role))) {
            return null;
          }
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center text-xs font-medium text-gray-500 transition-colors duration-200 ${
                  isActive ? 'text-indigo-600' : 'hover:text-indigo-600'
                }`
              }
            >
              <svg className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </footer>
  );
};

export default FooterNav;