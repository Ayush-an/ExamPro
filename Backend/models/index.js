const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config({ quiet: true });

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    }
);

// 1. Organizations
const Organization = sequelize.define('Organization', {
    name: { type: DataTypes.STRING(255), allowNull: false },
    type_code: { type: DataTypes.STRING(100), allowNull: false },
    status_code: { type: DataTypes.STRING(100), allowNull: false },
    email: DataTypes.STRING(150),
    phone: DataTypes.STRING(50),
    address: DataTypes.STRING(255),
    city: DataTypes.STRING(100),
    state: DataTypes.STRING(100),
    country: DataTypes.STRING(100),
    zip_code: DataTypes.STRING(20),
}, { tableName: 'organizations', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

//2. Organization Settings
const OrganizationSetting = sequelize.define('OrganizationSetting', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    setting_key: { type: DataTypes.STRING(100), allowNull: false },
    setting_value: { type: DataTypes.TEXT, allowNull: false },
}, {
    tableName: 'organization_settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [{ unique: true, fields: ['organization_id', 'setting_key'] }]
});

// 3. Users
const User = sequelize.define('User', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    full_name: { type: DataTypes.STRING(150), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    mobile: DataTypes.STRING(20),
    status_code: { type: DataTypes.STRING(100), allowNull: false },
    approved: { type: DataTypes.BOOLEAN, defaultValue: false },
    photo: DataTypes.STRING(255),
    details: DataTypes.JSON,
    last_login: DataTypes.DATE,
    upload_batch_code: DataTypes.STRING(50),
    removed_at: DataTypes.DATE,
    removed_by: DataTypes.INTEGER,
}, { tableName: 'users', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// 4. Roles
const Role = sequelize.define('Role', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    code: { type: DataTypes.STRING(100), allowNull: false },
    description: DataTypes.TEXT,
    status_code: { type: DataTypes.STRING(100), allowNull: false },
    is_system: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    tableName: 'roles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [{ unique: true, fields: ['organization_id', 'code'] }]
});

// 5. User Roles
const UserRole = sequelize.define('UserRole', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    role_id: { type: DataTypes.INTEGER, allowNull: false },
    assigned_by: DataTypes.INTEGER,
    assigned_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
    tableName: 'user_roles',
    timestamps: false,
    indexes: [{ unique: true, fields: ['organization_id', 'user_id', 'role_id'] }]
});

UserRole.belongsTo(User, { foreignKey: 'user_id' });
UserRole.belongsTo(Role, { foreignKey: 'role_id' });
User.hasMany(UserRole, { foreignKey: 'user_id' });
Role.hasMany(UserRole, { foreignKey: 'role_id' });

// 6. Datasets
const Dataset = sequelize.define('Dataset', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(150), allowNull: false },
    code: { type: DataTypes.STRING(100), allowNull: false },
    description: DataTypes.TEXT,
    status_code: { type: DataTypes.STRING(100), allowNull: false },
    is_system: { type: DataTypes.BOOLEAN, defaultValue: false },
    start_date: DataTypes.DATEONLY,
    end_date: DataTypes.DATEONLY,
}, {
    tableName: 'datasets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [{ unique: true, fields: ['organization_id', 'code'] }]
});

// 7. Dataset Values
const DatasetValue = sequelize.define('DatasetValue', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    dataset_id: { type: DataTypes.INTEGER, allowNull: false },
    value_code: { type: DataTypes.STRING(100), allowNull: false },
    value_label: { type: DataTypes.STRING(150), allowNull: false },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    status_code: { type: DataTypes.STRING(100), allowNull: false },
}, {
    tableName: 'dataset_values',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [{ unique: true, fields: ['dataset_id', 'value_code'] }]
});

// 8.Dataset Value Metadata
const DatasetValueMetadata = sequelize.define('DatasetValueMetadata', {
    dataset_value_id: { type: DataTypes.INTEGER, allowNull: false },
    meta_key: { type: DataTypes.STRING(100), allowNull: false },
    meta_value: { type: DataTypes.TEXT, allowNull: false },
}, {
    tableName: 'dataset_value_metadata',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [{ unique: true, fields: ['dataset_value_id', 'meta_key'] }]
});

// 9. Groups
const Group = sequelize.define('Group', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(150), allowNull: false },
    description: DataTypes.TEXT,
    status_code: { type: DataTypes.STRING(100), allowNull: false }, // GROUP_STATUS
    start_date: DataTypes.DATEONLY,
    end_date: DataTypes.DATEONLY,
    created_by: DataTypes.INTEGER,
    removed_at: DataTypes.DATE,
    removed_by: DataTypes.INTEGER,
}, { tableName: 'groups', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// 10. Group Members
const GroupMember = sequelize.define('GroupMember', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    group_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    role_code: DataTypes.STRING(100), // GROUP_MEMBER_ROLE
    status_code: { type: DataTypes.STRING(100), allowNull: false }, // GROUP_MEMBER_STATUS
    joined_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    removed_at: DataTypes.DATE,
}, {
    tableName: 'group_members',
    timestamps: false,
    indexes: [{ unique: true, fields: ['organization_id', 'group_id', 'user_id'] }]
});

