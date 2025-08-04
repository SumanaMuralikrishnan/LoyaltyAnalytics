import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Gift, Check, ArrowLeft, QrCode, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const RewardRedemption = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isRedeemed, setIsRedeemed] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Mock reward data - in real app, fetch from API
  const reward = {
    id: parseInt(id || '1'),
    name: '$5 Gift Card',
    points: 500,
    discount: 5,
    description: 'Redeemable at any participating store',
    terms: [
      'Valid for 90 days from redemption date',
      'Cannot be combined with other offers',
      'Non-transferable and non-refundable',
      'Must be used in a single transaction'
    ],
    tier: 'Bronze'
  };

  const handleRedeem = async () => {
    if (!user || user.points_balance < reward.points) return;

    setIsRedeeming(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update user points
    updateUser({
      points_balance: user.points_balance - reward.points
    });

    setIsRedeeming(false);
    setIsRedeemed(true);
    setShowQR(true);
  };

  const canRedeem = user && user.points_balance >= reward.points;

  if (isRedeemed) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="animate-bounce">
                <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Check className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Redemption Successful!</h1>
              <p className="text-gray-600">Your {reward.name} has been redeemed</p>
            </div>

            {showQR && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <QrCode className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Your Reward Code</span>
                </div>
                <div className="bg-white rounded-lg p-8 border-2 border-dashed border-blue-300">
                  <div className="text-3xl font-mono font-bold text-blue-600 mb-2">
                    GIFT-{reward.id.toString().padStart(4, '0')}-{Date.now().toString().slice(-4)}
                  </div>
                  <p className="text-sm text-gray-600">Show this code at checkout</p>
                </div>
              </div>
            )}

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Reward</span>
                <span className="font-semibold">{reward.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Points Used</span>
                <span className="font-semibold text-red-600">-{reward.points.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Remaining Balance</span>
                <span className="font-semibold text-blue-600">{user?.points_balance.toLocaleString()} pts</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Expires</span>
                <span className="font-semibold">{new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/customer/rewards')}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                Redeem More
              </button>
              <button
                onClick={() => navigate('/customer/home')}
                className="flex-1 border-2 border-blue-500 text-blue-600 py-3 px-4 rounded-lg font-semibold hover:bg-blue-50 transition-all"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/customer/rewards')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Redeem Reward</h1>
            <p className="text-gray-600">Confirm your redemption details</p>
          </div>
        </div>

        {/* Reward Details */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="bg-blue-100 rounded-full p-3">
              <Gift className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{reward.name}</h2>
              <p className="text-gray-600 mb-4">{reward.description}</p>
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-blue-600">
                  {reward.points.toLocaleString()} pts
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {reward.tier} Tier
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Terms & Conditions</h3>
            <ul className="space-y-2">
              {reward.terms.map((term, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                  <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Points Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Points Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current Balance</span>
              <span className="font-semibold text-blue-600">{user?.points_balance.toLocaleString()} pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Redemption Cost</span>
              <span className="font-semibold text-red-600">-{reward.points.toLocaleString()} pts</span>
            </div>
            <div className="border-t border-blue-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Remaining Balance</span>
                <span className="font-bold text-blue-600">
                  {((user?.points_balance || 0) - reward.points).toLocaleString()} pts
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {!canRedeem && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-700 font-medium">
                  {!user ? 'Please log in to redeem' : 'Insufficient points for this reward'}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleRedeem}
            disabled={!canRedeem || isRedeeming}
            className={`w-full py-4 px-6 rounded-lg font-semibold transition-all ${
              canRedeem && !isRedeeming
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:scale-105'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isRedeeming ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing Redemption...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Sparkles className="mr-2 h-5 w-5" />
                Redeem Now
              </div>
            )}
          </button>

          <button
            onClick={() => navigate('/customer/rewards')}
            className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewardRedemption;