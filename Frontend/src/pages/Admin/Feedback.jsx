import { useEffect, useState } from "react";
import { fetchFeedbacks } from "../../utils/api";

export default function Feedbacks({ onClose }) {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const loadFeedbacks = async () => {
      const data = await fetchFeedbacks();
      setFeedbacks(data);
    };
    loadFeedbacks();
  }, []);

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">Participant Feedbacks</h2>
      <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
        {feedbacks.map((fb) => (
          <li key={fb.id} className="p-2 border rounded">
            <p>
              <strong>{fb.senderName} ({fb.senderRole}):</strong> {fb.message}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(fb.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
