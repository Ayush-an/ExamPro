import { useEffect, useState } from "react";
import { fetchParticipantExams } from "../../../utils/api";
import {
  Clock,
  Calendar,
  History,
  Timer,
  ChevronRight,
  Shield,
  Info,
  Layers,
  Zap,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UpcomingExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const getExams = async () => {
      try {
        const res = await fetchParticipantExams();
        const data = Array.isArray(res) ? res : (res.data || []);
        const upcoming = data.filter(
          (e) => new Date(e.startDate) > new Date()
        );
        setExams(upcoming);
      } catch (err) {
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    getExams();
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calcCountdown = (startDate) => {
    const diff = new Date(startDate) - now;
    if (diff <= 0) return "PROVISIONING...";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}H ${mins.toString().padStart(2, '0')}M ${secs.toString().padStart(2, '0')}S`;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Master Schedule...</p>
    </div>
  );

  return (
    <div className="space-y-6 text-left">
      {exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20">
          <Calendar size={48} className="text-slate-400" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">No Assessment Proxies Detected</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={exam.id}
              className="p-8 bg-slate-50 border border-transparent hover:border-indigo-100 hover:bg-white transition-all rounded-[32px] group relative overflow-hidden"
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                      <Clock size={18} />
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Transmission Scheduled</span>
                  </div>
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-amber-100 shadow-sm">
                    <Zap size={10} className="fill-amber-600" /> Pending
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight leading-tight group-hover:text-indigo-600 transition truncate">{exam.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar size={10} className="text-slate-300" />
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{new Date(exam.startDate).toLocaleDateString()} at {new Date(exam.startDate).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-inner flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer size={14} className="text-rose-400" />
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">{calcCountdown(exam.startDate)}</span>
                  </div>
                  <Shield size={14} className="text-slate-100 group-hover:text-emerald-300 transition-colors" />
                </div>
              </div>

              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-[40px]"></div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
