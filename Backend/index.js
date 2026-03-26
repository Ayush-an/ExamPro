const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const superadminRoutes = require('./routes/superadminRoutes');
const adminRoutes = require('./routes/adminRoutes');
const participantRoutes = require('./routes/participantRoutes');

dotenv.config({ quiet: true });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static('upload'));

// Global Log with absolute path
const fs = require('fs');
const path = require('path');
const globalLogPath = path.join(__dirname, 'global_debug.log');

app.use((req, res, next) => {
    fs.appendFileSync(globalLogPath, `${req.method} ${req.url} ${new Date()}\n`);
    next();
});

app.get('/api/test-me', (req, res) => {
    res.json({ message: 'I am alive', time: new Date() });
});

// Routes
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/auth', authRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/participant', participantRoutes);
app.use('/api/superuser', require('./routes/superuserRoutes'));

// ─── New unified routes (match frontend api.js) ──────────────────
app.use('/api/exam', require('./routes/examRoutes'));
app.use('/api/group', require('./routes/groupRoutes'));
app.use('/api/question', require('./routes/questionRoutes'));
app.use('/api/notice', require('./routes/noticeRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/assignment', require('./routes/assignmentRoutes'));
app.use('/api/result', require('./routes/resultRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));
app.use('/api/answer', require('./routes/answerRoutes'));
app.use('/api', require('./routes/categoryTopicRoutes'));

// Database check map
app.get('/health', (req, res) => {
    res.json({ status: 'API is running' });
});

const PORT = process.env.PORT || 5000;

sequelize.authenticate({ logging: false }).then(() => {
    console.log('Database connected.');
    console.log('Synchronizing database...');
    return sequelize.sync({ alter: false, logging: false });
}).then(() => {
    console.log('Database synchronized.');

    // Start exam scheduler cron job
    const { startExamScheduler } = require('./cron/examScheduler');
    startExamScheduler();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});
