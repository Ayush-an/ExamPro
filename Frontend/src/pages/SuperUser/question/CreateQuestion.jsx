import { fetchSuperUserExams, createQuestion, uploadQuestionExcel } from "../../../utils/api";
import {
  Plus,
  HelpCircle,
  FileText,
  Layers,
  Shield,
  X,
  CheckCircle2,
  Upload,
  Download,
  AlertCircle,
  Hash,
  Activity,
  Send,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";

export default function CreateQuestion({ onClose, onCreated }) {
  const fileRef = useRef();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    examId: "",
    questionText: "",
    options: ["", "", "", ""],
    correctOption: "",
    difficulty: "",
    marks: 1,
  });

  useEffect(() => {
    fetchSuperUserExams()
      .then(setExams)
      .catch(() => toast.error("Failed to load exams"));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: false });
  };

  const handleOptionChange = (i, val) => {
    const options = [...formData.options];
    options[i] = val;
    setFormData({ ...formData, options });
  };

  const downloadTemplate = () => {
    if (!formData.examId) return toast.error("Please select an exam first");
    const data = [
      ["questionText", "option1", "option2", "option3", "option4", "correctOption", "difficulty", "marks"],
      ["Sample question here?", "Opt A", "Opt B", "Opt C", "Opt D", "1", "Easy", "1"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "IntelTemplate");
    XLSX.writeFile(wb, "Intelligence_Template.xlsx");
  };

  const handleExcelUpload = async () => {
    if (!formData.examId) return toast.error("Please select an exam");
    if (!excelFile) return toast.error("Please select an Excel file");
    setLoading(true);
    try {
      await uploadQuestionExcel(excelFile);
      toast.success("Questions uploaded successfully");
      onCreated?.();
    } catch {
      toast.error("Failed to upload questions");
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
      setExcelFile(null);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return toast.error("Please fill all fields");
    setLoading(true);
    try {
      await createQuestion(formData);
      toast.success("Question created successfully");
      onCreated?.();
      onClose?.();
    } catch {
      toast.error("Failed to create question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl bg-white rounded-[44px] shadow-2xl border border-slate-100 overflow-hidden text-left"
      >
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add Question</h2>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Create a new question for the selected exam.</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition"><X size={20} /></button>
        </div>

        <div className="flex flex-col lg:flex-row h-[70vh]">
          {/* Left: Quick Bulk Actions */}
          <div className="w-full lg:w-72 bg-slate-50 p-8 space-y-8 border-r border-slate-100">
            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Database size={14} className="text-indigo-600" /> Bulk Upload
                </h3>
                <div className="space-y-3">
                  <button onClick={downloadTemplate} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 text-[9px] font-bold hover:border-indigo-100 hover:text-indigo-600 transition shadow-sm">
                    Template <Download size={14} />
                  </button>
                  <div className="relative">
                    <input ref={fileRef} type="file" accept=".xlsx" onChange={(e) => setExcelFile(e.target.files[0])} className="hidden" id="excel-upload" />
                    <label htmlFor="excel-upload" className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-dotted border-slate-300 text-[9px] font-bold hover:border-indigo-300 cursor-pointer shadow-sm transition">
                      {excelFile ? excelFile.name.slice(0, 15) + '...' : 'Select File'} <Upload size={14} />
                    </label>
                  </div>
                  <button onClick={handleExcelUpload} disabled={!excelFile || loading} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[9px] font-black disabled:opacity-20 hover:bg-black transition shadow-xl shadow-slate-200">
                    Upload Questions
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Manual Provisioning */}
          <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 ml-4">Select Exam</label>
                  <select name="examId" value={formData.examId} onChange={handleChange} className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold appearance-none cursor-pointer transition-all ${errors.examId ? 'border-rose-200 bg-rose-50' : 'border-slate-50'}`}>
                    <option value="">Select an exam</option>
                    {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 ml-4">Question Text</label>
                  <textarea name="questionText" value={formData.questionText} onChange={handleChange} placeholder="Enter the question here..." className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold transition-all min-h-[120px] ${errors.questionText ? 'border-rose-200 bg-rose-50' : 'border-slate-50'}`} />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 ml-4">Options</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formData.options.map((o, i) => (
                      <div key={i} className="relative group">
                        <input value={o} onChange={(e) => handleOptionChange(i, e.target.value)} placeholder={`Option ${i + 1}`} className={`w-full pl-14 pr-6 py-4 bg-slate-50 border rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold transition-all ${errors.options ? 'border-rose-200 bg-rose-50' : 'border-slate-50'}`} />
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 tracking-tighter shadow-sm group-focus-within:bg-slate-900 group-focus-within:text-white transition">OP{i + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 ml-4">Correct Answer</label>
                    <div className="flex gap-2 p-2 bg-slate-50 rounded-[20px] border border-slate-50">
                      {["1", "2", "3", "4"].map((o) => (
                        <label key={o} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all border ${formData.correctOption === o ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-transparent border-transparent text-slate-400 hover:bg-white'}`}>
                          <input type="radio" name="correctOption" value={o} checked={formData.correctOption === o} onChange={handleChange} className="hidden" />
                          <CheckCircle2 size={12} className={formData.correctOption === o ? 'text-indigo-400' : 'text-slate-200'} />
                          <span className="text-[10px] font-black">OP{o}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 ml-4">Difficulty</label>
                    <div className="flex gap-2 p-2 bg-slate-50 rounded-[20px] border border-slate-50">
                      {["Easy", "Medium", "Hard"].map((d) => (
                        <label key={d} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all border ${formData.difficulty === d ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-transparent border-transparent text-slate-400 hover:bg-white'}`}>
                          <input type="radio" name="difficulty" value={d} checked={formData.difficulty === d} onChange={handleChange} className="hidden" />
                          <Activity size={12} className={formData.difficulty === d ? 'text-indigo-400' : 'text-slate-200'} />
                          <span className="text-[10px] font-black">{d.charAt(0)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 sticky bottom-0 bg-white border-t border-slate-50 py-4">
                <button type="button" onClick={onClose} className="px-8 py-5 bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-400 hover:bg-slate-100 transition-all border border-slate-100">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 px-8 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-bold hover:bg-black transition-all shadow-xl shadow-indigo-50/50 flex items-center justify-center gap-3">
                  <Send size={16} /> Create Question
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
