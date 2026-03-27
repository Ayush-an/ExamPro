import React, { useState, useEffect } from "react";
import { fetchSuperUserGroups, updateGroup, deleteSuperUserGroup } from "../../../utils/api";
import { toast } from "react-hot-toast";
import { Search, Edit3, Trash2, Calendar, Clock, Archive } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ManageGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const normalizeStatus = (s) => {
    if (!s) return "Active";
    return s.charAt(0) + s.slice(1).toLowerCase();
  };

  const toBackendStatus = (s) => s.toUpperCase();

  const loadGroups = async () => {
    setLoading(true);
    try {
      const data = await fetchSuperUserGroups();

      const normalized = data.map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        participants: g.participants ?? g.participants_count ?? 0,
        start: g.start || "",
        end: g.end || "",
        status: normalizeStatus(g.status),
        createdBy: g.createdBy || "System",
        createdAt: g.createdAt || "",
        updatedAt: g.updatedAt || "",
      }));

      setGroups(normalized);
    } catch (err) {
      toast.error("Telemetry synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadGroups(); }, []);

  const handleEditClick = (g) => {
    setEditingGroup(g);
    setEditForm({
      name: g.name,
      description: g.description,
      startDate: g.start,
      endDate: g.end,
      status: g.status,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {
        name: editForm.name,
        description: editForm.description,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        status: toBackendStatus(editForm.status),
      };

      await updateGroup(editingGroup.id, payload);
      toast.success("Unit protocols updated");
      setEditingGroup(null);
      loadGroups();
    } catch (err) {
      toast.error("Update protocol failed");
    }
  };

  const handleDelete = async (groupId) => {
    if (!window.confirm("Confirm unit decommission sequence?")) return;
    try {
      await deleteSuperUserGroup(groupId);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      toast.success("Unit decommissioned successfully");
    } catch (err) {
      toast.error("Decommission protocol failed");
    }
  };

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Unit Data...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Groups</h2>
          <p className="text-[10px] text-slate-400 font-bold mt-1">Manage organization units and participants.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:border-indigo-100 transition-all w-full md:w-80 shadow-inner">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-[10px] font-bold placeholder:text-slate-300 w-full font-sans"
          />
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 tracking-wide">Group Details</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 tracking-wide text-center">Participants</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 tracking-wide">Duration</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 tracking-wide text-center">Status</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 tracking-wide">Created By</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 tracking-wide text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredGroups.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <Archive size={48} className="text-slate-400" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Registry Vacant</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredGroups.map((g) => (
                <motion.tr
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={g.id}
                  className="hover:bg-slate-50/30 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black hover:scale-110 transition cursor-pointer">
                        {g.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-900 tracking-tight group-hover:text-indigo-600 transition">{g.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{g.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-100/50">
                      {g.participants}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 tracking-tight">
                        <Calendar size={12} className="text-slate-300" />
                        <span>{g.start || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 tracking-tight">
                        <Clock size={12} className="text-slate-300" />
                        <span>{g.end || "N/A"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black tracking-widest border ${g.status === "Active"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : "bg-red-50 text-red-600 border-red-100"
                      }`}>
                      <span className={`w-1 h-1 rounded-full ${g.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
                      {g.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <p className="text-[10px] font-bold text-slate-900 tracking-wide">{g.createdBy}</p>
                      <p className="text-[8px] font-bold text-slate-300 mt-0.5">{new Date(g.createdAt).toLocaleDateString()}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(g)}
                        className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/50 transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-600 hover:border-red-100 hover:shadow-lg hover:shadow-red-50/50 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {editingGroup && (
          <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingGroup(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-10 border-b border-slate-50">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Group</h2>
                <p className="text-[10px] text-slate-400 font-bold mt-1">Adjust group parameters.</p>
              </div>

              <div className="p-10 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5 font-left">
                    <label className="text-[10px] font-bold text-slate-400 ml-4">Group Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      placeholder="Group Name"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 ml-4">Description</label>
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                      placeholder="Enter description..."
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold transition-all min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 ml-4">Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        value={editForm.startDate}
                        onChange={handleEditChange}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 ml-4">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={editForm.endDate}
                        onChange={handleEditChange}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 ml-4">Operational Status</label>
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleEditChange}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold transition-all appearance-none cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setEditingGroup(null)}
                    className="flex-1 px-8 py-5 bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-400 hover:bg-slate-100 transition-all border border-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 px-8 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-bold hover:bg-black transition-all shadow-xl shadow-slate-100"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}