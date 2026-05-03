import { useEffect, useState } from 'react';
import axios from '../api/axios';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';

const STATUS_OPTIONS = [
  { value: 'active',    label: 'Active'    },
  { value: 'pending',   label: 'Pending'   },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold',   label: 'On Hold'   },
];
const STATUS_COLORS = {
  active:    { label: 'Active',    color: '#34d399', bg: 'rgba(52,211,153,0.1)'  },
  pending:   { label: 'Pending',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  completed: { label: 'Completed', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)'  },
  on_hold:   { label: 'On Hold',   color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
};
const GRAD = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#f59e0b,#f97316)',
  'linear-gradient(135deg,#10b981,#34d399)',
  'linear-gradient(135deg,#ef4444,#f43f5e)',
  'linear-gradient(135deg,#3b82f6,#6366f1)',
  'linear-gradient(135deg,#ec4899,#a855f7)',
];
const EMPTY = { name:'', description:'', memberIds:[], clientIds:[], status:'active', startDate:'', endDate:'' };

const L = { bg:'#f8fafc', cardBg:'#ffffff', inputBg:'#f8fafc', text:'#0f172a', textSec:'#64748b', border:'#e2e8f0' };
const D = { bg:'#070714', cardBg:'#0e0e1c', inputBg:'#13132a', text:'#e2e8f0', textSec:'#475569', border:'rgba(255,255,255,0.07)' };

const UserPicker = ({ list, selected, onToggle, empty, accentColor = '#6366f1', accentBg = 'rgba(99,102,241,0.1)', t }) => (
  <div style={{ maxHeight:'158px', overflowY:'auto', border:`1px solid ${t.border}`, borderRadius:'10px', background:t.inputBg, padding:'4px' }}>
    {list.length === 0
      ? <p style={{ color:t.textSec, fontSize:'12px', padding:'12px', margin:0, textAlign:'center' }}>{empty}</p>
      : list.map(u => (
        <label key={u.id} style={{
          display:'flex', alignItems:'center', gap:'10px', padding:'8px 10px', borderRadius:'8px', cursor:'pointer',
          background: selected.includes(u.id) ? accentBg : 'transparent',
          border:`1px solid ${selected.includes(u.id) ? accentColor : 'transparent'}`,
          transition:'all 0.15s'
        }}>
          <input type="checkbox" checked={selected.includes(u.id)} onChange={() => onToggle(u.id)}
            style={{ accentColor, width:'15px', height:'15px', flexShrink:0 }} />
          <div style={{ width:'28px', height:'28px', borderRadius:'50%', flexShrink:0,
            background:`hsl(${u.name?.charCodeAt(0)*13%360},65%,50%)`,
            display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'11px', fontWeight:'700' }}>
            {u.name?.charAt(0)?.toUpperCase()}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:'12px', fontWeight:'600', color:t.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{u.name}</div>
            <div style={{ fontSize:'11px', color:t.textSec }}>{u.email}</div>
          </div>
          <span style={{
            padding:'2px 7px', borderRadius:'20px', fontSize:'10px', fontWeight:'600', flexShrink:0,
            background: u.role==='client' ? 'rgba(52,211,153,0.15)' : u.role==='admin' ? 'rgba(167,139,250,0.15)' : 'rgba(96,165,250,0.15)',
            color:       u.role==='client' ? '#34d399'               : u.role==='admin' ? '#a78bfa'                 : '#60a5fa'
          }}>{u.role}</span>
        </label>
      ))
    }
  </div>
);

// ── AI Task Section ──────────────────────────────────────────
const AITaskSection = ({ tasks, setTasks, t, dark }) => {
  const [newTask, setNewTask] = useState('');
  const update = (i, val) => setTasks(prev => prev.map((tk, idx) => idx === i ? { ...tk, text: val } : tk));
  const remove = (i)       => setTasks(prev => prev.filter((_, idx) => idx !== i));
  const add    = ()        => { if (!newTask.trim()) return; setTasks(prev => [...prev, { id: Date.now(), text: newTask.trim() }]); setNewTask(''); };

  const inp = { background: t.inputBg, border:`1px solid ${t.border}`, borderRadius:'8px', padding:'8px 12px', color:t.text, fontSize:'13px', outline:'none', fontFamily:"'DM Sans',sans-serif", width:'100%', boxSizing:'border-box' };

  return (
    <div style={{ marginTop:'20px', background: dark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.04)', border:`1px solid rgba(99,102,241,0.15)`, borderRadius:'12px', padding:'16px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
        <span style={{ fontSize:'11px', fontWeight:'700', color:'#818cf8', textTransform:'uppercase', letterSpacing:'0.7px' }}>
          ✦ AI Generated Tasks
        </span>
        <span style={{ background:'rgba(99,102,241,0.15)', color:'#818cf8', fontSize:'11px', fontWeight:'700', padding:'2px 10px', borderRadius:'20px' }}>
          {tasks.length}
        </span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'10px' }}>
        {tasks.map((tk, i) => (
          <div key={tk.id} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ minWidth:'22px', height:'22px', borderRadius:'50%', background:'rgba(99,102,241,0.15)', color:'#818cf8', fontSize:'10px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</div>
            <input value={tk.text} onChange={e => update(i, e.target.value)} style={{ ...inp, flex:1 }} />
            <button onClick={() => remove(i)} style={{ background:'rgba(239,68,68,0.1)', border:'none', color:'#f87171', borderRadius:'6px', padding:'6px 10px', cursor:'pointer', fontSize:'12px', flexShrink:0 }}>✕</button>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:'8px' }}>
        <input
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Add a task manually…"
          style={{ ...inp, flex:1 }}
        />
        <button onClick={add} style={{ background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.25)', color:'#818cf8', borderRadius:'8px', padding:'8px 14px', cursor:'pointer', fontSize:'13px', fontWeight:'600', whiteSpace:'nowrap', fontFamily:"'DM Sans',sans-serif" }}>+ Add</button>
      </div>
    </div>
  );
};

// ── FormBody ─────────────────────────────────────────────────
const FormBody = ({ f, setF, ms, setMs, cs, setCs, nonClients, clients, dark, t }) => {
  const [focused, setFocused] = useState('');

  const lbl = { display:'block', fontSize:'11px', fontWeight:'600', color:t.textSec, marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.7px' };

  const flt = (list, q) => list.filter(u =>
    u.name.toLowerCase().includes(q.toLowerCase()) ||
    u.email.toLowerCase().includes(q.toLowerCase())
  );

  const toggle = (field, id) =>
    setF(prev => ({
      ...prev,
      [field]: prev[field].includes(id) ? prev[field].filter(x => x !== id) : [...prev[field], id]
    }));

  const inp = (key, extra = {}) => ({
    width:'100%', padding:'11px 14px', borderRadius:'10px', boxSizing:'border-box',
    border:`1.5px solid ${focused === key ? '#6366f1' : t.border}`,
    background:t.inputBg, color:t.text, fontSize:'14px', outline:'none',
    transition:'all 0.2s', fontFamily:"'DM Sans',sans-serif", ...extra
  });

  return (
    <>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }}>
        {[{k:'name',label:'Project Name',ph:'e.g. Website Redesign'},{k:'description',label:'Description',ph:'Brief project description'}].map(fd => (
          <div key={fd.k}>
            <label style={lbl}>{fd.label}</label>
            <input
              placeholder={fd.ph}
              value={f[fd.k]}
              onFocus={() => setFocused(fd.k)}
              onBlur={() => setFocused('')}
              onChange={e => setF({...f, [fd.k]: e.target.value})}
              style={inp(fd.k)}
            />
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px', marginBottom:'20px' }}>
        <div>
          <label style={lbl}>Status</label>
          <select value={f.status} onChange={e => setF({...f, status:e.target.value})}
            onFocus={() => setFocused('status')} onBlur={() => setFocused('')}
            style={inp('status')}>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        {[{k:'startDate',label:'Start Date'},{k:'endDate',label:'Deadline'}].map(fd => (
          <div key={fd.k}>
            <label style={lbl}>{fd.label}</label>
            <input type="date" value={f[fd.k]}
              onFocus={() => setFocused(fd.k)} onBlur={() => setFocused('')}
              onChange={e => setF({...f, [fd.k]: e.target.value})}
              style={inp(fd.k, {colorScheme: dark?'dark':'light'})} />
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
        <div>
          <label style={lbl}>Assign Members ({f.memberIds.length} selected)</label>
          <input
            placeholder="Search members..."
            value={ms}
            onChange={e => setMs(e.target.value)}
            onFocus={() => setFocused('ms')}
            onBlur={() => setFocused('')}
            style={{...inp('ms'), marginBottom:'8px'}}
          />
          <UserPicker
            list={flt(nonClients, ms)}
            selected={f.memberIds}
            onToggle={id => toggle('memberIds', id)}
            empty="No members found"
            t={t}
          />
        </div>
        <div>
          <label style={lbl}><span style={{color:'#34d399'}}>◉ </span>Assign Clients ({f.clientIds.length} selected)</label>
          <input
            placeholder="Search clients..."
            value={cs}
            onChange={e => setCs(e.target.value)}
            onFocus={() => setFocused('cs')}
            onBlur={() => setFocused('')}
            style={{...inp('cs'), marginBottom:'8px'}}
          />
          <UserPicker
            list={flt(clients, cs)}
            selected={f.clientIds}
            onToggle={id => toggle('clientIds', id)}
            empty="No clients found"
            accentColor="#34d399"
            accentBg="rgba(52,211,153,0.1)"
            t={t}
          />
        </div>
      </div>
    </>
  );
};

export default function Projects() {
  const [projects, setProjects]   = useState([]);
  const [allUsers, setAllUsers]   = useState([]);
  const [form, setForm]           = useState(EMPTY);
  const [editForm, setEditForm]   = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError]         = useState('');
  const [editError, setEditError] = useState('');
  const [mSearch, setMSearch]     = useState('');
  const [cSearch, setCSearch]     = useState('');
  const [emSearch, setEmSearch]   = useState('');
  const [ecSearch, setEcSearch]   = useState('');
  const [expanded, setExpanded]   = useState(null);

  // ── AI state ──
  const [aiTasks, setAiTasks]       = useState([]);
  const [aiLoading, setAiLoading]   = useState(false);
  const [aiError, setAiError]       = useState('');

  const { dark } = useTheme();
  const t = dark ? D : L;
  const user    = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  const nonClients = allUsers.filter(u => u.role !== 'client');
  const clients    = allUsers.filter(u => u.role === 'client');

  useEffect(() => {
    const id = 'synq-proj-style';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes cardIn  { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .sp-card { animation:cardIn 0.4s ease forwards; transition:box-shadow 0.2s,transform 0.2s !important; }
        .sp-card:hover { transform:translateY(-3px) !important; }
        .sp-modal { animation:modalIn 0.2s ease forwards; }
        .sp-del:hover  { background:rgba(239,68,68,0.22)  !important; }
        .sp-edit:hover { background:rgba(99,102,241,0.22) !important; }
        .sp-spinner { width:13px;height:13px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block; }
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.3);border-radius:4px}
      `;
      document.head.appendChild(s);
    }
    fetchProjects();
    if (isAdmin) fetchAllUsers();
  }, [isAdmin]);

  const fetchProjects = () => axios.get('/projects').then(r => setProjects(r.data)).catch(() => {});
  const fetchAllUsers = () => axios.get('/auth/users').then(r => setAllUsers(r.data)).catch(() => {});

  // ── Generate AI tasks ──
  const generateTasks = async () => {
    if (!form.name || !form.description) {
      setAiError('Enter both project name and description first.');
      return;
    }
    setAiError('');
    setAiLoading(true);
    try {
      const { data } = await axios.post('/ai/generate-tasks', { name: form.name, description: form.description });
      setAiTasks(data.tasks.map((text, i) => ({ id: Date.now() + i, text })));
    } catch {
      setAiError('AI generation failed. Check your API key or try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const createProject = async () => {
    if (!form.name) return setError('Project name is required');
    try {
      await axios.post('/projects', { ...form, tasks: aiTasks.map(t => t.text) });
      setForm(EMPTY); setMSearch(''); setCSearch('');
      setAiTasks([]); setAiError(''); setError('');
      fetchProjects();
    } catch (err) { setError(err.response?.data?.message || 'Failed to create project'); }
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setEditForm({
      name:        p.name        || '',
      description: p.description || '',
      status:      p.status      || 'active',
      startDate:   p.startDate   ? p.startDate.slice(0,10) : '',
      endDate:     p.endDate     ? p.endDate.slice(0,10)   : '',
      memberIds:   (p.members || []).filter(m => m.role !== 'admin').map(m => m.id),
      clientIds:   (p.clients  || []).map(c => c.id),
    });
    setEditError('');
  };

  const saveEdit = async () => {
    if (!editForm.name) return setEditError('Name is required');
    try {
      await axios.put(`/projects/${editingId}`, editForm);
      setEditingId(null);
      fetchProjects();
    } catch (err) { setEditError(err.response?.data?.message || 'Failed to update'); }
  };

  const deleteProject = async (id) => {
    try { await axios.delete(`/projects/${id}`); fetchProjects(); } catch {}
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:t.bg, fontFamily:"'DM Sans',sans-serif", transition:'background 0.3s' }}>
      <Sidebar active="projects" />
      <main style={{ flex:1, padding:'40px 48px', overflowY:'auto' }}>

        <div style={{ marginBottom:'36px' }}>
          <p style={{ fontSize:'12px', fontWeight:'600', color:'#6366f1', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'6px' }}>Workspace</p>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'32px', fontWeight:'700', color:t.text, margin:'0 0 6px', letterSpacing:'-0.5px' }}>Projects</h1>
          <p style={{ color:t.textSec, fontSize:'14px', margin:0 }}>
            {isAdmin ? `${projects.length} project${projects.length!==1?'s':''} in your workspace` : 'Projects assigned to you'}
          </p>
        </div>

        {isAdmin && (
          <div style={{ background:t.cardBg, borderRadius:'16px', padding:'28px', border:`1px solid ${t.border}`, marginBottom:'32px', boxShadow: dark?'0 4px 24px rgba(0,0,0,0.3)':'0 2px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'16px', fontWeight:'700', color:t.text, margin:'0 0 20px' }}>Create New Project</h2>
            {error && (
              <div style={{ background:dark?'rgba(239,68,68,0.1)':'#fef2f2', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', padding:'10px 14px', color:'#f87171', fontSize:'13px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px' }}>
                ⚠ {error}
              </div>
            )}

            <FormBody
              f={form} setF={setForm}
              ms={mSearch} setMs={setMSearch}
              cs={cSearch} setCs={setCSearch}
              nonClients={nonClients} clients={clients}
              dark={dark} t={t}
            />

            {/* ── AI Generate Button ── */}
            {aiError && (
              <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'8px', padding:'8px 12px', color:'#f87171', fontSize:'12px', marginTop:'16px' }}>
                ⚠ {aiError}
              </div>
            )}
            <button
              onClick={generateTasks}
              disabled={aiLoading}
              style={{
                marginTop:'16px', width:'100%', padding:'11px 20px',
                background: aiLoading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color:'white', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:'600',
                cursor: aiLoading ? 'not-allowed' : 'pointer',
                fontFamily:"'DM Sans',sans-serif",
                boxShadow:'0 4px 14px rgba(99,102,241,0.3)',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                transition:'all 0.2s',
              }}
            >
              {aiLoading
                ? <><span className="sp-spinner" /> Generating tasks…</>
                : <>✦ Generate Tasks with AI</>
              }
            </button>

            {/* ── AI Task List ── */}
            {aiTasks.length > 0 && (
              <AITaskSection tasks={aiTasks} setTasks={setAiTasks} t={t} dark={dark} />
            )}

            <button onClick={createProject} style={{ marginTop:'16px', padding:'11px 28px', background:'linear-gradient(135deg,#10b981,#34d399)', color:'white', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:'600', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 4px 14px rgba(16,185,129,0.35)', transition:'all 0.2s' }}>
              + Create Project
            </button>
          </div>
        )}

        {projects.length === 0 ? (
          <div style={{ background:t.cardBg, borderRadius:'16px', padding:'64px', border:`1px solid ${t.border}`, textAlign:'center' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px', opacity:0.3 }}>⬡</div>
            <p style={{ color:t.textSec, fontSize:'15px', margin:0 }}>
              {isAdmin ? 'No projects yet. Create your first one above.' : 'No projects assigned to you yet.'}
            </p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'18px' }}>
            {projects.map((p, i) => {
              const sc       = STATUS_COLORS[p.status] || STATUS_COLORS.pending;
              const total    = p.Tasks?.length || 0;
              const done     = p.Tasks?.filter(tk => tk.status === 'done').length || 0;
              const progress = total > 0 ? Math.round((done/total)*100) : 0;
              const isOver   = p.endDate && new Date(p.endDate) < new Date();
              return (
                <div key={p.id} className="sp-card" style={{ background:t.cardBg, borderRadius:'16px', padding:'24px', border:`1px solid ${t.border}`, animationDelay:`${i*0.06}s`, boxShadow:dark?'0 4px 24px rgba(0,0,0,0.3)':'0 2px 12px rgba(0,0,0,0.05)' }}>
                  <div style={{ height:'4px', borderRadius:'4px', marginBottom:'18px', background:GRAD[i%GRAD.length] }} />
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'14px' }}>
                    <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:GRAD[i%GRAD.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', color:'white', boxShadow:'0 4px 12px rgba(0,0,0,0.2)' }}>⬡</div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'5px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600', background:sc.bg, color:sc.color }}>{sc.label}</span>
                      {isOver && p.status !== 'completed' && (
                        <span style={{ padding:'2px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:'600', background:'rgba(239,68,68,0.1)', color:'#f87171' }}>⚠ Overdue</span>
                      )}
                    </div>
                  </div>
                  <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:'15px', fontWeight:'700', color:t.text, margin:'0 0 6px' }}>{p.name}</h3>
                  <p style={{ color:t.textSec, fontSize:'13px', margin:'0 0 14px', lineHeight:1.5 }}>{p.description || 'No description.'}</p>

                  <div style={{ marginBottom:'14px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                      <span style={{ fontSize:'11px', color:t.textSec }}>Progress</span>
                      <span style={{ fontSize:'11px', fontWeight:'600', color: progress===100?'#34d399':t.textSec }}>{done}/{total} · {progress}%</span>
                    </div>
                    <div style={{ height:'5px', background:t.border, borderRadius:'10px', overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:'10px', width:`${progress}%`, background: progress===100?'linear-gradient(90deg,#10b981,#34d399)':'linear-gradient(90deg,#6366f1,#8b5cf6)', transition:'width 0.8s ease' }} />
                    </div>
                  </div>

                  {p.members?.length > 0 && (
                    <div style={{ marginBottom:'10px' }}>
                      <p style={{ fontSize:'10px', fontWeight:'600', color:t.textSec, textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:'6px' }}>Members ({p.members.length})</p>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                        {p.members.slice(0,3).map(m => (
                          <div key={m.id} title={m.name} style={{ display:'flex', alignItems:'center', gap:'5px', padding:'3px 8px', borderRadius:'20px', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)' }}>
                            <div style={{ width:'18px', height:'18px', borderRadius:'50%', background:`hsl(${m.name?.charCodeAt(0)*13%360},65%,50%)`, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'9px', fontWeight:'700' }}>{m.name?.charAt(0)?.toUpperCase()}</div>
                            <span style={{ fontSize:'11px', fontWeight:'600', color:'#818cf8' }}>{m.name}</span>
                          </div>
                        ))}
                        {p.members.length > 3 && <div style={{ padding:'3px 8px', borderRadius:'20px', fontSize:'11px', fontWeight:'600', background:'rgba(99,102,241,0.1)', color:'#818cf8', border:'1px solid rgba(99,102,241,0.2)' }}>+{p.members.length-3}</div>}
                      </div>
                    </div>
                  )}

                  {isAdmin && p.clients?.length > 0 && (
                    <div style={{ marginBottom:'10px' }}>
                      <p style={{ fontSize:'10px', fontWeight:'600', color:'#34d399', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:'6px' }}>Clients ({p.clients.length})</p>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                        {p.clients.slice(0,3).map(c => (
                          <div key={c.id} title={c.name} style={{ display:'flex', alignItems:'center', gap:'5px', padding:'3px 8px', borderRadius:'20px', background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.2)' }}>
                            <div style={{ width:'18px', height:'18px', borderRadius:'50%', background:'linear-gradient(135deg,#10b981,#34d399)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'9px', fontWeight:'700' }}>{c.name?.charAt(0)?.toUpperCase()}</div>
                            <span style={{ fontSize:'11px', fontWeight:'600', color:'#34d399' }}>{c.name}</span>
                          </div>
                        ))}
                        {p.clients.length > 3 && <div style={{ padding:'3px 8px', borderRadius:'20px', fontSize:'11px', fontWeight:'600', background:'rgba(52,211,153,0.1)', color:'#34d399', border:'1px solid rgba(52,211,153,0.2)' }}>+{p.clients.length-3}</div>}
                      </div>
                    </div>
                  )}

                  {(p.startDate || p.endDate) && (
                    <div style={{ display:'flex', gap:'16px', paddingTop:'12px', borderTop:`1px solid ${t.border}`, marginBottom:'10px' }}>
                      {p.startDate && <div><div style={{ fontSize:'9px', color:t.textSec, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'1px' }}>Start</div><div style={{ fontSize:'11px', color:t.text, fontWeight:'500' }}>{new Date(p.startDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div></div>}
                      {p.endDate   && <div><div style={{ fontSize:'9px', color:t.textSec, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'1px' }}>Deadline</div><div style={{ fontSize:'11px', fontWeight:'600', color: isOver&&p.status!=='completed'?'#f87171':t.text }}>{new Date(p.endDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div></div>}
                    </div>
                  )}

                  {!isAdmin && p.members?.length > 0 && (
                    <button onClick={() => setExpanded(expanded===p.id?null:p.id)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'11px', color:'#6366f1', fontWeight:'600', padding:'0', fontFamily:"'DM Sans',sans-serif", marginBottom:'10px' }}>
                      {expanded===p.id ? 'Hide team ↑' : 'View team ↓'}
                    </button>
                  )}
                  {expanded===p.id && (
                    <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'10px' }}>
                      {p.members.map(m => (
                        <div key={m.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 10px', borderRadius:'8px', background:t.inputBg, border:`1px solid ${t.border}` }}>
                          <div style={{ width:'28px', height:'28px', borderRadius:'50%', flexShrink:0, background:`hsl(${m.name?.charCodeAt(0)*13%360},65%,50%)`, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'11px', fontWeight:'700' }}>{m.name?.charAt(0)?.toUpperCase()}</div>
                          <div><div style={{ fontSize:'12px', fontWeight:'600', color:t.text }}>{m.name}</div><div style={{ fontSize:'11px', color:t.textSec }}>{m.email}</div></div>
                          <span style={{ marginLeft:'auto', padding:'2px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:'600', background:'rgba(96,165,250,0.15)', color:'#60a5fa' }}>{m.role}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {isAdmin && (
                    <div style={{ display:'flex', gap:'8px', marginTop:'10px' }}>
                      <button className="sp-edit" onClick={() => openEdit(p)} style={{ flex:1, padding:'7px 0', background:'rgba(99,102,241,0.1)', color:'#818cf8', border:'1px solid rgba(99,102,241,0.2)', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:'600', transition:'all 0.18s', fontFamily:"'DM Sans',sans-serif" }}>Edit</button>
                      <button className="sp-del"  onClick={() => deleteProject(p.id)} style={{ flex:1, padding:'7px 0', background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:'600', transition:'all 0.18s', fontFamily:"'DM Sans',sans-serif" }}>Delete</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {editingId && (
          <div
            onClick={e => { if(e.target===e.currentTarget) setEditingId(null); }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(5px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
            <div className="sp-modal" style={{ background:t.cardBg, borderRadius:'20px', padding:'32px', width:'100%', maxWidth:'780px', maxHeight:'90vh', overflowY:'auto', border:`1px solid ${t.border}`, boxShadow:'0 24px 80px rgba(0,0,0,0.45)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
                <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'18px', fontWeight:'700', color:t.text, margin:0 }}>Edit Project</h2>
                <button onClick={() => setEditingId(null)} style={{ background:'none', border:'none', color:t.textSec, cursor:'pointer', fontSize:'20px', padding:'4px 8px', borderRadius:'8px' }}>✕</button>
              </div>
              {editError && (
                <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', padding:'10px 14px', color:'#f87171', fontSize:'13px', marginBottom:'16px' }}>⚠ {editError}</div>
              )}
              <FormBody
                f={editForm} setF={setEditForm}
                ms={emSearch} setMs={setEmSearch}
                cs={ecSearch} setCs={setEcSearch}
                nonClients={nonClients} clients={clients}
                dark={dark} t={t}
              />
              <div style={{ display:'flex', gap:'12px', marginTop:'24px' }}>
                <button onClick={saveEdit} style={{ flex:1, padding:'12px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:'600', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 4px 14px rgba(99,102,241,0.35)' }}>Save Changes</button>
                <button onClick={() => setEditingId(null)} style={{ padding:'12px 24px', background:t.inputBg, color:t.textSec, border:`1px solid ${t.border}`, borderRadius:'10px', fontSize:'14px', fontWeight:'600', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}