import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const t = dark ? D : L;

  useEffect(() => {
    const id = 'synq-signup-style';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        @keyframes gradientShift2 {
          0%   { background-position: 100% 0%; }
          50%  { background-position: 0% 100%; }
          100% { background-position: 100% 0%; }
        }
        @keyframes floatUp2 {
          from { opacity:0; transform: translateY(18px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .synq-su-input:focus { border-color: #8b5cf6 !important; box-shadow: 0 0 0 3px rgba(139,92,246,0.15) !important; }
        .synq-su-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(139,92,246,0.4) !important; }
        .synq-su-form { animation: floatUp2 0.5s ease forwards; }
        .synq-role-opt:hover { border-color: #8b5cf6 !important; background: rgba(139,92,246,0.05) !important; }
        .synq-su-eye:hover { opacity: 1 !important; }
      `;
      document.head.appendChild(s);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('All fields are required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      await axios.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Try again.');
    }
    setLoading(false);
  };

  const roles = [
    { value: 'admin',  label: 'Admin',  desc: 'Full access',   color: '#a78bfa' },
    { value: 'member', label: 'Member', desc: 'Team member',   color: '#60a5fa' },
    { value: 'client', label: 'Client', desc: 'View projects', color: '#34d399' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* LEFT — Form panel */}
      <div style={{
        width: '500px', background: t.bg, display: 'flex', flexDirection: 'column',
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

        <div className="synq-su-form">
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>Get started free</p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: '700', color: t.text, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Create your SYNQ AI account
          </h2>
          <p style={{ color: t.textSec, fontSize: '14px', margin: '0 0 28px' }}>
            Already have one? <Link to="/login" style={{ color: '#8b5cf6', fontWeight: '600', textDecoration: 'none' }}>Sign in →</Link>
          </p>

          {error && (
            <div style={{
              background: dark ? 'rgba(239,68,68,0.1)' : '#fef2f2',
              border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px',
              padding: '12px 16px', color: '#f87171', fontSize: '13px', marginBottom: '20px',
              display: 'flex', gap: '8px', alignItems: 'center'
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          {/* Name & Email */}
          {[
            { key: 'name',  label: 'Full Name',     type: 'text',  placeholder: 'Jane Smith' },
            { key: 'email', label: 'Email Address',  type: 'email', placeholder: 'jane@company.com' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: t.textSec, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                {f.label}
              </label>
              <input
                className="synq-su-input"
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key]}
                onFocus={() => setFocused(f.key)}
                onBlur={() => setFocused('')}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '10px',
                  border: `1.5px solid ${focused === f.key ? '#8b5cf6' : t.border}`,
                  background: t.inputBg, color: t.text, fontSize: '14px',
                  boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s',
                  fontFamily: "'DM Sans', sans-serif"
                }}
              />
            </div>
          ))}

          {/* Password with eye toggle */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: t.textSec, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="synq-su-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="6+ characters"
                value={form.password}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
                style={{
                  width: '100%', padding: '12px 48px 12px 16px', borderRadius: '10px',
                  border: `1.5px solid ${focused === 'password' ? '#8b5cf6' : t.border}`,
                  background: t.inputBg, color: t.text, fontSize: '14px',
                  boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s',
                  fontFamily: "'DM Sans', sans-serif"
                }}
              />
              <button
                className="synq-su-eye"
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: t.textSec, fontSize: '17px', opacity: 0.7, padding: '0',
                  display: 'flex', alignItems: 'center', transition: 'opacity 0.2s'
                }}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: t.textSec, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
              Select Role
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {roles.map(r => (
                <button
                  key={r.value}
                  className="synq-role-opt"
                  onClick={() => setForm({ ...form, role: r.value })}
                  style={{
                    flex: 1, padding: '10px 8px', borderRadius: '10px', cursor: 'pointer',
                    border: `1.5px solid ${form.role === r.value ? r.color : t.border}`,
                    background: form.role === r.value ? `${r.color}18` : t.inputBg,
                    color: form.role === r.value ? r.color : t.textSec,
                    fontSize: '12px', fontWeight: '600', transition: 'all 0.18s',
                    fontFamily: "'DM Sans', sans-serif"
                  }}
                >
                  <div style={{ fontWeight: '700', marginBottom: '2px' }}>{r.label}</div>
                  <div style={{ fontSize: '10px', opacity: 0.7 }}>{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            className="synq-su-btn"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading ? t.border : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              color: loading ? t.textSec : 'white', border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
              boxShadow: loading ? 'none' : '0 4px 16px rgba(139,92,246,0.3)'
            }}
          >
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
        </div>
      </div>

      {/* RIGHT — Hero panel */}
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(-45deg, #0f172a, #1e1b4b, #7c3aed, #8b5cf6, #4f46e5)',
        backgroundSize: '400% 400%', animation: 'gradientShift2 14s ease infinite',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'flex-start', padding: '64px'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        <div style={{ position:'absolute', width:280, height:280, borderRadius:'50%', background:'rgba(255,255,255,0.06)', top:-60, right:-60 }} />
        <div style={{ position:'absolute', width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.04)', bottom:80, left:40 }} />

        <div style={{ position: 'relative', color: 'white', maxWidth: '400px' }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '52px', fontWeight: '800', margin: '0 0 10px', letterSpacing: '-2px', lineHeight: 1.05 }}>
            SYNQ <span style={{ color: '#c4b5fd' }}>AI</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#c4b5fd', fontWeight: '600', margin: '0 0 14px' }}>
            Think Less. Deliver More. Stay in Sync.
          </p>
          <p style={{ fontSize: '15px', opacity: 0.65, lineHeight: 1.7, marginBottom: '48px', fontStyle: 'italic' }}>
            Get visibility into every project, deadline, and deliverable — from day one.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { role: 'Admin',  color: '#a78bfa', desc: 'Manage team, projects & full control' },
              { role: 'Member', color: '#60a5fa', desc: 'Work on tasks, collaborate with team' },
              { role: 'Client', color: '#34d399', desc: 'View project progress & updates' },
            ].map(r => (
              <div key={r.role} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ padding: '4px 12px', borderRadius: '20px', background: `${r.color}22`, color: r.color, border: `1px solid ${r.color}40`, fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>{r.role}</span>
                <span style={{ fontSize: '13px', opacity: 0.7 }}>{r.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const L = { bg:'#fafafa', cardBg:'#f1f5f9', inputBg:'#ffffff', text:'#0f172a', textSec:'#64748b', border:'#e2e8f0' };
const D = { bg:'#070714', cardBg:'#0e0e1c', inputBg:'#13132a', text:'#e2e8f0', textSec:'#4b5563', border:'rgba(255,255,255,0.07)' };