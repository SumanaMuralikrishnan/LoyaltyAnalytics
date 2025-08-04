import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Cart = () => {
  const { user, updateUser } = useAuth();
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Wireless Headphones',
      price: 99.99,
      quantity: 1,
      image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
    {
      id: 2,
      name: 'Smart Watch',
      price: 199.99,
      quantity: 1,
      image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=200'
    }
  ]);
  
  const [paymentMethod, setPaymentMethod] = useState<'discount' | 'points'>('discount');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate tier-based discount and points
  const getTierBenefits = () => {
    const tier = user?.tier || 'Bronze';
    switch (tier) {
      case 'Gold':
        return { 
          discountPercent: 25, 
          maxDiscount: 100, 
          pointsRate: 70, 
          earnRate: 1.75,
          maxRedeemablePoints: Math.min(7143, Math.floor(subtotal * 0.25 * 70))
        };
      case 'Silver':
        return { 
          discountPercent: 20, 
          maxDiscount: 40, 
          pointsRate: 85, 
          earnRate: 1.5,
          maxRedeemablePoints: Math.min(3400, Math.floor(subtotal * 0.20 * 85))
        };
      default:
        return { 
          discountPercent: 15, 
          maxDiscount: 15, 
          pointsRate: 100, 
          earnRate: 1.0,
          maxRedeemablePoints: Math.min(1500, Math.floor(subtotal * 0.15 * 100))
        };
    }
  };

  const tierBenefits = getTierBenefits();
  const discountAmount = Math.min(subtotal * (tierBenefits.discountPercent / 100), tierBenefits.maxDiscount);
  const pointsDiscount = Math.min(tierBenefits.maxRedeemablePoints / tierBenefits.pointsRate, subtotal);
  const finalTotal = paymentMethod === 'discount' ? subtotal - discountAmount : subtotal - pointsDiscount;
  const pointsEarned = Math.floor(finalTotal * tierBenefits.earnRate);

  const updateQuantity = (id: number, change: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update user points
    if (user) {
      const pointsChange = paymentMethod === 'points' 
        ? -Math.floor(pointsDiscount * tierBenefits.pointsRate) + pointsEarned
        : pointsEarned;
      
      updateUser({
        points_balance: user.points_balance + pointsChange,
        points_earned_last_12_months: user.points_earned_last_12_months + Math.max(0, pointsChange),
        total_spend: user.total_spend + finalTotal
      });
    }

    setIsProcessing(false);
    setShowSuccess(true);
    
    // Clear cart after successful purchase
    setTimeout(() => {
      setCartItems([]);
      setShowSuccess(false);
    }, 3000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto text-center">
          <div className="mb-6">
            <div className="animate-bounce">
              <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <CreditCard className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Successful!</h2>
            <p className="text-gray-600 mb-4">Thank you for your order</p>
            <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">+{pointsEarned} pts</div>
              <div className="text-sm text-gray-600">Points earned from this purchase</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some items to start earning points!</p>
            <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all">
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-gray-600">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-semibold text-gray-900 w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* AI Suggestion */}
            <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Smart Savings</span>
              </div>
              <p className="text-blue-800 text-sm">
                As a {user?.tier} member, save ${discountAmount.toFixed(2)} with your tier discount!
              </p>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="discount"
                    checked={paymentMethod === 'discount'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'discount' | 'points')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm">
                    <span className="font-medium">Tier Discount</span>
                    <span className="text-gray-600 block">Save ${discountAmount.toFixed(2)} ({tierBenefits.discountPercent}% off)</span>
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="points"
                    checked={paymentMethod === 'points'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'discount' | 'points')}
                    className="text-blue-600 focus:ring-blue-500"
                    disabled={!user || user.points_balance < tierBenefits.maxRedeemablePoints}
                  />
                  <span className="ml-3 text-sm">
                    <span className="font-medium">Use Points</span>
                    <span className="text-gray-600 block">
                      {Math.floor(pointsDiscount * tierBenefits.pointsRate)} pts = ${pointsDiscount.toFixed(2)}
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {paymentMethod === 'discount' ? 'Tier Discount' : 'Points Discount'}
                  </span>
                  <span className="font-semibold text-green-600">
                    -${(paymentMethod === 'discount' ? discountAmount : pointsDiscount).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-blue-600">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 font-medium">Points to Earn</span>
                    <span className="font-bold text-blue-600">+{pointsEarned} pts</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Complete Purchase
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;