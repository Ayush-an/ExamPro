import { fetchSuperUserFeedbacks, uploadSuperUserAssignment } from "../../utils/api";
import {
  FilePlus,
  Send,
  X,
  Layers,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Shield,
  Info,
  ChevronRight,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";

export default function Assignments({ onClose }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const data = await fetchSuperUserGroups();
        setGroups(data.groups || data || []);
      } catch (err) {
        toast.error("Group telemetry fetch failed");
      }
    };
    loadGroups();
  }, []);

  const toggleGroup = (id) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Protocol title required");
    if (!file) return toast.error("Mission payload (file) missing");
    if (selectedGroups.length === 0) return toast.error("Target units (groups) not specified");

    setLoading(true);
    try {
      for (const groupId of selectedGroups) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("groupId", groupId);
        await uploadSuperUserAssignment(formData);
      }
      toast.success("Intelligence mission deployed successfully!");
      if (onClose) onClose();
    } catch (err) {
      toast.error("Mission deployment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-0 text-left">
      <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10 rounded-t-[44px]">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Deploy Intelligence Mission</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Assignment distribution across functional units</p>
        </div>
        <button onClick={onClose} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition"><X size={20} /></button>
      </div>

      <form onSubmit={handleUpload} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Mission Identification</label>
            <input
              type="text"
              placeholder="Ex: Quarterly Strategic Deployment Audit"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold uppercase tracking-widest transition-all shadow-inner"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Briefing Constraints (Description)</label>
            <textarea
              placeholder="Detailed objectives and submission protocols..."
              className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold uppercase tracking-widest transition-all min-h-[100px] shadow-inner"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Intelligence Payload (File)</label>
            <div className="relative group">
              <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" id="assignment-file" />
              <label htmlFor="assignment-file" className="w-full flex items-center justify-between p-6 bg-slate-50 border border-dotted border-slate-300 rounded-[32px] cursor-pointer hover:border-indigo-300 transition-all shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Upload size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{file ? file.name : 'Select Intelligence Files'}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{file ? `${(file.size / 1024).toFixed(1)} KB` : 'PDF, DOCX, ZIP supported'}</p>
                  </div>
                </div>
                {file && <CheckCircle2 size={16} className="text-emerald-500 mr-2" />}
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Target Permission Matrix</label>
            <div className="p-8 bg-slate-900 rounded-[40px] shadow-xl shadow-indigo-100/50 min-h-[160px] grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-60 overflow-y-auto scrollbar-hide py-6 border border-white/5">
              {groups.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center opacity-20 py-10">
                  <Database size={40} className="text-white" />
                  <p className="text-[9px] font-bold text-white uppercase tracking-widest mt-2">No Target Units Syncing</p>
                </div>
              ) : (
                groups.map((group) => {
                  const isSelected = selectedGroups.includes(group.id);
                  return (
                    <label key={group.id} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${isSelected ? 'bg-white/10 border-white/20' : 'bg-transparent border-transparent hover:bg-white/5'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-colors ${isSelected ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/40'}`}>
                          {group.name.charAt(0)}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isSelected ? 'text-white' : 'text-white/40'}`}>{group.name}</span>
                      </div>
                      <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleGroup(group.id)} />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-white/10'}`}>
                        {isSelected && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4 sticky bottom-0 bg-white py-4">
          <button type="button" onClick={onClose} className="px-8 py-5 bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-100 transition-all border border-slate-100">Abort Mission</button>
          <button type="submit" disabled={loading} className="flex-1 px-8 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-indigo-50/50 flex items-center justify-center gap-3">
            <Send size={16} /> {loading ? 'Deploying...' : 'Deploy Mission'}
          </button>
        </div>
      </form>
    </div>
  );
}
