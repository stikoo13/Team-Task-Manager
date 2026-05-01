import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    axios.get('/tasks').then(res => setTasks(res.data)).catch(() => {});
  }, []);

  const logout = () => { localStorage.clear(); navigate('/login'); };

  const todo = tasks.filter(t => t.status === 'todo').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const done = tasks.filter(t => t.status === 'done').length;
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;

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
        <h1>Welcome, {user.name}! 👋</h1>
        <p style={{color:'#666'}}>Role: <b>{user.role}</b></p>
        <div style={styles.cards}>
          <div style={{...styles.card, background:'#4f46e5'}}><h3>Total Tasks</h3><h1>{tasks.length}</h1></div>
          <div style={{...styles.card, background:'#f59e0b'}}><h3>In Progress</h3><h1>{inProgress}</h1></div>
          <div style={{...styles.card, background:'#10b981'}}><h3>Done</h3><h1>{done}</h1></div>
          <div style={{...styles.card, background:'#ef4444'}}><h3>Overdue</h3><h1>{overdue}</h1></div>
        </div>
        <h2>Recent Tasks</h2>
        {tasks.slice(0,5).map(task => (
          <div key={task.id} style={styles.taskItem}>
            <span>{task.title}</span>
            <span style={{...styles.badge, background: task.status==='done'?'#10b981':task.status==='in-progress'?'#f59e0b':'#6b7280'}}>
              {task.status}
            </span>
          </div>
        ))}
        {tasks.length === 0 && <p style={{color:'#999'}}>No tasks yet. <Link to="/tasks">Create one!</Link></p>}
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
  cards: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', margin:'24px 0' },
  card: { padding:'20px', borderRadius:'12px', color:'white' },
  taskItem: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px', background:'white', borderRadius:'8px', marginBottom:'8px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' },
  badge: { padding:'4px 12px', borderRadius:'20px', color:'white', fontSize:'12px' }
};