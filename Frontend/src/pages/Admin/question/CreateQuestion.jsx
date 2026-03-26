import React, { useState, useEffect, useRef } from "react";
import {
  fetchExams, createQuestion, uploadQuestionExcel,
  fetchCategories, fetchTopics
} from "../../../utils/api";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import { X, FileQuestion, UploadCloud, FileSpreadsheet, CheckCircle2, Layers, Hash, Plus as PlusIcon, Trash } from "lucide-react";

export default function CreateQuestion({ onClose, onCreated }) {
  const fileRef = useRef();

  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploadStats, setUploadStats] = useState(null);

  const [formData, setFormData] = useState({
    examId: "", // Optional now
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
  }, []);

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
    `w-full px-4 py-3 border rounded-xl font-medium transition-all ${errors[field]
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
      [
        "Category",
        "Topic",
        "Question",
        "A",
        "B",
        "C",
        "D",
        "E",
        "Answer",
        "Difficulty",
        "Marks",
      ],
      [
        "Mathematics",
        "Algebra",
        "Solve for x: 2x = 10",
        "5",
        "2",
        "8",
        "10",
        "",
        "A",
        "Easy",
        "1",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    XLSX.writeFile(wb, "question_template.xlsx");
  };

  /* ---------------- EXCEL UPLOAD ---------------- */
  const handleExcelUpload = async () => {
    if (!excelFile) return toast.error("Select Excel file");

    setLoading(true);
    setUploadStats(null);

    try {
      await uploadQuestionExcel(excelFile); // No examId needed for global pool
      setUploadStats({ success: true });
      toast.success("Questions uploaded successfully to global pool");
      onCreated?.();
    } catch {
      toast.error("Excel upload failed");
    } finally {
      setLoading(false);
      fileRef.current.value = "";
      setExcelFile(null);
    }
  };

  /* ---------------- FORM VALIDATION ---------------- */
  const validateForm = () => {
    const err = {};
    if (!formData.categoryId) err.categoryId = true;
    if (!formData.topicId) err.topicId = true;
    if (!formData.questionText) err.questionText = true;
    if (formData.options.some((o) => !o.trim())) err.options = true;
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
      await createQuestion({
        ...formData,
        category_id: formData.categoryId,
        topic_id: formData.topicId,
        question_text: formData.questionText,
        difficulty_code: formData.difficulty.toUpperCase(),
        options: formData.options.map((text, i) => ({
          text,
          is_correct: parseInt(formData.correctOption) === i + 1
        }))
      });
      toast.success("Question created in global pool");
      onCreated?.();
      onClose?.();
    } catch {
      toast.error("Failed to add question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-5xl bg-slate-50 shadow-2xl rounded-[32px] relative max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-slate-100 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <PlusIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Add Questions</h2>
              <p className="text-sm font-medium text-slate-500">Create global questions or upload in bulk</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">

          {/* Setup / Category Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
              <h3 className="text-sm font-bold text-slate-900 tracking-widest mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                Category (Mandatory)
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

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
              <h3 className="text-sm font-bold text-slate-900 tracking-widest mb-4 flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-500" />
                Topic (Mandatory)
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

          <div className="grid grid-cols-1 lg:grid-cols-11 gap-8">
            {/* Left: Bulk Upload (40%) */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-fit">
              <h3 className="text-sm font-bold text-slate-900 tracking-widest mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">A</span>
                Bulk Upload
              </h3>
              <p className="text-sm text-slate-500 mb-6 font-medium">
                Download the template with <span className="font-bold text-slate-700">Category</span> & <span className="font-bold text-slate-700">Topic</span> columns.
              </p>

              <div className="space-y-4 w-full">
                <button
                  onClick={downloadTemplate}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-colors border border-slate-200"
                >
                  <FileSpreadsheet className="w-5 h-5 text-emerald-500" /> Download Template
                </button>

                <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 hover:border-indigo-300 transition-colors group cursor-pointer" onClick={() => fileRef.current?.click()}>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".xlsx"
                    onChange={(e) => setExcelFile(e.target.files[0])}
                    className="hidden"
                  />
                  <UploadCloud className={`w-10 h-10 mx-auto mb-3 ${excelFile ? 'text-indigo-500' : 'text-slate-300 group-hover:text-indigo-400'}`} />
                  <p className="text-sm font-bold text-slate-600 mb-1">
                    {excelFile ? excelFile.name : "Click or drag to upload Excel"}
                  </p>
                  <p className="text-xs text-slate-400">.xlsx files only</p>
                </div>

                <button
                  onClick={handleExcelUpload}
                  disabled={!excelFile || loading}
                  className="w-full flex items-center justify-center py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-indigo-200"
                >
                  {loading && excelFile ? "Uploading..." : "Import Questions"}
                </button>
              </div>
            </div>

            {/* Right: Manual Create (60%) */}
            <div className="lg:col-span-7 bg-white p-7 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-slate-900 tracking-widest mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs">B</span>
                Manual Entry
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500  tracking-widest mb-1.5">Question Text</label>
                  <textarea
                    name="questionText"
                    value={formData.questionText}
                    onChange={handleChange}
                    placeholder="Type the question here..."
                    className={`${fieldClass("questionText")} h-28 resize-none`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-500  tracking-widest">Options (2-5)</label>
                    {formData.options.length < 5 && (
                      <button
                        onClick={addOption}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-full transition"
                      >
                        <PlusIcon size={12} /> Add Option
                      </button>
                    )}
                  </div>
                  <div className="space-y-3 font-sans">
                    {formData.options.map((o, i) => (
                      <div key={i} className="flex items-center gap-3 group">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition ${formData.correctOption === String(i + 1) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                          }`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <input
                          value={o}
                          onChange={(e) => handleOptionChange(i, e.target.value)}
                          placeholder={`Option ${i + 1}`}
                          className={`${fieldClass("options")} py-2.5 flex-1`}
                        />
                        {formData.options.length > 2 && (
                          <button
                            onClick={() => removeOption(i)}
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 tracking-widest mb-2">Select Correct Answer</label>
                    <div className="flex flex-wrap gap-2">
                      {formData.options.map((_, i) => {
                        const oId = String(i + 1);
                        const isSelected = formData.correctOption === oId;
                        return (
                          <label key={oId} className={`w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer border font-bold transition-all ${isSelected ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md shadow-emerald-100' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                            <input
                              type="radio"
                              name="correctOption"
                              value={oId}
                              className="hidden"
                              checked={isSelected}
                              onChange={handleChange}
                            />
                            {String.fromCharCode(65 + i)}
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 tracking-widest mb-2">Marks</label>
                      <input
                        type="number"
                        min="1"
                        name="marks"
                        value={formData.marks}
                        onChange={handleChange}
                        className={`${fieldClass("marks")} py-2`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 tracking-widest mb-2">Difficulty</label>
                      <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleChange}
                        className={fieldClass("difficulty")}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 bg-white">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                >
                  {loading && !excelFile ? "Creating..." : "Create Question"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
