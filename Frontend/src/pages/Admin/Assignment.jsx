// src/components/Assignment.jsx
import { useState, useEffect } from "react";
import { fetchGroups, uploadAssignment } from "../../utils/api";
import { toast } from "react-hot-toast";

export default function Assignments({ onClose }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Load groups under SuperUser's organization
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const allGroups = await fetchGroups();
        setGroups(allGroups);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load groups");
      }
    };
    loadGroups();
  }, []);

  // Toggle group selection
  const toggleGroup = (id) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  // Handle assignment upload
  const handleUpload = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    if (selectedGroups.length === 0) {
      toast.error("Select at least one group");
      return;
    }

    setLoading(true);
    try {
      for (const groupId of selectedGroups) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("groupId", groupId);

        await uploadAssignment(formData);
      }

      toast.success("Assignment sent successfully!");
      setFile(null);
      setSelectedGroups([]);
      setTitle("");
      setDescription("");
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to send assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="mb-2 text-xl font-bold">Send Assignment</h2>

      {/* Title */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="Enter assignment title"
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="Enter description"
        />
      </div>

      {/* Groups Selection */}
      <div className="mb-4">
        <h3 className="mb-2 font-semibold">Select Groups</h3>
        {groups.map((group) => (
          <label key={group.id} className="flex items-center mb-1 space-x-2">
            <input
              type="checkbox"
              checked={selectedGroups.includes(group.id)}
              onChange={() => toggleGroup(group.id)}
            />
            <span>{group.name}</span>
          </label>
        ))}
      </div>

      {/* File Input */}
      <div className="mb-4">
        <h3 className="mb-2 font-semibold">Select File</h3>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      </div>

      {/* Submit */}
      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Send Assignment"}
      </button>
    </div>
  );
}
