import React from 'react';
import { ArrowRight, Star, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTA = () => {
  return (
    <section id="rewards" className="py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-white/5 rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-32 right-1/3 w-8 h-8 bg-white/5 rounded-full"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Earning
            <span className="block text-sky-200">Unlimited Rewards?</span>
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Join thousands of satisfied customers who are already maximizing their rewards with our AI-powered loyalty program. Start earning points today!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <Zap className="h-8 w-8 text-yellow-300" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Instant Setup</h3>
            <p className="text-blue-100 text-sm">Get started in under 2 minutes with our streamlined onboarding process</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <Shield className="h-8 w-8 text-green-300" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure & Safe</h3>
            <p className="text-blue-100 text-sm">Bank-level security with AI fraud protection keeps your account safe</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <Star className="h-8 w-8 text-purple-300" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Premium Experience</h3>
            <p className="text-blue-100 text-sm">Enjoy personalized rewards and exclusive benefits tailored just for you</p>
          </div>
        </div>

        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              to="/signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg flex items-center"
            >
              Start Earning Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all">
              Watch Demo Video
            </button>
          </div>

          <div className="flex items-center justify-center space-x-6 text-blue-100">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-300 fill-current" />
              <span className="text-sm">4.9/5 Rating</span>
            </div>
            <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
            <div className="text-sm">50,000+ Members</div>
            <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
            <div className="text-sm">$2M+ Rewards Earned</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;