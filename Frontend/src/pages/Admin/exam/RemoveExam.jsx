// src/components/exam/RemoveExam.jsx
import React, { useEffect, useState } from "react";
import { fetchRemovedExams, restoreExam } from "../../../utils/api";
import { toast } from "react-hot-toast";
import { Search, Download, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const RemovedExam = () => {
  const [exams, setExams] = useState([]);
  const [tableSearch, setTableSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    loadRemovedExams();
  }, []);

  const loadRemovedExams = async () => {
    try {
      const res = await fetchRemovedExams();
      const data = Array.isArray(res) ? res : res.data || [];
      setExams(data);
    } catch (error) {
      console.error("Error fetching removed exams:", error);
    }
  };

  const handleResolve = async (id) => {
    try {
      if (!window.confirm("Restore this exam?")) return;
      await restoreExam(id);
      toast.success("Exam restored successfully!");
      loadRemovedExams();
    } catch (err) {
      toast.error("Failed to restore exam.");
    }
  };

  // Table Search
  const displayedData = exams.filter((exam) =>
    (exam.title || "").toLowerCase().includes(tableSearch.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(displayedData.length / rowsPerPage);
  const currentExams = displayedData.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  const exportExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(displayedData.map(e => ({
        Title: e.title,
        "Exam Code": e.exam_code,
        Status: e.status_code || e.status,
        Description: e.description,
        "Duration (min)": e.duration_minutes || e.duration,
        "Created At": formatDate(e.created_at),
        "Removed At": formatDate(e.removed_at),
        Groups: e.Groups?.map(g => g.name).join(", ") || "-"
      })));
      XLSX.utils.book_append_sheet(wb, ws, "Removed Exams");
      XLSX.writeFile(wb, "Removed_Exams.xlsx");
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleString() : "-";

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Removed Exams</h2>
          <p className="text-sm text-slate-500 mt-1">View all archived and removed examinations.</p>
        </div>
      </div>

      {/* Search + Export */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800 placeholder-slate-400 text-sm"
            value={tableSearch}
            onChange={(e) => { setTableSearch(e.target.value); setCurrentPage(0); }}
          />
        </div>
        <button
          onClick={exportExcel}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl font-bold text-sm transition-colors"
        >
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {currentExams.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarDays className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No removed exams found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Sr.", "Title", "Categories", "Code", "Status", "Duration", "Groups", "Removed", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-4 text-[10px] font-bold text-slate-400 tracking-widest text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentExams.map((exam, idx) => (
                  <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-bold text-slate-400">{currentPage * rowsPerPage + idx + 1}</td>
                    <td className="px-5 py-4 text-[13px] font-bold text-slate-800">{exam.title}</td>
                    <td className="px-5 py-4 text-[10px] font-medium text-slate-500 max-w-[120px] truncate">{exam.Categories?.map(c => c.name).join(", ") || "-"}</td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-500">{exam.exam_code || "-"}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-rose-50 text-rose-500">
                        {exam.status_code || exam.status || "REMOVED"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-600">{exam.duration_minutes || exam.duration || 0}m</td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-500">{exam.Groups?.map(g => g.name).join(", ") || "-"}</td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-500">{formatDate(exam.removed_at)}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleResolve(exam.id)}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {displayedData.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <select
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 outline-none"
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(0); }}
            >
              {[10, 20, 50].map((n) => (
                <option value={n} key={n}>{n} per page</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <span className="text-sm font-bold text-slate-600 px-2">
                {totalPages === 0 ? 1 : currentPage + 1} / {totalPages === 0 ? 1 : totalPages}
              </span>
              <button
                disabled={currentPage === totalPages - 1 || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemovedExam;