import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Subscription = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentType, setPaymentType] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get plan details
  const selectedPlan = location.state?.selectedPlan;
  const planName = selectedPlan?.name || 'Monthly';
  const basePrice = Number(selectedPlan?.price ?? 29);
  const planId = selectedPlan?.id ?? null;

  const gst = parseFloat((basePrice * 0.18).toFixed(2));
  const total = (basePrice + gst).toFixed(2);

  const handlePayment = () => {
    if (!planId) {
      toast.error("Invalid plan selection. Please go back.");
      return;
    }
    setIsProcessing(true);
    toast.loading("Processing Secure Payment...");

    // Simulate a network delay
    setTimeout(() => {
      // Logic for Success vs Error (90% success rate simulation)
      const isSuccess = Math.random() > 0.05;

      if (isSuccess) {
        toast.dismiss();
        toast.success("Payment Successful!");
        navigate('/registration', { state: { planId } });
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
            <div className="flex justify-between text-indigo-200">
              <span>GST (18%)</span>
              <span>${gst}</span>
            </div>
          </div>
          <div className="flex justify-between mt-6 text-2xl font-bold">
            <span>Total Amount</span>
            <span>${total}</span>
          </div>
          <p className="mt-10 text-sm italic text-indigo-200">
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