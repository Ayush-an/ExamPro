import React, { useEffect, useState } from "react";
import {
  fetchStagingParticipants,
  updateStagingParticipant,
  approveStagingParticipant,
  approveAllStagingBatch,
  fetchGroups,
} from "../../../utils/api";
import { AlertTriangle, CheckCircle, Edit2, X, RefreshCw, CheckSquare } from "lucide-react";
import { toast } from "react-hot-toast";

const fmtDate = (d) => d ? new Date(d).toLocaleString() : "—";

const IssueBadge = ({ issues }) => {
  if (!issues || !issues.length) return <span className="text-xs text-emerald-600 font-semibold">None</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {issues.map((iss, i) => (
        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-full">
          <AlertTriangle className="w-3 h-3" /> {iss}
        </span>
      ))}
    </div>
  );
};

export default function StagingParticipant() {
  const [records, setRecords] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ERROR");

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ full_name: "", email: "", mobile: "", group_id: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      // Fetch ERROR rows (default from backend)
      const res = await fetchStagingParticipants({ all: statusFilter === "ALL" ? "true" : undefined });
      setRecords(res?.data?.participants || []);
      setGroups(res?.data?.groups || []);
    } catch {
      toast.error("Failed to load staging data");
    } finally {
      setLoading(false);
    }
  };

  const reload = async () => {
    try {
      const res = await fetchStagingParticipants({ all: statusFilter === "ALL" ? "true" : undefined });
      setRecords(res?.data?.participants || []);
      setGroups(res?.data?.groups || []);
    } catch { /* silent */ }
  };

  // Derived filtered list
  const filtered = records.filter((r) => {
    const s = search.toLowerCase();
    const matchSearch = !s || `${r.full_name} ${r.email} ${r.mobile}`.toLowerCase().includes(s);
    const matchBatch = !batchFilter || r.batch_code === batchFilter;
    const matchStatus = statusFilter === "ALL" || r.status_code === statusFilter;
    return matchSearch && matchBatch && matchStatus;
  });

  // Unique batch codes for filter dropdown
  const batches = [...new Set(records.map((r) => r.batch_code).filter(Boolean))];

  /* ── Edit ── */
  const openEdit = (rec) => {
    setEditing(rec);
    setForm({ full_name: rec.full_name, email: rec.email, mobile: rec.mobile || "", group_id: rec.group_id || "" });
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateStagingParticipant(editing.id, form);
      toast.success(result.message);
      setEditOpen(false);
      await reload();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ── Approve single ── */
  const handleApprove = async (rec) => {
    if (rec.status_code === "ERROR") {
      toast.error("Fix all issues before approving");
      return;
    }
    try {
      const res = await approveStagingParticipant(rec.id);
      toast.success(res.message || "Approved!");
      await reload();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Approval failed");
    }
  };

  /* ── Approve all in batch ── */
  const handleApproveAll = async (batchCode) => {
    if (!batchCode) return toast.error("Select a batch first");
    if (!window.confirm(`Approve all PENDING records in batch ${batchCode}?`)) return;
    try {
      const res = await approveAllStagingBatch(batchCode);
      toast.success(res.message || "Batch approved!");
      await reload();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Batch approval failed");
    }
  };

  const statusBadge = (s) => {
    const map = {
      ERROR: "bg-rose-50 text-rose-700 border-rose-200",
      PENDING: "bg-amber-50 text-amber-700 border-amber-200",
      APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${map[s] || "bg-slate-50 text-slate-500"}`}>
        {s}
      </span>
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Staging Participants</h2>
          <p className="text-sm text-slate-500 mt-0.5">Fix validation issues before promoting records to active participants.</p>
        </div>
        <button onClick={loadAll} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-wrap items-center gap-3">
        <select
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setTimeout(loadAll, 0); }}
        >
          <option value="ERROR">⚠ Issues Only</option>
          <option value="PENDING">✓ Ready to Approve</option>
          <option value="APPROVED">✅ Approved</option>
          <option value="ALL">All Records</option>
        </select>

        <select
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
        >
          <option value="">All Batches</option>
          {batches.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>

        <input
          type="text"
          placeholder="Search name / email / mobile…"
          className="flex-1 min-w-[180px] px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {batchFilter && (
          <button
            onClick={() => handleApproveAll(batchFilter)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2"
          >
            <CheckSquare className="w-4 h-4" /> Approve All Pending in Batch
          </button>
        )}
      </div>

      {/* Summary bar */}
      {!loading && (
        <div className="flex gap-4 mb-4">
          {[
            { label: "Total", count: records.length, color: "bg-slate-100 text-slate-700" },
            { label: "Issues", count: records.filter(r => r.status_code === "ERROR").length, color: "bg-rose-100 text-rose-700" },
            { label: "Ready", count: records.filter(r => r.status_code === "PENDING").length, color: "bg-amber-100 text-amber-700" },
            { label: "Approved", count: records.filter(r => r.status_code === "APPROVED").length, color: "bg-emerald-100 text-emerald-700" },
          ].map(({ label, count, color }) => (
            <div key={label} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${color}`}>
              {label}: {count}
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 text-slate-500">Loading…</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {["#", "File Code", "File Name", "Batch", "Group", "Name", "Email", "Mobile", "Status", "Issues", "Created", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-400  tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan="12" className="py-12 text-center text-slate-400 font-medium">
                  {statusFilter === "ERROR" ? "✅ No issue records — all clean!" : "No records found."}
                </td></tr>
              ) : filtered.map((r, i) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3 text-slate-500 text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded font-mono">{r.file_code || "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 max-w-[140px] truncate" title={r.file_name}>{r.file_name || "—"}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-500">{r.batch_code}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{r.groupName || `#${r.group_id}`}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{r.full_name}</td>
                  <td className="px-4 py-3 text-indigo-600">{r.email}</td>
                  <td className="px-4 py-3 text-slate-600">{r.mobile || "—"}</td>
                  <td className="px-4 py-3">{statusBadge(r.status_code)}</td>
                  <td className="px-4 py-3 max-w-[220px]">
                    <IssueBadge issues={Array.isArray(r.issues) ? r.issues : r.issues ? JSON.parse(r.issues) : []} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{fmtDate(r.created_at)}</td>
                  <td className="px-4 py-3 whitespace-nowrap flex items-center gap-2">
                    <button title="Edit" onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {r.status_code === "PENDING" && (
                      <button title="Approve" onClick={() => handleApprove(r)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editOpen && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] p-8 w-[480px] shadow-2xl relative">
            <button onClick={() => setEditOpen(false)} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-xl font-extrabold text-slate-900 mb-1">Fix Participant Record</h3>
            <p className="text-xs text-slate-400 mb-5 font-mono">Batch: {editing.batch_code} · File: {editing.file_code}</p>

            <div className="space-y-4">
              {[
                { label: "Full Name", field: "full_name", type: "text", placeholder: "John Doe" },
                { label: "Email Address", field: "email", type: "email", placeholder: "john@example.com" },
                { label: "Mobile Number", field: "mobile", type: "text", placeholder: "9876543210 (optional)" },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</label>
                  <input
                    type={type}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 placeholder-slate-400 text-sm"
                    placeholder={placeholder}
                    value={form[field]}
                    onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Group</label>
                <select
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.group_id}
                  onChange={(e) => setForm((p) => ({ ...p, group_id: e.target.value }))}
                >
                  <option value="">— Select Group —</option>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-100">
              <button onClick={() => setEditOpen(false)} className="px-5 py-2.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition text-sm disabled:opacity-60">
                {saving ? "Saving…" : "Save & Re-validate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}