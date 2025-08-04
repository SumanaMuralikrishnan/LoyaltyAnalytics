import React, { useState } from 'react';
import { History as HistoryIcon, Filter, Calendar, TrendingUp, Gift, Users, ShoppingBag, Award } from 'lucide-react';

const History = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30');

  const transactions = [
    {
      id: 1,
      type: 'earn',
      points: 150,
      description: 'Purchase at Electronics Store',
      context: 'Order #12345 - Wireless Headphones',
      date: '2024-01-15T10:30:00Z',
      icon: ShoppingBag,
      color: 'green'
    },
    {
      id: 2,
      type: 'badge',
      points: 100,
      description: 'Badge Earned: Loyal Shopper',
      context: 'Completed 5 purchases milestone',
      date: '2024-01-14T15:45:00Z',
      icon: Award,
      color: 'blue'
    },
    {
      id: 3,
      type: 'redeem',
      points: -500,
      description: 'Redeemed $5 Gift Card',
      context: 'Gift card code: GIFT-0001-2024',
      date: '2024-01-12T09:15:00Z',
      icon: Gift,
      color: 'purple'
    },
    {
      id: 4,
      type: 'referral',
      points: 200,
      description: 'Referral Bonus',
      context: 'Friend joined: john@example.com',
      date: '2024-01-10T14:20:00Z',
      icon: Users,
      color: 'orange'
    },
    {
      id: 5,
      type: 'earn',
      points: 75,
      description: 'Purchase at Fashion Store',
      context: 'Order #12344 - Summer Dress',
      date: '2024-01-08T16:30:00Z',
      icon: ShoppingBag,
      color: 'green'
    },
    {
      id: 6,
      type: 'birthday',
      points: 200,
      description: 'Birthday Bonus',
      context: 'Happy Birthday! Silver tier bonus',
      date: '2024-01-05T00:00:00Z',
      icon: Gift,
      color: 'pink'
    },
    {
      id: 7,
      type: 'welcome',
      points: 100,
      description: 'Welcome Bonus',
      context: 'Thank you for joining!',
      date: '2024-01-01T12:00:00Z',
      icon: Award,
      color: 'blue'
    }
  ];

  const filters = [
    { id: 'all', name: 'All Activity', icon: HistoryIcon },
    { id: 'earn', name: 'Points Earned', icon: TrendingUp },
    { id: 'redeem', name: 'Redemptions', icon: Gift },
    { id: 'referral', name: 'Referrals', icon: Users },
    { id: 'badge', name: 'Badges', icon: Award }
  ];

  const filteredTransactions = selectedFilter === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === selectedFilter);

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      case 'blue': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'purple': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'orange': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'pink': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPointsColor = (points: number) => {
    return points > 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const totalEarned = transactions.filter(t => t.points > 0).reduce((sum, t) => sum + t.points, 0);
  const totalRedeemed = Math.abs(transactions.filter(t => t.points < 0).reduce((sum, t) => sum + t.points, 0));

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Activity History</h1>
          <p className="text-gray-600">Track all your points, redemptions, and achievements</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{totalEarned.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Points Earned</div>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{totalRedeemed.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Points Redeemed</div>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <Gift className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{filteredTransactions.length}</div>
                <div className="text-sm text-gray-600">Total Transactions</div>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <HistoryIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <div className="flex space-x-2 overflow-x-auto">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedFilter === filter.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <filter.icon className="h-4 w-4" />
                    <span>{filter.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Calendar className="h-5 w-5 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="365">Last year</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedFilter === 'all' ? 'All Activity' : filters.find(f => f.id === selectedFilter)?.name}
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg border ${getColorClasses(transaction.color)}`}>
                    <transaction.icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{transaction.description}</h3>
                        <p className="text-sm text-gray-600 mb-2">{transaction.context}</p>
                        <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getPointsColor(transaction.points)}`}>
                          {transaction.points > 0 ? '+' : ''}{transaction.points.toLocaleString()} pts
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center">
              <HistoryIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">Try adjusting your filters or date range</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;