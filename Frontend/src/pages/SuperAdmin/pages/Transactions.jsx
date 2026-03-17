import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';
import { motion } from 'framer-motion';
import { History, Download, Filter, Search, MoreVertical, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await api.get('/superadmin/transactions');
                setTransactions(res.data);
            } catch (err) {
                console.error("Failed to fetch transactions", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex justify-between items-center text-left">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Financial Ledger</h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">Audit and track all platform revenue streams.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-3">
                        <Download size={18} /> Export Results
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden text-left">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-gray-100 w-80">
                        <Search size={16} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find transaction ID or organization..."
                            className="bg-transparent border-none outline-none text-xs font-semibold w-full placeholder:text-gray-300"
                        />
                    </div>
                    <button className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                        <Filter size={18} />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Transaction Ref</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Organization</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {transactions.length > 0 ? transactions.map((txn, i) => (
                                <tr key={txn.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-gray-900 tracking-tight">TXN-{txn.id.toString().padStart(4, '0')}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-[10px] font-black">
                                                {txn.Organization?.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-700">{txn.Organization?.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{txn.Plan?.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-gray-900">
                                            {txn.Plan?.currency_code} {parseFloat(txn.Plan?.price || 0).toLocaleString()}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${txn.payment_status_code === 'PAID' ? 'bg-emerald-50 text-emerald-600' :
                                            txn.payment_status_code === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                                            }`}>
                                            {txn.payment_status_code}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <p className="text-xs font-semibold text-gray-400">{new Date(txn.created_at).toLocaleDateString()}</p>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-10 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                                        {isLoading ? "Auditing Revenue Streams..." : "No Financial Records Found"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 bg-gray-50/30 flex justify-center border-t border-gray-50">
                    <button className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] hover:underline">View All Records</button>
                </div>
            </div>
        </motion.div>
    );
};

export default Transactions;
