import { useEffect, useState } from "react";
import { fetchUploadedBatches } from "../../../utils/api";
import {
  Archive,
  Layers,
  FileText,
  Download,
  Clock,
  ChevronRight,
  Database,
  Search,
  CheckCircle2,
  Info
} from "lucide-react";
import { motion } from "framer-motion";

export default function ParticipantSummary() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadBatches = async () => {
      setLoading(true);
      try {
        const res = await fetchUploadedBatches();
        setBatches(res.batches || res.data || res || []);
      } catch (err) {
        console.error("Batch telemetry fetch failure:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBatches();
  }, []);

  const filteredBatches = batches.filter(b =>
    (b.batchCode || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.Group?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-bold text-slate-400">Loading batches...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-50">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Import Batches</h2>
          <p className="text-[10px] text-slate-400 font-bold mt-1">View history of participant imports.</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:border-indigo-100 transition-all w-full md:w-80 shadow-inner">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search batches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-[10px] font-bold placeholder:text-slate-300 w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBatches.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex flex-col items-center gap-4 opacity-20">
              <Database size={48} className="text-slate-400" />
              <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em]">No import batches found.</p>
            </div>
          </div>
        ) : (
          filteredBatches.map((b, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={b.id || i}
              className="p-8 bg-white border border-slate-50 rounded-[40px] shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Archive size={80} />
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-slate-200">
                  <CheckCircle2 size={24} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400">Batch Code</p>
                  <p className="text-sm font-black text-slate-900 tracking-tight">{b.batchCode}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-50">
                  <div className="flex items-center gap-3">
                    <Layers size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500">Group</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-900">{b.Group?.name || "Global Group"}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-50">
                  <div className="flex items-center gap-3">
                    <Clock size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500">Date</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-900">{new Date(b.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href={b.filePath}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-bold hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100"
                >
                  <Download size={14} /> Download File
                </a>
                <button className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-all border border-slate-50">
                  <Info size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
