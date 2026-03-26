import React, { useState, useEffect } from "react";
import { fetchGroups, createExam, fetchCategories, fetchTopics } from "../../../utils/api";
import { toast } from "react-hot-toast";
import { X, CalendarDays, CheckCircle2 } from "lucide-react";

export default function CreateExam({ onClose, onSuccess }) {
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [scheduleExam, setScheduleExam] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchGroups().then(res => setGroups(res?.groups || res || [])).catch(e => console.error(e));
    fetchCategories().then(setCategories).catch(e => console.error(e));
  }, []);

  useEffect(() => {
    if (categoryId) {
      fetchTopics(categoryId).then(setTopics).catch(e => console.error(e));
    } else {
      setTopics([]);
    }
  }, [categoryId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedGroups.length === 0) {
      toast.error("Please select at least one group.");
      return;
    }

    if (scheduleExam) {
      if (!startDate || !startTime || !endDate || !endTime) {
        toast.error("Please select start and end date/time.");
        return;
      }
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);
      if (start < new Date()) {
        toast.error("Start date/time cannot be in the past.");
        return;
      }
      if (start >= end) {
        toast.error("End date/time must be after start date/time.");
        return;
      }
    }

    const payload = {
      title,
      description,
      duration_minutes: Number(duration) || 0,
      category_id: categoryId || null,
      topic_id: topicId || null,
      scheduled: scheduleExam,
      groupIds: selectedGroups.map((id) => parseInt(id)),
      start_date: scheduleExam ? new Date(`${startDate}T${startTime}`).toISOString() : null,
      end_date: scheduleExam ? new Date(`${endDate}T${endTime}`).toISOString() : null,
    };

    createExam(payload)
      .then(() => {
        toast.success("Exam created successfully!");
        onSuccess?.();
        onClose();
      })
      .catch((err) => {
        toast.error(err.response?.data?.error || "Failed to create exam");
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
      <div className="bg-white rounded-[32px] w-[600px] shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">

        {/* Sticky Header */}
        <div className="p-8 pb-4 relative border-b border-slate-50">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              <CalendarDays className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create New Exam</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Set up exam details, duration, and scheduling.</p>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form id="create-exam-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 pt-6 space-y-8 custom-scrollbar">

          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
              <h3 className="text-xs font-bold text-slate-400 tracking-widest">General Info</h3>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 tracking-widest mb-1.5 ml-1">Exam Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Midterm Physics"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 tracking-widest mb-1.5 ml-1">Description <span className="text-rose-500">*</span></label>
                <textarea
                  placeholder="Specific instructions..."
                  className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800 resize-none shadow-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                <h3 className="text-xs font-bold text-slate-400 tracking-widest">Duration</h3>
              </div>
              <div className="relative">
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800 shadow-sm"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 tracking-widest">Min</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                <h3 className="text-xs font-bold text-slate-400 tracking-widest">Filters</h3>
              </div>
              <div className="grid gap-2">
                <select className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm disabled:opacity-50" value={topicId} onChange={e => setTopicId(e.target.value)} disabled={!categoryId}>
                  <option value="">All Topics</option>
                  {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                <h3 className="text-xs font-bold text-slate-400 tracking-widest">Assign Groups</h3>
              </div>
              {selectedGroups.length > 0 && (
                <span className="text-[10px] font-bold text-indigo-500 px-2 py-0.5 bg-indigo-50 rounded-full tracking-widest">
                  {selectedGroups.length} Selected
                </span>
              )}
            </div>

            <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/30 max-h-40 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-2">
                {groups.map((g) => {
                  const id = String(g.id);
                  const isSelected = selectedGroups.includes(id);
                  return (
                    <label key={id} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all duration-200 ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-md translate-y-[-1px]' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
                      <input type="checkbox" className="hidden" checked={isSelected}
                        onChange={() => isSelected ? setSelectedGroups(selectedGroups.filter(v => v !== id)) : setSelectedGroups([...selectedGroups, id])}
                      />
                      <span className="text-[11px] font-bold truncate pr-2">{g.name}</span>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-white/20 ring-2 ring-white/30' : 'bg-slate-100'}`}>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Schedule Exam</h4>
                <p className="text-[10px] font-medium text-slate-500 tracking-widest">Restrict access window</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={scheduleExam} onChange={(e) => setScheduleExam(e.target.checked)} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {scheduleExam && (
              <div className="mt-4 grid grid-cols-2 gap-4 p-5 border border-indigo-100 rounded-2xl bg-indigo-50/30 animate-in slide-in-from-top-1 duration-300">
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-indigo-500 tracking-widest border-b border-indigo-100 pb-1">Start Phase</h5>
                  <div className="grid gap-2">
                    <input type="date" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={startDate} onChange={(e) => setStartDate(e.target.value)} required min={todayStr} />
                    <input type="time" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-rose-500 tracking-widest border-b border-rose-100 pb-1">Expiry Phase</h5>
                  <div className="grid gap-2">
                    <input type="date" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500" value={endDate} onChange={(e) => setEndDate(e.target.value)} required min={todayStr} />
                    <input type="time" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Sticky Footer Buttons */}
        <div className="p-8 pt-4 border-t border-slate-50 bg-slate-50/50 backdrop-blur-sm">
          <div className="flex justify-end gap-3">
            <button type="button" className="px-6 py-3 bg-white text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl font-bold transition-all shadow-sm" onClick={onClose} > Cancel </button>
            <button form="create-exam-form" type="submit" className="px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 rounded-xl font-bold transition-all" > Create Exam </button>
          </div>
        </div>
      </div>
    </div>
  );
}
