import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  IconDashboard, IconPen, IconWallet, IconTrend, IconBook,
  IconFile, IconSparkles, IconBarChart, IconLogOut,
  IconChevronLeft, IconChevronRight, IconBell
} from './Icons';

const MENU_ITEMS = [
  { path: '/dashboard',               Icon: IconDashboard, key: 'nav.dashboard' },
  { path: '/saisie',                  Icon: IconPen,       key: 'nav.saisie' },
  { path: '/tresorerie',              Icon: IconWallet,    key: 'nav.tresorerie' },
  { path: '/compte-resultat',         Icon: IconTrend,     key: 'nav.resultat' },
  { path: '/bilan',                   Icon: IconBook,      key: 'nav.bilan' },
  { path: '/journal',                 Icon: IconFile,      key: 'nav.journal' },
  { path: '/correction',              Icon: IconSparkles,  key: 'nav.correction' },
  { path: '/indicateurs-financiers',  Icon: IconBarChart,  key: 'nav.indicateurs' },
];

export default function Layout({ children }) {
  const { user, seDeconnecter } = useAuth();
  const { t, lang, setLang, isRTL } = useLanguage();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  const initials = (user?.nom_entreprise || 'U').slice(0, 2).toUpperCase();
  const pageName = MENU_ITEMS.find(m => m.path === location.pathname);
  const pageLabel = pageName ? t(pageName.key) : 'Dashboard';

  const fontFamily = isRTL
    ? "'Tajawal', 'Arial', sans-serif"
    : "'Inter', 'system-ui', sans-serif";

  return (
    <div style={{ ...s.shell, direction: isRTL ? 'rtl' : 'ltr', fontFamily }}>
      {/* ── Sidebar ── */}
      <aside style={{ ...s.sidebar, width: open ? 252 : 72 }}>
        {/* Logo */}
        <div style={s.logoRow}>
          <div style={s.logoBadge}>
            <span style={s.logoLetters}>AC</span>
          </div>
          {open && <span style={s.logoText}>Auto-Compta</span>}
        </div>

        {/* Divider */}
        <div style={s.divider} />

        {/* Nav */}
        <nav style={s.nav}>
          {MENU_ITEMS.map(({ path, Icon, key }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path}
                style={{ ...s.navItem, ...(active ? s.navActive : {}) }}
                title={!open ? t(key) : undefined}
              >
                {active && (
                  <span style={{ ...s.activeBar, [isRTL ? 'right' : 'left']: 0 }} />
                )}
                <span style={{ ...s.navIcon, ...(active ? s.navIconActive : {}) }}>
                  <Icon size={18} />
                </span>
                {open && (
                  <span style={{ ...s.navLabel, ...(active ? s.navLabelActive : {}) }}>
                    {t(key)}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />
        <div style={s.divider} />

        {/* User */}
        <div style={{ ...s.userRow, justifyContent: open ? 'flex-start' : 'center' }}>
          <div style={s.avatar}>{initials}</div>
          {open && (
            <div style={s.userInfo}>
              <div style={s.userName}>{user?.nom_entreprise}</div>
              <div style={s.userSector}>{user?.secteur || t('nav.entreprise')}</div>
            </div>
          )}
        </div>

        {open && (
          <button onClick={seDeconnecter} style={s.logoutBtn}>
            <IconLogOut size={15} color="rgba(255,255,255,0.5)" />
            <span>{t('nav.deconnexion')}</span>
          </button>
        )}
        {!open && (
          <button onClick={seDeconnecter} style={s.logoutBtnCollapsed} title={t('nav.deconnexion')}>
            <IconLogOut size={16} color="rgba(255,255,255,0.5)" />
          </button>
        )}

        {/* Toggle */}
        <button onClick={() => setOpen(!open)} style={s.toggleBtn}>
          {open
            ? (isRTL ? <IconChevronRight size={15} color="rgba(255,255,255,0.4)" />
                     : <IconChevronLeft  size={15} color="rgba(255,255,255,0.4)" />)
            : (isRTL ? <IconChevronLeft  size={15} color="rgba(255,255,255,0.4)" />
                     : <IconChevronRight size={15} color="rgba(255,255,255,0.4)" />)
          }
        </button>
      </aside>

      {/* ── Main ── */}
      <div style={s.main}>
        {/* Topbar */}
        <header style={s.topbar}>
          <div style={s.topbarLeft}>
            <span style={{ ...s.topbarPage, fontFamily }}>{pageLabel}</span>
          </div>
          <div style={s.topbarRight}>
            {/* Language Toggle */}
            <div style={s.langToggle}>
              <button
                onClick={() => setLang('fr')}
                style={{ ...s.langBtn, ...(lang === 'fr' ? s.langBtnActive : {}) }}
              >
                FR
              </button>
              <button
                onClick={() => setLang('ar')}
                style={{ ...s.langBtn, ...(lang === 'ar' ? s.langBtnActive : {}) }}
              >
                ع
              </button>
            </div>
            <button style={s.iconBtn} title="Notifications">
              <IconBell size={18} color="var(--text-2)" />
            </button>
            <div style={s.topbarAvatar}>{initials}</div>
          </div>
        </header>

        {/* Content */}
        <main style={{ ...s.content, fontFamily }} className="fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}

const s = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg)',
  },

  sidebar: {
    background: 'var(--sidebar)',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    position: 'sticky',
    top: 0,
    alignSelf: 'flex-start',
    transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
    overflow: 'hidden',
    flexShrink: 0,
    zIndex: 100,
  },

  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '20px 16px 18px',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
  },
  logoLetters: {
    color: '#fff',
    fontWeight: 800,
    fontSize: 13,
    letterSpacing: '0.05em',
  },
  logoText: {
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    whiteSpace: 'nowrap',
    letterSpacing: '-0.01em',
  },

  divider: {
    height: 1,
    background: 'rgba(255,255,255,0.07)',
    margin: '0 16px',
  },

  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '12px 10px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 9,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13.5,
    fontWeight: 500,
    transition: 'background 0.15s, color 0.15s',
    position: 'relative',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
  navActive: {
    background: 'rgba(37,99,235,0.18)',
    color: '#fff',
  },
  activeBar: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 3,
    height: 18,
    borderRadius: 99,
    background: '#60A5FA',
  },
  navIcon: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    color: 'rgba(255,255,255,0.45)',
  },
  navIconActive: {
    color: '#60A5FA',
  },
  navLabel: {},
  navLabelActive: {
    fontWeight: 600,
  },

  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 14px 8px',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
    color: '#fff',
    fontWeight: 700,
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    letterSpacing: '0.03em',
  },
  userInfo: {
    overflow: 'hidden',
  },
  userName: {
    color: '#fff',
    fontWeight: 600,
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 150,
  },
  userSector: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    whiteSpace: 'nowrap',
  },

  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    margin: '4px 10px 8px',
    padding: '9px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 8,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12.5,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.15s',
    width: 'calc(100% - 20px)',
  },
  logoutBtnCollapsed: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '4px auto 8px',
    padding: 10,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 8,
    cursor: 'pointer',
  },

  toggleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px',
    width: 28,
    height: 28,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 7,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },

  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: '100vh',
  },

  topbar: {
    background: 'var(--card)',
    borderBottom: '1px solid var(--border)',
    padding: '0 28px',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    boxShadow: 'var(--shadow-sm)',
  },
  topbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  topbarPage: {
    fontWeight: 700,
    fontSize: 16,
    color: 'var(--text-1)',
    letterSpacing: '-0.01em',
  },
  topbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },

  langToggle: {
    display: 'flex',
    alignItems: 'center',
    background: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
    gap: 2,
  },
  langBtn: {
    padding: '4px 10px',
    borderRadius: 6,
    border: 'none',
    background: 'transparent',
    color: 'var(--text-3)',
    fontSize: 12.5,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
    letterSpacing: '0.03em',
  },
  langBtnActive: {
    background: '#fff',
    color: 'var(--primary)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 9,
    background: 'transparent',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  topbarAvatar: {
    width: 34,
    height: 34,
    borderRadius: 9,
    background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
    color: '#fff',
    fontWeight: 700,
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    letterSpacing: '0.03em',
  },

  content: {
    padding: '28px 28px',
    flex: 1,
  },
};
