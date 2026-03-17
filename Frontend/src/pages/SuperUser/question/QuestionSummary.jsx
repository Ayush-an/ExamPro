// src/components/question/QuestionSummary.jsx
import { useEffect, useState } from "react";
import { fetchQuestionBatches } from "../../../utils/api";

export default function QuestionSummary() {
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    fetchQuestionBatches().then((res) => setBatches(res.batches));
  }, []);

  return (
    <div className="relative p-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-semibold text-center text-gray-800">Question Upload Summary</h2>
      <div className="overflow-x-auto bg-white">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-orange-200">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-5000">Batch Code</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500">Exam</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500">File</th>
            </tr>
          </thead>

          <tbody>
            {batches.map((b) => (
              <tr key={b.id}>
                <td className="px-6 py-4 text-sm text-gray-700">{b.uploadBatchCode}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{b.Exam?.title}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <a href={b.filePath} className="text-blue-600 underline">
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
