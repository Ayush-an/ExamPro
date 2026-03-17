import React, { useEffect, useState } from "react";
import { fetchRemovedParticipants } from "../../../utils/api";
import {
  Users,
  Search,
  Archive,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  UserCheck,
  Shield,
  Trash2,
  Filter,
  RefreshCw,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";

const RemoveParticipant = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRemovedParticipants = async () => {
    try {
      setLoading(true);
      const res = await fetchRemovedParticipants();

      if (!res.success) {
        toast.error("Removed telemetry fetch failed");
        return;
      }

      const mapped = res.data.map((p) => ({
        ...p,
        removedByName: p.removedByName || "-",
        groupName: p.groupName || "Unassigned",
        removedAt: p.removedAt || null,
      }));

      setParticipants(mapped);
      toast.success("Historical archive synchronized");
    } catch (err) {
      toast.error("Failed to load historical archive");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRemovedParticipants();
  }, []);

  const filtered = participants.filter((p) =>
    [p.name, p.email, p.mobile, p.groupName, p.removedByName]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const currentParticipants = filtered.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  const handleExportToExcel = () => {
    if (!participants.length) {
      toast.info("No data in archive for export");
      return;
    }

    try {
      const wsData = filtered.map((p, index) => ({
        Sr: index + 1,
        "Group Name": p.groupName,
        Name: p.name,
        Email: p.email,
        Mobile: p.mobile,
        Status: p.status,
        "Date of Join": p.dateOfJoin ? new Date(p.dateOfJoin).toLocaleString() : "-",
        "Created At": p.createdAt ? new Date(p.createdAt).toLocaleString() : "-",
        "Removed At": p.removedAt ? new Date(p.removedAt).toLocaleString() : "-",
        "Removed By": p.removedByName,
      }));

      const worksheet = XLSX.utils.json_to_sheet(wsData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Removed Entities");
      XLSX.writeFile(workbook, `HistoricalArchive_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Archive data exported to Excel");
    } catch (err) {
      toast.error("Export protocol failure");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accessing Historical Archive...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-50">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Decommissioned Entity Archive</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Audit trail for historical participants</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadRemovedParticipants}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={handleExportToExcel}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-200"
          >
            <Download size={14} className="text-indigo-400" /> Export Archive
          </button>
        </div>
      </div>

      <div className="relative group">
        <input
          type="text"
          placeholder="Filter historical matrix (name, email, mobile, group, admin)..."
          className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none focus:bg-white focus:border-indigo-100 transition-all shadow-inner"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 transition">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sr.</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Protocol Unit</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entity Identity</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Archival Logs</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Executor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {currentParticipants.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <Archive size={48} className="text-slate-400" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Archive Safe Empty</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentParticipants.map((p, index) => (
                <tr key={p.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-slate-200">{(currentPage * rowsPerPage) + index + 1}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-bold text-slate-600 border border-slate-100/50 uppercase tracking-widest">
                      {p.groupName}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-extrabold text-xs">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-900 tracking-tight">{p.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-500 text-[8px] font-black uppercase tracking-widest border border-red-100/50">
                      <Trash2 size={10} /> Decommissioned
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                        <LogIn size={10} className="text-emerald-400" /> Join: {new Date(p.dateOfJoin).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                        <LogOut size={10} className="text-red-400" /> Arch: {new Date(p.removedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{p.removedByName}</span>
                      <span className="text-[8px] font-bold text-slate-300 uppercase">Institutional Admin</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-6">
        <div className="flex items-center gap-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fragment Size:</p>
          <select
            className="bg-white border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-bold outline-none shadow-sm cursor-pointer"
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(0); }}
          >
            {[10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-6 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {currentPage + 1} <span className="mx-2 opacity-30">/</span> {totalPages || 1}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1 || totalPages === 0}
              className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveParticipant;