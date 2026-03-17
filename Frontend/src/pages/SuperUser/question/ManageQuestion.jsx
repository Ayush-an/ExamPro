import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { fetchExams, fetchQuestionsByExam, deleteQuestion } from "../../../utils/api";
import {
  FileText,
  Search,
  Download,
  Trash2,
  Edit3,
  ChevronRight,
  Filter,
  Layers,
  Activity,
  CheckCircle2,
  X,
  Shield,
  MoreVertical,
  HelpCircle,
  Hash,
  RefreshCw,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

const ManageQuestion = () => {
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadExams = async () => {
    try {
      const res = await fetchExams();
      setExams(Array.isArray(res) ? res : []);
    } catch {
      toast.error("Protocol registry load failed");
    }
  };

  const loadQuestions = async (id) => {
    if (!id) {
      setQuestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetchQuestionsByExam(id);
      setQuestions(res.data || []);
    } catch {
      toast.error("Telemetry fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadExams(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Confirm deletion protocol?")) return;
    try {
      await deleteQuestion(id);
      toast.success("Intelligence node removed");
      loadQuestions(examId);
    } catch {
      toast.error("Removal protocol failure");
    }
  };

  const downloadExcel = () => {
    if (!filteredQuestions.length) return toast.error("Empty data matrix");

    const data = filteredQuestions.map((q, i) => ({
      Sr: i + 1,
      Exam: exams.find((e) => e.id === q.examId)?.title,
      Question: q.question_text,
      Option1: q.option_1,
      Option2: q.option_2,
      Option3: q.option_3,
      Option4: q.option_4,
      Correct: `Option ${q.correct_option}`,
      Difficulty: q.difficulty,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Question Bank");
    XLSX.writeFile(wb, `QuestionRegistry_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Intelligence audit exported");
  };

  const filteredQuestions = questions.filter((q) =>
    q.question_text?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-50">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Intelligence Node Repository</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Management of assessment intelligence units</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 min-w-[240px] shadow-inner">
            <Filter size={16} className="text-slate-400" />
            <select
              className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest w-full cursor-pointer"
              value={examId}
              onChange={(e) => { setExamId(e.target.value); loadQuestions(e.target.value); }}
            >
              <option value="">Target Protocol</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:border-indigo-100 transition-all min-w-[280px] shadow-inner">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search intelligence matrix..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest placeholder:text-slate-300 w-full"
            />
          </div>

          <button
            onClick={downloadExcel}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
          >
            <Download size={14} /> Export Bank
          </button>
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-sm relative">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sr.</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intelligence Unit</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Protocol Reference</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Classification</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Intelligence Stream...</p>
                  </div>
                </td>
              </tr>
            ) : filteredQuestions.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-20 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <HelpCircle size={48} className="text-slate-400" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Matrix Empty: Select Protocol</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredQuestions.map((q, i) => (
                <tr key={q.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-slate-200">{i + 1}</span>
                  </td>
                  <td className="px-8 py-6 max-w-md">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 min-w-[40px] rounded-xl bg-slate-900 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-slate-200">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-900 tracking-tight line-clamp-2 leading-relaxed mb-2">{q.question_text}</p>
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[8px] font-black uppercase tracking-widest border border-emerald-100">KEY: OP{q.correct_option}</span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded-md text-[8px] font-black uppercase tracking-widest border border-slate-100">BATCH: {q.uploadBatchCode || "INST"}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="inline-flex px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                      {exams.find((e) => e.id === q.examId)?.title || "ORPHANED"}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${q.difficulty === "EASY"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : q.difficulty === "MEDIUM"
                          ? "bg-amber-50 text-amber-600 border-amber-100"
                          : "bg-rose-50 text-rose-600 border-rose-100"
                      }`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      <button
                        onClick={() => navigate(`/questions/edit/${q.id}`)}
                        className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition shadow-sm"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-rose-500 hover:border-rose-100 transition shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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

export default ManageQuestion;