import React from 'react';
import { Brain, Zap, Shield, Target, TrendingUp, Gift, Users, Smartphone } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Personalization",
      description: "Machine learning algorithms analyze your preferences to deliver personalized rewards and challenges tailored just for you.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Zap,
      title: "Instant Rewards",
      description: "Earn points immediately with every purchase and redeem them instantly for discounts, vouchers, and exclusive perks.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Target,
      title: "Smart Tier System",
      description: "Progress through Bronze, Silver, and Gold tiers with increasing benefits and exclusive access to premium rewards.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Shield,
      title: "Fraud Protection",
      description: "Advanced AI fraud detection ensures secure transactions and protects your points from unauthorized access.",
      color: "from-red-500 to-red-600"
    },
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description: "Get insights into your spending patterns and receive predictions on tier progression and optimal redemption timing.",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: Gift,
      title: "Gamified Experience",
      description: "Unlock badges, maintain streaks, and complete challenges to earn bonus points and exclusive rewards.",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: Users,
      title: "Referral Program",
      description: "Invite friends and family to earn bonus points. Our AI identifies your referral potential and optimizes rewards.",
      color: "from-teal-500 to-teal-600"
    },
    {
      icon: Smartphone,
      title: "Cross-Platform Access",
      description: "Access your loyalty account seamlessly across web, mobile, and in-store experiences with real-time synchronization.",
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent"> Maximum Rewards</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the next generation of loyalty programs with AI-driven personalization, advanced analytics, and seamless integration across all your shopping experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>

              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-sky-50 rounded-full px-6 py-3">
            <span className="text-sm font-medium text-blue-700 mr-2">🚀 Powered by Advanced AI</span>
            <span className="text-sm text-gray-600">• Machine Learning • Predictive Analytics • Real-time Processing</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;