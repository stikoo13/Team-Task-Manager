import { useEffect, useState } from 'react';
import axios from '../api/axios';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [focused, setFocused] = useState('');
  const { dark } = useTheme();
  const t = dark ? D : L;
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const id = 'synq-projects-style';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes cardIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .synq-proj-card { animation: cardIn 0.4s ease forwards; transition: box-shadow 0.2s, transform 0.2s !important; }
        .synq-proj-card:hover { transform: translateY(-3px) !important; }
        .synq-proj-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; }
        .synq-del-btn:hover { background: rgba(239,68,68,0.2) !important; }
      `;
      document.head.appendChild(s);
    }
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    axios.get('/projects').then(res => setProjects(res.data)).catch(() => {});
  };

  const createProject = async () => {
    if (!form.name) return setError('Project name is required');
    try {
      await axios.post('/projects', form);
      setForm({ name: '', description: '' });
      setError('');
      fetchProjects();
    } catch (err) { setError(err.response?.data?.message || 'Failed to create project'); }
  };

  const deleteProject = async (id) => {
    try {
      await axios.delete(`/projects/${id}`);
      fetchProjects();
    } catch {}
  };

  const projectColors = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #f59e0b, #f97316)',
    'linear-gradient(135deg, #10b981, #34d399)',
    'linear-gradient(135deg, #ef4444, #f43f5e)',
    'linear-gradient(135deg, #3b82f6, #6366f1)',
    'linear-gradient(135deg, #ec4899, #a855f7)',
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, fontFamily: "'DM Sans', sans-serif", transition: 'background 0.3s' }}>
      <Sidebar active="projects" />

      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>
            Workspace
          </p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '32px', fontWeight: '700', color: t.text, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Projects
          </h1>
          <p style={{ color: t.textSec, fontSize: '14px', margin: 0 }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace
          </p>
        </div>

        {/* Create Project — admin only */}
        {user.role === 'admin' && (
          <div style={{
            background: t.cardBg, borderRadius: '16px', padding: '28px',
            border: `1px solid ${t.border}`, marginBottom: '32px',
            boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: '700', color: t.text, margin: '0 0 20px' }}>
              Create New Project
            </h2>

            {error && (
              <div style={{
                background: dark ? 'rgba(239,68,68,0.1)' : '#fef2f2',
                border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px',
                padding: '10px 14px', color: '#f87171', fontSize: '13px', marginBottom: '16px',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <span>⚠</span> {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              {[
                { key: 'name',        label: 'Project Name',  placeholder: 'e.g. Website Redesign' },
                { key: 'description', label: 'Description',   placeholder: 'Brief project description' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: t.textSec, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                    {f.label}
                  </label>
                  <input
                    className="synq-proj-input"
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onFocus={() => setFocused(f.key)}
                    onBlur={() => setFocused('')}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && createProject()}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: '10px',
                      border: `1.5px solid ${focused === f.key ? '#6366f1' : t.border}`,
                      background: t.inputBg, color: t.text, fontSize: '14px',
                      boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s',
                      fontFamily: "'DM Sans', sans-serif"
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={createProject}
              style={{
                padding: '11px 28px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', border: 'none', borderRadius: '10px',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                transition: 'all 0.2s'
              }}
            >
              + Create Project
            </button>
          </div>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div style={{
            background: t.cardBg, borderRadius: '16px', padding: '64px',
            border: `1px solid ${t.border}`, textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>⬡</div>
            <p style={{ color: t.textSec, fontSize: '15px', margin: 0 }}>No projects yet. Create your first one above.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
            {projects.map((p, i) => (
              <div key={p.id} className="synq-proj-card" style={{
                background: t.cardBg, borderRadius: '16px', padding: '24px',
                border: `1px solid ${t.border}`, animationDelay: `${i * 0.06}s`,
                boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.05)'
              }}>
                {/* Color bar */}
                <div style={{
                  height: '4px', borderRadius: '4px', marginBottom: '18px',
                  background: projectColors[i % projectColors.length]
                }} />

                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: projectColors[i % projectColors.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', color: 'white', marginBottom: '14px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  ⬡
                </div>

                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '15px', fontWeight: '700', color: t.text, margin: '0 0 6px' }}>
                  {p.name}
                </h3>
                <p style={{ color: t.textSec, fontSize: '13px', margin: '0 0 16px', lineHeight: 1.5 }}>
                  {p.description || 'No description provided.'}
                </p>

                {user.role === 'admin' && (
                  <button
                    className="synq-del-btn"
                    onClick={() => deleteProject(p.id)}
                    style={{
                      padding: '6px 14px', background: 'rgba(239,68,68,0.1)',
                      color: '#f87171', border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                      transition: 'all 0.18s', fontFamily: "'DM Sans', sans-serif"
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const L = { bg:'#f8fafc', cardBg:'#ffffff', inputBg:'#ffffff', text:'#0f172a', textSec:'#64748b', border:'#e2e8f0' };
const D = { bg:'#070714', cardBg:'#0e0e1c', inputBg:'#13132a', text:'#e2e8f0', textSec:'#475569', border:'rgba(255,255,255,0.07)' };