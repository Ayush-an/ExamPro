import React, { useEffect, useState } from "react";
import { fetchStagingParticipants } from "../../../utils/api";
import {
  Users,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Layers,
  Database,
  FileText,
  Mail,
  Phone,
  Shield,
  RefreshCw,
  X,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";

const StagingParticipant = () => {
  const [participants, setParticipants] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [groups, setGroups] = useState([]);

  const [statusFilter, setStatusFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [createdFilter, setCreatedFilter] = useState("");
  const [updatedFilter, setUpdatedFilter] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchStagingParticipants();
      const list = res?.data?.participants || [];
      const allGroups = res?.data?.groups || [];

      setParticipants(list);
      setFilteredData(list);
      setGroups(allGroups);
    } catch (e) {
      toast.error("Staging telemetry fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    let data = [...participants];

    if (statusFilter) data = data.filter((p) => p.status === statusFilter);
    if (groupFilter) data = data.filter((p) => p.groupId === Number(groupFilter));
    if (createdFilter)
      data = data.filter((p) => p.createdAt?.slice(0, 10) === createdFilter);
    if (updatedFilter)
      data = data.filter((p) => p.updatedAt?.slice(0, 10) === updatedFilter);
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase();
      data = data.filter((p) =>
        `${p.name} ${p.email} ${p.mobile}`.toLowerCase().includes(s)
      );
    }

    setFilteredData(data);
    setCurrentPage(0);
    toast.success("Telemetry matrix filtered");
  };

  const handleResetFilters = () => {
    setStatusFilter("");
    setGroupFilter("");
    setCreatedFilter("");
    setUpdatedFilter("");
    setSearchQuery("");
    setFilteredData(participants);
    setCurrentPage(0);
  };

  const handleExportToExcel = () => {
    try {
      const wsData = filteredData.map((p, i) => ({
        Sr: i + 1,
        Group: p.groupName,
        Name: p.name,
        Email: p.email,
        Mobile: p.mobile,
        Status: p.status,
        "Created At": p.createdAt ? new Date(p.createdAt).toLocaleString() : "-",
        "Updated At": p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "-"
      }));

      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Staging Data");
      XLSX.writeFile(wb, `StagingAudit_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Staging audit exported");
    } catch (err) {
      toast.error("Export protocol failed");
    }
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentParticipants = filteredData.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accessing Staging Area Telemetry...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-50">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Provisioning Staging Area</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Temporary storage for entity verification</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadData}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={handleExportToExcel}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
          >
            <Download size={14} /> Export Staging
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/50 p-6 rounded-[32px] border border-slate-50">
        <div className="relative group">
          <select
            className="w-full appearance-none pl-10 pr-10 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-indigo-100 transition-all cursor-pointer shadow-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Operational Status</option>
            <option value="Pending">Pending Verification</option>
            <option value="Approved">Approved Sync</option>
            <option value="Inactive">Inactive Node</option>
          </select>
          <Shield size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-40" />
        </div>

        <div className="relative group">
          <select
            className="w-full appearance-none pl-10 pr-10 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-indigo-100 transition-all cursor-pointer shadow-sm"
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
          >
            <option value="">Functional Unit</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <Layers size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-40" />
        </div>

        <div className="relative group">
          <input
            type="date"
            className="w-full pl-10 pr-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-indigo-100 transition-all shadow-sm"
            value={createdFilter}
            onChange={(e) => setCreatedFilter(e.target.value)}
          />
          <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="flex gap-2">
          <button onClick={handleApplyFilters} className="flex-1 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all">Apply</button>
          <button onClick={handleResetFilters} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X size={18} /></button>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search staging matrix (name, email, mobile)..."
          className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none focus:bg-white focus:border-indigo-100 transition-all shadow-inner"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>

      <div className="overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sr.</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Unit</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entity Signature</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temporal Log</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {currentParticipants.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <Database size={48} className="text-slate-400" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Staging Area Clear</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentParticipants.map((p, i) => (
                <tr key={p.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-slate-200">{(currentPage * rowsPerPage) + i + 1}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-bold text-slate-600 border border-slate-100/50">
                      {p.groupName}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-900 tracking-tight group-hover:text-indigo-600 transition">{p.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${p.status === "Approved"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}>
                      <span className={`w-1 h-1 rounded-full ${p.status === "Approved" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                        <Clock size={10} className="text-slate-300" /> Ingested: {new Date(p.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                        <FileText size={10} className="text-slate-300" /> Signal: {p.id.slice(0, 12)}
                      </div>
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

export default StagingParticipant;
