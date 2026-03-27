import { fetchSuperUserGroups, createSuperUserExam } from "../../../utils/api.js";
import {
  Plus, FileText, Clock, Layers, Calendar, Shield, X, CheckCircle2, AlertCircle, Timer, ChevronRight,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function CreateExam({ onClose }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [scheduleExam, setScheduleExam] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchSuperUserGroups()
      .then((res) => {
        const data = res?.groups || res || [];
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setGroups(sorted);
      })
      .catch((err) => console.error("Error loading groups:", err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedGroups.length === 0) {
      toast.error("Select at least one group.");
      return;
    }

    if (scheduleExam) {
      if (!startDate || !startTime || !endDate || !endTime) {
        toast.error("Please set both start and end times.");
        return;
      }
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);
      if (start < new Date()) {
        toast.error("Start date cannot be in the past.");
        return;
      }
      if (start >= end) {
        toast.error("End date must be after start date.");
        return;
      }
    }

    const payload = {
      title, description, duration, status, scheduled: scheduleExam, groupIds: selectedGroups,
      start_date: scheduleExam ? `${startDate} ${startTime}` : null, end_date: scheduleExam ? `${endDate} ${endTime}` : null,
    };

    createSuperUserExam(payload)
      .then(() => {
        toast.success("Exam created successfully!");
        onClose();
      })
      .catch((err) => {
        toast.error("Failed to create exam");
      });
  };

  return (
    <div className="p-0 text-left">
      <div className="p-10 border-b border-slate-50">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Exam</h2>
        <p className="text-[10px] text-slate-400 font-bold mt-1">Set up a new exam for your organization.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 ml-4">Exam Title</label>
            <input
              type="text"
              placeholder="Ex: Final Semester Exam"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold transition-all shadow-inner"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 ml-4">Description</label>
            <textarea
              placeholder="Provide a description for this exam..."
              className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold transition-all min-h-[100px] shadow-inner"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 ml-4">Duration (Min)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold transition-all shadow-inner"
                  value={duration}
                  onChange={(e) => setDuration(Math.max(0, Number(e.target.value)))}
                  required
                />
                <Timer size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 ml-4">Status</label>
              <div className="relative">
                <select
                  className="w-full appearance-none pl-12 pr-10 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold transition-all cursor-pointer shadow-inner"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <Shield size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-900 rounded-[32px] shadow-xl shadow-indigo-100/50 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${scheduleExam ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/40'}`}>
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white">Schedule Exam</p>
                <p className="text-[9px] text-white/40 font-bold mt-0.5">Set start and end dates/times.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={scheduleExam} onChange={(e) => setScheduleExam(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>

          <AnimatePresence>
            {scheduleExam && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-6 p-8 bg-slate-50 rounded-[32px] border border-slate-50 shadow-inner">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-bold text-slate-400 ml-2">Start Date</label>
                      <input type="date" className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-[10px] font-bold outline-none focus:border-indigo-100 transition-all" value={startDate} onChange={(e) => setStartDate(e.target.value)} required min={todayStr} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-bold text-slate-400 ml-2">Start Time</label>
                      <input type="time" className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-[10px] font-bold outline-none focus:border-indigo-100 transition-all" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-bold text-slate-400 ml-2">End Date</label>
                      <input type="date" className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-[10px] font-bold outline-none focus:border-indigo-100 transition-all" value={endDate} onChange={(e) => setEndDate(e.target.value)} required min={todayStr} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-bold text-slate-400 ml-2">End Time</label>
                      <input type="time" className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-[10px] font-bold outline-none focus:border-indigo-100 transition-all" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 ml-4">Group Access</label>
            <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-50 min-h-[140px] grid grid-cols-1 sm:grid-cols-2 gap-4 shadow-inner overflow-y-auto max-h-60 scrollbar-hide py-6">
              {groups.map((g) => {
                const id = String(g.id);
                const isSelected = selectedGroups.includes(id);
                return (
                  <label key={id} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${isSelected ? 'bg-white border-indigo-100 shadow-md ring-1 ring-indigo-50' : 'bg-transparent border-transparent hover:bg-white/50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-colors ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        {g.name.charAt(0)}
                      </div>
                      <span className={`text-[10px] font-bold transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>{g.name}</span>
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isSelected}
                      onChange={() => isSelected ? setSelectedGroups(selectedGroups.filter(v => v !== id)) : setSelectedGroups([...selectedGroups, id])}
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-200'}`}>
                      {isSelected && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={onClose} className="flex-1 px-8 py-5 bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-400 hover:bg-slate-100 transition-all border border-slate-100">Cancel</button>
          <button type="submit" className="flex-1 px-8 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-bold hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3">
            <Send size={16} /> Create Exam
          </button>
        </div>
      </form>
    </div>
  );
}