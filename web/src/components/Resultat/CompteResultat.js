import React, { useEffect, useState } from 'react';
import { getCompteResultat } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { IconTrend, IconArrowUpRight, IconArrowDownRight } from '../Icons';

const fmt = n => Number(n || 0).toLocaleString('fr-FR');
const YEARS = [2023, 2024, 2025, 2026];
const PIE_COLORS_PRODUITS = ['#1D4ED8', '#059669', '#7C3AED', '#0891B2'];
const PIE_COLORS_CHARGES  = ['#DC2626', '#D97706', '#7C3AED', '#475569', '#0891B2'];

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div style={{
      background: '#fff', border: '1px solid #E2E8F0',
      borderRadius: 12, padding: '11px 16px',
      boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
    }}>
      <p style={{ fontWeight: 700, color: p.payload.fill || '#0F172A', fontSize: 12.5, marginBottom: 3 }}>{p.name}</p>
      <p style={{ fontWeight: 800, color: '#0F172A', fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>
        {fmt(p.value)} MRU
      </p>
    </div>
  );
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.07) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 11, fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function CompteResultat() {
  const [data, setData] = useState(null);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [mois, setMois] = useState('');
  const [loading, setLoading] = useState(true);
  const { t, months } = useLanguage();

  useEffect(() => {
    setLoading(true);
    getCompteResultat({ annee, mois: mois || undefined })
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [annee, mois]);

  if (loading) return (
    <div className="loading-wrap">
      <div className="loading-card">
        <div className="loading-dot" />
        <span style={{ color: 'var(--text-2)', fontWeight: 500, fontSize: 13.5 }}>{t('result.loading')}</span>
      </div>
    </div>
  );
  if (!data) return null;

  const { produits, charges, resultat_net, est_benefice } = data;

  const pieDataProduits = [
    { name: t('result.ventes'),        value: parseFloat(produits?.ventes || 0) },
    { name: t('result.encaissements'), value: parseFloat(produits?.encaissements || 0) },
  ].filter(d => d.value > 0);

  const pieDataCharges = [
    { name: t('result.achats'),   value: parseFloat(charges?.achats || 0) },
    { name: t('result.salaires'), value: parseFloat(charges?.salaires || 0) },
    { name: t('result.loyers'),   value: parseFloat(charges?.loyers || 0) },
    { name: t('result.impots'),   value: parseFloat(charges?.impots || 0) },
    { name: t('result.autres'),   value: parseFloat(charges?.autres_paiements || 0) },
  ].filter(d => d.value > 0);

  const CHARGES_DETAIL = [
    { label: t('result.achats'),   val: charges?.achats,              color: '#DC2626' },
    { label: t('result.salaires'), val: charges?.salaires,            color: '#D97706' },
    { label: t('result.loyers'),   val: charges?.loyers,              color: '#7C3AED' },
    { label: t('result.impots'),   val: charges?.impots,              color: '#475569' },
    { label: t('result.autres'),   val: charges?.autres_paiements,    color: '#0891B2' },
  ];

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>{t('result.title')}</h1>
          <p style={s.pageSubtitle}>{t('result.subtitle')}</p>
        </div>
        <div style={s.filters}>
          <select className="select-field" value={mois} onChange={e => setMois(e.target.value)}>
            <option value="">{t('common.all_year')}</option>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select className="select-field" value={annee} onChange={e => setAnnee(e.target.value)}>
            {YEARS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Hero banner */}
      <div style={{
        ...s.heroBanner,
        background: est_benefice
          ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
          : 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
      }}>
        <div style={s.heroLeft}>
          <div style={s.heroIconWrap}>
            {est_benefice
              ? <IconArrowUpRight size={24} color="#fff" />
              : <IconArrowDownRight size={24} color="#fff" />}
          </div>
          <div>
            <p style={s.heroLabel}>{t('result.net_result')}</p>
            <p style={s.heroValue}>{fmt(resultat_net)} MRU</p>
          </div>
        </div>
        <div style={s.heroBadge}>
          {est_benefice ? t('result.benefit') : t('result.loss')}
        </div>
      </div>

      {/* Main grid */}
      <div style={s.mainGrid}>
        {/* Produits */}
        <div style={s.card}>
          <div style={s.cardTop}>
            <div style={{ ...s.cardIconWrap, background: '#ECFDF5' }}>
              <IconTrend size={16} color="#059669" />
            </div>
            <div>
              <h2 style={s.cardTitle}>{t('result.produits')}</h2>
              <p style={s.cardSub}>{t('result.produits_sub')}</p>
            </div>
          </div>
          <div style={s.detailRows}>
            <div style={s.detailRow}>
              <span style={s.detailLabel}>{t('result.ventes')}</span>
              <span style={{ ...s.detailValue, color: '#059669' }}>+{fmt(produits?.ventes)} MRU</span>
            </div>
            <div style={s.detailRow}>
              <span style={s.detailLabel}>{t('result.encaissements')}</span>
              <span style={{ ...s.detailValue, color: '#059669' }}>+{fmt(produits?.encaissements)} MRU</span>
            </div>
          </div>
          <div style={s.totalRow}>
            <span style={s.totalLabel}>{t('result.total_produits')}</span>
            <span style={{ ...s.totalValue, color: '#059669' }}>{fmt(produits?.total)} MRU</span>
          </div>
          {pieDataProduits.length > 0 && (
            <div style={s.pieWrap}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieDataProduits} cx="50%" cy="50%" outerRadius={78}
                    dataKey="value" labelLine={false} label={renderCustomLabel}>
                    {pieDataProduits.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS_PRODUITS[i % PIE_COLORS_PRODUITS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend iconType="circle" iconSize={8}
                    formatter={v => <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Charges */}
        <div style={s.card}>
          <div style={s.cardTop}>
            <div style={{ ...s.cardIconWrap, background: '#FEF2F2' }}>
              <IconArrowDownRight size={16} color="#DC2626" />
            </div>
            <div>
              <h2 style={s.cardTitle}>{t('result.charges')}</h2>
              <p style={s.cardSub}>{t('result.charges_sub')}</p>
            </div>
          </div>
          <div style={s.detailRows}>
            {CHARGES_DETAIL.map((c, i) => (
              <div key={i} style={s.detailRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                  <span style={s.detailLabel}>{c.label}</span>
                </div>
                <span style={{ ...s.detailValue, color: '#DC2626' }}>–{fmt(c.val)} MRU</span>
              </div>
            ))}
          </div>
          <div style={s.totalRow}>
            <span style={s.totalLabel}>{t('result.total_charges')}</span>
            <span style={{ ...s.totalValue, color: '#DC2626' }}>{fmt(charges?.total)} MRU</span>
          </div>
          {pieDataCharges.length > 0 && (
            <div style={s.pieWrap}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieDataCharges} cx="50%" cy="50%" outerRadius={78}
                    dataKey="value" labelLine={false} label={renderCustomLabel}>
                    {pieDataCharges.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS_CHARGES[i % PIE_COLORS_CHARGES.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend iconType="circle" iconSize={8}
                    formatter={v => <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Calculation card */}
      <div style={s.calcCard}>
        <h3 style={s.calcTitle}>{t('result.calc_title')}</h3>
        <div style={s.calcRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#059669' }} />
            <span style={s.calcLabel}>{t('result.total_p7')}</span>
          </div>
          <span style={{ color: '#059669', fontWeight: 700, fontSize: 15, fontVariantNumeric: 'tabular-nums' }}>
            +{fmt(produits?.total)} MRU
          </span>
        </div>
        <div style={s.calcRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#DC2626' }} />
            <span style={s.calcLabel}>{t('result.total_c6')}</span>
          </div>
          <span style={{ color: '#DC2626', fontWeight: 700, fontSize: 15, fontVariantNumeric: 'tabular-nums' }}>
            –{fmt(charges?.total)} MRU
          </span>
        </div>
        <div style={s.calcRowResult}>
          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-1)' }}>{t('result.net_final')}</span>
          <span style={{
            fontWeight: 900, fontSize: 24,
            color: est_benefice ? '#059669' : '#DC2626',
            letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
          }}>
            {fmt(resultat_net)} MRU
          </span>
        </div>
      </div>
    </div>
  );
}

const s = {
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 14,
  },
  pageTitle: { fontSize: 26, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.025em', margin: 0 },
  pageSubtitle: { marginTop: 5, fontSize: 13, color: 'var(--text-3)' },
  filters: { display: 'flex', gap: 8 },

  heroBanner: {
    borderRadius: 'var(--radius-xl)', padding: '22px 28px',
    marginBottom: 24, display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', color: '#fff',
    boxShadow: 'var(--shadow-md)',
  },
  heroLeft: { display: 'flex', alignItems: 'center', gap: 18 },
  heroIconWrap: {
    width: 52, height: 52, borderRadius: 16,
    background: 'rgba(255,255,255,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  heroLabel: { fontSize: 12.5, opacity: 0.8, marginBottom: 5, fontWeight: 500 },
  heroValue: { fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
  heroBadge: {
    fontSize: 13.5, fontWeight: 800,
    background: 'rgba(255,255,255,0.18)',
    padding: '8px 18px', borderRadius: 10, letterSpacing: '0.04em',
    backdropFilter: 'blur(8px)',
  },

  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 20, marginBottom: 20,
  },

  card: {
    background: 'var(--card)', borderRadius: 'var(--radius-xl)',
    padding: '20px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)',
  },
  cardTop: {
    display: 'flex', alignItems: 'center', gap: 12,
    marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid var(--border)',
  },
  cardIconWrap: {
    width: 38, height: 38, borderRadius: 11,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-1)', margin: 0 },
  cardSub:   { fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 },

  detailRows:  { display: 'flex', flexDirection: 'column', marginBottom: 4 },
  detailRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '9px 0', borderBottom: '1px solid #F1F5F9', gap: 12,
  },
  detailLabel: { fontSize: 13, color: 'var(--text-2)' },
  detailValue: { fontSize: 13.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' },
  totalRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 0 10px', borderTop: '1.5px solid var(--border)', marginTop: 2,
  },
  totalLabel: { fontSize: 11.5, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  totalValue: { fontSize: 19, fontWeight: 900, fontVariantNumeric: 'tabular-nums' },
  pieWrap:  { borderTop: '1px solid var(--border-light)', paddingTop: 14, marginTop: 10 },

  calcCard: {
    background: 'var(--card)', borderRadius: 'var(--radius-xl)',
    padding: '22px 26px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)',
  },
  calcTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 16, letterSpacing: '-0.01em' },
  calcRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '11px 0', borderBottom: '1px solid var(--border-light)',
  },
  calcLabel: { fontSize: 14, color: 'var(--text-2)', fontWeight: 500 },
  calcRowResult: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '18px 0 0', marginTop: 6,
  },
};
