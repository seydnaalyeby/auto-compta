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

function StatCard({ label, value, isMoney = true, gradient, Icon, positive }) {
  const isPositive = positive === undefined ? value >= 0 : positive;
  return (
    <div style={s.card}>
      <div style={s.cardTop}>
        <div style={{ ...s.iconCircle, background: gradient }}>
          <Icon size={18} color="#fff" />
        </div>
        {isMoney && (
          <span style={{ ...s.trend, color: isPositive ? '#059669' : '#DC2626', background: isPositive ? '#ECFDF5' : '#FEF2F2' }}>
            {isPositive
              ? <IconArrowUpRight size={13} color="#059669" />
              : <IconArrowDownRight size={13} color="#DC2626" />
            }
          </span>
        )}
      </div>
      <div style={s.cardValue}>
        {isMoney ? `${fmt(value)} MRU` : fmt(value)}
      </div>
      <div style={s.cardLabel}>{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard()
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const ops   = data?.dernieres_operations || [];

  const TYPE_COLORS = {
    vente:       { bg: '#ECFDF5', color: '#059669', label: t('dash.type_vente') },
    achat:       { bg: '#FEF2F2', color: '#DC2626', label: t('dash.type_achat') },
    paiement:    { bg: '#FEF2F2', color: '#DC2626', label: t('dash.type_paiement') },
    encaissement:{ bg: '#ECFDF5', color: '#059669', label: t('dash.type_encaiss') },
    salaire:     { bg: '#FFFBEB', color: '#D97706', label: t('dash.type_salaire') },
    loyer:       { bg: '#FEF2F2', color: '#DC2626', label: t('dash.type_loyer') },
    impot:       { bg: '#FEF3FF', color: '#9333EA', label: t('dash.type_impot') },
    autre:       { bg: '#F8FAFC', color: '#64748B', label: t('dash.type_autre') },
  };

  const QUICK = [
    { icon: IconWallet,   label: t('dash.quick_treso'),   path: '/tresorerie',             color: '#2563EB', bg: '#EFF6FF' },
    { icon: IconTrend,    label: t('dash.quick_resultat'),path: '/compte-resultat',         color: '#059669', bg: '#ECFDF5' },
    { icon: IconBook,     label: t('dash.quick_bilan'),   path: '/bilan',                   color: '#7C3AED', bg: '#F5F3FF' },
    { icon: IconSparkles, label: t('dash.quick_correc'),  path: '/correction',              color: '#D97706', bg: '#FFFBEB' },
    { icon: IconBarChart, label: t('dash.quick_indic'),   path: '/indicateurs-financiers',  color: '#0891B2', bg: '#ECFEFF' },
  ];

  const now = new Date();
  const dateLocale = t('nav.dashboard') === 'لوحة التحكم' ? 'ar-MA' : 'fr-FR';
  const dateStr = now.toLocaleDateString(dateLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) return (
    <div style={s.loadingWrap}>
      <div style={s.loadingCard}>
        <div style={s.loadingDot} />
        <span style={s.loadingText}>{t('dash.loading')}</span>
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>{t('dash.title')}</h1>
          <p style={s.pageSubtitle}>{dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}</p>
        </div>
        <button onClick={() => navigate('/saisie')} style={s.primaryBtn}>
          <IconPlus size={16} color="#fff" />
          <span>{t('dash.new_op')}</span>
        </button>
      </div>

      <div style={s.statsGrid}>
        <StatCard label={t('dash.sales_month')}    value={stats.ventes_mois}    gradient="linear-gradient(135deg,#2563EB,#3B82F6)" Icon={IconTrend}    positive={true} />
        <StatCard label={t('dash.expenses_month')} value={stats.depenses_mois}  gradient="linear-gradient(135deg,#DC2626,#EF4444)" Icon={IconWallet}   positive={false} />
        <StatCard label={t('dash.net_result')}     value={stats.resultat_mois}  gradient={stats.resultat_mois >= 0 ? "linear-gradient(135deg,#059669,#10B981)" : "linear-gradient(135deg,#DC2626,#EF4444)"} Icon={IconBarChart} />
        <StatCard label={t('dash.total_ops')}      value={stats.total_operations} isMoney={false} gradient="linear-gradient(135deg,#7C3AED,#8B5CF6)" Icon={IconBook} positive={true} />
      </div>

      <section style={s.section}>
        <h2 style={s.sectionTitle}>{t('dash.quick_access')}</h2>
        <div style={s.quickGrid}>
          {QUICK.map(({ icon: Icon, label, path, color, bg }) => (
            <button key={path} onClick={() => navigate(path)} style={s.quickCard}>
              <div style={{ ...s.quickIcon, background: bg }}>
                <Icon size={20} color={color} />
              </div>
              <span style={s.quickLabel}>{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section style={s.tableSection}>
        <div style={s.tableTitleRow}>
          <h2 style={s.sectionTitle}>{t('dash.last_ops')}</h2>
          {ops.length > 0 && (
            <button onClick={() => navigate('/journal')} style={s.linkBtn}>
              {t('common.see_all')}
            </button>
          )}
        </div>

        {ops.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📊</div>
            <p style={s.emptyTitle}>{t('dash.no_ops')}</p>
            <p style={s.emptyText}>{t('dash.no_ops_sub')}</p>
            <button onClick={() => navigate('/saisie')} style={s.primaryBtn}>
              <IconPlus size={15} color="#fff" />
              <span>{t('dash.first_op')}</span>
            </button>
          </div>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
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
                    <tr key={op.id} style={{ ...s.tr, background: i % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                      <td style={s.td}><span style={s.dateCell}>{op.date_operation}</span></td>
                      <td style={s.td}><span style={s.descCell}>{op.description || op.texte_original}</span></td>
                      <td style={s.td}><span style={{ ...s.badge, background: tc.bg, color: tc.color }}>{tc.label}</span></td>
                      <td style={s.td}><span style={s.moyenCell}>{op.moyen_paiement}</span></td>
                      <td style={{ ...s.td, textAlign: 'right' }}>
                        <span style={{ ...s.amount, color: isRevenu ? '#059669' : '#DC2626' }}>
                          {isRevenu ? '+' : '-'}{fmt(op.montant)} MRU
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
  loadingWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 },
  loadingCard: { display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 12, padding: '16px 24px', boxShadow: 'var(--shadow)' },
  loadingDot:  { width: 14, height: 14, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.2s ease infinite' },
  loadingText: { color: 'var(--text-2)', fontWeight: 500, fontSize: 14 },

  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  pageTitle: { fontSize: 26, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.025em', lineHeight: 1.2 },
  pageSubtitle: { marginTop: 4, fontSize: 13, color: 'var(--text-3)', fontWeight: 400 },
  primaryBtn: {
    display: 'flex', alignItems: 'center', gap: 7,
    background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
    color: '#fff', border: 'none', padding: '10px 18px',
    borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer',
    boxShadow: 'var(--shadow-primary)', transition: 'opacity 0.15s', whiteSpace: 'nowrap',
  },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 24 },
  card: { background: 'var(--card)', borderRadius: 'var(--radius-lg)', padding: '20px 22px', boxShadow: 'var(--shadow)', transition: 'transform 0.2s, box-shadow 0.2s' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  iconCircle: { width: 40, height: 40, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  trend: { display: 'flex', alignItems: 'center', padding: '3px 7px', borderRadius: 99, fontSize: 11, fontWeight: 600 },
  cardValue: { fontSize: 22, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em', lineHeight: 1 },
  cardLabel: { fontSize: 12.5, color: 'var(--text-3)', fontWeight: 500, marginTop: 6 },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text-1)', marginBottom: 14, letterSpacing: '-0.01em' },
  quickGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 },
  quickCard: {
    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    padding: '18px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s', boxShadow: 'var(--shadow-sm)',
  },
  quickIcon: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)', textAlign: 'center' },

  tableSection: { background: 'var(--card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)', overflow: 'hidden' },
  tableTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px 12px', borderBottom: '1px solid var(--border)' },
  linkBtn: { color: 'var(--primary)', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' },

  empty: { padding: '60px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  emptyIcon: { fontSize: 48, marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text-1)' },
  emptyText: { fontSize: 13, color: 'var(--text-3)', marginBottom: 8 },

  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#F8FAFC', borderBottom: '1px solid var(--border)' },
  tr: { transition: 'background 0.1s' },
  td: { padding: '13px 16px', fontSize: 13.5, color: 'var(--text-2)', borderBottom: '1px solid #F1F5F9', verticalAlign: 'middle' },
  dateCell: { color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums', fontSize: 13 },
  descCell: { color: 'var(--text-1)', fontWeight: 500, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 600, letterSpacing: '0.02em' },
  moyenCell: { textTransform: 'capitalize', fontSize: 13, color: 'var(--text-2)' },
  amount: { fontWeight: 700, fontSize: 14, fontVariantNumeric: 'tabular-nums' },
};
