import React, { useState, useEffect } from 'react';
import { Menu, X, Crown, Star, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-2">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              Unlimited Loyalty
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('features')}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('tiers')}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Tiers
            </button>
            <button 
              onClick={() => scrollToSection('rewards')}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Rewards
            </button>
            <button 
              onClick={() => scrollToSection('gamification')}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Challenges
            </button>
            <Link 
              to="/login"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
            >
              Get Started
            </Link>
          </nav>

          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-700 hover:text-blue-600 transition-colors text-left"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('tiers')}
                className="text-gray-700 hover:text-blue-600 transition-colors text-left"
              >
                Tiers
              </button>
              <button 
                onClick={() => scrollToSection('rewards')}
                className="text-gray-700 hover:text-blue-600 transition-colors text-left"
              >
                Rewards
              </button>
              <button 
                onClick={() => scrollToSection('gamification')}
                className="text-gray-700 hover:text-blue-600 transition-colors text-left"
              >
                Challenges
              </button>
              <Link 
                to="/login"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all w-full text-center"
              >
                Get Started
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;