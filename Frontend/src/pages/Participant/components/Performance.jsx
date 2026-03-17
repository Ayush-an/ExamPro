import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  AreaChart,
  Area,
  Cell
} from "recharts";
import { fetchResultsByParticipant } from "../../../utils/api";
import {
  BarChart3,
  TrendingUp,
  Activity,
  Award,
  Target,
  Layers,
  Zap,
  Info,
  Calendar,
  CheckCircle2,
  XCircle,
  Database
} from "lucide-react";
import { motion } from "framer-motion";

export default function Performance() {
  const [weeklyScores, setWeeklyScores] = useState([]);
  const [overall, setOverall] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ avg: 0, highest: 0, missions: 0 });

  useEffect(() => {
    const loadPerformance = async () => {
      try {
        const results = await fetchResultsByParticipant();
        const data = Array.isArray(results) ? results : (results.data || []);
        if (!data.length) return;

        const sorted = [...data].sort((a, b) => new Date(b.examDate) - new Date(a.examDate));

        // Last 7 missions
        const last7 = sorted.slice(0, 7).reverse();
        const weekly = last7.map((r) => {
          const marks = Number(r.participantMarks) || 0;
          const total = Number(r.totalMarks) || 0;
          const percentage = total > 0 ? Number(((marks / total) * 100).toFixed(2)) : 0;
          return {
            exam: r.examName.slice(0, 10) + '...',
            fullName: r.examName,
            value: percentage,
            marks,
            total,
            percentage,
          };
        });
        setWeeklyScores(weekly);

        // Stats calculation
        const totalPerc = weekly.reduce((acc, curr) => acc + curr.percentage, 0);
        setStats({
          avg: (totalPerc / weekly.length).toFixed(1),
          highest: Math.max(...weekly.map(w => w.percentage)),
          missions: data.length
        });

        // Overall summary
        let correct = 0, wrong = 0, skipped = 0;
        data.forEach((r) => {
          correct += Number(r.participantMarks) || 0;
          wrong += Number(r.wrongAnswers) || 0;
          skipped += Number(r.skippedAnswers) || 0;
        });

        setOverall([
          { name: "Correct Signals", value: correct, color: "#10B981" },
          { name: "Incorrect Signals", value: wrong, color: "#F43F5E" },
          { name: "Omitted Signals", value: skipped, color: "#94A3B8" },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPerformance();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-left">
      <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Performance Matrix...</p>
    </div>
  );

  if (!weeklyScores.length) return (
    <div className="p-20 text-center flex flex-col items-center gap-6 opacity-20">
      <BarChart3 size={64} className="text-slate-400" />
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">No Intelligence Telemetry Available</p>
    </div>
  );

  return (
    <div className="space-y-10 text-left animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tighter">Mission Analytics</h2>
          <p className="text-sm text-slate-500 font-medium mt-2">Comprehensive performance telemetry and signal accuracy breakdown.</p>
        </div>
        <div className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200">
          Real-time Synchronization Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 bg-white border border-slate-50 rounded-[44px] shadow-sm group">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner">
              <TrendingUp size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Efficiency</p>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black text-slate-900 tracking-tighter">{stats.avg}%</span>
            <span className="text-[10px] text-emerald-500 font-bold mb-2 flex items-center gap-1">
              <Activity size={10} /> +2.1%
            </span>
          </div>
        </div>

        <div className="p-8 bg-white border border-slate-50 rounded-[44px] shadow-sm group">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner">
              <Award size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peak Intelligence</p>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black text-slate-900 tracking-tighter">{stats.highest}%</span>
            <span className="text-[10px] text-indigo-400 font-bold mb-2 uppercase tracking-widest">Mission Top</span>
          </div>
        </div>

        <div className="p-8 bg-slate-900 rounded-[44px] text-white shadow-xl shadow-slate-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-bl-[100px]"></div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center">
              <Database size={20} />
            </div>
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Registry Load</p>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="text-5xl font-black tracking-tighter">{stats.missions}</span>
            <span className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-widest">Completed Units</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="p-10 bg-white border border-slate-50 rounded-[44px] shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Mission History</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Success percentage across last 7 assessment missions</p>
            </div>
          </div>
          <div className="h-80 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyScores} barGap={0}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="exam" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} dy={15} />
                <YAxis hide domain={[0, 110]} />
                <Tooltip
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={40}>
                  {weeklyScores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value >= 75 ? '#6366f1' : entry.value >= 40 ? '#94a3b8' : '#f43f5e'} />
                  ))}
                  <LabelList
                    dataKey={(d) => `${d.marks}/${d.total}`}
                    position="top"
                    style={{ fontSize: 9, fontWeight: 900, fill: '#64748b', textTransform: 'uppercase' }}
                    offset={10}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-10 bg-white border border-slate-50 rounded-[44px] shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Signal Accuracy Matrix</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total aggregated raw data from all executed missions</p>
            </div>
          </div>
          <div className="h-80 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overall} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis hide type="number" />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} dx={-10} />
                <Tooltip
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                />
                <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={32}>
                  {overall.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList dataKey="value" position="right" style={{ fontSize: 10, fontWeight: 900, fill: '#1e293b' }} offset={10} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="p-10 bg-indigo-50/50 rounded-[44px] border border-indigo-100 flex items-center gap-8 relative overflow-hidden group">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-100 border border-white group-hover:scale-110 transition-transform">
          <Layers size={32} />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-black text-indigo-900 tracking-tight">Deep Intelligence Scan</h4>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-2 leading-relaxed max-w-2xl">
            Our neural analytics engine confirms a <span className="text-indigo-600 font-black">Stable Learning Trajectory</span>. Continue executing assessment protocols to maintain peak institutional standing.
          </p>
        </div>
        <button className="px-10 py-5 bg-slate-900 text-white rounded-3xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200">Export Registry</button>
      </div>
    </div>
  );
}