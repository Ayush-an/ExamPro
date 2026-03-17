import { useEffect, useState } from "react";
import {
  Sun,
  Moon,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  Zap,
  Layout
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const toggleTheme = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  const organizationName = user?.organization?.name || "Organization";
  const participantName = user?.name || "Participant Node";
  const groupName = user?.group?.name || "Unassigned Unit";
  const avatarLetter = participantName ? participantName.charAt(0).toUpperCase() : "?";

  return (
    <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 px-10 flex items-center justify-between z-30 shrink-0 text-left">
      <div className="flex items-center gap-8">
        <div className="hidden lg:flex flex-col border-l-4 border-slate-900 pl-6 py-1">
          <h2 className="text-lg font-black text-slate-900 tracking-tighter leading-none">{organizationName}</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
            <Zap size={10} className="text-amber-500 fill-amber-500" /> {groupName} Registry
          </p>
        </div>

        <div className="hidden md:flex items-center gap-3 bg-slate-50/50 px-5 py-2.5 rounded-2xl border border-slate-50 focus-within:bg-white focus-within:border-indigo-100 transition-all w-80 shadow-inner">
          <Search size={16} className="text-slate-400" />
          <input type="text" placeholder="Search protocol telemetry..." className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest placeholder:text-slate-300 w-full" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex gap-2">
          <button onClick={toggleTheme} className="w-12 h-12 bg-white border border-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/50 transition-all">
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="w-12 h-12 bg-white border border-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/50 transition-all relative">
            <Bell size={20} />
            <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-500 border-2 border-white shadow-sm"></span>
          </button>
        </div>

        <div className="h-10 w-px bg-slate-100 mx-2 hidden sm:block"></div>

        <div className="flex items-center gap-4 pl-2 h-full">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-xs font-black text-slate-900 tracking-tight leading-none">{participantName}</p>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Active Entity</p>
          </div>

          <div className="relative group">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-xl shadow-slate-200 border-4 border-white transition-all group-hover:scale-105 cursor-pointer">
              {avatarLetter}
            </div>

            <div className="absolute right-0 top-full mt-4 w-64 bg-white rounded-[32px] border border-slate-100 shadow-2xl p-6 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all">
              <div className="border-b border-slate-50 pb-6 mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Authenticated Node</p>
                <p className="text-sm font-extrabold text-slate-900 truncate">{user?.email || "entity@exampro.com"}</p>
              </div>
              <div className="space-y-4">
                <button className="w-full flex items-center gap-3 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-900 transition">
                  <User size={16} className="text-slate-400" /> Identity Matrix
                </button>
                <button className="w-full flex items-center gap-3 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-900 transition">
                  <ShieldCheck size={16} className="text-slate-400" /> Access Protocol
                </button>
                <button className="w-full flex items-center gap-3 px-2 text-[10px] font-bold text-red-500 uppercase tracking-[0.2em] hover:text-red-600 transition pt-2 border-t border-slate-50 mt-4 outline-none">
                  <LogOut size={16} className="text-red-400" /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}