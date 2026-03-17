import React, { useState, useEffect } from 'react';
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
  Activity,
  LogOut,
  LogIn,
  MoreVertical,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";

const ActiveParticipant = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [adminFilter, setAdminFilter] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Placeholder data - In a real app, this would be fetched from the API
  const [activityData, setActivityData] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      mobile: '+91 9876543210',
      loginTime: '2024-03-20 10:30 AM',
      logoutTime: '2024-03-20 12:45 PM',
      spentTime: '2h 15m',
      admin: 'Mohd Sameer',
      group: 'Engineering'
    },
    {
      id: 2,
      name: 'Sarah Smith',
      email: 'sarah@example.com',
      mobile: '+91 9876543211',
      loginTime: '2024-03-20 11:00 AM',
      logoutTime: 'Still Active',
      spentTime: 'Ongoing',
      admin: 'Admin 2',
      group: 'Marketing'
    }
  ]);

  const handleApplyFilter = () => {
    toast.success("Telemetry filters applied");
    setCurrentPage(0);
  };

  const handleExportToExcel = () => {
    try {
      const wsData = activityData.map((a, i) => ({
        Sr: i + 1,
        Name: a.name,
        Email: a.email,
        Mobile: a.mobile,
        "Login Time": a.loginTime,
        "Logout Time": a.logoutTime,
        "Time Spent": a.spentTime,
        Admin: a.admin,
        Group: a.group
      }));

      const worksheet = XLSX.utils.json_to_sheet(wsData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Activity Log");
      XLSX.writeFile(workbook, `ParticipantActivity_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Activity telemetry exported");
    } catch (err) {
      toast.error("Export protocol failed");
    }
  };

  const filteredData = activityData.filter(a =>
    (a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.mobile.includes(searchQuery)) &&
    (adminFilter === '' || a.admin === adminFilter)
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentActivity = filteredData.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-50">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Entity Telemetry</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time session monitoring</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportToExcel}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
          >
            <Download size={14} /> Export Telemetry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <input
            type="text"
            placeholder="Search identity matrix..."
            className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none focus:bg-white focus:border-indigo-100 transition-all shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="relative group">
          <select
            className="w-full appearance-none pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none focus:bg-white focus:border-indigo-100 transition-all cursor-pointer shadow-inner"
            value={adminFilter}
            onChange={(e) => setAdminFilter(e.target.value)}
          >
            <option value="">All Administrators</option>
            <option value="Mohd Sameer">Mohd Sameer</option>
            <option value="Admin 2">Admin 2</option>
          </select>
          <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-40" />
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Select date range"
            className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none focus:bg-white focus:border-indigo-100 transition-all shadow-inner"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          />
          <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-orange-50/50 border-b border-orange-100">
              <th className="px-8 py-6 text-[10px] font-black text-orange-600 uppercase tracking-widest">Sr.</th>
              <th className="px-8 py-6 text-[10px] font-black text-orange-600 uppercase tracking-widest">Entity Unit</th>
              <th className="px-8 py-6 text-[10px] font-black text-orange-600 uppercase tracking-widest">Operational Hub</th>
              <th className="px-8 py-6 text-[10px] font-black text-orange-600 uppercase tracking-widest">Ingress (Login)</th>
              <th className="px-8 py-6 text-[10px] font-black text-orange-600 uppercase tracking-widest">Egress (Logout)</th>
              <th className="px-8 py-6 text-[10px] font-black text-orange-600 uppercase tracking-widest text-center">Persistence</th>
              <th className="px-8 py-6 text-[10px] font-black text-orange-600 uppercase tracking-widest text-right">Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {currentActivity.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <Activity size={48} className="text-slate-400" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Telemetry Grid Dark</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentActivity.map((a, i) => (
                <tr key={a.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-slate-300">{(currentPage * rowsPerPage) + i + 1}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-xs">
                        {a.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-900 tracking-tight group-hover:text-orange-600 transition">{a.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <Layers size={14} className="text-slate-200" />
                      <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{a.group}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-[10px] font-bold text-slate-500 flex items-center gap-2">
                    <LogIn size={14} className="text-emerald-500" /> {a.loginTime}
                  </td>
                  <td className="px-8 py-6 text-[10px] font-bold text-slate-500">
                    <div className="flex items-center gap-2">
                      {a.logoutTime === 'Still Active' ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-emerald-600 uppercase tracking-widest text-[8px]">Session Live</span>
                        </>
                      ) : (
                        <>
                          <LogOut size={14} className="text-slate-300" /> {a.logoutTime}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-mono font-bold text-slate-600 border border-slate-200">
                      {a.spentTime}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{a.admin}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-6">
        <div className="flex items-center gap-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rows per fragment:</p>
          <select
            className="bg-white border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-bold outline-none shadow-sm cursor-pointer"
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(0); }}
          >
            {[10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {currentPage + 1} <span className="mx-2 opacity-30">/</span> {totalPages || 1}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1 || totalPages === 0}
              className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveParticipant;