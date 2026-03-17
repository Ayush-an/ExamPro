// src/components/exam/ManageExam.jsx
import React, { useEffect, useState } from "react";
import { fetchGroups, fetchExams, updateExam, deleteExam } from "../../../utils/api";
import { toast } from "react-hot-toast";
import { Pencil, Trash2, Clock, Users, CalendarDays, X, CheckCircle2, AlertCircle } from "lucide-react";

const ManageExam = () => {
  const [exams, setExams] = useState([]);
  const [groups, setGroups] = useState([]);
  const [editingExam, setEditingExam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: convert ISO (UTC) to a local value suitable for <input type="datetime-local">
  const isoToLocalInput = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      return local;
    } catch (e) {
      console.error("isoToLocalInput error", e, iso);
      return "";
    }
  };

  // Helper: convert a local "YYYY-MM-DDTHH:MM" -> ISO (UTC) string
  const localInputToIso = (local) => {
    if (!local) return null;
    try {
      // new Date("YYYY-MM-DDTHH:MM") is parsed as local time by browsers
      const d = new Date(local);
      const iso = d.toISOString();
      return iso;
    } catch (e) {
      console.error("localInputToIso error", e, local);
      return null;
    }
  };

  const fetchAllExams = async () => {
    try {
      setLoading(true);
      const examsData = await fetchExams();
      // Normalize field names for display
      const normalized = (Array.isArray(examsData) ? examsData : []).map(e => ({
        ...e,
        duration: e.duration_minutes || e.duration || 0,
        status: e.status_code || e.status || 'ACTIVE',
      }));
      setExams(normalized);
    } catch (err) {
      console.error("Error fetching exams:", err);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllGroups = async () => {
    console.log("Fetching all groups...");
    try {
      const res = await fetchGroups();
      console.log("Groups fetched:", res.groups || res);
      setGroups(Array.isArray(res.groups) ? res.groups : res);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setGroups([]);
    }
  };

  useEffect(() => {
    fetchAllExams();
    fetchAllGroups();
  }, []);

  const handleEditChange = (field, value) => {
    setEditingExam((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleSaveEdit = async () => {
    try {
      // Build payload with correct backend field names
      const payload = {
        title: editingExam.title,
        description: editingExam.description,
        duration_minutes: Number(editingExam.duration) || 0,
        status_code: editingExam.status,
        groupIds: editingExam.selectedGroups?.map((id) => parseInt(id)) || [],
      };

      // Convert dates to ISO
      if (editingExam.start_date) {
        payload.start_date = editingExam.start_date.includes("Z")
          ? editingExam.start_date
          : localInputToIso(editingExam.start_date);
      }
      if (editingExam.end_date) {
        payload.end_date = editingExam.end_date.includes("Z")
          ? editingExam.end_date
          : localInputToIso(editingExam.end_date);
      }

      await updateExam(editingExam.id, payload);
      setEditingExam(null);
      await fetchAllExams();
      toast.success("Exam updated successfully!");
    } catch (err) {
      console.error("Failed to update exam:", err);
      toast.error("Failed to update exam.");
    }
  };

  const handleSoftDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this exam?")) return;
    try {
      await deleteExam(id);
      await fetchAllExams();
      toast.success("Exam removed successfully!");
    } catch (err) {
      console.error("Failed to remove exam:", err);
      toast.error("Failed to remove exam.");
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500 font-medium animate-pulse">Loading exams...</div>;
  }

  return (
    <div className="w-full relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Exams</h2>
          <p className="text-sm text-slate-500 mt-1">View, edit, and organize all system examinations.</p>
        </div>
      </div>

      {exams.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <CalendarDays className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No exams found. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <div key={exam.id} className="relative bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300 p-8 flex flex-col group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>

              <div className="relative z-10 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-extrabold text-slate-900 leading-tight pr-4">{exam.title}</h3>
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full whitespace-nowrap ${exam.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                    exam.status === 'SCHEDULED' ? 'bg-indigo-50 text-indigo-600' :
                      exam.status === 'COMPLETED' ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-50 text-slate-500'
                    }`}>
                    {exam.status}
                  </span>
                </div>

                <p className="text-sm text-slate-500 mb-6 line-clamp-2">{exam.description}</p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>{exam.duration} mins</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                    <Users className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">
                      {exam.Groups && exam.Groups.length > 0
                        ? exam.Groups.map((g) => g.name).join(", ")
                        : <span className="text-slate-400 italic">No groups assigned</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <CalendarDays className="w-4 h-4 text-indigo-400" />
                    <span>{exam.start_date ? new Date(exam.start_date).toLocaleString() : "TBD"}</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-3 pt-6 border-t border-slate-100 mt-auto">
                <button
                  onClick={() => setEditingExam({
                    ...exam,
                    duration: exam.duration_minutes || exam.duration || 0,
                    status: exam.status_code || exam.status || 'ACTIVE',
                    selectedGroups: exam.Groups?.map((g) => String(g.id)) || [],
                  })}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 font-bold text-sm rounded-xl transition-colors"
                >
                  <Pencil className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleSoftDelete(exam.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-600 font-bold text-sm rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      {
        editingExam && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
            <div className="bg-white rounded-[32px] p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">              <button onClick={() => setEditingExam(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
              <h3 className="mb-6 text-2xl font-extrabold text-slate-900">Edit Exam</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Exam Title</label>
                  <input type="text" value={editingExam.title || ""} onChange={(e) => handleEditChange("title", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800" placeholder="Exam Title"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                  <textarea value={editingExam.description || ""} onChange={(e) => handleEditChange("description", e.target.value)}
                    className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800 resize-none" placeholder="Brief exam instructions..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Duration (Mins)</label>
                    <input type="number" value={editingExam.duration || 0} onChange={(e) => handleEditChange("duration", e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800" placeholder="e.g. 60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Status</label>
                    <select value={editingExam.status || "SCHEDULED"} onChange={(e) => handleEditChange("status", e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800 outline-none appearance-none"     >
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="REMOVED">Removed</option>
                    </select>
                  </div>
                </div>

                {/* GROUPS CHECKBOXES */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Target Groups</label>
                  <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 max-h-48 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-3">
                      {groups.map((g) => {
                        const idStr = String(g.id);
                        const isSelected = editingExam.selectedGroups?.includes(idStr) || false;
                        return (
                          <label key={idStr} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-slate-200/50'}`}>
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <input type="checkbox" checked={isSelected} className="hidden"
                              onChange={() => {
                                let updated = editingExam.selectedGroups || [];
                                updated = isSelected ? updated.filter((v) => v !== idStr) : [...updated, idStr];
                                handleEditChange("selectedGroups", updated);
                              }}
                            />
                            <span className={`text-sm font-bold ${isSelected ? 'text-indigo-800' : 'text-slate-600'}`}>{g.name || g.groupName}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Start Time (Local)</label>
                    <input type="datetime-local" value={isoToLocalInput(editingExam.start_date)}
                      onChange={(e) => handleEditChange("start_date", localInputToIso(e.target.value))}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">End Time (Local)</label>
                    <input type="datetime-local" value={isoToLocalInput(editingExam.end_date)}
                      onChange={(e) => handleEditChange("end_date", localInputToIso(e.target.value))}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                <button onClick={() => setEditingExam(null)} className="px-6 py-3 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-bold transition-all">Cancel</button>
                <button onClick={handleSaveEdit} className="px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 rounded-xl font-bold transition-all">Save Changes</button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};
export default ManageExam;