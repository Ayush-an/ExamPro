import React, { useState, useEffect } from "react";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { fetchDashboardStats, fetchMyNotices, fetchGroups, fetchParticipants, fetchExams, fetchSuperUsersByOrg, fetchCategories, fetchTopics, deleteExam, updateExam } from "../../../utils/api";
import { toast } from "react-hot-toast";
import { LayoutDashboard, Users, GraduationCap, FileText, Send, MessageSquare, Newspaper, Plus, Search, CheckCircle2, Layers, Hash, Eye, Trash2, Edit, X, Calendar, Clock, AlertCircle, Pencil, CalendarDays, ListFilter, Settings2 } from "lucide-react";
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
    const activeCats = editingExam?.category_ids || [];
    if (activeCats.length > 0) {
      Promise.all(activeCats.map(id => fetchTopics(id)))
        .then(results => {
          const allTopics = results.flatMap(res => res || []);
          const uniqueTopics = Array.from(new Map(allTopics.map(t => [t.id, t])).values());
          setTopics(uniqueTopics);
        })
        .catch(e => console.error(e));
    } else {
      setTopics([]);
    }
  }, [editingExam?.category_ids]);

  const handleEditChange = (field, value) => {
    setEditingExam((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {
        title: editingExam.title,
        description: editingExam.description,
        duration_minutes: Number(editingExam.duration_minutes) || 0,
        category_ids: editingExam.category_ids?.map(id => parseInt(id)) || [],
        topic_ids: editingExam.topic_ids?.map(id => parseInt(id)) || [],
        status_code: editingExam.status_code || "ACTIVE",
        group_ids: editingExam.selectedGroups?.map((id) => parseInt(id)) || [],
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
    try {
      if (!window.confirm("Move this exam to removed list?")) return;
      await deleteExam(id);
      toast.success("Exam removed successfully.");
      fetchAllExams();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to remove exam.");
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
                  <button onClick={() => setEditingExam({
                    ...exam,
                    selectedGroups: exam.Groups?.map(g => String(g.id)) || [],
                    category_ids: exam.Categories?.map(c => String(c.id)) || [],
                    topic_ids: exam.Topics?.map(t => String(t.id)) || []
                  })} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition">
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
                  <div className="text-[10px] font-bold text-slate-400 tracking-widest mb-1">Total Question</div>
                  <div className="text-sm font-extrabold text-slate-700">{exam.max_questions || 0} </div>
                </div>
                <div className="p-3 bg-indigo-50/50 rounded-2xl">
                  <div className="text-[10px] font-bold text-indigo-400 tracking-widest mb-1">Duration</div>
                  <div className="text-sm font-extrabold text-indigo-700">{exam.duration_minutes || 0} Min</div>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                  <Layers size={14} className="text-slate-300" />
                  <span className="truncate">{exam.Categories?.map(c => c.name).join(', ') || 'All Categories'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                  <Hash size={14} className="text-slate-300" />
                  <span className="truncate">{exam.Topics?.map(t => t.name).join(', ') || 'All Topics'}</span>
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
                <Eye size={16} /> View Question
              </button>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL - Portaled and Condensed */}
      <Transition show={!!editingExam} as={Fragment}>
        <Dialog as="div" className="relative z-60" onClose={() => setEditingExam(null)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-[32px] bg-white p-8 text-left align-middle shadow-2xl transition-all border border-slate-50 relative">
                  <button onClick={() => setEditingExam(null)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <X className="w-5 h-5" />
                  </button>

                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Edit Exam Parameters</h3>
                    <p className="text-xs font-medium text-slate-500">Update configuration for {editingExam?.title}</p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 tracking-widest mb-1.5 ml-1">Exam Title</label>
                      <input
                        type="text"
                        value={editingExam?.title || ""}
                        onChange={e => handleEditChange("title", e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <label className="block text-[10px] font-bold text-slate-400 tracking-widest mb-0.5">Assigned Questions</label>
                        <div className="text-base font-black text-slate-800">{editingExam?.max_questions || 0}</div>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <label className="block text-[10px] font-bold text-slate-400 tracking-widest mb-0.5">Total Marks</label>
                        <div className="text-base font-black text-slate-800">{editingExam?.max_marks || 0}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-400 tracking-widest ml-1">Categories</label>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50/50">
                          {categories.map(c => {
                            const isSelected = editingExam?.category_ids?.includes(String(c.id));
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  const current = editingExam.category_ids || [];
                                  const next = isSelected ? current.filter(id => id !== String(c.id)) : [...current, String(c.id)];
                                  handleEditChange("category_ids", next);
                                }}
                                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'}`}
                              >
                                {c.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-400 tracking-widest ml-1">Topics</label>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50/50">
                          {topics.length > 0 ? topics.map(t => {
                            const isSelected = editingExam?.topic_ids?.includes(String(t.id));
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => {
                                  const current = editingExam.topic_ids || [];
                                  const next = isSelected ? current.filter(id => id !== String(t.id)) : [...current, String(t.id)];
                                  handleEditChange("topic_ids", next);
                                }}
                                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${isSelected ? 'bg-amber-500 border-amber-500 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-amber-300'}`}
                              >
                                {t.name}
                              </button>
                            );
                          }) : <p className="text-[10px] text-slate-400 italic p-1">Select category first</p>}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-400 tracking-widest ml-1">Assign to Groups</label>
                      <div className="grid grid-cols-2 gap-2 p-2 border border-slate-100 rounded-xl bg-slate-50/50 max-h-24 overflow-y-auto">
                        {groups.map(g => {
                          const isSelected = editingExam?.selectedGroups?.includes(String(g.id));
                          return (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => {
                                const current = editingExam.selectedGroups || [];
                                const next = isSelected ? current.filter(id => id !== String(g.id)) : [...current, String(g.id)];
                                handleEditChange("selectedGroups", next);
                              }}
                              className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'}`}
                            >
                              <span className="truncate">{g.name}</span>
                              {isSelected && <CheckCircle2 size={10} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => setEditingExam(null)}
                        className="px-6 py-2.5 bg-slate-50 text-slate-500 rounded-xl font-bold text-xs hover:bg-slate-100 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

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