import { useState, useEffect } from 'react';
import { Search, Filter, Download, AlertTriangle, TrendingUp, Gift, Users, ShoppingBag } from 'lucide-react';

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalPoints: 0,
    totalValue: 0,
    flaggedTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Replace with actual user ID from auth context
  const userId = 'your-user-id-here';
  const API_BASE_URL = 'http://localhost:5000';

  // Fetch transactions from backend
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/transactions?search=${encodeURIComponent(searchTerm)}&type=${filterType}&date_range=${dateRange}`,
          {
            headers: { 'X-User-ID': userId },
          }
        );
        if (!response.ok) throw new Error('Failed to fetch transactions');
        const data = await response.json();
        setTransactions(data.transactions);
        setStats(data.stats);
        setLoading(false);
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message);
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [searchTerm, filterType, dateRange]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase': return ShoppingBag;
      case 'redemption': return Gift;
      case 'referral': return Users;
      case 'feedback': return Users; // Updated to match backend transaction types
      default: return TrendingUp;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'bg-green-100 text-green-800';
      case 'redemption': return 'bg-purple-100 text-purple-800';
      case 'referral': return 'bg-blue-100 text-blue-800';
      case 'feedback': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction History</h1>
          <p className="text-gray-600">Monitor all loyalty program transactions and detect fraud</p>
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center space-x-2">
          <Download className="h-5 w-5" />
          <span>Export Data</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalTransactions}</div>
              <div className="text-sm text-gray-600">Total Transactions</div>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.totalPoints.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Points Processed</div>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Gift className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">${stats.totalValue.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Transaction Value</div>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <ShoppingBag className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.flaggedTransactions}</div>
              <div className="text-sm text-gray-600">Flagged by AI</div>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex space-x-2">
              {[
                { id: 'all', name: 'All Types' },
                { id: 'purchase', name: 'Purchases' },
                { id: 'redemption', name: 'Redemptions' },
                { id: 'referral', name: 'Referrals' },
                { id: 'feedback', name: 'Feedback' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterType(filter.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === filter.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Transactions
            <span className="text-gray-500 font-normal ml-2">({transactions.length} transactions)</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flags</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction: any) => {
                const TypeIcon = getTypeIcon(transaction.type);
                return (
                  <tr key={transaction.id} className={`hover:bg-gray-50 ${transaction.flagged ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{transaction.id}</div>
                        <div className="text-sm text-gray-600">{transaction.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{transaction.customerName}</div>
                        <div className="text-sm text-gray-600">{transaction.customerId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <TypeIcon className="h-4 w-4 text-gray-600" />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                          {transaction.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.flagged && (
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-xs text-red-600 font-medium">Suspicious</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <div className="p-12 text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      {/* AI Fraud Detection */}
      {stats.flaggedTransactions > 0 && (
        <div className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI Fraud Detection Alerts</h3>
          </div>
          <p className="text-gray-700 mb-4">
            {stats.flaggedTransactions} transaction{stats.flaggedTransactions !== 1 ? 's' : ''} flagged as potentially suspicious by our AI system.
          </p>
          <div className="flex space-x-4">
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              Review Flagged Transactions
            </button>
            <button className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
              Adjust Detection Rules
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;