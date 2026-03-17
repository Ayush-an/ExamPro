// src/pages/LandingPage/components/Pricing.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPlans } from '../../../utils/api';

const Pricing = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await fetchPlans();
        setPlans(data);
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  const handleSubscription = (plan) => {
    navigate('/subscription', { state: { selectedPlan: plan } });
  };

  if (loading) return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-6 py-20">
      <div className="max-w-6xl mx-auto text-center">

        {/* Heading */}
        <h2 className="text-5xl font-extrabold text-gray-900 leading-tight">
          Simple, Transparent Pricing
        </h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Choose the perfect plan for your organization. Upgrade anytime as you grow.
        </p>

        {/* Cards */}
        <div className="grid gap-10 mt-16 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-3xl p-10 transition-all duration-300 border
            ${idx === 0
                  ? "border-indigo-600 shadow-2xl scale-105 bg-white"
                  : "border-gray-200 shadow-md bg-white hover:shadow-xl hover:-translate-y-1"
                }`}
            >

              {/* Most Popular Badge */}
              {idx === 0 && (
                <div className="absolute px-5 py-1 text-xs font-bold text-white uppercase rounded-full shadow-md -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 tracking-widest">
                  MOST POPULAR
                </div>
              )}

              {/* Plan Type Badge */}
              {plan.plan_type_code && (
                <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full self-start">
                  {plan.plan_type_code}
                </span>
              )}

              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-gray-800">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="my-8">
                <span className="text-6xl font-extrabold text-gray-900 tracking-tight">
                  ${parseFloat(plan.price).toLocaleString()}
                </span>
                <span className="ml-2 text-gray-500 text-lg">
                  /{plan.billing_cycle_code ? plan.billing_cycle_code.toLowerCase() : 'month'}
                </span>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gray-200 mb-8"></div>

              {/* Dynamic Features from SuperAdmin */}
              <ul className="flex-grow space-y-4 text-gray-600 text-left">
                {plan.features ? plan.features.split(',').map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-1">✓</span>
                    <span>{feature.trim()}</span>
                  </li>
                )) : (
                  <>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span>Full Access to Admin Panel</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span>Advanced Real-time Dashboard</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span>24/7 Priority Support</span>
                    </li>
                  </>
                )}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleSubscription(plan)}
                className={`mt-10 w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200
              ${idx === 0
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                    : "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                  }`}
              >
                Get Started
              </button>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;