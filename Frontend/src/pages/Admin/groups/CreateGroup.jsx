import { useState } from "react";
import { createGroup } from "../../../utils/api";
import { toast } from "react-hot-toast";

export default function CreateGroup({ onClose }) {
  const today = new Date().toISOString().split("T")[0];

  const [group, setGroup] = useState({
    name: "",
    description: "",
    startDate: today,     // ✅ default current date
    endDate: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ If start date changes and endDate is before it, reset endDate
    if (name === "startDate") {
      setGroup((prev) => ({
        ...prev,
        startDate: value,
        endDate: prev.endDate && prev.endDate < value ? "" : prev.endDate
      }));
      return;
    }

    setGroup({ ...group, [name]: value });
  };

  const handleSubmit = async () => {
    if (!group.name || !group.startDate || !group.endDate) {
      toast.error("Please fill all required fields");
      return;
    }

    if (group.endDate < group.startDate) {
      toast.error("End date cannot be before start date");
      return;
    }

    setLoading(true);
    try {
      await createGroup(group);
      toast.success("Group created successfully!");
      onClose();
    } catch (err) {
      toast.error(`Failed to create group: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create New Group</h2>
        <p className="text-sm text-slate-500 mt-2 font-medium">Provision a new group for participants</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 tracking-widest mb-1.5">Group Name</label>
          <input
            type="text"
            name="name"
            placeholder="e.g. MCA, BCA other etc"
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-800 placeholder-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 tracking-widest mb-1.5">Description (Optional)</label>
          <textarea
            name="description"
            placeholder="1st year, 2nd year etc."
            onChange={handleChange}
            className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-800 placeholder-slate-400 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 tracking-widest mb-1.5">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={group.startDate}
              min={today}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">End Date</label>
            <input
              type="date"
              name="endDate"
              value={group.endDate}
              min={group.startDate}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-800"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
        <button
          className="px-6 py-3 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-bold transition-all"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>

        <button
          className="px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Group"}
        </button>
      </div>
    </div>
  );
}
