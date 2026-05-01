import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', ProjectId: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/tasks').then(res => setTasks(res.data)).catch(() => {});
    axios.get('/projects').then(res => setProjects(res.data)).catch(() => {});
  }, []);

  const createTask = async () => {
    if (!form.title) return setError('Title is required');
    try {
      await axios.post('/tasks', form);
      setForm({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', ProjectId: '' });
      setError('');
      axios.get('/tasks').then(res => setTasks(res.data));
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
  };

  const updateStatus = async (id, status) => {
    await axios.put(`/tasks/${id}`, { status });
    axios.get('/tasks').then(res => setTasks(res.data));
  };

  const deleteTask = async (id) => {
    await axios.delete(`/tasks/${id}`);
    axios.get('/tasks').then(res => setTasks(res.data));
  };

  const logout = () => { localStorage.clear(); navigate('/login'); };

  const priorityColor = { low:'#10b981', medium:'#f59e0b', high:'#ef4444' };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>TaskFlow</h2>
        <Link style={styles.navItem} to="/dashboard">Dashboard</Link>
        <Link style={styles.navItem} to="/projects">Projects</Link>
        <Link style={styles.navItem} to="/tasks">Tasks</Link>
        <button style={styles.logout} onClick={logout}>Logout</button>
      </div>
      <div style={styles.main}>
        <h1>Tasks</h1>
        <div style={styles.formBox}>
          <h3>Create Task</h3>
          {error && <p style={{color:'red'}}>{error}</p>}
          <input style={styles.input} placeholder="Task Title" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} />
          <input style={styles.input} placeholder="Description" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} />
          <select style={styles.input} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select style={styles.input} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input style={styles.input} type="date" value={form.dueDate}
            onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          <select style={styles.input} value={form.ProjectId} onChange={e => setForm({ ...form, ProjectId: e.target.value })}>
            <option value="">Select Project (optional)</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button style={styles.button} onClick={createTask}>Create Task</button>
        </div>
        {tasks.map(task => (
          <div key={task.id} style={styles.taskCard}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <h3 style={{margin:0}}>{task.title}</h3>
                <p style={{color:'#666', margin:'4px 0'}}>{task.description}</p>
                <span style={{...styles.badge, background: priorityColor[task.priority]}}>{task.priority}</span>
                {task.dueDate && <span style={{marginLeft:'8px', color:'#999', fontSize:'12px'}}>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
              </div>
              <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                <select style={styles.statusSelect} value={task.status}
                  onChange={e => updateStatus(task.id, e.target.value)}>
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <button style={styles.deleteBtn} onClick={() => deleteTask(task.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <p style={{color:'#999'}}>No tasks yet. Create one above!</p>}
      </div>
    </div>
  );
}

const styles = {
  container: { display:'flex', minHeight:'100vh', fontFamily:'sans-serif' },
  sidebar: { width:'220px', background:'#1a1a2e', padding:'24px', display:'flex', flexDirection:'column', gap:'8px' },
  logo: { color:'white', marginBottom:'24px' },
  navItem: { color:'#a0aec0', textDecoration:'none', padding:'10px', borderRadius:'8px', display:'block' },
  logout: { marginTop:'auto', padding:'10px', background:'#ef4444', color:'white', border:'none', borderRadius:'8px', cursor:'pointer' },
  main: { flex:1, padding:'32px', background:'#f8fafc' },
  formBox: { background:'white', padding:'24px', borderRadius:'12px', marginBottom:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' },
  input: { width:'100%', padding:'10px', margin:'6px 0', borderRadius:'8px', border:'1px solid #ddd', boxSizing:'border-box' },
  button: { padding:'10px 24px', background:'#4f46e5', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', marginTop:'8px' },
  taskCard: { background:'white', padding:'16px', borderRadius:'12px', marginBottom:'12px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' },
  badge: { padding:'4px 10px', borderRadius:'20px', color:'white', fontSize:'12px' },
  statusSelect: { padding:'6px', borderRadius:'6px', border:'1px solid #ddd' },
  deleteBtn: { padding:'6px 16px', background:'#ef4444', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }
};