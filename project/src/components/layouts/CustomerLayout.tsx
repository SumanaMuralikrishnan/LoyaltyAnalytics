import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Gift, ShoppingCart, Target, User, Bell, History, Users, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/customer/home', icon: Home, label: 'Home' },
    { path: '/customer/rewards', icon: Gift, label: 'Rewards' },
    { path: '/customer/cart', icon: ShoppingCart, label: 'Cart' },
    { path: '/customer/challenges', icon: Target, label: 'Challenges' },
    { path: '/customer/profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-2">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                Unlimited Loyalty
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Welcome back,</div>
                <div className="font-semibold text-gray-900">{user?.email}</div>
              </div>
              <div className="flex items-center space-x-2">
                <NavLink
                  to="/customer/notifications"
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                </NavLink>
                <NavLink
                  to="/customer/history"
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <History className="h-5 w-5" />
                </NavLink>
                <NavLink
                  to="/customer/referrals"
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Users className="h-5 w-5" />
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`
              }
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CustomerLayout;