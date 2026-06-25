import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Tajawal:wght@400;500;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    /* ── Brand ── */
    --primary:        #2563EB;
    --primary-dark:   #1D4ED8;
    --primary-deeper: #1E3A8A;
    --primary-mid:    #3B82F6;
    --primary-light:  #EFF6FF;
    --primary-glow:   rgba(37,99,235,0.18);
    --primary-gradient: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);

    /* ── Mauritanian Gold ── */
    --gold:         #B45309;
    --gold-mid:     #D97706;
    --gold-light:   #FFFBEB;
    --gold-border:  #FDE68A;

    /* ── Status ── */
    --success:       #059669;
    --success-light: #ECFDF5;
    --success-dark:  #047857;
    --success-mid:   #10B981;
    --danger:        #DC2626;
    --danger-light:  #FEF2F2;
    --danger-dark:   #B91C1C;
    --warning:       #D97706;
    --warning-light: #FFFBEB;
    --warning-dark:  #92400E;
    --purple:        #7C3AED;
    --purple-mid:    #8B5CF6;
    --purple-light:  #F5F3FF;
    --teal:          #0891B2;
    --teal-light:    #ECFEFF;

    /* ── Layout ── */
    --sidebar-bg:      #0C1220;
    --sidebar-border:  rgba(255,255,255,0.06);
    --sidebar-hover:   rgba(255,255,255,0.06);
    --sidebar-active:  rgba(59,130,246,0.18);
    --sidebar-section: rgba(255,255,255,0.25);

    --bg:           #F5F7FD;
    --bg-alt:       #EEF2FB;
    --card:         #FFFFFF;
    --border:       #E8EDF5;
    --border-light: #F1F5FB;
    --border-focus: #3B82F6;

    /* ── Typography ── */
    --text-1: #0D1526;
    --text-2: #445069;
    --text-3: #8A96B0;
    --text-4: #C5CEDF;
    --font:   'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-ar:'Tajawal', Arial, sans-serif;
    --font-mono: 'SF Mono', 'Fira Code', 'Consolas', monospace;

    /* ── Shadows ── */
    --shadow-xs:      0 1px 2px rgba(13,21,38,0.05);
    --shadow-sm:      0 1px 3px rgba(13,21,38,0.06), 0 2px 6px rgba(13,21,38,0.04);
    --shadow:         0 2px 8px rgba(13,21,38,0.07), 0 4px 16px rgba(13,21,38,0.05);
    --shadow-md:      0 4px 20px rgba(13,21,38,0.10), 0 8px 32px rgba(13,21,38,0.06);
    --shadow-lg:      0 12px 48px rgba(13,21,38,0.14), 0 4px 16px rgba(13,21,38,0.08);
    --shadow-card:    0 1px 2px rgba(13,21,38,0.05), 0 4px 20px rgba(13,21,38,0.07);
    --shadow-blue:    0 4px 20px rgba(37,99,235,0.25);
    --shadow-inset:   inset 0 1px 3px rgba(0,0,0,0.06);

    /* ── Radii ── */
    --r-xs:  4px;
    --r-sm:  8px;
    --r:     12px;
    --r-md:  14px;
    --r-lg:  18px;
    --r-xl:  22px;
    --r-2xl: 28px;
    --r-full: 999px;

    /* ── Transitions ── */
    --ease:        cubic-bezier(0.4, 0, 0.2, 1);
    --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    --t-fast:  0.13s;
    --t:       0.2s;
    --t-slow:  0.32s;
  }

  html { scroll-behavior: smooth; font-size: 15px; }

  body {
    font-family: var(--font);
    background: var(--bg);
    color: var(--text-1);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.55;
    font-size: 0.9rem;
  }

  a { text-decoration: none; color: inherit; }
  button, input, textarea, select { font-family: inherit; }
  button { cursor: pointer; border: none; background: none; }
  input:focus, textarea:focus, select:focus { outline: none; }
  img, video { display: block; max-width: 100%; }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #D0D6E4; border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: #B0BAD0; }

  /* ── Keyframes ── */
  @keyframes fadeUp    { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
  @keyframes fadeIn    { from { opacity:0; transform:translateY(6px)  } to { opacity:1; transform:translateY(0) } }
  @keyframes slideLeft { from { opacity:0; transform:translateX(-16px)} to { opacity:1; transform:translateX(0)  } }
  @keyframes scaleIn   { from { opacity:0; transform:scale(0.94)      } to { opacity:1; transform:scale(1)      } }
  @keyframes spin      { to { transform: rotate(360deg); } }
  @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes shimmer   { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
  @keyframes ripple    { to { transform:scale(2.5); opacity:0; } }
  @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }

  .fade-in   { animation: fadeIn   0.3s  var(--ease) both; }
  .fade-up   { animation: fadeUp   0.4s  var(--ease) both; }
  .slide-in  { animation: slideLeft 0.28s var(--ease) both; }
  .scale-in  { animation: scaleIn  0.22s var(--ease-spring) both; }

  /* ── Spinner ── */
  .spinner {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2.5px solid rgba(255,255,255,0.25);
    border-top-color: #fff;
    animation: spin 0.65s linear infinite;
    display: inline-flex; flex-shrink: 0;
  }
  .spinner-dark { border-color: rgba(37,99,235,0.18); border-top-color: var(--primary); }

  /* ── Skeleton shimmer ── */
  .skeleton {
    position: relative; overflow: hidden;
    background: #E6EAF4; border-radius: 8px;
  }
  .skeleton::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%);
    animation: shimmer 1.8s ease infinite;
  }

  /* ── Nav item ── */
  .nav-item { transition: background var(--t-fast) var(--ease), color var(--t-fast) var(--ease); }
  .nav-item:hover { background: var(--sidebar-hover) !important; color: rgba(255,255,255,0.85) !important; }

  /* ── Card hover ── */
  .card-hover { transition: transform var(--t) var(--ease), box-shadow var(--t) var(--ease); }
  .card-hover:hover { transform: translateY(-2px); box-shadow: var(--shadow-md) !important; }

  /* ── Table row ── */
  .trow { transition: background var(--t-fast); }
  .trow:hover td, .trow:hover th { background: #F5F8FF !important; }

  /* ── Quick card ── */
  .quick-card { transition: all var(--t) var(--ease); }
  .quick-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(37,99,235,0.14) !important; border-color: #93C5FD !important; }

  /* ── Example chip ── */
  .example-chip { transition: all var(--t-fast) var(--ease); }
  .example-chip:hover { background: #EFF6FF !important; border-color: #93C5FD !important; color: var(--primary) !important; transform: translateX(4px); }

  /* ── Upload zone ── */
  .upload-zone {
    border: 2px dashed #C4CDD9; border-radius: var(--r-lg);
    display: flex; align-items: center; justify-content: center;
    transition: all var(--t) var(--ease); cursor: pointer;
    background: #FAFBFE;
  }
  .upload-zone:hover { border-color: var(--primary); background: var(--primary-light); transform: scale(1.007); }

  /* ── Loading ── */
  .loading-wrap { display: flex; align-items: center; justify-content: center; min-height: 360px; }
  .loading-card {
    display: inline-flex; align-items: center; gap: 12px;
    background: var(--card); border-radius: var(--r-md);
    padding: 18px 28px; box-shadow: var(--shadow-md); border: 1px solid var(--border);
  }
  .loading-dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: var(--primary); animation: pulse 1.3s ease infinite; flex-shrink: 0;
  }

  /* ── Input ── */
  .input-field {
    width: 100%; padding: 10px 14px;
    border: 1.5px solid var(--border);
    border-radius: var(--r-sm);
    font-size: 14px; color: var(--text-1);
    background: #FAFBFE;
    transition: border-color var(--t-fast), box-shadow var(--t-fast), background var(--t-fast);
  }
  .input-field:focus {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px rgba(37,99,235,0.10);
    background: #fff;
  }
  .input-field::placeholder { color: var(--text-4); }

  /* ── Select ── */
  .select-field {
    padding: 9px 34px 9px 13px;
    border: 1.5px solid var(--border); border-radius: var(--r-sm);
    font-size: 13.5px; font-weight: 500; color: var(--text-1);
    background: #fff url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238A96B0' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 10px center;
    appearance: none; -webkit-appearance: none; cursor: pointer;
    transition: border-color var(--t-fast), box-shadow var(--t-fast);
  }
  .select-field:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(37,99,235,0.10); }

  /* ── Buttons ── */
  .btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 10px 22px;
    background: var(--primary-gradient); color: #fff;
    border: none; border-radius: var(--r-sm);
    font-weight: 700; font-size: 13.5px; letter-spacing: -0.01em; white-space: nowrap;
    box-shadow: var(--shadow-blue);
    transition: opacity var(--t-fast), transform var(--t-fast), box-shadow var(--t-fast);
    position: relative; overflow: hidden;
  }
  .btn-primary:hover  { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(37,99,235,0.38); }
  .btn-primary:active { transform: translateY(0); opacity: 1; }
  .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }

  .btn-secondary {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 9px 18px;
    background: var(--card); color: var(--text-2);
    border: 1.5px solid var(--border); border-radius: var(--r-sm);
    font-weight: 600; font-size: 13.5px; cursor: pointer;
    transition: all var(--t-fast); box-shadow: var(--shadow-xs);
  }
  .btn-secondary:hover { background: var(--bg); border-color: #C5CEDF; color: var(--text-1); }

  .btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 16px; background: transparent;
    color: var(--text-2); border: 1.5px solid var(--border);
    border-radius: var(--r-sm); font-weight: 600; font-size: 13px; cursor: pointer;
    transition: all var(--t-fast);
  }
  .btn-ghost:hover { background: var(--bg); border-color: #C5CEDF; color: var(--text-1); }

  .btn-danger {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 14px; background: var(--danger-light); color: var(--danger);
    border: 1.5px solid #FECACA; border-radius: var(--r-sm);
    font-weight: 600; font-size: 13px; cursor: pointer;
    transition: background var(--t-fast);
  }
  .btn-danger:hover { background: #FEE2E2; }

  /* ── Tags / Badges ── */
  .tag {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: var(--r-full);
    font-size: 11.5px; font-weight: 700; letter-spacing: 0.01em;
  }
  .tag-success { background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }
  .tag-danger  { background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; }
  .tag-warning { background: #FFFBEB; color: #92400E; border: 1px solid #FDE68A; }
  .tag-primary { background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE; }
  .tag-purple  { background: #F5F3FF; color: #6D28D9; border: 1px solid #DDD6FE; }
  .tag-teal    { background: #ECFEFF; color: #0E7490; border: 1px solid #A5F3FC; }
  .tag-gray    { background: #F8FAFC; color: var(--text-2); border: 1px solid var(--border); }
  .tag-gold    { background: #FFFBEB; color: #92400E; border: 1px solid #FDE68A; }

  /* ── Pill group (year/month filter) ── */
  .pill-group { display: flex; gap: 3px; background: #E8EDF7; border-radius: 12px; padding: 3px; }
  .pill {
    padding: 7px 16px; border-radius: 10px; border: none;
    background: transparent; font-size: 13px; font-weight: 500;
    color: var(--text-2); cursor: pointer; transition: all var(--t-fast);
  }
  .pill-active {
    background: #fff; color: var(--text-1); font-weight: 700;
    box-shadow: 0 1px 6px rgba(0,0,0,0.10);
  }

  /* ── Amounts ── */
  .amount-pos { color: var(--success); font-weight: 700; font-variant-numeric: tabular-nums; }
  .amount-neg { color: var(--danger);  font-weight: 700; font-variant-numeric: tabular-nums; }
  .amount-neutral { color: var(--text-1); font-weight: 700; font-variant-numeric: tabular-nums; }

  /* ── Account badge ── */
  .account-badge {
    display: inline-block; padding: 3px 10px; border-radius: 7px;
    font-weight: 800; font-size: 12.5px; font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
  }

  /* ── Page hero / welcome banner ── */
  .page-hero {
    border-radius: var(--r-xl); overflow: hidden;
    box-shadow: var(--shadow-md); margin-bottom: 28px;
  }

  /* ── Card base ── */
  .card {
    background: var(--card); border-radius: var(--r-lg);
    border: 1px solid var(--border); box-shadow: var(--shadow-card);
  }

  /* ── Divider ── */
  .divider {
    height: 1px; background: var(--border); margin: 16px 0;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    html { font-size: 14px; }
  }
  @media (max-width: 640px) {
    html { font-size: 13px; }
  }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
