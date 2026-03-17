// src/components/admin/SendFeedback.jsx
import { useState } from "react";
import { sendAdminFeedback } from "../../../utils/api"; // We'll define this

export default function SendFeedback({ onClose }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return alert("Please enter a message");

    setLoading(true);
    try {
      await sendAdminFeedback({ message });
      alert("Feedback sent to SuperAdmin!");
      setMessage("");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to send feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Send Feedback to SuperAdmin</h2>
      <textarea
        rows={6}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Write your feedback here..."
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={handleSend}
          disabled={loading}
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Feedback"}
        </button>
      </div>
    </div>
  );
}
