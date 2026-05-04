import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useEffect } from 'react';

const ROLE_CONFIG = {
  admin:  { label: 'Admin',  color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
  member: { label: 'Member', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.3)'  },
  client: { label: 'Client', color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)'  },
};

const L = { sidebar: '#ffffff', cardBg: '#f8fafc', text: '#0f172a', textSec: '#64748b', border: '#e2e8f0' };
const D = { sidebar: '#0d0d1a', cardBg: '#14142a', text: '#e2e8f0', textSec: '#64748b', border: 'rgba(255,255,255,0.07)' };

export default function Sidebar({ active }) {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const role = (user.role || 'member').toLowerCase();
  const rc = ROLE_CONFIG[role] || ROLE_CONFIG.member;
  const t = dark ? D : L;

  useEffect(() => {
    const id = 'synq-sidebar-style';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .synq-nav-link:hover { background: rgba(99,102,241,0.1) !important; color: #a5b4fc !important; transform: translateX(3px); }
        .synq-logout:hover { background: rgba(239,68,68,0.15) !important; }
        .synq-theme-btn:hover { background: rgba(99,102,241,0.1) !important; }
      `;
      document.head.appendChild(s);
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/dashboard', id: 'dashboard', icon: '◈', label: 'Dashboard' },
    { to: '/projects',  id: 'projects',  icon: '⬡', label: 'Projects'  },
    { to: '/tasks',     id: 'tasks',     icon: '◉', label: 'Tasks'     },
    { to: '/members',   id: 'members',   icon: '◎', label: 'Members'   },
    { to: '/profile',   id: 'profile',   icon: '○', label: 'Profile'   },
  ];

  const memberLinks = [
    { to: '/dashboard', id: 'dashboard', icon: '◈', label: 'Dashboard' },
    { to: '/projects',  id: 'projects',  icon: '⬡', label: 'Projects'  },
    { to: '/tasks',     id: 'tasks',     icon: '◉', label: 'My Tasks'  },
    { to: '/profile',   id: 'profile',   icon: '○', label: 'Profile'   },
  ];

  const clientLinks = [
    { to: '/client',  id: 'client',  icon: '◈', label: 'My Projects' },
    { to: '/profile', id: 'profile', icon: '○', label: 'Profile'     },
  ];

  const links =
    role === 'client' ? clientLinks :
    role === 'member' ? memberLinks :
    adminLinks;

  return (
    <div style={{
      width: '240px',
      minHeight: '100vh',
      background: t.sidebar,
      borderRight: `1px solid ${t.border}`,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 14px',
      fontFamily: "'DM Sans', sans-serif",
      flexShrink: 0,
    }}>

      {/* 🔥 TAGLINE + LOGO */}
      <div style={{ padding: '8px 12px', marginBottom: '24px' }}>
        <p style={{
          margin: '0 0 10px 0',
          fontSize: '13px',
          fontWeight: '700',
          color: '#8b5cf6',
          letterSpacing: '0.3px',
          lineHeight: 1.4,
          fontFamily: "'Syne', sans-serif",
        }}>
          Smarter Collaboration<br />Starts Here
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            color: 'white',
            fontFamily: "'Syne', sans-serif",
            fontWeight: '800',
          }}>
            S
          </div>

          <span style={{
            fontSize: '17px',
            fontWeight: '800',
            color: t.text,
            fontFamily: "'Syne', sans-serif",
            letterSpacing: '-0.5px',
          }}>
            SYNQ <span style={{ color: '#8b5cf6' }}>AI</span>
          </span>
        </div>

        <p style={{
          margin: '6px 0 0 44px',
          fontSize: '10px',
          fontWeight: '600',
          lineHeight: 1.5,
          color: t.textSec,
          letterSpacing: '0.2px'
        }}>
          Think Less. Deliver More. Stay in Sync.
        </p>
      </div>

      {/* 👤 PROFILE CARD */}
      <Link to="/profile" style={{ textDecoration: 'none' }}>
        <div style={{
          padding: '14px',
          background: t.cardBg,
          borderRadius: '12px',
          border: `1px solid ${t.border}`,
          marginBottom: '20px',
          cursor: 'pointer'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '700',
              fontSize: '15px',
              fontFamily: "'Syne', sans-serif"
            }}>
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: t.text }}>
                {user.name || 'User'}
              </div>
              <div style={{ fontSize: '11px', color: t.textSec }}>
                {user.email}
              </div>
            </div>
          </div>

          <span style={{
            padding: '3px 11px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '600',
            background: rc.bg,
            color: rc.color,
            border: `1px solid ${rc.border}`
          }}>
            {rc.label}
          </span>
        </div>
      </Link>

      {/* 🔗 NAVIGATION */}
      <nav style={{ flex: 1 }}>
        {links.map(link => {
          const isActive = active === link.id;
          return (
            <Link key={link.id} to={link.to} className="synq-nav-link" style={{
              padding: '10px 14px',
              borderRadius: '10px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: isActive ? '#6366f1' : 'transparent',
              color: isActive ? 'white' : t.textSec
            }}>
              <span>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* ⚙️ ACTIONS */}
      <button onClick={toggle}>Toggle Theme</button>
      <button onClick={logout}>Logout</button>

    </div>
  );
}