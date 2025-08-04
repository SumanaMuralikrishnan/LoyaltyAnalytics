import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crown, Eye, EyeOff, Mail, Lock, Phone, Calendar, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    birthday: '',
    preferences: [] as string[]
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false,
    hasSpecialChar: false
  });
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const preferenceOptions = [
    'Electronics',
    'Apparel',
    'Home & Garden',
    'Sports & Outdoors',
    'Beauty & Health',
    'Books & Media'
  ];

  const validatePassword = (password: string) => {
    const validation = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    setPasswordValidation(validation);
    return Object.values(validation).every(Boolean);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      validatePassword(value);
    }
  };

  const handlePreferenceChange = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(preference)
        ? prev.preferences.filter(p => p !== preference)
        : [...prev.preferences, preference]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!validatePassword(formData.password)) {
      setError('Password does not meet requirements');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const success = await signup(formData);
      if (success) {
        setShowWelcomeBonus(true);
        setTimeout(() => {
          navigate('/customer/home');
        }, 3000);
      } else {
        setError('Signup failed. Please try again.');
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showWelcomeBonus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 max-w-md mx-auto">
            <div className="mb-6">
              <div className="animate-bounce">
                <Sparkles className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Bonus!</h2>
              <p className="text-gray-600 mb-4">Congratulations! You've earned your first 100 points!</p>
              <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600">+100 pts</div>
                <div className="text-sm text-gray-600">Welcome to Bronze tier!</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">Redirecting to your dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-2">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                Unlimited Loyalty
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Join the Program</h1>
            <p className="text-gray-600">Start earning rewards today!</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-2">
                Birthday (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="birthday"
                  name="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Shopping Preferences
              </label>
              <div className="grid grid-cols-2 gap-2">
                {preferenceOptions.map((preference) => (
                  <label key={preference} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preferences.includes(preference)}
                      onChange={() => handlePreferenceChange(preference)}
                      className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{preference}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password Requirements */}
              <div className="mt-2 space-y-1">
                <div className={`flex items-center space-x-2 text-xs ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.minLength ? <CheckCircle className="h-3 w-3" /> : <div className="h-3 w-3 border border-gray-300 rounded-full" />}
                  <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center space-x-2 text-xs ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.hasUpperCase ? <CheckCircle className="h-3 w-3" /> : <div className="h-3 w-3 border border-gray-300 rounded-full" />}
                  <span>One uppercase letter</span>
                </div>
                <div className={`flex items-center space-x-2 text-xs ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.hasLowerCase ? <CheckCircle className="h-3 w-3" /> : <div className="h-3 w-3 border border-gray-300 rounded-full" />}
                  <span>One lowercase letter</span>
                </div>
                <div className={`flex items-center space-x-2 text-xs ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.hasNumbers ? <CheckCircle className="h-3 w-3" /> : <div className="h-3 w-3 border border-gray-300 rounded-full" />}
                  <span>One number</span>
                </div>
                <div className={`flex items-center space-x-2 text-xs ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.hasSpecialChar ? <CheckCircle className="h-3 w-3" /> : <div className="h-3 w-3 border border-gray-300 rounded-full" />}
                  <span>One special character</span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !Object.values(passwordValidation).every(Boolean)}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Welcome Bonus Preview */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium text-blue-700">Welcome Bonus</span>
          </div>
          <p className="text-xs text-blue-600">
            Get 100 points instantly when you join!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;