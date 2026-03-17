import {
    BookOpen,
    TrendingUp,
    Clock,
    BellRing,
    Send,
    ChevronRight,
    Plus,
    Activity,
    Target,
    Layers,
    Award,
    Zap,
    Info,
    Calendar,
    X,
    Database
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchParticipantExams } from "../../utils/api";
import Notice from "./components/Notice";
import ViewExams from "./components/ViewExam";
import UpcomingExams from "./components/Upcoming";
import Assignment from "./components/Assignment";
import {
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from "framer-motion";

const activityData = [
    { day: "Mon", score: 40 },
    { day: "Tue", score: 72 },
    { day: "Wed", score: 50 },
    { day: "Thu", score: 90 },
    { day: "Fri", score: 60 },
    { day: "Sat", score: 95 },
    { day: "Sun", score: 70 },
];

export default function Dashboard() {
    const [openDialog, setOpenDialog] = useState(null); // exams | upcoming | notice | assignment
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showNoticePanel, setShowNoticePanel] = useState(false);
    const [showAssignment, setShowAssignment] = useState(false);
    const user = JSON.parse(localStorage.getItem("user"));
    const groupId = user?.groupId || user?.group?.id;

    const navigate = useNavigate();

    const loadExams = async () => {
        setLoading(true);
        try {
            const res = await fetchParticipantExams();
            setExams(Array.isArray(res.data) ? res.data : (res.success ? res.data : []));
        } catch (err) {
            setExams([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadExams(); }, []);

    const QuickLink = ({ icon: Icon, label, onClick, color }) => (
        <motion.button
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="flex-1 min-w-[160px] p-8 bg-white border border-slate-50 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all flex flex-col items-center justify-center gap-4 group"
        >
            <div className={`p-4 rounded-2xl ${color} transition-all group-hover:scale-110 shadow-lg`}>
                <Icon size={24} />
            </div>
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{label}</span>
        </motion.button>
    );

    const renderPopup = () => {
        if (!openDialog) return null;
        let popupComponent = null;
        let title = "";
        let subtitle = "";

        if (openDialog === "viewExams") {
            popupComponent = <ViewExams exams={exams} />;
            title = "Protocol Registry";
            subtitle = "Active assessment missions available for deployment";
        } else if (openDialog === "upcomingExams") {
            popupComponent = <UpcomingExams exams={exams} />;
            title = "Mission Timeline";
            subtitle = "Future assessment synchronized in the master schedule";
        }

        return (
            <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpenDialog(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-4xl bg-white rounded-[44px] shadow-2xl border border-slate-100 overflow-hidden text-left">
                    <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{subtitle}</p>
                        </div>
                        <button onClick={() => setOpenDialog(null)} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition"><X size={20} /></button>
                    </div>
                    <div className="p-10 max-h-[70vh] overflow-y-auto scrollbar-hide">
                        {popupComponent}
                    </div>
                </motion.div>
            </div>
        );
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500 text-left">
            {/* Header Content */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div>
                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tighter">Command Center</h2>
                    <p className="text-sm text-slate-500 font-medium mt-2">Personal assessment matrix and intelligence telemetry.</p>
                </div>
                <div className="flex gap-4 p-4 bg-emerald-50 rounded-3xl border border-emerald-100/50">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                        <Zap size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-emerald-900 uppercase tracking-widest leading-none">Status: ACTIVE</p>
                        <p className="text-[9px] font-bold text-emerald-600/70 uppercase tracking-widest mt-1">Institutional Node Verified</p>
                    </div>
                </div>
            </div>

            {/* Quick Links Matrix */}
            <div className="flex flex-wrap gap-6">
                <QuickLink icon={BookOpen} label="View Exams" onClick={() => setOpenDialog("viewExams")} color="bg-indigo-600 text-white" />
                <QuickLink icon={TrendingUp} label="Results Feed" onClick={() => navigate("/results")} color="bg-slate-900 text-indigo-400" />
                <QuickLink icon={Clock} label="Upcoming" onClick={() => setOpenDialog("upcomingExams")} color="bg-emerald-500 text-white" />
                <QuickLink icon={BellRing} label="Signals" onClick={() => setShowNoticePanel(true)} color="bg-amber-500 text-white" />
                <QuickLink icon={Send} label="Missions" onClick={() => setShowAssignment(true)} color="bg-rose-500 text-white" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Stats & Activity */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="p-10 bg-white rounded-[44px] border border-slate-50 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Intelligence Performance</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Cross-mission sentiment and output frequency</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg">Weekly Analytics</div>
                            </div>
                        </div>
                        <div className="h-72 w-full mt-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={activityData}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={15} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                        cursor={{ stroke: '#4F46E5', strokeWidth: 2, strokeDasharray: '5 5' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#4F46E5"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorScore)"
                                        dot={{ r: 6, fill: '#FFF', stroke: '#4F46E5', strokeWidth: 3 }}
                                        activeDot={{ r: 8, fill: '#4F46E5', stroke: '#FFF', strokeWidth: 4 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-8 bg-slate-900 rounded-[40px] text-white overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-bl-[100px] transition-all group-hover:scale-150"></div>
                            <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-2">Institutional Ranking</h4>
                            <div className="flex items-end gap-3 mb-6">
                                <span className="text-4xl font-black tracking-tighter">Top 12%</span>
                                <span className="text-[10px] text-emerald-400 font-bold uppercase mb-2 flex items-center gap-1">
                                    <Activity size={10} /> +2.4%
                                </span>
                            </div>
                            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: "88%" }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-indigo-400" />
                            </div>
                        </div>

                        <div className="p-8 bg-white border border-slate-50 shadow-sm rounded-[40px] flex items-center justify-between group">
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Missions Completed</h4>
                                <div className="text-4xl font-black text-slate-900 tracking-tighter">24</div>
                            </div>
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                <Award size={28} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Signals Column */}
                <div className="space-y-8">
                    <div className="p-10 bg-white border border-slate-50 shadow-sm rounded-[44px]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Signals</h3>
                            <BellRing size={18} className="text-amber-500" />
                        </div>
                        <div className="space-y-6">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex gap-4 group cursor-pointer">
                                    <div className="w-10 h-10 min-w-[40px] bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                        <Info size={18} />
                                    </div>
                                    <div className="border-b border-slate-50 pb-4 flex-1">
                                        <p className="text-[11px] font-black text-slate-900 tracking-tight leading-tight group-hover:text-indigo-600 transition">Institutional Protocol Update</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">2 hours ago • Broadcast Registry</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setShowNoticePanel(true)} className="w-full mt-8 py-4 bg-slate-50 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm">View Full Registry</button>
                    </div>

                    <div className="p-10 bg-indigo-50 border border-indigo-100 rounded-[44px] flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-white rounded-[28px] flex items-center justify-center text-indigo-600 mb-6 shadow-xl shadow-indigo-200/50">
                            <Target size={32} />
                        </div>
                        <h4 className="text-sm font-black text-indigo-900 tracking-tight">Mission Readiness</h4>
                        <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-wide leading-relaxed">System scan confirms all intelligence modules operational.</p>
                        <button className="mt-8 text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:gap-4 transition-all flex items-center gap-2">
                            Run Diagnostic <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Render Overlay Dialogs */}
            <AnimatePresence>
                {showNoticePanel && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNoticePanel(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-4xl bg-white rounded-[44px] shadow-2xl border border-slate-100 overflow-hidden text-left">
                            <Notice onClose={() => setShowNoticePanel(false)} />
                        </motion.div>
                    </div>
                )}

                {showAssignment && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAssignment(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-4xl bg-white rounded-[44px] shadow-2xl border border-slate-100 overflow-hidden text-left">
                            <Assignment groupId={groupId} onClose={() => setShowAssignment(false)} />
                        </motion.div>
                    </div>
                )}

                {renderPopup()}
            </AnimatePresence>
        </div>
    );
}