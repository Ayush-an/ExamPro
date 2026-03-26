import React, { useEffect, useState } from "react";
import { Building2, Mail, Phone, MapPin, Users, UserCheck, ShieldCheck, Globe2, Landmark } from "lucide-react";
import { fetchSuperUsersByOrg } from "../../../utils/api";

const AdminProfilePopup = ({ user, onClose }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const data = await fetchSuperUsersByOrg();
        setAdmins(data);
      } catch (err) {
        console.error("Failed to fetch admins:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAdmins();
  }, []);

  const org = user?.Organization || {};

  return (
    <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
      {/* Basic Header */}
      <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
          {org.name ? org.name.charAt(0) : "O"}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{org.name || "N/A"}</h2>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1">
            <ShieldCheck size={12} /> Verified Profile
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Organization Info */}
        <section className="space-y-3">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Building2 size={12} /> Organization Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <DetailItem icon={Mail} label="Email" value={org.email} />
            <DetailItem icon={Phone} label="Phone" value={org.phone} />
            <DetailItem icon={Globe2} label="Country" value={org.country} />
            <DetailItem icon={Landmark} label="State" value={org.state} />
            <DetailItem icon={MapPin} label="Address" value={org.address ? `${org.address}, ${org.city || ''}` : null} fullWidth />
          </div>
        </section>

        {/* Current Admin Info */}
        <section className="space-y-3">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <UserCheck size={12} /> Admin
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50">
            <DetailItem icon={UserCheck} label="Name" value={user?.full_name} />
            <DetailItem icon={Mail} label="Email" value={user?.email} />
            <DetailItem icon={Phone} label="Mobile" value={user?.mobile} />
          </div>
        </section>
      </div>

      {/* Simplified Footer */}
      <div className="pt-2 border-t border-slate-100 flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-600 transition shadow-lg shadow-slate-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const DetailItem = ({ icon: Icon, label, value, fullWidth }) => (
  <div className={`flex items-start gap-3 ${fullWidth ? 'md:col-span-2' : ''}`}>
    <div className="mt-1 text-slate-400">
      <Icon size={14} />
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-[9px] font-bold text-slate-400 tracking-wider">{label}</span>
      <span className="text-sm font-medium text-slate-700 truncate">
        {value || <span className="text-slate-300 italic">Not set</span>}
      </span>
    </div>
  </div>
);

export default AdminProfilePopup;
