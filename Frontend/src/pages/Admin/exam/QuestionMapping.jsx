import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { 
  fetchQuestionsByExam, fetchAvailableQuestions, 
  fetchCategories, fetchTopics, 
  linkQuestionToExam, unlinkQuestionFromExam 
} from "../../../utils/api";
import { X, Search, Plus, Trash2, Layers, Hash, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";

const QuestionMapping = ({ exam, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterTopicId] = useState(""); // Simplified for now
  
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [examQuestions, setExamQuestions] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [loadingExam, setLoadingExam] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // stores questionId being processed

  useEffect(() => {
    fetchCategories().then(setCategories).catch(e => console.error(e));
    loadExamQuestions();
    loadAvailablePool();
  }, [exam.id]);

  useEffect(() => {
     if (filterCategoryId) {
         fetchTopics(filterCategoryId).then(setTopics).catch(e => console.error(e));
     } else {
         setTopics([]);
     }
     loadAvailablePool();
  }, [filterCategoryId]);

  const loadExamQuestions = async () => {
    try {
      setLoadingExam(true);
      const res = await fetchQuestionsByExam(exam.id);
      setExamQuestions(res.data || res || []);
    } catch {
      toast.error("Failed to load exam questions");
    } finally {
      setLoadingExam(false);
    }
  };

  const loadAvailablePool = async () => {
    try {
      setLoadingAvailable(true);
      const res = await fetchAvailableQuestions({
        category_id: filterCategoryId || null,
        topic_id: null // simplified
      });
      // Filter out those already in the exam
      const inExamIds = new Set(examQuestions.map(q => q.id));
      const pool = (res.data || res || []).filter(q => !inExamIds.has(q.id));
      setAvailableQuestions(pool);
    } catch {
      toast.error("Failed to load question pool");
    } finally {
      setLoadingAvailable(false);
    }
  };

  // Sync pool when exam questions change
  useEffect(() => {
      const inExamIds = new Set(examQuestions.map(q => q.id));
      setAvailableQuestions(prev => prev.filter(q => !inExamIds.has(q.id)));
  }, [examQuestions]);

  const handleLink = async (question) => {
    const marks = prompt("Enter marks for this question:", "1");
    if (marks === null) return;
    if (isNaN(marks) || Number(marks) <= 0) {
      toast.error("Please enter a valid marks value.");
      return;
    }

    try {
      setActionLoading(question.id);
      await linkQuestionToExam(exam.id, question.id, Number(marks));
      toast.success("Question linked to exam");
      await loadExamQuestions();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to link question");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnlink = async (questionId) => {
    if (!window.confirm("Unlink this question?")) return;
    try {
      setActionLoading(questionId);
      await unlinkQuestionFromExam(exam.id, questionId);
      toast.success("Question unlinked");
      await loadExamQuestions();
      await loadAvailablePool(); // Reload pool to show it again
    } catch {
      toast.error("Failed to unlink question");
    } finally {
      setActionLoading(null);
    }
  };

  const currentQuestionsCount = examQuestions.length;
  const currentTotalMarks = examQuestions.reduce((acc, q) => acc + (q.marks || 0), 0);
  
  const isOverLimit = currentQuestionsCount > (exam.max_questions || 999) || currentTotalMarks > (exam.max_marks || 9999);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 lg:p-8 animate-in fade-in zoom-in duration-300">
      <div className="bg-slate-50 w-full h-full max-w-7xl rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-white/20">
        
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                <Layers size={24} />
             </div>
             <div>
                <h2 className="text-xl font-black text-slate-900 leading-tight">View Questions</h2>
                <div className="flex items-center gap-3 mt-1">
                   <span className="text-sm font-bold text-slate-400 truncate max-w-[300px]">{exam.title}</span>
                   <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${isOverLimit ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {currentQuestionsCount}/{exam.max_questions || '∞'} Qs  •  {currentTotalMarks}/{exam.max_marks || '∞'} Marks
                   </span>
                </div>
             </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Panel: Selected Questions */}
          <div className="w-1/2 border-r border-slate-100 flex flex-col bg-white overflow-hidden">
             <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Assigned to Exam ({currentQuestionsCount})</h3>
                {isOverLimit && (
                    <div className="flex items-center gap-3 p-3 bg-rose-50 text-rose-700 rounded-2xl text-[10px] font-bold border border-rose-100">
                        <AlertTriangle size={14} />
                        You have exceeded the set limits for this exam. Candidates may not be able to start.
                    </div>
                )}
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                {loadingExam ? (
                    <div className="h-full flex items-center justify-center text-slate-300 font-bold animate-pulse italic">Syncing exam context...</div>
                ) : examQuestions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                       <Plus size={48} className="mb-2 opacity-20" />
                       <p className="text-xs font-bold uppercase tracking-widest opacity-40">Ready to assign questions</p>
                    </div>
                ) : (
                    examQuestions.map(q => (
                        <div key={q.id} className="group p-5 bg-white border border-slate-100 rounded-3xl hover:border-rose-200 hover:shadow-lg hover:shadow-rose-50/50 transition-all cursor-default">
                           <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                 <div className="text-sm font-bold text-slate-800 leading-snug">{q.question_text}</div>
                                 <div className="flex items-center gap-3 mt-3">
                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black">{q.marks} Marks</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{q.difficulty_code}</span>
                                 </div>
                                 <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {(q.QuestionOptions || q.options || []).map((opt, idx) => (
                                       <div key={idx} className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-[10px] font-bold transition-all ${opt.is_correct ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm ring-1 ring-emerald-100' : 'bg-slate-50/50 border-slate-100 text-slate-500'}`}>
                                          <div className={`w-5 h-5 shrink-0 rounded-lg flex items-center justify-center text-[9px] font-black ${opt.is_correct ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                             {String.fromCharCode(65 + idx)}
                                          </div>
                                          <span className="truncate">{opt.option_text || opt.text}</span>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                              <button 
                                 onClick={() => handleUnlink(q.id)}
                                 disabled={actionLoading === q.id}
                                 className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                              >
                                 <Trash2 size={16} />
                              </button>
                           </div>
                        </div>
                    ))
                )}
             </div>
          </div>

          {/* Right Panel: Global Pool */}
          <div className="w-1/2 flex flex-col overflow-hidden bg-slate-50/50">
             
             {/* Search/Filter Pool */}
             <div className="p-6 border-b border-slate-200/50 space-y-4">
                <div className="flex gap-4">
                   <div className="flex-1 relative">
                       <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                         type="text" 
                         placeholder="Keyword search pool..." 
                         className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                         value={searchQuery}
                         onChange={e => setSearchQuery(e.target.value)}
                       />
                   </div>
                   <select 
                      value={filterCategoryId} 
                      onChange={e => setFilterCategoryId(e.target.value)}
                      className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none"
                   >
                       <option value="">All Categories</option>
                       {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                {loadingAvailable ? (
                    <div className="h-full flex items-center justify-center text-slate-300 font-bold animate-pulse italic">Indexing global pool...</div>
                ) : availableQuestions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 text-center">
                       <CheckCircle2 size={48} className="mb-2 opacity-20" />
                       <p className="text-xs font-bold uppercase tracking-widest opacity-40">All questions assigned or pool empty</p>
                    </div>
                ) : (
                    availableQuestions
                      .filter(q => q.question_text.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(q => (
                        <div key={q.id} className="group p-5 bg-white border border-slate-100 rounded-3xl hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 transition-all cursor-default relative overflow-hidden">
                           <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                 <div className="flex flex-wrap gap-2 mb-2">
                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                                       <Hash size={10}/> {q.Topic?.name || 'GEN'}
                                    </span>
                                 </div>
                                 <div className="text-sm font-bold text-slate-800 leading-snug">{q.question_text}</div>
                                 <div className="flex items-center gap-3 mt-3">
                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                                        q.difficulty_code === 'EASY' ? 'bg-emerald-50 text-emerald-600' : 
                                        q.difficulty_code === 'HARD' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                    }`}>{q.difficulty_code}</span>
                                    {q.Category && <span className="text-[10px] font-bold text-slate-400">In {q.Category.name}</span>}
                                 </div>
                                 <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {(q.QuestionOptions || q.options || []).map((opt, idx) => (
                                       <div key={idx} className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-[10px] font-bold transition-all ${opt.is_correct ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm ring-1 ring-emerald-100' : 'bg-slate-50/50 border-slate-100 text-slate-500'}`}>
                                          <div className={`w-5 h-5 shrink-0 rounded-lg flex items-center justify-center text-[9px] font-black ${opt.is_correct ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                             {String.fromCharCode(65 + idx)}
                                          </div>
                                          <span className="truncate">{opt.option_text || opt.text}</span>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                              <button 
                                 onClick={() => handleLink(q)}
                                 disabled={actionLoading === q.id}
                                 className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 shadow-lg shadow-slate-200 flex items-center gap-2 group-hover:px-6 transition-all"
                              >
                                 <Plus size={16} /> <span className="hidden group-hover:block text-[10px] font-black uppercase tracking-widest">Assign</span>
                              </button>
                           </div>
                           {actionLoading === q.id && <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center font-black text-indigo-600 italic">Processing...</div>}
                        </div>
                    ))
                )}
             </div>
          </div>
        </div>
        
        {/* Footer info */}
        <div className="bg-white px-8 py-5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
           <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 italic"><ChevronRight size={14}/> Questions in pool are filtered by selected organization.</span>
              <span className="flex items-center gap-2 italic"><ChevronRight size={14}/> Marks assigned here are specific to this exam.</span>
           </div>
           <button onClick={onClose} className="text-indigo-600 font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Close Dashboard</button>
        </div>
      </div>
    </div>
  );
};

export default QuestionMapping;
