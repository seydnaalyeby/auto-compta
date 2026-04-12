import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MENU = [
  { path: '/dashboard',       icon: '📊', label: 'Tableau de bord' },
  { path: '/saisie',          icon: '✏️',  label: 'Saisie IA' },
  { path: '/tresorerie',      icon: '💵',  label: 'Trésorerie' },
  { path: '/compte-resultat', icon: '📈',  label: 'Compte Résultat' },
  { path: '/bilan',           icon: '📋',  label: 'Bilan' },
  { path: '/journal',         icon: '📝',  label: 'Journal Comptable' },
  { path: '/correction',      icon: '🔍',  label: 'Correction IA' },
];

export default function Layout({ children }) {
  const { user, seDeconnecter } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, width: sidebarOpen ? '240px' : '64px' }}>
        {/* Logo */}
        <div style={styles.sidebarLogo}>
          <div style={styles.logoIcon}>AC</div>
          {sidebarOpen && <span style={styles.logoText}>Auto-Compta</span>}
        </div>

        {/* Menu */}
        <nav style={styles.nav}>
          {MENU.map(item => (
            <Link key={item.path} to={item.path} style={{
              ...styles.navItem,
              ...(location.pathname === item.path ? styles.navItemActive : {})
            }}>
              <span style={styles.navIcon}>{item.icon}</span>
              {sidebarOpen && <span style={styles.navLabel}>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User */}
        {sidebarOpen && (
          <div style={styles.userBox}>
            <div style={styles.userInfo}>
              <div style={styles.userAvatar}>{user?.nom_entreprise?.[0] || 'U'}</div>
              <div>
                <div style={styles.userName}>{user?.nom_entreprise}</div>
                <div style={styles.userSub}>{user?.secteur}</div>
              </div>
            </div>
            <button onClick={seDeconnecter} style={styles.logoutBtn}>
              🚪 Déconnexion
            </button>
          </div>
        )}
      </aside>

      {/* Main */}
      <main style={styles.main}>
        {/* Topbar */}
        <header style={styles.topbar}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.toggleBtn}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <div style={styles.topbarRight}>
            <span style={styles.topbarUser}>👤 {user?.nom_entreprise}</span>
          </div>
        </header>

        {/* Content */}
        <div style={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#f3f4f6', fontFamily: 'Segoe UI, sans-serif' },
  sidebar: {
    background: '#1e429f', color: '#fff', display: 'flex',
    flexDirection: 'column', transition: 'width 0.3s', overflow: 'hidden',
    minHeight: '100vh', position: 'sticky', top: 0
  },
  sidebarLogo: {
    padding: '20px 16px', display: 'flex', alignItems: 'center',
    gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  logoIcon: {
    width: '36px', height: '36px', borderRadius: '8px',
    background: '#fff', color: '#1e429f', fontWeight: 'bold',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', flexShrink: 0
  },
  logoText: { fontWeight: '700', fontSize: '16px', whiteSpace: 'nowrap' },
  nav: { flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '4px' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 12px', borderRadius: '8px', textDecoration: 'none',
    color: 'rgba(255,255,255,0.75)', fontSize: '14px', transition: 'background 0.2s'
  },
  navItemActive: { background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: '600' },
  navIcon: { fontSize: '18px', width: '24px', textAlign: 'center', flexShrink: 0 },
  navLabel: { whiteSpace: 'nowrap' },
  userBox: {
    padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex', flexDirection: 'column', gap: '10px'
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  userAvatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0
  },
  userName: { fontSize: '13px', fontWeight: '600', lineHeight: 1.3 },
  userSub: { fontSize: '11px', color: 'rgba(255,255,255,0.6)' },
  logoutBtn: {
    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff', padding: '7px 12px', borderRadius: '6px',
    cursor: 'pointer', fontSize: '12px', width: '100%'
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  topbar: {
    background: '#fff', padding: '12px 24px', display: 'flex',
    alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10
  },
  toggleBtn: {
    background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px',
    padding: '6px 10px', cursor: 'pointer', fontSize: '14px'
  },
  topbarRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  topbarUser: { fontSize: '14px', color: '#374151', fontWeight: '500' },
  content: { padding: '24px', flex: 1 }
};
