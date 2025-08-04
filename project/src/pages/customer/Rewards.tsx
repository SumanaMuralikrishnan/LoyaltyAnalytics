import React, { useState } from 'react';
import { Gift, Star, Filter, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Rewards = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('rewards');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const earnOpportunities = [
    {
      title: 'Shopping Rewards',
      description: 'Earn points on every purchase',
      rate: user?.tier === 'Gold' ? '1.75 pts/$1' : user?.tier === 'Silver' ? '1.5 pts/$1' : '1 pt/$1',
      icon: '🛍️'
    },
    {
      title: 'Referral Bonus',
      description: 'Invite friends and earn together',
      rate: '200 pts per referral',
      icon: '👥'
    },
    {
      title: 'Birthday Bonus',
      description: 'Special points on your birthday',
      rate: user?.tier === 'Gold' ? '500 pts' : user?.tier === 'Silver' ? '200 pts' : '100 pts',
      icon: '🎂'
    },
    {
      title: 'Daily Login',
      description: 'Login daily to maintain streaks',
      rate: '10 pts per streak milestone',
      icon: '📱'
    }
  ];

  const rewards = [
    {
      id: 1,
      name: '$5 Gift Card',
      category: 'gift-cards',
      points: 500,
      discount: 5,
      description: 'Redeemable at any participating store',
      tier: 'Bronze',
      available: true,
      popular: true
    },
    {
      id: 2,
      name: '$10 Gift Card',
      category: 'gift-cards',
      points: 850,
      discount: 10,
      description: 'Redeemable at any participating store',
      tier: 'Silver',
      available: user?.tier !== 'Bronze',
      popular: false
    },
    {
      id: 3,
      name: 'Free Shipping',
      category: 'perks',
      points: 200,
      discount: 0,
      description: 'Free shipping on your next order',
      tier: 'Bronze',
      available: true,
      popular: false
    },
    {
      id: 4,
      name: '15% Off Coupon',
      category: 'discounts',
      points: 750,
      discount: 15,
      description: 'Save 15% on your next purchase',
      tier: 'Silver',
      available: user?.tier !== 'Bronze',
      popular: true
    },
    {
      id: 5,
      name: '$25 Gift Card',
      category: 'gift-cards',
      points: 1750,
      discount: 25,
      description: 'Premium gift card for loyal customers',
      tier: 'Gold',
      available: user?.tier === 'Gold',
      popular: false
    },
    {
      id: 6,
      name: 'VIP Experience',
      category: 'experiences',
      points: 2500,
      discount: 0,
      description: 'Exclusive VIP shopping experience',
      tier: 'Gold',
      available: user?.tier === 'Gold',
      popular: false
    }
  ];

  const categories = [
    { id: 'all', name: 'All Rewards' },
    { id: 'gift-cards', name: 'Gift Cards' },
    { id: 'discounts', name: 'Discounts' },
    { id: 'perks', name: 'Perks' },
    { id: 'experiences', name: 'Experiences' }
  ];

  const filteredRewards = selectedCategory === 'all' 
    ? rewards 
    : rewards.filter(reward => reward.category === selectedCategory);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'text-amber-600 bg-amber-100';
      case 'Silver': return 'text-gray-600 bg-gray-100';
      case 'Gold': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Rewards & Earning</h1>
          <p className="text-gray-600">Discover ways to earn points and redeem amazing rewards</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab('earn')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'earn'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Earn Points
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'rewards'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Redeem Rewards
          </button>
        </div>

        {activeTab === 'earn' ? (
          /* Earn Points Tab */
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Your Earning Rate</h2>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {user?.tier === 'Gold' ? '1.75' : user?.tier === 'Silver' ? '1.5' : '1'} points per $1
              </div>
              <p className="text-gray-600">As a {user?.tier} member, you earn more on every purchase!</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {earnOpportunities.map((opportunity, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{opportunity.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{opportunity.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{opportunity.description}</p>
                      <div className="text-blue-600 font-semibold">{opportunity.rate}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Rewards Tab */
          <div>
            {/* Category Filter */}
            <div className="flex items-center space-x-4 mb-6">
              <Filter className="h-5 w-5 text-gray-400" />
              <div className="flex space-x-2 overflow-x-auto">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Rewards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRewards.map((reward) => (
                <div
                  key={reward.id}
                  className={`bg-white rounded-xl p-6 shadow-sm border transition-all ${
                    reward.available
                      ? 'border-gray-100 hover:shadow-md hover:-translate-y-1'
                      : 'border-gray-200 opacity-60'
                  } ${reward.popular ? 'ring-2 ring-blue-500 ring-opacity-20' : ''}`}
                >
                  {reward.popular && (
                    <div className="flex items-center space-x-1 mb-3">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-xs font-medium text-yellow-600">Popular</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{reward.name}</h3>
                      <p className="text-gray-600 text-sm">{reward.description}</p>
                    </div>
                    <Gift className="h-6 w-6 text-blue-500 ml-2" />
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {reward.points.toLocaleString()} pts
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(reward.tier)}`}>
                      {reward.tier}
                    </span>
                  </div>

                  {reward.available ? (
                    <Link
                      to={`/customer/rewards/redeem/${reward.id}`}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center"
                    >
                      Redeem Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-100 text-gray-400 py-3 px-4 rounded-lg font-semibold cursor-not-allowed"
                    >
                      {user?.points_balance && user.points_balance < reward.points
                        ? 'Insufficient Points'
                        : 'Tier Locked'
                      }
                    </button>
                  )}
                </div>
              ))}
            </div>

            {filteredRewards.length === 0 && (
              <div className="text-center py-12">
                <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rewards found</h3>
                <p className="text-gray-600">Try selecting a different category</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rewards;