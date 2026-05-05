import { useState, useEffect } from 'react';
import axios from '../api/axios';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';

const L = { bg:'#f8fafc', cardBg:'#ffffff', inputBg:'#f1f5f9', text:'#0f172a', textSec:'#64748b', border:'#e2e8f0' };
const D = { bg:'#070714', cardBg:'#0e0e1c', inputBg:'#13132a', text:'#e2e8f0', textSec:'#475569', border:'rgba(255,255,255,0.07)' };

const ROLE_CONFIG = {
  admin:  { label: 'Admin',  color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
  member: { label: 'Member', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.3)'  },
  client: { label: 'Client', color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)'  },
};

export default function Profile() {
  const { dark } = useTheme();
  const t = dark ? D : L;

  // Read user from localStorage
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const role = (storedUser.role || 'member').toLowerCase();
  const rc = ROLE_CONFIG[role] || ROLE_CONFIG.member;

  const [name,        setName]        = useState(storedUser.name  || '');
  const [email,       setEmail]       = useState(storedUser.email || '');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass,     setNewPass]     = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [success,     setSuccess]     = useState('');
  const [error,       setError]       = useState('');
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    const id = 'synq-profile-style';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
        .profile-card { animation: fadeIn 0.4s ease forwards; }
      `;
      document.head.appendChild(s);
    }
  }, []);

  const inp = {
    width: '100%', padding: '11px 14px', borderRadius: '10px', boxSizing: 'border-box',
    border: '1px solid ' + t.border, background: t.inputBg,
    color: t.text, fontSize: '14px', outline: 'none',
    fontFamily: "'DM Sans',sans-serif", transition: 'border 0.2s',
  };
  const lbl = {
    display: 'block', fontSize: '11px', fontWeight: '600',
    color: t.textSec, marginBottom: '6px',
    textTransform: 'uppercase', letterSpacing: '0.7px',
  };

  const saveProfile = async () => {
    setError(''); setSuccess('');

    // Password validation
    if (newPass && newPass !== confirmPass) {
      return setError('New passwords do not match.');
    }
    if (newPass && newPass.length < 6) {
      return setError('New password must be at least 6 characters.');
    }

    setSaving(true);
    try {
      const payload = { name, email };
      if (newPass && currentPass) {
        payload.currentPassword = currentPass;
        payload.newPassword     = newPass;
      }

      const { data } = await axios.put('/auth/profile', payload);

      // Update localStorage with new name/email
      const updated = { ...storedUser, name: data.name || name, email: data.email || email };
      localStorage.setItem('user', JSON.stringify(updated));

      setSuccess('Profile updated successfully!');
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, fontFamily: "'DM Sans',sans-serif" }}>
      <Sidebar active="projects" />
      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>
            Account
          </p>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: '32px', fontWeight: '700', color: t.text, margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            My Profile
          </h1>
          <p style={{ color: t.textSec, fontSize: '14px', margin: 0 }}>
            Manage your account information and password.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '900px' }}>

          {/* ── Left: Avatar + Role card ── */}
          <div className="profile-card" style={{
            background: t.cardBg, borderRadius: '16px', padding: '32px',
            border: '1px solid ' + t.border, textAlign: 'center',
            boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.05)',
          }}>
            {/* Avatar circle */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '32px', fontWeight: '700',
              fontFamily: "'Syne',sans-serif",
              margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
            }}>
              {(name || storedUser.name || 'U').charAt(0).toUpperCase()}
            </div>

            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: '20px', fontWeight: '700', color: t.text, margin: '0 0 4px' }}>
              {name || storedUser.name || 'User'}
            </h2>
            <p style={{ color: t.textSec, fontSize: '13px', margin: '0 0 16px' }}>
              {email || storedUser.email}
            </p>

            {/* Role badge */}
            <span style={{
              padding: '5px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
              background: rc.bg, color: rc.color, border: '1px solid ' + rc.border,
            }}>
              {rc.label}
            </span>

            {/* Stats */}
            <div style={{
              marginTop: '24px', padding: '16px', borderRadius: '12px',
              background: dark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)',
              border: '1px solid rgba(99,102,241,0.12)',
            }}>
              <p style={{ fontSize: '11px', fontWeight: '600', color: t.textSec, textTransform: 'uppercase', letterSpacing: '0.7px', margin: '0 0 8px' }}>
                Account Info
              </p>
              <div style={{ fontSize: '12px', color: t.textSec, lineHeight: 2 }}>
                <div>Role: <strong style={{ color: rc.color }}>{rc.label}</strong></div>
                <div>Email: <strong style={{ color: t.text }}>{email || storedUser.email}</strong></div>
              </div>
            </div>
          </div>

          {/* ── Right: Edit form ── */}
          <div className="profile-card" style={{
            background: t.cardBg, borderRadius: '16px', padding: '32px',
            border: '1px solid ' + t.border,
            boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.05)',
            animationDelay: '0.1s',
          }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: '16px', fontWeight: '700', color: t.text, margin: '0 0 20px' }}>
              Edit Information
            </h2>

            {success && (
              <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#34d399', fontSize: '13px', marginBottom: '16px' }}>
                ✓ {success}
              </div>
            )}
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '10px 14px', color: '#f87171', fontSize: '13px', marginBottom: '16px' }}>
                ⚠ {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={lbl}>Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inp} />
              </div>
              <div>
                <label style={lbl}>Email Address</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" type="email" style={inp} />
              </div>

              <div style={{ borderTop: '1px solid ' + t.border, paddingTop: '16px', marginTop: '4px' }}>
                <p style={{ fontSize: '11px', fontWeight: '600', color: t.textSec, textTransform: 'uppercase', letterSpacing: '0.7px', margin: '0 0 14px' }}>
                  Change Password <span style={{ fontWeight: '400', opacity: 0.6 }}>(optional)</span>
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={lbl}>Current Password</label>
                    <input value={currentPass} onChange={e => setCurrentPass(e.target.value)} type="password" placeholder="Enter current password" style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>New Password</label>
                    <input value={newPass} onChange={e => setNewPass(e.target.value)} type="password" placeholder="Min 6 characters" style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Confirm New Password</label>
                    <input value={confirmPass} onChange={e => setConfirmPass(e.target.value)} type="password" placeholder="Repeat new password" style={inp} />
                  </div>
                </div>
              </div>

              <button
                onClick={saveProfile}
                disabled={saving}
                style={{
                  marginTop: '8px', padding: '12px',
                  background: saving ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  color: 'white', border: 'none', borderRadius: '10px',
                  fontSize: '14px', fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: "'DM Sans',sans-serif",
                  boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                  transition: 'all 0.2s',
                }}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}