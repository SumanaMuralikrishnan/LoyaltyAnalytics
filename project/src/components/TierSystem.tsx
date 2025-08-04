import React, { useState } from 'react';
import { Medal, Crown, Star, ArrowRight, Check } from 'lucide-react';

const TierSystem = () => {
  const [activeTier, setActiveTier] = useState(1);

  const tiers = [
    {
      name: "Bronze",
      icon: Medal,
      color: "from-amber-600 to-amber-700",
      bgColor: "from-amber-50 to-amber-100",
      borderColor: "border-amber-200",
      points: "0-1,999 pts",
      earnRate: "1 pt/$1",
      redemptionRate: "100 pts = $1",
      maxRedemption: "$15 per transaction",
      benefits: [
        "100-point welcome bonus",
        "Basic rewards catalog access",
        "Points expire after 24 months",
        "Email support"
      ],
      maintenance: "1,000 pts/year"
    },
    {
      name: "Silver",
      icon: Star,
      color: "from-gray-500 to-gray-600",
      bgColor: "from-gray-50 to-gray-100",
      borderColor: "border-gray-200",
      points: "2,000-9,999 pts",
      earnRate: "1.5 pts/$1",
      redemptionRate: "85 pts = $1",
      maxRedemption: "$40 per transaction",
      benefits: [
        "Free shipping on all orders",
        "200-point birthday bonus",
        "Early access to sales",
        "Extended rewards catalog",
        "Priority email support"
      ],
      maintenance: "2,000 pts/year"
    },
    {
      name: "Gold",
      icon: Crown,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "from-yellow-50 to-yellow-100",
      borderColor: "border-yellow-200",
      points: "10,000+ pts",
      earnRate: "1.75 pts/$1",
      redemptionRate: "70 pts = $1",
      maxRedemption: "$100 per transaction",
      benefits: [
        "Priority customer support",
        "Exclusive member events",
        "500-point birthday bonus",
        "Early access to limited products",
        "Premium rewards catalog",
        "Personal shopping assistant"
      ],
      maintenance: "10,000 pts/year"
    }
  ];

  return (
    <section id="tiers" className="py-20 bg-gradient-to-br from-blue-50 via-white to-sky-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Three Tiers of
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent"> Exclusive Benefits</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Climb through our intelligent tier system and unlock increasingly valuable rewards. Our AI tracks your progress and predicts your next tier advancement.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {tiers.map((tier, index) => (
            <div 
              key={index}
              className={`relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${tier.borderColor} border-2 ${
                activeTier === index ? 'ring-4 ring-blue-500/20 scale-105' : ''
              }`}
              onMouseEnter={() => setActiveTier(index)}
            >
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${tier.color} mb-4 shadow-lg`}>
                  <tier.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-gray-600 font-medium">{tier.points}</p>
              </div>

              <div className={`bg-gradient-to-r ${tier.bgColor} rounded-lg p-4 mb-6`}>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{tier.earnRate}</div>
                    <div className="text-xs text-gray-600">Earn Rate</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{tier.redemptionRate}</div>
                    <div className="text-xs text-gray-600">Redemption</div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <div className="text-sm font-semibold text-gray-900">{tier.maxRedemption}</div>
                  <div className="text-xs text-gray-600">Max per transaction</div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {tier.benefits.map((benefit, benefitIndex) => (
                  <div key={benefitIndex} className="flex items-start space-x-3">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="text-xs text-gray-600 text-center">
                  <span className="font-medium">Maintenance:</span> {tier.maintenance}
                </div>
              </div>

              {index < tiers.length - 1 && (
                <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 hidden lg:block">
                  <ArrowRight className="h-8 w-8 text-blue-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Tier Progression</h3>
            <p className="text-gray-600">Our machine learning algorithms predict your next tier advancement and suggest optimal spending strategies.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">92%</div>
              <div className="text-sm text-gray-600">Prediction Accuracy</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">2.3x</div>
              <div className="text-sm text-gray-600">Faster Tier Progression</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">$127</div>
              <div className="text-sm text-gray-600">Avg. Annual Savings</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TierSystem;