import React, { useState, useEffect, useRef } from "react";
import {
  fetchExams, createQuestion, uploadQuestionExcel,
  fetchCategories, fetchTopics, fetchQuestionById, updateQuestion
} from "../../../utils/api";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import { X, FileQuestion, UploadCloud, FileSpreadsheet, CheckCircle2, Layers, Hash, Plus as PlusIcon, Trash, Pencil } from "lucide-react";

export default function CreateQuestion({ onClose, onCreated, questionId }) {
  const fileRef = useRef();
  const isEdit = !!questionId;

  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploadStats, setUploadStats] = useState(null);

  const [formData, setFormData] = useState({
    examId: "",
    categoryId: "",
    topicId: "",
    questionText: "",
    options: ["", "", "", ""],
    correctOption: "",
    difficulty: "Medium",
    marks: 1,
  });

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    fetchExams().then(setExams).catch(() => toast.error("Failed to load exams"));
    fetchCategories().then(setCategories).catch(() => toast.error("Failed to load categories"));

    if (isEdit) {
      setLoading(true);
      fetchQuestionById(questionId)
        .then(q => {
          const opts = q.QuestionOptions || q.options || [];
          setFormData({
            categoryId: String(q.category_id || ""),
            topicId: String(q.topic_id || ""),
            questionText: q.question_text || "",
            options: opts.map(o => o.option_text || o.text) || ["", "", "", ""],
            correctOption: String((opts.findIndex(o => o.is_correct) ?? -1) + 1),
            difficulty: q.difficulty_code ? q.difficulty_code.charAt(0) + q.difficulty_code.slice(1).toLowerCase() : "Medium",
            marks: q.marks || 1,
          });
        })
        .catch(() => toast.error("Failed to load question details"))
        .finally(() => setLoading(false));
    }
  }, [questionId, isEdit]);

  useEffect(() => {
    if (formData.categoryId) {
      fetchTopics(formData.categoryId)
        .then(setTopics)
        .catch(() => toast.error("Failed to load topics"));
    } else {
      setTopics([]);
    }
  }, [formData.categoryId]);

  /* ---------------- HELPERS ---------------- */
  const fieldClass = (field) =>
    `w-full px-4 py-2.5 border rounded-xl font-medium transition-all ${errors[field]
      ? "border-rose-300 bg-rose-50 text-rose-900 focus:ring-rose-500"
      : "border-slate-200 bg-slate-50 text-slate-800 focus:ring-indigo-500 focus:outline-none focus:ring-2"
    }`;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: false });
  };

  const handleOptionChange = (i, val) => {
    const options = [...formData.options];
    options[i] = val;
    setFormData({ ...formData, options });
  };

  const addOption = () => {
    if (formData.options.length < 5) {
      setFormData({ ...formData, options: [...formData.options, ""] });
    }
  };

  const removeOption = (i) => {
    if (formData.options.length > 2) {
      const options = formData.options.filter((_, idx) => idx !== i);
      setFormData({ ...formData, options });
      if (parseInt(formData.correctOption) === i + 1) {
        setFormData(prev => ({ ...prev, correctOption: "" }));
      } else if (parseInt(formData.correctOption) > i + 1) {
        setFormData(prev => ({ ...prev, correctOption: String(parseInt(prev.correctOption) - 1) }));
      }
    }
  };

  /* ---------------- DOWNLOAD TEMPLATE ---------------- */
  const downloadTemplate = () => {
    const data = [
      ["Category", "Topic", "Question", "A", "B", "C", "D", "E", "Answer", "Difficulty", "Marks"],
      ["General", "GK", "What is 2+2?", "3", "4", "5", "6", "", "B", "Easy", "1"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    XLSX.writeFile(wb, "question_template.xlsx");
  };

  /* ---------------- BULK UPLOAD ---------------- */
  const handleBulkUpload = async () => {
    if (!excelFile) return toast.error("Select Excel file");
    setLoading(true);
    setUploadStats(null);
    try {
      await uploadQuestionExcel(excelFile);
      setUploadStats({ success: true });
      toast.success("Questions uploaded successfully to global pool");
      onCreated?.();
      setExcelFile(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Bulk upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    const err = {};
    if (!formData.categoryId) err.categoryId = true;
    if (!formData.topicId) err.topicId = true;
    if (!formData.questionText.trim()) err.questionText = true;
    if (!formData.correctOption) err.correctOption = true;
    if (!formData.difficulty) err.difficulty = true;
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* ---------------- FORM SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        category_id: formData.categoryId,
        topic_id: formData.topicId,
        question_text: formData.questionText,
        difficulty_code: formData.difficulty.toUpperCase(),
        marks: formData.marks || 1,
        options: formData.options.filter(text => text.trim() !== "").map((text, i) => ({
          text,
          is_correct: parseInt(formData.correctOption) === i + 1
        }))
      };

      if (isEdit) {
        await updateQuestion(questionId, payload);
        toast.success("Question updated successfully");
      } else {
        await createQuestion(payload);
        toast.success("Question created in global pool");
      }
      onCreated?.();
      onClose?.();
    } catch {
      toast.error(isEdit ? "Failed to update question" : "Failed to add question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white shadow-sm rounded-2xl relative flex flex-col overflow-hidden animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-slate-100 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            {isEdit ? <Pencil size={20} /> : <PlusIcon size={20} />}
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {isEdit ? "Edit Question" : "Add Questions"}
            </h2>
            <p className="text-[10px] font-bold text-slate-400">
              {isEdit ? "Update question details and options" : "Create global questions or upload in bulk"}
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-6 flex-1 space-y-6 overflow-y-auto custom-scrollbar">
        {/* Category & Topic Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <h3 className="text-[14px] font-bold text-slate-500 tracking-widest mb-3 flex items-center gap-2">
              <Layers className="w-3 h-3 text-indigo-500" /> Category (Mandatory)
            </h3>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className={fieldClass("categoryId")}
            >
              <option value="">-- Choose Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <h3 className="text-[14px] font-bold text-slate-500 tracking-widest mb-3 flex items-center gap-2">
              <Hash className="w-3 h-3 text-indigo-500" /> Topic (Mandatory)
            </h3>
            <select
              name="topicId"
              value={formData.topicId}
              onChange={handleChange}
              className={fieldClass("topicId")}
              disabled={!formData.categoryId}
            >
              <option value="">-- Choose Topic --</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Upload Section - Hidden in Edit Mode */}
        {!isEdit && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[14px] font-black">A</span>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Bulk Upload</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-500 font-medium">Download template with Category & Topic columns.</p>
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors border border-slate-200"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Template
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative border-2 border-dashed border-slate-100 rounded-xl p-4 text-center hover:bg-slate-50 hover:border-indigo-200 transition-colors group cursor-pointer" onClick={() => fileRef.current?.click()}>
                    <input ref={fileRef} type="file" accept=".xlsx" onChange={(e) => setExcelFile(e.target.files[0])} className="hidden" />
                    <UploadCloud size={20} className={`mx-auto mb-1 ${excelFile ? 'text-indigo-500' : 'text-slate-300'}`} />
                    <p className="text-[10px] font-bold text-slate-500 truncate">{excelFile ? excelFile.name : "Select Excel"}</p>
                  </div>
                  <button
                    onClick={handleBulkUpload}
                    disabled={!excelFile || loading}
                    className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 shadow-sm"
                  >
                    {loading && excelFile ? "Uploading..." : "Import"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manual Entry Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-black">{isEdit ? 'A' : 'B'}</span>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Manual Entry</h3>
            </div>
            {formData.options.length < 5 && (
              <button onClick={addOption} className="text-[14px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-full transition">
                <PlusIcon size={12} /> Option
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[14px] font-bold text-slate-400 tracking-widest mb-1.5">Question Text</label>
              <textarea
                name="questionText"
                value={formData.questionText}
                onChange={handleChange}
                placeholder="Type the question here..."
                className={`${fieldClass("questionText")} h-24 resize-none text-sm`}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {formData.options.map((o, i) => (
                <div key={i} className="flex items-center gap-2 group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition ${formData.correctOption === String(i + 1) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <input
                    value={o}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className={`${fieldClass("options")} py-2 text-xs flex-1`}
                  />
                  {formData.options.length > 2 && (
                    <button onClick={() => removeOption(i)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition">
                      <Trash size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div>
                <label className="block text-[14px] font-bold text-slate-400 tracking-widest mb-2">Correct Answer</label>
                <div className="flex flex-wrap gap-1.5">
                  {formData.options.map((_, i) => {
                    const oId = String(i + 1);
                    const isSelected = formData.correctOption === oId;
                    return (
                      <label key={oId} className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer border font-bold text-xs transition-all ${isSelected ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                        <input type="radio" name="correctOption" value={oId} className="hidden" checked={isSelected} onChange={handleChange} />
                        {String.fromCharCode(65 + i)}
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-bold text-slate-400 tracking-widest mb-2">Marks</label>
                <input type="number" min="1" name="marks" value={formData.marks} onChange={handleChange} className={`${fieldClass("marks")} py-2 text-xs h-9`} />
              </div>

              <div>
                <label className="block text-[14px] font-bold text-slate-400 tracking-widest mb-2">Difficulty</label>
                <select name="difficulty" value={formData.difficulty} onChange={handleChange} className={`${fieldClass("difficulty")} py-1.5 text-xs h-9`}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-slate-100 flex items-center justify-center gap-2"
            >
              {loading && !excelFile ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Question" : "Create Question")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
