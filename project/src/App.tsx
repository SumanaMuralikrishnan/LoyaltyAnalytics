import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerRewards from './pages/customer/Rewards';
import CustomerCart from './pages/customer/Cart';
import CustomerChallenges from './pages/customer/Challenges';
import CustomerProfile from './pages/customer/Profile';
import CustomerHistory from './pages/customer/History';
import CustomerNotifications from './pages/customer/Notifications';
import CustomerReferrals from './pages/customer/Referrals';
import RewardRedemption from './pages/customer/RewardRedemption';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/Dashboard';
import AdminCampaigns from './pages/admin/Campaigns';
import AdminInsights from './pages/admin/Insights';
import AdminTransactions from './pages/admin/Transactions';
import AdminPromotions from './pages/admin/Promotions';
import AdminStaff from './pages/admin/Staff';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerLayout from './components/layouts/CustomerLayout';
import AdminLayout from './components/layouts/AdminLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Customer Routes */}
            <Route path="/customer" element={
              <ProtectedRoute userType="customer">
                <CustomerLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/customer/home" replace />} />
              <Route path="home" element={<CustomerDashboard />} />
              <Route path="rewards" element={<CustomerRewards />} />
              <Route path="rewards/redeem/:id" element={<RewardRedemption />} />
              <Route path="cart" element={<CustomerCart />} />
              <Route path="challenges" element={<CustomerChallenges />} />
              <Route path="referrals" element={<CustomerReferrals />} />
              <Route path="history" element={<CustomerHistory />} />
              <Route path="notifications" element={<CustomerNotifications />} />
              <Route path="profile" element={<CustomerProfile />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute userType="admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/admin/overview" replace />} />
              <Route path="overview" element={<AdminDashboard />} />
              <Route path="campaigns" element={<AdminCampaigns />} />
              <Route path="insights" element={<AdminInsights />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="promotions" element={<AdminPromotions />} />
              <Route path="staff" element={<AdminStaff />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;