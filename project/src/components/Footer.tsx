import React from 'react';
import { Crown, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-2">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Unlimited Loyalty</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              The future of customer loyalty programs. Our AI-powered platform delivers personalized rewards, intelligent tier progression, and engaging gamification to maximize your shopping experience.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-blue-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-blue-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-blue-600 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-blue-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#tiers" className="text-gray-400 hover:text-white transition-colors">Tier System</a></li>
              <li><a href="#rewards" className="text-gray-400 hover:text-white transition-colors">Rewards</a></li>
              <li><a href="#gamification" className="text-gray-400 hover:text-white transition-colors">Challenges</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Success Stories</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Status Page</a></li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-blue-500" />
              <span className="text-gray-400">support@unlimitedloyalty.com</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-blue-500" />
              <span className="text-gray-400">1-800-LOYALTY (568-2589)</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-blue-500" />
              <span className="text-gray-400">San Francisco, CA</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-500 mb-1">50,000+</div>
              <div className="text-sm text-gray-400">Active Members</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500 mb-1">$2M+</div>
              <div className="text-sm text-gray-400">Rewards Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-500 mb-1">97%</div>
              <div className="text-sm text-gray-400">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500 mb-1">24/7</div>
              <div className="text-sm text-gray-400">Support Available</div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Unlimited Loyalty. All rights reserved. Powered by AI and built with ❤️</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;