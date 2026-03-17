import { useEffect, useState } from "react";
import { fetchMyAssignments } from "../../../utils/api";
import {
  Send,
  X,
  Clock,
  FileText,
  Download,
  CheckCircle2,
  Shield,
  Calendar,
  Layers,
  Info,
  ExternalLink,
  ChevronRight,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function Assignment({ groupId, onClose }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssignments = async () => {
      setLoading(true);
      try {
        const res = await fetchMyAssignments(groupId);
        setAssignments(Array.isArray(res) ? res : []);
      } catch (err) {
        toast.error("Mission payload synchronization failed");
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    if (groupId) loadAssignments();
  }, [groupId]);

  return (
    <div className="p-0 text-left h-full flex flex-col">
      <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10 rounded-t-[44px]">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mission Assignments</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Direct institutional mission units for entity completion</p>
        </div>
        <button onClick={onClose} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition"><X size={20} /></button>
      </div>

      <div className="p-10 flex-1 overflow-y-auto scrollbar-hide space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scanning Intelligence Stream...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20">
            <Database size={48} className="text-slate-400" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Mission Matrix Empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((a, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={a.id}
                className="p-8 bg-white border border-slate-50 rounded-[32px] hover:shadow-xl hover:shadow-indigo-50/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner border border-slate-100/50">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 tracking-tight">{a.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar size={10} className="text-slate-300" />
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">DEPLOYED: {new Date(a.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Active
                  </span>
                </div>

                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed pl-16">
                  {a.description || "No supplemental briefing provided for this mission."}
                </p>

                {a.fileUrl && (
                  <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between pl-16">
                    <div className="flex items-center gap-2">
                      <Shield size={10} className="text-indigo-400" />
                      <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">End-to-End Encrypted</span>
                    </div>
                    <a
                      href={`${import.meta.env.VITE_API_URL}${a.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-black transition shadow-lg shadow-slate-200"
                    >
                      Access Intelligence <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="p-10 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between rounded-b-[44px]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Protocols Synchronized</p>
        </div>
        <button onClick={onClose} className="px-8 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-white hover:text-slate-900 transition shadow-sm">Close Registry</button>
      </div>
    </div>
  );
}