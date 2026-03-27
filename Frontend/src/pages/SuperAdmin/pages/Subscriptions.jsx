import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, ShieldCheck, CheckCircle2, Zap, Crown, Trash2, Edit3, X, Info, AlertCircle, Loader2, Users, HelpCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";

const Subscriptions = () => {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        billing_cycle_code: 'ANNUAL',
        currency_code: 'USD',
        features: '',
        status_code: 'ACTIVE',
        description: '',
        participant_limit_enabled: false,
        participant_limit: '',
        active_participant_limit_enabled: false,
        active_participant_limit: '',
        question_limit_enabled: false,
        question_limit: '',
    });

    useEffect(() => {
        fetchPlanData();
    }, []);

    const fetchPlanData = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/superadmin/plans');
            setPlans(res.data);
        } catch (err) {
            console.error("Failed to fetch plans", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenModal = (plan = null) => {
        if (plan) {
            setEditingId(plan.id);
            setFormData({
                name: plan.name,
                price: plan.price,
                billing_cycle_code: plan.billing_cycle_code,
                currency_code: plan.currency_code,
                features: plan.features || '',
                status_code: plan.status_code,
                description: plan.description || '',
                participant_limit_enabled: plan.participant_limit != null,
                participant_limit: plan.participant_limit != null ? String(plan.participant_limit) : '',
                active_participant_limit_enabled: plan.active_participant_limit != null,
                active_participant_limit: plan.active_participant_limit != null ? String(plan.active_participant_limit) : '',
                question_limit_enabled: plan.question_limit != null,
                question_limit: plan.question_limit != null ? String(plan.question_limit) : '',
            });
        } else {
            setEditingId(null);
            setFormData({
                name: '',
                price: '',
                billing_cycle_code: 'ANNUAL',
                currency_code: 'USD',
                features: '',
                status_code: 'ACTIVE',
                description: '',
                participant_limit_enabled: false,
                participant_limit: '',
                active_participant_limit_enabled: false,
                active_participant_limit: '',
                question_limit_enabled: false,
                question_limit: '',
            });
        }
        setIsModalOpen(true);
    };

    const handleDeploy = async (e) => {
        e.preventDefault();
        const toastId = toast.loading(editingId ? 'Updating Architecture...' : 'Deploying New Architecture...');
        try {
            const payload = {
                name: formData.name,
                price: formData.price,
                billing_cycle_code: formData.billing_cycle_code,
                currency_code: formData.currency_code,
                features: formData.features,
                status_code: formData.status_code,
                description: formData.description,
                participant_limit: formData.participant_limit_enabled ? parseInt(formData.participant_limit) : null,
                active_participant_limit: formData.active_participant_limit_enabled ? parseInt(formData.active_participant_limit) : null,
                question_limit: formData.question_limit_enabled ? parseInt(formData.question_limit) : null,
            };
            if (editingId) {
                await api.put(`/superadmin/plans/${editingId}`, payload);
                toast.success('Architecture Successfully Updated!', { id: toastId });
            } else {
                await api.post('/superadmin/plans', payload);
                toast.success('New Architecture Deployed Globally!', { id: toastId });
            }
            setIsModalOpen(false);
            fetchPlanData();
        } catch (err) {
            toast.error(editingId ? 'Update Failed' : 'Deployment Failed', { id: toastId });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to decommission this plan model? It will be set to INACTIVE.')) return;
        const toastId = toast.loading('Decommissioning Architecture...');
        try {
            await api.delete(`/superadmin/plans/${id}`);
            toast.success('Architecture Set to INACTIVE', { id: toastId });
            fetchPlanData();
        } catch (err) {
            toast.error('Decommissioning Failed', { id: toastId });
        }
    };

    const formatLimit = (val) => val != null ? Number(val).toLocaleString() : 'Unlimited';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Investment Architectures</h2>
                    <p className="text-slate-500 font-medium mt-1">Configure global subscription models and license tiers.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                    <Plus size={20} />
                    <span>New Architecture</span>
                </button>
            </div>

            {/* Content Section */}
            {isLoading ? (
                <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 bg-white rounded-[2.5rem] border border-slate-100">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Synchronizing Plan Data...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {plans.map((plan, idx) => (
                            <motion.div 
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`group relative bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-50/50 transition-all duration-500 ${plan.status_code === 'INACTIVE' ? 'opacity-60 grayscale-[0.5]' : ''}`}
                            >
                                {/* Badge & Price Tag */}
                                <div className="flex justify-between items-start mb-8">
                                    <div className="space-y-1">
                                        <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${plan.status_code === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                            {plan.status_code}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-black text-slate-800 tracking-tighter">
                                            {plan.currency_code === 'USD' ? '$' : plan.currency_code}{parseFloat(plan.price).toLocaleString()}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{plan.billing_cycle_code}</div>
                                    </div>
                                </div>

                                {/* Title & Meta */}
                                <div className="mb-6">
                                    <h4 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{plan.name}</h4>
                                    <p className="text-xs font-medium text-slate-500 mt-2 leading-relaxed">
                                        {plan.description || "Comprehensive architecture model designed for priority deployment and enterprise scalability."}
                                    </p>
                                </div>

                                {/* Limits Section */}
                                <div className="space-y-2 mb-6 p-4 bg-slate-50 rounded-2xl">
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Plan Limits</div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-500">👥 Total Participants</span>
                                        <span className={`text-xs font-black ${plan.participant_limit != null ? 'text-indigo-600' : 'text-slate-400'}`}>
                                            {formatLimit(plan.participant_limit)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-500">✅ Active Participants</span>
                                        <span className={`text-xs font-black ${plan.active_participant_limit != null ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            {formatLimit(plan.active_participant_limit)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-500">📝 Questions</span>
                                        <span className={`text-xs font-black ${plan.question_limit != null ? 'text-amber-600' : 'text-slate-400'}`}>
                                            {formatLimit(plan.question_limit)}
                                        </span>
                                    </div>
                                </div>

                                {/* Features List */}
                                <div className="space-y-3 mb-10 min-h-[80px]">
                                    {plan.features ? plan.features.split(',').slice(0, 4).map((f, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />
                                            <span className="text-xs font-bold text-slate-600 truncate">{f.trim()}</span>
                                        </div>
                                    )) : (
                                        <div className="flex items-center gap-3 text-slate-300 italic">
                                            <Info size={16} />
                                            <span className="text-xs font-medium">Standard baseline features included</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-6 border-t border-slate-50">
                                    <button 
                                        onClick={() => handleOpenModal(plan)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
                                    >
                                        <Edit3 size={14} />
                                        <span>Modify</span>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(plan.id)}
                                        className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
                                        title="Deactivate Plan"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Empty State */}
                    {!isLoading && plans.length === 0 && (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-100 rounded-[3rem]">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
                                <CreditCard size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tighter">No Architectures Found</h3>
                            <p className="text-sm font-medium text-slate-400">Deploy your first subscription model to begin provisioning.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal Form */}
            <Transition show={isModalOpen}>
                <Dialog onClose={() => setIsModalOpen(false)} className="relative z-50">
                    <DialogBackdrop transition className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in" />
                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                            <TransitionChild transition className="relative transform overflow-hidden rounded-[2.5rem] bg-white text-left shadow-2xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in sm:my-8 sm:w-full sm:max-w-2xl data-closed:sm:scale-95">
                                <div className="p-10 max-h-[90vh] overflow-y-auto">
                                    <div className="flex items-center justify-between mb-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                                <ShieldCheck size={24} />
                                            </div>
                                            <div>
                                                <DialogTitle as="h3" className="text-2xl font-black text-slate-800 tracking-tight">
                                                    {editingId ? 'Edit Architecture' : 'Deploy Architecture'}
                                                </DialogTitle>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Specifications Repository</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <form onSubmit={handleDeploy} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-1 block">Plan Name</label>
                                                <input
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Platinum Plus"
                                                    required
                                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-bold transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-1 block">Pricing (USD)</label>
                                                <input
                                                    name="price"
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                    required
                                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-bold transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-1 block">Billing Frequency</label>
                                            <select
                                                name="billing_cycle_code"
                                                value={formData.billing_cycle_code}
                                                onChange={handleChange}
                                                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-bold transition-all appearance-none"
                                            >
                                                <option value="ANNUAL">Annual Sequence</option>
                                                <option value="MONTHLY">Monthly Cycle</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-1 block">System Features (CSV)</label>
                                            <textarea
                                                name="features"
                                                value={formData.features}
                                                onChange={handleChange}
                                                placeholder="e.g. 50 Participants, Priority Support, API Access"
                                                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-bold transition-all min-h-[80px]"
                                            />
                                        </div>

                                        {/* ─── Plan Limits Section ─── */}
                                        <div className="space-y-4 p-6 bg-linear-to-br from-indigo-50/50 to-slate-50 rounded-2xl border border-indigo-100/50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Users size={16} className="text-indigo-600" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Plan Limits</span>
                                                <span className="text-[8px] font-bold text-slate-400 ml-auto uppercase">Unchecked = Unlimited</span>
                                            </div>

                                            {/* Total Participant Limit */}
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer select-none min-w-[200px]">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.participant_limit_enabled}
                                                        onChange={(e) => setFormData({ ...formData, participant_limit_enabled: e.target.checked, participant_limit: e.target.checked ? formData.participant_limit : '' })}
                                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-xs font-bold text-slate-700">Total Participant Limit</span>
                                                </label>
                                                {formData.participant_limit_enabled && (
                                                    <input
                                                        type="number"
                                                        value={formData.participant_limit}
                                                        onChange={(e) => setFormData({ ...formData, participant_limit: e.target.value })}
                                                        placeholder="e.g. 15000"
                                                        min="1"
                                                        required
                                                        className="flex-1 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-bold transition-all"
                                                    />
                                                )}
                                            </div>

                                            {/* Active Participant Limit */}
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer select-none min-w-[200px]">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.active_participant_limit_enabled}
                                                        onChange={(e) => setFormData({ ...formData, active_participant_limit_enabled: e.target.checked, active_participant_limit: e.target.checked ? formData.active_participant_limit : '' })}
                                                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                                    />
                                                    <span className="text-xs font-bold text-slate-700">Active Participant Limit</span>
                                                </label>
                                                {formData.active_participant_limit_enabled && (
                                                    <input
                                                        type="number"
                                                        value={formData.active_participant_limit}
                                                        onChange={(e) => setFormData({ ...formData, active_participant_limit: e.target.value })}
                                                        placeholder="e.g. 10000"
                                                        min="1"
                                                        required
                                                        className="flex-1 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none text-sm font-bold transition-all"
                                                    />
                                                )}
                                            </div>

                                            {/* Question Limit */}
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer select-none min-w-[200px]">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.question_limit_enabled}
                                                        onChange={(e) => setFormData({ ...formData, question_limit_enabled: e.target.checked, question_limit: e.target.checked ? formData.question_limit : '' })}
                                                        className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                                                    />
                                                    <span className="text-xs font-bold text-slate-700">Question Limit</span>
                                                </label>
                                                {formData.question_limit_enabled && (
                                                    <input
                                                        type="number"
                                                        value={formData.question_limit}
                                                        onChange={(e) => setFormData({ ...formData, question_limit: e.target.value })}
                                                        placeholder="e.g. 10000"
                                                        min="1"
                                                        required
                                                        className="flex-1 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-100 outline-none text-sm font-bold transition-all"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-1 block">Deployment Status</label>
                                                <select
                                                    name="status_code"
                                                    value={formData.status_code}
                                                    onChange={handleChange}
                                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-bold transition-all appearance-none"
                                                >
                                                    <option value="ACTIVE">Live / Active</option>
                                                    <option value="INACTIVE">Draft / Inactive</option>
                                                </select>
                                            </div>
                                            <div className="flex items-end">
                                                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl w-full flex items-center gap-3">
                                                    <AlertCircle size={18} className="text-indigo-600 shrink-0" />
                                                    <p className="text-[8px] font-bold text-indigo-700 uppercase tracking-widest leading-relaxed">
                                                        Changes will be applied to all new subscriptions.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 flex gap-3">
                                            <button 
                                                type="submit" 
                                                className="flex-1 py-4.5 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] transition-all"
                                            >
                                                {editingId ? 'Push Update' : 'Initialize Deployment'}
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setIsModalOpen(false)}
                                                className="px-10 py-4.5 bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                                            >
                                                Abort
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </motion.div>
    );
};

export default Subscriptions;
