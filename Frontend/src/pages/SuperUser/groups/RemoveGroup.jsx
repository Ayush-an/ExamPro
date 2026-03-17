import React, { useState, useEffect } from 'react';
import { fetchRemovedGroups } from '../../../utils/api';
import {
  Trash2,
  Layers,
  ChevronRight,
  Calendar,
  Clock,
  UserCircle2,
  Search,
  History,
  Download,
  Database,
  Shield,
  X,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";

const RemoveGroup = () => {
  const [removedGroups, setRemovedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadRemovedGroups = async () => {
    setLoading(true);
    try {
      const data = await fetchRemovedGroups();
      setRemovedGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Archival registry synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRemovedGroups(); }, []);

  const downloadExcel = () => {
    if (!filteredGroups.length) return toast.error("Empty archival matrix");
    const data = filteredGroups.map((g, i) => ({
      Sr: i + 1,
      Name: g.name,
      Description: g.description,
      "Start Date": g.start,
      "End Date": g.end,
      "Created By": g.createdBy,
      "Deleted By": g.deletedBy,
      "Deleted At": g.deletedAt,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Archived Units");
    XLSX.writeFile(wb, `ArchivedPersonnelUnits_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Archival registry exported");
  };

  const filteredGroups = removedGroups.filter((g) =>
    g.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-50">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Decommissioned Unit Registry</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Archived functional units and organizational hierarchies</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:border-indigo-100 transition-all min-w-[280px] shadow-inner">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search historical archives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest placeholder:text-slate-300 w-full"
            />
          </div>

          <button
            onClick={downloadExcel}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
          >
            <Download size={14} /> Export Archive
          </button>
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-sm relative">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sr.</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Archived Unit</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timeline</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Archival Trace</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Historical Stream...</p>
                  </div>
                </td>
              </tr>
            ) : filteredGroups.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <History size={48} className="text-slate-400" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Archival Matrix Clear</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredGroups.map((g, i) => (
                <tr key={g.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-slate-200">{i + 1}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-slate-200 opacity-20">
                        {g.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-900 tracking-tight">{g.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1 max-w-[200px]">{g.description || "No operational briefing recorded"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5">
                      <span className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        <Calendar size={10} className="text-emerald-400" /> {g.start}
                      </span>
                      <span className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        <Clock size={10} className="text-rose-400" /> {g.end}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest leading-none">DELETED BY {g.deletedBy || "SYS"}</span>
                      <span className="text-[8px] font-bold text-rose-300 uppercase mt-1 flex items-center gap-1">
                        <Shield size={10} /> {g.deletedAt ? new Date(g.deletedAt).toLocaleString() : "Trace Missing"}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="inline-flex px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-rose-100 shadow-sm">
                      DECOMMISSIONED
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RemoveGroup;