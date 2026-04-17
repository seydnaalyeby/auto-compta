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
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', minWidth: 170 }}>
      <p style={{ fontWeight: 700, color: '#0F172A', marginBottom: 8, fontSize: 12.5 }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 3 }}>
          <span style={{ fontSize: 12, color: p.fill, fontWeight: 600 }}>{p.name}</span>
          <span style={{ fontSize: 12, color: '#0F172A', fontWeight: 700 }}>{fmt(p.value)} MRU</span>
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
    getTresorerie({ annee }).then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [annee]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 12, padding: '16px 24px', boxShadow: 'var(--shadow)' }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.2s ease infinite' }} />
        <span style={{ color: 'var(--text-2)', fontWeight: 500, fontSize: 13.5 }}>{t('treso.loading')}</span>
      </div>
    </div>
  );
  if (!data) return null;

  const entreeLabel = t('treso.encaissements');
  const sortieLabel = t('treso.decaissements');

  const historique = (data.historique || []).map((h, idx) => ({
    mois: months[new Date(h.mois).getMonth()] || '',
    [entreeLabel]: parseFloat(h.entrees || 0),
    [sortieLabel]: parseFloat(h.sorties || 0),
  }));

  const STATS = [
    { label: t('treso.total'),          val: data.total,  grad: data.total >= 0 ? 'linear-gradient(135deg,#059669,#10B981)' : 'linear-gradient(135deg,#DC2626,#EF4444)', Icon: IconWallet },
    { label: t('treso.solde_caisse'),   val: data.caisse, grad: 'linear-gradient(135deg,#2563EB,#3B82F6)', Icon: IconWallet },
    { label: t('treso.solde_banque'),   val: data.banque, grad: 'linear-gradient(135deg,#7C3AED,#8B5CF6)', Icon: IconBarChart },
    { label: t('treso.encaissements'),  val: (data.entrees_caisse || 0) + (data.entrees_banque || 0), grad: 'linear-gradient(135deg,#059669,#10B981)', Icon: IconArrowUpRight },
    { label: t('treso.decaissements'),  val: (data.sorties_caisse || 0) + (data.sorties_banque || 0), grad: 'linear-gradient(135deg,#DC2626,#EF4444)', Icon: IconArrowDownRight },
  ];

  const DETAILS = [
    { titre: `${t('treso.caisse_detail')} — Cpt 100`, tag: 'Espèces',    tagColor: '#2563EB', tagBg: '#EFF6FF', entrees: data.entrees_caisse, sorties: data.sorties_caisse, solde: data.caisse },
    { titre: `${t('treso.banque_detail')} — Cpt 12`,  tag: 'Virements',  tagColor: '#7C3AED', tagBg: '#F5F3FF', entrees: data.entrees_banque, sorties: data.sorties_banque, solde: data.banque },
  ];

  return (
    <div className="fade-in">
      <div style={s.header}>
        <div>
          <h1 style={s.title}>{t('treso.title')}</h1>
          <p style={s.subtitle}>{t('treso.subtitle')}</p>
        </div>
        <div style={s.pills}>
          {YEARS.map(a => (
            <button key={a} onClick={() => setAnnee(a)}
              style={{ ...s.pill, ...(annee === a ? s.pillActive : {}) }}>
              {a}
            </button>
          ))}
        </div>
      </div>

      {data.alerte && (
        <div style={s.alertBanner}>
          <span style={s.alertDot} />
          <div><strong>{t('treso.alert_caisse')}</strong></div>
        </div>
      )}

      <div style={s.statsGrid}>
        {STATS.map((st, i) => (
          <div key={i} style={s.statCard} className="card-hover">
            <div style={{ ...s.iconCircle, background: st.grad }}>
              <st.Icon size={17} color="#fff" />
            </div>
            <div style={s.statValue}>{fmt(st.val)}</div>
            <div style={s.statCurrency}>MRU</div>
            <div style={s.statLabel}>{st.label}</div>
          </div>
        ))}
      </div>

      <div style={s.chartCard}>
        <div style={s.chartHeader}>
          <div>
            <h2 style={s.chartTitle}>{t('treso.chart_title')} — {annee}</h2>
            <p style={s.chartSub}>{entreeLabel} / {sortieLabel}</p>
          </div>
          <div style={s.legendRow}>
            <div style={s.legendItem}><div style={{ ...s.legendDot, background: '#059669' }} />{entreeLabel}</div>
            <div style={s.legendItem}><div style={{ ...s.legendDot, background: '#DC2626' }} />{sortieLabel}</div>
          </div>
        </div>
        {historique.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={historique} barCategoryGap="35%" margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
              <Bar dataKey={entreeLabel} fill="#059669" radius={[6, 6, 0, 0]} />
              <Bar dataKey={sortieLabel} fill="#DC2626" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📊</div>
            <p style={s.emptyText}>{t('treso.no_data')}</p>
          </div>
        )}
      </div>

      <div style={s.detailGrid}>
        {DETAILS.map((d, i) => (
          <div key={i} style={s.detailCard}>
            <div style={s.detailTop}>
              <div>
                <p style={s.detailTitle}>{d.titre}</p>
                <span style={{ ...s.detailTag, color: d.tagColor, background: d.tagBg }}>{d.tag}</span>
              </div>
              <div style={{ ...s.soldeBadge, color: d.solde >= 0 ? '#059669' : '#DC2626', background: d.solde >= 0 ? '#ECFDF5' : '#FEF2F2' }}>
                {fmt(d.solde)} MRU
              </div>
            </div>
            <div style={s.detailBody}>
              <div style={s.detailRow}>
                <span style={s.detailKey}>{entreeLabel}</span>
                <span style={{ color: '#059669', fontWeight: 700, fontSize: 14 }}>+{fmt(d.entrees)} MRU</span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailKey}>{sortieLabel}</span>
                <span style={{ color: '#DC2626', fontWeight: 700, fontSize: 14 }}>-{fmt(d.sorties)} MRU</span>
              </div>
              <div style={{ ...s.detailRow, ...s.detailRowTotal }}>
                <span style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: 13.5 }}>{t('common.total')}</span>
                <span style={{ fontWeight: 800, fontSize: 17, color: d.solde >= 0 ? '#059669' : '#DC2626' }}>
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 16, flexWrap: 'wrap' },
  title: { fontSize: 26, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.025em', margin: 0 },
  subtitle: { marginTop: 4, fontSize: 13, color: 'var(--text-3)' },
  pills: { display: 'flex', gap: 3, background: '#F1F5F9', borderRadius: 10, padding: 3 },
  pill: { padding: '7px 14px', borderRadius: 8, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', cursor: 'pointer', transition: 'all 0.15s' },
  pillActive: { background: '#fff', color: 'var(--text-1)', fontWeight: 700, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  alertBanner: { display: 'flex', alignItems: 'center', gap: 10, background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13.5, color: '#92400E', fontWeight: 500 },
  alertDot: { width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', flexShrink: 0 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 20 },
  statCard: { background: 'var(--card)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' },
  iconCircle: { width: 38, height: 38, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  statValue: { fontSize: 20, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em', lineHeight: 1 },
  statCurrency: { fontSize: 12, fontWeight: 500, color: 'var(--text-3)', marginTop: 1 },
  statLabel: { fontSize: 12, color: 'var(--text-3)', fontWeight: 500, marginTop: 6 },
  chartCard: { background: 'var(--card)', borderRadius: 'var(--radius-lg)', padding: '22px 24px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', marginBottom: 20 },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  chartTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-1)', margin: 0 },
  chartSub: { fontSize: 12, color: 'var(--text-3)', marginTop: 3 },
  legendRow: { display: 'flex', gap: 16, alignItems: 'center' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text-2)', fontWeight: 500 },
  legendDot: { width: 8, height: 8, borderRadius: '50%' },
  empty: { textAlign: 'center', padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 14, color: 'var(--text-3)', fontWeight: 500 },
  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 },
  detailCard: { background: 'var(--card)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' },
  detailTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, gap: 12 },
  detailTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 6px' },
  detailTag: { fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 99, display: 'inline-block', letterSpacing: '0.01em' },
  soldeBadge: { fontSize: 13.5, fontWeight: 800, padding: '6px 12px', borderRadius: 8, whiteSpace: 'nowrap' },
  detailBody: { display: 'flex', flexDirection: 'column', gap: 6 },
  detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', fontSize: 13, color: 'var(--text-2)', borderBottom: '1px solid #F8FAFC' },
  detailRowTotal: { borderTop: '1px solid var(--border)', borderBottom: 'none', paddingTop: 14, marginTop: 6 },
  detailKey: { fontWeight: 500, color: 'var(--text-3)' },
};
