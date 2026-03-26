import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { authFetch, fetchExams } from "../../../utils/api";
import {
  Database,
  Search,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Layers,
  Activity,
  CheckCircle2,
  X,
  Shield,
  UserCheck,
  RefreshCw,
  FileText,
  HelpCircle,
  Hash,
  Filter,
  BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const StagingQuestion = () => {
  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [loading, setLoading] = useState(true);

  const loadInitial = async () => {
    setLoading(true);
    try {
      const [qRes, eRes] = await Promise.all([
        authFetch("/api/question"),
        fetchExams(),
      ]);
      setQuestions(Array.isArray(qRes.data) ? qRes.data : qRes);
      setExams(Array.isArray(eRes.data) ? eRes.data : eRes);
    } catch (err) {
      toast.error("Failed to load staging data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInitial(); }, []);

  const examSummary = useMemo(() => {
    const map = {};
    questions.forEach((q) => {
      if (!map[q.examId]) {
        map[q.examId] = {
          examId: q.examId,
          examTitle: q.exam?.title || "-",
          createdBy: q.createdByName || "-",
          createdAt: q.exam?.created_at || null,
          updatedAt: q.updated_at,
          groups: new Set(),
          totalQuestions: 0,
          questionIds: [],
        };
        if (q.exam?.Groups?.length) {
          q.exam.Groups.forEach((g) => map[q.examId].groups.add(g.name));
        }
      }
      map[q.examId].totalQuestions += 1;
      map[q.examId].questionIds.push(q.id);
    });
    return Object.values(map).filter(
      (e) => !selectedExam || e.examId === Number(selectedExam)
    );
  }, [questions, selectedExam]);

  const downloadExcel = () => {
    if (!examSummary.length) return toast.error("No data to export");
    const data = examSummary.map((e, i) => ({
      Sr: i + 1,
      Exam: e.examTitle,
      Groups: Array.from(e.groups).join(", "),
      "Total Questions": e.totalQuestions,
      "Created By": e.createdBy,
      "Created At": e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "-",
      "Updated At": e.updatedAt ? new Date(e.updatedAt).toLocaleDateString() : "-",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staging Audit");
    XLSX.writeFile(wb, `QuestionStaging_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Question staging exported");
  };

  const deleteAllQuestions = async (questionIds) => {
    if (!window.confirm("Delete all questions for this exam?")) return;
    try {
      await authFetch("/api/question/delete-multiple", {
        method: "POST",
        body: JSON.stringify({ questionIds }),
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Questions deleted");
      loadInitial();
    } catch (err) {
      toast.error("Failed to delete questions");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-bold text-slate-400">Loading staging area...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-50">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Question Staging</h2>
          <p className="text-[10px] text-slate-400 font-bold mt-1">Review and verify questions before finalizing.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 min-w-[240px] shadow-inner">
            <Filter size={16} className="text-slate-400" />
            <select
              className="bg-transparent border-none outline-none text-[10px] font-bold w-full cursor-pointer"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
            >
              <option value="">All Exams</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
          </div>

          <button
            onClick={downloadExcel}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[32px] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-indigo-400">Exams Staged</p>
            <h3 className="text-3xl font-black text-slate-900">{examSummary.length}</h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
            <Layers size={24} />
          </div>
        </div>
        <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-[32px] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-emerald-400">Total Questions</p>
            <h3 className="text-3xl font-black text-slate-900">{questions.length}</h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50">
            <HelpCircle size={24} />
          </div>
        </div>
        <div className="p-8 bg-amber-50 border border-amber-100 rounded-[32px] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-amber-400">Avg Questions/Exam</p>
            <h3 className="text-3xl font-black text-slate-900">{(questions.length / (examSummary.length || 1)).toFixed(1)}</h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100/50">
            <BarChart3 size={24} />
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-sm relative">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 tracking-wide">No.</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 tracking-wide">Exam</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 tracking-wide text-center">Questions</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 tracking-wide">Added By</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 tracking-wide text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {examSummary.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <Database size={48} className="text-slate-400" />
                    <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em]">No questions in staging</p>
                  </div>
                </td>
              </tr>
            ) : (
              examSummary.map((e, i) => (
                <tr key={e.examId} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-slate-200">{i + 1}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-slate-200">
                        {e.examTitle.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-900 tracking-tight group-hover:text-indigo-600 transition">{e.examTitle}</p>
                        <p className="text-[9px] font-bold text-slate-400 tracking-widest">{Array.from(e.groups).join(", ") || "Universal Access"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="inline-flex px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black tracking-widest border border-indigo-100">
                      {e.totalQuestions} Questions
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-900 tracking-widest">{e.createdBy}</span>
                      <span className="text-[8px] font-bold text-slate-300 flex items-center gap-1">
                        <Clock size={10} /> {e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() => deleteAllQuestions(e.questionIds)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-[9px] font-black tracking-widest hover:bg-rose-500 hover:text-white transition shadow-sm border border-rose-100"
                    >
                      <Trash2 size={12} /> Delete Questions
                    </button>
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

export default StagingQuestion;
