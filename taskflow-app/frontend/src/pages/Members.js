import { useEffect, useState } from 'react';
import axios from '../api/axios';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';

export default function Members() {
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('member');
  const { dark } = useTheme();
  const t = dark ? D : L;

  useEffect(() => {
    const id = 'synq-members-style';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes cardIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .synq-member-card { animation: cardIn 0.35s ease forwards; transition: transform 0.2s, box-shadow 0.2s !important; }
        .synq-member-card:hover { transform: translateY(-3px) !important; }
      `;
      document.head.appendChild(s);
    }
    axios.get('/auth/users').then(res => setUsers(res.data)).catch(() => {});
  }, []);

  const filtered = users.filter(u => u.role === tab);

  const ROLE_COLOR = {
    member: { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)' },
    client: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)' },
    admin:  { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, fontFamily: "'DM Sans', sans-serif", transition: 'background 0.3s' }}>
      <Sidebar active="members" />
      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>

        <div style={{ marginBottom: '36px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>Team</p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '32px', fontWeight: '700', color: t.text, margin: '0 0 6px', letterSpacing: '-0.5px' }}>Members & Clients</h1>
          <p style={{ color: t.textSec, fontSize: '14px', margin: 0 }}>{users.length} total users in your workspace</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
          {['member', 'client', 'admin'].map(r => (
            <button key={r} onClick={() => setTab(r)} style={{
              padding: '9px 20px', borderRadius: '10px', cursor: 'pointer',
              border: `1.5px solid ${tab === r ? ROLE_COLOR[r].color : t.border}`,
              background: tab === r ? ROLE_COLOR[r].bg : t.cardBg,
              color: tab === r ? ROLE_COLOR[r].color : t.textSec,
              fontSize: '13px', fontWeight: '600', transition: 'all 0.18s',
              fontFamily: "'DM Sans', sans-serif", textTransform: 'capitalize'
            }}>
              {r}s ({users.filter(u => u.role === r).length})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ background: t.cardBg, borderRadius: '16px', padding: '64px', border: `1px solid ${t.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>○</div>
            <p style={{ color: t.textSec, fontSize: '15px', margin: 0 }}>No {tab}s found.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {filtered.map((u, i) => {
              const rc = ROLE_COLOR[u.role] || ROLE_COLOR.member;
              return (
                <div key={u.id} className="synq-member-card" style={{
                  background: t.cardBg, borderRadius: '16px', padding: '24px',
                  border: `1px solid ${t.border}`, animationDelay: `${i * 0.05}s`,
                  boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: '800', fontSize: '18px', fontFamily: "'Syne', sans-serif",
                      boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
                    }}>
                      {u.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: t.text, fontFamily: "'Syne', sans-serif" }}>{u.name}</div>
                      <div style={{ fontSize: '12px', color: t.textSec, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                    </div>
                  </div>
                  <span style={{
                    display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                    fontSize: '11px', fontWeight: '600',
                    background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`
                  }}>
                    {u.role}
                  </span>
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