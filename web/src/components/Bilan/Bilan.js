import React, { useEffect, useState } from 'react';
import { getBilan } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { IconCheck, IconAlert, IconScale } from '../Icons';

const fmt = n => Number(n || 0).toLocaleString('fr-FR');
const YEARS = [2023, 2024, 2025, 2026];

function SectionRow({ label, value, muted = false }) {
  return (
    <div style={rowS.wrap}>
      <span style={{ ...rowS.label, color: muted ? 'var(--text-3)' : 'var(--text-2)', fontWeight: muted ? 400 : 500 }}>
        {label}
      </span>
      <span style={rowS.value}>{fmt(value)} MRU</span>
    </div>
  );
}
const rowS = {
  wrap: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '9px 0', borderBottom: '1px solid #F1F5F9',
  },
  label: { fontSize: 13 },
  value: { fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' },
};

function SubTotal({ label, value, color }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderTop: '1px dashed #E2E8F0', marginTop: 4,
    }}>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-2)' }}>{label}</span>
      <span style={{ fontSize: 14.5, fontWeight: 800, color: color || 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>
        {fmt(value)} MRU
      </span>
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
    <div className="loading-wrap">
      <div className="loading-card">
        <div className="loading-dot" />
        <span style={{ color: 'var(--text-2)', fontWeight: 500, fontSize: 13.5 }}>{t('bilan.loading')}</span>
      </div>
    </div>
  );
  if (!data) return null;

  const { actif, passif, equilibre } = data;

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>{t('bilan.title')}</h1>
          <p style={s.pageSubtitle}>{t('bilan.subtitle')}</p>
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

      {/* Period bar */}
      <div style={s.periodBar}>
        <div style={s.periodLeft}>
          <IconScale size={16} color="var(--text-3)" />
          <span style={s.periodText}>
            {t('bilan.period_at')} {months[mois - 1]} {annee}
          </span>
        </div>
        <span style={{
          ...s.equilibreBadge,
          background: equilibre ? '#ECFDF5' : '#FEF2F2',
          color: equilibre ? '#047857' : '#DC2626',
          borderColor: equilibre ? '#86EFAC' : '#FECACA',
        }}>
          {equilibre
            ? <><IconCheck size={12} color="#059669" /> {t('bilan.balanced')}</>
            : <><IconAlert size={12} color="#DC2626" /> {t('bilan.unbalanced')}</>}
        </span>
      </div>

      {/* Bilan grid */}
      <div style={s.bilanGrid}>
        {/* ACTIF */}
        <div style={{ ...s.bilanCard, borderTop: '3px solid #059669' }}>
          <div style={s.cardHeader}>
            <div style={{ ...s.cardHeaderIcon, background: '#ECFDF5' }}>
              <IconArrowUp />
            </div>
            <div>
              <h2 style={{ ...s.cardTitle, color: '#047857' }}>{t('bilan.actif_title')}</h2>
              <p style={s.cardSub}>{t('bilan.actif_sub')}</p>
            </div>
          </div>

          <div style={s.section}>
            <div style={s.sectionHeader}>
              <span style={{ ...s.sectionBadge, background: '#EFF6FF', color: '#1D4ED8' }}>Classe 1</span>
              <span style={s.sectionLabel}>{t('bilan.tresorerie')}</span>
            </div>
            <SectionRow label={t('bilan.caisse')} value={actif?.tresorerie?.caisse || 0} />
            <SectionRow label={t('bilan.banque')} value={actif?.tresorerie?.banque || 0} />
            <SubTotal label={t('bilan.sub_treso')} value={actif?.tresorerie?.total || 0} color="#1D4ED8" />
          </div>

          <div style={s.section}>
            <div style={s.sectionHeader}>
              <span style={{ ...s.sectionBadge, background: '#ECFDF5', color: '#047857' }}>Classe 2</span>
              <span style={s.sectionLabel}>{t('bilan.creances')}</span>
            </div>
            <SectionRow label={t('bilan.clients')} value={actif?.creances_clients || 0} />
          </div>

          <div style={s.totalRow}>
            <span style={s.totalLabel}>{t('bilan.total_actif')}</span>
            <span style={{ ...s.totalValue, color: '#047857' }}>
              {fmt(actif?.total_actif || 0)} MRU
            </span>
          </div>
        </div>

        {/* PASSIF */}
        <div style={{ ...s.bilanCard, borderTop: '3px solid #1D4ED8' }}>
          <div style={s.cardHeader}>
            <div style={{ ...s.cardHeaderIcon, background: '#EFF6FF' }}>
              <IconArrowDown />
            </div>
            <div>
              <h2 style={{ ...s.cardTitle, color: '#1D4ED8' }}>{t('bilan.passif_title')}</h2>
              <p style={s.cardSub}>{t('bilan.passif_sub')}</p>
            </div>
          </div>

          <div style={s.section}>
            <div style={s.sectionHeader}>
              <span style={{ ...s.sectionBadge, background: '#F5F3FF', color: '#7C3AED' }}>Classe 5</span>
              <span style={s.sectionLabel}>{t('bilan.capitaux')}</span>
            </div>
            <SectionRow label={t('bilan.capital')} value={passif?.capital || 0} />
          </div>

          <div style={s.section}>
            <div style={s.sectionHeader}>
              <span style={{ ...s.sectionBadge, background: '#FEF2F2', color: '#DC2626' }}>Classe 3</span>
              <span style={s.sectionLabel}>{t('bilan.dettes')}</span>
            </div>
            <SectionRow label={t('bilan.fournisseurs')} value={passif?.dettes?.fournisseurs || 0} />
            <SectionRow label={t('bilan.loyer_du')}     value={passif?.dettes?.loyer_du || 0} />
            <SubTotal label={t('bilan.sub_dettes')} value={passif?.dettes?.total || 0} color="#DC2626" />
          </div>

          <div style={s.totalRow}>
            <span style={s.totalLabel}>{t('bilan.total_passif')}</span>
            <span style={{ ...s.totalValue, color: '#1D4ED8' }}>
              {fmt(passif?.total_passif || 0)} MRU
            </span>
          </div>
        </div>
      </div>

      {/* Equation card */}
      <div style={{
        ...s.equationCard,
        background: equilibre ? '#F0FDF4' : '#FEF2F2',
        border: `1px solid ${equilibre ? '#86EFAC' : '#FECACA'}`,
      }}>
        <div style={{
          ...s.equationIconWrap,
          background: equilibre ? '#DCFCE7' : '#FEE2E2',
          border: `1.5px solid ${equilibre ? '#86EFAC' : '#FCA5A5'}`,
        }}>
          {equilibre
            ? <IconCheck size={20} color="#059669" />
            : <IconAlert size={20} color="#DC2626" />}
        </div>
        <div>
          <p style={{ ...s.equationTitle, color: equilibre ? '#047857' : '#DC2626' }}>
            {equilibre ? t('bilan.eq_ok') : t('bilan.eq_nok')}
          </p>
          <p style={s.equationFormula}>
            <strong>{t('bilan.pcm_rule')}</strong>
            {' '}{fmt(actif?.total_actif || 0)} MRU
            <span style={{ color: 'var(--text-3)' }}> ({t('bilan.actif_title')})</span>
            {' = '}
            {fmt(passif?.total_passif || 0)} MRU
            <span style={{ color: 'var(--text-3)' }}> ({t('bilan.passif_title')})</span>
            {' '}{equilibre ? '✓' : '≠'}
          </p>
        </div>
      </div>
    </div>
  );
}

