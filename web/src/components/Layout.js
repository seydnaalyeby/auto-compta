import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import BrandLogo from './BrandLogo';
import {
  IconDashboard, IconPen, IconWallet, IconTrend, IconBook,
  IconFile, IconSparkles, IconBarChart, IconLogOut,
  IconChevronLeft, IconChevronRight, IconBell
} from './Icons';

const SECTIONS = [
  {
    label: 'Principal',
    items: [
      { path: '/dashboard',       Icon: IconDashboard, key: 'nav.dashboard' },
      { path: '/saisie',          Icon: IconPen,       key: 'nav.saisie'    },
    ],
  },
  {
    label: 'Rapports',
    items: [
      { path: '/tresorerie',      Icon: IconWallet,    key: 'nav.tresorerie' },
      { path: '/compte-resultat', Icon: IconTrend,     key: 'nav.resultat'   },
      { path: '/bilan',           Icon: IconBook,      key: 'nav.bilan'      },
      { path: '/journal',         Icon: IconFile,      key: 'nav.journal'    },
    ],
  },
  {
    label: 'IA & Outils',
    items: [
      { path: '/correction',              Icon: IconSparkles, key: 'nav.correction',   badge: 'IA' },
      { path: '/indicateurs-financiers',  Icon: IconBarChart, key: 'nav.indicateurs',  badge: 'IA' },
    ],
  },
];

const ALL_ITEMS = SECTIONS.flatMap(s => s.items);

