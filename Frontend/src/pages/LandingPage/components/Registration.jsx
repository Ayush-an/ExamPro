import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Country, State } from 'country-state-city';
import { toast } from 'react-hot-toast';
import { registerOrganization } from '../../../utils/api';
import done from '../../../assets/images/done_img.png';

const Registration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [isCreated, setIsCreated] = useState(false);
  const [countries] = useState(Country.getAllCountries());
  const [states, setStates] = useState([]);

  const planId = location.state?.planId;

  const [formData, setFormData] = useState({
    orgName: '', orgEmail: '', country: '', countryCode: '', state: '', orgPhone: '', orgAddress: '',
    adminName: '', adminEmail: '', adminPhone: '', adminPassword: ''
  });

  useEffect(() => {
    if (!planId) {
      toast.error("Subscription required to access registration.");
      navigate('/pricing');
    }
  }, [planId, navigate]);

  useEffect(() => {
    if (formData.countryCode) {
      setStates(State.getStatesOfCountry(formData.countryCode));
    }
  }, [formData.countryCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "country") {
      const selectedCountry = countries.find(c => c.name === value);
      setFormData({ ...formData, country: value, countryCode: selectedCountry?.isoCode || '', state: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCreate = async () => {
    toast.loading("Configuring your instance...");
    try {
      const payload = {
        orgName: formData.orgName,
        email: formData.orgEmail,
        country: formData.country,
        state: formData.state,
        phone: formData.orgPhone,
        address: formData.orgAddress,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPhone: formData.adminPhone,
        password: formData.adminPassword,
        planId: planId
      };
      await registerOrganization(payload);
      toast.dismiss();
      setIsCreated(true);
      toast.success("Welcome aboard!");
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.error || "Registration failed. Please try again.");
    }
  };

  if (isCreated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="mb-1"><img src={done} alt="Success" className="mx-auto w-35 h-35" /></div>
        <h1 className="text-3xl font-bold text-gray-900">Success!</h1>
        <p className="mt-2 text-gray-500">Organization <strong>{formData.orgName}</strong> is live.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-8 py-3 mt-6 font-bold text-white transition bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          Go To Login And Enjoy Our Services
        </button>
      </div>
    );
  }
  const SummaryItem = ({ label, value }) => (
    <div className="space-y-0.5">
      <p className="text-[11px] font-bold text-gray-400 tracking-widest">{label}</p>
      <p className="text-sm font-medium text-gray-700 truncate">{value || 'Not provided'}</p>
    </div>
  );
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-4 py-10">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">

        {/* Stepper */}
        <div className="flex bg-gray-50 border-b border-gray-200">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 text-center py-4 text-xs font-semibold tracking-widest uppercase transition-all duration-200
            ${step === s
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-white"
                  : "text-gray-400"
                }`}
            >
              {s === 1 ? "Organization" : s === 2 ? "Admin" : "Review"}
            </div>
          ))}
        </div>

        <div className="p-8">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-600">Organization Name</label>
                  <input name="orgName" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500" />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-600">Official Email</label>
                  <input name="orgEmail" type="email" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500" />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-600">Country</label>
                  <select name="country" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500">
                    <option value="">Select Country</option>
                    {countries.map((c) => (
                      <option key={c.isoCode} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-600">State</label>
                  <select name="state" onChange={handleChange} disabled={!formData.country}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 disabled:bg-gray-100">
                    <option value="">Select State</option>
                    {states.map((s) => (
                      <option key={s.isoCode} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-600">Phone</label>
                  <input name="orgPhone" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500" />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-medium text-gray-600">Address</label>
                  <input name="orgAddress" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500" />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full mt-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-md"
              >
                Next: Admin Setup
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-600">Admin Name</label>
                  <input name="adminName" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500" />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-600">Admin Email</label>
                  <input name="adminEmail" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500" />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-600">Admin Phone</label>
                  <input name="adminPhone" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500" />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-600">Password</label>
                  <input type="password" name="adminPassword" onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500" />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50"
                >
                  Back
                </button>

                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 shadow-md"
                >
                  Review
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800">Review Your Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl">
                <div className="md:col-span-2">
                  <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4">Organization Info</h4>
                </div>
                <SummaryItem label="Organization Name" value={formData.orgName} />
                <SummaryItem label="Email" value={formData.orgEmail} />
                <SummaryItem label="Country" value={formData.country} />
                <SummaryItem label="State" value={formData.state} />
                <SummaryItem label="Phone" value={formData.orgPhone} />
                <SummaryItem label="Address" value={formData.orgAddress} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl">
                <div className="md:col-span-2">
                  <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4">Admin Info</h4>
                </div>
                <SummaryItem label="Admin Name" value={formData.adminName} />
                <SummaryItem label="Admin Email" value={formData.adminEmail} />
                <SummaryItem label="Admin Phone" value={formData.adminPhone} />
                <SummaryItem label="Password" value="••••••••" />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50"
                >
                  Back
                </button>

                <button
                  onClick={handleCreate}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 shadow-md"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
export default Registration;