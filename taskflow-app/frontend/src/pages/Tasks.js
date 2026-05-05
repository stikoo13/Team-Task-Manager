// frontend/src/pages/Tasks.js
import { useEffect, useState, useCallback } from 'react';
import axios from '../api/axios';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';

const STATUS_CONFIG = {
  'todo':        { label: 'To Do',       color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  'in-progress': { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  'done':        { label: 'Done',        color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
};
const PRIORITY_CONFIG = {
  low:    { color: '#94a3b8', label: 'Low'    },
  medium: { color: '#f59e0b', label: 'Medium' },
  high:   { color: '#ef4444', label: 'High'   },
};
const EMPTY_TASK = { title: '', description: '', priority: 'medium', dueDate: '', status: 'todo' };
const L = { bg:'#f8fafc', cardBg:'#ffffff', inputBg:'#f1f5f9', text:'#0f172a', textSec:'#64748b', border:'#e2e8f0' };
const D = { bg:'#070714', cardBg:'#0e0e1c', inputBg:'#13132a', text:'#e2e8f0', textSec:'#475569', border:'rgba(255,255,255,0.07)' };

export default function Tasks() {
  const { dark } = useTheme();
  const th = dark ? D : L;
  const user    = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  const [activeTab,       setActiveTab]       = useState('personal');
  const [personalTasks,   setPersonalTasks]   = useState([]);
  const [projectTasks,    setProjectTasks]    = useState([]);
  const [allTasks,        setAllTasks]        = useState([]);
  const [projects,        setProjects]        = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newTask,         setNewTask]         = useState(EMPTY_TASK);
  const [creating,        setCreating]        = useState(false);
  const [loading,         setLoading]         = useState(true);
  const [showForm,        setShowForm]        = useState(false);
  const [error,           setError]           = useState('');

  useEffect(() => {
    const id = 'synq-tasks-style';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes cardIn { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .tk-row:hover { background: rgba(99,102,241,0.05) !important; }
        .tk-tab { transition: all 0.18s !important; }
      `;
      document.head.appendChild(s);
    }
  }, []);

  const fetchPersonalTasks = useCallback(async () => {
    try {
      const { data } = await axios.get('/tasks');
      setPersonalTasks(data.filter(t => !t.ProjectId));
    } catch { setPersonalTasks([]); }
  }, []);

  const fetchAllTasks = useCallback(async () => {
    try {
      const { data } = await axios.get('/tasks');
      setAllTasks(data);
    } catch { setAllTasks([]); }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const { data } = await axios.get('/projects');
      setProjects(data);
    } catch { setProjects([]); }
  }, []);

  const fetchProjectTasks = useCallback(async (projectId) => {
    try {
      const { data } = await axios.get('/tasks?projectId=' + projectId);
      setProjectTasks(data);
    } catch { setProjectTasks([]); }
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetches = isAdmin
      ? [fetchAllTasks(), fetchProjects()]
      : [fetchPersonalTasks(), fetchProjects()];
    Promise.all(fetches).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedProject) fetchProjectTasks(selectedProject.id);
  }, [selectedProject, fetchProjectTasks]);

  const createPersonalTask = async () => {
    if (!newTask.title.trim()) return setError('Task title is required');
    setCreating(true);
    setError('');
    try {
      await axios.post('/tasks', {
        title:       newTask.title.trim(),
        description: newTask.description.trim(),
        priority:    newTask.priority,
        dueDate:     newTask.dueDate || null,
        status:      'todo',
      });
      setNewTask(EMPTY_TASK);
      setShowForm(false);
      fetchPersonalTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (task, newStatus) => {
    try {
      await axios.put('/tasks/' + task.id, { ...task, status: newStatus });
      if (isAdmin) {
        fetchAllTasks();
      } else {
        fetchPersonalTasks();
        if (selectedProject) fetchProjectTasks(selectedProject.id);
      }
    } catch {}
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete('/tasks/' + id);
      if (isAdmin) fetchAllTasks();
      else fetchPersonalTasks();
    } catch {}
  };

  const inp = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1px solid ' + th.border, background: th.inputBg,
    color: th.text, fontSize: '14px', outline: 'none',
    fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box',
  };
  const lbl = {
    display: 'block', fontSize: '11px', fontWeight: '600',
    color: th.textSec, marginBottom: '5px',
    textTransform: 'uppercase', letterSpacing: '0.7px',
  };

  const renderTaskRow = (task, showDelete) => {
    const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG['todo'];
    const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
    const cycle = { 'todo': 'in-progress', 'in-progress': 'done', 'done': 'todo' };
    return (
      <div key={task.id} className="tk-row" style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '13px 18px', borderRadius: '12px',
        border: '1px solid ' + th.border, background: th.cardBg,
        marginBottom: '8px', transition: 'background 0.15s',
        animation: 'cardIn 0.3s ease forwards',
      }}>
        <button
          title="Cycle status"
          onClick={() => updateStatus(task, cycle[task.status])}
          style={{
            width: '20px', height: '20px', borderRadius: '50%',
            background: sc.bg, border: '2px solid ' + sc.color,
            cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '14px', fontWeight: '500', color: th.text,
            textDecoration: task.status === 'done' ? 'line-through' : 'none',
            opacity: task.status === 'done' ? 0.6 : 1,
          }}>{task.title}</div>
          {task.description && (
            <div style={{ fontSize: '12px', color: th.textSec, marginTop: '2px' }}>
              {task.description}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{
            padding: '2px 9px', borderRadius: '20px', fontSize: '10px',
            fontWeight: '600', background: pc.color + '20', color: pc.color,
          }}>{pc.label}</span>
          <span style={{
            padding: '2px 9px', borderRadius: '20px', fontSize: '10px',
            fontWeight: '600', background: sc.bg, color: sc.color,
          }}>{sc.label}</span>
          {task.dueDate && (
            <span style={{ fontSize: '11px', color: th.textSec }}>
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {showDelete && (
            <button onClick={() => deleteTask(task.id)} style={{
              background: 'rgba(239,68,68,0.1)', border: 'none',
              color: '#f87171', borderRadius: '6px', padding: '4px 9px',
              cursor: 'pointer', fontSize: '12px',
            }}>✕</button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: th.bg, fontFamily: "'DM Sans',sans-serif" }}>
      <Sidebar active="tasks" />
      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>

        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>
            {isAdmin ? 'All Tasks' : 'My Workspace'}
          </p>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: '32px', fontWeight: '700', color: th.text, margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            {isAdmin ? 'Tasks' : 'My Tasks'}
          </h1>
          <p style={{ color: th.textSec, fontSize: '14px', margin: 0 }}>
            {isAdmin ? 'All tasks across all projects.' : 'Manage your personal tasks and view your project assignments.'}
          </p>
        </div>

        {!isAdmin && (
          <div style={{
            display: 'flex', gap: '4px', marginBottom: '28px',
            background: th.cardBg, padding: '4px', borderRadius: '12px',
            border: '1px solid ' + th.border, width: 'fit-content',
          }}>
            {[
              { id: 'personal', label: '✎ Personal Tasks' },
              { id: 'project',  label: '⬡ Project Tasks'  },
            ].map(tab => (
              <button key={tab.id} className="tk-tab" onClick={() => setActiveTab(tab.id)} style={{
                padding: '8px 20px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                fontFamily: "'DM Sans',sans-serif", fontSize: '13px', fontWeight: '600',
                background:  activeTab === tab.id ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
                color:       activeTab === tab.id ? 'white' : th.textSec,
                boxShadow:   activeTab === tab.id ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
              }}>
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '48px', color: th.textSec }}>
            <div style={{ width: '18px', height: '18px', border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Loading…
          </div>

        ) : isAdmin ? (
          /* ── ADMIN VIEW ── */
          <div>
            {allTasks.length === 0 ? (
              <div style={{ background: th.cardBg, borderRadius: '16px', padding: '64px', border: '1px solid ' + th.border, textAlign: 'center' }}>
                <div style={{ fontSize: '40px', opacity: 0.3, marginBottom: '12px' }}>◈</div>
                <p style={{ color: th.textSec, fontSize: '15px', margin: 0 }}>No project tasks yet.</p>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '12px', fontSize: '12px', fontWeight: '600', color: th.textSec, textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                  {allTasks.length} task{allTasks.length !== 1 ? 's' : ''} across all projects
                </div>
                {allTasks.map(t => renderTaskRow(t, true))}
              </div>
            )}
          </div>

        ) : activeTab === 'personal' ? (
          /* ── PERSONAL TASKS TAB ── */
          <div>
            <div style={{ marginBottom: '20px' }}>
              {!showForm ? (
                <button onClick={() => setShowForm(true)} style={{
                  padding: '10px 22px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  color: 'white', border: 'none', borderRadius: '10px',
                  fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                  fontFamily: "'DM Sans',sans-serif", boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                }}>
                  + Create Personal Task
                </button>
              ) : (
                <div style={{ background: th.cardBg, border: '1px solid ' + th.border, borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                  <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: '15px', fontWeight: '700', color: th.text, margin: '0 0 16px' }}>
                    New Personal Task
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: '#818cf8' }}>
                      🔒 This task is <strong>private</strong> — only visible to you.
                    </div>
                    {error && (
                      <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '8px 12px', color: '#f87171', fontSize: '13px' }}>
                        ⚠ {error}
                      </div>
                    )}
                    <div>
                      <label style={lbl}>Task Title *</label>
                      <input
                        placeholder="What needs to be done?"
                        value={newTask.title}
                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && createPersonalTask()}
                        style={inp}
                      />
                    </div>
                    <div>
                      <label style={lbl}>Description</label>
                      <input
                        placeholder="Optional details…"
                        value={newTask.description}
                        onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                        style={inp}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={lbl}>Priority</label>
                        <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })} style={inp}>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label style={lbl}>Due Date</label>
                        <input
                          type="date"
                          value={newTask.dueDate}
                          onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                          style={{ ...inp, colorScheme: dark ? 'dark' : 'light' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={createPersonalTask} disabled={creating} style={{
                        padding: '10px 22px',
                        background: creating ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        color: 'white', border: 'none', borderRadius: '10px',
                        fontSize: '14px', fontWeight: '600',
                        cursor: creating ? 'not-allowed' : 'pointer',
                        fontFamily: "'DM Sans',sans-serif",
                      }}>
                        {creating ? 'Creating…' : 'Create Task'}
                      </button>
                      <button onClick={() => { setShowForm(false); setError(''); setNewTask(EMPTY_TASK); }} style={{
                        padding: '10px 18px', background: th.inputBg, color: th.textSec,
                        border: '1px solid ' + th.border, borderRadius: '10px',
                        fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                        fontFamily: "'DM Sans',sans-serif",
                      }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {personalTasks.length === 0 ? (
              <div style={{ background: th.cardBg, borderRadius: '16px', padding: '48px', border: '1px solid ' + th.border, textAlign: 'center' }}>
                <div style={{ fontSize: '36px', opacity: 0.3, marginBottom: '12px' }}>✎</div>
                <p style={{ color: th.textSec, fontSize: '14px', margin: '0 0 4px' }}>No personal tasks yet.</p>
                <p style={{ color: th.textSec, fontSize: '12px', margin: 0, opacity: 0.7 }}>Create your first private task above.</p>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '12px', fontSize: '12px', fontWeight: '600', color: th.textSec, textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                  {personalTasks.length} task{personalTasks.length !== 1 ? 's' : ''}
                </div>
                {personalTasks.map(t => renderTaskRow(t, true))}
              </div>
            )}
          </div>

        ) : (
          /* ── PROJECT TASKS TAB ── */
          <div>
            {projects.length === 0 ? (
              <div style={{ background: th.cardBg, borderRadius: '16px', padding: '48px', border: '1px solid ' + th.border, textAlign: 'center' }}>
                <div style={{ fontSize: '36px', opacity: 0.3, marginBottom: '12px' }}>⬡</div>
                <p style={{ color: th.textSec, fontSize: '14px', margin: 0 }}>You are not assigned to any projects yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ width: '240px', flexShrink: 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: th.textSec, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '10px' }}>
                    Your Projects
                  </div>
                  {projects.map(p => (
                    <button key={p.id} onClick={() => setSelectedProject(p)} style={{
                      width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: '10px',
                      border: '1px solid ' + (selectedProject && selectedProject.id === p.id ? '#6366f1' : th.border),
                      background: selectedProject && selectedProject.id === p.id ? 'rgba(99,102,241,0.1)' : th.cardBg,
                      color: selectedProject && selectedProject.id === p.id ? '#818cf8' : th.text,
                      cursor: 'pointer', marginBottom: '6px', fontFamily: "'DM Sans',sans-serif",
                      fontSize: '13px', fontWeight: '500', transition: 'all 0.15s',
                    }}>
                      <div style={{ fontWeight: '600', marginBottom: '2px' }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: th.textSec }}>{p.Tasks ? p.Tasks.length : 0} tasks</div>
                    </button>
                  ))}
                </div>

                <div style={{ flex: 1 }}>
                  {!selectedProject ? (
                    <div style={{ background: th.cardBg, borderRadius: '16px', padding: '48px', border: '1px solid ' + th.border, textAlign: 'center' }}>
                      <div style={{ fontSize: '36px', opacity: 0.3, marginBottom: '12px' }}>←</div>
                      <p style={{ color: th.textSec, fontSize: '14px', margin: 0 }}>Select a project to view your tasks.</p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ marginBottom: '16px' }}>
                        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: '18px', fontWeight: '700', color: th.text, margin: '0 0 2px' }}>
                          {selectedProject.name}
                        </h2>
                        <p style={{ color: th.textSec, fontSize: '13px', margin: 0 }}>Tasks assigned to you in this project</p>
                      </div>
                      {projectTasks.length === 0 ? (
                        <div style={{ background: th.cardBg, borderRadius: '16px', padding: '48px', border: '1px solid ' + th.border, textAlign: 'center' }}>
                          <div style={{ fontSize: '36px', opacity: 0.3, marginBottom: '12px' }}>◈</div>
                          <p style={{ color: th.textSec, fontSize: '14px', margin: 0 }}>No tasks assigned to you in this project yet.</p>
                        </div>
                      ) : (
                        <div>
                          <div style={{ marginBottom: '12px', fontSize: '12px', fontWeight: '600', color: th.textSec, textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                            {projectTasks.length} assigned task{projectTasks.length !== 1 ? 's' : ''}
                          </div>
                          {projectTasks.map(t => renderTaskRow(t, false))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}