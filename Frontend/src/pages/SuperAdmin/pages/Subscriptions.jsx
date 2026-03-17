import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';
import { motion } from 'framer-motion';
import { CreditCard, Plus, ShieldCheck, CheckCircle2, Zap, Crown, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Subscriptions = () => {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        plan_type_code: 'STANDARD',
        billing_cycle_code: 'ANNUAL',
        currency_code: 'USD',
        features: '',
        status_code: 'ACTIVE'
    });

    const fetchPlans = async () => {
        try {
            const res = await api.get('/superadmin/plans');
            setPlans(res.data);
        } catch (err) {
            console.error("Failed to fetch plans", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDeploy = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/superadmin/plans/${editingId}`, formData);
                toast.success('Plan Architecture Updated!');
            } else {
                await api.post('/superadmin/plans', formData);
                toast.success('New Plan Architecture Deployed!');
            }
            handleCancel();
            fetchPlans();
        } catch (err) {
            toast.error(editingId ? 'Failed to update plan' : 'Failed to deploy plan');
        }
    };

    const handleEdit = (plan) => {
        setEditingId(plan.id);
        setFormData({
            name: plan.name,
            price: plan.price,
            plan_type_code: plan.plan_type_code,
            billing_cycle_code: plan.billing_cycle_code,
            currency_code: plan.currency_code,
            features: plan.features || '',
            status_code: plan.status_code
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({
            name: '',
            price: '',
            plan_type_code: 'STANDARD',
            billing_cycle_code: 'ANNUAL',
            currency_code: 'USD',
            features: '',
            status_code: 'ACTIVE'
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to decommission this plan model?')) return;
        try {
            await api.delete(`/superadmin/plans/${id}`);
            toast.success('Plan Architecture Decommissioned');
            fetchPlans();
        } catch (err) {
            toast.error('Failed to decommission plan');
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 text-left">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Investment Packages</h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">Configure and deploy subscription models.</p>
                </div>
                {!editingId && (
                    <button className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-black transition-all shadow-lg">
                        <Plus size={18} /> New Architecture
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden h-fit">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[100px] -mr-10 -mt-10"></div>
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <h3 className="text-lg font-black text-gray-900 tracking-tight">{editingId ? 'Edit Configuration' : 'Model Specification'}</h3>
                        {editingId && (
                            <button onClick={handleCancel} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors">Cancel Edit</button>
                        )}
                    </div>
                    <form className="space-y-6 relative z-10" onSubmit={handleDeploy}>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Plan Identity</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Platinum Plus"
                                    required
                                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:border-indigo-600 focus:bg-white outline-none text-sm font-semibold transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Base Pricing ($)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                    <input
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        required
                                        className="w-full p-4 pl-8 bg-gray-50 border border-transparent rounded-2xl focus:border-indigo-600 focus:bg-white outline-none text-sm font-semibold transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Plan Type Mapping</label>
                            <select
                                name="plan_type_code"
                                value={formData.plan_type_code}
                                onChange={handleChange}
                                className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:border-indigo-600 focus:bg-white outline-none text-sm font-semibold transition-all appearance-none"
                            >
                                <option value="STANDARD">Standard Pack</option>
                                <option value="PLATFORM_PLUS">Platform Plus</option>
                                <option value="ENTERPRISE">Enterprise Pro</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Features (Comma Separated)</label>
                            <textarea
                                name="features"
                                value={formData.features}
                                onChange={handleChange}
                                placeholder="e.g. 50 Participants, Exams Only, Standard Support"
                                className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:border-indigo-600 focus:bg-white outline-none text-sm font-semibold transition-all min-h-[100px]"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Billing Sequence</label>
                                <select
                                    name="billing_cycle_code"
                                    value={formData.billing_cycle_code}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:border-indigo-600 focus:bg-white outline-none text-sm font-semibold transition-all appearance-none"
                                >
                                    <option value="ANNUAL">Annual Billing</option>
                                    <option value="MONTHLY">Monthly Cycle</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Status</label>
                                <select
                                    name="status_code"
                                    value={formData.status_code}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:border-indigo-600 focus:bg-white outline-none text-sm font-semibold transition-all appearance-none"
                                >
                                    <option value="ACTIVE">Live</option>
                                    <option value="INACTIVE">Draft</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="w-full py-4.5 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]">
                            {editingId ? 'Update Plan Model' : 'Deploy Plan Model'}
                        </button>
                    </form>
                </div>

                <div className="space-y-6">
                    {plans.length > 0 ? plans.map((plan, idx) => (
                        <div key={plan.id} className={`${idx === 0 ? 'bg-linear-to-br from-indigo-900 via-indigo-950 to-black text-white' : 'bg-white text-gray-900 border border-gray-100'} p-8 rounded-[40px] relative overflow-hidden group shadow-2xl ${editingId === plan.id ? 'ring-2 ring-indigo-500' : ''}`}>
                            <div className="absolute top-0 right-0 p-8 flex gap-3">
                                <button
                                    onClick={() => handleDelete(plan.id)}
                                    className={`p-3 rounded-2xl border transition-all ${idx === 0 ? 'bg-white/10 border-white/10 text-white/40 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20' : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100'}`}
                                >
                                    <Trash2 size={20} />
                                </button>
                                <div className={`${idx === 0 ? 'bg-white/10' : 'bg-indigo-50'} backdrop-blur-md p-3 rounded-2xl border ${idx === 0 ? 'border-white/10' : 'border-indigo-100'}`}>
                                    {idx === 0 ? <Crown size={24} className="text-indigo-300" /> : <Zap size={24} className="text-indigo-600" />}
                                </div>
                            </div>

                            <div className="relative z-10">
                                <span className={`${idx === 0 ? 'text-indigo-300 bg-indigo-500/20 border-indigo-500/30' : 'text-indigo-600 bg-indigo-50 border-indigo-100'} text-[9px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border`}>
                                    {plan.plan_type_code}
                                </span>
                                <h4 className="text-3xl font-black mt-6 tracking-tight">{plan.name}</h4>
                                <p className={`${idx === 0 ? 'text-gray-400' : 'text-gray-500'} text-sm mt-2 font-medium`}>Professional architecture model with priority deployment status.</p>

                                <div className="mt-8 flex items-baseline gap-2">
                                    <span className={`text-5xl font-black ${idx === 0 ? 'text-white' : 'text-gray-900'}`}>{plan.currency_code === 'USD' ? '$' : plan.currency_code}{parseFloat(plan.price).toLocaleString()}</span>
                                    <span className={`${idx === 0 ? 'text-indigo-400' : 'text-indigo-600'} text-sm font-black uppercase tracking-wider`}>/ {plan.billing_cycle_code.toLowerCase()}</span>
                                </div>

                                {plan.features && (
                                    <div className="mt-8 space-y-3">
                                        {plan.features.split(',').map((feature, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <CheckCircle2 size={16} className={idx === 0 ? 'text-indigo-400' : 'text-indigo-600'} />
                                                <span className={`text-sm font-bold ${idx === 0 ? 'text-gray-300' : 'text-gray-600'}`}>{feature.trim()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-10 pt-10 border-t border-white/5 relative z-10 flex justify-between items-center">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={`w-8 h-8 rounded-full border-2 ${idx === 0 ? 'border-indigo-950 bg-indigo-800' : 'border-white bg-gray-100'} flex items-center justify-center text-[8px] font-black`}>U{i}</div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handleEdit(plan)}
                                    className={`text-[10px] font-black ${idx === 0 ? 'text-indigo-300' : 'text-indigo-600'} uppercase tracking-widest hover:opacity-70 transition-colors`}
                                >
                                    Edit Parameters
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="bg-gray-50 p-20 rounded-[40px] border border-gray-100 text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isLoading ? 'Synchronizing Architectures...' : 'No Plan Models Deployed'}</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Subscriptions;
