import { useState, useEffect } from 'react';
import axios from '../api/axios';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';

export default function Profile() {
  const { dark } = useTheme();
  const t = dark ? D : L;
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [nameForm, setNameForm]         = useState({ name: user.name || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [nameMsg, setNameMsg]           = useState({ text: '', ok: true });
  const [passMsg, setPassMsg]           = useState({ text: '', ok: true });
  const [showCurrent, setShowCurrent]   = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [focused, setFocused]           = useState('');
  const [savingName, setSavingName]     = useState(false);
  const [savingPass, setSavingPass]     = useState(false);

  useEffect(() => {
    const id = 'synq-profile-style';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes cardIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .synq-prof-card { animation: cardIn 0.4s ease forwards; }
        .synq-prof-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; }
        .synq-save-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(99,102,241,0.4) !important; }
        .synq-eye:hover { opacity: 1 !important; }
      `;
      document.head.appendChild(s);
    }
  }, []);

  const updateName = async () => {
    if (!nameForm.name.trim()) return setNameMsg({ text: 'Name cannot be empty.', ok: false });
    setSavingName(true); setNameMsg({ text: '', ok: true });
    try {
      const res = await axios.put('/auth/profile', { name: nameForm.name });
      const updated = { ...user, name: res.data.user?.name || nameForm.name };
      localStorage.setItem('user', JSON.stringify(updated));
      setNameMsg({ text: 'Name updated successfully!', ok: true });
    } catch (err) {
      setNameMsg({ text: err.response?.data?.message || 'Failed to update name.', ok: false });
    }
    setSavingName(false);
  };

  const updatePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword)
      return setPassMsg({ text: 'All fields are required.', ok: false });
    if (newPassword.length < 6)
      return setPassMsg({ text: 'New password must be at least 6 characters.', ok: false });
    if (newPassword !== confirmPassword)
      return setPassMsg({ text: 'New passwords do not match.', ok: false });
    setSavingPass(true); setPassMsg({ text: '', ok: true });
    try {
      await axios.put('/auth/password', { currentPassword, newPassword });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPassMsg({ text: 'Password updated successfully!', ok: true });
    } catch (err) {
      setPassMsg({ text: err.response?.data?.message || 'Failed to update password.', ok: false });
    }
    setSavingPass(false);
  };

  const inputStyle = (key) => ({
    width: '100%', padding: '12px 46px 12px 14px', borderRadius: '10px',
    border: `1.5px solid ${focused === key ? '#6366f1' : t.border}`,
    background: t.inputBg, color: t.text, fontSize: '14px',
    boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s',
    fontFamily: "'DM Sans', sans-serif"
  });

  const plainInputStyle = (key) => ({ ...inputStyle(key), padding: '12px 14px' });

  const ROLE_CONFIG = {
    admin:  { label: 'Admin',  color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
    member: { label: 'Member', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.3)'  },
    client: { label: 'Client', color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)'  },
  };
  const rc = ROLE_CONFIG[user.role] || ROLE_CONFIG.member;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, fontFamily: "'DM Sans', sans-serif", transition: 'background 0.3s' }}>
      <Sidebar active="profile" />

      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>Account</p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '32px', fontWeight: '700', color: t.text, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Profile Settings
          </h1>
          <p style={{ color: t.textSec, fontSize: '14px', margin: 0 }}>Manage your account details and security.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '900px' }}>

          {/* Avatar / Info Card */}
          <div className="synq-prof-card" style={{
            background: t.cardBg, borderRadius: '16px', padding: '28px',
            border: `1px solid ${t.border}`, gridColumn: '1 / -1',
            boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', gap: '24px'
          }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '800', fontSize: '28px', fontFamily: "'Syne', sans-serif",
              boxShadow: '0 4px 16px rgba(99,102,241,0.4)'
            }}>
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: '700', color: t.text, margin: '0 0 4px' }}>{user.name}</h2>
              <p style={{ color: t.textSec, fontSize: '14px', margin: '0 0 10px' }}>{user.email}</p>
              <span style={{
                display: 'inline-block', padding: '4px 14px', borderRadius: '20px',
                fontSize: '12px', fontWeight: '600',
                background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`
              }}>
                {rc.label}
              </span>
            </div>
          </div>

          {/* Update Name */}
          <div className="synq-prof-card" style={{
            background: t.cardBg, borderRadius: '16px', padding: '28px',
            border: `1px solid ${t.border}`, animationDelay: '0.1s',
            boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: '700', color: t.text, margin: '0 0 20px' }}>
              Update Name
            </h2>

            {nameMsg.text && (
              <div style={{
                background: nameMsg.ok ? (dark ? 'rgba(52,211,153,0.1)' : '#f0fdf4') : (dark ? 'rgba(239,68,68,0.1)' : '#fef2f2'),
                border: `1px solid ${nameMsg.ok ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}`,
                borderRadius: '10px', padding: '10px 14px',
                color: nameMsg.ok ? '#34d399' : '#f87171',
                fontSize: '13px', marginBottom: '16px',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                {nameMsg.ok ? '✓' : '⚠'} {nameMsg.text}
              </div>
            )}

            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: t.textSec, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
              Full Name
            </label>
            <input
              className="synq-prof-input"
              value={nameForm.name}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused('')}
              onChange={e => setNameForm({ name: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && updateName()}
              style={plainInputStyle('name')}
            />
            <button
              className="synq-save-btn"
              onClick={updateName}
              disabled={savingName}
              style={{
                marginTop: '16px', padding: '11px 24px',
                background: savingName ? t.border : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: savingName ? t.textSec : 'white', border: 'none', borderRadius: '10px',
                fontSize: '14px', fontWeight: '600', cursor: savingName ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
                boxShadow: savingName ? 'none' : '0 4px 14px rgba(99,102,241,0.3)'
              }}
            >
              {savingName ? 'Saving…' : 'Save Name'}
            </button>
          </div>

          {/* Update Password */}
          <div className="synq-prof-card" style={{
            background: t.cardBg, borderRadius: '16px', padding: '28px',
            border: `1px solid ${t.border}`, animationDelay: '0.15s',
            boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: '700', color: t.text, margin: '0 0 20px' }}>
              Change Password
            </h2>

            {passMsg.text && (
              <div style={{
                background: passMsg.ok ? (dark ? 'rgba(52,211,153,0.1)' : '#f0fdf4') : (dark ? 'rgba(239,68,68,0.1)' : '#fef2f2'),
                border: `1px solid ${passMsg.ok ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}`,
                borderRadius: '10px', padding: '10px 14px',
                color: passMsg.ok ? '#34d399' : '#f87171',
                fontSize: '13px', marginBottom: '16px',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                {passMsg.ok ? '✓' : '⚠'} {passMsg.text}
              </div>
            )}

            {[
              { key: 'currentPassword', label: 'Current Password', show: showCurrent, toggle: () => setShowCurrent(p => !p), value: passwordForm.currentPassword, onChange: v => setPasswordForm(f => ({ ...f, currentPassword: v })) },
              { key: 'newPassword',     label: 'New Password',     show: showNew,     toggle: () => setShowNew(p => !p),     value: passwordForm.newPassword,     onChange: v => setPasswordForm(f => ({ ...f, newPassword: v })) },
              { key: 'confirmPassword', label: 'Confirm New Password', show: showNew, toggle: () => setShowNew(p => !p),     value: passwordForm.confirmPassword, onChange: v => setPasswordForm(f => ({ ...f, confirmPassword: v })) },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: t.textSec, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                  {f.label}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="synq-prof-input"
                    type={f.show ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={f.value}
                    onFocus={() => setFocused(f.key)}
                    onBlur={() => setFocused('')}
                    onChange={e => f.onChange(e.target.value)}
                    style={inputStyle(f.key)}
                  />
                  <button
                    className="synq-eye"
                    type="button"
                    onClick={f.toggle}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: t.textSec, fontSize: '16px', opacity: 0.7, padding: '0',
                      display: 'flex', alignItems: 'center', transition: 'opacity 0.2s'
                    }}
                  >
                    {f.show ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
            ))}

            <button
              className="synq-save-btn"
              onClick={updatePassword}
              disabled={savingPass}
              style={{
                marginTop: '4px', padding: '11px 24px',
                background: savingPass ? t.border : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: savingPass ? t.textSec : 'white', border: 'none', borderRadius: '10px',
                fontSize: '14px', fontWeight: '600', cursor: savingPass ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
                boxShadow: savingPass ? 'none' : '0 4px 14px rgba(99,102,241,0.3)'
              }}
            >
              {savingPass ? 'Updating…' : 'Update Password'}
            </button>
          </div>

          {/* Account Info Card */}
          <div className="synq-prof-card" style={{
            background: t.cardBg, borderRadius: '16px', padding: '28px',
            border: `1px solid ${t.border}`, gridColumn: '1 / -1', animationDelay: '0.2s',
            boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: '700', color: t.text, margin: '0 0 20px' }}>
              Account Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { label: 'Email Address', value: user.email },
                { label: 'Role', value: rc.label },
                { label: 'User ID', value: user.id ? `${user.id.slice(0, 8)}…` : 'N/A' },
              ].map(item => (
                <div key={item.label} style={{
                  padding: '16px', background: t.inputBg, borderRadius: '12px',
                  border: `1px solid ${t.border}`
                }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: t.textSec, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '6px' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: t.text }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

const L = { bg:'#f8fafc', cardBg:'#ffffff', inputBg:'#f8fafc', text:'#0f172a', textSec:'#64748b', border:'#e2e8f0' };
const D = { bg:'#070714', cardBg:'#0e0e1c', inputBg:'#13132a', text:'#e2e8f0', textSec:'#475569', border:'rgba(255,255,255,0.07)' };