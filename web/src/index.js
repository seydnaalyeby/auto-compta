import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const style = document.createElement('style');
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --primary: #2563EB;
    --primary-dark: #1D4ED8;
    --primary-light: #EFF6FF;
    --primary-gradient: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);
    --success: #059669;
    --success-light: #ECFDF5;
    --success-dark: #047857;
    --danger: #DC2626;
    --danger-light: #FEF2F2;
    --danger-dark: #B91C1C;
    --warning: #D97706;
    --warning-light: #FFFBEB;
    --warning-dark: #92400E;
    --purple: #7C3AED;
    --purple-light: #F5F3FF;
    --teal: #0891B2;
    --teal-light: #ECFEFF;
    --sidebar: #0F172A;
    --sidebar-hover: rgba(255,255,255,0.05);
    --sidebar-active: rgba(37,99,235,0.18);
    --bg: #F1F5F9;
    --card: #FFFFFF;
    --border: #E2E8F0;
    --border-light: #F1F5F9;
    --text-1: #0F172A;
    --text-2: #475569;
    --text-3: #94A3B8;
    --text-4: #CBD5E1;
    --shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
    --shadow: 0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
    --shadow-md: 0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
    --shadow-lg: 0 16px 48px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06);
    --shadow-primary: 0 4px 16px rgba(37,99,235,0.28);
    --radius-xs: 6px;
    --radius-sm: 8px;
    --radius: 12px;
    --radius-lg: 16px;
    --radius-xl: 20px;
    --transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--bg);
    color: var(--text-1);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-size: 14px;
    line-height: 1.5;
  }

  a { text-decoration: none; color: inherit; }
  button, input, textarea, select { font-family: inherit; font-size: inherit; }
  button { cursor: pointer; border: none; background: none; }
  input:focus, textarea:focus, select:focus { outline: none; }

  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }

  /* ── Animations ── */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideLeft {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  @keyframes shimmer {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .fade-in  { animation: fadeIn  0.35s cubic-bezier(0.4,0,0.2,1) both; }
  .slide-in { animation: slideLeft 0.3s cubic-bezier(0.4,0,0.2,1) both; }

  /* ── Spinner ── */
  .spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.65s linear infinite;
    display: inline-block; vertical-align: middle;
    flex-shrink: 0;
  }
  .spinner-dark {
    border-color: rgba(37,99,235,0.2);
    border-top-color: #2563EB;
  }

  /* ── Skeleton loader ── */
  .skeleton {
    position: relative; overflow: hidden;
    background: #E2E8F0; border-radius: 6px;
  }
  .skeleton::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%);
    animation: shimmer 1.5s ease infinite;
  }

  /* ── Interactive classes (hover via CSS, not inline) ── */
  .card-hover { transition: transform var(--transition), box-shadow var(--transition); }
  .card-hover:hover { transform: translateY(-2px); box-shadow: var(--shadow-md) !important; }

  .row-hover:hover { background: #F8FAFC !important; cursor: default; }

  .quick-card:hover {
    box-shadow: 0 6px 20px rgba(37,99,235,0.1) !important;
    transform: translateY(-1px);
    border-color: #BFDBFE !important;
  }
  .quick-card { transition: all var(--transition-fast); }

  .nav-item:hover { background: var(--sidebar-hover) !important; color: rgba(255,255,255,0.8) !important; }

  .input-field {
    padding: 10px 13px;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 14px;
    color: var(--text-1);
    background: #FAFBFC;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    width: 100%;
  }
  .input-field:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    background: #fff;
  }

  .select-field {
    padding: 8px 32px 8px 12px;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 13.5px;
    color: var(--text-1);
    background: #fff;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    font-weight: 500;
    transition: border-color var(--transition-fast);
  }
  .select-field:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

  .example-chip:hover { background: #F0F4FF !important; border-color: #BFDBFE !important; }
  .example-chip { transition: background var(--transition-fast), border-color var(--transition-fast); }

  .btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 10px 18px;
    background: var(--primary-gradient);
    color: #fff; border: none; border-radius: 10px;
    font-weight: 600; font-size: 14px; cursor: pointer;
    box-shadow: var(--shadow-primary);
    transition: opacity var(--transition-fast), transform var(--transition-fast);
    white-space: nowrap;
  }
  .btn-primary:hover { opacity: 0.92; transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .btn-ghost {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 8px 14px;
    background: transparent; color: var(--text-2);
    border: 1.5px solid var(--border); border-radius: var(--radius-sm);
    font-weight: 500; font-size: 13.5px; cursor: pointer;
    transition: background var(--transition-fast), border-color var(--transition-fast);
  }
  .btn-ghost:hover { background: var(--bg); border-color: #CBD5E1; color: var(--text-1); }

  .tag {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 99px;
    font-size: 11.5px; font-weight: 600; letter-spacing: 0.01em;
  }
  .tag-success { background: var(--success-light); color: var(--success); }
  .tag-danger  { background: var(--danger-light);  color: var(--danger); }
  .tag-warning { background: var(--warning-light); color: var(--warning-dark); }
  .tag-primary { background: var(--primary-light); color: var(--primary); }
  .tag-purple  { background: var(--purple-light);  color: var(--purple); }
  .tag-teal    { background: var(--teal-light);    color: var(--teal); }
  .tag-gray    { background: #F8FAFC;              color: var(--text-2); }

  /* Upload zone */
  .upload-zone {
    border: 2px dashed #CBD5E1; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    transition: border-color var(--transition-fast), background var(--transition-fast);
    cursor: pointer;
  }
  .upload-zone:hover { border-color: var(--primary); background: var(--primary-light); }

  /* Table row hover */
  .trow:hover td { background: #F8FAFC; }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
