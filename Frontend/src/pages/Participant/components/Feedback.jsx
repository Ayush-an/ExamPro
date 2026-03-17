import { useState } from "react";
import { sendParticipantFeedback } from "../../../utils/api";
import {
  MessageSquare,
  X,
  Send,
  CheckCircle2,
  Shield,
  Info,
  ChevronRight,
  Database,
  Layers,
  Activity,
  Zap,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function Feedback({ onClose }) {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast.error("Sentiment payload cannot be empty");
      return;
    }

    try {
      setLoading(true);
      await sendParticipantFeedback({ message: feedback });
      toast.success("Sentiment Transmitted Successfully");
      setFeedback("");
      if (onClose) onClose();
    } catch (err) {
      toast.error("Transmission Protocol Failure");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-[44px] shadow-2xl border border-slate-100 overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sentiment Terminal</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Direct institutional feedback and observation registry</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition shadow-sm"><X size={20} /></button>
          )}
        </div>

        <div className="p-10 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 ml-4">
              <HelpCircle size={14} className="text-indigo-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Transmission Briefing</span>
            </div>
            <textarea
              className="w-full p-8 bg-slate-50 border border-slate-50 rounded-[32px] focus:bg-white focus:border-indigo-100 outline-none text-[11px] font-bold uppercase tracking-widest transition-all min-h-[200px] shadow-inner placeholder:text-slate-300"
              placeholder="Document your observations, technical anomalies, or institutional suggestions..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>

          <div className="p-6 bg-indigo-50/50 rounded-[32px] border border-indigo-100 flex items-start gap-4">
            <Zap size={18} className="text-indigo-400 shrink-0" />
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide leading-relaxed">
              Your input is processed by our neural analysis engine to optimize institutional assessment protocols and infrastructure stability.
            </p>
          </div>
        </div>

        <div className="p-10 border-t border-slate-50 flex gap-4 bg-slate-50/30">
          {onClose && (
            <button onClick={onClose} className="px-8 py-5 bg-white border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:border-slate-300 transition shadow-sm">Abort Transmission</button>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-5 bg-slate-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-20"
          >
            <Send size={18} /> {loading ? "TRANSMITTING..." : "EXECUTE TRANSMISSION"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
