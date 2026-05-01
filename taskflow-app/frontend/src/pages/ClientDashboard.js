import { useEffect, useState } from 'react';
import axios from '../api/axios';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';

const STATUS_COLORS = {
  active:    { label: 'Active',     color: '#34d399', bg: 'rgba(52,211,153,0.1)'  },
  pending:   { label: 'Pending',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  completed: { label: 'Completed',  color: '#60a5fa', bg: 'rgba(96,165,250,0.1)'  },
  on_hold:   { label: 'On Hold',    color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
};

export default function ClientDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { dark } = useTheme();
  const t = dark ? D : L;
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const id = 'tf-client-style';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes cardIn3 { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .tf-proj-card { animation: cardIn3 0.45s ease forwards; }
        .tf-proj-card:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 32px rgba(0,0,0,0.15) !important; transition: all 0.2s ease !important; }
      `;
      document.head.appendChild(s);
    }
    axios.get('/projects')
      .then(res => { setProjects(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, fontFamily: "'DM Sans', sans-serif", transition: 'background 0.3s' }}>
      <Sidebar active="client" />

      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '12px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#34d399', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>
            Client Portal
          </p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '32px', fontWeight: '700', color: t.text, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            {greeting}, {user.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p style={{ color: t.textSec, fontSize: '14px', margin: '0 0 36px' }}>
            Here's an overview of your projects and their current status.
          </p>
        </div>

        {/* Summary row */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '36px' }}>
          {[
            { label: 'Your Projects', value: projects.length, color: '#6366f1' },
            { label: 'Active',        value: projects.filter(p => p.status === 'active').length,    color: '#34d399' },
            { label: 'Completed',     value: projects.filter(p => p.status === 'completed').length, color: '#60a5fa' },
          ].map((s, i) => (
            <div key={s.label} style={{
              flex: 1, background: t.cardBg, borderRadius: '14px', padding: '20px 22px',
              border: `1px solid ${t.border}`, animationDelay: `${i * 0.06}s`
            }}>
              <div style={{ fontSize: '26px', fontWeight: '700', fontFamily: "'Syne', sans-serif", color: s.color, marginBottom: '4px' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: t.textSec, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Projects heading */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: '700', color: t.text, margin: 0 }}>Your Projects</h2>
          <span style={{ fontSize: '12px', color: t.textSec }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <div style={{ color: t.textSec, fontSize: '14px' }}>Loading projects…</div>
          </div>
        ) : projects.length === 0 ? (
          <div style={{
            background: t.cardBg, borderRadius: '16px', border: `1px solid ${t.border}`,
            padding: '64px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', opacity: 0.3, marginBottom: '16px' }}>⬡</div>
            <p style={{ color: t.textSec, fontSize: '15px', margin: 0 }}>
              No projects assigned yet. Your project manager will add you soon.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {projects.map((project, i) => {
              const sc = STATUS_COLORS[project.status] || STATUS_COLORS['pending'];
              const totalTasks = project.Tasks?.length || 0;
              const doneTasks  = project.Tasks?.filter(t => t.status === 'done').length || 0;
              const progress   = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

              return (
                <div key={project.id} className="tf-proj-card" style={{
                  background: t.cardBg, borderRadius: '16px', padding: '24px',
                  border: `1px solid ${t.border}`, cursor: 'default',
                  boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.05)',
                  animationDelay: `${i * 0.08}s`
                }}>
                  {/* Project header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '12px',
                      background: `linear-gradient(135deg, #6366f1, #a855f7)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontFamily: "'Syne', sans-serif", fontWeight: '700', fontSize: '18px'
                    }}>
                      {project.name?.charAt(0)?.toUpperCase() || 'P'}
                    </div>
                    <span style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                      background: sc.bg, color: sc.color
                    }}>
                      {sc.label}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: '700', color: t.text, margin: '0 0 6px', letterSpacing: '-0.2px' }}>
                    {project.name}
                  </h3>

                  {project.description && (
                    <p style={{ fontSize: '13px', color: t.textSec, margin: '0 0 18px', lineHeight: 1.6 }}>
                      {project.description.length > 100 ? project.description.slice(0, 100) + '…' : project.description}
                    </p>
                  )}

                  {/* Progress */}
                  <div style={{ marginTop: project.description ? 0 : '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                      <span style={{ fontSize: '12px', color: t.textSec, fontWeight: '500' }}>Progress</span>
                      <span style={{ fontSize: '12px', color: progress === 100 ? '#34d399' : t.textSec, fontWeight: '600' }}>
                        {doneTasks}/{totalTasks} tasks · {progress}%
                      </span>
                    </div>
                    <div style={{ height: '6px', background: t.border, borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '10px',
                        background: progress === 100 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                        width: `${progress}%`, transition: 'width 0.8s ease'
                      }} />
                    </div>
                  </div>

                  {/* Dates */}
                  {(project.startDate || project.endDate) && (
                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${t.border}` }}>
                      {project.startDate && (
                        <div>
                          <div style={{ fontSize: '10px', color: t.textSec, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Start</div>
                          <div style={{ fontSize: '12px', color: t.text, fontWeight: '500' }}>{new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        </div>
                      )}
                      {project.endDate && (
                        <div>
                          <div style={{ fontSize: '10px', color: t.textSec, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Deadline</div>
                          <div style={{ fontSize: '12px', color: new Date(project.endDate) < new Date() ? '#f87171' : t.text, fontWeight: '500' }}>
                            {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

const L = { bg:'#f8fafc', cardBg:'#ffffff', text:'#0f172a', textSec:'#64748b', border:'#e2e8f0' };
const D = { bg:'#070714', cardBg:'#0e0e1c', text:'#e2e8f0', textSec:'#475569', border:'rgba(255,255,255,0.07)' };