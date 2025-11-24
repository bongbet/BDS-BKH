import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ListingProvider } from '../context/ListingContext';
import { ChatProvider } from '../context/ChatContext';
// FIX: Changed Navbar import to a named import.
import { Navbar } from './Navbar';
import FooterNav from './FooterNav';
import Home from '../pages/Home';
import ListingList from '../pages/ListingList';
import ListingDetail from '../pages/ListingDetail';
import PostListing from '../pages/PostListing';
import AgentDashboard from '../pages/AgentDashboard';
import AdminDashboard from '../pages/AdminDashboard'; // Import new AdminDashboard
import MyAccount from '../pages/MyAccount';
import Chat from '../pages/Chat';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword'; // New: ForgotPassword Page
import ResetPassword from '../pages/ResetPassword';   // New: ResetPassword Page
import LoadingSpinner from './common/LoadingSpinner';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    // User is not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    // User is logged in but doesn't have the required role
    return <Navigate to="/home" replace />; // Or a permission denied page
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/listings" element={<ListingList />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> {/* New: ForgotPassword Route */}
          <Route path="/reset-password/:token" element={<ResetPassword />} /> {/* New: ResetPassword Route */}
          
          <Route path="/post-listing" element={<ProtectedRoute roles={[UserRole.AGENT]}><PostListing /></ProtectedRoute>} />
          <Route path="/edit-listing/:id" element={<ProtectedRoute roles={[UserRole.AGENT]}><PostListing /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute roles={[UserRole.AGENT]}><AgentDashboard /></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={<ProtectedRoute roles={[UserRole.ADMIN]}><AdminDashboard /></ProtectedRoute>} /> {/* New Admin Dashboard Route */}
          <Route path="/account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/home" replace />} /> {/* Fallback for unknown routes */}
        </Routes>
      </main>
      <FooterNav />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <ListingProvider>
          <ChatProvider>
            <AppContent />
          </ChatProvider>
        </ListingProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;