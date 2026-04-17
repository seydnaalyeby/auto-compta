import React, { useEffect, useState } from 'react';
import { listeEcritures } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { IconFile, IconCheck } from '../Icons';

const fmt  = n => Number(n || 0).toLocaleString('fr-FR');
const YEARS = [2023, 2024, 2025, 2026];

const PCM_CLASSES = [
  { code: '1xx', label_fr: 'Trésorerie & Opérations bancaires',    label_ar: 'الخزينة والعمليات المصرفية',    ex: '100=Caisse · 12=Banque',            color: '#2563EB', bg: '#EFF6FF' },
  { code: '2xx', label_fr: 'Opérations avec la clientèle',         label_ar: 'العمليات مع العملاء',           ex: '210=Comptes clients',                color: '#059669', bg: '#ECFDF5' },
  { code: '3xx', label_fr: 'Autres comptes financiers',            label_ar: 'حسابات مالية أخرى',            ex: '320=Fournisseurs · 322=Personnel',   color: '#7C3AED', bg: '#F5F3FF' },
  { code: '4xx', label_fr: 'Valeurs immobilisées',                 label_ar: 'القيم المجمدة',                 ex: '42=Immobilisations corporelles',      color: '#D97706', bg: '#FFFBEB' },
  { code: '5xx', label_fr: 'Capitaux permanents',                  label_ar: 'رؤوس الأموال الدائمة',         ex: '59=Capital · 58=Réserves',           color: '#0891B2', bg: '#ECFEFF' },
  { code: '6xx', label_fr: 'Charges',                              label_ar: 'المصروفات',                     ex: '620=Loyers · 650=Salaires · 66=Impôts', color: '#DC2626', bg: '#FEF2F2' },
  { code: '7xx', label_fr: 'Produits',                             label_ar: 'الإيرادات',                     ex: '702=Ventes · 71=Produits accessoires', color: '#059669', bg: '#ECFDF5' },
  { code: '8xx', label_fr: 'Résultats',                            label_ar: 'النتائج',                       ex: '87=Résultat net de la période',      color: '#374151', bg: '#F9FAFB' },
];

