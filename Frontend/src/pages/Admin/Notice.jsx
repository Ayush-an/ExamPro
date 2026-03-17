// exampro-frontend/src/components/Notice.jsx
import { useEffect, useState } from "react";
import { fetchSuperUsersByOrg, sendAdminNotice } from "../../utils/api";
import { toast } from "react-hot-toast";

export default function Notice({ onClose }) {
  const [superUsers, setSuperUsers] = useState([]);
  const [selectedSuperUsers, setSelectedSuperUsers] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Load SuperUsers
  useEffect(() => {
    fetchSuperUsersByOrg()
      .then(setSuperUsers)
      .catch(() => toast.error("Failed to load superusers"));
  }, []);

  const toggleSuperUser = (id) => {
    setSelectedSuperUsers((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }

    try {
      setLoading(true);

      await sendAdminNotice({
        title,
        message,
        superUserIds: selectedSuperUsers, // empty ⇒ AllSuperUsers
      });

      toast.success("Notice sent successfully");
      setTitle("");
      setMessage("");
      setSelectedSuperUsers([]);

      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error("Failed to send notice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-4 mx-auto">
      <h2 className="mb-4 text-xl font-bold">Send Notice</h2>

      {/* Title */}
      <input
        type="text"
        placeholder="Notice Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />

      {/* Message */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your notice..."
        className="w-full p-2 mb-4 border rounded"
      />

      {/* SuperUser Selection */}
      <div className="mb-4">
        <h3 className="mb-2 font-semibold">
          Select SuperUsers (leave empty for all)
        </h3>

        {superUsers.length === 0 ? (
          <p className="text-gray-500">No superusers available</p>
        ) : (
          superUsers.map((su) => (
            <label key={su.id} className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                checked={selectedSuperUsers.includes(su.id)}
                onChange={() => toggleSuperUser(su.id)}
              />
              <span>{su.name || su.email}</span>
            </label>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={handleSend}
          disabled={loading}
          className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Notice"}
        </button>

        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}