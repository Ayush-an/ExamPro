import { useEffect, useState } from "react";
import { fetchQuestionBatches } from "../../../utils/api";
import { Database, Download, FileText, Calendar, Hash } from "lucide-react";

export default function QuestionSummary() {
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    fetchQuestionBatches().then((res) => setBatches(res.batches));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-50">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Upload History</h2>
          <p className="text-[10px] text-slate-400 font-bold mt-1">Review and manage question upload batches.</p>
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 tracking-wide">Batch Code</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 tracking-wide">Exam</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 tracking-wide text-right">File</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {batches.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <Database size={48} className="text-slate-400" />
                    <p className="text-[10px] font-bold text-slate-400">No upload batches found</p>
                  </div>
                </td>
              </tr>
            ) : (
              batches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Hash size={14} />
                      </div>
                      <span className="text-[10px] font-black text-slate-900">{b.uploadBatchCode}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                        <FileText size={14} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600">{b.Exam?.title}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <a
                      href={b.filePath}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black hover:bg-black transition shadow-sm"
                    >
                      <Download size={14} /> Download
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
