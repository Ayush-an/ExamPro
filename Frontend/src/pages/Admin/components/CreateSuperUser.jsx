import { useState } from "react";
import { toast } from "react-hot-toast";
export default function CreateSuperUser({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", email: "", mobile: "", password: "" });
  const [loading, setLoading] = useState(false);
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        adminId: user.id,
        organizationId: user.organizationId,
      };

      const res = await fetch(`${API}/api/admin/create-superuser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to create SuperUser");

      toast.success("SuperUser created successfully");
      onCreated && onCreated(data.superUser);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="mb-4 text-lg font-bold text-center">Create SuperUser</h2>

      <input
        type="text"
        name="name"
        placeholder="Name"
        className="w-full px-3 py-2 border rounded-md"
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        className="w-full px-3 py-2 border rounded-md"
        onChange={handleChange}
      />
      <input
        type="text"
        name="mobile"
        placeholder="Mobile Number"
        className="w-full px-3 py-2 border rounded-md"
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        className="w-full px-3 py-2 border rounded-md"
        onChange={handleChange}
      />

      <div className="flex justify-end gap-2 mt-5">
        <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={onClose}>Cancel</button>
        <button
          className={`px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </div>
  );
}
