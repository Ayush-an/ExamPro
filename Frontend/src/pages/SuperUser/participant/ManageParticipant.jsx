import React, { useEffect, useState } from "react";
import {
  fetchParticipants,
  fetchGroups,
  updateParticipant,
  deleteParticipant,
  fetchUploadedBatches
} from "../../../utils/api";
import {
  Users,
  Search,
  Filter,
  Edit3,
  Trash2,
  ChevronRight,
  MoreVertical,
  Mail,
  Phone,
  Layers,
  Archive,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const ManageParticipant = () => {
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [batchCodes, setBatchCodes] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    status: "",
    groupId: "",
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [participantsData, groupsData, batchesData] = await Promise.all([
        fetchParticipants(),
        fetchGroups(),
        fetchUploadedBatches()
      ]);

      const pList = Array.isArray(participantsData) ? participantsData : participantsData.participants || [];
      const gList = groupsData.groups || groupsData || [];

      setParticipants(pList);
      setFilteredParticipants(pList);
      setGroups(gList);

      // Normalize batches
      const rawBatches = batchesData?.batches || batchesData?.data || batchesData || [];
      const normalizedBatches = rawBatches.map(b => ({
        uploadBatchCode: b.batchCode || b.uploadBatchCode || "Unknown"
      })).filter(b => b.uploadBatchCode !== "Unknown");
      setBatchCodes(normalizedBatches);

    } catch (err) {
      toast.error("Telemetry synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  const getGroupName = (groupId) => {
    const group = groups.find((g) => g.id === groupId || g._id === groupId);
    return group?.groupName || group?.name || "Unassigned";
  };

  const handleSearch = () => {
    let result = [...participants];

    if (groupFilter) {
      result = result.filter((p) => {
        const gid = typeof p.groupId === "object" ? p.groupId?._id : p.groupId;
        return String(gid) === String(groupFilter);
      });
    }

    if (selectedBatch) {
      result = result.filter((p) => p.uploadBatchCode === selectedBatch);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) =>
        `${p.name} ${p.email} ${p.mobile}`.toLowerCase().includes(q)
      );
    }

    setFilteredParticipants(result);
  };

  useEffect(() => {
    handleSearch();
  }, [groupFilter, selectedBatch, searchQuery, participants]);

  const openEditModal = (p) => {
    setSelectedParticipant(p);
    setFormData({
      name: p.name,
      email: p.email,
      mobile: p.mobile,
      status: p.status,
      groupId: p.groupId,
    });
    setModalOpen(true);
  };

  const handleEditSave = async () => {
    try {
      await updateParticipant(selectedParticipant.id, formData);
      toast.success("Entity protocols updated");
      setModalOpen(false);
      loadInitialData();
    } catch (err) {
      toast.error("Protocol update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirm entity decommissioning?")) return;
    try {
      await deleteParticipant(id);
      toast.success("Entity decommissioned");
      loadInitialData();
    } catch (err) {
      toast.error("Decommissioning failed");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scanning Entity Grid...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-50">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Entity Master Registry</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Cross-unit participant oversight</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <select
              className="appearance-none pl-10 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none focus:bg-white focus:border-indigo-100 transition-all cursor-pointer min-w-[200px]"
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <option value="">All Operational Units</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <Layers size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-40" />
          </div>

          <div className="relative group">
            <select
              className="appearance-none pl-10 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none focus:bg-white focus:border-indigo-100 transition-all cursor-pointer min-w-[200px]"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
            >
              <option value="">All Provisioning Batches</option>
              {batchCodes.map((b, i) => <option key={i} value={b.uploadBatchCode}>{b.uploadBatchCode}</option>)}
            </select>
            <Archive size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-40" />
          </div>

          <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:border-indigo-100 transition-all w-full md:w-80 shadow-inner">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search identity matrix..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest placeholder:text-slate-300 w-full"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entity Identity</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Group</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Batch Origin</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temporal Log</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredParticipants.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <Users size={48} className="text-slate-400" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Registry Vacant</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredParticipants.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black group-hover:scale-110 transition cursor-pointer">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-900 tracking-tight group-hover:text-indigo-600 transition">{p.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-tighter"><Mail size={10} /> {p.email}</span>
                          <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-tighter"><Phone size={10} /> {p.mobile}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                      {getGroupName(p.groupId)}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-mono font-bold text-indigo-500 uppercase tracking-tight">
                      {p.uploadBatchCode || "Manual"}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${p.status === "Approved" || p.status === "Active"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}>
                      <span className={`w-1 h-1 rounded-full ${p.status === "Approved" || p.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-2"><Clock size={10} /> {new Date(p.createdAt).toLocaleDateString()}</p>
                      <p className="text-[8px] font-bold text-slate-300 italic">Auth ID: {p.id.slice(0, 8)}...</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(p)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/50 transition-all">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-600 hover:border-red-100 hover:shadow-lg hover:shadow-red-50/50 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="p-10 border-b border-slate-50">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Entity Profile</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Identity parameter adjustment</p>
              </div>
              <div className="p-10 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold uppercase tracking-widest transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Communication Link (Email)</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold uppercase tracking-widest transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Mobile Hub</label>
                      <input type="text" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold uppercase tracking-widest transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Operational Status</label>
                      <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold uppercase tracking-widest transition-all appearance-none cursor-pointer">
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Assigned Unit</label>
                    <select value={formData.groupId} onChange={(e) => setFormData({ ...formData, groupId: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold uppercase tracking-widest transition-all appearance-none cursor-pointer">
                      {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setModalOpen(false)} className="flex-1 px-8 py-5 bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-100 transition-all border border-slate-100">Abort</button>
                  <button onClick={handleEditSave} className="flex-1 px-8 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-100">Commit Changes</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageParticipant;
