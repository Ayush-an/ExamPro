import React, { useState, useEffect } from 'react';
import {
    Search, Hash, Layers,
    Trash2, RefreshCw
} from 'lucide-react';
import {
    fetchRemovedTopics
} from '../../../utils/api';

const RemoveTopic = () => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadRemovedTopics();
    }, []);

    const loadRemovedTopics = async () => {
        try {
            setLoading(true);
            const data = await fetchRemovedTopics();
            setTopics(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = topics.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
        (t.Category?.name && t.Category.name.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="p-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                            <Trash2 size={24} />
                        </div>
                        Removed Topics
                    </h2>
                    <p className="text-slate-500 mt-1">Archive of topics that have been removed from the system</p>
                </div>

                <button
                    onClick={loadRemovedTopics}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition p-2"
                    title="Refresh List"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search removed topics..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-600 text-[14px] font-bold tracking-wider">
                                <th className="px-6 py-4">Topic Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-12 text-slate-400">Loading...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-12 text-slate-400">No removed topics found</td></tr>
                            ) : filtered.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{item.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-indigo-600 font-medium">
                                            <Layers size={14} />
                                            {item.Category?.name || 'Unknown'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm max-w-xs truncate">
                                        {item.description || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-rose-100 text-rose-600">
                                            {item.status_code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-400 text-xs">
                                        {new Date(item.updated_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RemoveTopic;
