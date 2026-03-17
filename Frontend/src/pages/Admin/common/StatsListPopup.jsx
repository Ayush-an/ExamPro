import { useEffect, useState } from "react";

export default function StatsListPopup({ title, fetchFn, renderItem, onClose }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchFn();

        // 🔥 SAFETY: Normalize response
        if (Array.isArray(res)) {
          setData(res);
        } else if (Array.isArray(res?.data)) {
          setData(res.data);
        } else if (Array.isArray(res?.rows)) {
          setData(res.rows);
        } else {
          console.warn("Unexpected API response:", res);
          setData([]);
        }
      } catch (err) {
        console.error(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">{title}</h2>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}

      {!loading && data.length === 0 && (
        <p className="text-sm text-gray-500">No data found</p>
      )}

      <div className="space-y-2">
        {data.map(renderItem)}
      </div>

      <div className="mt-6 text-right">
        <button
          onClick={onClose}
          className="px-4 py-2 text-white bg-gray-600 rounded hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
