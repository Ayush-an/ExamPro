import React from "react";
import { User, Mail, ShieldCheck, LogOut, Settings, Bell, Info } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SuperAdminProfilePopup = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    onClose();
  };

  const photo = user?.photo
    ? `${import.meta.env.VITE_API_URL}/uploads/superadmin/${user.photo}`
    : "https://i.pravatar.cc/100";

  return (
    <div className="w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
      {/* Header / Cover */}
      <div className="h-24 bg-linear-to-r from-indigo-600 to-violet-600 relative">
         <button 
           onClick={onClose}
           className="absolute top-4 right-4 text-white/80 hover:text-white transition"
         >
           <Info size={18} />
         </button>
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-6 -mt-12 text-center relative z-10">
        <div className="inline-block p-1 bg-white rounded-2xl shadow-lg mb-4">
          <img
            src={photo}
            alt="Profile"
            className="w-20 h-20 rounded-xl object-cover"
          />
        </div>
        
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          {user?.name || user?.full_name || "Super Admin"}
        </h2>
        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1 flex items-center justify-center gap-1">
          <ShieldCheck size={12} /> {user?.role || "Global Administrator"}
        </p>

        <div className="mt-6 space-y-2">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-left transition hover:bg-slate-100">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm">
              <Mail size={16} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</span>
              <span className="text-sm font-semibold text-slate-700 truncate">{user?.email}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <button 
            onClick={() => { navigate("/superadmin/profile"); onClose(); }}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition shadow-sm">
              <Settings size={20} />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Settings</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition group">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition shadow-sm">
              <Bell size={20} />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Alerts</span>
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-6 py-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition"
        >
          <LogOut size={18} /> Sign Out System
        </button>
      </div>

      <div className="bg-slate-50 py-3 px-6 border-t border-slate-100 flex justify-center italic text-[10px] text-slate-400 font-medium">
        Authenticated Session • System Secure
      </div>
    </div>
  );
};

export default SuperAdminProfilePopup;
