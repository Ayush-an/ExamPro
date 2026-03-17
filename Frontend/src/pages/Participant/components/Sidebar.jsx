import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  UserCircle2,
  MessageSquare,
  BellRing,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  HelpingHand,
  Settings,
  X
} from "lucide-react";
import { useState } from "react";
import FeedbackPopup from "./Feedback";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
  const today = new Date();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [isFeedbackPopupOpen, setIsFeedbackPopupOpen] = useState(false);

  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" });
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const calendarDays = [...Array(firstDayIndex).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];

  const prevMonth = () => {
    setCurrentMonth((m) => {
      if (m === 0) { setCurrentYear((y) => y - 1); return 11; }
      return m - 1;
    });
  };

  const nextMonth = () => {
    setCurrentMonth((m) => {
      if (m === 11) { setCurrentYear((y) => y + 1); return 0; }
      return m + 1;
    });
  };

  const navItems = [
    { id: "dashboard", name: "Command Center", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "performance", name: "Analytics", path: "/performance", icon: <BarChart3 size={18} /> },
    { id: "profile", name: "Identity Matrix", path: "/profile", icon: <UserCircle2 size={18} /> },
    { id: "feedback", name: "Sentiment Output", onClick: () => setIsFeedbackPopupOpen(true), icon: <MessageSquare size={18} /> },
  ];

  return (
    <aside className="w-[280px] bg-white border-r border-slate-100 flex flex-col h-screen shrink-0 relative z-50 overflow-hidden text-left">
      {/* Brand */}
      <div className="p-10 border-b border-slate-50 flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-xl shadow-slate-200">
          E
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 tracking-tighter leading-none">ExamPro</h1>
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mt-1.5">Elite Entity</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-6 space-y-2 scrollbar-hide">
        {navItems.map((item) => (
          item.path ? (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${location.pathname === item.path ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              <span className={`${location.pathname === item.path ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-900"}`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{item.name}</span>
            </Link>
          ) : (
            <button
              key={item.id}
              onClick={item.onClick}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all group"
            >
              <span className="text-slate-400 group-hover:text-slate-900">{item.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{item.name}</span>
            </button>
          )
        ))}
      </nav>

      {/* Calendar Section */}
      <div className="p-8 space-y-6">
        <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 shadow-inner">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition shadow-sm border border-slate-100">
              <ChevronLeft size={14} />
            </button>
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest leading-none">{monthName}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{currentYear}</p>
            </div>
            <button onClick={nextMonth} className="p-2 bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition shadow-sm border border-slate-100">
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-[8px] font-black text-slate-300 uppercase text-center mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => <div key={`${d}-${idx}`}>{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((day, i) => {
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              if (day === null) return <div key={i}></div>;
              return (
                <div key={i} className={`py-1.5 rounded-lg text-[9px] font-bold transition-all ${isToday ? 'bg-slate-900 text-white shadow-lg scale-110' : 'text-slate-500 hover:bg-white hover:text-indigo-600 cursor-default'}`}>
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-8 border-t border-slate-50 flex flex-col gap-2 bg-slate-50/50">
        <Link to="/logout" className="flex items-center gap-4 px-6 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-bold text-[10px] uppercase tracking-widest group">
          <LogOut size={18} className="text-rose-400" />
          Deauthenticate
        </Link>
      </div>

      <AnimatePresence>
        {isFeedbackPopupOpen && (
          <FeedbackPopup onClose={() => setIsFeedbackPopupOpen(false)} />
        )}
      </AnimatePresence>
    </aside>
  );
}
