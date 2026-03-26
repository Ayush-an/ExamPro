import { useState, useEffect } from "react";
import {
  fetchGroups,
  createParticipant,
  uploadParticipantsExcelWithMeta,
} from "../../../utils/api";
import { toast } from "react-hot-toast";
import { X, UploadCloud, FileSpreadsheet, UserPlus, CheckSquare, Square, RefreshCw } from "lucide-react";

// Generate a preview code on the frontend (mirrors backend logic)
function previewFileCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const l1 = letters[Math.floor(Math.random() * 26)];
  const l2 = letters[Math.floor(Math.random() * 26)];
  const digits = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `${l1}${l2}${digits}`;
}

export default function CreateParticipant({ onClose, onSuccess }) {
  const [groups, setGroups] = useState([]);

  // Multi-group selection (checkboxes)
  const [selectedGroups, setSelectedGroups] = useState([]);

  // Excel / CSV upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState(""); // editable file name
  const [fileCodePreview, setFileCodePreview] = useState(previewFileCode());
  const [uploading, setUploading] = useState(false);

  // Single participant form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    loadGroups();
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  const loadGroups = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const orgId = user?.organization_id || user?.organizationId;
      const data = await fetchGroups(orgId);
      setGroups(data.groups || data || []);
    } catch {
      toast.error("Failed to load groups");
    }
  };

  const toggleGroup = (id) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  /* ⬇ Download format */
  const downloadFormat = () => {
    const csv = "Name,Email,Mobile\nAyush Agrawal,Ayush@example.com,9876543210\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "participant_format.csv";
    a.click();
  };

  /* 📂 Excel/CSV bulk upload */
  const handleUpload = async () => {
    if (selectedGroups.length === 0) return toast.error("Select at least one group");
    if (!selectedFile) return toast.error("Please select a file");
    const trimmedName = fileName.trim() || selectedFile.name.replace(/\.[^.]+$/, "");
    setUploading(true);
    try {
      const res = await uploadParticipantsExcelWithMeta(
        selectedGroups,
        selectedFile,
        trimmedName
      );
      toast.success(
        `Uploaded! Code: ${res.file_code} | ${res.pending} ready, ${res.errors} issues`
      );
      if (res.errors > 0) toast("Check Staging Participant for issue records", { icon: "⚠️" });
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* 👤 Single participant */
  const handleCreateSingle = async (e) => {
    e.preventDefault();
    if (selectedGroups.length === 0) return toast.error("Select at least one group");
    setCreating(true);
    try {
      await createParticipant({
        full_name: name,
        email,
        mobile: mobileNumber,
        group_ids: selectedGroups,
      });
      toast.success("Participant created successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Error creating participant");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] p-8 w-[640px] shadow-2xl relative max-h-[92vh] overflow-y-auto custom-scrollbar">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Add Participants</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Upload a file or add manually. Select one or more groups.</p>
        </div>

        <div className="space-y-6">

          {/* ── Group Multi-Select ── */}
          <div>
            <label className="block text-xs font-bold text-slate-500 tracking-widest mb-2">
              Target Group(s)
            </label>
            {groups.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No groups found. Create a group first.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                {groups.map((g) => {
                  const gId = g.id || g._id;
                  const checked = selectedGroups.includes(gId);
                  return (
                    <button
                      key={gId}
                      type="button"
                      onClick={() => toggleGroup(gId)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all text-left ${checked
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-300"
                        }`}
                    >
                      {checked ? (
                        <CheckSquare className="w-4 h-4 flex-shrink-0 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 flex-shrink-0 text-slate-400" />
                      )}
                      <span className="truncate">{g.name || g.groupName}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {selectedGroups.length > 0 && (
              <p className="text-xs text-indigo-600 font-semibold mt-1">
                {selectedGroups.length} group{selectedGroups.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          {/* ── Bulk Upload ── */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <UploadCloud className="w-4 h-4 text-indigo-500" />
              Bulk Excel / CSV Upload
            </h3>

            {/* Download format */}
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 mb-3">
              <span className="text-xs font-medium text-slate-500 ml-2">Need the template?</span>
              <button onClick={downloadFormat} className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" /> Download Format
              </button>
            </div>

            {/* File picker */}
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer bg-white border border-slate-200 rounded-xl mb-3"
              onChange={(e) => {
                const f = e.target.files[0];
                if (f) {
                  setSelectedFile(f);
                  // Pre-fill name from file (without extension)
                  setFileName(f.name.replace(/\.[^.]+$/, ""));
                  setFileCodePreview(previewFileCode());
                }
              }}
            />

            {/* File name editing + code preview */}
            {selectedFile && (
              <div className="space-y-2 mt-2">
                <label className="block text-xs font-bold text-slate-500 tracking-widest">
                  File Display Name <span className="text-slate-400 font-normal normal-case">(editable)</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg whitespace-nowrap tracking-widest">
                    {fileCodePreview}
                  </span>
                  <span className="text-slate-400 font-bold">_</span>
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Enter file name..."
                  />
                  <button
                    type="button"
                    title="Generate new code"
                    onClick={() => setFileCodePreview(previewFileCode())}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Stored as: <span className="font-mono font-semibold text-slate-600">{fileCodePreview}_{fileName || "filename"}</span>
                </p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile || selectedGroups.length === 0 || uploading}
              className={`mt-3 w-full py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${!selectedFile || selectedGroups.length === 0 || uploading
                ? "bg-slate-300"
                : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200"
                }`}
            >
              {uploading ? "Uploading…" : "Upload File"}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-xs font-bold text-slate-400 tracking-widest">OR Add Manually</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* ── Single Participant ── */}
          <form onSubmit={handleCreateSingle} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 tracking-widest mb-1.5">Full Name</label>
              <input
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                placeholder="e.g. Rohit Sharma"
                value={name}
                onChange={(e) => { setName(e.target.value); setSelectedFile(null); }}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 tracking-widest mb-1.5">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                  placeholder="rohit@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setSelectedFile(null); }}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 tracking-widest mb-1.5">Mobile Number</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                  placeholder="9876543210"
                  value={mobileNumber}
                  onChange={(e) => { setMobileNumber(e.target.value); setSelectedFile(null); }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={onClose} className="px-6 py-3 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-bold transition-all">
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || selectedGroups.length === 0}
                className={`px-6 py-3 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${creating || selectedGroups.length === 0
                  ? "bg-slate-300"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200"
                  }`}
              >
                {creating ? "Creating…" : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
