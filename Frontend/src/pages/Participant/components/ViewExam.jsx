import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchParticipantExams } from "../../../utils/api";
import {
  Play,
  ChevronRight,
  Layers,
  Clock,
  BookOpen,
  Target,
  ShieldCheck,
  Activity,
  Zap,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ViewExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadExams = async () => {
      setLoading(true);
      try {
        const data = await fetchParticipantExams();
        const now = new Date();
        const liveExams = (Array.isArray(data) ? data : (data || [])).filter(
          (exam) =>
            new Date(exam.startDate) <= now &&
            new Date(exam.endDate) >= now
        );
        setExams(liveExams);
      } catch (err) {
        setExams([]);
      } finally {
        setLoading(false);
      }
    };
    loadExams();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scanning Active Frequencies...</p>
    </div>
  );

  return (
    <div className="space-y-6 text-left">
      {exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6 opacity-20">
          <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-400 shadow-inner">
            <Lock size={32} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">No Live Assessment Streams Detected</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map((exam, idx) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              key={exam.id || exam._id}
              onClick={() => navigate(`/exam/${exam.id || exam._id}`)}
              className="p-10 bg-white border border-slate-50 rounded-[44px] cursor-pointer hover:shadow-2xl hover:shadow-indigo-50/50 transition-all group relative overflow-hidden active:scale-95"
            >
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-400 shadow-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Play size={20} className="fill-current" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1.5 flex items-center gap-1.5">
                        <Activity size={10} /> TRANSMISSION LIVE
                      </p>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition">{exam.title}</h3>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Mission Duration</p>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-900" />
                      <span className="text-sm font-black text-slate-900 tracking-tight">{exam.duration} MIN</span>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Intelligence Load</p>
                    <div className="flex items-center gap-2">
                      <Target size={14} className="text-slate-900" />
                      <span className="text-sm font-black text-slate-900 tracking-tight">{exam.totalMarks} POTENTIAL</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Deployment Ready</span>
                  </div>
                  <button className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:gap-4 transition-all">
                    Deploy Mission <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-[80px]"></div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