function IconArrowUp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>
  );
}
function IconArrowDown() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2.5">
      <path d="M12 5v14M5 12l7 7 7-7"/>
    </svg>
  );
}

const s = {
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 14,
  },
  pageTitle: { fontSize: 26, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.025em', margin: 0 },
  pageSubtitle: { marginTop: 5, fontSize: 13, color: 'var(--text-3)' },
  filters: { display: 'flex', gap: 8 },

  periodBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 11, padding: '12px 18px', marginBottom: 20,
    boxShadow: 'var(--shadow-xs)',
  },
  periodLeft: { display: 'flex', alignItems: 'center', gap: 9 },
  periodText: { fontWeight: 600, fontSize: 13.5, color: 'var(--text-1)' },
  equilibreBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '5px 13px', borderRadius: 99, fontSize: 12.5, fontWeight: 700, border: '1px solid',
  },

  bilanGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 20, marginBottom: 20,
  },
  bilanCard: {
    background: 'var(--card)', borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)', overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '18px 22px', borderBottom: '1px solid var(--border)',
  },
  cardHeaderIcon: {
    width: 38, height: 38, borderRadius: 11,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardTitle: { fontSize: 15, fontWeight: 800, margin: 0, letterSpacing: '-0.01em' },
  cardSub:   { fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 },

  section: { padding: '14px 22px', borderBottom: '1px solid var(--border-light)' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionBadge: {
    fontSize: 10.5, fontWeight: 700, padding: '2px 8px',
    borderRadius: 6, letterSpacing: '0.03em',
  },
  sectionLabel: { fontSize: 13, fontWeight: 700, color: 'var(--text-1)' },

  totalRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 22px', background: '#F8FAFC',
  },
  totalLabel: { fontSize: 12.5, fontWeight: 800, color: 'var(--text-1)', textTransform: 'uppercase', letterSpacing: '0.04em' },
  totalValue: { fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' },

  equationCard: {
    borderRadius: 'var(--radius-xl)', padding: '20px 24px',
    display: 'flex', alignItems: 'flex-start', gap: 16,
  },
  equationIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  equationTitle: { fontSize: 15, fontWeight: 700, marginBottom: 7 },
  equationFormula: { fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6 },
};
