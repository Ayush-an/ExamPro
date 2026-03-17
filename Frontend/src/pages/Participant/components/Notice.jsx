import { useEffect, useState, Fragment } from "react";
import { fetchMyNotices } from "../../../utils/api";
import {
  BellRing,
  X,
  Clock,
  Info,
  Megaphone,
  Download,
  ExternalLink,
  ChevronRight,
  Shield,
  Calendar,
  Image as ImageIcon,
  FileText as FileIcon,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Notice({ onClose }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const res = await fetchMyNotices();
        setNotices(Array.isArray(res) ? res : (res.data || []));
      } catch (err) {
        setNotices([]);
      } finally {
        setLoading(false);
      }
    };
    loadNotices();
  }, []);

  const renderFile = (fileUrl, title) => {
    if (!fileUrl) return null;
    const fullUrl = `${import.meta.env.VITE_API_URL}${fileUrl}`;
    const ext = fileUrl.split(".").pop().toLowerCase();
    const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(ext);

    return (
      <div className="mt-6 p-4 bg-slate-50 rounded-3xl border border-slate-100 border-dotted group/asset">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isImage ? <ImageIcon size={14} className="text-indigo-400" /> : <FileIcon size={14} className="text-amber-400" />}
            <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Supplemental Asset ({ext.toUpperCase()})</span>
          </div>
          <a href={fullUrl} download className="p-2 bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition shadow-sm hover:scale-110">
            <Download size={14} />
          </a>
        </div>

        {isImage && (
          <div className="overflow-hidden rounded-2xl border border-white shadow-md">
            <img src={fullUrl} alt={title} className="w-full object-cover max-h-48 group-hover/asset:scale-105 transition-transform duration-500" />
          </div>
        )}

        {ext === "pdf" && (
          <div className="relative h-40 overflow-hidden rounded-2xl border border-white shadow-md bg-white flex flex-col items-center justify-center p-6 text-center">
            <FileIcon size={40} className="text-slate-100 mb-2" />
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Encrypted Document Signature Verified</p>
            <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="mt-4 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg">Open Terminal Viewer</a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden flex justify-end">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col"
      >
        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Signals</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Direct broadcast registry for all entity nodes</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition shadow-sm"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scanning Signal Feed...</p>
            </div>
          ) : notices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20">
              <BellRing size={48} className="text-slate-400" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Signal Feed Silent</p>
            </div>
          ) : (
            notices.map((n, idx) => (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={n.id}
                className="p-8 bg-slate-50 rounded-[40px] border border-transparent hover:border-indigo-100 hover:bg-white transition-all group"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <Megaphone size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 tracking-tight leading-tight group-hover:text-indigo-600 transition">{n.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={10} className="text-slate-300" />
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em]">{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed pl-13">
                  {n.message}
                </p>

                {renderFile(n.fileUrl, n.title)}

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between pl-13">
                  <div className="flex items-center gap-2">
                    <Shield size={10} className="text-indigo-300" />
                    <span className="text-[8px] font-black text-slate-200 uppercase tracking-widest">Verified Signature</span>
                  </div>
                  <button className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-600 transition flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    Archive Signal <ChevronRight size={12} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="p-10 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Feed Status: SYNCHRONIZED</p>
          </div>
          <button onClick={onClose} className="px-8 py-4 bg-slate-900 text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200">Close Panel</button>
        </div>
      </motion.div>
    </div>
  );
}
