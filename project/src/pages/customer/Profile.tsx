import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Settings, Bell, Shield, LogOut, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    birthday: user?.birthday || '',
    preferences: user?.preferences || []
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: true
  });

  const preferenceOptions = [
    'Electronics',
    'Apparel',
    'Home & Garden',
    'Sports & Outdoors',
    'Beauty & Health',
    'Books & Media'
  ];

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      email: user?.email || '',
      phone: user?.phone || '',
      birthday: user?.birthday || '',
      preferences: user?.preferences || []
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePreferenceChange = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(preference)
        ? prev.preferences.filter(p => p !== preference)
        : [...prev.preferences, preference]
    }));
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'from-amber-500 to-amber-600';
      case 'Silver': return 'from-gray-400 to-gray-500';
      case 'Gold': return 'from-yellow-500 to-yellow-600';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile & Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        {/* Profile Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user?.email?.split('@')[0]}</h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
            <div className={`bg-gradient-to-r ${getTierColor(user?.tier || 'Bronze')} text-white px-4 py-2 rounded-full`}>
              <span className="font-semibold">{user?.tier} Member</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{user?.points_balance.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Current Points</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{user?.points_earned_last_12_months.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Points This Year</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">${user?.total_spend.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {user?.created_at ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
              </div>
              <div className="text-sm text-gray-600">Days Member</div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-2" />
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 py-2">{user?.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-2" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 py-2">{user?.phone || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-2" />
                Birthday
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 py-2">
                  {user?.birthday ? new Date(user.birthday).toLocaleDateString() : 'Not provided'}
                </p>
              )}
            </div>
          </div>

          {/* Shopping Preferences */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Shopping Preferences</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {preferenceOptions.map((preference) => (
                <label key={preference} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.preferences.includes(preference)}
                    onChange={() => isEditing && handlePreferenceChange(preference)}
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">{preference}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <Bell className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
          </div>

          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 capitalize">
                    {key === 'sms' ? 'SMS' : key} Notifications
                  </div>
                  <div className="text-sm text-gray-600">
                    {key === 'email' && 'Receive notifications via email'}
                    {key === 'push' && 'Browser push notifications'}
                    {key === 'sms' && 'Text message notifications'}
                    {key === 'marketing' && 'Promotional offers and updates'}
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Settings className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Account Actions</h3>
          </div>

          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Privacy Settings</div>
                  <div className="text-sm text-gray-600">Manage your data and privacy preferences</div>
                </div>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600"
            >
              <div className="flex items-center space-x-3">
                <LogOut className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Sign Out</div>
                  <div className="text-sm">Sign out of your account</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;