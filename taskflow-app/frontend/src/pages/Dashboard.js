import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';

const STATUS_CONFIG = {
  'todo':        { label: 'To Do',       color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  'in-progress': { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  'done':        { label: 'Done',        color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
};

const STAT_CARDS = [
  { key: 'total',      label: 'Total Tasks',  icon: '◈', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
  { key: 'inProgress', label: 'In Progress',  icon: '⬡', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)' },
  { key: 'done',       label: 'Completed',    icon: '◉', gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
  { key: 'overdue',    label: 'Overdue',      icon: '⚠', gradient: 'linear-gradient(135deg, #ef4444, #f43f5e)' },
];

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [time, setTime] = useState(new Date());
  const { dark } = useTheme();
  const t = dark ? D : L;
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const id = 'synq-dash-style';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes cardIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .synq-stat-card { animation: cardIn 0.4s ease forwards; }
        .synq-stat-card:hover { transform: translateY(-3px) !important; transition: transform 0.2s ease !important; }
        .synq-task-row:hover { background: rgba(99,102,241,0.06) !important; }
      `;
      document.head.appendChild(s);
    }
    axios.get('/tasks').then(res => setTasks(res.data)).catch(() => {});
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = {
    total:      tasks.length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done:       tasks.filter(t => t.status === 'done').length,
    overdue:    tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, fontFamily: "'DM Sans', sans-serif", transition: 'background 0.3s' }}>
      <Sidebar active="dashboard" />

      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>

        {/* Top bar with clock */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '28px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: t.cardBg, border: `1px solid ${t.border}`,
            borderRadius: '12px', padding: '10px 18px',
            boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <span style={{ fontSize: '18px' }}>🕐</span>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: '700', color: t.text, lineHeight: 1 }}>
                {timeStr}
              </div>
              <div style={{ fontSize: '11px', color: t.textSec, marginTop: '2px' }}>{dateStr}</div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>
            {greeting}
          </p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '32px', fontWeight: '700', color: t.text, margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            {user.name || 'Welcome'} 👋
          </h1>
          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '14px', fontWeight: '600', color: '#8b5cf6', margin: '0 0 6px' }}>
            Smarter Collaboration Starts Here
          </p>
          <p style={{ color: t.textSec, fontSize: '14px', margin: 0 }}>
            Here's what's happening with your projects today.
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '18px', marginBottom: '40px' }}>
          {STAT_CARDS.map((card, i) => (
            <div key={card.key} className="synq-stat-card" style={{
              background: t.cardBg, borderRadius: '16px', padding: '22px',
              border: `1px solid ${t.border}`, cursor: 'default',
              animationDelay: `${i * 0.07}s`, transition: 'box-shadow 0.2s',
              boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: card.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', color: 'white', marginBottom: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}>{card.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: '700', fontFamily: "'Syne', sans-serif", color: t.text, lineHeight: 1, marginBottom: '4px' }}>
                {stats[card.key]}
              </div>
              <div style={{ fontSize: '12px', color: t.textSec, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {card.label}
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <div style={{ background: t.cardBg, borderRadius: '16px', padding: '24px', border: `1px solid ${t.border}`, marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontWeight: '600', color: t.text, fontSize: '14px' }}>Overall Progress</span>
              <span style={{ fontSize: '13px', color: '#34d399', fontWeight: '600' }}>
                {Math.round((stats.done / tasks.length) * 100)}% complete
              </span>
            </div>
            <div style={{ height: '8px', background: t.border, borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '10px',
                background: 'linear-gradient(90deg, #10b981, #34d399)',
                width: `${(stats.done / tasks.length) * 100}%`,
                transition: 'width 0.8s ease'
              }} />
            </div>
          </div>
        )}

        {/* Recent Tasks */}
        <div style={{ background: t.cardBg, borderRadius: '16px', border: `1px solid ${t.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: '700', color: t.text, margin: 0 }}>Recent Tasks</h2>
            <Link to="/tasks" style={{ fontSize: '13px', color: '#6366f1', fontWeight: '600', textDecoration: 'none' }}>View all →</Link>
          </div>
          {tasks.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.4 }}>◈</div>
              <p style={{ color: t.textSec, fontSize: '14px', margin: '0 0 16px' }}>No tasks yet.</p>
              <Link to="/tasks" style={{ color: '#6366f1', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>Create your first task →</Link>
            </div>
          ) : (
            tasks.slice(0, 6).map((task, i) => {
              const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG['todo'];
              return (
                <div key={task.id} className="synq-task-row" style={{
                  padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderBottom: i < Math.min(tasks.length, 6) - 1 ? `1px solid ${t.border}` : 'none',
                  transition: 'background 0.15s', cursor: 'default'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: sc.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '14px', color: t.text, fontWeight: '500' }}>{task.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {task.dueDate && (
                      <span style={{ fontSize: '12px', color: t.textSec }}>
                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    <span style={{ padding: '3px 11px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

const L = { bg:'#f8fafc', cardBg:'#ffffff', text:'#0f172a', textSec:'#64748b', border:'#e2e8f0' };
const D = { bg:'#070714', cardBg:'#0e0e1c', text:'#e2e8f0', textSec:'#475569', border:'rgba(255,255,255,0.07)' };