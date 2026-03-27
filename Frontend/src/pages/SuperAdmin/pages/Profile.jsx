import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Lock, Camera, Save, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { fetchSuperAdminProfile, updateSuperAdminProfile, updateSuperAdminPassword, uploadSuperAdminPhoto } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";

const Profile = () => {
    const { user: authUser, setUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const [profileData, setProfileData] = useState({
        full_name: "",
        email: "",
        mobile: "",
        photo: ""
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await fetchSuperAdminProfile();
                setProfileData({
                    full_name: data.full_name || "",
                    email: data.email || "",
                    mobile: data.mobile || "",
                    photo: data.photo || ""
                });
            } catch (error) {
                console.error("Failed to fetch profile", error);
                setMessage({ type: "error", text: "Failed to load profile data" });
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setMessage({ type: "", text: "" });
        try {
            const res = await updateSuperAdminProfile({
                full_name: profileData.full_name,
                email: profileData.email,
                mobile: profileData.mobile
            });
            setMessage({ type: "success", text: res.message });
            // Update auth context
            setUser({ ...authUser, ...res.user });
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.error || "Update failed" });
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return setMessage({ type: "error", text: "Passwords do not match" });
        }
        setUpdating(true);
        setMessage({ type: "", text: "" });
        try {
            const res = await updateSuperAdminPassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: "success", text: res.message });
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.error || "Password update failed" });
        } finally {
            setUpdating(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUpdating(true);
        setMessage({ type: "", text: "" });
        try {
            const res = await uploadSuperAdminPhoto(file);
            setProfileData({ ...profileData, photo: res.photo });
            setMessage({ type: "success", text: "Photo updated successfully" });
            // Update auth context
            setUser({ ...authUser, photo: res.photo });
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.error || "Photo upload failed" });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const photoUrl = profileData.photo
        ? `${import.meta.env.VITE_API_URL}/uploads/superadmin/${profileData.photo}`
        : "https://i.pravatar.cc/150";

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">SuperAdmin Profile</h1>
                    <p className="text-slate-500 font-medium">Manage your account details and security settings</p>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="text-sm font-bold">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Photo Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 text-center">
                        <div className="relative inline-block group">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-slate-50 shadow-lg mb-4">
                                <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <label className="absolute bottom-6 right-0 w-10 h-10 bg-indigo-600 text-white rounded-xl shadow-lg flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition group-hover:scale-110">
                                <Camera size={18} />
                                <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                            </label>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">{profileData.full_name}</h3>
                        <p className="text-xs font-bold text-indigo-600 tracking-widest mt-1">System Administrator</p>
                    </div>
                </div>

                {/* Edit Forms */}
                <div className="md:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                <User size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Personal Information</h2>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[15px] font-bold text-slate-400 tracking-widest ml-1 mb-1 block">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={profileData.full_name}
                                            onChange={handleProfileChange}
                                            required
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-3xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[15px] font-bold text-slate-400 tracking-widest ml-1 mb-1 block">Mobile Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            name="mobile"
                                            value={profileData.mobile}
                                            onChange={handleProfileChange}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-[15px] font-bold text-slate-400 tracking-widest ml-1 mb-1 block">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleProfileChange}
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-3xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="px-8 py-3 bg-indigo-600 text-white rounded-3xl font-bold text-xs tracking-wider hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {updating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                                <Lock size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Security Settings</h2>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="space-y-6">
                            <div>
                                <label className="text-[15px] font-bold text-slate-400 tracking-widest ml-1 mb-1 block">Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-3xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[15px] font-bold text-slate-400 tracking-widest ml-1 mb-1 block">New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-3xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="text-[15px] font-bold text-slate-400 tracking-widest ml-1 mb-1 block">Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-3xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="px-8 py-3 bg-slate-900 text-white rounded-3xl font-bold text-xs tracking-wider hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {updating ? <Loader2 className="animate-spin" size={16} /> : <Lock size={16} />}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Icon
const ShieldCheck = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

export default Profile;
