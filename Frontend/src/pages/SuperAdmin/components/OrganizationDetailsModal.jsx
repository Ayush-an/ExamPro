import React, { useEffect, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { X, Building2, Mail, Phone, MapPin, Calendar, CreditCard, ShieldCheck, Users, FileText, Activity, Loader2 } from "lucide-react";
import { fetchOrganizationDetails } from "../../../utils/api";

export default function OrganizationDetailsModal({ organizationId, open, onClose }) {
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && organizationId) {
            const loadDetails = async () => {
                setLoading(true);
                try {
                    const data = await fetchOrganizationDetails(organizationId);
                    setOrg(data);
                } catch (err) {
                    console.error("Failed to fetch org details", err);
                } finally {
                    setLoading(false);
                }
            };
            loadDetails();
        }
    }, [open, organizationId]);

    if (!open) return null;

    return (
        <Transition show={open}>
            <Dialog onClose={onClose} className="relative z-50">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in"
                />

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <TransitionChild>
                            <DialogPanel
                                transition
                                className="relative transform overflow-hidden rounded-[2.5rem] bg-white text-left shadow-2xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in sm:my-8 sm:w-full sm:max-w-3xl data-closed:sm:scale-95"
                            >
                                {loading || !org ? (
                                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                                        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                                        <p className="text-xs font-bold text-slate-400 tracking-widest">Fetching Organization Audit Data...</p>
                                    </div>
                                ) : (
                                    <div className="p-8">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white text-2xl font-black">
                                                    {org.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <DialogTitle as="h3" className="text-2xl font-black text-slate-800 tracking-tight">
                                                        {org.name}
                                                    </DialogTitle>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest border ${org.status_code === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                            {org.status_code}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 tracking-widest">ID: #{org.id}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                <X size={24} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Column 1: Basic Info & Stats */}
                                            <div className="space-y-6">
                                                <div>
                                                    <h4 className="text-[10px] font-bold text-slate-400 tracking-widest mb-4">Contact Information</h4>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-colors hover:bg-white hover:border-indigo-100 group">
                                                            <Mail size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                                            <span className="text-sm font-bold text-slate-700">{org.email || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-colors hover:bg-white hover:border-indigo-100 group">
                                                            <Phone size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                                            <span className="text-sm font-bold text-slate-700">{org.phone || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-colors hover:bg-white hover:border-indigo-100 group">
                                                            <MapPin size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors mt-0.5" />
                                                            <div className="text-sm font-bold text-slate-700">
                                                                {org.address && <p>{org.address}</p>}
                                                                <p>{[org.city, org.state, org.zip_code].filter(Boolean).join(', ')}</p>
                                                                {org.country && <p>{org.country}</p>}
                                                                {!org.address && !org.city && 'No address recorded'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-[10px] font-bold text-slate-400 tracking-widest mb-4">Usage Statistics</h4>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div className="bg-indigo-50 p-4 rounded-2xl text-center border border-indigo-100 shadow-sm shadow-indigo-50/50">
                                                            <Users size={16} className="mx-auto mb-2 text-indigo-600" />
                                                            <p className="text-xl font-black text-indigo-700">{org.stats?.users || 0}</p>
                                                            <p className="text-[8px] font-bold text-indigo-400 tracking-widest mt-1">Users</p>
                                                        </div>
                                                        <div className="bg-emerald-50 p-4 rounded-2xl text-center border border-emerald-100 shadow-sm shadow-emerald-50/50">
                                                            <FileText size={16} className="mx-auto mb-2 text-emerald-600" />
                                                            <p className="text-xl font-black text-emerald-700">{org.stats?.exams || 0}</p>
                                                            <p className="text-[8px] font-bold text-emerald-400 tracking-widest mt-1">Exams</p>
                                                        </div>
                                                        <div className="bg-amber-50 p-4 rounded-2xl text-center border border-amber-100 shadow-sm shadow-amber-50/50">
                                                            <Activity size={16} className="mx-auto mb-2 text-amber-600" />
                                                            <p className="text-xl font-black text-amber-700">{org.stats?.questions || 0}</p>
                                                            <p className="text-[8px] font-bold text-amber-400 tracking-widest mt-1">Questions</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Column 2: Subscription & History */}
                                            <div className="space-y-6">
                                                <div className="bg-slate-900 rounded-4xl p-8 text-white shadow-2xl shadow-indigo-100">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <h4 className="text-[10px] font-bold text-slate-400 tracking-widest">Active License Plan</h4>
                                                        <CreditCard size={20} className="text-indigo-400" />
                                                    </div>
                                                    <div className="mb-6">
                                                        <h3 className="text-3xl font-black tracking-tight mb-1">{org.Subscriptions?.[0]?.Plan?.name || 'FREE TIER'}</h3>
                                                        <p className="text-indigo-400 text-xs font-bold tracking-widest">Member since {new Date(org.created_at).getFullYear()}</p>
                                                    </div>
                                                    <div className="space-y-4 pt-6 border-t border-white/10">
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-slate-400 font-medium">Billed Amount</span>
                                                            <span className="font-bold">{org.Subscriptions?.[0]?.Plan?.currency_code || '$'} {org.Subscriptions?.[0]?.Plan?.price || '0.00'}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-slate-400 font-medium">Expiration</span>
                                                            <span className="font-bold text-emerald-400">
                                                                {org.Subscriptions?.[0]?.end_date ? new Date(org.Subscriptions[0].end_date).toLocaleDateString() : 'LIFETIME'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <ShieldCheck className="text-slate-400" size={18} />
                                                        <h4 className="text-[10px] font-bold text-slate-400 tracking-widest">Compliance Status</h4>
                                                    </div>
                                                    <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                                                        "Organization is currently in good standing. All core services are operational and and security audits are up to date."
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-12 flex gap-3">
                                            <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xs tracking-wider hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">Provision Update</button>
                                            <button className="px-12 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs tracking-wider hover:bg-slate-200 transition" onClick={onClose}>Close Audit</button>
                                        </div>
                                    </div>
                                )}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
