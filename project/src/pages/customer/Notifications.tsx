import React, { useState } from 'react';
import { Bell, Gift, Star, TrendingUp, Calendar, Check, X, Sparkles } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'points',
      title: 'Points Expiring Soon',
      message: '500 points will expire in 7 days. Use them before January 22nd!',
      date: '2024-01-15T10:30:00Z',
      read: false,
      icon: TrendingUp,
      color: 'orange',
      action: 'Redeem Now'
    },
    {
      id: 2,
      type: 'tier',
      title: 'Tier Upgrade Available',
      message: 'You\'re only 250 points away from Gold tier! Keep shopping to unlock premium benefits.',
      date: '2024-01-14T15:45:00Z',
      read: false,
      icon: Star,
      color: 'blue',
      action: 'View Progress'
    },
    {
      id: 3,
      type: 'birthday',
      title: 'Birthday Bonus Activated!',
      message: 'Happy Birthday! Your 200-point Silver tier birthday bonus has been added to your account.',
      date: '2024-01-12T09:15:00Z',
      read: true,
      icon: Gift,
      color: 'pink',
      action: null
    },
    {
      id: 4,
      type: 'reward',
      title: 'New Rewards Available',
      message: 'Check out our latest rewards! New gift cards and exclusive experiences just added.',
      date: '2024-01-10T14:20:00Z',
      read: true,
      icon: Gift,
      color: 'green',
      action: 'Browse Rewards'
    },
    {
      id: 5,
      type: 'challenge',
      title: 'Challenge Completed!',
      message: 'Congratulations! You completed the "Spend $100 This Week" challenge and earned 150 points.',
      date: '2024-01-08T16:30:00Z',
      read: true,
      icon: Star,
      color: 'purple',
      action: null
    },
    {
      id: 6,
      type: 'referral',
      title: 'Referral Bonus Earned',
      message: 'Your friend John joined the program! You\'ve earned 200 referral points.',
      date: '2024-01-05T12:00:00Z',
      read: true,
      icon: TrendingUp,
      color: 'blue',
      action: null
    }
  ]);

  const [filter, setFilter] = useState('all');

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'orange': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'blue': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'pink': return 'bg-pink-100 text-pink-600 border-pink-200';
      case 'green': return 'bg-green-100 text-green-600 border-green-200';
      case 'purple': return 'bg-purple-100 text-purple-600 border-purple-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
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

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center space-x-4 overflow-x-auto">
            <Bell className="h-5 w-5 text-gray-400 flex-shrink-0" />
            {[
              { id: 'all', name: 'All' },
              { id: 'unread', name: 'Unread' },
              { id: 'points', name: 'Points' },
              { id: 'tier', name: 'Tier' },
              { id: 'reward', name: 'Rewards' },
              { id: 'challenge', name: 'Challenges' }
            ].map((filterOption) => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === filterOption.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterOption.name}
                {filterOption.id === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${
                notification.read ? 'border-gray-100' : 'border-blue-200 bg-blue-50/30'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg border ${getColorClasses(notification.color)}`}>
                    <notification.icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">{formatDate(notification.date)}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete notification"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {notification.action && (
                      <div className="mt-4">
                        <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all">
                          {notification.action}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "No notifications found for this filter."
              }
            </p>
          </div>
        )}

        {/* AI Retention Offer */}
        {unreadCount === 0 && (
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Special Offer Just for You!</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Since you're such an active member, here's an exclusive 20% off your next purchase! 
              This AI-generated offer is based on your shopping patterns.
            </p>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105">
              Claim 20% Off
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;