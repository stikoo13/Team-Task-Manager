const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');
require('dotenv').config();

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

// Associations
Project.belongsToMany(User, { through: 'ProjectMembers', as: 'members' });
User.belongsToMany(Project, { through: 'ProjectMembers', as: 'projects' });
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });
Task.belongsTo(Project, { foreignKey: 'ProjectId', as: 'project' });

const app = express();
connectDB();

sequelize.sync({ alter: true }).then(() => console.log('Tables synced!'));

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'TaskFlow API is running!' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

app.listen(process.env.PORT || 5000, () => console.log('Server running on port 5000'));
