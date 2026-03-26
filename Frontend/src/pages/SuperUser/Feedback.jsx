import { useEffect, useState } from "react";
import { fetchFeedbacks } from "../../utils/api";
import {
  MessageSquare,
  X,
  Clock,
  UserCircle2,
  History,
  Search,
  ChevronRight,
  Filter,
  Layers,
  Shield,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Feedbacks({ onClose }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeedbacks = async () => {
      setLoading(true);
      try {
        const data = await fetchSuperUserFeedbacks();
        setFeedbacks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Feedback telemetry failure");
      } finally {
        setLoading(false);
      }
    };
    loadFeedbacks();
  }, []);

  return (
    <div className="p-0 text-left h-full flex flex-col">
      <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10 rounded-t-[44px]">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Sentiment Stream</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time feedback monitoring from participant nodes</p>
        </div>
        <button onClick={onClose} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition"><X size={20} /></button>
      </div>

      <div className="p-10 flex-1 overflow-y-auto scrollbar-hide space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scanning Sentiment Matrix...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20">
            <MessageSquare size={48} className="text-slate-400" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sentiment Stream Silent</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((fb, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={fb.id}
                className="p-8 bg-white border border-slate-50 rounded-[32px] hover:shadow-xl hover:shadow-indigo-50/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner border border-slate-100/50">
                      <UserCircle2 size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 tracking-tight">{fb.senderName}</h4>
                      <span className="px-2 py-0.5 bg-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest rounded-md mt-1 inline-block">{fb.senderRole}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase">
                    <Clock size={12} /> {new Date(fb.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed pl-16">
                  {fb.message}
                </p>

                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between pl-16">
                  <div className="flex items-center gap-2">
                    <Shield size={10} className="text-indigo-400" />
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Verified Signal</span>
                  </div>
                  <button className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-600 transition flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Archive Signal <ChevronRight size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="p-10 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between rounded-b-[44px]">
        <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Stream Operational: {feedbacks.length} Active Nodes</p>
        </div>
        <button onClick={onClose} className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition shadow-xl shadow-slate-100">Synchronize View</button>
      </div>
    </div>
  );
}
