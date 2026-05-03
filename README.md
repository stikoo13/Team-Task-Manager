# Team-Task-Manager

# SYNQ AI 🚀

SYNQ AI is an AI-powered Team Task Management platform designed to help teams collaborate smarter, manage tasks efficiently, and improve productivity using artificial intelligence. The platform combines task management features with AI-driven assistance to automate workflows, generate smart suggestions, and enhance team coordination.

---

# 📌 Features

## 🔹 User Authentication
- Secure Login & Registration
- JWT-based Authentication
- Protected Routes
- Role-based Access Control

## 🔹 Team Management
- Create and manage teams
- Add or remove team members
- Assign roles to users
- Team collaboration support

## 🔹 Task Management
- Create tasks with title, description, priority, and deadlines
- Assign tasks to team members
- Update task status (Pending, In Progress, Completed)
- Task filtering and sorting
- Real-time task tracking

## 🔹 AI-Powered Features
- AI-generated task summaries
- Smart task suggestions
- AI productivity insights
- Automated workflow recommendations
- Intelligent task prioritization

## 🔹 Dashboard
- Team productivity overview
- Task statistics and analytics
- Progress tracking
- Visual task management system

## 🔹 Notifications
- Real-time updates
- Deadline reminders
- Task assignment alerts

---

# 🛠️ Tech Stack

## Frontend
- React.js
- Tailwind CSS
- Axios
- React Router DOM

## Backend
- Node.js
- Express.js
- JWT Authentication
- REST API

## Database
- PostgreSQL

## AI Integration
- OpenAI API / AI Model Integration

## Deployment
- Render / Railway / Vercel

---

# 📂 Project Structure

```bash
SYNQ-AI/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── App.js
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   └── server.js
│
├── README.md
└── package.json
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/SYNQ-AI.git
cd SYNQ-AI
```

---

## 2️⃣ Backend Setup

```bash
cd backend
npm install
```

### Create `.env` File

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_api_key
```

### Start Backend Server

```bash
npm start
```

Server will run on:

```bash
http://localhost:5000
```

---

## 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend will run on:

```bash
http://localhost:3000
```

---

# 🔌 API Endpoints

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register User |
| POST | /api/auth/login | Login User |

## Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | Get All Tasks |
| POST | /api/tasks | Create Task |
| PUT | /api/tasks/:id | Update Task |
| DELETE | /api/tasks/:id | Delete Task |

## AI Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ai/summarize | Generate Task Summary |
| POST | /api/ai/suggestions | AI Task Suggestions |

---

# 🤖 How AI Works in SYNQ AI

SYNQ AI uses artificial intelligence to improve productivity and simplify project management. The AI system analyzes task descriptions, deadlines, and project workflows to provide:

- Smart task recommendations
- Automatic task summaries
- Priority suggestions
- Workflow optimization
- Productivity insights

This helps teams save time, reduce manual work, and focus on important tasks.

---

# 📸 Future Enhancements

- AI Chat Assistant
- Voice Command Integration
- Real-time Chat System
- Calendar Integration
- File Upload Support
- AI-based Deadline Prediction
- Mobile Application

---

# 👨‍💻 Contributors

### Sahir Tikoo
- Full Stack Development
- AI Integration
- Backend API Development
- UI/UX Design

---

# 📖 Project Objective

The main objective of SYNQ AI is to build a modern AI-powered collaboration platform that helps teams organize tasks, improve communication, and increase overall productivity through intelligent automation.

---

# 🧠 Learning Outcomes

Through this project, the following concepts were implemented and learned:

- MERN-style Full Stack Development
- REST API Development
- Authentication & Authorization
- Database Management
- AI Integration
- Team Collaboration Systems
- Frontend & Backend Integration
- Deployment and Hosting

---

# 📜 License

This project is developed for educational and learning purposes.

---

# ⭐ Conclusion

SYNQ AI is an innovative AI-powered task management platform that combines modern web technologies with artificial intelligence to improve teamwork, productivity, and project management efficiency. The project demonstrates practical implementation of full-stack development concepts along with AI integration in real-world applications.

