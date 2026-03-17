import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchOrganizations } from "../../../utils/api";
import {
  User,
  Mail,
  Smartphone,
  Building2,
  Lock,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowLeft,
  CheckCircle2,
  Database,
  Layers,
  Key
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function Signup() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadOrgs = async () => {
      try {
        const orgs = await fetchOrganizations();
        const sortedOrgs = (orgs || []).sort((a, b) => a.name.localeCompare(b.name));
        setOrganizations(sortedOrgs);
      } catch (err) {
        toast.error("Institutional Link Registry Sync Failed");
      }
    };
    loadOrgs();
  }, []);

  const register = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Neural Identity Successfully Provisioned");
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center p-8 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="w-full max-w-6xl bg-white rounded-[64px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[85vh] relative text-left">

        {/* Left Side: Brand & HUD */}
        <div className="w-full md:w-5/12 bg-slate-900 p-16 flex flex-col justify-between relative overflow-hidden">
          {/* HUD Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-bl-[200px] blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-tr-[300px] blur-3xl"></div>

          <Link to="/" className="relative z-10 flex items-center gap-4 group w-fit">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform">E</div>
            <div>
              <h2 className="text-xl font-black text-white tracking-widest leading-none">EXAMPRO</h2>
              <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-[0.4em] mt-1.5 underline-offset-4 underline decoration-indigo-400/50">Intelligence Matrix</p>
            </div>
          </Link>

          <div className="relative z-10 space-y-10 py-10">
            <div className="space-y-4">
              <h1 className="text-5xl font-black text-white tracking-tighter leading-[1.1]">Join the<br /><span className="text-indigo-400">Elite Entity</span> Registry.</h1>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs">Provision your neural identity to access the global mission assessment stream.</p>
            </div>

            <div className="space-y-6">
              {[
                { icon: <ShieldCheck size={18} />, title: "Identity Encryption", desc: "Military-grade neural signature" },
                { icon: <Zap size={18} />, title: "Instant Linkage", desc: "Direct institutional synchronization" },
                { icon: <Database size={18} />, title: "Secure Archive", desc: "Lifecycle mission telemetry recorded" }
              ].map((feat, i) => (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + (i * 0.1) }} key={i} className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">{feat.icon}</div>
                  <div>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{feat.title}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Institutional Protocol: ACTIVE</p>
          </div>
        </div>

        {/* Right Side: Setup Flow */}
        <div className="w-full md:w-7/12 p-16 md:p-24 overflow-y-auto scrollbar-hide flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-12">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Initialize Identity</h2>
              <p className="text-sm text-slate-400 font-medium mt-2">Enter your credential parameters to begin synchronization.</p>
            </div>

            <form onSubmit={register} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 group/input">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 group-focus-within/input:text-indigo-600 transition-colors">Legal Identification</label>
                  <div className="relative">
                    <input type="text" placeholder="Full Name" required className="w-full pl-14 pr-7 py-5 bg-slate-50 border-2 border-transparent rounded-[28px] text-[10px] font-black uppercase tracking-widest transition-all outline-none focus:bg-white focus:border-indigo-100 shadow-inner" />
                    <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-indigo-600 transition-colors" />
                  </div>
                </div>

                <div className="space-y-2 group/input">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 group-focus-within/input:text-indigo-600 transition-colors">Digital Handle (Email)</label>
                  <div className="relative">
                    <input type="email" placeholder="email@address.net" required className="w-full pl-14 pr-7 py-5 bg-slate-50 border-2 border-transparent rounded-[28px] text-[10px] font-black uppercase tracking-widest transition-all outline-none focus:bg-white focus:border-indigo-100 shadow-inner" />
                    <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-indigo-600 transition-colors" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 group/input">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 group-focus-within/input:text-indigo-600 transition-colors">Mobile Telemetry</label>
                  <div className="relative">
                    <input type="text" placeholder="+X (XXX) XXX-XXXX" required className="w-full pl-14 pr-7 py-5 bg-slate-50 border-2 border-transparent rounded-[28px] text-[10px] font-black uppercase tracking-widest transition-all outline-none focus:bg-white focus:border-indigo-100 shadow-inner" />
                    <Smartphone size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-indigo-600 transition-colors" />
                  </div>
                </div>

                <div className="space-y-2 group/input">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 group-focus-within/input:text-indigo-600 transition-colors">Institutional Link</label>
                  <div className="relative">
                    <select required className="w-full pl-14 pr-10 py-5 bg-slate-50 border-2 border-transparent rounded-[28px] text-[10px] font-black uppercase tracking-widest appearance-none transition-all outline-none focus:bg-white focus:border-indigo-100 shadow-inner cursor-pointer">
                      <option value="">Select Organization</option>
                      {organizations.map((org) => (
                        <option key={org.id || org._id} value={org.id || org._id}>{org.name}</option>
                      ))}
                    </select>
                    <Building2 size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-indigo-600 transition-colors pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 group/input">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 group-focus-within/input:text-indigo-600 transition-colors">Access Pin (Pass)</label>
                  <div className="relative">
                    <input type="password" placeholder="••••••••" required className="w-full pl-14 pr-7 py-5 bg-slate-50 border-2 border-transparent rounded-[28px] text-[10px] font-black uppercase tracking-widest transition-all outline-none focus:bg-white focus:border-indigo-100 shadow-inner" />
                    <Key size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-indigo-600 transition-colors" />
                  </div>
                </div>
                <div className="space-y-2 group/input">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 group-focus-within/input:text-indigo-600 transition-colors">Verify Access Pin</label>
                  <div className="relative">
                    <input type="password" placeholder="••••••••" required className="w-full pl-14 pr-7 py-5 bg-slate-50 border-2 border-transparent rounded-[28px] text-[10px] font-black uppercase tracking-widest transition-all outline-none focus:bg-white focus:border-indigo-100 shadow-inner" />
                    <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-indigo-600 transition-colors" />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" disabled={loading} className="w-full py-6 bg-slate-900 text-white rounded-[32px] text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl shadow-slate-200 hover:bg-black transition-all active:scale-[0.98] group/btn">
                  {loading ? 'SYNCHRONIZING...' : 'PROVISION IDENTITY'} <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>

            <div className="mt-12 text-center">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                Already an active entity? <Link to="/login" className="text-indigo-600 font-black hover:underline underline-offset-4 ml-2">Return to Login</Link>
              </p>
            </div>

            <div className="mt-16 flex items-center gap-4 p-5 bg-slate-50 rounded-[32px] border border-slate-100 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 bg-white opacity-40 rounded-bl-3xl blur-xl"></div>
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-400 shadow-sm shrink-0">
                <Info size={18} />
              </div>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                By provisioning an identity, you agree to the Institutional Data Protocol and Neural Integrity Agreements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
