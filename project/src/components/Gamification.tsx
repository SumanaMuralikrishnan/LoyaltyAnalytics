import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Target, Star, Gift, Calendar, Users, ShoppingBag } from 'lucide-react';

const Gamification = () => {
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [streakCount, setStreakCount] = useState(0);

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
      description: "Made your first purchase"
    },
    {
      name: "Loyal Shopper",
      icon: Star,
      points: 100,
      color: "from-blue-500 to-blue-600",
      earned: true,
      description: "Completed 5 purchases"
    },
    {
      name: "Super Referrer",
      icon: Users,
      points: 150,
      color: "from-green-500 to-green-600",
      earned: false,
      description: "Referred 5 friends"
    },
    {
      name: "Challenge Master",
      icon: Target,
      points: 200,
      color: "from-purple-500 to-purple-600",
      earned: false,
      description: "Completed 10 challenges"
    },
    {
      name: "Tier Climber",
      icon: Trophy,
      points: 250,
      color: "from-pink-500 to-pink-600",
      earned: true,
      description: "Reached Gold tier"
    },
    {
      name: "Birthday Star",
      icon: Gift,
      points: 100,
      color: "from-indigo-500 to-indigo-600",
      earned: false,
      description: "Shopped on your birthday"
    }
  ];

  const challenges = [
    {
      title: "Spend $100 This Week",
      description: "Make purchases totaling $100 or more",
      progress: 75,
      reward: 150,
      timeLeft: "3 days left",
      category: "Spending"
    },
    {
      title: "Try 3 New Categories",
      description: "Shop in categories you haven't explored",
      progress: 33,
      reward: 100,
      timeLeft: "1 week left",
      category: "Discovery"
    },
    {
      title: "Refer 2 Friends",
      description: "Invite friends to join the program",
      progress: 50,
      reward: 200,
      timeLeft: "2 weeks left",
      category: "Social"
    }
  ];

  return (
    <section id="gamification" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Gamified
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent"> Loyalty Experience</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Earn badges, maintain streaks, and complete AI-personalized challenges to maximize your rewards and make shopping more engaging than ever.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Badges Section */}
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Achievement Badges</h3>
              <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {badges.filter(badge => badge.earned).length}/{badges.length} Earned
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge, index) => (
                <div 
                  key={index}
                  className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                    badge.earned 
                      ? 'bg-white border-gray-200 shadow-md hover:shadow-lg' 
                      : 'bg-gray-100 border-gray-300 opacity-60'
                  }`}
                >
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r ${badge.color} mb-3 ${
                    badge.earned ? '' : 'grayscale'
                  }`}>
                    <badge.icon className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{badge.name}</h4>
                  <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-blue-600">+{badge.points} pts</span>
                    {badge.earned && (
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Streaks Section */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Active Streaks</h3>
                <Flame className="h-8 w-8 text-orange-500" />
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Daily Login Streak</span>
                    <span className="text-2xl font-bold text-orange-500">{streakCount} days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(streakCount / 7) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Next milestone: 7 days</span>
                    <span>Reward: +50 pts</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Weekly Purchase Streak</span>
                    <span className="text-2xl font-bold text-blue-500">2 weeks</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Next milestone: 4 weeks</span>
                    <span>Reward: +100 pts</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Streak Benefits</h3>
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
        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">AI-Personalized Challenges</h3>
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
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

                <h4 className="font-bold text-gray-900 mb-2">{challenge.title}</h4>
                <p className="text-sm text-gray-600 mb-4">{challenge.description}</p>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-bold text-green-600">{challenge.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
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
      </div>
    </section>
  );
};

export default Gamification;