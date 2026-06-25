import React, { useEffect, useState } from 'react';
import { getDashboard } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import {
  IconPlus, IconWallet, IconTrend, IconBook,
  IconSparkles, IconArrowUpRight, IconArrowDownRight, IconBarChart
} from '../Icons';

const fmt = n => Number(n || 0).toLocaleString('fr-FR');

/* ──────────────── Stat Card ──────────────── */
function StatCard({ label, value, isMoney = true, accentColor, gradient, Icon, positive, delay = 0 }) {
  const isPositive = positive === undefined ? value >= 0 : positive;
  const up   = isPositive;
  const color = up ? '#059669' : '#DC2626';

  return (
    <div style={{ ...s.kpiCard, borderTop: `3px solid ${accentColor}`, animationDelay: `${delay}ms` }}
      className="card-hover fade-in">
      <div style={s.kpiTop}>
        <div style={{ ...s.kpiIconWrap, background: gradient }}>
          <Icon size={18} color="#fff" />
        </div>
        {isMoney && (
          <span style={{
            ...s.kpiTrend,
            color,
            background: up ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${up ? '#A7F3D0' : '#FECACA'}`,
          }}>
            {up ? <IconArrowUpRight size={11} color={color} /> : <IconArrowDownRight size={11} color={color} />}
            {up ? '+' : '–'}
          </span>
        )}
      </div>
      <div style={s.kpiValue}>{isMoney ? `${fmt(value)} MRU` : fmt(value)}</div>
      <div style={s.kpiLabel}>{label}</div>
    </div>
  );
}

/* ──────────────── Quick Card ──────────────── */
function QuickCard({ icon: Icon, label, path, color, bg, border, onClick }) {
  return (
    <button onClick={onClick}
      className="quick-card"
      style={{ ...s.quickCard, border: `1.5px solid ${border}` }}>
      <div style={{ ...s.quickIconWrap, background: bg }}>
        <Icon size={21} color={color} />
      </div>
      <span style={s.quickLabel}>{label}</span>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" style={{ marginTop: 'auto', opacity: 0.5 }}>
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </button>
  );
}

export default function Dashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t }    = useLanguage();
  const navigate  = useNavigate();

  useEffect(() => {
    getDashboard()
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const ops   = data?.dernieres_operations || [];

  const TYPE_COLORS = {
    vente:        { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0', label: t('dash.type_vente') },
    achat:        { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA', label: t('dash.type_achat') },
    paiement:     { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA', label: t('dash.type_paiement') },
    encaissement: { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0', label: t('dash.type_encaiss') },
    salaire:      { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A', label: t('dash.type_salaire') },
    loyer:        { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA', label: t('dash.type_loyer') },
    impot:        { bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE', label: t('dash.type_impot') },
    autre:        { bg: '#F8FAFC', color: '#475569', border: '#E2E8F0', label: t('dash.type_autre') },
  };

  const QUICK = [
    { icon: IconWallet,   label: t('dash.quick_treso'),    path: '/tresorerie',            color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
    { icon: IconTrend,    label: t('dash.quick_resultat'), path: '/compte-resultat',        color: '#047857', bg: '#ECFDF5', border: '#A7F3D0' },
    { icon: IconBook,     label: t('dash.quick_bilan'),    path: '/bilan',                  color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE' },
    { icon: IconSparkles, label: t('dash.quick_correc'),   path: '/correction',             color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
    { icon: IconBarChart, label: t('dash.quick_indic'),    path: '/indicateurs-financiers', color: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC' },
  ];

  const now = new Date();
  const greetingHour = now.getHours();
  const greeting = greetingHour < 12 ? 'Bonjour' : greetingHour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) return (
    <div className="loading-wrap">
      <div className="loading-card">
        <div className="loading-dot" />
        <span style={{ color: 'var(--text-2)', fontWeight: 600, fontSize: 13.5 }}>{t('dash.loading')}</span>
      </div>
    </div>
  );

  return (
    <div>
      {/* ══ Hero Welcome Banner ══ */}
      <div style={s.hero} className="fade-up">
        <div style={s.heroDecor1} />
        <div style={s.heroDecor2} />
        <div style={s.heroDecor3} />
        <div style={s.heroLeft}>
          <div style={s.heroGreeting}>{greeting} 👋</div>
          <h1 style={s.heroTitle}>
            {user?.nom_entreprise || 'Votre Entreprise'}
          </h1>
          <p style={s.heroSub}>
            {dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}
          </p>
          <div style={s.heroBadges}>
            <span style={s.heroBadge}>Plan Comptable BCM 1988</span>
            <span style={s.heroBadge}>MRU · Mauritanie</span>
          </div>
        </div>
        <div style={s.heroRight}>
          <button onClick={() => navigate('/saisie')} style={s.heroBtn}>
            <IconPlus size={16} color="#1D4ED8" />
            {t('dash.new_op')}
          </button>
          <div style={s.heroStat}>
            <span style={s.heroStatNum}>{fmt(stats.total_operations || 0)}</span>
            <span style={s.heroStatLabel}>{t('dash.total_ops')}</span>
          </div>
        </div>
      </div>

      {/* ══ KPI Cards ══ */}
      <div style={s.kpiGrid}>
        <StatCard label={t('dash.sales_month')}    value={stats.ventes_mois}   accentColor="#2563EB" gradient="linear-gradient(135deg,#2563EB,#60A5FA)" Icon={IconTrend}    positive={true}  delay={0}   />
        <StatCard label={t('dash.expenses_month')} value={stats.depenses_mois} accentColor="#DC2626" gradient="linear-gradient(135deg,#DC2626,#F87171)" Icon={IconWallet}   positive={false} delay={60}  />
        <StatCard label={t('dash.net_result')}     value={stats.resultat_mois} accentColor={stats.resultat_mois >= 0 ? '#059669' : '#DC2626'} gradient={stats.resultat_mois >= 0 ? 'linear-gradient(135deg,#059669,#34D399)' : 'linear-gradient(135deg,#DC2626,#F87171)'} Icon={IconBarChart} delay={120} />
        <StatCard label={t('dash.total_ops')}      value={stats.total_operations} isMoney={false} accentColor="#7C3AED" gradient="linear-gradient(135deg,#7C3AED,#A78BFA)" Icon={IconBook} positive={true} delay={180} />
      </div>

      {/* ══ Quick Access ══ */}
      <section style={s.section}>
        <div style={s.sectionHead}>
          <h2 style={s.sectionTitle}>{t('dash.quick_access')}</h2>
          <div style={s.sectionLine} />
        </div>
        <div style={s.quickGrid}>
          {QUICK.map(q => (
            <QuickCard key={q.path} {...q} onClick={() => navigate(q.path)} />
          ))}
        </div>
      </section>

      {/* ══ Recent Operations ══ */}
      <section style={s.tableCard}>
        <div style={s.tableHeader}>
          <div>
            <h2 style={s.sectionTitle}>{t('dash.last_ops')}</h2>
            <p style={s.sectionSub}>{ops.length} opération{ops.length !== 1 ? 's' : ''} récente{ops.length !== 1 ? 's' : ''}</p>
          </div>
          {ops.length > 0 && (
            <button onClick={() => navigate('/journal')} style={s.viewAllBtn}>
              {t('common.see_all')}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          )}
        </div>

        {ops.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIllus}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#B0BAD0" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <path d="M16 2v4M8 2v4M3 10h18"/>
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
              </svg>
            </div>
            <p style={s.emptyTitle}>{t('dash.no_ops')}</p>
            <p style={s.emptyText}>{t('dash.no_ops_sub')}</p>
            <button onClick={() => navigate('/saisie')} className="btn-primary" style={{ marginTop: 8 }}>
              <IconPlus size={15} color="#fff" />{t('dash.first_op')}
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>{t('common.date')}</th>
                  <th style={s.th}>{t('dash.description')}</th>
                  <th style={s.th}>{t('common.type')}</th>
                  <th style={s.th}>{t('dash.method')}</th>
                  <th style={{ ...s.th, textAlign: 'right' }}>{t('common.amount')}</th>
                </tr>
              </thead>
              <tbody>
                {ops.map((op, i) => {
                  const tc = TYPE_COLORS[op.type_operation] || TYPE_COLORS.autre;
                  const isRevenu = ['vente', 'encaissement'].includes(op.type_operation);
                  return (
                    <tr key={op.id} className="trow" style={{ background: i % 2 === 0 ? '#fff' : '#FAFBFE' }}>
                      <td style={s.td}>
                        <span style={s.dateCell}>{op.date_operation}</span>
                      </td>
                      <td style={s.td}>
                        <span style={s.descCell}>{op.description || op.texte_original}</span>
                      </td>
                      <td style={s.td}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '3px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 700,
                          background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`,
                        }}>
                          {tc.label}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{ textTransform: 'capitalize', color: 'var(--text-2)', fontSize: 13 }}>
                          {op.moyen_paiement}
                        </span>
                      </td>
                      <td style={{ ...s.td, textAlign: 'right' }}>
                        <span style={{
                          fontWeight: 800, fontSize: 13.5,
                          fontVariantNumeric: 'tabular-nums',
                          color: isRevenu ? '#059669' : '#DC2626',
                        }}>
                          {isRevenu ? '+' : '–'}{fmt(op.montant)} MRU
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const s = {
  /* ── Hero ── */
  hero: {
    background: 'linear-gradient(135deg, #0D1B34 0%, #122040 40%, #1a336a 75%, #1D4ED8 100%)',
    borderRadius: 22, padding: '32px 36px',
    marginBottom: 28, position: 'relative', overflow: 'hidden',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24,
    boxShadow: '0 8px 40px rgba(13,21,52,0.3)',
  },
  heroDecor1: {
    position: 'absolute', top: -80, right: -80, width: 260, height: 260,
    borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
  },
  heroDecor2: {
    position: 'absolute', bottom: -60, left: '30%', width: 180, height: 180,
    borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none',
  },
  heroDecor3: {
    position: 'absolute', top: '30%', right: '20%', width: 10, height: 10,
    borderRadius: '50%', background: 'rgba(255,255,255,0.2)', pointerEvents: 'none',
  },
  heroLeft:    { position: 'relative', zIndex: 2 },
  heroGreeting:{ fontSize: 13.5, color: 'rgba(255,255,255,0.55)', fontWeight: 600, marginBottom: 6 },
  heroTitle:   { fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 8 },
  heroSub:     { fontSize: 13.5, color: 'rgba(255,255,255,0.45)', marginBottom: 16 },
  heroBadges:  { display: 'flex', gap: 8, flexWrap: 'wrap' },
  heroBadge: {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.5)', padding: '4px 12px', borderRadius: 99,
  },
  heroRight: {
    position: 'relative', zIndex: 2,
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16, flexShrink: 0,
  },
  heroBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: '#fff', color: '#1D4ED8',
    border: 'none', borderRadius: 11, padding: '11px 22px',
    fontSize: 14, fontWeight: 800, cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
    transition: 'transform 0.15s, box-shadow 0.15s',
    letterSpacing: '-0.01em',
  },
  heroStat: { textAlign: 'right' },
  heroStatNum:   { display: 'block', fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
  heroStatLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: 4, display: 'block' },

  /* ── KPI Cards ── */
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16, marginBottom: 28,
  },
  kpiCard: {
    background: 'var(--card)', borderRadius: 'var(--r-lg)',
    padding: '22px 24px', boxShadow: 'var(--shadow-card)',
    border: '1px solid var(--border)', overflow: 'hidden',
  },
  kpiTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  kpiIconWrap: {
    width: 42, height: 42, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
  },
  kpiTrend: {
    display: 'inline-flex', alignItems: 'center', gap: 3,
    padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 800,
  },
  kpiValue: {
    fontSize: 24, fontWeight: 900, color: 'var(--text-1)',
    letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums',
    marginBottom: 8,
  },
  kpiLabel: { fontSize: 12.5, color: 'var(--text-3)', fontWeight: 600 },

  /* ── Section headers ── */
  section: { marginBottom: 28 },
  sectionHead: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.01em', whiteSpace: 'nowrap' },
  sectionSub:   { fontSize: 12, color: 'var(--text-3)', marginTop: 3 },
  sectionLine:  { flex: 1, height: 1, background: 'var(--border)' },

  /* ── Quick cards ── */
  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: 12,
  },
  quickCard: {
    background: 'var(--card)', borderRadius: 'var(--r-lg)',
    padding: '20px 16px 16px', display: 'flex',
    flexDirection: 'column', alignItems: 'center', gap: 10,
    cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
    minHeight: 130,
  },
  quickIconWrap: {
    width: 50, height: 50, borderRadius: 15,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 12.5, fontWeight: 700, color: 'var(--text-2)',
    textAlign: 'center', lineHeight: 1.3,
  },

  /* ── Operations table card ── */
  tableCard: {
    background: 'var(--card)', borderRadius: 'var(--r-lg)',
    boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 24px 16px', borderBottom: '1px solid var(--border)',
  },
  viewAllBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    color: 'var(--primary)', fontSize: 13, fontWeight: 700,
    background: 'var(--primary-light)', border: '1px solid #BFDBFE',
    borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
    transition: 'all 0.15s',
  },

  /* ── Empty ── */
  empty: {
    padding: '60px 24px', textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
  },
  emptyIllus: {
    width: 72, height: 72, borderRadius: 20,
    background: '#F1F5FB', border: '2px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { fontSize: 16, fontWeight: 800, color: 'var(--text-1)' },
  emptyText:  { fontSize: 13, color: 'var(--text-3)', maxWidth: 320, lineHeight: 1.6 },

  /* ── Table ── */
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#F8FAFD' },
  th: {
    padding: '11px 20px', textAlign: 'left',
    fontSize: 10.5, fontWeight: 800, color: 'var(--text-3)',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    borderBottom: '1.5px solid var(--border)', whiteSpace: 'nowrap',
  },
  td: {
    padding: '14px 20px', fontSize: 13.5, color: 'var(--text-2)',
    borderBottom: '1px solid var(--border-light)', verticalAlign: 'middle',
  },
  dateCell: {
    color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums',
    fontSize: 12.5, fontWeight: 600,
  },
  descCell: {
    color: 'var(--text-1)', fontWeight: 600,
    maxWidth: 280, overflow: 'hidden',
    textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block',
  },
};
