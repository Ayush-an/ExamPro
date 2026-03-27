import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { verifyCoupon } from '../../../utils/api';

const Subscription = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentType, setPaymentType] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null); // { discount_amount, discount_type, discount_value, coupon_code }
  const [couponLoading, setCouponLoading] = useState(false);

  // Get plan details
  const selectedPlan = location.state?.selectedPlan;
  const planName = selectedPlan?.name || 'Monthly';
  const basePrice = Number(selectedPlan?.price ?? 29);
  const planId = selectedPlan?.id ?? null;

  const discount = couponApplied ? couponApplied.discount_amount : 0;
  const priceAfterDiscount = Math.max(0, basePrice - discount);
  const gst = parseFloat((priceAfterDiscount * 0.18).toFixed(2));
  const total = (priceAfterDiscount + gst).toFixed(2);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    setCouponLoading(true);
    try {
      const data = await verifyCoupon(couponCode.trim(), planId);
      setCouponApplied({
        coupon_code: data.coupon_code,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        discount_amount: data.discount_amount || 0,
      });
      toast.success(`Coupon "${data.coupon_code}" applied! You save $${(data.discount_amount || 0).toFixed(2)}`);
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid coupon code';
      toast.error(msg);
      setCouponApplied(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const handlePayment = () => {
    if (!planId) {
      toast.error("Invalid plan selection. Please go back.");
      return;
    }
    setIsProcessing(true);
    toast.loading("Processing Secure Payment...");

    setTimeout(() => {
      const isSuccess = Math.random() > 0.05;

      if (isSuccess) {
        toast.dismiss();
        toast.success("Payment Successful!");
        navigate('/registration', { 
          state: { 
            planId,
            coupon_code: couponApplied?.coupon_code || null,
          } 
        });
      } else {
        toast.dismiss();
        navigate('/error');
      }
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 py-12 bg-slate-50">
      <div className="grid w-full max-w-4xl gap-8 overflow-hidden bg-white border border-gray-100 shadow-2xl md:grid-cols-2 rounded-3xl">

        {/* Left Side: Order Summary */}
        <div className="p-10 text-white bg-indigo-600">
          <h2 className="mb-6 text-2xl font-bold">Order Summary</h2>
          <div className="pb-6 space-y-4 border-b border-indigo-400">
            <div className="flex justify-between">
              <span>2BRAINR {planName} Plan</span>
              <span>${basePrice.toFixed(2)}</span>
            </div>

            {/* Coupon Discount Line */}
            {couponApplied && (
              <div className="flex justify-between text-emerald-200">
                <span className="flex items-center gap-2">
                  🎟️ Coupon ({couponApplied.coupon_code})
                  <button 
                    onClick={handleRemoveCoupon}
                    className="text-xs underline text-indigo-200 hover:text-white ml-1"
                  >
                    Remove
                  </button>
                </span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}

            {couponApplied && (
              <div className="flex justify-between text-indigo-200">
                <span>Subtotal</span>
                <span>${priceAfterDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-indigo-200">
              <span>GST (18%)</span>
              <span>${gst}</span>
            </div>
          </div>
          <div className="flex justify-between mt-6 text-2xl font-bold">
            <span>Total Amount</span>
            <span>${total}</span>
          </div>

          {/* Coupon Input Section */}
          <div className="mt-8 pt-6 border-t border-indigo-400">
            <p className="text-sm font-semibold mb-3 text-indigo-100">Have a coupon code?</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                disabled={!!couponApplied}
                className="flex-1 px-4 py-3 rounded-xl text-slate-800 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
              />
              {!couponApplied ? (
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="px-5 py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              ) : (
                <div className="px-4 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm flex items-center gap-1">
                  ✓ Applied
                </div>
              )}
            </div>
          </div>

          <p className="mt-6 text-sm italic text-indigo-200">
            * Your subscription will begin immediately after successful payment.
          </p>
        </div>

        {/* Right Side: Payment Methods */}
        <div className="p-10">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">Payment Method</h2>

          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setPaymentType('card')}
              className={`flex-1 py-3 rounded-xl border-2 transition ${paymentType === 'card' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-100 text-gray-400'}`}
            >
              💳 Card
            </button>
            <button
              onClick={() => setPaymentType('upi')}
              className={`flex-1 py-3 rounded-xl border-2 transition ${paymentType === 'upi' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-100 text-gray-400'}`}
            >
              📱 UPI
            </button>
          </div>

          <div className="space-y-4">
            {paymentType === 'card' ? (
              <>
                <input type="text" placeholder="Card Number" className="w-full p-4 outline-none bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="MM/YY" className="p-4 outline-none bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                  <input type="text" placeholder="CVV" className="p-4 outline-none bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                </div>
              </>
            ) : (
              <input type="text" placeholder="yourname@upi" className="w-full p-4 outline-none bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500" />
            )}

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`w-full py-4 mt-6 rounded-xl font-bold text-lg text-white transition ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-black'}`}
            >
              {isProcessing ? 'Processing...' : `Pay $${total}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;