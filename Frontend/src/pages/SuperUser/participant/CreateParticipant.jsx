import { fetchSuperUserGroups, createSuperUserSingleParticipant, uploadSuperUserParticipantsExcel } from "../../../utils/api";
import {
  UserPlus,
  X,
  Layers,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Shield,
  Download,
  AlertCircle,
  Database,
  Send,
  User,
  Mail,
  Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function CreateParticipant({ onClose }) {
  const fileRef = useRef();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    groupId: "",
  });

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const data = await fetchSuperUserGroups();
        setGroups(data.groups || data || []);
      } catch (err) {
        toast.error("Unit registry sync failed");
      }
    };
    loadGroups();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: false });
  };

  const downloadFormat = () => {
    const csv = "name,email,mobile\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Entity_Payload_Format.csv";
    a.click();
    toast.success("Payload template downloaded");
  };

  const handleExcelUpload = async () => {
    if (!formData.groupId) return toast.error("Target unit selection missing");
    if (!excelFile) return toast.error("No intelligence payload (file) selected");
    setLoading(true);
    try {
      const res = await uploadSuperUserParticipantsExcel(formData.groupId, excelFile);
      toast.success(`Synchronized ${res.created} entities`);
      if (res.skipped?.length) toast(`${res.skipped.length} collisions identified`, { icon: "⚠️" });
      onClose();
    } catch {
      toast.error("Bulk synchronization Protocol Failure");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const err = {};
    if (!formData.name) err.name = true;
    if (!formData.email) err.email = true;
    if (!formData.groupId) err.groupId = true;
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleCreateSingle = async (e) => {
    e.preventDefault();
    if (!validate()) return toast.error("Entity parameters incomplete");

    setLoading(true);
    try {
      await createSuperUserSingleParticipant(formData);
      toast.success("Entity provisioned successfully");
      onClose();
    } catch (err) {
      toast.error(err.message || "Entity provisioning failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-0 text-left">
      <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10 rounded-t-[44px]">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Participant</h2>
          <p className="text-[10px] text-slate-400 font-bold mt-1">Add a new participant to a group.</p>
        </div>
        <button onClick={onClose} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition"><X size={20} /></button>
      </div>

      <div className="flex flex-col lg:flex-row max-h-[75vh]">
        {/* Left: Bulk Sync */}
        <div className="w-full lg:w-80 bg-slate-50 p-10 space-y-8 border-r border-slate-100">
          <div>
            <h3 className="text-[10px] font-black text-slate-900 tracking-wide mb-6 flex items-center gap-2">
              <Database size={14} className="text-indigo-600" /> Bulk Import
            </h3>
            <div className="space-y-4">
              <button onClick={downloadFormat} className="w-full flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 text-[9px] font-bold tracking-wide hover:border-indigo-100 hover:text-indigo-600 transition shadow-sm">
                CSV Template <Download size={14} />
              </button>
              <div className="relative">
                <input ref={fileRef} type="file" accept=".xlsx,.csv" onChange={(e) => setExcelFile(e.target.files[0])} className="hidden" id="entity-upload" />
                <label htmlFor="entity-upload" className="w-full flex items-center justify-between p-6 bg-white border border-dotted border-slate-300 rounded-[32px] text-[9px] font-bold tracking-wide hover:border-indigo-300 cursor-pointer shadow-inner transition text-slate-400">
                  {excelFile ? excelFile.name.slice(0, 15) + '...' : 'Select CSV File'} <Upload size={14} />
                </label>
              </div>
              <button onClick={handleExcelUpload} disabled={!excelFile || !formData.groupId || loading} className="w-full py-5 bg-slate-900 text-white rounded-[24px] text-[9px] font-black tracking-wide disabled:opacity-20 hover:bg-black transition shadow-xl shadow-slate-200 flex items-center justify-center gap-2">
                <Send size={14} /> Import Participants
              </button>
            </div>
          </div>

          <div className="p-6 bg-indigo-50/50 rounded-[32px] border border-indigo-100/50">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle size={14} className="text-indigo-400" />
              <span className="text-[9px] font-black text-indigo-900 tracking-wide">Note</span>
            </div>
            <p className="text-[9px] font-bold text-slate-500 leading-relaxed tracking-wide">
              Ensure all email identifiers are unique to prevent collisions.
            </p>
          </div>
        </div>

        {/* Right: Manual Provisioning */}
        <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
          <form onSubmit={handleCreateSingle} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 ml-4">Select Group</label>
                <select name="groupId" value={formData.groupId} onChange={handleChange} className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold appearance-none cursor-pointer transition-all ${errors.groupId ? 'border-rose-200 bg-rose-50' : 'border-slate-50'}`}>
                  <option value="">Choose Group</option>
                  {groups.map((grp, i) => (
                    <option key={i} value={grp.id || grp._id}>{grp.groupName || grp.name || "Unnamed Group"}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 ml-4">Full Name</label>
                  <div className="relative group/input">
                    <input type="text" name="name" placeholder="Ex: John Doe" className={`w-full pl-14 pr-6 py-4 bg-slate-50 border rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold transition-all shadow-inner ${errors.name ? 'border-rose-200 bg-rose-50' : 'border-slate-50'}`} value={formData.name} onChange={handleChange} required />
                    <User size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 ml-4">Email Address</label>
                  <div className="relative group/input">
                    <input type="email" name="email" placeholder="john@example.com" className={`w-full pl-14 pr-6 py-4 bg-slate-50 border rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold transition-all shadow-inner ${errors.email ? 'border-rose-200 bg-rose-50' : 'border-slate-50'}`} value={formData.email} onChange={handleChange} required />
                    <Mail size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 ml-4">Mobile Number (Optional)</label>
                <div className="relative group/input">
                  <input type="text" name="mobile" placeholder="+1 234 567 890" className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-100 outline-none text-[10px] font-bold transition-all shadow-inner" value={formData.mobile} onChange={handleChange} />
                  <Smartphone size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 sticky bottom-0 bg-white border-t border-slate-50 py-4">
              <button type="button" onClick={onClose} className="px-8 py-5 bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-400 hover:bg-slate-100 transition-all border border-slate-100">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 px-8 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-bold text-indigo-400 hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3">
                <UserPlus size={16} /> {loading ? 'Creating...' : 'Create Participant'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}