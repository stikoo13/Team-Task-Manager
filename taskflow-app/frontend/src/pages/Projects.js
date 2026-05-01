import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = () => {
    axios.get('/projects').then(res => setProjects(res.data)).catch(() => {});
  };

  const createProject = async () => {
    if (!form.name) return setError('Name is required');
    try {
      await axios.post('/projects', form);
      setForm({ name: '', description: '' });
      setError('');
      fetchProjects();
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
  };

  const deleteProject = async (id) => {
    await axios.delete(`/projects/${id}`);
    fetchProjects();
  };

  const logout = () => { localStorage.clear(); navigate('/login'); };

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
        <h1>Projects</h1>
        {user.role === 'admin' && (
          <div style={styles.formBox}>
            <h3>Create Project</h3>
            {error && <p style={{color:'red'}}>{error}</p>}
            <input style={styles.input} placeholder="Project Name" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
            <input style={styles.input} placeholder="Description" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
            <button style={styles.button} onClick={createProject}>Create</button>
          </div>
        )}
        <div style={styles.grid}>
          {projects.map(p => (
            <div key={p.id} style={styles.card}>
              <h3>{p.name}</h3>
              <p style={{color:'#666'}}>{p.description || 'No description'}</p>
              {user.role === 'admin' && (
                <button style={styles.deleteBtn} onClick={() => deleteProject(p.id)}>Delete</button>
              )}
            </div>
          ))}
        </div>
        {projects.length === 0 && <p style={{color:'#999'}}>No projects yet.</p>}
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
  grid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' },
  card: { background:'white', padding:'20px', borderRadius:'12px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' },
  deleteBtn: { padding:'6px 16px', background:'#ef4444', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', marginTop:'8px' }
};