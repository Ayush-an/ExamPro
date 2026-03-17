import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Bell,
  LogOut,
  Menu,
  ChevronDown,
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  MessageSquare,
  BellRing,
  Settings,
  Search,
  Plus,
  BarChart3,
  Calendar,
  Clock,
  Layers,
  MoreVertical,
  X,
  Send,
  HelpCircle,
  ChevronRight
} from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { useNavigate } from "react-router-dom";
import { fetchDashboardStats, fetchMyNotices } from "../../../utils/api.js";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// Popups & Components
import CreateGroup from "../groups/CreateGroup.jsx";
import CreateParticipant from "../participant/CreateParticipant.jsx";
import CreateExam from "../exam/CreateExam.jsx";
import CreateQuestion from "../question/CreateQuestion.jsx";

import ManageGroups from "../groups/ManageGroups.jsx";
import RemoveGroup from "../groups/RemoveGroup.jsx";

import ManageParticipants from "../participant/ManageParticipant.jsx";
import RemoveParticipant from "../participant/RemoveParticipant.jsx";
import StagingParticipant from "../participant/StagingParticipant.jsx";
import ActiveParticipant from "../participant/ActiveParticipant.jsx";
import ParticipantSummary from "../participant/ParticipantSummary.jsx";

import ManageExams from "../exam/ManageExam.jsx";
import RemoveExam from "../exam/RemoveExam.jsx";

import ManageQuestion from "../question/ManageQuestion";
import StagingQuestion from "../question/StagingQuestion.jsx";

