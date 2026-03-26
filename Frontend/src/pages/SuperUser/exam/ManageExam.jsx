import { fetchSuperUserGroups, fetchSuperUserExams, updateExam, deleteSuperUserExam } from "../../../utils/api";
import {
  FileText,
  Search,
  Plus,
  Edit3,
  Trash2,
  ChevronRight,
  Calendar,
  Clock,
  Layers,
  Activity,
  CheckCircle2,
  X,
  Shield,
  MoreVertical,
  Timer,
  ExternalLink,
  Archive
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const ManageExam = () => {
  const [exams, setExams] = useState([]);
  const [groups, setGroups] = useState([]);
  const [editingExam, setEditingExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const isoToLocalInput = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    } catch (e) { return ""; }
  };

  const localInputToIso = (local) => {
    if (!local) return null;
    try { return new Date(local).toISOString(); } catch (e) { return null; }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [examsData, groupsData] = await Promise.all([
        fetchSuperUserExams(),
        fetchSuperUserGroups()
      ]);
      setExams(Array.isArray(examsData) ? examsData : []);
      setGroups(Array.isArray(groupsData.groups) ? groupsData.groups : groupsData);
    } catch (err) {
      toast.error("Telemetry synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleEditChange = (field, value) => {
    setEditingExam(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {
        ...editingExam,
        groupIds: editingExam.selectedGroups?.map(id => parseInt(id)) || [],
      };

      if (editingExam.start_date && !editingExam.start_date.includes("Z")) {
        const maybeIso = localInputToIso(editingExam.start_date);
        if (maybeIso) payload.start_date = maybeIso;
      }
      if (editingExam.end_date && !editingExam.end_date.includes("Z")) {
        const maybeIso = localInputToIso(editingExam.end_date);
        if (maybeIso) payload.end_date = maybeIso;
      }

      await updateExam(editingExam.id, payload);
      setEditingExam(null);
      loadData();
      toast.success("Protocol updated successfully");
    } catch (err) {
      toast.error("Protocol update failure");
    }
  };

  const handleSoftDelete = async (id) => {
    if (!window.confirm("Confirm protocol decommissioning?")) return;
    try {
      await deleteSuperUserExam(id);
      loadData();
      toast.success("Protocol decommissioned");
    } catch (err) {
      toast.error("Decommission protocol failed");
    }
  };

  const filteredExams = exams.filter(e =>
    e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-bold text-slate-400">Loading exams...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-50">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Exams</h2>
          <p className="text-[10px] text-slate-400 font-bold mt-1">Manage organization exams and schedules.</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:border-indigo-100 transition-all w-full md:w-80 shadow-inner">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-[10px] font-bold placeholder:text-slate-300 w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredExams.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-slate-50 shadow-sm">
            <div className="flex flex-col items-center gap-4 opacity-20">
              <FileText size={48} className="text-slate-400" />
              <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em]">No exams found</p>
            </div>
          </div>
        ) : (
          filteredExams.map((exam) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={exam.id}
              className="group p-8 bg-white border border-slate-50 rounded-[44px] shadow-sm hover:shadow-2xl hover:shadow-indigo-50/50 transition-all relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity">
                <FileText size={120} />
              </div>

              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-slate-900 rounded-[22px] flex items-center justify-center text-white font-black shadow-xl shadow-slate-200 group-hover:scale-110 transition cursor-pointer">
                  <CheckCircle2 size={24} className="text-indigo-400" />
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[8px] font-black tracking-widest border ${exam.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-amber-50 text-amber-600 border-amber-100"
                  }`}>
                  <span className={`w-1 h-1 rounded-full inline-block mr-1.5 ${exam.status === "ACTIVE" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
                  {exam.status}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-indigo-600 transition">{exam.title}</h3>
              <p className="text-[10px] text-slate-400 font-bold line-clamp-2 mb-8 h-10">{exam.description || "No description available."}</p>

              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-50">
                  <div className="flex items-center gap-3">
                    <Timer size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500">Duration</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-900">{exam.duration} Min</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-50">
                  <div className="flex items-center gap-3">
                    <Layers size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500">Group Access</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-900 truncate max-w-[120px]">
                    {exam.Groups?.length > 0 ? exam.Groups.map(g => g.name).join(", ") : "Universal"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-50">
                  <div className="flex items-center gap-3">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500">Start Date</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-900">
                    {exam.start_date ? new Date(exam.start_date).toLocaleDateString() : "TBD"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-50">
                <button
                  onClick={() => setEditingExam({
                    ...exam,
                    selectedGroups: exam.Groups?.map((g) => String(g.id)) || [],
                  })}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/50 transition-all"
                >
                  <Edit3 size={14} /> Edit Exam
                </button>
                <button
                  onClick={() => handleSoftDelete(exam.id)}
                  className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-300 hover:text-red-500 hover:border-red-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {editingExam && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingExam(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-xl bg-white rounded-[44px] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Exam</h2>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">Update exam details and settings.</p>
                </div>
                <button onClick={() => setEditingExam(null)} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition"><X size={20} /></button>
              </div>

              <div className="p-10 overflow-y-auto max-h-[70vh] scrollbar-hide space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 ml-4">Exam Title</label>
                    <input type="text" value={editingExam.title || ""} onChange={(e) => handleEditChange("title", e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 ml-4">Description</label>
                    <textarea value={editingExam.description || ""} onChange={(e) => handleEditChange("description", e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold transition-all min-h-[100px]" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 ml-4">Duration (Min)</label>
                      <input type="number" value={editingExam.duration || 0} onChange={(e) => handleEditChange("duration", e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 ml-4">Status</label>
                      <select value={editingExam.status || "SCHEDULED"} onChange={(e) => handleEditChange("status", e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold transition-all appearance-none cursor-pointer">
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="ACTIVE">Active</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 ml-4">Group Access</label>
                    <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-50 max-h-48 overflow-y-auto grid grid-cols-2 gap-3 scrollbar-hide">
                      {groups.map((g) => {
                        const idStr = String(g.id);
                        const isSelected = editingExam.selectedGroups?.includes(idStr);
                        return (
                          <label key={idStr} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-white border-indigo-100 shadow-sm' : 'bg-transparent border-transparent hover:bg-white/50'}`}>
                            <input type="checkbox" checked={isSelected} onChange={() => {
                              let updated = editingExam.selectedGroups || [];
                              updated = isSelected ? updated.filter(v => v !== idStr) : [...updated, idStr];
                              handleEditChange("selectedGroups", updated);
                            }} className="w-4 h-4 rounded border-slate-200 text-indigo-600 focus:ring-0" />
                            <span className="text-[10px] font-bold text-slate-600">{g.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 ml-4">Start Date</label>
                      <input type="datetime-local" value={isoToLocalInput(editingExam.start_date)} onChange={(e) => handleEditChange("start_date", localInputToIso(e.target.value))} className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 ml-4">End Date</label>
                      <input type="datetime-local" value={isoToLocalInput(editingExam.end_date)} onChange={(e) => handleEditChange("end_date", localInputToIso(e.target.value))} className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold transition-all" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                  <button onClick={() => setEditingExam(null)} className="flex-1 px-8 py-5 bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-400 hover:bg-slate-100 transition-all border border-slate-100">Cancel</button>
                  <button onClick={handleSaveEdit} className="flex-1 px-8 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-bold text-indigo-400 hover:bg-black transition-all shadow-xl shadow-slate-100">Save Changes</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageExam;
