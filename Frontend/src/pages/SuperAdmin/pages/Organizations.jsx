import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';
import { motion } from 'framer-motion';
import { Building2, Search, Filter, Plus, MoreVertical, MapPin, Users, Activity, ShieldCheck } from 'lucide-react';
import OrganizationDetailsModal from '../components/OrganizationDetailsModal';

const Organizations = () => {
    const [organizations, setOrganizations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrgId, setSelectedOrgId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const res = await api.get('/superadmin/organizations');
                setOrganizations(res.data);
            } catch (err) {
                console.error("Failed to fetch organizations", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrganizations();
    }, []);

    const stats = [
        { label: 'Total Clients', value: organizations.length, icon: Building2, color: 'text-indigo-600 bg-indigo-50' },
        { label: 'Active Licenses', value: organizations.filter(o => o.status_code === 'ACTIVE').length, icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
        { label: 'Enterprise Tier', value: organizations.filter(o => o.Subscriptions?.[0]?.Plan?.plan_type_code === 'ENTERPRISE').length, icon: ShieldCheck, color: 'text-amber-600 bg-amber-50' },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Client Directory</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage and provision organizational entities.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all">Export CSV</button>
                    <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
                        <Plus size={18} /> Provision Org
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
                        <div className={`p-4 rounded-2xl ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-extrabold text-slate-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-2xl border border-transparent focus-within:border-indigo-100 focus-within:bg-white transition-all w-80">
                        <Search size={16} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find organization..."
                            className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder:text-slate-300"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Alphabetical</button>
                        <button className="px-5 py-2.5 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-xl uppercase tracking-widest">Recently Active</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white border-b border-slate-50">
                                <th className="px-8 py-5 text-[15px] font-bold text-slate-500 tracking-widest">Organization</th>
                                <th className="px-8 py-5 text-[15px] font-bold text-slate-500 tracking-widest">License Plan</th>
                                <th className="px-8 py-5 text-[15px] font-bold text-slate-500 tracking-widest">Email / Contact</th>
                                <th className="px-8 py-5 text-[15px] font-bold text-slate-500 tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[15px] font-bold text-slate-500 tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {organizations.length > 0 ? organizations.map((org, i) => (
                                <tr key={org.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-900 border-4 border-slate-50 text-white flex items-center justify-center font-bold text-[14px] shadow-sm">
                                                {org.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 tracking-tight leading-tight group-hover:text-indigo-600 transition">{org.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Joined {new Date(org.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-indigo-600 tracking-tight">{org.Subscriptions?.[0]?.Plan?.name || 'N/A'}</span>
                                            <span className="text-[10px] text-slate-400 font-bold tracking-tight">
                                                {org.Subscriptions?.[0]?.Plan?.currency_code} {org.Subscriptions?.[0]?.Plan?.price || '0.00'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-700">{org.email || 'No email'}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{org.phone || 'No phone'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${org.status_code === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                            {org.status_code}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <button
                                                onClick={() => { setSelectedOrgId(org.id); setIsModalOpen(true); }}
                                                className="text-[10px] font-bold text-indigo-600 hover:text-white uppercase tracking-widest px-4 py-2 hover:bg-indigo-600 rounded-xl transition-all shadow-sm hover:shadow-indigo-100"
                                            >
                                                Audit
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-16 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                        {isLoading ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                <span>Synchronizing Directory...</span>
                                            </div>
                                        ) : "No Organizations Registered"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <OrganizationDetailsModal
                organizationId={selectedOrgId}
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </motion.div>
    );
};

export default Organizations;
