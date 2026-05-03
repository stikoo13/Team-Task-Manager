import { useEffect, useState } from 'react';
import axios from '../api/axios';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';

const STATUS_COLORS = {
  active:    { label:'Active',    color:'#34d399', bg:'rgba(52,211,153,0.1)'  },
  pending:   { label:'Pending',   color:'#f59e0b', bg:'rgba(245,158,11,0.1)'  },
  completed: { label:'Completed', color:'#60a5fa', bg:'rgba(96,165,250,0.1)'  },
  on_hold:   { label:'On Hold',   color:'#94a3b8', bg:'rgba(148,163,184,0.1)' },
};
const GRAD = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#f59e0b,#f97316)',
  'linear-gradient(135deg,#10b981,#34d399)',
  'linear-gradient(135deg,#ef4444,#f43f5e)',
  'linear-gradient(135deg,#3b82f6,#6366f1)',
  'linear-gradient(135deg,#ec4899,#a855f7)',
];

export default function ClientDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(null);
  const { dark } = useTheme();
  const t = dark ? D : L;
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const id = 'synq-client-style';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes cardIn  { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes statPop { from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .cl-card { animation:cardIn 0.45s ease forwards; transition:transform 0.2s,box-shadow 0.2s !important; }
        .cl-card:hover { transform:translateY(-4px) !important; box-shadow:0 16px 40px rgba(0,0,0,0.15) !important; }
        .cl-stat { animation:statPop 0.3s ease forwards; }
        .cl-xbtn:hover { background:rgba(99,102,241,0.12) !important; }
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.3);border-radius:4px}
      `;
      document.head.appendChild(s);
    }
    axios.get('/projects')
      .then(r => { setProjects(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const totalT = projects.reduce((a,p) => a+(p.Tasks?.length||0), 0);
  const doneT  = projects.reduce((a,p) => a+(p.Tasks?.filter(t=>t.status==='done').length||0), 0);

  const stats = [
    { label:'Assigned Projects', value: projects.length, color:'#6366f1', icon:'⬡' },
    { label:'Active',            value: projects.filter(p=>p.status==='active').length,    color:'#34d399', icon:'◉' },
    { label:'Completed',         value: projects.filter(p=>p.status==='completed').length, color:'#60a5fa', icon:'◎' },
    { label:'Tasks Done',        value: totalT>0?`${doneT}/${totalT}`:'—',                 color:'#f59e0b', icon:'◈' },
  ];

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:t.bg, fontFamily:"'DM Sans',sans-serif", transition:'background 0.3s' }}>
      <Sidebar active="client" />
      <main style={{ flex:1, padding:'40px 48px', overflowY:'auto' }}>

        {/* Header */}
        <div style={{ marginBottom:'32px' }}>
          <p style={{ fontSize:'12px', fontWeight:'600', color:'#34d399', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'6px' }}>Client Portal</p>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'32px', fontWeight:'700', color:t.text, margin:'0 0 6px', letterSpacing:'-0.5px' }}>
            {greeting}, {user.name?.split(' ')[0]||'there'} 👋
          </h1>
          <p style={{ color:t.textSec, fontSize:'14px', margin:0 }}>
            Live overview of your assigned projects and their current progress.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'36px' }}>
          {stats.map((s,i) => (
            <div key={s.label} className="cl-stat" style={{ background:t.cardBg, borderRadius:'14px', padding:'20px 22px', border:`1px solid ${t.border}`, animationDelay:`${i*0.07}s` }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                <span style={{ fontSize:'20px', color:s.color }}>{s.icon}</span>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:s.color, boxShadow:`0 0 8px ${s.color}` }} />
              </div>
              <div style={{ fontSize:'28px', fontWeight:'700', fontFamily:"'Syne',sans-serif", color:s.color, marginBottom:'4px' }}>{s.value}</div>
              <div style={{ fontSize:'11px', color:t.textSec, fontWeight:'500', textTransform:'uppercase', letterSpacing:'0.5px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Section header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'18px', fontWeight:'700', color:t.text, margin:0 }}>Your Projects</h2>
          <span style={{ fontSize:'12px', color:t.textSec }}>{projects.length} project{projects.length!==1?'s':''}</span>
        </div>

        {/* States */}
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'200px', gap:'12px' }}>
            <div style={{ width:'20px', height:'20px', border:'2px solid #6366f1', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            <span style={{ color:t.textSec, fontSize:'14px' }}>Loading your projects…</span>
          </div>
        ) : projects.length === 0 ? (
          <div style={{ background:t.cardBg, borderRadius:'16px', border:`1px solid ${t.border}`, padding:'64px', textAlign:'center' }}>
            <div style={{ fontSize:'48px', opacity:0.3, marginBottom:'16px' }}>⬡</div>
            <p style={{ color:t.textSec, fontSize:'15px', margin:'0 0 6px' }}>No projects assigned yet.</p>
            <p style={{ color:t.textSec, fontSize:'13px', margin:0, opacity:0.6 }}>Your project manager will add you soon.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:'20px' }}>
            {projects.map((p, i) => {
              const sc      = STATUS_COLORS[p.status] || STATUS_COLORS.pending;
              const total   = p.Tasks?.length || 0;
              const done    = p.Tasks?.filter(t => t.status==='done').length || 0;
              const pct     = total > 0 ? Math.round((done/total)*100) : 0;
              const isOver  = p.endDate && new Date(p.endDate) < new Date() && p.status !== 'completed';
              const isOpen  = expanded === p.id;
              const daysLeft = p.endDate ? Math.ceil((new Date(p.endDate)-new Date())/(1000*60*60*24)) : null;

              return (
                <div key={p.id} className="cl-card" style={{
                  background:t.cardBg, borderRadius:'18px', border:`1px solid ${t.border}`,
                  overflow:'hidden', animationDelay:`${i*0.08}s`,
                  boxShadow: dark?'0 4px 20px rgba(0,0,0,0.3)':'0 2px 10px rgba(0,0,0,0.05)'
                }}>
                  {/* Accent bar */}
                  <div style={{ height:'5px', background:GRAD[i%GRAD.length] }} />

                  <div style={{ padding:'22px 24px' }}>
                    {/* Top row */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
                      <div style={{ width:'46px', height:'46px', borderRadius:'13px', background:GRAD[i%GRAD.length], display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'22px', boxShadow:'0 4px 14px rgba(0,0,0,0.15)', flexShrink:0 }}>
                        {p.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'5px' }}>
                        <span style={{ padding:'4px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:'600', background:sc.bg, color:sc.color }}>{sc.label}</span>
                        {isOver && <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'10px', fontWeight:'600', background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)' }}>⚠ Overdue</span>}
                        {!isOver && daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 && (
                          <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'10px', fontWeight:'600', background:'rgba(245,158,11,0.1)', color:'#f59e0b', border:'1px solid rgba(245,158,11,0.2)' }}>⏱ {daysLeft}d left</span>
                        )}
                      </div>
                    </div>

                    <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:'16px', fontWeight:'700', color:t.text, margin:'0 0 8px', letterSpacing:'-0.2px' }}>{p.name}</h3>
                    {p.description && (
                      <p style={{ fontSize:'13px', color:t.textSec, margin:'0 0 18px', lineHeight:1.6 }}>
                        {p.description.length > 110 ? p.description.slice(0,110)+'…' : p.description}
                      </p>
                    )}

                    {/* Progress */}
                    <div style={{ marginBottom:'18px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                        <span style={{ fontSize:'12px', color:t.textSec, fontWeight:'500' }}>Task Progress</span>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                          <span style={{ fontSize:'11px', color:t.textSec }}>{done}/{total} tasks</span>
                          <span style={{ fontSize:'14px', fontWeight:'700', color: pct===100?'#34d399':'#6366f1' }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ height:'8px', background:t.border, borderRadius:'10px', overflow:'hidden' }}>
                        <div style={{
                          height:'100%', borderRadius:'10px', width:`${pct}%`,
                          background: pct===100?'linear-gradient(90deg,#10b981,#34d399)':pct>60?'linear-gradient(90deg,#3b82f6,#6366f1)':'linear-gradient(90deg,#6366f1,#8b5cf6)',
                          transition:'width 1s ease', boxShadow: pct>0?'0 2px 8px rgba(99,102,241,0.25)':'none'
                        }} />
                      </div>
                    </div>

                    {/* Dates */}
                    {(p.startDate || p.endDate) && (
                      <div style={{ display:'flex', gap:'20px', paddingTop:'14px', borderTop:`1px solid ${t.border}`, marginBottom:'16px' }}>
                        {p.startDate && (
                          <div>
                            <div style={{ fontSize:'10px', color:t.textSec, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'2px' }}>Start</div>
                            <div style={{ fontSize:'12px', color:t.text, fontWeight:'500' }}>{new Date(p.startDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
                          </div>
                        )}
                        {p.endDate && (
                          <div>
                            <div style={{ fontSize:'10px', color:t.textSec, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'2px' }}>Deadline</div>
                            <div style={{ fontSize:'12px', fontWeight:'600', color: isOver?'#f87171':t.text }}>{new Date(p.endDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Team section */}
                    {p.members?.length > 0 && (
                      <div>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                          <span style={{ fontSize:'11px', fontWeight:'600', color:t.textSec, textTransform:'uppercase', letterSpacing:'0.5px' }}>
                            Your Team ({p.members.length})
                          </span>
                          <button className="cl-xbtn" onClick={() => setExpanded(isOpen?null:p.id)}
                            style={{ background:'none', border:'none', cursor:'pointer', fontSize:'11px', color:'#6366f1', fontWeight:'600', fontFamily:"'DM Sans',sans-serif", padding:'3px 8px', borderRadius:'6px', transition:'background 0.15s' }}>
                            {isOpen ? 'Hide ↑' : 'View all ↓'}
                          </button>
                        </div>

                        {/* Avatar stack */}
                        {!isOpen && (
                          <div style={{ display:'flex', alignItems:'center' }}>
                            {p.members.slice(0,6).map((m,mi) => (
                              <div key={m.id} title={`${m.name} (${m.role})`}
                                style={{
                                  width:'32px', height:'32px', borderRadius:'50%',
                                  background:`hsl(${m.name?.charCodeAt(0)*13%360},65%,50%)`,
                                  border:`2px solid ${t.cardBg}`,
                                  display:'flex', alignItems:'center', justifyContent:'center',
                                  color:'white', fontSize:'12px', fontWeight:'700',
                                  marginLeft: mi>0?'-8px':'0', zIndex:10-mi, position:'relative', flexShrink:0
                                }}>
                                {m.name?.charAt(0)?.toUpperCase()}
                              </div>
                            ))}
                            {p.members.length > 6 && (
                              <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:t.border, border:`2px solid ${t.cardBg}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'700', color:t.textSec, marginLeft:'-8px' }}>
                                +{p.members.length-6}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Expanded list */}
                        {isOpen && (
                          <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                            {p.members.map(m => (
                              <div key={m.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 12px', borderRadius:'10px', background:t.inputBg, border:`1px solid ${t.border}` }}>
                                <div style={{ width:'32px', height:'32px', borderRadius:'50%', flexShrink:0, background:`hsl(${m.name?.charCodeAt(0)*13%360},65%,50%)`, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'12px', fontWeight:'700' }}>
                                  {m.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div style={{ flex:1, minWidth:0 }}>
                                  <div style={{ fontSize:'13px', fontWeight:'600', color:t.text }}>{m.name}</div>
                                  <div style={{ fontSize:'11px', color:t.textSec, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m.email}</div>
                                </div>
                                <span style={{ padding:'2px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:'600', flexShrink:0, background: m.role==='admin'?'rgba(167,139,250,0.15)':'rgba(96,165,250,0.15)', color: m.role==='admin'?'#a78bfa':'#60a5fa' }}>{m.role}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

const L = { bg:'#f8fafc', cardBg:'#ffffff', inputBg:'#f1f5f9', text:'#0f172a', textSec:'#64748b', border:'#e2e8f0' };
const D = { bg:'#070714', cardBg:'#0e0e1c', inputBg:'#13132a', text:'#e2e8f0', textSec:'#475569', border:'rgba(255,255,255,0.07)' };