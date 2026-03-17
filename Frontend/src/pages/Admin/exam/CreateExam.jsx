//CreateExam.jsx
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { X, CalendarDays, CheckCircle2 } from "lucide-react";
import { fetchGroups, createExam } from "../../../utils/api";

export default function CreateExam({ onClose, onSuccess }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [scheduleExam, setScheduleExam] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  // Get current date in YYYY-MM-DD format
  const todayStr = new Date().toISOString().split("T")[0];

  // Load Groups
  useEffect(() => {
    fetchGroups()
      .then((res) => {
        const data = res?.groups || res || [];
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setGroups(sorted);
      })
      .catch((err) => console.error("Error loading groups:", err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedGroups.length === 0) {
      toast.error("Please select at least one group.");
      return;
    }

    // VALIDATION: Schedule dates/times
    if (scheduleExam) {
      if (!startDate || !startTime || !endDate || !endTime) {
        toast.error("Please select start and end date/time.");
        return;
      }

      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);
      const now = new Date();

      if (start < now) {
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
      .catch(() => {
        toast.error("Failed to create exam");
      });

  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
      <div className="bg-white rounded-[32px] p-8 w-[600px] shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
            <CalendarDays className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Create New Exam</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Set up exam details, duration, and scheduling.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title and Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Exam Title <span className="text-rose-500">*</span></label>
              <input type="text" placeholder="e.g. Midterm Physics" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description <span className="text-rose-500">*</span></label>
              <textarea placeholder="Specific instructions for candidates..." className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800 placeholder-slate-400 resize-none"
                value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Duration (mins) <span className="text-rose-500">*</span></label>
            <input type="number" min="0" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800" value={duration}
              onChange={(e) => setDuration(Math.max(0, Number(e.target.value)))} required placeholder="60" />
          </div>

          {/* Groups */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Assign to Groups <span className="text-rose-500">*</span></label>
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 max-h-48 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                {groups.map((g) => {
                  const id = String(g.id);
                  const isSelected = selectedGroups.includes(id);

                  return (
                    <label key={id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-slate-200/50'}`}>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={isSelected}
                        onChange={() => {
                          if (isSelected) {
                            setSelectedGroups(selectedGroups.filter((v) => v !== id));
                          } else {
                            setSelectedGroups([...selectedGroups, id]);
                          }
                        }}
                      />
                      <span className={`text-sm font-bold ${isSelected ? 'text-indigo-800' : 'text-slate-600'}`}>{g.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            {selectedGroups.length === 0 && (
              <p className="mt-2 text-xs font-bold text-rose-500 flex items-center gap-1">Please select at least one group.</p>
            )}
          </div>

          <div className="h-px bg-slate-100 w-full my-4"></div>

          {/* Schedule Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Schedule Exam</h4>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Restrict access to specific dates and times.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={scheduleExam} onChange={(e) => setScheduleExam(e.target.checked)} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Schedule Fields */}
          {scheduleExam && (
            <div className="grid grid-cols-2 gap-4 p-5 border border-indigo-100 rounded-2xl bg-indigo-50/50">
              <div className="col-span-2 text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2 border-b border-indigo-100 pb-2">Start Window</div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Start Date</label>
                <input type="date" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800" value={startDate}
                  onChange={(e) => setStartDate(e.target.value)} required min={todayStr} />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Start Time</label>
                <input type="time" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </div>

              <div className="col-span-2 text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2 mt-2 border-b border-indigo-100 pb-2">End Window</div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">End Date</label>
                <input type="date" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  required min={todayStr} />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">End Time</label>
                <input type="time" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button type="button" className="px-6 py-3 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-bold transition-all" onClick={onClose} > Cancel </button>
            <button type="submit" className="px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 rounded-xl font-bold transition-all" > Create Exam </button>
          </div>
        </form>
      </div>
    </div>
  );
}