export default function Layout({ children }) {
  const { user, seDeconnecter } = useAuth();
  const { t, lang, setLang, isRTL } = useLanguage();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  const initials = (user?.nom_entreprise || 'U').slice(0, 2).toUpperCase();
  const currentItem = ALL_ITEMS.find(m => m.path === location.pathname);
  const pageLabel   = currentItem ? t(currentItem.key) : 'Dashboard';

  const fontFamily = isRTL ? "'Tajawal', Arial, sans-serif" : "'Plus Jakarta Sans', system-ui, sans-serif";

  return (
    <div style={{ ...s.shell, direction: isRTL ? 'rtl' : 'ltr', fontFamily }}>

      {/* ════════════════════════════════
            SIDEBAR
          ════════════════════════════════ */}
      <aside style={{ ...s.sidebar, width: open ? 260 : 68 }}>

        {/* Logo */}
        <div style={s.logoWrap}>
          <div style={s.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 3h7v7H3z" fill="#60A5FA" />
              <path d="M14 3h7v7h-7z" fill="#818CF8" opacity=".8"/>
              <path d="M3 14h7v7H3z" fill="#34D399" opacity=".9"/>
              <path d="M14 14h7v7h-7z" fill="#F59E0B" opacity=".8"/>
            </svg>
          </div>
          {open && <span style={s.logoText}>Auto-Compta</span>}
        </div>

        {/* Navigation */}
        <nav style={s.nav}>
          {SECTIONS.map((section, si) => (
            <div key={si} style={s.section}>
              {open && (
                <div style={s.sectionLabel}>{section.label}</div>
              )}
              {section.items.map(({ path, Icon, key, badge }) => {
                const active = location.pathname === path;
                return (
                  <Link
                    key={path} to={path}
                    className="nav-item"
                    title={!open ? t(key) : undefined}
                    style={{
                      ...s.navItem,
                      ...(active ? s.navItemActive : {}),
                      justifyContent: open ? 'flex-start' : 'center',
                    }}
                  >
                    {active && (
                      <span style={{
                        ...s.activeBar,
                        [isRTL ? 'right' : 'left']: 0,
                      }} />
                    )}
                    <span style={{ ...s.navIcon, ...(active ? s.navIconActive : {}) }}>
                      <Icon size={17} />
                    </span>
                    {open && (
                      <>
                        <span style={{ ...s.navLabel, ...(active ? s.navLabelActive : {}) }}>
                          {t(key)}
                        </span>
                        {badge && !active && (
                          <span style={s.iaBadge}>{badge}</span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Divider */}
        <div style={s.divider} />

        {/* User */}
        <div style={{ ...s.userRow, justifyContent: open ? 'flex-start' : 'center' }}>
          <div style={s.avatar}>{initials}</div>
          {open && (
            <div style={s.userInfo}>
              <div style={s.userName}>{user?.nom_entreprise || 'Entreprise'}</div>
              <div style={s.userSector}>{user?.secteur || t('nav.entreprise')}</div>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={seDeconnecter}
          title={t('nav.deconnexion')}
          style={{ ...s.logoutBtn, justifyContent: open ? 'flex-start' : 'center', padding: open ? '9px 14px' : '9px' }}
        >
          <IconLogOut size={15} color="rgba(255,255,255,0.35)" />
          {open && <span>{t('nav.deconnexion')}</span>}
        </button>

        {/* Collapse toggle */}
        <button onClick={() => setOpen(!open)} style={s.toggleBtn} title="Réduire le menu">
          {open
            ? (isRTL ? <IconChevronRight size={13} color="rgba(255,255,255,0.35)" />
                     : <IconChevronLeft  size={13} color="rgba(255,255,255,0.35)" />)
            : (isRTL ? <IconChevronLeft  size={13} color="rgba(255,255,255,0.35)" />
                     : <IconChevronRight size={13} color="rgba(255,255,255,0.35)" />)}
        </button>
      </aside>

      {/* ════════════════════════════════
            MAIN AREA
          ════════════════════════════════ */}
      <div style={s.main}>

        {/* Topbar */}
        <header style={s.topbar}>
          <div style={s.topbarLeft}>
            {/* Breadcrumb */}
            <div style={s.breadcrumb}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C5CEDF" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span style={s.breadcrumbApp}>Auto-Compta</span>
              <span style={s.breadcrumbSep}>/</span>
              <span style={{ ...s.breadcrumbPage, fontFamily }}>{pageLabel}</span>
            </div>
          </div>

          <div style={s.topbarRight}>
            {/* Lang toggle */}
            <div style={s.langGroup}>
              {['fr', 'ar'].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  style={{ ...s.langBtn, ...(lang === l ? s.langBtnOn : {}) }}>
                  {l === 'fr' ? 'FR' : 'ع'}
                </button>
              ))}
            </div>

            {/* Notification bell */}
            <button style={s.iconBtn} title="Notifications">
              <IconBell size={16} color="var(--text-3)" />
            </button>

            {/* Avatar */}
            <div style={s.topAvatar} title={user?.nom_entreprise}>
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ ...s.content, fontFamily }} className="fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}

const s = {
  shell: { display: 'flex', minHeight: '100vh', background: 'var(--bg)' },

  /* ── Sidebar ── */
  sidebar: {
    background: '#0C1220',
    backgroundImage: 'radial-gradient(ellipse at 0% 0%, rgba(37,99,235,0.08) 0%, transparent 60%), radial-gradient(ellipse at 100% 100%, rgba(124,58,237,0.06) 0%, transparent 60%)',
    display: 'flex', flexDirection: 'column',
    minHeight: '100vh', position: 'sticky', top: 0, alignSelf: 'flex-start',
    transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
    overflow: 'hidden', flexShrink: 0, zIndex: 100,
    boxShadow: '1px 0 0 rgba(255,255,255,0.05)',
  },

  logoWrap: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '22px 16px 18px', overflow: 'hidden',
  },
  logoIcon: {
    width: 38, height: 38, borderRadius: 11, flexShrink: 0,
    background: 'rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
  },
  logoText: {
    color: '#fff', fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em',
    whiteSpace: 'nowrap', overflow: 'hidden',
  },

  nav: { padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: 0 },

  section: { marginBottom: 6 },

  sectionLabel: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)',
    padding: '12px 10px 6px', whiteSpace: 'nowrap', userSelect: 'none',
  },

  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 10px', borderRadius: 9,
    color: 'rgba(255,255,255,0.45)', fontSize: 13.5, fontWeight: 500,
    position: 'relative', whiteSpace: 'nowrap',
    cursor: 'pointer', textDecoration: 'none',
    marginBottom: 1,
  },

  navItemActive: {
    background: 'rgba(59,130,246,0.16)',
    color: '#fff',
    boxShadow: 'inset 0 0 0 1px rgba(59,130,246,0.2)',
  },

  activeBar: {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: 3, height: 22, borderRadius: 99,
    background: 'linear-gradient(180deg, #60A5FA, #818CF8)',
    boxShadow: '0 0 10px rgba(96,165,250,0.6)',
  },

  navIcon: { display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.35)', flexShrink: 0 },
  navIconActive: { color: '#93C5FD' },
  navLabel: { flex: 1 },
  navLabelActive: { fontWeight: 700, color: '#fff' },

  iaBadge: {
    fontSize: 9, fontWeight: 800, letterSpacing: '0.06em',
    background: 'rgba(139,92,246,0.3)', color: '#C4B5FD',
    border: '1px solid rgba(139,92,246,0.35)',
    padding: '1px 6px', borderRadius: 5, flexShrink: 0,
  },

  divider: { height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 12px' },

  userRow: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px 6px', overflow: 'hidden',
  },
  avatar: {
    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
    background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
    color: '#fff', fontWeight: 800, fontSize: 12.5,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    letterSpacing: '0.04em', boxShadow: '0 2px 8px rgba(37,99,235,0.4)',
  },
  userInfo: { overflow: 'hidden', minWidth: 0 },
  userName: {
    color: '#fff', fontWeight: 700, fontSize: 13,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  userSector: {
    color: 'rgba(255,255,255,0.3)', fontSize: 11,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1,
  },

  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    margin: '4px 10px 8px', padding: '9px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 9, color: 'rgba(255,255,255,0.35)',
    fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
    overflow: 'hidden', width: 'calc(100% - 20px)',
  },

  toggleBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 14px', width: 30, height: 30,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s',
  },

  /* ── Main ── */
  main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' },

  topbar: {
    background: '#fff',
    borderBottom: '1px solid var(--border)',
    padding: '0 28px', height: 60,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    position: 'sticky', top: 0, zIndex: 50,
    boxShadow: '0 1px 12px rgba(13,21,38,0.06)',
  },

  topbarLeft: { display: 'flex', alignItems: 'center', gap: 12 },

  breadcrumb: { display: 'flex', alignItems: 'center', gap: 8 },
  breadcrumbApp:  { fontSize: 13, fontWeight: 500, color: 'var(--text-4)' },
  breadcrumbSep:  { fontSize: 14, color: 'var(--text-4)', fontWeight: 300 },
  breadcrumbPage: { fontSize: 14, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.01em' },

  topbarRight: { display: 'flex', alignItems: 'center', gap: 8 },

  langGroup: {
    display: 'flex', background: '#F1F5FB', borderRadius: 9, padding: 3, gap: 2,
  },
  langBtn: {
    padding: '4px 12px', borderRadius: 7, border: 'none',
    background: 'transparent', color: 'var(--text-3)',
    fontSize: 12, fontWeight: 700, cursor: 'pointer',
    transition: 'all 0.15s', letterSpacing: '0.02em',
  },
  langBtnOn: {
    background: '#fff', color: 'var(--primary)',
    boxShadow: '0 1px 5px rgba(0,0,0,0.12)',
  },

  iconBtn: {
    width: 36, height: 36, borderRadius: 9,
    background: 'transparent', border: '1.5px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.15s',
  },

  topAvatar: {
    width: 34, height: 34, borderRadius: 10,
    background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
    color: '#fff', fontWeight: 800, fontSize: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    letterSpacing: '0.04em', cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
  },

  content: { padding: '32px 30px 48px', flex: 1 },
};
