require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const { connectDB, sequelize } = require('./config/db');

// Load models + associations from index.js (single source of truth)
require('./models/index');

const app = express();
app.use(cors({
  origin: [
    'https://delightful-art-production-0d5d.up.railway.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
connectDB();
sequelize.sync({ alter: true })
  .then(() => console.log('✅ DB synced'))
  .catch(err => console.error('❌ Sync error:', err));

app.get('/', (_req, res) => res.json({ message: 'SYNQ AI API is running!' }));
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks',    require('./routes/taskRoutes'));
app.use('/api/ai',       require('./routes/aiRoutes'));

app.listen(process.env.PORT || 5000, () => {
  console.log('Server running on port', process.env.PORT || 5000);
  console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);
  console.log('DB_HOST:', process.env.DB_HOST);
});
