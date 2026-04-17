import React, { useEffect, useState } from 'react';
import { getBilan } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { IconCheck, IconAlert, IconScale } from '../Icons';

const fmt = n => Number(n || 0).toLocaleString('fr-FR');
const YEARS = [2023, 2024, 2025, 2026];

function SectionRow({ label, value, muted = false }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F8FAFC' }}>
      <span style={{ fontSize: 13, color: muted ? 'var(--text-3)' : 'var(--text-2)', fontWeight: muted ? 400 : 500 }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>{fmt(value)} MRU</span>
    </div>
  );
}

function SubTotal({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: '1px dashed #E2E8F0', marginTop: 4 }}>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-2)' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 800, color: color || 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>{fmt(value)} MRU</span>
    </div>
  );
}

export default function Bilan() {
  const [data, setData] = useState(null);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const { t, months } = useLanguage();

  useEffect(() => {
    setLoading(true);
    getBilan({ annee, mois })
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [annee, mois]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 12, padding: '16px 24px', boxShadow: 'var(--shadow)' }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.2s ease infinite' }} />
        <span style={{ color: 'var(--text-2)', fontWeight: 500, fontSize: 13.5 }}>{t('bilan.loading')}</span>
      </div>
    </div>
  );

  if (!data) return null;
  const { actif, passif, equilibre } = data;

  return (
    <div className="fade-in">
      <div style={s.header}>
        <div>
          <h1 style={s.title}>{t('bilan.title')}</h1>
          <p style={s.subtitle}>{t('bilan.subtitle')}</p>
        </div>
        <div style={s.filters}>
          <select className="select-field" value={mois} onChange={e => setMois(e.target.value)}>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select className="select-field" value={annee} onChange={e => setAnnee(e.target.value)}>
            {YEARS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <div style={s.periodBar}>
        <div style={s.periodLeft}>
          <IconScale size={16} color="#64748B" />
          <span style={s.periodText}>{t('bilan.period_at')} {months[mois - 1]} {annee}</span>
        </div>
        <span style={{ ...s.equilibreBadge, background: equilibre ? '#ECFDF5' : '#FEF2F2', color: equilibre ? '#059669' : '#DC2626', borderColor: equilibre ? '#A7F3D0' : '#FECACA' }}>
          {equilibre
            ? <><IconCheck size={12} color="#059669" /> {t('bilan.balanced')}</>
            : <><IconAlert size={12} color="#DC2626" /> {t('bilan.unbalanced')}</>}
        </span>
      </div>

      <div style={s.bilanGrid}>
        {/* ACTIF */}
        <div style={{ ...s.bilanCard, borderTop: '3px solid #059669' }}>
          <div style={s.cardHeader}>
            <div style={{ ...s.cardHeaderIcon, background: '#ECFDF5' }}>
              <span style={{ fontSize: 14 }}>📈</span>
            </div>
            <div>
              <h2 style={s.cardTitle}>{t('bilan.actif_title')}</h2>
              <p style={s.cardSub}>{t('bilan.actif_sub')}</p>
            </div>
          </div>
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <span style={{ ...s.sectionBadge, background: '#EFF6FF', color: '#2563EB' }}>Classe 1</span>
              <span style={s.sectionTitle}>{t('bilan.tresorerie')}</span>
            </div>
            <SectionRow label={t('bilan.caisse')} value={actif?.tresorerie?.caisse || 0} />
            <SectionRow label={t('bilan.banque')} value={actif?.tresorerie?.banque || 0} />
            <SubTotal label={t('bilan.sub_treso')} value={actif?.tresorerie?.total || 0} color="#2563EB" />
          </div>
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <span style={{ ...s.sectionBadge, background: '#ECFDF5', color: '#059669' }}>Classe 2</span>
              <span style={s.sectionTitle}>{t('bilan.creances')}</span>
            </div>
            <SectionRow label={t('bilan.clients')} value={actif?.creances_clients || 0} />
          </div>
          <div style={s.totalRow}>
            <span style={s.totalLabel}>{t('bilan.total_actif')}</span>
            <span style={{ ...s.totalValue, color: '#059669' }}>{fmt(actif?.total_actif || 0)} MRU</span>
          </div>
        </div>

        {/* PASSIF */}
        <div style={{ ...s.bilanCard, borderTop: '3px solid #2563EB' }}>
          <div style={s.cardHeader}>
            <div style={{ ...s.cardHeaderIcon, background: '#EFF6FF' }}>
              <span style={{ fontSize: 14 }}>📋</span>
            </div>
            <div>
              <h2 style={s.cardTitle}>{t('bilan.passif_title')}</h2>
              <p style={s.cardSub}>{t('bilan.passif_sub')}</p>
            </div>
          </div>
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <span style={{ ...s.sectionBadge, background: '#F5F3FF', color: '#7C3AED' }}>Classe 5</span>
              <span style={s.sectionTitle}>{t('bilan.capitaux')}</span>
            </div>
            <SectionRow label={t('bilan.capital')} value={passif?.capital || 0} />
          </div>
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <span style={{ ...s.sectionBadge, background: '#FEF2F2', color: '#DC2626' }}>Classe 3</span>
              <span style={s.sectionTitle}>{t('bilan.dettes')}</span>
            </div>
            <SectionRow label={t('bilan.fournisseurs')} value={passif?.dettes?.fournisseurs || 0} />
            <SectionRow label={t('bilan.loyer_du')}     value={passif?.dettes?.loyer_du || 0} />
            <SubTotal label={t('bilan.sub_dettes')} value={passif?.dettes?.total || 0} color="#DC2626" />
          </div>
          <div style={s.totalRow}>
            <span style={s.totalLabel}>{t('bilan.total_passif')}</span>
            <span style={{ ...s.totalValue, color: '#2563EB' }}>{fmt(passif?.total_passif || 0)} MRU</span>
          </div>
        </div>
      </div>

      <div style={{ ...s.equationCard, background: equilibre ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${equilibre ? '#A7F3D0' : '#FECACA'}` }}>
        <div style={s.equationIcon}>
          {equilibre ? <IconCheck size={22} color="#059669" /> : <IconAlert size={22} color="#DC2626" />}
        </div>
        <div style={s.equationBody}>
          <p style={{ ...s.equationTitle, color: equilibre ? '#059669' : '#DC2626' }}>
            {equilibre ? t('bilan.eq_ok') : t('bilan.eq_nok')}
          </p>
          <p style={s.equationFormula}>
            <strong>{t('bilan.pcm_rule')}</strong>
            {' '}{fmt(actif?.total_actif || 0)} MRU&nbsp;
            <span style={{ color: 'var(--text-3)' }}>({t('bilan.actif_title')})</span>
            {' '}={' '}
            {fmt(passif?.total_passif || 0)} MRU&nbsp;
            <span style={{ color: 'var(--text-3)' }}>({t('bilan.passif_title')})</span>
            {' '}{equilibre ? '✓' : '≠'}
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 14 },
  title: { fontSize: 26, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.025em', margin: 0 },
  subtitle: { marginTop: 4, fontSize: 13, color: 'var(--text-3)' },
  filters: { display: 'flex', gap: 8 },
  periodBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 16px', marginBottom: 20, boxShadow: 'var(--shadow-xs)' },
  periodLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  periodText: { fontWeight: 600, fontSize: 13.5, color: 'var(--text-1)' },
  equilibreBadge: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 99, fontSize: 12.5, fontWeight: 700, border: '1px solid' },
  bilanGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 20 },
  bilanCard: { background: 'var(--card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', overflow: 'hidden' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px', borderBottom: '1px solid var(--border)' },
  cardHeaderIcon: { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardTitle: { fontSize: 15, fontWeight: 800, color: 'var(--text-1)', margin: 0, letterSpacing: '0.03em' },
  cardSub: { fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 },
  section: { padding: '14px 20px', borderBottom: '1px solid var(--border-light)' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionBadge: { fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 6, letterSpacing: '0.03em' },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: 'var(--text-1)' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#F8FAFC' },
  totalLabel: { fontSize: 13, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '0.05em' },
  totalValue: { fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' },
  equationCard: { borderRadius: 'var(--radius-lg)', padding: '18px 22px', display: 'flex', alignItems: 'flex-start', gap: 14 },
  equationIcon: { flexShrink: 0, marginTop: 2 },
  equationBody: {},
  equationTitle: { fontSize: 14.5, fontWeight: 700, marginBottom: 6 },
  equationFormula: { fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.5 },
};
