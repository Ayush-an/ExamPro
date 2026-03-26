import React, { useState, useEffect } from "react";
import { fetchGroups, fetchExams, updateExam, deleteExam, fetchCategories, fetchTopics } from "../../../utils/api";
import { toast } from "react-hot-toast";
import { Pencil, Trash2, Clock, Users, CalendarDays, X, CheckCircle2, ListFilter, Layers, Hash, Settings2 } from "lucide-react";
import QuestionMapping from "./QuestionMapping";

const ManageExam = () => {
  const [exams, setExams] = useState([]);
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [editingExam, setEditingExam] = useState(null);
  const [mappingExam, setMappingExam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: convert ISO (UTC) to a local value suitable for <input type="datetime-local">
  const isoToLocalInput = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      return local;
    } catch (e) { return ""; }
  };

  const localInputToIso = (local) => {
    if (!local) return null;
    try {
      return new Date(local).toISOString();
    } catch (e) { return null; }
  };

  const fetchAllExams = async () => {
    try {
      setLoading(true);
      const examsData = await fetchExams();
      setExams(Array.isArray(examsData) ? examsData : []);
    } catch (err) {
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllExams();
    fetchGroups().then(res => setGroups(Array.isArray(res.groups) ? res.groups : res)).catch(e => console.error(e));
    fetchCategories().then(setCategories).catch(e => console.error(e));
  }, []);

  useEffect(() => {
    if (editingExam?.category_id) {
      fetchTopics(editingExam.category_id).then(setTopics).catch(e => console.error(e));
    } else {
      setTopics([]);
    }
  }, [editingExam?.category_id]);

  const handleEditChange = (field, value) => {
    setEditingExam((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {
        title: editingExam.title,
        description: editingExam.description,
        duration_minutes: Number(editingExam.duration_minutes) || 0,
        max_questions: Number(editingExam.max_questions) || 0,
        max_marks: Number(editingExam.max_marks) || 0,
        category_id: editingExam.category_id || null,
        topic_id: editingExam.topic_id || null,
        status_code: editingExam.status_code || "ACTIVE",
        groupIds: editingExam.selectedGroups?.map((id) => parseInt(id)) || [],
      };

      if (editingExam.start_date) payload.start_date = localInputToIso(editingExam.start_date);
      if (editingExam.end_date) payload.end_date = localInputToIso(editingExam.end_date);

      await updateExam(editingExam.id, payload);
      setEditingExam(null);
      await fetchAllExams();
      toast.success("Exam updated successfully!");
    } catch (err) {
      toast.error("Failed to update exam.");
    }
  };

  const handleSoftDelete = async (id) => {
    if (!window.confirm("Remove this exam?")) return;
    try {
      await deleteExam(id);
      await fetchAllExams();
      toast.success("Exam removed successfully!");
    } catch (err) {
      toast.error("Failed to remove exam.");
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500 font-bold animate-pulse">Initializing Exam Engine...</div>;

  return (
    <div className="w-full relative animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-blue-600 tracking-tight">Manage Exams</h2>
          <p className="text-sm text-slate-500 mt-1">Configure parameters, assign limits, and map questions.</p>
        </div>
      </div>

      {exams.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <CalendarDays className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No exams found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <div key={exam.id} className="relative bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300 p-8 flex flex-col group overflow-hidden">
              <div className="flex items-start justify-between mb-2">
                <span className={`px-2.5 py-0.5 text-[9px] font-extrabold tracking-widest rounded-full ${exam.status_code === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'
                  }`}>
                  {exam.status_code}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setEditingExam({ ...exam, selectedGroups: exam.Groups?.map(g => String(g.id)) || [] })} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition">
                    <Settings2 size={16} />
                  </button>
                  <button onClick={() => handleSoftDelete(exam.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-extrabold text-blue-600 leading-tight mb-2">{exam.title}</h3>
              <p className="text-xs font-medium text-slate-400 mb-6 line-clamp-2 italic">“{exam.description || 'No description provided'}”</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 tracking-widest mb-1">Questions</div>
                  {/** Limit */} <div className="text-sm font-extrabold text-slate-700">{exam.max_questions || 0} </div>
                </div>
                <div className="p-3 bg-indigo-50/50 rounded-2xl">
                  <div className="text-[10px] font-bold text-indigo-400 tracking-widest mb-1">Duration</div>
                  <div className="text-sm font-extrabold text-indigo-700">{exam.duration_minutes || 0} Min</div>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                  <Layers size={14} className="text-slate-300" />
                  <span>{exam.Category?.name || 'All Categories'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                  <Users size={14} className="text-slate-300" />
                  <span className="truncate">{exam.Groups?.map(g => g.name).join(', ') || 'No Groups'}</span>
                </div>
              </div>

              <button
                onClick={() => setMappingExam(exam)}
                className="w-full py-3.5 bg-slate-600 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl transition shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
              >
                <ListFilter size={16} /> Question Assignment
              </button>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      {editingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-2xl shadow-2xl relative overflow-y-auto custom-scrollbar pt-10">
            <button onClick={() => setEditingExam(null)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
              <X className="w-6 h-6" />
            </button>

            <div className="mb-8">
              <h3 className="text-2xl font-black text-blue-600">Exam Parameters</h3>
              <p className="text-sm font-medium text-slate-500">Configure global limits and target categorization.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Exam Title</label>
                <input type="text" value={editingExam.title} onChange={e => handleEditChange("title", e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Max Questions</label>
                  <input type="number" value={editingExam.max_questions} onChange={e => handleEditChange("max_questions", e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Max Marks</label>
                  <input type="number" value={editingExam.max_marks} onChange={e => handleEditChange("max_marks", e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category Filter</label>
                  <select value={editingExam.category_id || ""} onChange={e => handleEditChange("category_id", e.target.value)} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none">
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Topic Filter</label>
                  <select value={editingExam.topic_id || ""} onChange={e => handleEditChange("topic_id", e.target.value)} disabled={!editingExam.category_id} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none disabled:opacity-50">
                    <option value="">All Topics</option>
                    {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-8 border-t border-slate-100">
                <button onClick={() => setEditingExam(null)} className="px-8 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-100 transition">Cancel</button>
                <button onClick={handleSaveEdit} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition">Update Settings</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION MAPPING OVERLAY */}
      {mappingExam && (
        <QuestionMapping
          exam={mappingExam}
          onClose={() => { setMappingExam(null); fetchAllExams(); }}
        />
      )}
    </div>
  );
};

export default ManageExam;