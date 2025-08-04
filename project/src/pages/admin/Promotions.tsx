import React, { useState } from 'react';
import { Plus, Send, Edit2, Trash2, Users, BarChart3, Calendar, Target } from 'lucide-react';

const Promotions = () => {
  const [promotions, setPromotions] = useState([
    {
      id: 1,
      title: 'Welcome Back Offer',
      message: 'We miss you! Come back and enjoy 20% off your next purchase plus 500 bonus points.',
      segment: 'at-risk',
      type: 'retention',
      status: 'active',
      sentDate: '2024-01-15',
      recipients: 892,
      openRate: 68,
      clickRate: 23,
      conversionRate: 12
    },
    {
      id: 2,
      title: 'Tier Upgrade Celebration',
      message: 'Congratulations on reaching Silver tier! Enjoy your new benefits and exclusive rewards.',
      segment: 'tier-climbers',
      type: 'milestone',
      status: 'sent',
      sentDate: '2024-01-12',
      recipients: 156,
      openRate: 89,
      clickRate: 45,
      conversionRate: 34
    },
    {
      id: 3,
      title: 'Birthday Month Special',
      message: 'It\'s your birthday month! Enjoy triple points on all purchases and a special surprise.',
      segment: 'birthday',
      type: 'birthday',
      status: 'scheduled',
      sentDate: '2024-02-01',
      recipients: 234,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0
    },
    {
      id: 4,
      title: 'High-Value Customer Exclusive',
      message: 'As one of our most valued customers, enjoy early access to our premium collection.',
      segment: 'high-value',
      type: 'vip',
      status: 'draft',
      sentDate: null,
      recipients: 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const segments = [
    { id: 'high-value', name: 'High-Value Customers', count: 1247 },
    { id: 'at-risk', name: 'At-Risk Customers', count: 892 },
    { id: 'new-members', name: 'New Members', count: 2156 },
    { id: 'tier-climbers', name: 'Tier Climbers', count: 567 },
    { id: 'birthday', name: 'Birthday This Month', count: 234 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'retention': return Users;
      case 'milestone': return Target;
      case 'birthday': return Calendar;
      case 'vip': return BarChart3;
      default: return Send;
    }
  };

  const deletePromotion = (id: number) => {
    setPromotions(prev => prev.filter(promo => promo.id !== id));
  };

  const totalSent = promotions.reduce((sum, p) => sum + p.recipients, 0);
  const avgOpenRate = promotions.filter(p => p.recipients > 0).reduce((sum, p) => sum + p.openRate, 0) / promotions.filter(p => p.recipients > 0).length || 0;
  const avgClickRate = promotions.filter(p => p.recipients > 0).reduce((sum, p) => sum + p.clickRate, 0) / promotions.filter(p => p.recipients > 0).length || 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Promotions Management</h1>
          <p className="text-gray-600">Create and manage targeted promotional campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Promotion</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{promotions.length}</div>
              <div className="text-sm text-gray-600">Total Promotions</div>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Send className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{totalSent.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Messages Sent</div>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">{avgOpenRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Avg. Open Rate</div>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">{avgClickRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Avg. Click Rate</div>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Promotions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Promotions</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {promotions.map((promotion) => {
            const TypeIcon = getTypeIcon(promotion.type);
            return (
              <div key={promotion.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <TypeIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{promotion.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(promotion.status)}`}>
                          {promotion.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3 max-w-2xl">{promotion.message}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span>Segment: {segments.find(s => s.id === promotion.segment)?.name}</span>
                        {promotion.sentDate && (
                          <span>Sent: {new Date(promotion.sentDate).toLocaleDateString()}</span>
                        )}
                        <span>Recipients: {promotion.recipients.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deletePromotion(promotion.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Performance Metrics */}
                {promotion.recipients > 0 && (
                  <div className="mt-4 ml-16">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{promotion.openRate}%</div>
                        <div className="text-xs text-gray-600">Open Rate</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{promotion.clickRate}%</div>
                        <div className="text-xs text-gray-600">Click Rate</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">{promotion.conversionRate}%</div>
                        <div className="text-xs text-gray-600">Conversion</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {promotions.length === 0 && (
          <div className="p-12 text-center">
            <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No promotions yet</h3>
            <p className="text-gray-600 mb-6">Create your first promotional campaign to engage customers</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              Create Promotion
            </button>
          </div>
        )}
      </div>

      {/* Customer Segments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Available Segments</h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segments.map((segment) => (
              <div key={segment.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{segment.name}</h3>
                  <Users className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">{segment.count.toLocaleString()}</div>
                <div className="text-sm text-gray-600">customers</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Message Suggestions */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Message Suggestions</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">For At-Risk Customers</h4>
            <p className="text-sm text-gray-600 mb-3">
              "We've noticed you haven't shopped with us lately. Here's 25% off to welcome you back, plus we'll double your points on your next purchase!"
            </p>
            <div className="text-xs text-green-600 font-medium">✨ AI-optimized for retention</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">For High-Value Customers</h4>
            <p className="text-sm text-gray-600 mb-3">
              "Thank you for being a valued Gold member! Enjoy exclusive early access to our new collection and earn 2x points this week."
            </p>
            <div className="text-xs text-green-600 font-medium">✨ AI-optimized for engagement</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promotions;