export default function Journal() {
  const [ecritures, setEcritures] = useState([]);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [mois, setMois] = useState('');
  const [loading, setLoading] = useState(true);
  const { t, months, lang } = useLanguage();

  useEffect(() => {
    setLoading(true);
    listeEcritures({ annee, mois: mois || undefined })
      .then(r => { setEcritures(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [annee, mois]);

  const total = ecritures.reduce((s, e) => s + parseFloat(e.montant || 0), 0);
  const count = ecritures.length;
  const entryWord = count <= 1 ? t('journal.ecriture') : t('journal.ecritures');

  return (
    <div className="fade-in">
      <div style={s.header}>
        <div>
          <h1 style={s.title}>{t('journal.title')}</h1>
          <p style={s.subtitle}>{t('journal.subtitle')}</p>
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

      <div style={s.balanceBar}>
        <div style={s.balanceSide}>
          <span style={s.balanceLabel}>{t('journal.total_debit')}</span>
          <span style={{ ...s.balanceValue, color: '#059669' }}>{fmt(total)} MRU</span>
        </div>
        <div style={s.balanceDivider} />
        <div style={s.balanceSide}>
          <span style={s.balanceLabel}>{t('journal.total_credit')}</span>
          <span style={{ ...s.balanceValue, color: '#2563EB' }}>{fmt(total)} MRU</span>
        </div>
        <div style={s.balanceBadge}>
          <IconCheck size={13} color="#059669" />
          <span>{t('journal.balanced')}</span>
        </div>
      </div>

      <div style={s.tableCard}>
        {loading ? (
          <div style={s.loadRow}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.2s ease infinite' }} />
            <span style={{ color: 'var(--text-2)', fontWeight: 500, fontSize: 13.5 }}>{t('journal.loading')}</span>
          </div>
        ) : ecritures.length === 0 ? (
          <div style={s.emptyState}>
            <div style={s.emptyOrb}><IconFile size={24} color="#94A3B8" /></div>
            <p style={s.emptyTitle}>{t('journal.no_entries')}</p>
            <p style={s.emptyText}>{t('journal.no_entries_sub')}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>{t('journal.col_date')}</th>
                  <th style={s.th}>{t('journal.col_libelle')}</th>
                  <th style={{ ...s.th, ...s.thDebit }}>{t('journal.col_debit_cpt')}</th>
                  <th style={{ ...s.th, ...s.thDebit }}>{t('journal.col_debit_lib')}</th>
                  <th style={{ ...s.th, ...s.thCredit }}>{t('journal.col_credit_cpt')}</th>
                  <th style={{ ...s.th, ...s.thCredit }}>{t('journal.col_credit_lib')}</th>
                  <th style={{ ...s.th, textAlign: 'right' }}>{t('common.amount')}</th>
                </tr>
              </thead>
              <tbody>
                {ecritures.map((e, i) => (
                  <tr key={e.id} className="trow" style={{ background: i % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                    <td style={s.td}><span style={s.dateCell}>{e.date_ecriture}</span></td>
                    <td style={{ ...s.td, maxWidth: 220 }}><span style={s.libelleCell}>{e.libelle}</span></td>
                    <td style={s.td}><span style={s.debitBadge}>{e.compte_debit}</span></td>
                    <td style={{ ...s.td, color: '#059669', fontSize: 12.5 }}>{e.libelle_debit}</td>
                    <td style={s.td}><span style={s.creditBadge}>{e.compte_credit}</span></td>
                    <td style={{ ...s.td, color: '#2563EB', fontSize: 12.5 }}>{e.libelle_credit}</td>
                    <td style={{ ...s.td, textAlign: 'right' }}><span style={s.montantCell}>{fmt(e.montant)} MRU</span></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={s.tfootRow}>
                  <td colSpan={2} style={{ ...s.td, fontWeight: 800, color: 'var(--text-1)', fontSize: 13 }}>
                    {t('journal.totaux')} — {count} {entryWord}
                  </td>
                  <td colSpan={2} style={{ ...s.td, color: '#059669', fontWeight: 800, fontSize: 13 }}>
                    {t('journal.total_debit')} : {fmt(total)} MRU
                  </td>
                  <td colSpan={2} style={{ ...s.td, color: '#2563EB', fontWeight: 800, fontSize: 13 }}>
                    {t('journal.total_credit')} : {fmt(total)} MRU
                  </td>
                  <td style={{ ...s.td, textAlign: 'right', fontWeight: 800, fontSize: 13, color: 'var(--text-1)' }}>
                    {fmt(total)} MRU
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <div style={s.legendCard}>
        <div style={s.legendHeader}>
          <h3 style={s.legendTitle}>{t('journal.legend_title')}</h3>
          <span style={s.legendSub}>{t('journal.legend_sub')}</span>
        </div>
        <div style={s.legendGrid}>
          {PCM_CLASSES.map((c, i) => (
            <div key={i} style={s.legendItem}>
              <span style={{ ...s.legendCode, background: c.bg, color: c.color }}>{c.code}</span>
              <div>
                <div style={s.legendLabel}>{lang === 'ar' ? c.label_ar : c.label_fr}</div>
                <div style={s.legendEx}>{c.ex}</div>
              </div>
            </div>
          ))}
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
  balanceBar: { display: 'flex', alignItems: 'center', gap: 20, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 22px', marginBottom: 16, flexWrap: 'wrap', boxShadow: 'var(--shadow-sm)' },
  balanceSide: { display: 'flex', flexDirection: 'column', gap: 3 },
  balanceLabel: { fontSize: 11.5, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' },
  balanceValue: { fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' },
  balanceDivider: { width: 1, height: 40, background: 'var(--border)' },
  balanceBadge: { display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', background: 'var(--success-light)', border: '1px solid #A7F3D0', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: '#059669', fontWeight: 600 },
  tableCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 20, boxShadow: 'var(--shadow)' },
  loadRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '48px 24px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px', gap: 8 },
  emptyOrb: { width: 56, height: 56, borderRadius: '50%', background: '#F8FAFC', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-1)' },
  emptyText: { fontSize: 13, color: 'var(--text-3)', textAlign: 'center' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  thead: { background: '#F8FAFC' },
  th: { padding: '11px 14px', textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' },
  thDebit:  { borderLeft: '2px solid #D1FAE5' },
  thCredit: { borderLeft: '2px solid #BFDBFE' },
  td: { padding: '11px 14px', color: 'var(--text-2)', borderBottom: '1px solid #F8FAFC', verticalAlign: 'middle' },
  dateCell: { fontVariantNumeric: 'tabular-nums', color: 'var(--text-3)', fontSize: 12.5 },
  libelleCell: { color: 'var(--text-1)', fontWeight: 500, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  debitBadge:  { display: 'inline-block', background: '#ECFDF5', color: '#059669', padding: '3px 9px', borderRadius: 7, fontWeight: 800, fontSize: 12.5 },
  creditBadge: { display: 'inline-block', background: '#EFF6FF', color: '#2563EB', padding: '3px 9px', borderRadius: 7, fontWeight: 800, fontSize: 12.5 },
  montantCell: { fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--text-1)', fontSize: 13 },
  tfootRow: { background: '#F1F5F9', borderTop: '2px solid var(--border)' },
  legendCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 22px', boxShadow: 'var(--shadow)' },
  legendHeader: { marginBottom: 16 },
  legendTitle: { fontSize: 14.5, fontWeight: 700, color: 'var(--text-1)', margin: 0 },
  legendSub: { fontSize: 12, color: 'var(--text-3)', marginTop: 3, display: 'block' },
  legendGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 },
  legendItem: { display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', background: '#F8FAFC', borderRadius: 9, border: '1px solid var(--border-light)' },
  legendCode: { padding: '4px 9px', borderRadius: 7, fontWeight: 800, fontSize: 12, flexShrink: 0, letterSpacing: '0.02em' },
  legendLabel: { fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.3 },
  legendEx: { fontSize: 11, color: 'var(--text-3)', marginTop: 3, lineHeight: 1.4 },
};
