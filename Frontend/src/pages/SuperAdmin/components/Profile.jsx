// src/components/Profile.jsx
import { useState } from "react";
import getUser from "../utils/getUser";
import { updateSuperAdminPhoto } from "../utils/api";
const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function Profile() {
  const user = getUser();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    photo: user?.photo || "",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile photo 
const handlePhotoChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const res = await updateSuperAdminPhoto(file);

    // ✅ Update React state
    setFormData((prev) => ({
      ...prev,
      photo: res.photo,
    }));

    // ✅ UPDATE LOCAL STORAGE USER
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const updatedUser = { ...storedUser, photo: res.photo };

    localStorage.setItem("user", JSON.stringify(updatedUser));

  } catch (err) {
    console.error("Photo upload failed:", err.response?.data?.message || err.message);
    alert(err.response?.data?.message || "Upload failed");
  }
};


  const handleSave = () => {
    console.log("Saved profile:", formData);
    setEditing(false);
  };

  return (
    <div className="w-full max-w-xl p-6 mx-auto bg-white shadow-lg card fade-in dark:bg-gray-800 rounded-xl">
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 overflow-hidden rounded-full shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600">
          {formData.photo ? (
  <img
    src={`${BACKEND_URL}/uploads/superadmin/${formData.photo}`}
    alt="profile"
    className="object-cover w-full h-full"
  />
) : (
  <span className="flex items-center justify-center w-full h-full text-4xl text-white">
    {formData.name?.charAt(0) || "U"}
  </span>
)}

          {editing && (
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold">{formData?.name || "Unknown User"}</h2>
          <p className="text-gray-600 dark:text-gray-300">
            {user?.role || "Role Unknown"} • 2BRAINS
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {editing ? (
          <>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="w-full p-2 border rounded"/>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border rounded"/>
            <div className="flex gap-3 mt-2">
              <button className="flex-1 btn-primary" onClick={handleSave}>
                Save
              </button>
              <button className="flex-1 btn-secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p>
              <strong>Email:</strong> {formData.email}
            </p>
            <button className="w-full mt-3 btn-primary" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
}