// 11. Exams
const Exam = sequelize.define('Exam', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: DataTypes.TEXT,
    status_code: { type: DataTypes.STRING(100), allowNull: false }, // EXAM_STATUS
    exam_type_code: DataTypes.STRING(100), // EXAM_TYPE
    duration_minutes: DataTypes.INTEGER,
    total_marks: { type: DataTypes.INTEGER, defaultValue: 0 },
    exam_code: DataTypes.STRING(50),
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    removed_at: DataTypes.DATE,
    removed_by: DataTypes.INTEGER,
    max_questions: { type: DataTypes.INTEGER, defaultValue: 0 },
    max_marks: { type: DataTypes.INTEGER, defaultValue: 0 },
    category_id: DataTypes.INTEGER,
    topic_id: DataTypes.INTEGER,
}, {
    tableName: 'exams',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [{ unique: true, fields: ['organization_id', 'exam_code'] }]
});

// 12. Exam Groups
const ExamGroup = sequelize.define('ExamGroup', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    exam_id: { type: DataTypes.INTEGER, allowNull: false },
    group_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
    tableName: 'exam_groups',
    timestamps: false,
    indexes: [{ unique: true, fields: ['organization_id', 'exam_id', 'group_id'] }]
});

// 13. Exam Questions (Many-to-Many join table)
const ExamQuestion = sequelize.define('ExamQuestion', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    exam_id: { type: DataTypes.INTEGER, allowNull: false },
    question_id: { type: DataTypes.INTEGER, allowNull: false },
    marks: { type: DataTypes.INTEGER, defaultValue: 1 },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
    tableName: 'exam_questions',
    timestamps: false,
    indexes: [{ unique: true, fields: ['organization_id', 'exam_id', 'question_id'] }]
});

