import { useEffect, useState } from 'react';
import axios from '../api/axios';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';

const STATUS_CONFIG = {
  'todo':        { label: 'To Do',       color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  'in-progress': { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  'done':        { label: 'Done',        color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
};

const PRIORITY_CONFIG = {
  low:    { color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  high:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
};

const L = { bg:'#f8fafc', cardBg:'#ffffff', inputBg:'#ffffff', text:'#0f172a', textSec:'#64748b', border:'#e2e8f0' };
const D = { bg:'#070714', cardBg:'#0e0e1c', inputBg:'#13132a', text:'#e2e8f0', textSec:'#475569', border:'rgba(255,255,255,0.07)' };

export default function Tasks() {
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm]         = useState({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', ProjectId: '' });
  const [error, setError]       = useState('');
  const [focused, setFocused]   = useState('');
  const [activeProject, setActiveProject] = useState('all');
  const { dark } = useTheme();
  const t = dark ? D : L;
  const user    = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin  = user.role === 'admin';
  const isMember = user.role === 'member';

  useEffect(() => {
    const id = 'synq-tasks-style';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes cardIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .synq-task-card { animation: cardIn 0.35s ease forwards; }
        .synq-task-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; }
        .synq-del-btn:hover { background: rgba(239,68,68,0.2) !important; }
        .synq-create-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(99,102,241,0.4) !important; }
        .synq-proj-tab:hover { background: rgba(99,102,241,0.08) !important; }
      `;
      document.head.appendChild(s);
    }
    fetchAll();
  }, []);

  const fetchAll = () => {
    axios.get('/tasks').then(res => setTasks(res.data)).catch(() => {});
    axios.get('/projects').then(res => setProjects(res.data)).catch(() => {});
  };

  const createTask = async () => {
    if (!form.title) return setError('Task title is required');
    try {
      await axios.post('/tasks', form);
      setForm({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', ProjectId: '' });
      setError('');
      fetchAll();
    } catch (err) { setError(err.response?.data?.message || 'Failed to create task'); }
  };

  const updateStatus = async (id, status) => {
    try { await axios.put(`/tasks/${id}`, { status }); fetchAll(); } catch {}
  };

  const deleteTask = async (id) => {
    try { await axios.delete(`/tasks/${id}`); fetchAll(); } catch {}
  };

  const inputStyle = (key) => ({
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: `1.5px solid ${focused === key ? '#6366f1' : t.border}`,
    background: t.inputBg, color: t.text, fontSize: '14px',
    boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s',
    fontFamily: "'DM Sans', sans-serif"
  });

  const projectsWithTasks = projects.filter(p => tasks.some(tk => tk.ProjectId === p.id));
  const unassignedTasks   = tasks.filter(tk => !tk.ProjectId);
  const filteredTasks     = activeProject === 'all'  ? tasks
    : activeProject === 'none' ? unassignedTasks
    : tasks.filter(tk => tk.ProjectId === activeProject);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, fontFamily: "'DM Sans', sans-serif", transition: 'background 0.3s' }}>
      <Sidebar active="tasks" />

      <main style={{ flex: 1, display: 'flex', overflowY: 'auto' }}>

        {/* Member: project filter sidebar */}
        {isMember && (
          <div style={{ width: '200px', flexShrink: 0, borderRight: `1px solid ${t.border}`, padding: '32px 12px', background: t.cardBg }}>
            <p style={{ fontSize: '10px', fontWeight: '700', color: t.textSec, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', padding: '0 8px' }}>
              Projects
            </p>
            {[
              { id: 'all', name: 'All Tasks', count: tasks.length },
              ...projectsWithTasks.map(p => ({ id: p.id, name: p.name, count: tasks.filter(tk => tk.ProjectId === p.id).length })),
              ...(unassignedTasks.length > 0 ? [{ id: 'none', name: 'No Project', count: unassignedTasks.length }] : [])
            ].map(proj => (
              <button key={proj.id} className="synq-proj-tab"
                onClick={() => setActiveProject(proj.id)}
                style={{
                  width: '100%', textAlign: 'left', padding: '9px 12px', borderRadius: '9px',
                  border: 'none', cursor: 'pointer', marginBottom: '2px',
                  background: activeProject === proj.id ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                  color: activeProject === proj.id ? 'white' : t.textSec,
                  fontSize: '13px', fontWeight: activeProject === proj.id ? '600' : '500',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif"
                }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{proj.name}</span>
                <span style={{
                  fontSize: '10px', fontWeight: '700', padding: '1px 7px', borderRadius: '20px',
                  background: activeProject === proj.id ? 'rgba(255,255,255,0.2)' : t.border,
                  color: activeProject === proj.id ? 'white' : t.textSec, flexShrink: 0
                }}>{proj.count}</span>
              </button>
            ))}
          </div>
        )}

        <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '36px' }}>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>
              {isMember ? 'My Tasks' : 'Task Management'}
            </p>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '32px', fontWeight: '700', color: t.text, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
              Tasks
            </h1>
            <p style={{ color: t.textSec, fontSize: '14px', margin: 0 }}>
              {isMember ? 'Tasks assigned to you, grouped by project.' : `${tasks.length} task${tasks.length !== 1 ? 's' : ''} total`}
            </p>
          </div>

          {/* Create Task Form — ADMIN ONLY */}
          {isAdmin && (
            <div style={{
              background: t.cardBg, borderRadius: '16px', padding: '28px',
              border: `1px solid ${t.border}`, marginBottom: '32px',
              boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: '700', color: t.text, margin: '0 0 20px' }}>
                Create New Task
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                {[
                  { key: 'title',       label: 'Task Title',   placeholder: 'e.g. Design homepage' },
                  { key: 'description', label: 'Description',  placeholder: 'Brief description'    },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: t.textSec, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>{f.label}</label>
                    <input className="synq-task-input" placeholder={f.placeholder} value={form[f.key]}
                      onFocus={() => setFocused(f.key)} onBlur={() => setFocused('')}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && createTask()}
                      style={inputStyle(f.key)} />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: t.textSec, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Status</label>
                  <select className="synq-task-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ ...inputStyle('status'), cursor: 'pointer' }}>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: t.textSec, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Priority</label>
                  <select className="synq-task-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={{ ...inputStyle('priority'), cursor: 'pointer' }}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: t.textSec, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Due Date</label>
                  <input type="date" className="synq-task-input" value={form.dueDate}
                    onFocus={() => setFocused('date')} onBlur={() => setFocused('')}
                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    style={{ ...inputStyle('date'), colorScheme: dark ? 'dark' : 'light' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: t.textSec, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Project (optional)</label>
                  <select className="synq-task-input" value={form.ProjectId} onChange={e => setForm({ ...form, ProjectId: e.target.value })} style={{ ...inputStyle('project'), cursor: 'pointer' }}>
                    <option value="">No project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <button className="synq-create-btn" onClick={createTask}
                style={{
                  padding: '11px 28px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white', border: 'none', borderRadius: '10px',
                  fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: '0 4px 14px rgba(99,102,241,0.35)', transition: 'all 0.2s'
                }}>
                + Create Task
              </button>
            </div>
          )}

          {/* Task List */}
          {filteredTasks.length === 0 ? (
            <div style={{ background: t.cardBg, borderRadius: '16px', padding: '64px', border: `1px solid ${t.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>◉</div>
              <p style={{ color: t.textSec, fontSize: '15px', margin: 0 }}>
                {isMember ? 'No tasks assigned to you yet.' : 'No tasks yet. Create one above!'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredTasks.map((task, i) => {
                const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG['todo'];
                const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                const isOverdue  = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
                const projectName = projects.find(p => p.id === task.ProjectId)?.name;

                return (
                  <div key={task.id} className="synq-task-card" style={{
                    background: t.cardBg, borderRadius: '14px', padding: '20px 24px',
                    border: `1px solid ${isOverdue ? 'rgba(239,68,68,0.25)' : t.border}`,
                    animationDelay: `${i * 0.05}s`,
                    boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 10px rgba(0,0,0,0.04)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '15px', fontWeight: '700', color: t.text, margin: 0 }}>{task.title}</h3>
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: pc.bg, color: pc.color }}>{task.priority}</span>
                          {isOverdue && <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>Overdue</span>}
                          {projectName && <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>⬡ {projectName}</span>}
                        </div>
                        {task.description && <p style={{ color: t.textSec, fontSize: '13px', margin: '0 0 10px', lineHeight: 1.5 }}>{task.description}</p>}
                        {task.dueDate && <span style={{ fontSize: '12px', color: isOverdue ? '#f87171' : t.textSec }}>Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: sc.bg, color: sc.color }}>{sc.label}</span>

                        {/* Status dropdown — everyone can update their own task status */}
                        <select value={task.status} onChange={e => updateStatus(task.id, e.target.value)}
                          style={{
                            padding: '7px 10px', borderRadius: '8px', border: `1px solid ${t.border}`,
                            background: t.inputBg, color: t.text, fontSize: '12px', cursor: 'pointer',
                            outline: 'none', fontFamily: "'DM Sans', sans-serif"
                          }}>
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>

                        {/* Delete — ADMIN ONLY */}
                        {isAdmin && (
                          <button className="synq-del-btn" onClick={() => deleteTask(task.id)}
                            style={{
                              padding: '7px 14px', background: 'rgba(239,68,68,0.1)', color: '#f87171',
                              border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', cursor: 'pointer',
                              fontSize: '12px', fontWeight: '600', transition: 'all 0.18s',
                              fontFamily: "'DM Sans', sans-serif"
                            }}>
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}