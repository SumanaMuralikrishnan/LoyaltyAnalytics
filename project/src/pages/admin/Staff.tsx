import { useState, useEffect } from 'react';
import { Search, QrCode, User, CreditCard, Gift, CheckCircle, AlertCircle, List } from 'lucide-react';

// Define TypeScript interfaces for type safety
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  points: number;
  tier: string;
  totalSpend: number;
  joinDate: string;
  lastActivity: string;
  rfm: {
    recency: number;
    frequency: number;
    monetary: number;
  };
  churnProbability: number;
  points_earned: number;
  points_redeemed: number;
  avgOrderValue: number;
  lastPurchaseDate: string;
  purchaseFrequency: number;
  tierProgress: {
    nextTier: string | null;
    pointsToNext: number;
    progressPercentage: number;
  };
}

interface Reward {
  id: string;
  name: string;
  points: number;
  redemptionCount?: number;
}

interface Recommendation {
  customer: string;
  name: string;
  tier: string;
  clv: string;
  predictedClv: string;
  recommendedReward: string;
  reason: string;
}

interface Segment {
  id: string;
  name: string;
  count: number;
  description: string;
  avgSpend: number;
  avgPoints: number;
  retentionRate: number;
  color: string;
}

const Staff = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [adjustmentPoints, setAdjustmentPoints] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [topRewards, setTopRewards] = useState<Reward[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'https://loyaltyanalytics.onrender.com';
  const HARD_CODED_USER_ID = 'admin-1';

  // Warning for hardcoded user ID
  console.warn('Using hardcoded user_id: admin-1. Replace with dynamic authentication in production.');

  // Fetch top rewards, all rewards, and segments
  useEffect(() => {
    const fetchTopRewards = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/top-rewards`, {
          headers: { 'X-User-ID': HARD_CODED_USER_ID },
        });
        if (!response.ok) throw new Error('Failed to fetch top rewards');
        const data: Reward[] = await response.json();
        setTopRewards(data);
      } catch (err: unknown) {
        setError((err as Error).message);
      }
    };

    const fetchRewards = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/rewards`, {
          headers: { 'X-User-ID': HARD_CODED_USER_ID },
        });
        if (!response.ok) throw new Error('Failed to fetch rewards');
        const data: Reward[] = await response.json();
        setRewards(data);
      } catch (err: unknown) {
        setError((err as Error).message);
      }
    };

    const fetchSegments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/segments`, {
          headers: { 'X-User-ID': HARD_CODED_USER_ID },
        });
        if (!response.ok) throw new Error('Failed to fetch segments');
        const data: Segment[] = await response.json();
        setSegments(data);
      } catch (err: unknown) {
        setError((err as Error).message);
      }
    };

    fetchTopRewards();
    fetchRewards();
    fetchSegments();
  }, []);

  // Fetch recommendations when a customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      const fetchRecommendations = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await fetch(`${API_BASE_URL}/dashboard/recommendations`, {
            headers: { 'X-User-ID': HARD_CODED_USER_ID },
          });
          if (!response.ok) throw new Error('Failed to fetch recommendations');
          const data: Recommendation[] = await response.json();
          // Filter recommendations for the selected customer
          const customerRecs = data.filter(rec => rec.customer === selectedCustomer.id);
          setRecommendations(customerRecs);
          setLoading(false);
        } catch (err: unknown) {
          setError((err as Error).message);
          setRecommendations([]);
          setLoading(false);
        }
      };
      fetchRecommendations();
    } else {
      setRecommendations([]);
    }
  }, [selectedCustomer]);

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/staff/customer-lookup?search=${encodeURIComponent(searchTerm)}`, {
          headers: { 'X-User-ID': HARD_CODED_USER_ID },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Customer not found');
        }
        const data: Customer = await response.json();
        setSelectedCustomer(data);
        setLoading(false);
      } catch (err: unknown) {
        setError((err as Error).message);
        setSelectedCustomer(null);
        setLoading(false);
      }
    }
  };

  const handlePointsAdjustment = async () => {
    if (selectedCustomer && adjustmentPoints && adjustmentReason) {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/staff/points-adjustment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': HARD_CODED_USER_ID,
          },
          body: JSON.stringify({
            customer_id: selectedCustomer.id,
            points: parseInt(adjustmentPoints),
            reason: adjustmentReason,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Points adjustment failed');
        }
        const data = await response.json();
        setSelectedCustomer({
          ...selectedCustomer,
          points: data.customer.points,
        });
        setShowSuccess(true);
        setAdjustmentPoints('');
        setAdjustmentReason('');
        setTimeout(() => setShowSuccess(false), 3000);
        setLoading(false);
      } catch (err: unknown) {
        setError((err as Error).message);
        setLoading(false);
      }
    }
  };

  const handleRedemption = async (rewardName: string) => {
    if (selectedCustomer) {
      try {
        setLoading(true);
        setError(null);
        // Find the reward ID and points from the rewards list
        const reward = rewards.find(r => r.name === rewardName);
        if (!reward) throw new Error('Reward not found');
        if (selectedCustomer.points < reward.points) throw new Error('Insufficient points');

        const response = await fetch(`${API_BASE_URL}/staff/redeem-reward`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': HARD_CODED_USER_ID,
          },
          body: JSON.stringify({
            customer_id: selectedCustomer.id,
            reward_id: reward.id,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Redemption failed');
        }
        const data = await response.json();
        setSelectedCustomer({
          ...selectedCustomer,
          points: data.customer.points,
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setLoading(false);
      } catch (err: unknown) {
        setError((err as Error).message);
        setLoading(false);
      }
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze':
        return 'text-amber-600 bg-amber-100';
      case 'Silver':
        return 'text-gray-600 bg-gray-100';
      case 'Gold':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSegmentColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'text-green-600 bg-green-100';
      case 'red':
        return 'text-red-600 bg-red-100';
      case 'blue':
        return 'text-blue-600 bg-blue-100';
      case 'purple':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-8">
      {/* Warning for hardcoded user ID */}
      <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <p className="text-yellow-600 text-sm">
            Note: Using hardcoded admin-1 user for development. Implement proper authentication for production.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff & Store Manager</h1>
        <p className="text-gray-600">Manage customer accounts and process in-store redemptions</p>
      </div>

      {/* Customer Lookup */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Lookup</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Email or Phone
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter email or phone number"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* QR Scanner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              QR Code Scanner
            </label>
            <button
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors flex flex-col items-center justify-center"
              onClick={() => console.log('QR Scanner not implemented')}
            >
              <QrCode className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Scan Customer QR Code</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Customer Details and Actions */}
      {selectedCustomer && (
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Customer Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-blue-100 rounded-full p-3">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h3>
                  <p className="text-gray-600">{selectedCustomer.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierColor(selectedCustomer.tier)}`}>
                  {selectedCustomer.tier}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedCustomer.points.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Available Points</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">${selectedCustomer.totalSpend.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Spend</div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer ID:</span>
                  <span className="font-medium">{selectedCustomer.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{selectedCustomer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-medium">{new Date(selectedCustomer.joinDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Activity:</span>
                  <span className="font-medium">{new Date(selectedCustomer.lastActivity).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Purchase:</span>
                  <span className="font-medium">{new Date(selectedCustomer.lastPurchaseDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Churn Probability:</span>
                  <span className="font-medium">{selectedCustomer.churnProbability}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Purchase Frequency:</span>
                  <span className="font-medium">{selectedCustomer.purchaseFrequency.toFixed(2)} orders/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Order Value:</span>
                  <span className="font-medium">${selectedCustomer.avgOrderValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Points Earned:</span>
                  <span className="font-medium">{selectedCustomer.points_earned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Points Redeemed:</span>
                  <span className="font-medium">{selectedCustomer.points_redeemed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">RFM - Recency:</span>
                  <span className="font-medium">{selectedCustomer.rfm.recency} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">RFM - Frequency:</span>
                  <span className="font-medium">{selectedCustomer.rfm.frequency} orders</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">RFM - Monetary:</span>
                  <span className="font-medium">${selectedCustomer.rfm.monetary.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommended Rewards</h2>
              {loading && <p className="text-gray-600">Loading recommendations...</p>}
              {recommendations.length === 0 && !loading && (
                <p className="text-gray-600">No recommendations available for this customer.</p>
              )}
              {recommendations.map((rec, index) => {
                const reward = rewards.find(r => r.name === rec.recommendedReward);
                const canRedeem = reward && selectedCustomer.points >= reward.points;
                return (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{rec.recommendedReward}</p>
                        <p className="text-sm text-gray-600">{rec.reason}</p>
                        <p className="text-sm text-gray-600">CLV: {rec.clv} | Predicted CLV: {rec.predictedClv}</p>
                        <p className="text-sm text-gray-600">Points Required: {reward ? reward.points : 'Unknown'}</p>
                      </div>
                      <button
                        onClick={() => reward && handleRedemption(rec.recommendedReward)}
                        disabled={!reward || !canRedeem || loading}
                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                          canRedeem && reward
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        <Gift className="h-5 w-5" />
                        <span>Redeem</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Customer Segment */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <List className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Customer Segment</h2>
              </div>
              {loading && <p className="text-gray-600">Loading segment...</p>}
              {segments.length === 0 && !loading && (
                <p className="text-gray-600">No segment data available.</p>
              )}
              {segments.map((segment, index) => {
                // Match customer to segment using backend criteria
                const totalSpend = selectedCustomer.totalSpend;
                const lastOrder = selectedCustomer.lastPurchaseDate
                  ? new Date(selectedCustomer.lastPurchaseDate)
                  : null;
                const joinDate = new Date(selectedCustomer.joinDate);
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                const ninetyDaysAgo = new Date();
                ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                // Approximate CLV as totalSpend (since ml_predictions.clv_predicted is not in selectedCustomer)
                const clv = totalSpend;
                const orderCount = selectedCustomer.rfm.frequency;

                const isHighValue = clv > 1000 || selectedCustomer.points > 2000;
                const isAtRisk = lastOrder && lastOrder < ninetyDaysAgo;
                const isNew = joinDate > oneYearAgo;
                const isLoyal = orderCount > 5 && clv > 500;

                const belongsToSegment =
                  (segment.name === 'High Value' && isHighValue) ||
                  (segment.name === 'At Risk' && isAtRisk) ||
                  (segment.name === 'New' && isNew) ||
                  (segment.name === 'Loyal' && isLoyal);

                if (!belongsToSegment) return null;

                return (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className={`font-medium text-gray-900 ${getSegmentColor(segment.color)} px-3 py-1 rounded-full`}>
                          {segment.name}
                        </p>
                        <p className="text-sm text-gray-600">{segment.description}</p>
                        <p className="text-sm text-gray-600">Average Spend: ${segment.avgSpend.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Average Points: {segment.avgPoints.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Retention Rate: {segment.retentionRate.toFixed(2)}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            {/* Points Adjustment */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Adjust Points</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={adjustmentPoints}
                      onChange={(e) => setAdjustmentPoints(e.target.value)}
                      placeholder="Enter points to adjust"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <input
                    type="text"
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    placeholder="Enter reason for adjustment"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={handlePointsAdjustment}
                  disabled={!adjustmentPoints || !adjustmentReason || loading}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>{loading ? 'Adjusting...' : 'Adjust Points'}</span>
                </button>
                {showSuccess && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="text-green-600 text-sm">Points adjusted successfully!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Top Rewards */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Rewards</h2>
              {topRewards.length === 0 && !loading && (
                <p className="text-gray-600">No top rewards available.</p>
              )}
              {topRewards.map((reward, index) => (
                <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{reward.name}</p>
                      <p className="text-sm text-gray-600">Points: {reward.points}</p>
                      <p className="text-sm text-gray-600">Redemptions: {reward.redemptionCount || 0}</p>
                    </div>
                    <button
                      onClick={() => handleRedemption(reward.name)}
                      disabled={!selectedCustomer || selectedCustomer.points < reward.points || loading}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                        selectedCustomer && selectedCustomer.points >= reward.points
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      <Gift className="h-5 w-5" />
                      <span>Redeem</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
