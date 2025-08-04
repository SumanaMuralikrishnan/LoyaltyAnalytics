import React, { useState } from 'react';
import { Users, Share2, Copy, MessageSquare, Mail, Gift, Star, Check } from 'lucide-react';

const Referrals = () => {
  const [referralCode] = useState('LOYAL2024USER');
  const [copied, setCopied] = useState(false);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(false);

  const referralStats = {
    totalInvites: 8,
    successfulReferrals: 3,
    pendingInvites: 2,
    totalPointsEarned: 600
  };

  const referralHistory = [
    {
      id: 1,
      email: 'john@example.com',
      status: 'completed',
      points: 200,
      date: '2024-01-10',
      name: 'John Smith'
    },
    {
      id: 2,
      email: 'sarah@example.com',
      status: 'completed',
      points: 200,
      date: '2024-01-05',
      name: 'Sarah Johnson'
    },
    {
      id: 3,
      email: 'mike@example.com',
      status: 'completed',
      points: 200,
      date: '2023-12-28',
      name: 'Mike Davis'
    },
    {
      id: 4,
      email: 'emma@example.com',
      status: 'pending',
      points: 0,
      date: '2024-01-12',
      name: 'Emma Wilson'
    },
    {
      id: 5,
      email: 'alex@example.com',
      status: 'pending',
      points: 0,
      date: '2024-01-08',
      name: 'Alex Brown'
    }
  ];

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaEmail = () => {
    const subject = 'Join Unlimited Loyalty and Start Earning Rewards!';
    const body = `Hi there!\n\nI've been using Unlimited Loyalty and thought you'd love it too! It's an amazing rewards program where you earn points on every purchase.\n\nUse my referral code: ${referralCode}\n\nWe'll both get bonus points when you join!\n\nSign up here: ${window.location.origin}/signup\n\nHappy shopping!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const shareViaSMS = () => {
    const message = `Join Unlimited Loyalty with my code ${referralCode} and we'll both get bonus points! Sign up: ${window.location.origin}/signup`;
    window.location.href = `sms:?body=${encodeURIComponent(message)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSuperReferrerCheck = () => {
    if (referralStats.successfulReferrals >= 5) {
      setShowBadgeUnlock(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Refer Friends</h1>
          <p className="text-gray-600">Share the love and earn points together!</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-blue-600">{referralStats.totalInvites}</div>
            <div className="text-sm text-gray-600">Total Invites</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-green-600">{referralStats.successfulReferrals}</div>
            <div className="text-sm text-gray-600">Successful</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-yellow-600">{referralStats.pendingInvites}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-purple-600">{referralStats.totalPointsEarned}</div>
            <div className="text-sm text-gray-600">Points Earned</div>
          </div>
        </div>

        {/* Referral Code Section */}
        <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl p-6 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your Referral Code</h2>
            <p className="text-gray-600">Share this code with friends to earn 200 points each!</p>
          </div>

          <div className="bg-white rounded-lg p-4 mb-6 text-center">
            <div className="text-2xl font-mono font-bold text-blue-600 mb-2">{referralCode}</div>
            <button
              onClick={copyReferralCode}
              className="flex items-center justify-center space-x-2 mx-auto text-blue-600 hover:text-blue-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span className="text-sm">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="text-sm">Copy Code</span>
                </>
              )}
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={shareViaEmail}
              className="flex items-center justify-center space-x-2 bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <Mail className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-900">Email</span>
            </button>
            <button
              onClick={shareViaSMS}
              className="flex items-center justify-center space-x-2 bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="h-5 w-5 text-green-600" />
              <span className="font-medium text-gray-900">SMS</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <Share2 className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-gray-900">More</span>
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">How Referrals Work</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Share2 className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">1. Share Your Code</h4>
              <p className="text-sm text-gray-600">Send your unique referral code to friends and family</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">2. They Join</h4>
              <p className="text-sm text-gray-600">Your friend signs up using your referral code</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Gift className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">3. Earn Together</h4>
              <p className="text-sm text-gray-600">You both get 200 bonus points instantly!</p>
            </div>
          </div>
        </div>

        {/* Referral History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Referral History</h3>
              {referralStats.successfulReferrals >= 5 && (
                <button
                  onClick={handleSuperReferrerCheck}
                  className="flex items-center space-x-2 text-yellow-600 hover:text-yellow-700 transition-colors"
                >
                  <Star className="h-5 w-5" />
                  <span className="text-sm font-medium">Super Referrer Badge Available!</span>
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {referralHistory.map((referral) => (
              <div key={referral.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 rounded-full p-2">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{referral.name}</h4>
                      <p className="text-sm text-gray-600">{referral.email}</p>
                      <p className="text-xs text-gray-500">{new Date(referral.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                      {referral.status === 'completed' ? 'Completed' : 'Pending'}
                    </span>
                    {referral.points > 0 && (
                      <div className="text-sm font-semibold text-green-600 mt-1">
                        +{referral.points} pts
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {referralHistory.length === 0 && (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No referrals yet</h3>
              <p className="text-gray-600">Start sharing your code to earn bonus points!</p>
            </div>
          )}
        </div>

        {/* Super Referrer Badge Modal */}
        {showBadgeUnlock && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
              <div className="mb-6">
                <div className="animate-bounce">
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Star className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Badge Unlocked!</h2>
                <h3 className="text-lg font-semibold text-yellow-600 mb-2">Super Referrer</h3>
                <p className="text-gray-600 mb-4">You've successfully referred 5 friends!</p>
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600">+150 pts</div>
                  <div className="text-sm text-gray-600">Bonus points earned</div>
                </div>
              </div>
              <button
                onClick={() => setShowBadgeUnlock(false)}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all"
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

export default Referrals;