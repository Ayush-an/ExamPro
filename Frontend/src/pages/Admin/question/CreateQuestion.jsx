// src/components/question/CreateQuestion.jsx
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { fetchExams, createQuestion, uploadQuestionExcel, } from "../../../utils/api";
import * as XLSX from "xlsx";
import { X, FileQuestion, UploadCloud, FileSpreadsheet, CheckCircle2 } from "lucide-react";

export default function CreateQuestion({ onClose, onCreated }) {
  const fileRef = useRef();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploadStats, setUploadStats] = useState(null);

  const [formData, setFormData] = useState({
    examId: "",
    questionText: "",
    options: ["", "", "", ""],
    correctOption: "",
    difficulty: "",
    marks: 1,
  });

  /* ---------------- FETCH EXAMS ---------------- */
  useEffect(() => {
    fetchExams()
      .then(setExams)
      .catch(() => toast.error("Failed to load exams"));
  }, []);

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

  /* ---------------- DOWNLOAD TEMPLATE ---------------- */
  const downloadTemplate = () => {
    if (!formData.examId)
      return toast.error("Please select exam first");

    const data = [
      [
        "questionText",
        "option1",
        "option2",
        "option3",
        "option4",
        "correctOption",
        "difficulty",
        "marks",
      ],
      [
        "What is React?",
        "Library",
        "Framework",
        "Language",
        "Browser",
        "1",
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
    if (!formData.examId)
      return toast.error("Please select exam first");
    if (!excelFile) return toast.error("Select Excel file");

    setLoading(true);
    setUploadStats(null);

    try {
      await uploadQuestionExcel(formData.examId, excelFile);

      setUploadStats({ success: true });
      toast.success("Questions uploaded successfully");
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
    if (!formData.examId) err.examId = true;
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
      await createQuestion(formData);
      toast.success("Question added successfully");
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
      <div className="w-full max-w-4xl bg-slate-50 shadow-2xl rounded-[32px] relative max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-slate-100 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <FileQuestion className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Add Questions</h2>
              <p className="text-sm font-medium text-slate-500">Upload in bulk or create manually</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">

          {/* Setup / Exam Selection */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full -mr-10 -mt-10 pointer-events-none"></div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">1</span>
              Select Target Exam
            </h3>
            <select
              name="examId"
              value={formData.examId}
              onChange={handleChange}
              className={fieldClass("examId")}
            >
              <option value="">-- Choose Exam --</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Column 1: Bulk Upload */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">A</span>
                Bulk Upload
              </h3>
              <p className="text-sm text-slate-500 mb-6 flex-1">
                Download the template, fill in your questions, and upload the Excel file to import multiple questions at once.
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

            {/* Column 2: Manual Create */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs">B</span>
                Manual Entry
              </h3>

              <div className="space-y-5 flex-1">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Question Text</label>
                  <textarea
                    name="questionText"
                    value={formData.questionText}
                    onChange={handleChange}
                    placeholder="Type the question here..."
                    className={`${fieldClass("questionText")} h-24 resize-none`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Options</label>
                  <div className="grid grid-cols-2 gap-3">
                    {formData.options.map((o, i) => (
                      <input
                        key={i}
                        value={o}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        className={`${fieldClass("options")} py-2.5 text-sm`}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Correct Option</label>
                    <div className="grid grid-cols-4 gap-2">
                      {["1", "2", "3", "4"].map((o) => {
                        const isSelected = formData.correctOption === o;
                        return (
                          <label key={o} className={`flex items-center justify-center py-2 rounded-lg cursor-pointer border text-sm font-bold transition-all ${isSelected ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                            <input
                              type="radio"
                              name="correctOption"
                              value={o}
                              className="hidden"
                              checked={isSelected}
                              onChange={handleChange}
                            />
                            {o}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Marks</label>
                    <input
                      type="number"
                      min="1"
                      name="marks"
                      value={formData.marks}
                      onChange={handleChange}
                      className={`${fieldClass("marks")} py-2`}
                      placeholder="e.g. 1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Difficulty</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Easy", "Medium", "Hard"].map((d) => {
                      const isSelected = formData.difficulty === d;
                      const colors = d === 'Easy' ? 'emerald' : d === 'Medium' ? 'amber' : 'rose';
                      return (
                        <label key={d} className={`flex items-center justify-center py-2 rounded-lg cursor-pointer border text-sm font-bold transition-all ${isSelected ? `bg-${colors}-50 border-${colors}-500 text-${colors}-700` : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                          <input
                            type="radio"
                            name="difficulty"
                            value={d}
                            className="hidden"
                            checked={isSelected}
                            onChange={handleChange}
                          />
                          {d}
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.examId}
                  className="w-full flex items-center justify-center py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading && !excelFile ? "Saving..." : "Create Question"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
