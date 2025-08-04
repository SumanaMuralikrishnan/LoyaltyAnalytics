import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Megaphone, 
  Users, 
  CreditCard, 
  Gift, 
  UserCheck, 
  LogOut,
  Crown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';

const AdminLayout = () => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  // Debug user state and loading
  useEffect(() => {
    console.log('AdminLayout: user state:', user, 'isLoading:', isLoading);
    if (!isLoading && !user) {
      console.warn('AdminLayout: user is null and not loading, redirecting to login');
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const handleLogout = () => {
    console.log('AdminLayout: handleLogout called');
    (logout as () => void)(); // Type assertion to bypass TypeScript error
    navigate('/');
  };

  const navItems = [
    { path: '/admin-overview', icon: BarChart3, label: 'Overview' },
    { path: '/admin/campaigns', icon: Megaphone, label: 'Campaigns' },
    { path: '/admin/insights', icon: Users, label: 'Insights' },
    { path: '/admin/transactions', icon: CreditCard, label: 'Transactions' },
    { path: '/admin/promotions', icon: Gift, label: 'Promotions' },
    { path: '/admin/staff', icon: UserCheck, label: 'Staff' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 w-64 bg-white shadow-lg flex flex-col h-screen z-50">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-2">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">Admin Panel</div>
              <div className="text-sm text-gray-600">Unlimited Loyalty</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`
              }
              onClick={() => console.log(`Navigating to ${item.path}, user:`, user)}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">{user?.email || 'Not logged in'}</div>
              <div className="text-xs text-gray-600">Administrator</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 overflow-auto min-h-screen">
        {isLoading ? (
          <div className="text-center mt-8">Loading...</div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
};

export default AdminLayout;