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
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>{t('saisie.title')}</h1>
          <p style={s.pageSubtitle}>{t('saisie.subtitle')}</p>
        </div>
      </div>

      <div style={s.grid}>
        {/* Left — Form */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={s.cardIconWrap}>
              <IconPen size={16} color="#2563EB" />
            </div>
            <div>
              <h2 style={s.cardTitle}>{t('saisie.card_left')}</h2>
              <p style={s.cardSub}>{t('saisie.card_left_sub')}</p>
            </div>
          </div>

          <form onSubmit={submit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>{t('saisie.date_label')}</label>
              <input type="date" value={dateOp}
                onChange={e => setDateOp(e.target.value)}
                style={s.input} />
            </div>

            <div style={s.field}>
              <label style={s.label}>{t('saisie.text_label')}</label>
              <textarea
                value={texte}
                onChange={e => setTexte(e.target.value)}
                placeholder={t('saisie.placeholder')}
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

            <button type="submit"
              style={{ ...s.submitBtn, opacity: loading ? 0.75 : 1 }}
              disabled={loading}>
              {loading
                ? <><span className="spinner" />&nbsp; {t('saisie.btn_loading')}</>
                : <><IconSparkles size={16} color="#fff" />&nbsp; {t('saisie.btn_submit')}</>}
            </button>
          </form>

          <div style={s.examplesWrap}>
            <p style={s.examplesTitle}>{t('saisie.examples_title')}</p>
            <div style={s.examplesList}>
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => setTexte(ex)} style={s.exampleChip}>
                  <IconPlus size={11} color="#64748B" />
                  <span>{ex}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — AI Result */}
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

          {!result && !loading && (
            <div style={s.emptyState}>
              <div style={s.emptyOrb}>
                <IconSparkles size={28} color="#7C3AED" />
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

          {loading && (
            <div style={s.loadingState}>
              <div style={s.loadingOrb}>
                <div style={s.loadingSpinnerWrap}>
                  <div className="spinner" style={{ borderColor: 'rgba(124,58,237,0.2)', borderTopColor: '#7C3AED', width: 28, height: 28, borderWidth: 3 }} />
                </div>
              </div>
              <p style={s.loadingTitle}>{t('saisie.analyzing')}</p>
              <p style={s.loadingText}>{t('saisie.pcm_note')}</p>
            </div>
          )}

          {result && (
            <div className="fade-in">
              <div style={s.successBanner}>
                <IconCheck size={15} color="#059669" />
                <span>{t('saisie.success')}</span>
              </div>

              <div style={s.summaryRow}>
                <div style={s.summaryChip}>
                  <span style={s.summaryKey}>{t('saisie.summary_type')}</span>
                  <span style={{ ...s.summaryBadge, background: '#EFF6FF', color: '#2563EB' }}>
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
                    <div style={{ ...s.entryCol, borderColor: '#6EE7B7', background: '#ECFDF5' }}>
                      <div style={{ ...s.entryColTag, color: '#059669', background: '#D1FAE5' }}>
                        {t('saisie.debit')}
                      </div>
                      <div style={s.entryCode}>{result.analyse_ia.compte_debit}</div>
                      <div style={s.entryName}>{result.analyse_ia.libelle_debit}</div>
                      <div style={{ ...s.entryAmount, color: '#059669' }}>
                        +{fmt(result.operation?.montant)} MRU
                      </div>
                    </div>
                    <div style={s.entrySeparator}>
                      <div style={s.entrySeparatorLine} />
                      <span style={s.entrySeparatorText}>/</span>
                      <div style={s.entrySeparatorLine} />
                    </div>
                    <div style={{ ...s.entryCol, borderColor: '#FECACA', background: '#FEF2F2' }}>
                      <div style={{ ...s.entryColTag, color: '#DC2626', background: '#FEE2E2' }}>
                        {t('saisie.credit')}
                      </div>
                      <div style={s.entryCode}>{result.analyse_ia.compte_credit}</div>
                      <div style={s.entryName}>{result.analyse_ia.libelle_credit}</div>
                      <div style={{ ...s.entryAmount, color: '#DC2626' }}>
                        -{fmt(result.operation?.montant)} MRU
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
                <IconPlus size={14} color="#2563EB" />
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
  pageTitle: { fontSize: 26, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.025em' },
  pageSubtitle: { marginTop: 4, fontSize: 13, color: 'var(--text-3)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, alignItems: 'start' },
  card: { background: 'var(--card)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22, paddingBottom: 18, borderBottom: '1px solid var(--border)' },
  cardIconWrap: { width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.2 },
  cardSub: { fontSize: 12, color: 'var(--text-3)', marginTop: 2 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 12.5, fontWeight: 600, color: '#374151' },
  input: { padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 9, fontSize: 14, color: 'var(--text-1)', background: '#FAFBFC', outline: 'none', transition: 'border-color 0.15s' },
  textarea: { padding: '12px', border: '1.5px solid var(--border)', borderRadius: 9, fontSize: 14, color: 'var(--text-1)', background: '#FAFBFC', outline: 'none', resize: 'vertical', transition: 'border-color 0.15s', lineHeight: 1.6 },
  errBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 12px' },
  errText: { color: '#DC2626', fontSize: 13, fontWeight: 500 },
  submitBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)', transition: 'opacity 0.15s' },
  examplesWrap: { marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border)' },
  examplesTitle: { fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 },
  examplesList: { display: 'flex', flexDirection: 'column', gap: 6 },
  exampleChip: { display: 'flex', alignItems: 'center', gap: 7, padding: '8px 11px', background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12.5, color: 'var(--text-2)', cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px', textAlign: 'center' },
  emptyOrb: { width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)', border: '2px solid #DDD6FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 },
  emptyText: { fontSize: 13, color: 'var(--text-3)', marginBottom: 16 },
  featureGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' },
  featureChip: { display: 'flex', alignItems: 'center', gap: 6, background: 'var(--success-light)', border: '1px solid #A7F3D0', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: '#059669', fontWeight: 500 },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px', textAlign: 'center' },
  loadingOrb: { width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  loadingSpinnerWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loadingTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 },
  loadingText: { fontSize: 13, color: 'var(--text-3)' },
  successBanner: { display: 'flex', alignItems: 'center', gap: 8, background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 9, padding: '11px 14px', color: '#059669', fontSize: 13.5, fontWeight: 600, marginBottom: 18 },
  summaryRow: { display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  summaryChip: { display: 'flex', flexDirection: 'column', gap: 3, background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 9, padding: '10px 14px', flex: 1 },
  summaryKey: { fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  summaryBadge: { display: 'inline-block', padding: '2px 8px', borderRadius: 99, fontSize: 12, fontWeight: 700 },
  summaryValue: { fontSize: 14, fontWeight: 700, color: 'var(--text-1)' },
  entryBox: { background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 12, padding: '16px', marginBottom: 18 },
  entryTitle: { fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 },
  entryColumns: { display: 'flex', alignItems: 'stretch', gap: 0 },
  entryCol: { flex: 1, border: '1.5px solid', borderRadius: 10, padding: '14px 12px', textAlign: 'center' },
  entryColTag: { display: 'inline-block', padding: '2px 10px', borderRadius: 99, fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', marginBottom: 10 },
  entryCode: { fontSize: 22, fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.01em', marginBottom: 4 },
  entryName: { fontSize: 11.5, color: 'var(--text-3)', lineHeight: 1.4, marginBottom: 10 },
  entryAmount: { fontSize: 14, fontWeight: 800 },
  entrySeparator: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 8px', gap: 4 },
  entrySeparatorLine: { flex: 1, width: 1, background: '#E2E8F0' },
  entrySeparatorText: { fontSize: 18, color: '#CBD5E1', fontWeight: 300 },
  explanation: { display: 'flex', alignItems: 'flex-start', gap: 7, marginTop: 12, padding: '10px 12px', background: '#F5F3FF', borderRadius: 8, border: '1px solid #DDD6FE', fontSize: 12.5, color: '#6D28D9', fontStyle: 'italic', lineHeight: 1.5 },
  newOpBtn: { display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center', width: '100%', padding: '11px', background: 'var(--primary-light)', border: '1.5px solid #BFDBFE', borderRadius: 9, fontSize: 13.5, fontWeight: 600, color: '#2563EB', cursor: 'pointer', transition: 'background 0.15s' },
};
