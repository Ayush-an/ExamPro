// src/components/participant/ManageParticipant.jsx
import React, { useEffect, useState } from "react";
import { fetchParticipants, fetchGroups, updateParticipant, deleteParticipant, fetchUploadedBatches } from "../../../utils/api";
import { Search, Pencil, Trash2, X, Users, AlertTriangle, ShieldAlert } from "lucide-react";

const ManageParticipant = () => {
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [batchCodes, setBatchCodes] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    status: "",
    groupId: "",
  });

  // Toast state
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadGroups();
    loadParticipants();
    loadBatchCodes();
  }, []);


  const normalizeBatches = (raw) => {
    const list = raw?.batches || raw?.data || raw || [];

    return list
      .map((item) => {
        const b = item?.dataValues || item;
        if (!b) return null;

        // ✅ YOUR ACTUAL FIELD
        if (b.batchCode) {
          return { uploadBatchCode: b.batchCode };
        }

        // Backward safety
        if (b.uploadBatchCode) {
          return { uploadBatchCode: b.uploadBatchCode };
        }

        return null;
      })
      .filter(Boolean);
  };




  const loadBatchCodes = async () => {
    try {
      const data = await fetchUploadedBatches();
      console.log("RAW BATCH RESPONSE 👇", data); // 👈 IMPORTANT
      const normalized = normalizeBatches(data);
      console.log("NORMALIZED 👇", normalized);
      setBatchCodes(normalized);
      console.log("FIRST BATCH ITEM 👇", data.batches[0]);
      console.log("BATCH KEYS 👇", Object.keys(data.batches[0]));

    } catch (err) {
      addToast("Failed to load batch codes", "error");
    }
  };




  const loadParticipants = async () => {
    try {
      const data = await fetchParticipants();
      const list = Array.isArray(data) ? data : data.participants || [];
      setParticipants(list);
      setFilteredParticipants(list);
    } catch (err) {
      addToast("Error loading participants", "error");
    }
  };

  const loadGroups = async () => {
    try {
      const data = await fetchGroups();
      const list = data.groups || data;
      setGroups(list);
    } catch (err) {
      addToast("Error loading groups", "error");
    }
  };

  const getGroupName = (groupId) => {
    const group = groups.find((g) => g.id === groupId || g._id === groupId);
    return group?.groupName || group?.name || `Group ${groupId}`;
  };

  const handleSearch = async () => {
    try {
      let result = [...participants];

      // 🔹 GROUP FILTER
      if (batchFilter) {
        result = result.filter((p) => {
          const gid =
            typeof p.groupId === "object" ? p.groupId?._id : p.groupId;
          return String(gid) === String(batchFilter);
        });
      }

      // 🔹 BATCH FILTER
      if (selectedBatch) {
        result = result.filter(
          (p) => p.uploadBatchCode === selectedBatch
        );
      }

      // 🔹 SEARCH FILTER
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        result = result.filter((p) =>
          `${p.name} ${p.email} ${p.mobile}`.toLowerCase().includes(q)
        );
      }

      setFilteredParticipants(result);
    } catch (err) {
      console.error(err);
      addToast("Failed to filter participants", "error");
    }
  };

  useEffect(() => {
    handleSearch();
  }, [batchFilter, selectedBatch, searchQuery, participants]);


  // ---------- TOAST ----------
  const addToast = (message, type = "success") => {
    // ❌ Prevent duplicate messages
    if (toasts.some((t) => t.message === message && t.type === type)) {
      return;
    }

    const id = crypto.randomUUID(); // ✅ FIXED key issue
    const newToast = { id, message, type, show: false };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, show: true } : t))
      );
    }, 50);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, show: false } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 500);
    }, 3000);
  };

  // ---------- EDIT HANDLERS ----------
  const openEditModal = (participant) => {
    setSelectedParticipant(participant);
    setFormData({
      name: participant.name,
      email: participant.email,
      mobile: participant.mobile,
      status: participant.status,
      groupId: participant.groupId,
    });
    setModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    try {
      await updateParticipant(selectedParticipant.id, formData);
      addToast("Participant updated successfully", "success");
      setModalOpen(false);
      loadParticipants();
    } catch (err) {
      console.error("Failed to update participant:", err);
      addToast("Failed to update participant", "error");
    }
  };

  // ---------- DELETE HANDLERS ----------
  const openDeleteModal = (participant) => {
    setSelectedParticipant(participant);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteParticipant(selectedParticipant.id);
      addToast("Participant deleted successfully", "success");
      setDeleteModalOpen(false);
      loadParticipants();
    } catch (err) {
      console.error("Failed to delete participant:", err);
      addToast("Failed to delete participant", "error");
    }
  };

  return (
    <div className="w-full relative">

      {/* Toast Notifications */}
      <div className="fixed z-[100] flex flex-col gap-2 top-5 right-5">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`transform transition-all duration-500 ease-in-out px-6 py-4 rounded-xl shadow-xl font-bold text-sm text-white flex items-center gap-3
        ${t.type === "success" ? "bg-emerald-500 shadow-emerald-500/20" : "bg-rose-500 shadow-rose-500/20"} 
        ${t.show ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"}`}
          >
            {t.message}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Participants</h2>
          <p className="text-sm text-slate-500 mt-1">View, filter, and edit user accounts.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 mb-8 flex flex-wrap items-center gap-4">
        <select className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none" value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}   >
          <option value="">All Groups</option>
          {groups.map((g) => (
            <option key={g.id || g._id} value={g.id || g._id}>
              {g.groupName || g.name}
            </option>
          ))}
        </select>
        <select
          className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
        >
          <option value="">All Batches</option>
          {batchCodes.map((b, i) => (
            <option
              key={b.uploadBatchCode || i}
              value={b.uploadBatchCode}
            >
              {b.uploadBatchCode}
            </option>
          ))}
        </select>

        <div className="flex-grow relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input type="text" placeholder="Search by name, email, or mobile..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <button onClick={handleSearch} className="px-6 py-2.5 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all"
        > Search </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Participant Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Contact Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Group & Batch</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredParticipants.length > 0 ? (
                filteredParticipants.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition duration-150">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{p.name}</div>
                      <div className="text-xs font-medium text-slate-400 mt-1">Joined: {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-indigo-600 hover:text-indigo-700">{p.email}</div>
                      <div className="text-xs font-medium text-slate-500 mt-1">{p.mobile || "—"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-700">{getGroupName(p.groupId)}</div>
                      <div className="text-xs font-medium text-slate-400 mt-1 font-mono">{p.uploadBatchCode ? `Batch: ${p.uploadBatchCode}` : "Direct Entry"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${p.status === "Approved" || p.status === "Active" ? "bg-emerald-50 text-emerald-600" :
                          p.status === "Pending" ? "bg-amber-50 text-amber-600" :
                            "bg-rose-50 text-rose-600"
                        }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" onClick={() => openEditModal(p)} title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" onClick={() => openDeleteModal(p)} title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-12 h-12 text-slate-200 mb-4" />
                      <p>No participants found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 w-[480px] shadow-2xl relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
            <h3 className="mb-6 text-2xl font-extrabold text-slate-900">Edit Participant</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                <input type="text" name="name" placeholder="John Doe" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800" value={formData.name} onChange={handleEditChange} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                <input type="email" name="email" placeholder="john@example.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800" value={formData.email} onChange={handleEditChange} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Mobile Number</label>
                <input type="text" name="mobile" placeholder="+1234567890" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800" value={formData.mobile || ''} onChange={handleEditChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Status</label>
                  <select name="status" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800 outline-none" value={formData.status} onChange={handleEditChange}>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Assigned Group</label>
                  <select name="groupId" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800 outline-none" value={formData.groupId} onChange={handleEditChange}>
                    {groups.map((g) => (
                      <option key={g.id || g._id} value={g.id || g._id}>{g.groupName || g.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
              <button className="px-6 py-3 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-bold transition-all" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 rounded-xl font-bold transition-all" onClick={handleEditSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 w-[400px] shadow-2xl relative text-center">
            <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="mb-2 text-2xl font-extrabold text-slate-900">Confirm Deletion</h3>
            <p className="text-slate-500 font-medium mb-8">Are you sure you want to permanently delete <strong className="text-slate-800">{selectedParticipant?.name}</strong>? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-bold transition-all" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
              <button className="flex-1 py-3 text-white bg-rose-600 hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-200 rounded-xl font-bold transition-all" onClick={handleDeleteConfirm}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ManageParticipant;