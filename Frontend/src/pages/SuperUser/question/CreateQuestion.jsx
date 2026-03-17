import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { fetchExams, createQuestion, uploadQuestionExcel } from "../../../utils/api";
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
    fetchExams()
      .then(setExams)
      .catch(() => toast.error("Protocol registry load failed"));
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
    if (!formData.examId) return toast.error("Target protocol not selected");
    const data = [
      ["questionText", "option1", "option2", "option3", "option4", "correctOption", "difficulty", "marks"],
      ["Sample intelligence node prompt?", "Opt A", "Opt B", "Opt C", "Opt D", "1", "Easy", "1"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "IntelTemplate");
    XLSX.writeFile(wb, "Intelligence_Template.xlsx");
  };

  const handleExcelUpload = async () => {
    if (!formData.examId) return toast.error("Target protocol missing");
    if (!excelFile) return toast.error("No intelligence payload selected");
    setLoading(true);
    try {
      await uploadQuestionExcel(formData.examId, excelFile);
      toast.success("Intelligence batch synchronized");
      onCreated?.();
    } catch {
      toast.error("Intelligence synchronization failed");
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
    if (!validateForm()) return toast.error("Intelligence parameters incomplete");
    setLoading(true);
    try {
      await createQuestion(formData);
      toast.success("Intelligence node operational");
      onCreated?.();
      onClose?.();
    } catch {
      toast.error("Intelligence node creation failed");
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
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Provision Intelligence Node</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Creation of individual assessment intelligence units</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition"><X size={20} /></button>
        </div>

        <div className="flex flex-col lg:flex-row h-[70vh]">
          {/* Left: Quick Bulk Actions */}
          <div className="w-full lg:w-72 bg-slate-50 p-8 space-y-8 border-r border-slate-100">
            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Database size={14} className="text-indigo-600" /> Bulk Ingestion
                </h3>
                <div className="space-y-3">
                  <button onClick={downloadTemplate} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 text-[9px] font-bold uppercase tracking-widest hover:border-indigo-100 hover:text-indigo-600 transition shadow-sm">
                    Template <Download size={14} />
                  </button>
                  <div className="relative">
                    <input ref={fileRef} type="file" accept=".xlsx" onChange={(e) => setExcelFile(e.target.files[0])} className="hidden" id="excel-upload" />
                    <label htmlFor="excel-upload" className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-dotted border-slate-300 text-[9px] font-bold uppercase tracking-widest hover:border-indigo-300 cursor-pointer shadow-sm transition">
                      {excelFile ? excelFile.name.slice(0, 15) + '...' : 'Select File'} <Upload size={14} />
                    </label>
                  </div>
                  <button onClick={handleExcelUpload} disabled={!excelFile || loading} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest disabled:opacity-20 hover:bg-black transition shadow-xl shadow-slate-200">
                    Execute Sync
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Target Assessment Protocol</label>
                  <select name="examId" value={formData.examId} onChange={handleChange} className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold uppercase tracking-widest appearance-none cursor-pointer transition-all ${errors.examId ? 'border-rose-200 bg-rose-50' : 'border-slate-50'}`}>
                    <option value="">Target Protocol Selection</option>
                    {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Intelligence Node Content</label>
                  <textarea name="questionText" value={formData.questionText} onChange={handleChange} placeholder="Protocol prompt or inquiry text..." className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold uppercase tracking-widest transition-all min-h-[120px] ${errors.questionText ? 'border-rose-200 bg-rose-50' : 'border-slate-50'}`} />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Reponse Probabilities</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formData.options.map((o, i) => (
                      <div key={i} className="relative group">
                        <input value={o} onChange={(e) => handleOptionChange(i, e.target.value)} placeholder={`Probability Option ${i + 1}`} className={`w-full pl-14 pr-6 py-4 bg-slate-50 border rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold uppercase tracking-widest transition-all ${errors.options ? 'border-rose-200 bg-rose-50' : 'border-slate-50'}`} />
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 tracking-tighter shadow-sm group-focus-within:bg-slate-900 group-focus-within:text-white transition">OP{i + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Correct Signal Key</label>
                    <div className="flex gap-2 p-2 bg-slate-50 rounded-[20px] border border-slate-50">
                      {["1", "2", "3", "4"].map((o) => (
                        <label key={o} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all border ${formData.correctOption === o ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-transparent border-transparent text-slate-400 hover:bg-white'}`}>
                          <input type="radio" name="correctOption" value={o} checked={formData.correctOption === o} onChange={handleChange} className="hidden" />
                          <CheckCircle2 size={12} className={formData.correctOption === o ? 'text-indigo-400' : 'text-slate-200'} />
                          <span className="text-[10px] font-black uppercase tracking-widest">OP{o}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Intelligence Complexity</label>
                    <div className="flex gap-2 p-2 bg-slate-50 rounded-[20px] border border-slate-50">
                      {["Easy", "Medium", "Hard"].map((d) => (
                        <label key={d} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all border ${formData.difficulty === d ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-transparent border-transparent text-slate-400 hover:bg-white'}`}>
                          <input type="radio" name="difficulty" value={d} checked={formData.difficulty === d} onChange={handleChange} className="hidden" />
                          <Activity size={12} className={formData.difficulty === d ? 'text-indigo-400' : 'text-slate-200'} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{d.charAt(0)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 sticky bottom-0 bg-white border-t border-slate-50 py-4">
                <button type="button" onClick={onClose} className="px-8 py-5 bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-100 transition-all border border-slate-100">Abort Node</button>
                <button type="submit" disabled={loading} className="flex-1 px-8 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-indigo-50/50 flex items-center justify-center gap-3">
                  <Send size={16} /> Deploy Intelligence node
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
