import { useState } from "react";
import { createGroup } from "../../../utils/api";
import {
  Plus,
  X,
  Layers,
  FileText,
  Calendar,
  Clock,
  Shield,
  Info,
  ChevronRight,
  Database,
  Send,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function CreateGroup({ onClose }) {
  const [group, setGroup] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setGroup({ ...group, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: false });
  };

  const validate = () => {
    const err = {};
    if (!group.name) err.name = true;
    if (!group.startDate) err.startDate = true;
    if (!group.endDate) err.endDate = true;
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return toast.error("Institutional parameters incomplete");

    setLoading(true);
    try {
      await createGroup(group);
      toast.success("Functional unit deployed successfully!");
      onClose();
    } catch (err) {
      toast.error(`Deployment Protocol Failure: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-0 text-left">
      <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10 rounded-t-[44px]">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Provision Unit</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Creation of a new functional organizational unit</p>
        </div>
        <button onClick={onClose} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition"><X size={20} /></button>
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Unit Identification</label>
            <input
              type="text"
              name="name"
              placeholder="Ex: Strategic Intelligence Division"
              className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold uppercase tracking-widest transition-all shadow-inner ${errors.name ? 'border-rose-200 bg-rose-50' : 'border-slate-50'}`}
              value={group.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Operational Briefing (Description)</label>
            <textarea
              name="description"
              placeholder="Functional objectives and unit constraints..."
              className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold uppercase tracking-widest transition-all min-h-[100px] shadow-inner"
              value={group.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Activation Timestamp</label>
              <div className="relative group/input">
                <input
                  type="date"
                  name="startDate"
                  className={`w-full px-14 py-4 bg-slate-50 border rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold uppercase tracking-widest transition-all shadow-inner ${errors.startDate ? 'border-rose-200 bg-rose-50' : 'border-slate-50'}`}
                  value={group.startDate}
                  onChange={handleChange}
                  required
                />
                <Calendar size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Deactivation Timestamp</label>
              <div className="relative group/input">
                <input
                  type="date"
                  name="endDate"
                  className={`w-full px-14 py-4 bg-slate-50 border rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold uppercase tracking-widest transition-all shadow-inner ${errors.endDate ? 'border-rose-200 bg-rose-50' : 'border-slate-50'}`}
                  value={group.endDate}
                  onChange={handleChange}
                  required
                />
                <Clock size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-rose-500 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4 sticky bottom-0 bg-white py-4 border-t border-slate-50">
          <button type="button" onClick={onClose} className="px-8 py-5 bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-100 transition-all border border-slate-100">Abort Provisioning</button>
          <button type="submit" disabled={loading} className="flex-1 px-8 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-indigo-50/50 flex items-center justify-center gap-3">
            <Database size={16} /> {loading ? 'Deploying...' : 'Deploy Unit'}
          </button>
        </div>
      </form>
    </div>
  );
}
