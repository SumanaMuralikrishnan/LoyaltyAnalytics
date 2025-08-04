import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import TierSystem from '../components/TierSystem';
import Gamification from '../components/Gamification';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Features />
      <TierSystem />
      <Gamification />
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;