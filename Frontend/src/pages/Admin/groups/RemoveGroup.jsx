// src/components/groups/RemoveGroup.jsx
import React, { useState, useEffect } from 'react';
import { fetchRemovedGroups } from '../../../utils/api';
import { Archive, RotateCcw } from 'lucide-react';

export default function RemoveGroup() {
  const [removedGroups, setRemovedGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRemovedGroups = async () => {
      try {
        const data = await fetchRemovedGroups();
        setRemovedGroups(data);
      } catch (err) {
        console.error("Failed to fetch removed groups:", err);
      } finally {
        setLoading(false);
      }
    };
    loadRemovedGroups();
  }, []);

  if (loading) return <div className="p-10 text-center text-slate-500 font-medium">Loading removed groups...</div>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Removed Groups</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">View history of groups that have been archived or removed.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Group Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Removed On</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {removedGroups.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Archive className="w-12 h-12 text-slate-200 mb-4" />
                      <p className="font-medium text-slate-400">No removed groups found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                removedGroups.map((g) => (
                  <tr key={g.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition duration-150">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{g.name}</div>
                      <div className="text-xs text-slate-400 mt-1">Status: Archived</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-[200px] truncate" title={g.description}>
                      {g.description || "No description provided"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {g.updatedAt ? new Date(g.updatedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 bg-slate-50 border border-slate-200 rounded-xl transition-all flex items-center justify-center ml-auto gap-2">
                        <RotateCcw className="w-3.5 h-3.5" /> Restore
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}