import axios from 'axios';

// ─── Single Axios Instance ────────────────────────────────────────────────────
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// ─── Auth Interceptor ─────────────────────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const getUser = () => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Auth helper using fetch (for callers that need raw fetch)
export const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const path = url.startsWith('/api') ? url.slice(4) : url;
    const res = await fetch(`http://localhost:5000/api${path}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: token ? `Bearer ${token}` : '',
        },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export const fetchDashboardStats = async () => {
    const res = await api.get('/admin/dashboard-stats');
    return res.data;
};

// ─── ADMINS ──────────────────────────────────────────────────────────────────
export const fetchAdmins = async () => {
    const res = await api.get('/superadmin/admins');
    return res.data;
};

export const createAdmin = async (payload) => {
    const res = await api.post('/admin/create-admin', payload);
    return res.data;
};

// ─── SUPERADMIN PROFILE ──────────────────────────────────────────────────────
export const fetchSuperAdminProfile = async () => {
    const res = await api.get('/superadmin/profile');
    return res.data;
};

export const updateSuperAdminProfile = async (payload) => {
    const res = await api.put('/superadmin/profile', payload);
    return res.data;
};

export const updateSuperAdminPassword = async (payload) => {
    const res = await api.put('/superadmin/profile/password', payload);
    return res.data;
};

export const uploadSuperAdminPhoto = async (file) => {
    const fd = new FormData();
    fd.append('photo', file);
    const res = await api.post('/superadmin/profile/photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};

// ─── ORGANIZATIONS ────────────────────────────────────────────────────────────
export const fetchOrganizations = async () => {
    const res = await api.get('/superadmin/organizations');
    return res.data;
};

export const fetchOrganizationDetails = async (id) => {
    const res = await api.get(`/superadmin/organizations/${id}`);
    return res.data;
};

// ─── COUPONS ──────────────────────────────────────────────────────────────────
export const fetchCoupons = async () => {
    const res = await api.get('/superadmin/coupons');
    return res.data;
};

export const createCoupon = async (payload) => {
    const res = await api.post('/superadmin/coupons', payload);
    return res.data;
};

export const updateCoupon = async (id, payload) => {
    const res = await api.put(`/superadmin/coupons/${id}`, payload);
    return res.data;
};

export const deleteCoupon = async (id) => {
    const res = await api.delete(`/superadmin/coupons/${id}`);
    return res.data;
};

export const fetchPlans = async () => {
    const res = await api.get('/public/plans');
    return res.data;
};

export const verifyCoupon = async (coupon_code, plan_id) => {
    const res = await api.post('/public/verify-coupon', { coupon_code, plan_id });
    return res.data;
};

export const registerOrganization = async (payload) => {
    const res = await api.post('/public/register-organization', payload);
    return res.data;
};

// ─── EXAMS ───────────────────────────────────────────────────────────────────
export const fetchExams = async () => {
    const res = await api.get('/exam');
    const json = res.data;
    const exams = json.exams || json || [];
    return exams.map(e => ({
        ...e,
        isActive: e.isActive ?? e.active ?? e.status === 'ACTIVE' ?? e.exam_status === true,
    }));
};

export const createExam = async (payload) => {
    const res = await api.post('/exam', payload);
    return res.data;
};

export const updateExam = async (examId, data) => {
    const res = await api.put(`/exam/${examId}`, data);
    return res.data;
};

export const deleteExam = (id) => api.delete(`/exam/${id}`).then(res => res.data);
export const restoreExam = (id) => api.post(`/exam/${id}/restore`).then(res => res.data);
export const fetchRemovedExams = () => api.get('/exam/removed/list').then(res => res.data);

export const fetchParticipantExams = async () => {
    const res = await api.get('/participant/exams');
    return res.data;
};

export const submitExamAnswers = async (payload) => {
    const res = await api.post('/answer/submit', payload);
    return res.data;
};

export const submitExamToServer = async (examId, payload) => {
    const res = await api.post(`/exam/${examId}/submit`, payload);
    return res.data;
};

// ─── PARTICIPANTS ─────────────────────────────────────────────────────────────
export const fetchParticipants = async () => {
    const res = await api.get('/participant');
    return res.data;
};

export const createParticipant = async (data) => {
    const res = await api.post('/admin/participants/single', data);
    return res.data;
};

export const updateParticipant = async (id, data) => {
    const res = await api.put(`/participant/${id}`, data);
    return res.data;
};

export const deleteParticipant = async (id) => {
    const res = await api.delete(`/participant/${id}`);
    return res.data;
};

export const fetchRemovedParticipants = async () => {
    const res = await api.get('/participant/removed');
    return res.data;
};

export const fetchStagingParticipants = async (params = {}) => {
    const query = new URLSearchParams();
    if (params.all) query.set('all', params.all);
    if (params.batch_code) query.set('batch_code', params.batch_code);
    if (params.file_code) query.set('file_code', params.file_code);
    const res = await api.get(`/admin/participants/staging?${query.toString()}`);
    return res.data;
};

export const updateMyProfile = async (payload) => {
    const res = await api.put('/participant/me', payload);
    return res.data;
};

export const uploadParticipantsExcel = async (groupId, file) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('group_ids', JSON.stringify([groupId]));
    const res = await api.post('/admin/participants/upload', fd);
    return res.data;
};

/**
 * Upload participants excel with full metadata:
 * @param groupIds  array of group IDs
 * @param file      File object
 * @param fileName  editable display name (without extension)
 */
export const uploadParticipantsExcelWithMeta = async (groupIds, file, fileName) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('group_ids', JSON.stringify(groupIds));
    if (fileName) fd.append('file_name', fileName);
    const res = await api.post('/admin/participants/upload', fd);
    return res.data;
};

export const updateStagingParticipant = async (id, data) => {
    const res = await api.put(`/admin/participants/staging/${id}`, data);
    return res.data;
};

export const approveStagingParticipant = async (id) => {
    const res = await api.post(`/admin/participants/staging/${id}/approve`);
    return res.data;
};

export const approveAllStagingBatch = async (batchCode) => {
    const res = await api.post('/admin/participants/staging/approve-batch', { batch_code: batchCode });
    return res.data;
};


// ─── GROUPS ───────────────────────────────────────────────────────────────────
export const fetchGroups = async (organizationId) => {
    const url = organizationId ? `/group?organizationId=${organizationId}` : '/group';
    const res = await api.get(url);
    return res.data;
};

export const createGroup = async (group) => {
    const payload = {
        ...group,
        startDate: group.startDate ? new Date(group.startDate) : null,
        endDate: group.endDate ? new Date(group.endDate) : null,
    };
    const res = await api.post('/group', payload);
    return res.data;
};

export const updateGroup = async (groupId, data) => {
    const payload = {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
    };
    const res = await api.put(`/group/${groupId}`, payload);
    return res.data;
};

export const deleteGroup = async (groupId) => {
    const res = await api.delete(`/group/${groupId}`);
    return res.data;
};

export const fetchRemovedGroups = async () => {
    const res = await api.get('/group/removed');
    return res.data;
};

export const fetchUploadedBatches = async () => {
    const res = await api.get('/group/batches');
    return res.data;
};

// ─── QUESTIONS ────────────────────────────────────────────────────────────────
export const fetchQuestionsByExam = async (examId) => {
    const res = await api.get(`/question/exam/${examId}`);
    return res.data;
};

export const createQuestion = async (payload) => {
    const res = await api.post('/question', payload);
    return res.data;
};

export const uploadQuestionExcel = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await api.post('/question/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
};

export const deleteQuestion = async (id) => {
    const res = await api.delete(`/question/${id}`);
    return res.data;
};

export const fetchQuestionById = async (id) => {
    const res = await api.get(`/question/${id}`);
    return res.data;
};

export const updateQuestion = async (id, payload) => {
    const res = await api.put(`/question/${id}`, payload);
    return res.data;
};

export const fetchQuestionBatches = async () => {
    const res = await api.get('/question/batches');
    return res.data;
};

// ─── NOTICES ──────────────────────────────────────────────────────────────────
export const fetchMyNotices = async () => {
    const res = await api.get('/notice/my');
    return res.data;
};

export const sendNotice = async (data) => {
    const res = await api.post('/notice', data);
    return res.data;
};

export const sendAdminNotice = async (data) => {
    const res = await api.post('/notice/admin', data);
    return res.data;
};

export const sendSuperAdminNotice = async (formData) => {
    const res = await api.post('/notice/superadmin', formData);
    return res.data;
};

// ─── FEEDBACK ────────────────────────────────────────────────────────────────
export const fetchFeedbacks = async () => {
    const res = await api.get('/feedback/my');
    return res.data;
};

export const sendAdminFeedback = async (data) => {
    const res = await api.post('/feedback/admin', data);
    return res.data;
};

export const sendParticipantFeedback = async (payload) => {
    const res = await api.post('/feedback/participant', payload);
    return res.data;
};

// ─── SUPERUSERS ───────────────────────────────────────────────────────────────
export const fetchSuperUsersByOrg = async () => {
    const res = await api.get('/admin/superusers');
    const json = res.data;
    return Array.isArray(json) ? json : json.superUsers || [];
};

// ─── SUPERUSER SPECIFIC ───────────────────────────────────────────────────────
export const fetchSuperUserDashboardStats = async () => {
    const res = await api.get('/superuser/dashboard-stats');
    return res.data;
};

export const fetchSuperUserGroups = async () => {
    const res = await api.get('/superuser/groups');
    return res.data;
};

export const fetchSuperUserParticipants = async () => {
    const res = await api.get('/superuser/participants');
    return res.data;
};

export const fetchSuperUserExams = async () => {
    const res = await api.get('/superuser/exams');
    return res.data;
};

export const fetchSuperUserNotices = async () => {
    const res = await api.get('/superuser/notices');
    return res.data;
};

export const sendSuperUserNotice = async (payload) => {
    const res = await api.post('/superuser/notices', payload);
    return res.data;
};

export const fetchSuperUserFeedbacks = async () => {
    const res = await api.get('/superuser/feedbacks');
    return res.data;
};

export const uploadSuperUserAssignment = async (formData) => {
    const res = await api.post('/superuser/assignments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};

export const createSuperUserGroup = async (payload) => {
    const res = await api.post('/superuser/groups', payload);
    return res.data;
};

export const deleteSuperUserGroup = async (id) => {
    const res = await api.delete(`/superuser/groups/${id}`);
    return res.data;
};

export const createSuperUserExam = async (payload) => {
    const res = await api.post('/superuser/exams', payload);
    return res.data;
};

export const deleteSuperUserExam = async (id) => {
    const res = await api.delete(`/superuser/exams/${id}`);
    return res.data;
};

export const createSuperUserSingleParticipant = async (payload) => {
    const res = await api.post('/superuser/participants/single', payload);
    return res.data;
};

export const uploadSuperUserParticipantsExcel = async (groupId, file) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('group_ids', JSON.stringify([groupId]));
    const res = await api.post('/superuser/participants/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};

// ─── ASSIGNMENTS ──────────────────────────────────────────────────────────────
export const uploadAssignment = async (formData) => {
    const res = await api.post('/assignment', formData);
    return res.data;
};

export const fetchMyAssignments = async (groupId) => {
    const res = await api.get(`/assignment/group/${groupId}`);
    return res.data;
};

// ─── RESULTS ─────────────────────────────────────────────────────────────────
export const fetchMyResults = async (participantId) => {
    const res = await api.get(`/result/participant/${participantId}`);
    return res.data;
};

export const fetchResultsByParticipant = async () => {
    const res = await api.get('/results/participant/me');
    return res.data;
};

// ─── HISTORY ─────────────────────────────────────────────────────────────
export const fetchParticipantHistory = async (params = {}) => {
    const query = new URLSearchParams();
    if (params.action) query.set('action', params.action);
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (params.file_code) query.set('file_code', params.file_code);
    const res = await api.get(`/admin/history/participants?${query.toString()}`);
    return res.data;
};

export const fetchQuestionHistory = async (params = {}) => {
    const query = new URLSearchParams();
    if (params.action) query.set('action', params.action);
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (params.file_code) query.set('file_code', params.file_code);
    const res = await api.get(`/admin/history/questions?${query.toString()}`);
    return res.data;
};

// ─── CATEGORIES & TOPICS ─────────────────────────────────────────────────────
export const fetchCategories = async () => {
    const res = await api.get('/categories');
    return res.data;
};

export const createCategory = async (payload) => {
    const res = await api.post('/categories', payload);
    return res.data;
};

export const updateCategory = async (id, payload) => {
    const res = await api.put(`/categories/${id}`, payload);
    return res.data;
};

export const deleteCategory = async (id) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
};

export const fetchRemovedCategories = async () => {
    const res = await api.get('/categories/removed');
    return res.data;
};

export const fetchTopics = async (categoryId) => {
    const url = categoryId ? `/topics?category_id=${categoryId}` : '/topics';
    const res = await api.get(url);
    return res.data;
};

export const createTopic = async (payload) => {
    const res = await api.post('/topics', payload);
    return res.data;
};

export const updateTopic = async (id, payload) => {
    const res = await api.put(`/topics/${id}`, payload);
    return res.data;
};

export const deleteTopic = async (id) => {
    const res = await api.delete(`/topics/${id}`);
    return res.data;
};

export const fetchRemovedTopics = async () => {
    const res = await api.get('/topics/removed');
    return res.data;
};

// ─── QUESTION MAPPING ────────────────────────────────────────────────────────
export const fetchAvailableQuestions = async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category_id) query.set('category_id', params.category_id);
    if (params.topic_id) query.set('topic_id', params.topic_id);
    const res = await api.get(`/question/available?${query.toString()}`);
    return res.data;
};

export const linkQuestionToExam = async (examId, questionId, marks) => {
    const res = await api.post(`/question/link`, {
        examId,
        questionIds: [questionId],
        marksMap: { [questionId]: marks }
    });
    return res.data;
};

export const unlinkQuestionFromExam = async (examId, questionId) => {
    const res = await api.post(`/question/unlink`, { examId, questionId });
    return res.data;
};

export default api;