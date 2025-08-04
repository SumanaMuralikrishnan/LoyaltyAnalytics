import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, Award, TrendingUp, Gift, Sparkles } from 'lucide-react';

const Hero = () => {
  const [pointsCount, setPointsCount] = useState(0);
  const [membersCount, setMembersCount] = useState(0);

  useEffect(() => {
    const pointsInterval = setInterval(() => {
      setPointsCount(prev => prev < 1250 ? prev + 25 : 1250);
    }, 50);

    const membersInterval = setInterval(() => {
      setMembersCount(prev => prev < 50000 ? prev + 1000 : 50000);
    }, 30);

    return () => {
      clearInterval(pointsInterval);
      clearInterval(membersInterval);
    };
  }, []);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-sky-100 rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-700">AI-Powered Loyalty Program</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Unlock
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent"> Unlimited</span>
              <br />
              Rewards
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Experience the future of customer loyalty with our AI-driven program. Earn points, climb tiers, and unlock exclusive rewards tailored just for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center">
                Start Earning Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="border-2 border-blue-500 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all">
                Watch Demo
              </button>
            </div>

            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{pointsCount.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Your Points</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{membersCount.toLocaleString()}+</div>
                <div className="text-sm text-gray-600">Happy Members</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">97%</div>
                <div className="text-sm text-gray-600">Satisfaction</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Your Dashboard</h3>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">Gold Member</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Current Points</span>
                    <span className="text-2xl font-bold text-blue-600">{pointsCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">325 points to next reward</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">Tier Progress</div>
                    <div className="text-xs text-gray-600">Gold Level</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Gift className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">Available Rewards</div>
                    <div className="text-xs text-gray-600">12 rewards</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Recent Activity</span>
                    <span className="text-xs text-blue-600">View All</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">+150 pts - Purchase</span>
                      <span className="text-xs text-gray-500 ml-auto">2h ago</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Badge Earned: Super Shopper</span>
                      <span className="text-xs text-gray-500 ml-auto">1d ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;