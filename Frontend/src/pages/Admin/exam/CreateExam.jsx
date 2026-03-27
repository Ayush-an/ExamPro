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
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
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
    if (selectedCategories.length > 0) {
      // Fetch topics for all selected categories
      Promise.all(selectedCategories.map(id => fetchTopics(id)))
        .then(results => {
          const allTopics = results.flatMap(res => res || []);
          // Deduplicate if necessary
          const uniqueTopics = Array.from(new Map(allTopics.map(t => [t.id, t])).values());
          setTopics(uniqueTopics);
        })
        .catch(e => console.error(e));
    } else {
      setTopics([]);
      setSelectedTopics([]);
    }
  }, [selectedCategories]);

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
      category_ids: selectedCategories.map(id => parseInt(id)),
      topic_ids: selectedTopics.map(id => parseInt(id)),
      scheduled: scheduleExam,
      group_ids: selectedGroups.map((id) => parseInt(id)),
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
    <div className="w-full bg-white shadow-sm rounded-2xl relative flex flex-col overflow-hidden animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-slate-100 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <CalendarDays size={20} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Create New Exam</h2>
            <p className="text-[10px] font-bold text-slate-400">Set up exam details, duration, and scheduling.</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Form Body */}
      <form id="create-exam-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
            <h3 className="text-lg font-bold text-slate-600 tracking-widest">General Info</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[15px] font-bold text-slate-500 tracking-widest mb-1.5 ml-1">Exam Title <span className="text-rose-500">*</span></label>
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
                <label className="block text-[15px] font-bold text-slate-500 tracking-widest mb-1.5 ml-1">Duration <span className="text-rose-500">*</span></label>
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
            </div>

            <div>
              <label className="block text-[15px] font-bold text-slate-500 tracking-widest mb-1.5 ml-1 ">Description <span className="text-rose-500">*</span></label>
              <textarea
                placeholder="Specific instructions..."
                className="w-full h-full min-h-[140px] px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800 resize-none shadow-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
              <h3 className="text-lg font-bold text-slate-600 tracking-widest">Categories & Topics</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[15px] font-bold text-slate-500 tracking-widest block">Select Categories</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border border-slate-100 rounded-2xl bg-slate-50/50 custom-scrollbar">
                  {categories.map(c => {
                    const isSelected = selectedCategories.includes(String(c.id));
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => isSelected ? setSelectedCategories(selectedCategories.filter(id => id !== String(c.id))) : setSelectedCategories([...selectedCategories, String(c.id)])}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border transform active:scale-95 ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[15px] font-bold text-slate-500 tracking-widest block ">Select Topics</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border border-slate-100 rounded-2xl bg-slate-50/50 custom-scrollbar">
                  {topics.length > 0 ? topics.map(t => {
                    const isSelected = selectedTopics.includes(String(t.id));
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => isSelected ? setSelectedTopics(selectedTopics.filter(id => id !== String(t.id))) : setSelectedTopics([...selectedTopics, String(t.id)])}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${isSelected ? 'bg-amber-500 border-amber-500 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300'}`}
                      >
                        {t.name}
                      </button>
                    );
                  }) : <p className="text-[15px] text-slate-400 italic p-2">Select category to see topics</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                <h3 className="text-lg font-bold text-slate-600 tracking-widest">Assign Groups</h3>
              </div>
              {selectedGroups.length > 0 && (
                <span className="text-[15px] font-bold text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded-full tracking-widest">
                  {selectedGroups.length} Selected
                </span>
              )}
            </div>

            <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/30 max-h-[300px] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {groups.map((g) => {
                  const id = String(g.id);
                  const isSelected = selectedGroups.includes(id);
                  return (
                    <label key={id} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all duration-200 ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white border-slate-200 hover:border-emerald-300'}`}>
                      <input type="checkbox" className="hidden" checked={isSelected}
                        onChange={() => isSelected ? setSelectedGroups(selectedGroups.filter(v => v !== id)) : setSelectedGroups([...selectedGroups, id])}
                      />
                      <span className="text-[15px] font-bold truncate pr-2">{g.name}</span>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-white/20 ring-2 ring-white/30' : 'bg-slate-100'}`}>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100">
          <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm mb-6">
            <div>
              <h4 className="text-lg font-bold text-slate-600">Schedule Exam</h4>
              <p className="text-[15px] font-medium text-slate-500 tracking-widest">Restrict access window</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={scheduleExam} onChange={(e) => setScheduleExam(e.target.checked)} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {scheduleExam && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-indigo-100 rounded-2xl bg-indigo-50/30 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-4">
                <h5 className="text-[15px] font-black text-indigo-500 tracking-widest border-b border-indigo-100 pb-2 ">Start Phase</h5>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={startDate} onChange={(e) => setStartDate(e.target.value)} required min={todayStr} />
                  <input type="time" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-[15px] font-black text-rose-500 tracking-widest border-b border-rose-100 pb-2 ">Expiry Phase</h5>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500" value={endDate} onChange={(e) => setEndDate(e.target.value)} required min={todayStr} />
                  <input type="time" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-8 flex justify-end gap-3">
          <button type="button" className="px-8 py-3 bg-white text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl font-bold transition-all shadow-sm" onClick={onClose} > Cancel </button>
          <button form="create-exam-form" type="submit" className="px-8 py-3 text-white bg-slate-900 hover:bg-slate-800 hover:shadow-lg rounded-xl font-bold transition-all shadow-md" > Create Exam </button>
        </div>
      </form>
    </div>
  );
}
