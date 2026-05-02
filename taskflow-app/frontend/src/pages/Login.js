import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const t = dark ? D : L;

  useEffect(() => {
    const id = 'synq-login-style';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatUp {
          from { opacity:0; transform: translateY(22px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes orbPulse {
          0%, 100% { transform: scale(1) translate(0,0); }
          33%      { transform: scale(1.08) translate(10px,-8px); }
          66%      { transform: scale(0.95) translate(-6px,12px); }
        }
        .synq-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; }
        .synq-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.45) !important; }
        .synq-btn:active { transform: translateY(0px); }
        .synq-left-orb { animation: orbPulse 7s ease-in-out infinite; }
        .synq-form-card { animation: floatUp 0.5s ease forwards; }
        .synq-role-btn:hover { border-color: #6366f1 !important; }
        .synq-eye-btn:hover { opacity: 1 !important; }
      `;
      document.head.appendChild(s);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      const res = await axios.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate(res.data.user.role === 'client' ? '/client' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    }
    setLoading(false);
  };

  const roles = [
    { value: 'admin',  label: 'Admin',  icon: '⬡', color: '#a78bfa' },
    { value: 'member', label: 'Member', icon: '◉', color: '#60a5fa' },
    { value: 'client', label: 'Client', icon: '◈', color: '#34d399' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(-45deg, #1e1b4b, #4c1d95, #6366f1, #7c3aed, #0f172a)',
        backgroundSize: '400% 400%', animation: 'gradientShift 12s ease infinite',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'flex-start', padding: '64px'
      }}>
        {[
          { w:340, h:340, t:-100, l:-100, op:0.12 },
          { w:220, h:220, b:60,   r:-40,  op:0.1  },
          { w:160, h:160, b:220,  l:60,   op:0.07 },
        ].map((o,i) => (
          <div key={i} className="synq-left-orb" style={{
            position: 'absolute', width: o.w, height: o.h, borderRadius: '50%',
            background: 'white', opacity: o.op,
            top: o.t, left: o.l, bottom: o.b, right: o.r,
            animationDelay: `${i * 2.2}s`
          }} />
        ))}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div style={{ position: 'relative', color: 'white' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
            padding: '8px 16px', borderRadius: '50px', marginBottom: '32px',
            border: '1px solid rgba(255,255,255,0.15)', fontSize: '13px', fontWeight: '500'
          }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#4ade80', display:'inline-block', boxShadow:'0 0 8px #4ade80' }} />
            All systems operational
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '56px', fontWeight: '800', margin: '0 0 8px', lineHeight: 1.05, letterSpacing: '-2px' }}>
            SYNQ <span style={{ color: '#a5b4fc' }}>AI</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#c4b5fd', fontWeight: '700', margin: '0 0 20px', letterSpacing: '0.3px' }}>
            Smarter Collaboration Starts Here
          </p>
          <p style={{ fontSize: '16px', lineHeight: 1.8, maxWidth: '380px', margin: '0 0 48px', opacity: 0.88, fontWeight: '400' }}>
            Work smarter with AI-powered collaboration.<br />
            Manage tasks, align teams, and turn ideas into<br />
            <span style={{ color: '#c4b5fd', fontWeight: '600' }}>execution — faster than ever.</span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { icon: '◈', text: 'Project & task tracking' },
              { icon: '⬡', text: 'Real-time team collaboration' },
              { icon: '◉', text: 'Role-based access control' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', opacity: 0.85 }}>
                <span style={{ color: '#a5b4fc', fontSize: '18px' }}>{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        width: '480px', background: t.bg, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px 52px', position: 'relative',
        transition: 'background 0.3s', flexShrink: 0, overflowY: 'auto'
      }}>
        <button onClick={toggle} style={{
          position: 'absolute', top: '24px', right: '24px',
          width: '38px', height: '38px', borderRadius: '50%',
          background: t.cardBg, border: `1px solid ${t.border}`,
          cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: t.textSec, transition: 'all 0.2s'
        }}>
          {dark ? '☀' : '☽'}
        </button>
        <div className="synq-form-card">
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>Welcome back</p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: '700', color: t.text, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Sign in to SYNQ AI
          </h2>
          <p style={{ color: t.textSec, fontSize: '14px', margin: '0 0 28px' }}>
            Don't have one? <Link to="/signup" style={{ color: '#6366f1', fontWeight: '600', textDecoration: 'none' }}>Create account →</Link>
          </p>
          {error && (
            <div style={{
              background: dark ? 'rgba(239,68,68,0.1)' : '#fef2f2',
              border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px',
              padding: '12px 16px', color: '#f87171', fontSize: '13px', marginBottom: '20px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span>⚠</span> {error}
            </div>
          )}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: t.textSec, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Login As</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {roles.map(r => (
                <button key={r.value} className="synq-role-btn"
                  onClick={() => setForm({ ...form, role: r.value })}
                  style={{
                    flex: 1, padding: '10px 6px', borderRadius: '10px', cursor: 'pointer',
                    border: `1.5px solid ${form.role === r.value ? r.color : t.border}`,
                    background: form.role === r.value ? `${r.color}18` : t.inputBg,
                    color: form.role === r.value ? r.color : t.textSec,
                    fontSize: '12px', fontWeight: '600', transition: 'all 0.18s',
                    fontFamily: "'DM Sans', sans-serif"
                  }}>
                  <div style={{ fontSize: '16px', marginBottom: '3px' }}>{r.icon}</div>
                  <div>{r.label}</div>
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: t.textSec, marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Email Address</label>
            <input className="synq-input" type="email" placeholder="you@company.com"
              value={form.email} onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
              style={{
                width: '100%', padding: '13px 16px', borderRadius: '10px',
                border: `1.5px solid ${focused === 'email' ? '#6366f1' : t.border}`,
                background: t.inputBg, color: t.text, fontSize: '14px',
                boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s',
                fontFamily: "'DM Sans', sans-serif"
              }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: t.textSec, marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input className="synq-input" type={showPassword ? 'text' : 'password'} placeholder="••••••••••"
                value={form.password} onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
                style={{
                  width: '100%', padding: '13px 48px 13px 16px', borderRadius: '10px',
                  border: `1.5px solid ${focused === 'password' ? '#6366f1' : t.border}`,
                  background: t.inputBg, color: t.text, fontSize: '14px',
                  boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s',
                  fontFamily: "'DM Sans', sans-serif"
                }} />
              <button className="synq-eye-btn" type="button" onClick={() => setShowPassword(p => !p)}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: t.textSec, fontSize: '17px', opacity: 0.7, padding: '0',
                  display: 'flex', alignItems: 'center', transition: 'opacity 0.2s'
                }}>
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>
          <button className="synq-btn" onClick={handleSubmit} disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading ? t.border : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: loading ? t.textSec : 'white', border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.3px', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
              boxShadow: loading ? 'none' : '0 4px 16px rgba(99,102,241,0.3)'
            }}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </div>
      </div>
    </div>
  );
}

const L = { bg:'#fafafa', cardBg:'#f1f5f9', inputBg:'#ffffff', text:'#0f172a', textSec:'#64748b', border:'#e2e8f0' };
const D = { bg:'#070714', cardBg:'#0e0e1c', inputBg:'#13132a', text:'#e2e8f0', textSec:'#4b5563', border:'rgba(255,255,255,0.07)' };