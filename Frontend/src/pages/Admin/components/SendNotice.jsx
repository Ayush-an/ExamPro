// src/components/admin/SendNotice.jsx

import { useEffect, useState } from "react";
import { fetchSuperUsersByOrg, sendAdminNotice } from "../../../utils/api";
import { toast } from "react-hot-toast";

export default function SendNotice({ onClose }) {
  const [title, setTitle] = useState("");

  const [message, setMessage] = useState("");
  const [superUsers, setSuperUsers] = useState([]);
  const [receiverType, setReceiverType] = useState("all");
  const [receiverId, setReceiverId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSuperUsers = async () => {
      try {
        const users = await fetchSuperUsersByOrg();
        setSuperUsers(users);
      } catch (err) {
        toast.error("Failed to load super users");
        setSuperUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadSuperUsers();
  }, []);

  useEffect(() => {
    const loadSuperUsers = async () => {
      const superUsers = await fetchSuperUsersByOrg();
      setSuperUsers(Array.isArray(superUsers) ? superUsers : []);

    };

    loadSuperUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim() || !title.trim()) {
      toast.error("Title and message are required");
      return;
    }

    let superUserIds = [];

    if (receiverType === "single") {
      if (!receiverId) {
        toast.error("Please select a super user");
        return;
      }
      superUserIds = [Number(receiverId)];
    }

    try {
      await sendAdminNotice({
        title,
        message,
        superUserIds, // ✅ THIS is what backend expects
      });

      toast.success("Notice sent successfully");
      onClose();
    } catch (err) {
      toast.error("Failed to send notice");
    }
  };


  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Send Notice</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Receiver Type */}
        <select
          value={receiverType}
          onChange={(e) => setReceiverType(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="all">All Super Users</option>
          <option value="single">One Super User</option>
        </select>

        {/* Select Super User */}
        {receiverType === "single" && (
          <select
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Super User</option>
            {superUsers?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        )}
        {/* Message */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Notice title"
          className="w-full p-2 border rounded"
        />

        <textarea
          rows="4"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter notice message..."
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
