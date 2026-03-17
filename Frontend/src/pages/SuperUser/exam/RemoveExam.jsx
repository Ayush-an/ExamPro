import React, { useEffect, useState } from "react";
import { fetchRemovedExams } from "../../../utils/api";
import {
  Archive,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Layers,
  Activity,
  FileText,
  Trash2,
  RefreshCw,
  X,
  Shield,
  UserCheck,
  CheckCircle2,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";

const RemovedExam = () => {
  const [exams, setExams] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  const loadRemovedExams = async () => {
    setLoading(true);
    try {
      const res = await fetchRemovedExams();
      const data = Array.isArray(res) ? res : res.data || [];
      setExams(data);
      setFiltered(data);
      toast.success("Historical protocol archive synchronized");
    } catch (error) {
      toast.error("Failed to access historical archive");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRemovedExams(); }, []);

  const handleApplyFilters = () => {
    let data = exams.filter((e) =>
      e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.exam_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFiltered(data);
    setCurrentPage(0);
  };

  useEffect(() => { handleApplyFilters(); }, [searchTerm, exams]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const currentExams = filtered.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  const exportExcel = () => {
    try {
      const wsData = filtered.map((e, idx) => ({
        Sr: idx + 1,
        Title: e.title,
        "Exam Code": e.exam_code,
        Status: e.status,
        Description: e.description,
        Duration: `${e.duration} Min`,
        "Created At": e.created_at ? new Date(e.created_at).toLocaleString() : "-",
        "Removed At": e.removed_at ? new Date(e.removed_at).toLocaleString() : "-",
        "Created By": e.created_by || "-",
        "Removed By": e.removed_by || "-",
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, "Archive");
      XLSX.writeFile(wb, `ProtocolArchive_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Protocol archive exported");
    } catch (err) {
      toast.error("Export failure");
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
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Protocol Historical Archive</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Audit trail for decommissioned assessment protocols</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadRemovedExams}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-200"
          >
            <Download size={14} className="text-indigo-400" /> Export Archive
          </button>
        </div>
      </div>

      <div className="relative group">
        <input
          type="text"
          placeholder="Filter archival matrix (title, code, description)..."
          className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none focus:bg-white focus:border-indigo-100 transition-all shadow-inner"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>

      <div className="overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sr.</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Identification</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Archival Sync</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Attribution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {currentExams.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <Archive size={48} className="text-slate-400" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Protocol Archive Silent</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentExams.map((exam, idx) => (
                <tr key={exam.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-slate-200">{(currentPage * rowsPerPage) + idx + 1}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-400 flex items-center justify-center font-black text-[10px] border border-red-100/50">
                        {exam.title.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-900 tracking-tight group-hover:text-red-500 transition">{exam.title}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest h-4 overflow-hidden">{exam.exam_code || "GEN-PROTO"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[8px] font-black uppercase tracking-widest border border-red-100">
                      <Trash2 size={10} /> Decommissioned
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                        <Plus size={10} className="text-emerald-400" /> Init: {exam.created_at ? new Date(exam.created_at).toLocaleDateString() : "-"}
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                        <Archive size={10} className="text-red-400" /> Arch: {exam.removed_at ? new Date(exam.removed_at).toLocaleDateString() : "-"}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{exam.removed_by || "System"}</span>
                      <span className="text-[8px] font-bold text-slate-300 uppercase">Institutional Auditor</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-6">
        <div className="flex items-center gap-3">
          <div className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200">
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

export default RemovedExam;