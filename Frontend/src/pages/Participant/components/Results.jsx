import { useEffect, useState } from "react";
import { fetchResultsByParticipant } from "../../../utils/api";
import {
  Award,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Layers,
  Zap,
  Activity,
  ChevronRight,
  Database,
  History,
  Target,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getResults = async () => {
      setLoading(true);
      try {
        const res = await fetchResultsByParticipant();
        const data = Array.isArray(res) ? res : (res.data || []);
        setResults(data);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    getResults();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-left">
      <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Result Registry...</p>
    </div>
  );

  return (
    <div className="space-y-10 text-left animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tighter">Mission History</h2>
          <p className="text-sm text-slate-500 font-medium mt-2">Comprehensive archive of all executed assessment missions and telemetry output.</p>
        </div>
        <div className="flex gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
            <Database size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest leading-none">Registry Capacity</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{results.length} Missions Synchronized</p>
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="p-40 text-center flex flex-col items-center gap-6 opacity-20">
          <History size={64} className="text-slate-400" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Archival Registry Clear</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((r, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={idx}
              className="p-10 bg-white border border-slate-50 rounded-[44px] shadow-sm hover:shadow-2xl hover:shadow-indigo-50/50 transition-all group relative overflow-hidden"
            >
              <div className="flex flex-col gap-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
                      <FileText size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 tracking-tight leading-tight group-hover:text-indigo-600 transition truncate max-w-[150px]">{r.examName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar size={10} className="text-slate-300" />
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(r.examDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                      <Zap size={10} className="fill-emerald-600" /> SUCCESS
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <Target size={10} className="text-indigo-400" /> Accuracy
                    </p>
                    <p className="text-lg font-black text-slate-900 tracking-tighter">
                      {r.participantMarks} <span className="text-[10px] text-slate-300 uppercase">/ {r.totalMarks}</span>
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <Activity size={10} className="text-rose-400" /> Efficiency
                    </p>
                    <p className="text-lg font-black text-slate-900 tracking-tighter">
                      {r.percentage}%
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-3xl border border-slate-50 shadow-sm flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Temporal Footprint</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={12} className="text-slate-900" />
                      <span className="text-[10px] font-black text-slate-900 tracking-tight">
                        {Math.floor(r.completionTime / 60)}M {r.completionTime % 60}S
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-[8px] font-black text-rose-300 uppercase tracking-widest">Collisions</p>
                    <span className="text-[10px] font-black text-rose-500 tracking-tight">{r.wrongAnswers} FAILURES</span>
                  </div>
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