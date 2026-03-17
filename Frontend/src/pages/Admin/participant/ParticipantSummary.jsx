import { useEffect, useState } from "react";
import { fetchUploadedBatches } from "../../../utils/api";

export default function ParticipantSummary() {
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const res = await fetchUploadedBatches();
        console.log("Loaded batches successfully:", res);
        setBatches(res.batches || res.data || []);
      } catch (err) {
        console.error("Failed to load batches:", err);
      }
    };
    loadBatches();
  }, []);

  return (
    <div className="relative p-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-semibold text-center text-gray-800">Participant Upload  Summary</h2>
      {batches.length === 0 ? (
        <p>No batches found.</p>
      ) : (
        <div className="overflow-x-auto bg-white">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-orange-200">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500">Batch Code</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500">Group</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500">File</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id}>
                  <td className="px-6 py-4 text-sm text-gray-700">{b.batchCode}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{b.Group?.name || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <a
                      href={b.filePath}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
