import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { authFetch } from "../../../utils/api";

const EditQuestion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [question, setQuestion] = useState({
    question_text: "",
    option_1: "",
    option_2: "",
    option_3: "",
    option_4: "",
    correct_option: "",
    difficulty: "EASY",
  });

  /* ---------------- FETCH QUESTION ---------------- */
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await authFetch(`/api/question/${id}`);
        setQuestion(res);
      } catch {
        toast.error("Failed to load question");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [id, navigate]);

  /* ---------------- UPDATE ---------------- */
  const handleUpdate = async () => {
    try {
      await authFetch(`/api/question/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: question.question_text,
          option_1: question.option_1,
          option_2: question.option_2,
          option_3: question.option_3,
          option_4: question.option_4,
          correct_option: question.correct_option,
          difficulty: question.difficulty,
        }),
      });

      toast.success("Question updated successfully");
      navigate(-1);
    } catch {
      toast.error("Update failed");
    }
  };

  if (loading) return null;

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={() => navigate(-1)}
      />

      {/* DIALOG */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl animate-fade-in">

          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Edit Question</h2>
            <button
              onClick={() => navigate(-1)}
              className="text-2xl text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {/* BODY */}
          <div className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto">

            {/* QUESTION */}
            <div>
              <label className="block mb-1 font-medium">Question</label>
              <textarea
                value={question.question_text}
                onChange={(e) =>
                  setQuestion({ ...question, question_text: e.target.value })
                }
                className="w-full p-3 border rounded-md"
                rows={3}
              />
            </div>

            {/* OPTIONS */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                { key: "option_1", label: "Option 1" },
                { key: "option_2", label: "Option 2" },
                { key: "option_3", label: "Option 3" },
                { key: "option_4", label: "Option 4" },
              ].map((opt) => (
                <div key={opt.key}>
                  <label className="block mb-1 font-medium">{opt.label}</label>
                  <input
                    type="text"
                    value={question[opt.key]}
                    onChange={(e) =>
                      setQuestion({ ...question, [opt.key]: e.target.value })
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              ))}
            </div>

            {/* CORRECT OPTION */}
            <div>
              <label className="block mb-1 font-medium">Correct Option</label>
              <select
                value={question.correct_option}
                onChange={(e) =>
                  setQuestion({ ...question, correct_option: e.target.value })
                }
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select correct option</option>
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
                <option value="3">Option 3</option>
                <option value="4">Option 4</option>
              </select>
            </div>

            {/* DIFFICULTY */}
            <div>
              <label className="block mb-1 font-medium">Difficulty</label>
              <select
                value={question.difficulty}
                onChange={(e) =>
                  setQuestion({ ...question, difficulty: e.target.value })
                }
                className="w-full p-2 border rounded-md"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="px-6 py-2 text-white bg-blue-600 rounded"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditQuestion;
