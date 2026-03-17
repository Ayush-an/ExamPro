// src/components/groups/ManageGroups.jsx
import React, { useEffect, useState } from "react";
import { fetchGroups, updateGroup, deleteGroup } from "../../../utils/api";
import { toast } from "react-hot-toast";
import { Pencil, Trash2, Calendar, Users, X } from "lucide-react";

export default function ManageGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deletingGroup, setDeletingGroup] = useState(null); // Custom delete confirmation modal state

  // Convert backend values (ACTIVE) → frontend (Active)
  const normalizeStatus = (s) => {
    if (!s) return "Active";
    return s.charAt(0) + s.slice(1).toLowerCase();
  };

  // Convert back to backend ENUM
  const toBackendStatus = (s) => s.toUpperCase();

  // Load groups
  const loadGroups = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const orgId = user?.organization_id || user?.organizationId;
      const data = await fetchGroups(orgId);

      const normalized = data.map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        participants: g.participants ?? g.participants_count ?? 0,
        start: g.start || "",
        end: g.end || "",
        status: normalizeStatus(g.status),
        createdBy: g.createdBy || "",
        createdAt: g.createdAt || "",
        updatedAt: g.updatedAt || "",
      }));

      setGroups(normalized);
    } catch (err) {
      toast.error("Failed to fetch groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadGroups(); }, []);

  // Edit Modal handlers
  const handleEditClick = (g) => {
    setEditingGroup(g);
    setEditForm({ name: g.name, description: g.description, startDate: g.start, endDate: g.end, status: g.status, });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {
        name: editForm.name, description: editForm.description, startDate: editForm.startDate, endDate: editForm.endDate,
        status: toBackendStatus(editForm.status),
      };

      await updateGroup(editingGroup.id, payload);

      toast.success("Group updated successfully!");
      setEditingGroup(null);
      loadGroups();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update group");
    }
  };

  // Delete Modal handlers
  const handleDeleteClick = (g) => {
    setDeletingGroup(g);
  };

  const confirmDelete = async () => {
    if (!deletingGroup) return;
    try {
      await deleteGroup(deletingGroup.id);
      setGroups((prev) => prev.filter((g) => g.id !== deletingGroup.id));
      toast.success("Group deleted successfully!");
      setDeletingGroup(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete group");
    }
  };
  if (loading) return <div className="p-10 text-center text-slate-500 font-medium">Loading groups...</div>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Groups</h2>
          <p className="text-sm text-slate-500 mt-1">View and manage all participant groups.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Group Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Members</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Duration</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {groups.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-12 h-12 text-slate-200 mb-4" />
                      <p>No groups found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                groups.map((g) => (
                  <tr key={g.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition duration-150">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{g.name}</div>
                      <div className="text-xs text-slate-400 mt-1">Created: {g.createdAt ? new Date(g.createdAt).toLocaleDateString() : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-[200px] truncate" title={g.description}>
                      {g.description || "No description"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center justify-center min-w-[32px] h-8 px-3 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-sm">
                        {g.participants}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{g.start ? new Date(g.start).toLocaleDateString() : 'N/A'} - {g.end ? new Date(g.end).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${g.status === "Active" ? "bg-emerald-50 text-emerald-600" :
                        g.status === "Closed" ? "bg-slate-100 text-slate-500" :
                          "bg-rose-50 text-rose-600"
                        }`}>
                        {g.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" onClick={() => handleEditClick(g)} title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" onClick={() => handleDeleteClick(g)} title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 w-[480px] shadow-2xl relative">
            <button onClick={() => setEditingGroup(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>

            <h2 className="mb-6 text-2xl font-extrabold text-slate-900">Edit Group</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Group Name</label>
                <input type="text" name="name" value={editForm.name} onChange={handleEditChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-800" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Description</label>
                <textarea name="description" value={editForm.description} onChange={handleEditChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-800 resize-none h-24" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Start Date</label>
                  <input type="date" name="startDate" value={editForm.startDate?.split('T')[0] || ''} onChange={handleEditChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">End Date</label>
                  <input type="date" name="endDate" value={editForm.endDate?.split('T')[0] || ''} onChange={handleEditChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Status</label>
                <select name="status" value={editForm.status} onChange={handleEditChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-800 appearance-none">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button className="px-6 py-3 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-bold transition-all" onClick={() => setEditingGroup(null)} > Cancel </button>
              <button className="px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 rounded-xl font-bold transition-all" onClick={handleSaveEdit} > Save Changes </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 w-[400px] shadow-2xl relative text-center">
            <button onClick={() => setDeletingGroup(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>

            <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-6 mt-4">
              <Trash2 className="w-8 h-8" />
            </div>

            <h2 className="mb-2 text-2xl font-extrabold text-slate-900">Delete Group?</h2>
            <p className="text-slate-500 font-medium mb-8">
              Are you sure you want to remove <span className="text-slate-800 font-bold">{deletingGroup.name}</span>? This action can be undone later from the Removed Groups section.
            </p>

            <div className="flex justify-center gap-3">
              <button className="px-6 py-3 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-bold transition-all w-full" onClick={() => setDeletingGroup(null)}>
                Cancel
              </button>
              <button className="px-6 py-3 text-white bg-rose-500 hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-200 rounded-xl font-bold transition-all w-full" onClick={confirmDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}