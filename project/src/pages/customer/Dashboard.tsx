import React, { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp, Gift, Flame, Star, Award, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [pointsCount, setPointsCount] = useState(0);
  const [showTierUpgrade, setShowTierUpgrade] = useState(false);

  useEffect(() => {
    if (user?.points_balance) {
      const interval = setInterval(() => {
        setPointsCount(prev => prev < user.points_balance ? prev + 25 : user.points_balance);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [user?.points_balance]);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Bronze': return { icon: Award, color: '#CD7F32' };
      case 'Silver': return { icon: Star, color: '#C0C0C0' };
      case 'Gold': return { icon: Award, color: '#FFD700' };
      default: return { icon: Award, color: '#CD7F32' };
    }
  };

  const getTierProgress = () => {
    if (!user) return { current: 0, next: 2000, percentage: 0 };
    
    const points = user.points_earned_last_12_months;
    if (points < 2000) {
      return { current: points, next: 2000, percentage: (points / 2000) * 100, nextTier: 'Silver' };
    } else if (points < 10000) {
      return { current: points, next: 10000, percentage: (points / 10000) * 100, nextTier: 'Gold' };
    } else {
      return { current: points, next: points, percentage: 100, nextTier: 'Gold' };
    }
  };

  const tierProgress = getTierProgress();
  const TierIcon = getTierIcon(user?.tier || 'Bronze');

  const quickActions = [
    { label: 'Earn Points', icon: TrendingUp, path: '/customer/rewards', color: 'from-green-500 to-green-600' },
    { label: 'Redeem Rewards', icon: Gift, path: '/customer/rewards', color: 'from-blue-500 to-blue-600' },
    { label: 'Refer Friends', icon: Star, path: '/customer/referrals', color: 'from-purple-500 to-purple-600' },
    { label: 'View Challenges', icon: Flame, path: '/customer/challenges', color: 'from-orange-500 to-orange-600' }
  ];

  const recentActivity = [
    { type: 'earn', points: 150, description: 'Purchase at Electronics Store', time: '2h ago', color: 'green' },
    { type: 'badge', points: 0, description: 'Badge Earned: Loyal Shopper', time: '1d ago', color: 'blue' },
    { type: 'redeem', points: -500, description: 'Redeemed $5 Gift Card', time: '3d ago', color: 'purple' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600">Here's your loyalty program overview</p>
        </div>

        {/* Points & Tier Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white mb-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-3xl font-bold mb-1">{pointsCount.toLocaleString()} pts</div>
              <div className="text-blue-100">Current Balance</div>
            </div>
            <div className="flex items-center space-x-2">
              <TierIcon.icon className="h-8 w-8" style={{ color: TierIcon.color }} />
              <span className="text-xl font-semibold">{user?.tier} Member</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100">Progress to {tierProgress.nextTier}</span>
              <span className="text-sm">{tierProgress.current.toLocaleString()}/{tierProgress.next.toLocaleString()}</span>
            </div>
            <div className="w-full bg-blue-400 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-1000"
                style={{ width: `${tierProgress.percentage}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm">
                Spend ${Math.max(0, (tierProgress.next - tierProgress.current) * 0.67).toFixed(0)} more to reach {tierProgress.nextTier} tier!
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 border border-gray-100"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} mb-3`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-sm font-medium text-gray-900">{action.label}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{user?.total_spend.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">12</div>
                <div className="text-sm text-gray-600">Available Rewards</div>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Gift className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">7</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <Link to="/customer/history" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.color === 'green' ? 'bg-green-500' :
                    activity.color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{activity.description}</div>
                    <div className="text-xs text-gray-500">{activity.time}</div>
                  </div>
                  {activity.points !== 0 && (
                    <div className={`text-sm font-semibold ${
                      activity.points > 0 ? 'text-green-600' : 'text-purple-600'
                    }`}>
                      {activity.points > 0 ? '+' : ''}{activity.points} pts
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tier Upgrade Modal */}
        {showTierUpgrade && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
              <div className="mb-6">
                <div className="animate-bounce">
                  <Award className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tier Upgrade!</h2>
                <p className="text-gray-600">Congratulations! You've been promoted to Silver tier!</p>
              </div>
              <button
                onClick={() => setShowTierUpgrade(false)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                Awesome!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;