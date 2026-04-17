import React, { useEffect, useState } from 'react';
import { getCompteResultat } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { IconTrend, IconArrowUpRight, IconArrowDownRight } from '../Icons';

const fmt = n => Number(n || 0).toLocaleString('fr-FR');
const YEARS = [2023, 2024, 2025, 2026];
const PIE_COLORS_PRODUITS = ['#2563EB', '#059669', '#7C3AED', '#0891B2'];
const PIE_COLORS_CHARGES  = ['#DC2626', '#D97706', '#7C3AED', '#475569', '#0891B2'];

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
      <p style={{ fontWeight: 700, color: p.payload.fill || '#0F172A', fontSize: 12.5, marginBottom: 2 }}>{p.name}</p>
      <p style={{ fontWeight: 800, color: '#0F172A', fontSize: 14 }}>{fmt(p.value)} MRU</p>
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
      style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 12, padding: '16px 24px', boxShadow: 'var(--shadow)' }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.2s ease infinite' }} />
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
    { name: t('result.achats'),    value: parseFloat(charges?.achats || 0) },
    { name: t('result.salaires'),  value: parseFloat(charges?.salaires || 0) },
    { name: t('result.loyers'),    value: parseFloat(charges?.loyers || 0) },
    { name: t('result.impots'),    value: parseFloat(charges?.impots || 0) },
    { name: t('result.autres'),    value: parseFloat(charges?.autres_paiements || 0) },
  ].filter(d => d.value > 0);

  const CHARGES_DETAIL = [
    { label: t('result.achats'),   val: charges?.achats },
    { label: t('result.salaires'), val: charges?.salaires },
    { label: t('result.loyers'),   val: charges?.loyers },
    { label: t('result.impots'),   val: charges?.impots },
    { label: t('result.autres'),   val: charges?.autres_paiements },
  ];

  return (
    <div className="fade-in">
      <div style={s.header}>
        <div>
          <h1 style={s.title}>{t('result.title')}</h1>
          <p style={s.subtitle}>{t('result.subtitle')}</p>
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

      <div style={{ ...s.heroBanner, background: est_benefice ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)' }}>
        <div style={s.heroLeft}>
          <div style={s.heroIcon}>
            {est_benefice ? <IconArrowUpRight size={22} color="#fff" /> : <IconArrowDownRight size={22} color="#fff" />}
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
                  <Pie data={pieDataProduits} cx="50%" cy="50%" outerRadius={75} dataKey="value" labelLine={false} label={renderCustomLabel}>
                    {pieDataProduits.map((_, i) => <Cell key={i} fill={PIE_COLORS_PRODUITS[i % PIE_COLORS_PRODUITS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{v}</span>} />
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
                <span style={s.detailLabel}>{c.label}</span>
                <span style={{ ...s.detailValue, color: '#DC2626' }}>-{fmt(c.val)} MRU</span>
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
                  <Pie data={pieDataCharges} cx="50%" cy="50%" outerRadius={75} dataKey="value" labelLine={false} label={renderCustomLabel}>
                    {pieDataCharges.map((_, i) => <Cell key={i} fill={PIE_COLORS_CHARGES[i % PIE_COLORS_CHARGES.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div style={s.calcCard}>
        <h3 style={s.calcTitle}>{t('result.calc_title')}</h3>
        <div style={s.calcRow}>
          <span style={s.calcLabel}>{t('result.total_p7')}</span>
          <span style={{ color: '#059669', fontWeight: 700, fontSize: 15 }}>+{fmt(produits?.total)} MRU</span>
        </div>
        <div style={s.calcRow}>
          <span style={s.calcLabel}>{t('result.total_c6')}</span>
          <span style={{ color: '#DC2626', fontWeight: 700, fontSize: 15 }}>-{fmt(charges?.total)} MRU</span>
        </div>
        <div style={s.calcRowResult}>
          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-1)' }}>{t('result.net_final')}</span>
          <span style={{ fontWeight: 900, fontSize: 22, color: est_benefice ? '#059669' : '#DC2626', letterSpacing: '-0.02em' }}>
            {fmt(resultat_net)} MRU
          </span>
        </div>
      </div>
    </div>
  );
}

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 14 },
  title: { fontSize: 26, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.025em', margin: 0 },
  subtitle: { marginTop: 4, fontSize: 13, color: 'var(--text-3)' },
  filters: { display: 'flex', gap: 8 },
  heroBanner: { borderRadius: 'var(--radius-lg)', padding: '22px 26px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', boxShadow: 'var(--shadow-md)' },
  heroLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  heroIcon: { width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  heroLabel: { fontSize: 12.5, opacity: 0.8, marginBottom: 4, fontWeight: 500 },
  heroValue: { fontSize: 30, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 },
  heroBadge: { fontSize: 14, fontWeight: 800, background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: 10, letterSpacing: '0.05em' },
  mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 20 },
  card: { background: 'var(--card)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' },
  cardTop: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid var(--border)' },
  cardIconWrap: { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-1)', margin: 0 },
  cardSub: { fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 },
  detailRows: { display: 'flex', flexDirection: 'column', marginBottom: 4 },
  detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F8FAFC', gap: 12 },
  detailLabel: { fontSize: 13, color: 'var(--text-2)', flexShrink: 0 },
  detailValue: { fontSize: 13.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0 10px', borderTop: '1px solid var(--border)' },
  totalLabel: { fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  totalValue: { fontSize: 18, fontWeight: 900, fontVariantNumeric: 'tabular-nums' },
  pieWrap: { borderTop: '1px solid var(--border-light)', paddingTop: 14, marginTop: 10 },
  calcCard: { background: 'var(--card)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' },
  calcTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 14, letterSpacing: '-0.01em' },
  calcRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)' },
  calcLabel: { fontSize: 14, color: 'var(--text-2)', fontWeight: 500 },
  calcRowResult: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 0', marginTop: 4 },
};
