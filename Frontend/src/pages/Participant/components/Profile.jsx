import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { updateMyProfile } from "../../../utils/api";
import {
  User,
  Mail,
  Smartphone,
  ShieldCheck,
  Calendar,
  Activity,
  Edit3,
  Save,
  X,
  Zap,
  Layers,
  Database,
  Info,
  CheckCircle2,
  Lock,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", mobile: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/participant/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setProfile(data.data);
          setForm({
            name: data.data.name || "",
            email: data.data.email || "",
            mobile: data.data.mobile || "",
          });
        }
      } catch (err) {
        toast.error("Identity synchronization failed");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-left">
      <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Retrieving Neural Identity...</p>
    </div>
  );

  const avatar = profile?.name?.charAt(0).toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await updateMyProfile({
        email: form.email,
        mobile: form.mobile,
      });

      if (data.success) {
        toast.success("Identity Matrix Successfully Updated");
        setProfile((prev) => ({ ...prev, ...data.data }));
        setEdit(false);
      } else {
        toast.error(data.message || "Update Protocol Failure");
      }
    } catch (err) {
      toast.error("Security Authentication Expired");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10 text-left animate-in fade-in duration-500 pb-20">
      {/* HUD Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tighter">Identity Matrix</h2>
          <p className="text-sm text-slate-500 font-medium mt-2">Personal identifier and institutional telemetry associations.</p>
        </div>
        <div className="px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Lock size={14} className="text-indigo-400" /> End-to-End Encrypted
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Identity Card */}
        <div className="space-y-6">
          <div className="p-10 bg-white border border-slate-50 rounded-[44px] shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
            <div className="w-32 h-32 bg-slate-900 rounded-[40px] flex items-center justify-center text-white font-black text-5xl shadow-2xl shadow-indigo-100 border-8 border-white group-hover:rotate-6 transition-transform">
              {avatar}
            </div>
            <div className="mt-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{profile.name}</h3>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.3em] mt-2">Institutional Entity</p>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-50 w-full flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-100">{profile.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entry Date</span>
                <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{new Date(profile.dateOfJoin).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-900 rounded-[44px] text-white shadow-xl shadow-slate-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-indigo-300">
                <Layers size={20} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest leading-none">Registry Unit</p>
                <p className="text-sm font-black tracking-tight mt-1">{profile.Group?.name || "Independent Entity"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-indigo-300">
                <Database size={20} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest leading-none">Authority</p>
                <p className="text-sm font-black tracking-tight mt-1">{profile.Organization?.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Operational Parameters */}
        <div className="lg:col-span-2 space-y-10">
          <div className="p-10 bg-white border border-slate-50 rounded-[44px] shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Core Telemetry</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Direct communication and identification indices</p>
              </div>
              <button onClick={() => setEdit(!edit)} className={`p-4 rounded-2xl transition-all ${edit ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400 hover:text-slate-900'}`}>
                {edit ? <X size={20} /> : <Edit3 size={20} />}
              </button>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Legal Identifier</label>
                  <div className="relative">
                    <input disabled className="w-full px-14 py-5 bg-slate-50 border border-slate-100 rounded-[28px] text-[10px] font-bold uppercase tracking-widest text-slate-400 cursor-not-allowed outline-none shadow-inner" value={form.name} />
                    <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Communication Index (Email)</label>
                  <div className="relative">
                    <input disabled={!edit} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`w-full px-14 py-5 rounded-[28px] text-[10px] font-bold uppercase tracking-widest transition-all outline-none shadow-inner ${edit ? 'bg-white border-indigo-100 border-2 text-slate-900' : 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'}`} value={form.email} />
                    <Mail size={18} className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${edit ? 'text-indigo-400' : 'text-slate-300'}`} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Telecommunication Link (Mobile)</label>
                <div className="relative">
                  <input disabled={!edit} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className={`w-full px-14 py-5 rounded-[28px] text-[10px] font-bold uppercase tracking-widest transition-all outline-none shadow-inner ${edit ? 'bg-white border-indigo-100 border-2 text-slate-900' : 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'}`} value={form.mobile} />
                  <Smartphone size={18} className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${edit ? 'text-indigo-400' : 'text-slate-300'}`} />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {edit && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-10 overflow-hidden">
                  <button onClick={handleSave} disabled={saving} className="w-full py-6 bg-slate-900 text-white rounded-[32px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-3">
                    <Save size={18} /> {saving ? 'TRANSMITTING...' : 'SAVE IDENTITY CHANGES'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-10 bg-indigo-50/50 rounded-[44px] border border-indigo-100 flex items-start gap-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-40 rounded-bl-[60px] blur-2xl"></div>
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-lg border border-indigo-100 group-hover:rotate-12 transition-transform shrink-0">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h4 className="text-lg font-black text-indigo-900 tracking-tight">Security Protocol Verification</h4>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-2 leading-relaxed">
                Your identity matrix is synchronized with the institutional authority. Any unauthorized changes to core identity fields must be requested via direct institutional proxy.
              </p>
              <button className="mt-6 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-4 transition-all group">
                Request Authority Override <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