// 14. Categories
const Category = sequelize.define('Category', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: DataTypes.TEXT,
    status_code: { type: DataTypes.STRING(100), defaultValue: 'ACTIVE' },
}, {
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// 15. Topics
const Topic = sequelize.define('Topic', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    category_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: DataTypes.TEXT,
    status_code: { type: DataTypes.STRING(100), defaultValue: 'ACTIVE' },
}, {
    tableName: 'topics',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// 16. Questions
const Question = sequelize.define('Question', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    question_text: { type: DataTypes.TEXT, allowNull: false },
    question_type_code: { type: DataTypes.STRING(100), allowNull: false }, // QUESTION_TYPE
    difficulty_code: DataTypes.STRING(100), // QUESTION_DIFFICULTY
    marks: { type: DataTypes.INTEGER, defaultValue: 1 },
    category_id: { type: DataTypes.INTEGER, allowNull: false },
    topic_id: { type: DataTypes.INTEGER, allowNull: false },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    upload_batch_id: DataTypes.INTEGER,
}, { tableName: 'questions', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// 17. Question Options
const QuestionOption = sequelize.define('QuestionOption', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    question_id: { type: DataTypes.INTEGER, allowNull: false },
    option_text: { type: DataTypes.TEXT, allowNull: false },
    is_correct: { type: DataTypes.BOOLEAN, defaultValue: false },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'question_options', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// 18. Exam Attempts
const ExamAttempt = sequelize.define('ExamAttempt', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    exam_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    group_id: { type: DataTypes.INTEGER, allowNull: false },
    started_at: { type: DataTypes.DATE, allowNull: false },
    submitted_at: DataTypes.DATE,
    status_code: { type: DataTypes.STRING(100), allowNull: false }, // EXAM_ATTEMPT_STATUS
}, {
    tableName: 'exam_attempts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [{ unique: true, fields: ['organization_id', 'exam_id', 'user_id'] }]
});

// 19. Answers
const Answer = sequelize.define('Answer', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    exam_id: { type: DataTypes.INTEGER, allowNull: false },
    question_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    selected_option_id: DataTypes.INTEGER,
    answer_text: DataTypes.TEXT,
    is_correct: { type: DataTypes.BOOLEAN, defaultValue: false },
    answered_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'answers', timestamps: false });

// 20. Results
const Result = sequelize.define('Result', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    exam_id: { type: DataTypes.INTEGER, allowNull: false },
    group_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    total_marks: { type: DataTypes.INTEGER, allowNull: false },
    obtained_marks: { type: DataTypes.INTEGER, allowNull: false },
    score: DataTypes.DECIMAL(6, 2),
    correct_answers: { type: DataTypes.INTEGER, defaultValue: 0 },
    wrong_answers: { type: DataTypes.INTEGER, defaultValue: 0 },
    exam_start_time: { type: DataTypes.DATE, allowNull: false },
    exam_end_time: { type: DataTypes.DATE, allowNull: false },
    completion_time_seconds: { type: DataTypes.INTEGER, allowNull: false },
    result_status_code: { type: DataTypes.STRING(100), allowNull: false }, // RESULT_STATUS
}, {
    tableName: 'results',
    timestamps: true,
    createdAt: 'created_at',
    updated_at: false, // Updated_at not in SQL
    indexes: [{ unique: true, fields: ['organization_id', 'exam_id', 'user_id'] }]
});

// 21. Courses
const Course = sequelize.define('Course', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: DataTypes.TEXT,
    thumbnail_url: DataTypes.STRING(255),
    difficulty_code: DataTypes.STRING(100), // COURSE_DIFFICULTY
    status_code: { type: DataTypes.STRING(100), allowNull: false }, // COURSE_STATUS
    is_published: { type: DataTypes.BOOLEAN, defaultValue: false },
    price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'courses', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// 22. Modules
const Module = sequelize.define('Module', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    course_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: DataTypes.TEXT,
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    status_code: { type: DataTypes.STRING(100), allowNull: false }, // MODULE_STATUS
}, { tableName: 'modules', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// 23. Lessons
const Lesson = sequelize.define('Lesson', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    module_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    lesson_type_code: { type: DataTypes.STRING(100), allowNull: false }, // LESSON_TYPE
    status_code: { type: DataTypes.STRING(100), allowNull: false }, // LESSON_STATUS
    content_url: DataTypes.STRING(255),
    content_text: DataTypes.TEXT('long'),
    duration_seconds: { type: DataTypes.INTEGER, defaultValue: 0 },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    exam_id: DataTypes.INTEGER,
}, { tableName: 'lessons', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// 24. Enrollments
const Enrollment = sequelize.define('Enrollment', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    course_id: { type: DataTypes.INTEGER, allowNull: false },
    progress_percent: { type: DataTypes.INTEGER, defaultValue: 0 },
    status_code: { type: DataTypes.STRING(100), allowNull: false }, // ENROLLMENT_STATUS
    enrolled_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    completed_at: DataTypes.DATE,
    certificate_url: DataTypes.STRING(255),
}, {
    tableName: 'enrollments',
    timestamps: false,
    indexes: [{ unique: true, fields: ['organization_id', 'user_id', 'course_id'] }]
});

// 25. Lesson Progress
const LessonProgress = sequelize.define('LessonProgress', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    enrollment_id: { type: DataTypes.INTEGER, allowNull: false },
    lesson_id: { type: DataTypes.INTEGER, allowNull: false },
    progress_percent: { type: DataTypes.INTEGER, defaultValue: 0 },
    completed_at: DataTypes.DATE,
}, {
    tableName: 'lesson_progress',
    timestamps: false,
    indexes: [{ unique: true, fields: ['enrollment_id', 'lesson_id'] }]
});

// 26. Assignments
const Assignment = sequelize.define('Assignment', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    group_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: DataTypes.TEXT,
    file_url: DataTypes.STRING(255),
    status_code: { type: DataTypes.STRING(100), allowNull: false }, // ASSIGNMENT_STATUS
    created_by: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'assignments', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// 27. Surveys
const Survey = sequelize.define('Survey', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: DataTypes.TEXT,
    survey_type_code: { type: DataTypes.STRING(100), allowNull: false }, // SURVEY_TYPE
    status_code: { type: DataTypes.STRING(100), allowNull: false }, // SURVEY_STATUS
    is_anonymous: { type: DataTypes.BOOLEAN, defaultValue: false },
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    created_by: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'surveys', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// 28. Survey Groups
const SurveyGroup = sequelize.define('SurveyGroup', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    survey_id: { type: DataTypes.INTEGER, allowNull: false },
    group_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
    tableName: 'survey_groups',
    timestamps: false,
    indexes: [{ unique: true, fields: ['organization_id', 'survey_id', 'group_id'] }]
});

// 29. Survey Responses
const SurveyResponse = sequelize.define('SurveyResponse', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    survey_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: DataTypes.INTEGER,
    response_data: { type: DataTypes.JSON, allowNull: false },
    submitted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    ip_address: DataTypes.STRING(50),
}, { tableName: 'survey_responses', timestamps: false });

// 30. Notifications
const Notification = sequelize.define('Notification', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    message: DataTypes.TEXT,
    notification_type_code: { type: DataTypes.STRING(100), allowNull: false }, // NOTIFICATION_TYPE
    status_code: { type: DataTypes.STRING(100), allowNull: false }, // NOTIFICATION_STATUS
    file_url: DataTypes.STRING(255),
    created_by: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'notifications', timestamps: true, createdAt: 'created_at', updatedAt: false });

// 31. Notices
const Notice = sequelize.define('Notice', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    notice_type_code: { type: DataTypes.STRING(100), allowNull: false }, // NOTICE_TYPE
    status_code: { type: DataTypes.STRING(100), allowNull: false }, // NOTICE_STATUS
    sender_id: { type: DataTypes.INTEGER, allowNull: false },
    target_type_code: { type: DataTypes.STRING(100), allowNull: false }, // NOTICE_TARGET_TYPE
    receiver_id: DataTypes.INTEGER,
    group_id: DataTypes.INTEGER,
    file_url: DataTypes.STRING(255),
}, { tableName: 'notices', timestamps: true, createdAt: 'created_at', updatedAt: false });