import Assignments from "../Assignment.jsx";
import Notice from "../Notice.jsx";
import Feedbacks from "../Feedback.jsx";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SuperuserDashboard = () => {
  const [popupComponent, setPopupComponent] = useState(null);
  const [activeComponent, setActiveComponent] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalParticipants: 0,
    totalSuperUsers: 0,
    totalExams: 0,
    ActiveExams: 0,
    InactiveExams: 0,
  });

  const [showNotices, setShowNotices] = useState(false);
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const openPopup = (component) => setPopupComponent(component);
  const closePopup = () => setPopupComponent(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [statsData, noticesData] = await Promise.all([
          fetchDashboardStats(),
          fetchMyNotices()
        ]);
        setStats(statsData || stats);
        setNotices(noticesData || []);
      } catch (err) {
        console.error("Dashboard Sync Failure:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      onClick: () => setActiveComponent(null)
    },
    {
      id: "groups",
      name: "Personnel Units",
      icon: <Layers size={20} />,
      children: [
        { name: "Deploy New Unit", action: "create" },
        { name: "Unit Registry", action: "manage" },
        { name: "Decommissioned Registry", action: "remove" }
      ],
      onClick: (action) => {
        if (action === "create") openPopup(<CreateGroup onClose={closePopup} />);
        else if (action === "manage") setActiveComponent(<ManageGroups />);
        else if (action === "remove") setActiveComponent(<RemoveGroup />);
      },
    },
    {
      id: "participants",
      name: "Active Entities",
      icon: <Users size={20} />,
      children: [
        { name: "Provision Entity", action: "create" },
        { name: "Live Telemetry", action: "active" },
        { name: "Entity Master List", action: "manage" },
        { name: "Historical Archive", action: "remove" },
        { name: "Staging Area", action: "staging" },
        { name: "Batch Insights", action: "summary" },
      ],
      onClick: (action) => {
        if (action === "create") openPopup(<CreateParticipant onClose={closePopup} />);
        else if (action === "active") setActiveComponent(<ActiveParticipant />);
        else if (action === "manage") setActiveComponent(<ManageParticipants />);
        else if (action === "remove") setActiveComponent(<RemoveParticipant />);
        else if (action === "staging") setActiveComponent(<StagingParticipant />);
        else if (action === "summary") setActiveComponent(<ParticipantSummary />);
      },
    },
    {
      id: "exams",
      name: "Assessment Protocols",
      icon: <FileText size={20} />,
      children: [
        { name: "Initialize Protocol", action: "create" },
        { name: "Protocol Management", action: "manage" },
        { name: "Protocol Archive", action: "remove" }
      ],
      onClick: (action) => {
        if (action === "create") openPopup(<CreateExam onClose={closePopup} />);
        else if (action === "manage") setActiveComponent(<ManageExams />);
        else if (action === "remove") setActiveComponent(<RemoveExam />);
      },
    },
    {
      id: "questions",
      name: "Knowledge Modules",
      icon: <BookOpen size={20} />,
      children: [
        { name: "Forge New Module", action: "create" },
        { name: "Module Management", action: "manage" },
        { name: "Module Staging", action: "staging" }
      ],
      onClick: (action) => {
        if (action === "create") openPopup(<CreateQuestion onClose={closePopup} />);
        else if (action === "manage") setActiveComponent(<ManageQuestion />);
        else if (action === "staging") setActiveComponent(<StagingQuestion />);
      },
    },
    {
      id: "assignments",
      name: "Asset Deployment",
      icon: <Send size={20} />,
      onClick: () => openPopup(<Assignments onClose={closePopup} />),
    },
    {
      id: "notice",
      name: "Communication Hub",
      icon: <BellRing size={20} />,
      onClick: () => openPopup(<Notice onClose={closePopup} />),
    },
    {
      id: "feedbacks",
      name: "Insight Telemetry",
      icon: <MessageSquare size={20} />,
      onClick: () => openPopup(<Feedbacks onClose={closePopup} />),
    },
  ];

  const StatCard = ({ title, value, icon: Icon, colorClass, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-8 bg-white rounded-[40px] border border-slate-50 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all group"
    >
      <div className="flex items-center justify-between mb-6">
        <div className={`p-4 rounded-2xl ${colorClass.bg} ${colorClass.text} transition-all group-hover:scale-110`}>
          <Icon size={24} />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status</span>
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 text-emerald-500 text-[8px] font-bold uppercase tracking-tight border border-emerald-100/50">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
            Operational
          </span>
        </div>
      </div>
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</h4>
      <div className="text-4xl font-extrabold text-slate-900 tracking-tighter">
        {isLoading ? "---" : value}
      </div>
    </motion.div>
  );

  const PerformanceChart = () => {
    const chartData = {
      labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7"],
      datasets: [
        {
          label: "Assessment Frequency",
          data: [65, 85, 45, 95, 55, 110, 80],
          backgroundColor: "#4F46E5",
          borderRadius: 20,
          barThickness: 10,
        },
      ],
    };

    return (
      <div className="p-10 bg-white rounded-[40px] border border-slate-50 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Institutional Performance</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Cross-unit assessment frequency</p>
          </div>
          <div className="flex gap-2">
            {["Weekly", "Monthly"].map(tab => (
              <button key={tab} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${tab === "Weekly" ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64 mt-10">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { display: false },
                x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10, weight: '700' }, color: '#94a3b8' } }
              }
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex text-left font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(true)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        className="fixed lg:static inset-y-0 left-0 w-[300px] bg-white border-r border-slate-100 flex flex-col z-50 overflow-hidden"
      >
        <div className="p-10 border-b border-slate-50 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-2xl shadow-slate-200">
            E
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tighter leading-none">ExamPro</h1>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mt-1.5">Elite SuperUser</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-6 space-y-2 scrollbar-hide">
          {navItems.map((item) => (
            <div key={item.id} className="space-y-1">
              <button
                onClick={() => {
                  if (!item.children) item.onClick();
                  else setActiveComponent(<div className="p-20 text-center"><p className="text-slate-400 font-bold uppercase tracking-widest">Select an operation from {item.name}</p></div>);
                }}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${!item.children && !activeComponent && item.id === "dashboard" ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <span className={`${!item.children && !activeComponent && item.id === "dashboard" ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-900"}`}>
                  {item.icon}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest">{item.name}</span>
                {item.children && <ChevronDown size={14} className="ml-auto opacity-40" />}
              </button>

              {item.children && (
                <div className="ml-4 pl-4 border-l border-slate-50 space-y-1 mt-1 py-1">
                  {item.children.map((child, idx) => (
                    <button
                      key={idx}
                      onClick={() => item.onClick(child.action)}
                      className="w-full text-left px-6 py-3 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-100"
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-8 border-t border-slate-50 flex items-center gap-4 bg-slate-50/50">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
            <HelpCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest leading-none">Support Nexus</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">v4.2.0 Build</p>
          </div>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 px-10 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-slate-50 rounded-xl text-slate-500 hover:bg-slate-100 transition shadow-sm">
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center gap-3 bg-slate-50/50 px-5 py-2.5 rounded-2xl border border-slate-50 focus-within:bg-white focus-within:border-indigo-100 transition-all w-80 shadow-inner">
              <Search size={16} className="text-slate-400" />
              <input type="text" placeholder="Search protocol telemetry..." className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest placeholder:text-slate-300 w-full" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button onClick={() => setShowNotices(!showNotices)} className="w-12 h-12 bg-white border border-slate-50 rounded-2xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/50 transition-all relative">
                <Bell size={20} />
                {notices.length > 0 && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>}
              </button>
              <button onClick={() => openPopup(<Notice onClose={closePopup} />)} className="hidden sm:flex w-12 h-12 bg-white border border-slate-50 rounded-2xl items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/50 transition-all">
                <Send size={20} />
              </button>
            </div>

            <div className="h-10 w-px bg-slate-100 mx-2 hidden sm:block"></div>

            <div className="flex items-center gap-4 pl-2 h-full">
              <div className="flex flex-col items-end">
                <p className="text-xs font-extrabold text-slate-900 tracking-tight leading-none">{user?.name || "SuperUser"}</p>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Operations</p>
              </div>
              <div className="relative group">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold text-xs shadow-xl shadow-slate-200 border-4 border-white transition-all group-hover:scale-105 cursor-pointer">
                  {user?.name?.charAt(0).toUpperCase() || <User size={20} />}
                </div>
                <div className="absolute right-0 top-full mt-4 w-64 bg-white rounded-[32px] border border-slate-100 shadow-2xl p-6 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all">
                  <div className="border-b border-slate-50 pb-6 mb-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Authenticated Entity</p>
                    <p className="text-sm font-extrabold text-slate-900 truncate">{user?.email}</p>
                  </div>
                  <div className="space-y-4">
                    <button className="w-full flex items-center gap-3 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-900 transition">
                      <User size={16} className="text-slate-400" /> Identity Matrix
                    </button>
                    <button className="w-full flex items-center gap-3 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-900 transition">
                      <Settings size={16} className="text-slate-400" /> Platform Configuration
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-2 text-[10px] font-bold text-red-500 uppercase tracking-[0.2em] hover:text-red-600 transition pt-2">
                      <LogOut size={16} className="text-red-400" /> Deauthenticate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#fafbfc] relative scroll-smooth p-10">
          <AnimatePresence mode="wait">
            {activeComponent ? (
              <motion.div
                key="component"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-7xl mx-auto"
              >
                <div className="p-10 bg-white rounded-[44px] shadow-sm border border-slate-50 min-h-[60vh]">
                  <div className="mb-10 flex items-center justify-between border-b border-slate-50 pb-8">
                    <button onClick={() => setActiveComponent(null)} className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:gap-4 transition-all">
                      <ChevronRight size={16} className="rotate-180" /> Return to Command Center
                    </button>
                  </div>
                  {React.isValidElement(activeComponent)
                    ? React.cloneElement(activeComponent, { onClose: () => setActiveComponent(null) })
                    : activeComponent}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-7xl mx-auto space-y-10"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-l-4 border-slate-900 pl-8 py-2">
                  <div>
                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tighter">Command Center</h2>
                    <p className="text-sm text-slate-500 font-medium mt-2">Institutional oversight and assessment orchestration.</p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => openPopup(<CreateExam onClose={closePopup} />)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-100 flex items-center gap-3">
                      <Plus size={16} className="text-indigo-400" /> Deploy Protocol
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Entity Count" value={stats.totalParticipants} icon={Users} colorClass={{ bg: 'bg-emerald-50', text: 'text-emerald-500' }} delay={0.1} />
                  <StatCard title="Active Protocols" value={stats.ActiveExams} icon={FileText} colorClass={{ bg: 'bg-indigo-50', text: 'text-indigo-600' }} delay={0.2} />
                  <StatCard title="Organizational Units" value={stats.totalGroups} icon={Layers} colorClass={{ bg: 'bg-amber-50', text: 'text-amber-500' }} delay={0.3} />
                  <StatCard title="Knowledge Base" value={stats.totalExams * 5} icon={BookOpen} colorClass={{ bg: 'bg-slate-50', text: 'text-slate-900' }} delay={0.4} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 space-y-10">
                    <PerformanceChart />
                  </div>

                  <div className="space-y-6">
                    <div className="p-10 bg-slate-900 rounded-[40px] shadow-2xl shadow-indigo-100/30 text-white overflow-hidden relative group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-bl-[100px] transition-all group-hover:scale-150"></div>
                      <h3 className="text-lg font-extrabold tracking-tight mb-2">Protocol Deployment</h3>
                      <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-8">Rapid initialization sequence</p>
                      <div className="space-y-4">
                        {[
                          { name: 'Batch Asset Provisioning', icon: <Users size={14} />, action: () => openPopup(<CreateParticipant onClose={closePopup} />) },
                          { name: 'Group Hierarchy Setup', icon: <Layers size={14} />, action: () => openPopup(<CreateGroup onClose={closePopup} />) },
                          { name: 'Knowledge Module Forge', icon: <BookOpen size={14} />, action: () => openPopup(<CreateQuestion onClose={closePopup} />) }
                        ].map((btn, i) => (
                          <button key={i} onClick={btn.action} className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-slate-900 transition-all group/btn">
                            <div className="flex items-center gap-3">
                              <span className="text-indigo-400 group-hover/btn:text-indigo-600 transition-colors">{btn.icon}</span>
                              <span className="text-[10px] font-bold uppercase tracking-widest">{btn.name}</span>
                            </div>
                            <ChevronRight size={14} className="opacity-40" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-10 bg-white rounded-[40px] border border-slate-50 shadow-sm flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-[24px] flex items-center justify-center text-slate-200 mb-6">
                        <BarChart3 size={32} />
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">System Telemetry</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-wide leading-relaxed">
                        Complete auditing of institutional metrics and node performance.
                      </p>
                      <button className="mt-8 text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:gap-4 transition-all flex items-center gap-2">
                        View Master Report <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showNotices && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNotices(false)} className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-[60]" />
              <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed right-0 top-0 bottom-0 w-[400px] bg-white border-l border-slate-100 z-[70] shadow-2xl flex flex-col">
                <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Admin Signals</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Broadcast registry</p>
                  </div>
                  <button onClick={() => setShowNotices(false)} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition">
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-hide">
                  {notices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-[28px] flex items-center justify-center text-slate-200">
                        <BellRing size={32} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Zero Signals Identified</p>
                    </div>
                  ) : (
                    notices.map((n, i) => (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={n.id} className="p-6 bg-slate-50 rounded-3xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all group">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">A</div>
                          <div>
                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Administrator Broadcast</p>
                            <p className="text-[8px] font-bold text-slate-300">{new Date(n.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition">{n.title}</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{n.message}</p>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {popupComponent && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closePopup} />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="bg-white rounded-[44px] shadow-2xl relative">
                  <button className="absolute top-8 right-8 z-[110] p-2 text-slate-300 hover:text-red-500 transition" onClick={closePopup}><X size={24} /></button>
                  <div className="p-0">
                    {React.isValidElement(popupComponent)
                      ? React.cloneElement(popupComponent, { onClose: closePopup, open: true })
                      : popupComponent}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default SuperuserDashboard;