import React, { useEffect, useState } from 'react';
import { getTresorerie } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { IconWallet, IconArrowUpRight, IconArrowDownRight, IconBarChart } from '../Icons';

const fmt = n => Number(n || 0).toLocaleString('fr-FR');
const YEARS = [2023, 2024, 2025, 2026];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #E2E8F0',
      borderRadius: 14, padding: '13px 18px',
      boxShadow: '0 10px 32px rgba(0,0,0,0.12)',
      minWidth: 180,
    }}>
      <p style={{ fontWeight: 700, color: '#0F172A', marginBottom: 10, fontSize: 12.5 }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: p.fill, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.fill, display: 'inline-block' }} />
            {p.name}
          </span>
          <span style={{ fontSize: 12, color: '#0F172A', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
            {fmt(p.value)} MRU
          </span>
        </div>
      ))}
    </div>
  );
};

export default function Tresorerie() {
  const [data, setData] = useState(null);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const { t, months } = useLanguage();

  useEffect(() => {
    setLoading(true);
    getTresorerie({ annee })
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [annee]);

  if (loading) return (
    <div className="loading-wrap">
      <div className="loading-card">
        <div className="loading-dot" />
        <span style={{ color: 'var(--text-2)', fontWeight: 500, fontSize: 13.5 }}>{t('treso.loading')}</span>
      </div>
    </div>
  );
  if (!data) return null;

  const entreeLabel = t('treso.encaissements');
  const sortieLabel = t('treso.decaissements');

  const historique = (data.historique || []).map(h => ({
    mois: months[new Date(h.mois).getMonth()] || '',
    [entreeLabel]: parseFloat(h.entrees || 0),
    [sortieLabel]: parseFloat(h.sorties || 0),
  }));

  const STATS = [
    { label: t('treso.total'),         val: data.total,  grad: data.total >= 0 ? 'linear-gradient(135deg,#059669,#34D399)' : 'linear-gradient(135deg,#DC2626,#F87171)', Icon: IconWallet },
    { label: t('treso.solde_caisse'),  val: data.caisse, grad: 'linear-gradient(135deg,#1D4ED8,#60A5FA)', Icon: IconWallet },
    { label: t('treso.solde_banque'),  val: data.banque, grad: 'linear-gradient(135deg,#7C3AED,#A78BFA)', Icon: IconBarChart },
    { label: t('treso.encaissements'), val: (data.entrees_caisse || 0) + (data.entrees_banque || 0), grad: 'linear-gradient(135deg,#059669,#34D399)', Icon: IconArrowUpRight },
    { label: t('treso.decaissements'), val: (data.sorties_caisse || 0) + (data.sorties_banque || 0), grad: 'linear-gradient(135deg,#DC2626,#F87171)', Icon: IconArrowDownRight },
  ];

  const DETAILS = [
    { titre: `${t('treso.caisse_detail')} — Cpt 100`, tag: 'Espèces',   tagColor: '#1D4ED8', tagBg: '#EFF6FF', entrees: data.entrees_caisse, sorties: data.sorties_caisse, solde: data.caisse, accentColor: '#1D4ED8' },
    { titre: `${t('treso.banque_detail')} — Cpt 12`,  tag: 'Virements', tagColor: '#7C3AED', tagBg: '#F5F3FF', entrees: data.entrees_banque, sorties: data.sorties_banque, solde: data.banque,  accentColor: '#7C3AED' },
  ];

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>{t('treso.title')}</h1>
          <p style={s.pageSubtitle}>{t('treso.subtitle')}</p>
        </div>
        <div className="pill-group">
          {YEARS.map(a => (
            <button key={a} onClick={() => setAnnee(a)}
              className={`pill ${annee === a ? 'pill-active' : ''}`}>
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Alert */}
      {data.alerte && (
        <div style={s.alertBanner}>
          <div style={s.alertDot} />
          <div>
            <strong>{t('treso.alert_caisse')}</strong>
            <span style={{ marginLeft: 8, opacity: 0.7 }}>— {t('treso.solde_caisse')} faible</span>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div style={s.statsGrid}>
        {STATS.map((st, i) => (
          <div key={i} style={s.statCard} className="card-hover">
            <div style={{ ...s.statIconCircle, background: st.grad }}>
              <st.Icon size={17} color="#fff" />
            </div>
            <div style={s.statValue}>{fmt(st.val)}</div>
            <div style={s.statCurrency}>MRU</div>
            <div style={s.statLabel}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* Chart card */}
      <div style={s.chartCard}>
        <div style={s.chartHeader}>
          <div>
            <h2 style={s.chartTitle}>{t('treso.chart_title')} — {annee}</h2>
            <p style={s.chartSub}>{entreeLabel} vs {sortieLabel}</p>
          </div>
          <div style={s.legendRow}>
            <div style={s.legendItem}>
              <div style={{ ...s.legendDot, background: '#059669' }} />
              <span>{entreeLabel}</span>
            </div>
            <div style={s.legendItem}>
              <div style={{ ...s.legendDot, background: '#DC2626' }} />
              <span>{sortieLabel}</span>
            </div>
          </div>
        </div>

        {historique.length > 0 ? (
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={historique} barCategoryGap="35%" margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="mois" axisLine={false} tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
              />
              <YAxis
                axisLine={false} tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241,245,249,0.8)', borderRadius: 8 }} />
              <Bar dataKey={entreeLabel} fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar dataKey={sortieLabel} fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={s.empty}>
            <div style={s.emptyIconWrap}>
              <IconBarChart size={28} color="#94A3B8" />
            </div>
            <p style={s.emptyText}>{t('treso.no_data')}</p>
          </div>
        )}
      </div>

      {/* Detail cards */}
      <div style={s.detailGrid}>
        {DETAILS.map((d, i) => (
          <div key={i} style={{ ...s.detailCard, borderTop: `3px solid ${d.accentColor}` }}>
            <div style={s.detailTop}>
              <div>
                <p style={s.detailTitle}>{d.titre}</p>
                <span style={{ ...s.detailTag, color: d.tagColor, background: d.tagBg }}>
                  {d.tag}
                </span>
              </div>
              <div style={{
                ...s.soldeBadge,
                color: d.solde >= 0 ? '#059669' : '#DC2626',
                background: d.solde >= 0 ? '#ECFDF5' : '#FEF2F2',
                border: `1px solid ${d.solde >= 0 ? '#86EFAC' : '#FECACA'}`,
              }}>
                {fmt(d.solde)} MRU
              </div>
            </div>

            <div style={s.detailBody}>
              <div style={s.detailRow}>
                <span style={s.detailKey}>{entreeLabel}</span>
                <span style={{ color: '#059669', fontWeight: 700, fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>
                  +{fmt(d.entrees)} MRU
                </span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailKey}>{sortieLabel}</span>
                <span style={{ color: '#DC2626', fontWeight: 700, fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>
                  –{fmt(d.sorties)} MRU
                </span>
              </div>
              <div style={{ ...s.detailRow, ...s.detailRowTotal }}>
                <span style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: 13.5 }}>
                  {t('common.total')}
                </span>
                <span style={{
                  fontWeight: 800, fontSize: 18,
                  color: d.solde >= 0 ? '#059669' : '#DC2626',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {fmt(d.solde)} MRU
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 28, gap: 16, flexWrap: 'wrap',
  },
  pageTitle: { fontSize: 26, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.025em', margin: 0 },
  pageSubtitle: { marginTop: 5, fontSize: 13, color: 'var(--text-3)' },

  alertBanner: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: '#FFFBEB', border: '1px solid #FCD34D',
    borderRadius: 12, padding: '12px 18px', marginBottom: 20,
    fontSize: 13.5, color: '#92400E', fontWeight: 500,
    boxShadow: '0 2px 8px rgba(217,119,6,0.1)',
  },
  alertDot: { width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', flexShrink: 0 },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: 14, marginBottom: 20,
  },
  statCard: {
    background: 'var(--card)', borderRadius: 'var(--radius-lg)',
    padding: '18px 20px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)',
  },
  statIconCircle: {
    width: 40, height: 40, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 14, boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
  },
  statValue: {
    fontSize: 20, fontWeight: 800, color: 'var(--text-1)',
    letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums',
  },
  statCurrency: { fontSize: 11, fontWeight: 600, color: 'var(--text-3)', marginTop: 2 },
  statLabel:    { fontSize: 12, color: 'var(--text-3)', fontWeight: 500, marginTop: 7 },

  chartCard: {
    background: 'var(--card)', borderRadius: 'var(--radius-xl)',
    padding: '22px 24px', boxShadow: 'var(--shadow-card)',
    border: '1px solid var(--border)', marginBottom: 20,
  },
  chartHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 12,
  },
  chartTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-1)', margin: 0 },
  chartSub:   { fontSize: 12, color: 'var(--text-3)', marginTop: 3 },
  legendRow: { display: 'flex', gap: 16, alignItems: 'center' },
  legendItem: {
    display: 'flex', alignItems: 'center', gap: 7,
    fontSize: 12.5, color: 'var(--text-2)', fontWeight: 500,
  },
  legendDot: { width: 9, height: 9, borderRadius: '50%' },

  empty: {
    textAlign: 'center', padding: '60px 24px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
  },
  emptyIconWrap: {
    width: 60, height: 60, borderRadius: 16,
    background: '#F1F5F9', border: '2px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  emptyText: { fontSize: 14, color: 'var(--text-3)', fontWeight: 500 },

  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
    gap: 16,
  },
  detailCard: {
    background: 'var(--card)', borderRadius: 'var(--radius-lg)',
    padding: '20px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)',
    overflow: 'hidden',
  },
  detailTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 18, gap: 12,
  },
  detailTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 7px' },
  detailTag: {
    fontSize: 11, fontWeight: 700, padding: '3px 9px',
    borderRadius: 99, display: 'inline-block', letterSpacing: '0.02em',
  },
  soldeBadge: {
    fontSize: 13, fontWeight: 800, padding: '6px 13px',
    borderRadius: 9, whiteSpace: 'nowrap',
  },
  detailBody: { display: 'flex', flexDirection: 'column', gap: 0 },
  detailRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', fontSize: 13, color: 'var(--text-2)',
    borderBottom: '1px solid #F8FAFC',
  },
  detailRowTotal: {
    borderTop: '1px solid var(--border)', borderBottom: 'none',
    paddingTop: 14, marginTop: 6,
  },
  detailKey: { fontWeight: 500, color: 'var(--text-3)' },
};
