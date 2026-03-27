import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Plus, Edit3, Trash2, X, Percent, DollarSign, Tag, Loader2, AlertCircle } from 'lucide-react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { fetchCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../../utils/api';
import toast from 'react-hot-toast';

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [formData, setFormData] = useState({
        coupon_code: '',
        discount_type: 'PERCENTAGE',
        discount_value: '',
        description: ''
    });

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        setLoading(true);
        try {
            const data = await fetchCoupons();
            setCoupons(data);
        } catch (error) {
            toast.error('Failed to load coupons');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading(editingCoupon ? 'Updating Coupon...' : 'Creating Coupon...');
        try {
            if (editingCoupon) {
                await updateCoupon(editingCoupon.id, formData);
                toast.success('Coupon updated successfully!', { id: toastId });
            } else {
                await createCoupon(formData);
                toast.success('Coupon created successfully!', { id: toastId });
            }
            setIsModalOpen(false);
            loadCoupons();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Operation failed', { id: toastId });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to deactivate this coupon?')) return;
        const toastId = toast.loading('Deactivating Coupon...');
        try {
            await deleteCoupon(id);
            toast.success('Coupon deactivated', { id: toastId });
            loadCoupons();
        } catch (error) {
            toast.error('Failed to deactivate coupon', { id: toastId });
        }
    };

    const resetForm = () => {
        setFormData({
            coupon_code: '',
            discount_type: 'PERCENTAGE',
            discount_value: '',
            description: ''
        });
        setEditingCoupon(null);
    };

    const openModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                coupon_code: coupon.coupon_code,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value,
                description: coupon.description || ''
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Coupon Management</h2>
                    <p className="text-slate-500 font-medium mt-1">Create and manage discount codes for your customers.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                    <Plus size={20} />
                    <span>New Coupon</span>
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 bg-white rounded-[2.5rem] border border-slate-100">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Coupons...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {coupons.map((coupon, idx) => (
                            <motion.div
                                key={coupon.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`group relative bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-50/50 transition-all duration-500 ${coupon.status_code === 'INACTIVE' ? 'opacity-60 grayscale-[0.5]' : ''}`}
                            >
                                {/* Status & Discount Badge */}
                                <div className="flex justify-between items-start mb-8">
                                    <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${coupon.status_code === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                        {coupon.status_code}
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-2xl">
                                        {coupon.discount_type === 'PERCENTAGE' ? (
                                            <Percent size={16} className="text-indigo-600" />
                                        ) : (
                                            <DollarSign size={16} className="text-indigo-600" />
                                        )}
                                        <span className="text-xl font-black text-indigo-700 tracking-tighter">
                                            {coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
                                        </span>
                                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest ml-1">OFF</span>
                                    </div>
                                </div>

                                {/* Coupon Code & Info */}
                                <div className="mb-8">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                                            <Ticket size={20} className="text-indigo-600" />
                                        </div>
                                        <h4 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors uppercase">
                                            {coupon.coupon_code}
                                        </h4>
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-2">
                                        {coupon.description || 'No description provided for this coupon code.'}
                                    </p>
                                </div>

                                {/* Meta Info */}
                                <div className="space-y-3 mb-8">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</span>
                                        <span className="text-xs font-bold text-slate-600">
                                            {coupon.discount_type === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Created</span>
                                        <span className="text-xs font-bold text-slate-600">
                                            {new Date(coupon.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-6 border-t border-slate-50">
                                    <button
                                        onClick={() => openModal(coupon)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
                                    >
                                        <Edit3 size={14} />
                                        <span>Modify</span>
                                    </button>
                                    {coupon.status_code === 'ACTIVE' && (
                                        <button
                                            onClick={() => handleDelete(coupon.id)}
                                            className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
                                            title="Deactivate Coupon"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Empty State */}
                    {!loading && coupons.length === 0 && (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-100 rounded-[3rem]">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
                                <Ticket size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tighter">No Coupons Found</h3>
                            <p className="text-sm font-medium text-slate-400">Create your first coupon to start offering discounts.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            <Transition show={isModalOpen}>
                <Dialog onClose={() => setIsModalOpen(false)} className="relative z-50">
                    <DialogBackdrop transition className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in" />
                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                            <TransitionChild transition className="relative transform overflow-hidden rounded-[2.5rem] bg-white text-left shadow-2xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in sm:my-8 sm:w-full sm:max-w-xl data-closed:sm:scale-95">
                                <div className="p-10">
                                    <div className="flex items-center justify-between mb-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                                <Ticket size={24} />
                                            </div>
                                            <div>
                                                <DialogTitle as="h3" className="text-2xl font-black text-slate-800 tracking-tight">
                                                    {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                                                </DialogTitle>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Discount Configuration</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-1 block">Coupon Code</label>
                                            <input
                                                type="text"
                                                required
                                                disabled={!!editingCoupon}
                                                value={formData.coupon_code}
                                                onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })}
                                                placeholder="e.g. SUMMER2026"
                                                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-1 block">Discount Type</label>
                                                <select
                                                    value={formData.discount_type}
                                                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-bold transition-all appearance-none"
                                                >
                                                    <option value="PERCENTAGE">Percentage (%)</option>
                                                    <option value="FIXED">Fixed Amount ($)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-1 block">
                                                    {formData.discount_type === 'PERCENTAGE' ? 'Percentage (%)' : 'Amount ($)'}
                                                </label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.discount_value}
                                                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                                    placeholder={formData.discount_type === 'PERCENTAGE' ? '25' : '50'}
                                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-bold transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-1 block">Description</label>
                                            <textarea
                                                rows={3}
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Special summer discount for premium plans..."
                                                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-bold transition-all min-h-[100px] resize-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="flex items-end">
                                                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl w-full flex items-center gap-3">
                                                    <AlertCircle size={18} className="text-indigo-600 shrink-0" />
                                                    <p className="text-[8px] font-bold text-indigo-700 uppercase tracking-widest leading-relaxed">
                                                        Coupon codes cannot be changed after creation.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 flex gap-3">
                                            <button
                                                type="submit"
                                                className="flex-1 py-4.5 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] transition-all"
                                            >
                                                {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsModalOpen(false)}
                                                className="px-10 py-4.5 bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                                            >
                                                Cancel
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

export default Coupons;
