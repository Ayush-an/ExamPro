// src/components/question/StagingQuestion.jsx
import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { authFetch, fetchExams } from "../../../utils/api";

const StagingQuestion = () => {
  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    loadInitial();
  }, []);

  const loadInitial = async () => {
    try {
      setLoading(true);
      const [qRes, eRes] = await Promise.all([
        authFetch("/api/question"), // ✅ correct route
        fetchExams(),
      ]);

      setQuestions(qRes.data || qRes);
      setExams(eRes.data || eRes);
    } catch (err) {
      toast.error("Failed to load staging data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- GROUP QUESTIONS BY EXAM ---------------- */
  const examSummary = useMemo(() => {
    const map = {};

    questions.forEach((q) => {
      if (!map[q.examId]) {
        map[q.examId] = {
          examId: q.examId,
          examTitle: q.exam?.title || "-",
          createdBy: q.createdByName || "-",
          createdAt: q.exam?.created_at || null,
          updatedAt: q.updated_at,
          groups: new Set(), // store exam groups
          totalQuestions: 0,
          questionIds: [],
        };

        // ✅ Add all exam groups
        if (q.exam?.Groups?.length) {
          q.exam.Groups.forEach((g) => map[q.examId].groups.add(g.name));
        }
      }

      map[q.examId].totalQuestions += 1;
      map[q.examId].questionIds.push(q.id);
    });

    return Object.values(map).filter(
      (e) => !selectedExam || e.examId === Number(selectedExam)
    );
  }, [questions, selectedExam]);

  /* ---------------- EXCEL EXPORT ---------------- */
  const downloadExcel = () => {
    if (!examSummary.length) {
      toast.error("No data to export");
      return;
    }
    const data = examSummary.map((e, i) => ({
      Sr: i + 1,
      Exam: e.examTitle,
      Groups: Array.from(e.groups).join(", "),
      "Total Questions": e.totalQuestions,
      "Created By": e.createdBy,
      "Created At": e.createdAt
        ? new Date(e.createdAt).toLocaleDateString()
        : "-",
      "Updated At": e.updatedAt
        ? new Date(e.updatedAt).toLocaleDateString()
        : "-",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staging Exams");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "Staging_Exam_Report.xlsx");
  };

  /* ---------------- BULK ACTIONS ---------------- */
  const deleteAllQuestions = async (questionIds) => {
    if (!window.confirm("Delete all questions for this exam?")) return;
    try {
      await authFetch("/api/question/delete-multiple", {
        method: "POST",
        body: JSON.stringify({ questionIds }),
        headers: { "Content-Type": "application/json" },
      });
      toast.success("All questions deleted successfully");
      loadInitial();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete questions");
    }
  };


  return (
    <div className="relative p-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-semibold text-center text-gray-800">
        Staging Questions
      </h2>

      {/* FILTER + EXPORT */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <select
          value={selectedExam}
          onChange={(e) => setSelectedExam(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Exams</option>
          {exams.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>

        <button
          onClick={downloadExcel}
          className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700"
        >
          ⬇ Export Excel
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-orange-200">
            <tr>
              {["Sr", "Exam", "Groups", "Total Questions", "Created By", "Created At", "Updated At", "Actions",].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-gray-700">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="py-10 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : examSummary.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-10 text-center text-gray-500">
                  No staging data found
                </td>
              </tr>
            ) : (
              examSummary.map((e, i) => (
                <tr key={e.examId} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{e.examTitle}</td>
                  <td className="px-4 py-3">
                    {Array.from(e.groups).join(", ") || "-"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-600">
                    {e.totalQuestions}
                  </td>
                  <td className="px-4 py-3">{e.createdBy}</td>
                  <td className="px-4 py-3">
                    {e.createdAt
                      ? new Date(e.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {e.updatedAt
                      ? new Date(e.updatedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="flex gap-2 px-4 py-3">
                    <button
                      className="px-3 py-1 text-sm text-red-600 rounded "
                      onClick={() => deleteAllQuestions(e.questionIds)}
                    >
                      Delete All Questions
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default StagingQuestion;