// 32. Feedback
const Feedback = sequelize.define('Feedback', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    sender_id: { type: DataTypes.INTEGER, allowNull: false },
    receiver_id: { type: DataTypes.INTEGER, allowNull: false },
    feedback_type_code: { type: DataTypes.STRING(100), allowNull: false }, // FEEDBACK_TYPE
    status_code: { type: DataTypes.STRING(100), allowNull: false }, // FEEDBACK_STATUS
}, { tableName: 'feedback', timestamps: true, createdAt: 'created_at', updatedAt: false });

// 33. Audit Logs
const AuditLog = sequelize.define('AuditLog', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    table_name: { type: DataTypes.STRING(150), allowNull: false },
    record_id: { type: DataTypes.INTEGER, allowNull: false },
    field_name: DataTypes.STRING(150),
    old_value: DataTypes.TEXT,
    new_value: DataTypes.TEXT,
    action_code: { type: DataTypes.STRING(100), allowNull: false }, // AUDIT_ACTION
    changed_by: DataTypes.INTEGER,
}, { tableName: 'audit_logs', timestamps: true, createdAt: 'changed_at', updatedAt: false });

// 34. Activity Logs
const ActivityLog = sequelize.define('ActivityLog', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    activity_code: { type: DataTypes.STRING(100), allowNull: false }, // ACTIVITY_TYPE
    description: DataTypes.STRING(255),
    ip_address: DataTypes.STRING(50),
    user_agent: DataTypes.TEXT,
    spent_time_seconds: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'activity_logs', timestamps: true, createdAt: 'created_at', updatedAt: false });

// 35. Login Sessions
const LoginSession = sequelize.define('LoginSession', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    login_time: { type: DataTypes.DATE, allowNull: false },
    logout_time: DataTypes.DATE,
    session_status_code: { type: DataTypes.STRING(100), allowNull: false }, // SESSION_STATUS
    ip_address: DataTypes.STRING(50),
    user_agent: DataTypes.TEXT,
    duration_seconds: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'login_sessions', timestamps: false });

