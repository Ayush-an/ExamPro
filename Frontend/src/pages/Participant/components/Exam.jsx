import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchQuestionsByExam } from "../../../utils/api";
import {
  Clock,
  Send,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Timer,
  Database,
  CheckCircle2,
  XCircle,
  Target,
  Zap,
  Info,
  Layers,
  Layout,
  BookOpen,
  Flag,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function Exam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [result, setResult] = useState(null);
  const [examStartTime, setExamStartTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/exam/${examId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setExam(data);
        setTimeLeft(data.duration * 60);
        setExamStartTime(new Date());

        const qRes = await fetchQuestionsByExam(examId);
        setQuestions(Array.isArray(qRes?.data) ? qRes.data : []);
      } catch (err) {
        toast.error("Intelligence synchronization failure");
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [examId, token]);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = () => window.history.go(1);
    return () => (window.onpopstate = null);
  }, []);

  useEffect(() => {
    const blockNavigation = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", blockNavigation);
    return () => window.removeEventListener("beforeunload", blockNavigation);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0 || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t === 1) handleSubmit();
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const handleChange = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!questions.length) return;
      const examEndTime = new Date();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/exam/${examId}/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers, examStartTime, examEndTime }),
      });

      const data = await res.json();
      if (!data.success) return toast.error("Deployment Submission Protocal Failure");

      const r = data.result;
      setResult({
        correct: r.correct_answers,
        wrong: r.wrong_answers,
        total: questions.length,
        obtainedMarks: r.participant_marks,
        totalMarks: r.total_marks,
        percentage: r.score,
      });
      setSubmitted(true);
      toast.success("Intelligence Payload Transmitted");
    } catch (err) {
      toast.error("Critical Submission System Error");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10">
      <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-8 shadow-xl shadow-slate-100"></div>
      <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Initializing Mission Environment</h2>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-4">Calibrating assessment frequencies...</p>
    </div>
  );

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-[#fafbfc] p-10 flex flex-col items-center">
        <div className="w-full max-w-4xl space-y-10 animate-in fade-in zoom-in duration-700">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-emerald-50 rounded-[32px] mx-auto flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-100 border-4 border-white mb-8">
              <ShieldCheck size={48} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Mission Output Summary</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Post-assessment telemetry verified and recorded</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-8 bg-white border border-slate-100 rounded-[44px] shadow-sm flex flex-col items-center text-center">
              <CheckCircle2 size={24} className="text-emerald-500 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Accuracy Matrix</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{result.correct} <span className="text-xs text-slate-300 font-bold">/ {result.total}</span></p>
            </div>
            <div className="p-8 bg-white border border-slate-100 rounded-[44px] shadow-sm flex flex-col items-center text-center">
              <Target size={24} className="text-indigo-500 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Intelligence Score</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{result.obtainedMarks} <span className="text-xs text-slate-300 font-bold">PTS</span></p>
            </div>
            <div className="p-8 bg-white border border-slate-100 rounded-[44px] shadow-sm flex flex-col items-center text-center">
              <Zap size={24} className="text-amber-500 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Success Rate</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{result.percentage}%</p>
            </div>
            <div className="p-8 bg-slate-900 text-white rounded-[44px] shadow-xl shadow-slate-200 flex flex-col items-center text-center">
              <Layers size={24} className="text-indigo-400 mb-4" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Final Status</p>
              <p className="text-xl font-black uppercase tracking-tighter text-indigo-300">{result.percentage >= 40 ? 'VERIFIED' : 'DEFICIENT'}</p>
            </div>
          </div>

          <div className="flex gap-4">
            {!showAnswers ? (
              <button onClick={() => setShowAnswers(true)} className="flex-1 py-6 bg-white border-2 border-slate-900 text-slate-900 rounded-[32px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                <BookOpen size={18} /> View Signal Breakdown
              </button>
            ) : (
              <div className="w-full space-y-8 mt-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-px bg-slate-200 flex-1"></div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Intelligence Trace Breakdown</span>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>
                {questions.map((q, idx) => {
                  const userAns = answers[q.id || q._id];
                  const isCorrect = userAns && String(userAns) === String(q.correct_option);
                  return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={q.id || q._id} className="p-10 bg-white border border-slate-100 rounded-[44px] shadow-sm relative overflow-hidden">
                      <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-400 text-xs border border-slate-100 shadow-inner">
                            {idx + 1}
                          </div>
                          <h3 className="text-lg font-black text-slate-900 tracking-tight max-w-[500px]">{q.question_text}</h3>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${isCorrect ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                          {isCorrect ? 'SUCCESS' : 'FAILURE'}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[q.option_1, q.option_2, q.option_3, q.option_4].map((opt, i) => {
                          if (!opt) return null;
                          const isCorrectOpt = String(q.correct_option) === String(i + 1);
                          const isUserOpt = String(userAns) === String(i + 1);
                          return (
                            <div key={i} className={`p-6 rounded-3xl text-[10px] font-bold uppercase tracking-widest border transition-all ${isCorrectOpt ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : isUserOpt ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-slate-50 border-slate-50 text-slate-400 opacity-40'}`}>
                              <div className="flex items-center justify-between">
                                <span>{opt}</span>
                                {isCorrectOpt && <CheckCircle2 size={14} />}
                                {isUserOpt && !isCorrectOpt && <XCircle size={14} />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-center pt-10">
            <button onClick={() => navigate("/dashboard")} className="px-12 py-5 bg-slate-900 text-white rounded-[32px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl shadow-slate-200">Deinitialize & Return</button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-white flex flex-col h-screen overflow-hidden text-left">
      {/* HUD Header */}
      <header className="h-24 bg-slate-900 border-b border-white/5 px-12 flex items-center justify-between shrink-0 relative z-50">
        <div className="flex items-center gap-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white scale-110 shadow-lg shadow-indigo-500/30">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter leading-none">{exam?.title || "Active Deployment"}</h1>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
              <Zap size={10} className="fill-indigo-400" /> Assessment Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="hidden md:flex flex-col items-end">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Mission Progress</p>
            <div className="flex items-center gap-3">
              <span className="text-sm font-black text-white tracking-tighter">{currentQuestionIndex + 1} <span className="text-slate-500">/ {questions.length}</span></span>
            </div>
          </div>

          <div className="h-10 w-px bg-white/10"></div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 text-rose-500">Telemetry Remaining</p>
              <div className="flex items-center gap-3 bg-rose-500/10 px-5 py-2.5 rounded-2xl border border-rose-500/20 shadow-inner">
                <Timer size={18} className="text-rose-500" />
                <span className="text-lg font-black text-rose-500 tracking-tight tabular-nums">
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-80 bg-slate-50 border-r border-slate-100 flex flex-col pt-10 px-8 shrink-0">
          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
            <Layers size={14} className="text-indigo-600" /> Question Registry
          </h3>
          <div className="grid grid-cols-4 gap-3 overflow-y-auto pr-2 scrollbar-hide pb-10">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestionIndex(i)}
                className={`w-full aspect-square rounded-2xl flex items-center justify-center text-[10px] font-black transition-all border shadow-sm ${currentQuestionIndex === i ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 scale-110 z-10' : answers[questions[i].id || questions[i]._id] ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="mt-auto pb-10 space-y-4">
            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-3xl"></div>
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Info size={12} className="text-indigo-400" /> Protocol Note
              </h4>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-wide leading-relaxed">
                All responses are auto-saved in the mission buffer memory.
              </p>
            </div>
            <button onClick={handleSubmit} className="w-full py-6 bg-rose-500 text-white rounded-[32px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-600 transition-all shadow-xl shadow-rose-100 flex items-center justify-center gap-3">
              <Send size={18} /> Transmit Mission
            </button>
          </div>
        </aside>

        {/* Question Area */}
        <div className="flex-1 overflow-y-auto bg-white p-12 scrollbar-hide">
          <AnimatePresence mode="wait">
            {currentQ && (
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto space-y-12"
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">Question {currentQuestionIndex + 1}</span>
                    <div className="h-px bg-slate-100 flex-1"></div>
                    <Flag size={20} className="text-slate-100 hover:text-rose-400 transition-colors cursor-pointer" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight pt-4">
                    {currentQ.question_text}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-10">
                  {[currentQ.option_1, currentQ.option_2, currentQ.option_3, currentQ.option_4].map((opt, i) => {
                    if (!opt) return null;
                    const isSelected = answers[currentQ.id || currentQ._id] === i + 1;
                    return (
                      <button
                        key={i}
                        onClick={() => handleChange(currentQ.id || currentQ._id, i + 1)}
                        className={`group relative w-full p-8 rounded-[40px] text-left transition-all border-2 flex items-center gap-6 ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-100' : 'bg-slate-50 border-transparent hover:border-slate-200 hover:bg-white text-slate-600 active:scale-[0.98]'}`}
                      >
                        <div className={`w-10 h-10 min-w-[40px] rounded-xl flex items-center justify-center text-xs font-black transition-colors ${isSelected ? 'bg-white text-indigo-600' : 'bg-white text-slate-300 group-hover:bg-slate-900 group-hover:text-white shadow-sm border border-slate-100'}`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="text-sm font-extrabold uppercase tracking-wide flex-1">{opt}</span>
                        {isSelected && <motion.div layoutId="check" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><CheckCircle2 size={18} /></motion.div>}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-16 mt-16 border-t border-slate-100">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(i => i - 1)}
                    className="px-10 py-5 bg-white border border-slate-100 rounded-3xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-20 flex items-center gap-3"
                  >
                    <ChevronLeft size={18} /> Previous Fragment
                  </button>
                  <button
                    onClick={() => {
                      if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(i => i + 1);
                      else handleSubmit();
                    }}
                    className="px-10 py-5 bg-slate-900 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-100 flex items-center gap-3"
                  >
                    {currentQuestionIndex < questions.length - 1 ? (
                      <>Next Fragment <ChevronRight size={18} /></>
                    ) : (
                      <>Execute Submission <Send size={18} /></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
