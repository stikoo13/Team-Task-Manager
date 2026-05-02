require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

Project.belongsToMany(User, { through: 'ProjectMembers', as: 'members' });
User.belongsToMany(Project, { through: 'ProjectMembers', as: 'projects' });
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });
Task.belongsTo(Project, { foreignKey: 'ProjectId', as: 'project' });

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

sequelize.sync({ alter: true })
  .then(() => console.log('Tables synced!'))
  .catch(err => console.error('Sync error:', err.message));

// TEST ROUTE - tells you exactly what's wrong
app.post('/api/test-login', async (req, res) => {
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const { email, password } = req.body;
  try {
    console.log('1. Looking for user:', email);
    const user = await User.findOne({ where: { email } });
    console.log('2. User found:', user ? 'YES' : 'NO');
    if (!user) return res.json({ step: 'findOne', error: 'No user with this email' });

    console.log('3. Comparing password...');
    const valid = await bcrypt.compare(password, user.password);
    console.log('4. Password valid:', valid);
    if (!valid) return res.json({ step: 'bcrypt', error: 'Wrong password' });

    console.log('5. JWT_SECRET:', process.env.JWT_SECRET);
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('6. Token created:', !!token);

    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('FULL ERROR:', err);
    res.json({ step: 'catch', error: err.message, stack: err.stack });
  }
});

app.get('/', (req, res) => res.json({ message: 'SYNQ AI API is running!' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

app.listen(process.env.PORT || 5000, () => {
  console.log('Server running on port', process.env.PORT || 5000);
  console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_NAME:', process.env.DB_NAME);
});