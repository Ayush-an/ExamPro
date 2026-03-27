import React, { useState, useEffect } from "react";
import {
  fetchExams, fetchQuestionsByExam, deleteQuestion,
  fetchCategories, fetchTopics, fetchAvailableQuestions
} from "../../../utils/api";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import { Search, Download, FileQuestion, Trash2, Pencil, Filter, Layers, Hash } from "lucide-react";

const ManageQuestion = ({ onEdit }) => {
  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);

  const [examId, setExamId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [topicId, setTopicId] = useState("");

  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams().then(setExams).catch(() => toast.error("Failed to load exams"));
    fetchCategories().then(setCategories).catch(() => toast.error("Failed to load categories"));
    loadQuestions(); // Load all questions initially (Global Pool)
  }, []);

  useEffect(() => {
    if (categoryId) {
      fetchTopics(categoryId).then(setTopics).catch(e => console.error(e));
    } else {
      setTopics([]);
    }
  }, [categoryId]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      let res;
      if (examId) {
        res = await fetchQuestionsByExam(examId);
      } else {
        res = await fetchAvailableQuestions({ category_id: categoryId, topic_id: topicId });
      }
      setQuestions(res.data || res || []);
    } catch {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [examId, categoryId, topicId]);

  const downloadExcel = () => {
    if (!filteredQuestions.length) {
      toast.error("No questions to export");
      return;
    }

    const data = filteredQuestions.map((q, i) => ({
      Sr: i + 1,
      Category: q.Category?.name || 'N/A',
      Topic: q.Topic?.name || 'N/A',
      Question: q.question_text,
      Option1: (q.QuestionOptions || q.options)?.[0]?.option_text || (q.QuestionOptions || q.options)?.[0]?.text || '',
      Option2: (q.QuestionOptions || q.options)?.[1]?.option_text || (q.QuestionOptions || q.options)?.[1]?.text || '',
      Option3: (q.QuestionOptions || q.options)?.[2]?.option_text || (q.QuestionOptions || q.options)?.[2]?.text || '',
      Option4: (q.QuestionOptions || q.options)?.[3]?.option_text || (q.QuestionOptions || q.options)?.[3]?.text || '',
      Option5: (q.QuestionOptions || q.options)?.[4]?.option_text || (q.QuestionOptions || q.options)?.[4]?.text || '',
      Correct: (q.QuestionOptions || q.options)?.find(o => o.is_correct)?.option_text || (q.QuestionOptions || q.options)?.find(o => o.is_correct)?.text || 'N/A',
      Difficulty: q.difficulty_code,
      Marks: q.QuestionExams?.[0]?.marks || 'N/A' // Reference marks if in context of exam
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Questions");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), `Questions_${Date.now()}.xlsx`);
  };

  const filteredQuestions = questions.filter((q) =>
    searchQuery ? q.question_text?.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question from global bank?")) return;
    try {
      await deleteQuestion(id);
      toast.success("Question deleted");
      loadQuestions();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="w-full relative animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FileQuestion size={24} /></div>
            Manage Questions
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Browse the global question pool or filter by specific exam collections.</p>
        </div>
      </div>

      {/* FILTERS PANEL */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">

          <div className="space-y-1.5">
            <label className="text-[14px] font-bold text-slate-400 tracking-widest ml-1">View Mode / Exam</label>
            <select
              value={examId}
              onChange={(e) => {
                setExamId(e.target.value);
                if (e.target.value) { setCategoryId(""); setTopicId(""); }
              }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            >
              <option value="">Global Question Pool</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[14px] font-bold text-slate-400 tracking-widest ml-1">Category</label>
            <select
              disabled={examId !== ""}
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 transition-all outline-none disabled:opacity-50"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[14px] font-bold text-slate-400 tracking-widest ml-1">Topic</label>
            <select
              disabled={examId !== "" || !categoryId}
              value={topicId}
              onChange={e => setTopicId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 transition-all outline-none disabled:opacity-50"
            >
              <option value="">All Topics</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Keyword search..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={downloadExcel}
              className="p-2.5 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-all sm:px-4 flex items-center gap-2 font-bold"
            >
              <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[14px] font-bold text-slate-600 tracking-[0.2em] text-center w-12">#</th>
                <th className="px-6 py-4 text-[14px] font-bold text-slate-600 tracking-[0.2em]">Question</th>
                <th className="px-6 py-4 text-[14px] font-bold text-slate-600 tracking-[0.2em]">Options</th>
                <th className="px-6 py-4 text-[14px] font-bold text-slate-600 tracking-[0.2em]">Hierarchy & Difficulty</th>
                <th className="px-6 py-4 text-[14px] font-bold text-slate-600 tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-24 text-center text-slate-400 font-bold animate-pulse">Loading Dataset...</td></tr>
              ) : filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-24 text-center text-slate-400 font-bold">
                    <div className="flex flex-col items-center gap-3">
                      <Search size={48} className="text-slate-200" />
                      <p>No questions matched your criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((q, i) => (
                  <tr key={q.id} className="hover:bg-slate-50/50 transition-colors group group/item">
                    <td className="px-6 py-6 text-xs font-bold text-slate-300 text-center">{i + 1}</td>

                    <td className="px-6 py-6 vertical-top min-w-[300px]">
                      <div className="text-sm font-bold text-slate-800 leading-relaxed mb-1 pr-4 whitespace-pre-wrap">{q.question_text}</div>
                      {q.marks && <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{q.marks} Marks</span>}
                    </td>

                    <td className="px-6 py-6 vertical-top min-w-[200px]">
                      <div className="space-y-1.5">
                        {(q.QuestionOptions || q.options)?.map((opt, idx) => (
                          <div key={idx} className={`text-[11px] px-2 py-1 rounded flex items-center gap-2 ${opt.is_correct ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-500'}`}>
                            <span className="opacity-40">{String.fromCharCode(65 + idx)}</span>
                            {opt.option_text || opt.text}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-6 vertical-top">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold italic">
                            <Layers size={10} /> {q.Category?.name || 'Uncategorized'}
                          </span>
                          <span className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold italic">
                            <Hash size={10} /> {q.Topic?.name || 'Global'}
                          </span>
                        </div>
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${q.difficulty_code === "EASY" ? "bg-emerald-100 text-emerald-700" :
                          q.difficulty_code === "HARD" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                          }`}>
                          {q.difficulty_code}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-6 text-right vertical-top">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit ? onEdit(q.id) : navigate(`/admin/questions/edit/${q.id}`)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(q.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition">
                          <Trash2 size={14} />
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
    </div>
  );
};

export default ManageQuestion;