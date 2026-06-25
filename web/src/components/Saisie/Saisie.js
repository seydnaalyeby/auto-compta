import React, { useState } from 'react';
import { saisirOperationIA } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { IconPen, IconSparkles, IconCheck, IconPlus, IconAlert } from '../Icons';

const EXAMPLES = [
  "Vendu 30 boîtes de médicaments à 150 MRU en espèces",
  "Payé le loyer du mois 8000 MRU par virement bancaire",
  "Acheté du stock pour 5000 MRU à crédit chez le fournisseur",
  "Reçu paiement client 3500 MRU en espèces",
  "Payé salaire employé 12000 MRU en espèces",
  "Payé impôt 2000 MRU par banque",
];

const fmt = n => Number(n || 0).toLocaleString('fr-FR');

export default function Saisie() {
  const [texte, setTexte] = useState('');
  const [dateOp, setDateOp] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const submit = async e => {
    e.preventDefault();
    if (!texte.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await saisirOperationIA({ texte, date_operation: dateOp });
      setResult(res.data);
      setTexte('');
    } catch (err) {
      setError(err.response?.data?.error || t('saisie.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>{t('saisie.title')}</h1>
          <p style={s.pageSubtitle}>{t('saisie.subtitle')}</p>
        </div>
      </div>

      <div style={s.grid}>
        {/* ── Left: Form ── */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={s.cardIconWrap}>
              <IconPen size={16} color="#1D4ED8" />
            </div>
            <div>
              <h2 style={s.cardTitle}>{t('saisie.card_left')}</h2>
              <p style={s.cardSub}>{t('saisie.card_left_sub')}</p>
            </div>
          </div>

          <form onSubmit={submit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>{t('saisie.date_label')}</label>
              <input
                type="date" value={dateOp}
                onChange={e => setDateOp(e.target.value)}
                className="input-field"
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>{t('saisie.text_label')}</label>
              <textarea
                value={texte}
                onChange={e => setTexte(e.target.value)}
                placeholder={t('saisie.placeholder')}
                className="input-field"
                style={s.textarea}
                rows={5}
                required
              />
            </div>

            {error && (
              <div style={s.errBox}>
                <IconAlert size={14} color="#DC2626" />
                <span style={s.errText}>{error}</span>
              </div>
            )}

            <button type="submit" className="btn-primary"
              style={{ ...s.submitBtn, opacity: loading ? 0.75 : 1 }}
              disabled={loading}>
              {loading
                ? <><span className="spinner" />&nbsp; {t('saisie.btn_loading')}</>
                : <><IconSparkles size={16} color="#fff" />&nbsp; {t('saisie.btn_submit')}</>}
            </button>
          </form>

          {/* Examples */}
          <div style={s.examplesWrap}>
            <p style={s.examplesTitle}>{t('saisie.examples_title')}</p>
            <div style={s.examplesList}>
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => setTexte(ex)}
                  className="example-chip" style={s.exampleChip}>
                  <IconPlus size={11} color="#94A3B8" />
                  <span>{ex}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: AI Result ── */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={{ ...s.cardIconWrap, background: '#F5F3FF' }}>
              <IconSparkles size={16} color="#7C3AED" />
            </div>
            <div>
              <h2 style={s.cardTitle}>{t('saisie.ai_card')}</h2>
              <p style={s.cardSub}>{t('saisie.ai_card_sub')}</p>
            </div>
          </div>

          {/* Waiting state */}
          {!result && !loading && (
            <div style={s.emptyState}>
              <div style={s.emptyOrb}>
                <IconSparkles size={30} color="#7C3AED" />
              </div>
              <p style={s.emptyTitle}>{t('saisie.waiting')}</p>
              <p style={s.emptyText}>{t('saisie.will_generate')}</p>
              <div style={s.featureGrid}>
                {[t('saisie.feat_entry'), t('saisie.feat_treso'), t('saisie.feat_result'), t('saisie.feat_bilan')].map((f, i) => (
                  <div key={i} style={s.featureChip}>
                    <IconCheck size={11} color="#059669" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div style={s.loadingState}>
              <div style={s.loadingOrb}>
                <div className="spinner" style={{
                  borderColor: 'rgba(124,58,237,0.2)',
                  borderTopColor: '#7C3AED',
                  width: 30, height: 30, borderWidth: 3,
                }} />
              </div>
              <p style={s.loadingTitle}>{t('saisie.analyzing')}</p>
              <p style={s.loadingText}>{t('saisie.pcm_note')}</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="fade-in">
              <div style={s.successBanner}>
                <div style={s.successIcon}><IconCheck size={14} color="#059669" /></div>
                <span>{t('saisie.success')}</span>
              </div>

              <div style={s.summaryRow}>
                <div style={s.summaryChip}>
                  <span style={s.summaryKey}>{t('saisie.summary_type')}</span>
                  <span style={{ ...s.summaryBadge, background: '#EFF6FF', color: '#1D4ED8' }}>
                    {result.analyse_ia?.type_operation}
                  </span>
                </div>
                <div style={s.summaryChip}>
                  <span style={s.summaryKey}>{t('saisie.summary_amount')}</span>
                  <span style={s.summaryValue}>{fmt(result.operation?.montant)} MRU</span>
                </div>
                <div style={s.summaryChip}>
                  <span style={s.summaryKey}>{t('saisie.summary_method')}</span>
                  <span style={s.summaryValue}>{result.operation?.moyen_paiement}</span>
                </div>
              </div>

              {result.analyse_ia && (
                <div style={s.entryBox}>
                  <p style={s.entryTitle}>{t('saisie.entry_title')}</p>
                  <div style={s.entryColumns}>
                    {/* Débit */}
                    <div style={{ ...s.entryCol, background: '#F0FDF4', borderColor: '#86EFAC' }}>
                      <div style={{ ...s.entryColTag, color: '#059669', background: '#DCFCE7' }}>
                        {t('saisie.debit')}
                      </div>
                      <div style={s.entryCode}>{result.analyse_ia.compte_debit}</div>
                      <div style={s.entryName}>{result.analyse_ia.libelle_debit}</div>
                      <div style={{ ...s.entryAmount, color: '#059669' }}>
                        +{fmt(result.operation?.montant)} MRU
                      </div>
                    </div>

                    <div style={s.entrySep}>
                      <div style={s.entrySepLine} />
                      <span style={s.entrySepIcon}>⇄</span>
                      <div style={s.entrySepLine} />
                    </div>

                    {/* Crédit */}
                    <div style={{ ...s.entryCol, background: '#FFF1F2', borderColor: '#FDA4AF' }}>
                      <div style={{ ...s.entryColTag, color: '#DC2626', background: '#FFE4E6' }}>
                        {t('saisie.credit')}
                      </div>
                      <div style={s.entryCode}>{result.analyse_ia.compte_credit}</div>
                      <div style={s.entryName}>{result.analyse_ia.libelle_credit}</div>
                      <div style={{ ...s.entryAmount, color: '#DC2626' }}>
                        –{fmt(result.operation?.montant)} MRU
                      </div>
                    </div>
                  </div>

                  {result.analyse_ia.explication && (
                    <div style={s.explanation}>
                      <IconSparkles size={13} color="#7C3AED" />
                      <span>{result.analyse_ia.explication}</span>
                    </div>
                  )}
                </div>
              )}

              <button onClick={() => setResult(null)} style={s.newOpBtn}>
                <IconPlus size={14} color="#1D4ED8" />
                {t('saisie.new_op')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  header: { marginBottom: 28 },
  pageTitle: { fontSize: 26, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.025em', margin: 0 },
  pageSubtitle: { marginTop: 5, fontSize: 13, color: 'var(--text-3)' },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: 20, alignItems: 'start',
  },

  card: {
    background: 'var(--card)', borderRadius: 'var(--radius-xl)',
    padding: '24px', boxShadow: 'var(--shadow-card)',
    border: '1px solid var(--border)',
  },
  cardHeader: {
    display: 'flex', alignItems: 'center', gap: 12,
    marginBottom: 22, paddingBottom: 18,
    borderBottom: '1px solid var(--border)',
  },
  cardIconWrap: {
    width: 38, height: 38, borderRadius: 11,
    background: '#EFF6FF',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.2 },
  cardSub: { fontSize: 12, color: 'var(--text-3)', marginTop: 2 },

  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)' },
  textarea: { resize: 'vertical', lineHeight: 1.6 },

  errBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#FEF2F2', border: '1px solid #FECACA',
    borderRadius: 9, padding: '10px 12px',
  },
  errText: { color: '#DC2626', fontSize: 13, fontWeight: 500 },

  submitBtn: { width: '100%', padding: '12px 0', fontSize: 14.5, fontWeight: 700, borderRadius: 10 },

  examplesWrap: { marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border)' },
  examplesTitle: {
    fontSize: 11, fontWeight: 700, color: 'var(--text-3)',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10,
  },
  examplesList: { display: 'flex', flexDirection: 'column', gap: 5 },
  exampleChip: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '9px 12px', background: '#F8FAFC',
    border: '1px solid var(--border)', borderRadius: 9,
    fontSize: 12.5, color: 'var(--text-2)', cursor: 'pointer', textAlign: 'left',
  },

  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '32px 16px', textAlign: 'center',
  },
  emptyOrb: {
    width: 76, height: 76, borderRadius: '50%',
    background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)',
    border: '2px solid #DDD6FE',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 18, boxShadow: '0 4px 16px rgba(124,58,237,0.12)',
  },
  emptyTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 },
  emptyText: { fontSize: 13, color: 'var(--text-3)', marginBottom: 18, lineHeight: 1.5 },
  featureGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' },
  featureChip: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'var(--success-light)', border: '1px solid #A7F3D0',
    borderRadius: 9, padding: '8px 10px', fontSize: 12, color: '#047857', fontWeight: 500,
  },

  loadingState: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '44px 16px', textAlign: 'center',
  },
  loadingOrb: {
    width: 78, height: 78, borderRadius: '50%',
    background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    boxShadow: '0 4px 20px rgba(124,58,237,0.15)',
  },
  loadingTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 },
  loadingText: { fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5, maxWidth: 260 },

  successBanner: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: '#F0FDF4', border: '1px solid #86EFAC',
    borderRadius: 10, padding: '12px 16px',
    color: '#059669', fontSize: 13.5, fontWeight: 600, marginBottom: 18,
  },
  successIcon: {
    width: 24, height: 24, borderRadius: '50%',
    background: '#DCFCE7', border: '1.5px solid #86EFAC',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },

  summaryRow: { display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  summaryChip: {
    display: 'flex', flexDirection: 'column', gap: 4,
    background: '#F8FAFC', border: '1px solid var(--border)',
    borderRadius: 10, padding: '10px 14px', flex: 1, minWidth: 100,
  },
  summaryKey: {
    fontSize: 10.5, color: 'var(--text-3)', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  summaryBadge: { display: 'inline-block', padding: '2px 9px', borderRadius: 99, fontSize: 12, fontWeight: 700, width: 'fit-content' },
  summaryValue: { fontSize: 14, fontWeight: 700, color: 'var(--text-1)' },

  entryBox: {
    background: '#F8FAFC', border: '1px solid var(--border)',
    borderRadius: 14, padding: '16px', marginBottom: 18,
  },
  entryTitle: {
    fontSize: 11, fontWeight: 700, color: 'var(--text-3)',
    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14,
  },
  entryColumns: { display: 'flex', alignItems: 'stretch', gap: 0 },
  entryCol: {
    flex: 1, border: '1.5px solid',
    borderRadius: 12, padding: '14px 12px', textAlign: 'center',
  },
  entryColTag: {
    display: 'inline-block', padding: '2px 10px',
    borderRadius: 99, fontSize: 10, fontWeight: 800,
    letterSpacing: '0.08em', marginBottom: 10,
  },
  entryCode: {
    fontSize: 24, fontWeight: 900, color: 'var(--text-1)',
    letterSpacing: '-0.01em', marginBottom: 5,
    fontVariantNumeric: 'tabular-nums',
  },
  entryName: { fontSize: 11.5, color: 'var(--text-3)', lineHeight: 1.4, marginBottom: 10 },
  entryAmount: { fontSize: 14, fontWeight: 800, fontVariantNumeric: 'tabular-nums' },

  entrySep: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '0 10px', gap: 4,
  },
  entrySepLine: { flex: 1, width: 1, background: '#E2E8F0' },
  entrySepIcon: { fontSize: 16, color: '#CBD5E1', userSelect: 'none' },

  explanation: {
    display: 'flex', alignItems: 'flex-start', gap: 8,
    marginTop: 14, padding: '10px 14px',
    background: '#F5F3FF', borderRadius: 9, border: '1px solid #DDD6FE',
    fontSize: 12.5, color: '#6D28D9', fontStyle: 'italic', lineHeight: 1.6,
  },

  newOpBtn: {
    display: 'flex', alignItems: 'center', gap: 7,
    justifyContent: 'center', width: '100%', padding: '12px',
    background: 'var(--primary-light)', border: '1.5px solid #BFDBFE',
    borderRadius: 10, fontSize: 13.5, fontWeight: 600,
    color: '#1D4ED8', cursor: 'pointer', transition: 'background 0.15s',
  },
};