// 36. Plans
const Plan = sequelize.define('Plan', {
    name: { type: DataTypes.STRING(150), allowNull: false },
    description: DataTypes.TEXT,
    features: DataTypes.TEXT, // comma-separated feature list managed by SuperAdmin
    plan_type_code: { type: DataTypes.STRING(100), allowNull: false }, // PLAN_TYPE (EXAM, LMS, SURVEY, BUNDLE)
    billing_cycle_code: { type: DataTypes.STRING(100), allowNull: false }, // BILLING_CYCLE
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency_code: { type: DataTypes.STRING(10), allowNull: false },
    status_code: { type: DataTypes.STRING(100), allowNull: false }, // PLAN_STATUS
}, { tableName: 'plans', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// 37. Plan Limits
const PlanLimit = sequelize.define('PlanLimit', {
    plan_id: { type: DataTypes.INTEGER, allowNull: false },
    limit_key: { type: DataTypes.STRING(100), allowNull: false }, // users, exams, etc.
    limit_value: { type: DataTypes.INTEGER, allowNull: false },
}, {
    tableName: 'plan_limits',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [{ unique: true, fields: ['plan_id', 'limit_key'] }]
});

// 38. Subscriptions
const Subscription = sequelize.define('Subscription', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    plan_id: { type: DataTypes.INTEGER, allowNull: false },
    status_code: { type: DataTypes.STRING(100), allowNull: false }, // SUBSCRIPTION_STATUS
    payment_status_code: { type: DataTypes.STRING(100), allowNull: false }, // PAYMENT_STATUS
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    end_date: { type: DataTypes.DATEONLY, allowNull: false },
    external_payment_ref: DataTypes.STRING(150),
}, { tableName: 'subscriptions', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// 39. Wallets
const Wallet = sequelize.define('Wallet', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: DataTypes.INTEGER, // NULL for org-level
    balance: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.00 },
    status_code: { type: DataTypes.STRING(100), allowNull: false }, // WALLET_STATUS
}, { tableName: 'wallets', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// 40. Transactions
const Transaction = sequelize.define('Transaction', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    wallet_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    transaction_type_code: { type: DataTypes.STRING(100), allowNull: false }, // TRANSACTION_TYPE (CREDIT, DEBIT)
    transaction_category_code: { type: DataTypes.STRING(100), allowNull: false }, // TRANSACTION_CATEGORY
    status_code: { type: DataTypes.STRING(100), allowNull: false }, // TRANSACTION_STATUS
    reference_id: DataTypes.STRING(150),
    description: DataTypes.STRING(255),
}, { tableName: 'transactions', timestamps: true, createdAt: 'created_at', updatedAt: false });

// 41. Staging Tables
const StagingParticipant = sequelize.define('StagingParticipant', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    batch_code: { type: DataTypes.STRING(50), allowNull: false },
    file_code: { type: DataTypes.STRING(20), allowNull: true }, // XX#### prefix code
    file_name: { type: DataTypes.STRING(255), allowNull: true }, // editable file name
    group_id: { type: DataTypes.INTEGER, allowNull: true },
    group_ids: { type: DataTypes.JSON, allowNull: true }, // multi-group support
    full_name: { type: DataTypes.STRING(150), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false },
    mobile: DataTypes.STRING(20),
    status_code: { type: DataTypes.STRING(100), defaultValue: 'PENDING' }, // PENDING | ERROR | APPROVED
    issues: DataTypes.TEXT, // JSON array of issue strings
    issue_type: { type: DataTypes.STRING(100), allowNull: true }, // e.g. INVALID_EMAIL, DUPLICATE_EMAIL, etc.
}, { tableName: 'staging_participants', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// 42. Participant Files — tracks uploaded Excel batches
const ParticipantFile = sequelize.define('ParticipantFile', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    file_code: { type: DataTypes.STRING(20), allowNull: false }, // XX#### prefix
    file_name: { type: DataTypes.STRING(255), allowNull: false }, // editable user-supplied name
    original_filename: { type: DataTypes.STRING(255), allowNull: true }, // original uploaded file name
    total_rows: { type: DataTypes.INTEGER, defaultValue: 0 },
    error_rows: { type: DataTypes.INTEGER, defaultValue: 0 },
    pending_rows: { type: DataTypes.INTEGER, defaultValue: 0 },
    approved_rows: { type: DataTypes.INTEGER, defaultValue: 0 },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    group_ids: { type: DataTypes.JSON, allowNull: true }, // multi-group
}, { tableName: 'participant_files', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// 43. History — tracks all CREATE/UPDATE/DELETE on Participants and Questions
const History = sequelize.define('History', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    entity_type: { type: DataTypes.STRING(50), allowNull: false }, // PARTICIPANT | QUESTION
    entity_id: { type: DataTypes.INTEGER, allowNull: true }, // id of the affected user/question
    entity_name: { type: DataTypes.STRING(255), allowNull: true }, // name/email for quick display
    action: { type: DataTypes.STRING(50), allowNull: false }, // CREATE | UPDATE | DELETE
    file_name: { type: DataTypes.STRING(255), allowNull: true },
    file_code: { type: DataTypes.STRING(20), allowNull: true },
    changed_by_id: { type: DataTypes.INTEGER, allowNull: true },
    changed_by_name: { type: DataTypes.STRING(150), allowNull: true },
    detail: { type: DataTypes.JSON, allowNull: true }, // diff / extra info
}, { tableName: 'history', timestamps: true, createdAt: 'changed_at', updatedAt: false });

// 44. Staging Questions — tracks questions in the staging area before approval
const StagingQuestion = sequelize.define('StagingQuestion', {
    organization_id: { type: DataTypes.INTEGER, allowNull: false },
    batch_code: { type: DataTypes.STRING(50), allowNull: false },
    question_text: { type: DataTypes.TEXT, allowNull: false },
    question_type_code: DataTypes.STRING(100),
    status_code: { type: DataTypes.STRING(100), defaultValue: 'PENDING' },
    issues: DataTypes.TEXT,
}, { tableName: 'staging_questions', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// Associations (Initial Batch)
Organization.hasMany(OrganizationSetting, { foreignKey: 'organization_id' });
OrganizationSetting.belongsTo(Organization, { foreignKey: 'organization_id' });

Organization.hasMany(User, { foreignKey: 'organization_id' });
User.belongsTo(Organization, { foreignKey: 'organization_id' });

Organization.hasMany(Role, { foreignKey: 'organization_id' });
Role.belongsTo(Organization, { foreignKey: 'organization_id' });

User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'role_id' });

Organization.hasMany(Dataset, { foreignKey: 'organization_id' });
Dataset.belongsTo(Organization, { foreignKey: 'organization_id' });

Dataset.hasMany(DatasetValue, { foreignKey: 'dataset_id' });
DatasetValue.belongsTo(Dataset, { foreignKey: 'dataset_id' });

DatasetValue.hasMany(DatasetValueMetadata, { foreignKey: 'dataset_value_id' });
DatasetValueMetadata.belongsTo(DatasetValue, { foreignKey: 'dataset_value_id' });

// Associations (Batch 2)
Organization.hasMany(Group, { foreignKey: 'organization_id' });
Group.belongsTo(Organization, { foreignKey: 'organization_id' });
User.hasMany(Group, { foreignKey: 'created_by' });
Group.belongsTo(User, { foreignKey: 'created_by' });
User.hasMany(Group, { as: 'RemovedGroups', foreignKey: 'removed_by' });
Group.belongsTo(User, { as: 'Remover', foreignKey: 'removed_by' });

Organization.hasMany(GroupMember, { foreignKey: 'organization_id' });
GroupMember.belongsTo(Organization, { foreignKey: 'organization_id' });
Group.hasMany(GroupMember, { foreignKey: 'group_id' });
GroupMember.belongsTo(Group, { foreignKey: 'group_id' });
User.hasMany(GroupMember, { foreignKey: 'user_id' });
GroupMember.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(User, { as: 'RemovedUsers', foreignKey: 'removed_by' });
User.belongsTo(User, { as: 'Remover', foreignKey: 'removed_by' });

Organization.hasMany(Exam, { foreignKey: 'organization_id' });
Exam.belongsTo(Organization, { foreignKey: 'organization_id' });
User.hasMany(Exam, { foreignKey: 'created_by' });
Exam.belongsTo(User, { as: 'Creator', foreignKey: 'created_by' });

Organization.hasMany(Category, { foreignKey: 'organization_id' });
Category.belongsTo(Organization, { foreignKey: 'organization_id' });

Organization.hasMany(Topic, { foreignKey: 'organization_id' });
Topic.belongsTo(Organization, { foreignKey: 'organization_id' });

Category.hasMany(Topic, { foreignKey: 'category_id' });
Topic.belongsTo(Category, { foreignKey: 'category_id' });

Organization.hasMany(ExamQuestion, { foreignKey: 'organization_id' });
ExamQuestion.belongsTo(Organization, { foreignKey: 'organization_id' });

Exam.belongsToMany(Question, { through: ExamQuestion, foreignKey: 'exam_id' });
Question.belongsToMany(Exam, { through: ExamQuestion, foreignKey: 'question_id' });

Exam.hasMany(ExamQuestion, { foreignKey: 'exam_id' });
ExamQuestion.belongsTo(Exam, { foreignKey: 'exam_id' });

Question.hasMany(ExamQuestion, { foreignKey: 'question_id' });
ExamQuestion.belongsTo(Question, { foreignKey: 'question_id' });

Category.hasMany(Question, { foreignKey: 'category_id' });
Question.belongsTo(Category, { foreignKey: 'category_id' });

Topic.hasMany(Question, { foreignKey: 'topic_id' });
Question.belongsTo(Topic, { foreignKey: 'topic_id' });

Category.hasMany(Exam, { foreignKey: 'category_id' });
Exam.belongsTo(Category, { foreignKey: 'category_id' });

Topic.hasMany(Exam, { foreignKey: 'topic_id' });
Exam.belongsTo(Topic, { foreignKey: 'topic_id' });

Exam.belongsToMany(Group, { through: ExamGroup, foreignKey: 'exam_id' });
Group.belongsToMany(Exam, { through: ExamGroup, foreignKey: 'group_id' });

Organization.hasMany(Question, { foreignKey: 'organization_id' });
Question.belongsTo(Organization, { foreignKey: 'organization_id' });
User.hasMany(Question, { foreignKey: 'created_by' });
Question.belongsTo(User, { foreignKey: 'created_by' });

Question.hasMany(QuestionOption, { foreignKey: 'question_id' });
QuestionOption.belongsTo(Question, { foreignKey: 'question_id' });

Organization.hasMany(ExamAttempt, { foreignKey: 'organization_id' });
ExamAttempt.belongsTo(Organization, { foreignKey: 'organization_id' });
Exam.hasMany(ExamAttempt, { foreignKey: 'exam_id' });
ExamAttempt.belongsTo(Exam, { foreignKey: 'exam_id' });
User.hasMany(ExamAttempt, { foreignKey: 'user_id' });
ExamAttempt.belongsTo(User, { foreignKey: 'user_id' });
Group.hasMany(ExamAttempt, { foreignKey: 'group_id' });
ExamAttempt.belongsTo(Group, { foreignKey: 'group_id' });

Organization.hasMany(Answer, { foreignKey: 'organization_id' });
Answer.belongsTo(Organization, { foreignKey: 'organization_id' });
Exam.hasMany(Answer, { foreignKey: 'exam_id' });
Answer.belongsTo(Exam, { foreignKey: 'exam_id' });
Question.hasMany(Answer, { foreignKey: 'question_id' });
Answer.belongsTo(Question, { foreignKey: 'question_id' });
User.hasMany(Answer, { foreignKey: 'user_id' });
Answer.belongsTo(User, { foreignKey: 'user_id' });
QuestionOption.hasMany(Answer, { foreignKey: 'selected_option_id' });
Answer.belongsTo(QuestionOption, { foreignKey: 'selected_option_id' });

Organization.hasMany(Result, { foreignKey: 'organization_id' });
Result.belongsTo(Organization, { foreignKey: 'organization_id' });
Exam.hasMany(Result, { foreignKey: 'exam_id' });
Result.belongsTo(Exam, { foreignKey: 'exam_id' });
Group.hasMany(Result, { foreignKey: 'group_id' });
Result.belongsTo(Group, { foreignKey: 'group_id' });
User.hasMany(Result, { foreignKey: 'user_id' });
Result.belongsTo(User, { foreignKey: 'user_id' });

// Associations (Batch 3)
Organization.hasMany(Course, { foreignKey: 'organization_id' });
Course.belongsTo(Organization, { foreignKey: 'organization_id' });
User.hasMany(Course, { foreignKey: 'created_by' });

Course.hasMany(Module, { foreignKey: 'course_id' });
Module.belongsTo(Course, { foreignKey: 'course_id' });

Module.hasMany(Lesson, { foreignKey: 'module_id' });
Lesson.belongsTo(Module, { foreignKey: 'module_id' });
Exam.hasMany(Lesson, { foreignKey: 'exam_id' });
Lesson.belongsTo(Exam, { foreignKey: 'exam_id' });

Organization.hasMany(Enrollment, { foreignKey: 'organization_id' });
Enrollment.belongsTo(Organization, { foreignKey: 'organization_id' });
User.hasMany(Enrollment, { foreignKey: 'user_id' });
Enrollment.belongsTo(User, { foreignKey: 'user_id' });
Course.hasMany(Enrollment, { foreignKey: 'course_id' });
Enrollment.belongsTo(Course, { foreignKey: 'course_id' });

Enrollment.hasMany(LessonProgress, { foreignKey: 'enrollment_id' });
LessonProgress.belongsTo(Enrollment, { foreignKey: 'enrollment_id' });
Lesson.hasMany(LessonProgress, { foreignKey: 'lesson_id' });
LessonProgress.belongsTo(Lesson, { foreignKey: 'lesson_id' });

Organization.hasMany(Assignment, { foreignKey: 'organization_id' });
Assignment.belongsTo(Organization, { foreignKey: 'organization_id' });
Group.hasMany(Assignment, { foreignKey: 'group_id' });
Assignment.belongsTo(Group, { foreignKey: 'group_id' });
User.hasMany(Assignment, { foreignKey: 'created_by' });

Organization.hasMany(Survey, { foreignKey: 'organization_id' });
Survey.belongsTo(Organization, { foreignKey: 'organization_id' });
User.hasMany(Survey, { foreignKey: 'created_by' });

Survey.belongsToMany(Group, { through: SurveyGroup, foreignKey: 'survey_id' });
Group.belongsToMany(Survey, { through: SurveyGroup, foreignKey: 'group_id' });

Organization.hasMany(SurveyResponse, { foreignKey: 'organization_id' });
SurveyResponse.belongsTo(Organization, { foreignKey: 'organization_id' });
Survey.hasMany(SurveyResponse, { foreignKey: 'survey_id' });
SurveyResponse.belongsTo(Survey, { foreignKey: 'survey_id' });
User.hasMany(SurveyResponse, { foreignKey: 'user_id' });
SurveyResponse.belongsTo(User, { foreignKey: 'user_id' });

// Associations (Batch 4)
Organization.hasMany(Notification, { foreignKey: 'organization_id' });
Notification.belongsTo(Organization, { foreignKey: 'organization_id' });
User.hasMany(Notification, { foreignKey: 'created_by' });

Organization.hasMany(Notice, { foreignKey: 'organization_id' });
Notice.belongsTo(Organization, { foreignKey: 'organization_id' });
User.hasMany(Notice, { as: 'SentNotices', foreignKey: 'sender_id' });
Notice.belongsTo(User, { as: 'Sender', foreignKey: 'sender_id' });
User.hasMany(Notice, { as: 'ReceivedNotices', foreignKey: 'receiver_id' });
Notice.belongsTo(User, { as: 'Receiver', foreignKey: 'receiver_id' });
Group.hasMany(Notice, { foreignKey: 'group_id' });
Notice.belongsTo(Group, { foreignKey: 'group_id' });

Organization.hasMany(Feedback, { foreignKey: 'organization_id' });
Feedback.belongsTo(Organization, { foreignKey: 'organization_id' });
User.hasMany(Feedback, { as: 'SentFeedback', foreignKey: 'sender_id' });
Feedback.belongsTo(User, { as: 'SenderUser', foreignKey: 'sender_id' });
User.hasMany(Feedback, { as: 'ReceivedFeedback', foreignKey: 'receiver_id' });
Feedback.belongsTo(User, { as: 'ReceiverUser', foreignKey: 'receiver_id' });

Organization.hasMany(AuditLog, { foreignKey: 'organization_id' });
AuditLog.belongsTo(Organization, { foreignKey: 'organization_id' });
User.hasMany(AuditLog, { foreignKey: 'changed_by' });

Organization.hasMany(ActivityLog, { foreignKey: 'organization_id' });
ActivityLog.belongsTo(Organization, { foreignKey: 'organization_id' });
User.hasMany(ActivityLog, { foreignKey: 'user_id' });

Organization.hasMany(LoginSession, { foreignKey: 'organization_id' });
LoginSession.belongsTo(Organization, { foreignKey: 'organization_id' });
User.hasMany(LoginSession, { foreignKey: 'user_id' });

Plan.hasMany(PlanLimit, { foreignKey: 'plan_id' });
PlanLimit.belongsTo(Plan, { foreignKey: 'plan_id' });

Organization.hasMany(Subscription, { foreignKey: 'organization_id' });
Subscription.belongsTo(Organization, { foreignKey: 'organization_id' });
Plan.hasMany(Subscription, { foreignKey: 'plan_id' });
Subscription.belongsTo(Plan, { foreignKey: 'plan_id' });

Organization.hasMany(Wallet, { foreignKey: 'organization_id' });
Wallet.belongsTo(Organization, { foreignKey: 'organization_id' });
User.hasMany(Wallet, { foreignKey: 'user_id' });
Wallet.belongsTo(User, { foreignKey: 'user_id' });

Organization.hasMany(Transaction, { foreignKey: 'organization_id' });
Transaction.belongsTo(Organization, { foreignKey: 'organization_id' });
Wallet.hasMany(Transaction, { foreignKey: 'wallet_id' });
Transaction.belongsTo(Wallet, { foreignKey: 'wallet_id' });

Organization.hasMany(StagingParticipant, { foreignKey: 'organization_id' });
StagingParticipant.belongsTo(Organization, { foreignKey: 'organization_id' });
Group.hasMany(StagingParticipant, { foreignKey: 'group_id' });
StagingParticipant.belongsTo(Group, { foreignKey: 'group_id' });

Organization.hasMany(StagingQuestion, { foreignKey: 'organization_id' });
StagingQuestion.belongsTo(Organization, { foreignKey: 'organization_id' });

Organization.hasMany(ParticipantFile, { foreignKey: 'organization_id' });
ParticipantFile.belongsTo(Organization, { foreignKey: 'organization_id' });
User.hasMany(ParticipantFile, { foreignKey: 'created_by' });

Organization.hasMany(History, { foreignKey: 'organization_id' });
History.belongsTo(Organization, { foreignKey: 'organization_id' });
User.hasMany(History, { foreignKey: 'changed_by_id' });

module.exports = {
    sequelize,
    Organization,
    OrganizationSetting,
    User,
    Role,
    UserRole,
    Dataset,
    DatasetValue,
    DatasetValueMetadata,
    Group,
    GroupMember,
    Exam,
    ExamGroup,
    Question,
    QuestionOption,
    ExamAttempt,
    Answer,
    Result,
    Course,
    Module,
    Lesson,
    Enrollment,
    LessonProgress,
    Assignment,
    Survey,
    SurveyGroup,
    SurveyResponse,
    Notification,
    Notice,
    Feedback,
    AuditLog,
    ActivityLog,
    LoginSession,
    Plan,
    PlanLimit,
    Subscription,
    Wallet,
    Transaction,
    StagingParticipant,
    StagingQuestion,
    ParticipantFile,
    History,
    Category,
    Topic,
    ExamQuestion,
    sequelize,
};
