import React, { useEffect, useState } from "react";
import { fetchQuestionHistory } from "../../../utils/api";
import { format } from "date-fns";
import { FileText, Search, UserCircle, Activity, Filter, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

export default function QuestionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [action, setAction] = useState("");
  const [fileCode, setFileCode] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await fetchQuestionHistory({
        action: action || undefined,
        file_code: fileCode || undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
      });
      setHistory(res?.data || []);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [action, fileCode, dateFrom, dateTo]);

  const getActionBadge = (act) => {
    const map = {
      CREATE: "bg-emerald-50 text-emerald-700 border-emerald-200",
      UPDATE: "bg-amber-50 text-amber-700 border-amber-200",
      DELETE: "bg-rose-50 text-rose-700 border-rose-200",
      UPLOAD: "bg-indigo-50 text-indigo-700 border-indigo-200",
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-bold rounded border ${map[act] || "bg-slate-50 text-slate-500"}`}>
        {act}
      </span>
    );
  };

  const formatDetail = (detail) => {
    if (!detail) return "—";
    if (typeof detail !== "object") return String(detail);
    
    // Quick concise summaries
    const parts = [];
    if (detail.total) parts.push(`Total: ${detail.total}, Errs: ${detail.errors}`);
    if (detail.method) parts.push(`Source: ${detail.method}`);
    if (detail.issues?.length) parts.push(`Issues: ${detail.issues.length}`);
    if (detail.question_id) parts.push(`QID: ${detail.question_id}`);
    
    return parts.length > 0 ? parts.join(" | ") : JSON.stringify(detail).substring(0, 100);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-500" /> Question History
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Audit log of all question creations, edits, and bulk uploads.</p>
        </div>
        <button onClick={loadHistory} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Refresh">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 border border-slate-200 rounded-xl">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            className="bg-transparent text-sm font-medium text-slate-600 focus:outline-none"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="UPLOAD">Upload</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 border border-slate-200 rounded-xl flex-1 max-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search XX#### File Code"
            className="bg-transparent text-sm font-medium text-slate-800 focus:outline-none placeholder-slate-400 w-full uppercase"
            value={fileCode}
            onChange={(e) => setFileCode(e.target.value.toUpperCase())}
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 border border-slate-200 rounded-xl">
          <span className="text-xs font-bold text-slate-400">From</span>
          <input
            type="date"
            className="bg-transparent text-sm font-medium text-slate-600 focus:outline-none"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 border border-slate-200 rounded-xl">
          <span className="text-xs font-bold text-slate-400">To</span>
          <input
            type="date"
            className="bg-transparent text-sm font-medium text-slate-600 focus:outline-none"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium">No history records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4 text-left font-bold text-slate-500 uppercase text-xs tracking-wider">Date/Time</th>
                  <th className="px-5 py-4 text-left font-bold text-slate-500 uppercase text-xs tracking-wider">Action</th>
                  <th className="px-5 py-4 text-left font-bold text-slate-500 uppercase text-xs tracking-wider">Entity Name / Snippet</th>
                  <th className="px-5 py-4 text-left font-bold text-slate-500 uppercase text-xs tracking-wider">File Origin</th>
                  <th className="px-5 py-4 text-left font-bold text-slate-500 uppercase text-xs tracking-wider">Changed By</th>
                  <th className="px-5 py-4 text-left font-bold text-slate-500 uppercase text-xs tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {format(new Date(record.changed_at), "MMM d, yyyy • h:mm a")}
                    </td>
                    <td className="px-5 py-3">{getActionBadge(record.action)}</td>
                    <td className="px-5 py-3 font-medium text-slate-800 truncate max-w-[180px]">
                      {record.entity_name || "—"}
                    </td>
                    <td className="px-5 py-3 text-xs">
                      {record.file_code ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-md font-mono">{record.file_code}</span>
                          <span className="text-slate-500 truncate max-w-[120px]" title={record.file_name}>{record.file_name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Manual</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-slate-600 font-medium text-xs">
                        <UserCircle className="w-4 h-4 text-slate-400" />
                        {record.changed_by_name || `#${record.changed_by_id}`}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500 font-mono truncate max-w-[200px]" title={JSON.stringify(record.detail)}>
                      {formatDetail(record.detail)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
