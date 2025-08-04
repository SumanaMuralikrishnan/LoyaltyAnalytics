import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Target, Star, Gift, Calendar, Users, ShoppingBag, Sparkles } from 'lucide-react';

const Challenges = () => {
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setStreakCount(prev => prev < 7 ? prev + 1 : 7);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const badges = [
    {
      name: "First Purchase",
      icon: ShoppingBag,
      points: 50,
      color: "from-amber-500 to-amber-600",
      earned: true,
      description: "Made your first purchase",
      earnedDate: "2024-01-15"
    },
    {
      name: "Loyal Shopper",
      icon: Star,
      points: 100,
      color: "from-blue-500 to-blue-600",
      earned: true,
      description: "Completed 5 purchases",
      earnedDate: "2024-02-01"
    },
    {
      name: "Super Referrer",
      icon: Users,
      points: 150,
      color: "from-green-500 to-green-600",
      earned: false,
      description: "Referred 5 friends",
      progress: 2
    },
    {
      name: "Challenge Master",
      icon: Target,
      points: 200,
      color: "from-purple-500 to-purple-600",
      earned: false,
      description: "Completed 10 challenges",
      progress: 6
    },
    {
      name: "Tier Climber",
      icon: Trophy,
      points: 250,
      color: "from-pink-500 to-pink-600",
      earned: true,
      description: "Reached Silver tier",
      earnedDate: "2024-01-20"
    },
    {
      name: "Birthday Star",
      icon: Gift,
      points: 100,
      color: "from-indigo-500 to-indigo-600",
      earned: false,
      description: "Shopped on your birthday",
      progress: 0
    }
  ];

  const challenges = [
    {
      title: "Spend $100 This Week",
      description: "Make purchases totaling $100 or more",
      progress: 75,
      reward: 150,
      timeLeft: "3 days left",
      category: "Spending",
      color: "from-green-400 to-green-600"
    },
    {
      title: "Try 3 New Categories",
      description: "Shop in categories you haven't explored",
      progress: 33,
      reward: 100,
      timeLeft: "1 week left",
      category: "Discovery",
      color: "from-blue-400 to-blue-600"
    },
    {
      title: "Refer 2 Friends",
      description: "Invite friends to join the program",
      progress: 50,
      reward: 200,
      timeLeft: "2 weeks left",
      category: "Social",
      color: "from-purple-400 to-purple-600"
    }
  ];

  const streaks = [
    {
      name: "Daily Login Streak",
      current: streakCount,
      target: 7,
      reward: 50,
      icon: Flame,
      color: "from-orange-400 to-red-500"
    },
    {
      name: "Weekly Purchase Streak",
      current: 2,
      target: 4,
      reward: 100,
      icon: ShoppingBag,
      color: "from-blue-400 to-blue-600"
    }
  ];

  const handleBadgeClick = (badge: any) => {
    if (!badge.earned && badge.progress >= 5) {
      setUnlockedBadge(badge);
      setShowBadgeUnlock(true);
    }
  };

  const completedChallenges = challenges.filter(c => c.progress === 100).length;
  const earnedBadges = badges.filter(b => b.earned).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Challenges & Achievements</h1>
          <p className="text-gray-600">Complete challenges, earn badges, and maintain streaks to maximize your rewards</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-blue-600">{earnedBadges}/{badges.length}</div>
            <div className="text-sm text-gray-600">Badges Earned</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-green-600">{completedChallenges}</div>
            <div className="text-sm text-gray-600">Challenges Done</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-orange-600">{streakCount}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Badges Section */}
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Achievement Badges</h2>
              <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {earnedBadges}/{badges.length} Earned
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge, index) => (
                <div 
                  key={index}
                  onClick={() => handleBadgeClick(badge)}
                  className={`relative p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                    badge.earned 
                      ? 'bg-white border-gray-200 shadow-md hover:shadow-lg' 
                      : 'bg-gray-100 border-gray-300 opacity-60 hover:opacity-80'
                  }`}
                >
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r ${badge.color} mb-3 ${
                    badge.earned ? '' : 'grayscale'
                  }`}>
                    <badge.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{badge.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                  
                  {badge.earned ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-blue-600">+{badge.points} pts</span>
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">+{badge.points} pts</span>
                      {badge.progress !== undefined && (
                        <span className="text-xs text-gray-500">{badge.progress}/5</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Streaks Section */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Active Streaks</h2>
                <Flame className="h-6 w-6 text-orange-500" />
              </div>

              <div className="space-y-4">
                {streaks.map((streak, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{streak.name}</span>
                      <span className="text-xl font-bold text-orange-500">{streak.current} days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className={`bg-gradient-to-r ${streak.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${(streak.current / streak.target) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Next milestone: {streak.target} days</span>
                      <span>Reward: +{streak.reward} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Streak Benefits</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">3-day streak: +10 bonus points</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">7-day streak: +25 bonus points</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">30-day streak: Special badge</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Challenges Section */}
        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">AI-Personalized Challenges</h2>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Tailored for you</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {challenges.map((challenge, index) => (
              <div 
                key={index}
                className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 ${
                  activeChallenge === index ? 'border-green-500' : 'border-gray-200'
                }`}
                onMouseEnter={() => setActiveChallenge(index)}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    {challenge.category}
                  </span>
                  <span className="text-sm text-gray-500">{challenge.timeLeft}</span>
                </div>

                <h3 className="font-bold text-gray-900 mb-2">{challenge.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{challenge.description}</p>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-bold text-green-600">{challenge.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${challenge.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${challenge.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">+{challenge.reward} pts</span>
                  <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Our AI analyzes your shopping patterns to create personalized challenges that match your preferences and increase your earning potential.
            </p>
            <button className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all transform hover:scale-105">
              View All Challenges
            </button>
          </div>
        </div>

        {/* Badge Unlock Modal */}
        {showBadgeUnlock && unlockedBadge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
              <div className="mb-6">
                <div className="animate-bounce">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${unlockedBadge.color} mb-4`}>
                    <unlockedBadge.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Badge Unlocked!</h2>
                <h3 className="text-lg font-semibold text-blue-600 mb-2">{unlockedBadge.name}</h3>
                <p className="text-gray-600 mb-4">{unlockedBadge.description}</p>
                <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">+{unlockedBadge.points} pts</div>
                  <div className="text-sm text-gray-600">Added to your account</div>
                </div>
              </div>
              <button
                onClick={() => setShowBadgeUnlock(false)}
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

export default Challenges;