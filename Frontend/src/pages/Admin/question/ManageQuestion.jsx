// src/components/question/ManageQuestion.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { fetchExams, fetchQuestionsByExam, deleteQuestion, } from "../../../utils/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import { Search, Download, FileQuestion, Trash2, Pencil } from "lucide-react";


const ManageQuestion = () => {
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const downloadExcel = () => {
    if (!filteredQuestions.length) {
      toast.error("No questions to export");
      return;
    }

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

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Questions");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      `Questions_${Date.now()}.xlsx`
    );
  };


  /* ---------------- FETCH EXAMS (ORG BASED) ---------------- */
  useEffect(() => {
    fetchExams()
      .then((res) => {
        console.log("EXAMS 👉", res);
        setExams(res); // ✅ res IS the array
      })
      .catch(() => toast.error("Failed to load exams"));
  }, []);

  /* ---------------- FETCH QUESTIONS BY EXAM ---------------- */
  const loadQuestions = async (id) => {
    if (!id) {
      setQuestions([]);
      return;
    }
    try {
      setLoading(true);
      const res = await fetchQuestionsByExam(id);
      setQuestions(res.data || []);
    } catch {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SEARCH FILTER ---------------- */
  const filteredQuestions = questions.filter((q) =>
    searchQuery
      ? q.question_text
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
      : true
  );

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await deleteQuestion(id);
      toast.success("Question deleted");
      loadQuestions(examId);
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="w-full relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Questions</h2>
          <p className="text-sm text-slate-500 mt-1">Review, filter, and export the question bank.</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <select
            value={examId}
            onChange={(e) => {
              setExamId(e.target.value);
              loadQuestions(e.target.value);
            }}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
          >
            <option value="">Select Exam</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>

          <div className="flex-grow max-w-md relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search question keyword..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 shrink-0">
          <div className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold flex items-center justify-center min-w-[120px]">
            <span className="text-slate-400 text-xs uppercase tracking-widest mr-2">Total</span>
            <span className="text-indigo-600">{filteredQuestions.length}</span>
          </div>

          <button
            onClick={downloadExcel}
            className="px-6 py-2.5 font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 hover:text-emerald-700 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col max-h-[70vh]">
        <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap lg:whitespace-normal">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100 shadow-sm backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">#</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest min-w-[300px]">Question Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest min-w-[180px]">Options & Answer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Metadata</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-slate-500 font-medium animate-pulse">
                    Loading questions...
                  </td>
                </tr>
              ) : filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileQuestion className="w-12 h-12 text-slate-200 mb-4" />
                      <p>No questions found. Try selecting an exam or clear the search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((q, i) => (
                  <tr key={q.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition duration-150 align-top group">
                    <td className="px-6 py-6 text-sm font-bold text-slate-400 text-center">{i + 1}</td>

                    <td className="px-6 py-6 max-w-lg">
                      <div className="font-medium text-slate-800 leading-relaxed mb-3 pr-4 break-words whitespace-pre-wrap">{q.question_text}</div>
                    </td>

                    <td className="px-6 py-6 text-sm">
                      <div className="space-y-2 pr-4">
                        {[q.option_1, q.option_2, q.option_3, q.option_4].map((opt, idx) => (
                          <div key={idx} className={`pl-3 py-1.5 border-l-2 text-[13px] ${q.correct_option === (idx + 1).toString() ? 'border-emerald-400 font-bold text-emerald-700 bg-emerald-50/50 rounded-r' : 'border-slate-200 text-slate-500'}`}>
                            <span className="opacity-50 mr-2">{idx + 1}.</span> {opt}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex flex-col gap-2 items-start">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${q.difficulty === "EASY" ? "bg-emerald-50 text-emerald-600" :
                            q.difficulty === "MEDIUM" ? "bg-amber-50 text-amber-600" :
                              "bg-rose-50 text-rose-600"
                          }`}>
                          {q.difficulty}
                        </span>
                        <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md max-w-[140px] truncate" title={exams.find((e) => e.id === q.examId)?.title}>
                          {exams.find((e) => e.id === q.examId)?.title}
                        </div>
                        {q.uploadBatchCode && (
                          <div className="text-xs font-mono text-slate-400 mt-1">
                            <span className="font-medium">Batch:</span> {q.uploadBatchCode}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-6 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate(`/questions/edit/${q.id}`)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(q.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete">
                          <Trash2 className="w-4 h-4" />
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