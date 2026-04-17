import React, { useState } from 'react';
import { corrigerImage, corrigerTexte } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { IconCamera, IconFile, IconSparkles, IconUpload, IconCheck, IconAlert, IconInfo } from '../Icons';

const EXAMPLE_TEXT = `BILAN AU 31/12/2024
ACTIF:
  Caisse: 5000 MRU
  Banque: 3000 MRU
  Stock: 8000 MRU
TOTAL ACTIF: 14000 MRU

PASSIF:
  Capital: 10000 MRU
  Fournisseurs: 2000 MRU
TOTAL PASSIF: 12000 MRU`;

export default function Correction() {
  const [mode, setMode] = useState('image');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [texte, setTexte] = useState('');
  const [resultat, setResultat] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const { t } = useLanguage();

  const choisirImage = e => {
    const f = e.target.files[0];
    if (!f) return;
    setImage(f);
    setImagePreview(URL.createObjectURL(f));
    setResultat(null);
  };

  const analyser = async () => {
    setChargement(true);
    setErreur('');
    setResultat(null);
    try {
      let res;
      if (mode === 'image' && image) {
        const fd = new FormData();
        fd.append('image', image);
        res = await corrigerImage(fd);
      } else if (mode === 'texte' && texte) {
        res = await corrigerTexte({ texte });
      } else {
        setErreur(mode === 'image' ? 'Veuillez sélectionner une image.' : 'Veuillez coller un document.');
        setChargement(false);
        return;
      }
      setResultat(res.data);
    } catch (err) {
      setErreur(err.response?.data?.error || "Erreur lors de l'analyse IA.");
    } finally {
      setChargement(false);
    }
  };

  const reset = () => { setImage(null); setImagePreview(null); setResultat(null); setErreur(''); };

  const ERROR_TYPE_LABELS = {
    desequilibre: t('bilan.unbalanced'),
    mauvais_compte: t('correc.problem'),
    montant_incorrect: 'Montant incorrect',
    autre: 'Erreur',
  };

  const TABS = [
    { id: 'image', label: t('correc.tab_image'), Icon: IconCamera },
    { id: 'texte', label: t('correc.tab_text'),  Icon: IconFile },
  ];

  return (
    <div className="fade-in">
      <div style={s.header}>
        <div>
          <h1 style={s.title}>{t('correc.title')}</h1>
          <p style={s.subtitle}>{t('correc.subtitle')}</p>
        </div>
      </div>

      <div style={s.tabs}>
        {TABS.map(tab => (
          <button key={tab.id}
            onClick={() => { setMode(tab.id); setResultat(null); setErreur(''); }}
            style={{ ...s.tab, ...(mode === tab.id ? s.tabActive : {}) }}>
            <tab.Icon size={15} color={mode === tab.id ? '#2563EB' : '#64748B'} />
            {tab.label}
          </button>
        ))}
      </div>

      <div style={s.grid}>
        {/* Left — Input */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={{ ...s.cardIconWrap, background: mode === 'image' ? '#EFF6FF' : '#F5F3FF' }}>
              {mode === 'image' ? <IconCamera size={16} color="#2563EB" /> : <IconFile size={16} color="#7C3AED" />}
            </div>
            <div>
              <h2 style={s.cardTitle}>
                {mode === 'image'
                  ? (t('nav.correction') + ' — ' + t('correc.tab_image'))
                  : (t('nav.correction') + ' — ' + t('correc.tab_text'))}
              </h2>
              <p style={s.cardSub}>Bilan · Compte de résultat · Journal comptable</p>
            </div>
          </div>

          {mode === 'image' ? (
            <div>
              <div className="upload-zone" style={{ ...s.uploadZone, ...(imagePreview ? s.uploadZoneHasFile : {}) }}
                onClick={() => document.getElementById('fileInput').click()}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Document" style={s.preview} />
                ) : (
                  <div style={s.uploadPlaceholder}>
                    <div style={s.uploadIconWrap}>
                      <IconUpload size={24} color="#94A3B8" />
                    </div>
                    <p style={s.uploadTitle}>{t('correc.upload_hint')}</p>
                    <p style={s.uploadSub}>{t('correc.upload_sub')}</p>
                  </div>
                )}
              </div>
              <input id="fileInput" type="file" accept="image/*" onChange={choisirImage} style={{ display: 'none' }} />
              {imagePreview && (
                <button onClick={reset} style={s.changeBtn}>{t('correc.change_image')}</button>
              )}
            </div>
          ) : (
            <div>
              <button onClick={() => setTexte(EXAMPLE_TEXT)} style={s.exampleBtn}>
                <IconInfo size={13} color="#2563EB" />
                {t('nav.bilan')} — exemple
              </button>
              <textarea
                value={texte}
                onChange={e => setTexte(e.target.value)}
                placeholder={t('correc.text_placeholder')}
                className="input-field"
                style={s.textarea}
                rows={12}
              />
            </div>
          )}

          {erreur && (
            <div style={s.errBox}>
              <IconAlert size={14} color="#DC2626" />
              <span style={s.errText}>{erreur}</span>
            </div>
          )}

          <button onClick={analyser} style={{ ...s.analyzeBtn, opacity: chargement ? 0.75 : 1 }}
            disabled={chargement} className="btn-primary">
            {chargement
              ? <><span className="spinner" /> {t('correc.loading')}</>
              : <><IconSparkles size={15} color="#fff" /> {t('correc.btn_analyze')}</>}
          </button>

          <div style={s.infoBox}>
            <div style={s.infoHeader}>
              <IconInfo size={14} color="#2563EB" />
              <span style={s.infoTitle}>Comment ça marche</span>
            </div>
            <ul style={s.infoList}>
              <li>Prenez une photo ou copiez votre document comptable</li>
              <li>L'IA vérifie les règles du Plan Comptable Mauritanien</li>
              <li>Toutes les erreurs sont listées avec des corrections suggérées</li>
            </ul>
          </div>
        </div>

        {/* Right — Results */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={{ ...s.cardIconWrap, background: '#F5F3FF' }}>
              <IconSparkles size={16} color="#7C3AED" />
            </div>
            <div>
              <h2 style={s.cardTitle}>Résultat de l'analyse</h2>
              <p style={s.cardSub}>Plan Comptable Mauritanien BCM 1988</p>
            </div>
          </div>

          {!resultat && !chargement && (
            <div style={s.emptyState}>
              <div style={s.emptyOrb}><IconSparkles size={28} color="#7C3AED" /></div>
              <p style={s.emptyTitle}>{t('saisie.waiting')}</p>
              <p style={s.emptyText}>{t('correc.ai_analyzing')}</p>
              <div style={s.featureGrid}>
                {['Actif ≠ Passif', 'Mauvais comptes PCM', 'Erreurs de calcul', 'Incohérences'].map((f, i) => (
                  <div key={i} style={s.featureChip}>
                    <IconCheck size={11} color="#059669" /><span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {chargement && (
            <div style={s.loadingState}>
              <div style={s.loadingOrb}>
                <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3, borderColor: 'rgba(124,58,237,0.2)', borderTopColor: '#7C3AED' }} />
              </div>
              <p style={s.loadingTitle}>{t('correc.loading')}</p>
              <p style={s.loadingText}>L'IA vérifie votre document selon le Plan Comptable Mauritanien</p>
            </div>
          )}

          {resultat && (
            <div className="fade-in">
              <div style={s.docTypeBadge}>
                <IconFile size={13} color="#475569" />
                <span>Document : <strong>{resultat.document_type || 'Inconnu'}</strong></span>
              </div>

              <div style={{ ...s.balanceStatus, background: resultat.est_equilibre ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${resultat.est_equilibre ? '#A7F3D0' : '#FECACA'}` }}>
                <div style={s.balanceStatusIcon}>
                  {resultat.est_equilibre ? <IconCheck size={18} color="#059669" /> : <IconAlert size={18} color="#DC2626" />}
                </div>
                <div>
                  <p style={{ ...s.balanceStatusTitle, color: resultat.est_equilibre ? '#059669' : '#DC2626' }}>
                    {resultat.est_equilibre ? t('bilan.balanced') : t('bilan.unbalanced') + ' !'}
                  </p>
                  {resultat.total_actif !== undefined && (
                    <p style={s.balanceStatusSub}>
                      {t('bilan.actif_title')} : {Number(resultat.total_actif || 0).toLocaleString()} MRU · {t('bilan.passif_title')} : {Number(resultat.total_passif || 0).toLocaleString()} MRU
                    </p>
                  )}
                </div>
              </div>

              {resultat.erreurs?.length > 0 ? (
                <div style={s.errorsSection}>
                  <p style={s.errorsTitle}>
                    <span style={s.errorsCount}>{resultat.erreurs.length}</span>
                    {resultat.erreurs.length} {t('correc.errors_found')}
                  </p>
                  {resultat.erreurs.map((err, i) => (
                    <div key={i} style={s.errorCard}>
                      <div style={s.errorCardTop}>
                        <div style={s.errorNum}>#{i + 1}</div>
                        <span style={s.errorTypeBadge}>{ERROR_TYPE_LABELS[err.type_erreur] || err.type_erreur}</span>
                      </div>
                      <div style={s.errorRow}>
                        <span style={s.errorRowKey}>Ligne :</span>
                        <span style={s.errorRowVal}>{err.ligne}</span>
                      </div>
                      <div style={s.errorRow}>
                        <span style={s.errorRowKey}>{t('correc.problem')} :</span>
                        <span style={{ ...s.errorRowVal, color: '#DC2626' }}>{err.description}</span>
                      </div>
                      <div style={{ ...s.errorRow, borderBottom: 'none' }}>
                        <span style={s.errorRowKey}>{t('correc.correction')} :</span>
                        <span style={{ ...s.errorRowVal, color: '#059669', fontWeight: 600 }}>{err.correction_suggeree}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={s.noErrors}>
                  <IconCheck size={16} color="#059669" />
                  {t('correc.no_errors')} — {t('correc.no_errors_sub')}
                </div>
              )}

              {resultat.avertissements?.length > 0 && (
                <div style={s.warningsBox}>
                  <p style={s.warningsTitle}>{t('correc.warnings')}</p>
                  {resultat.avertissements.map((a, i) => <p key={i} style={s.warningItem}>· {a}</p>)}
                </div>
              )}

              {resultat.resume && (
                <div style={s.resumeBox}>
                  <p style={s.resumeTitle}>{t('correc.summary')}</p>
                  <p style={s.resumeText}>{resultat.resume}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.025em', margin: 0 },
  subtitle: { marginTop: 4, fontSize: 13, color: 'var(--text-3)' },
  tabs: { display: 'flex', gap: 6, marginBottom: 20 },
  tab: { display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', border: '1.5px solid var(--border)', borderRadius: 9, background: '#fff', fontSize: 13.5, fontWeight: 500, color: 'var(--text-2)', cursor: 'pointer', transition: 'all 0.15s' },
  tabActive: { borderColor: '#BFDBFE', background: '#EFF6FF', color: '#2563EB', fontWeight: 700 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 },
  card: { background: 'var(--card)', borderRadius: 'var(--radius-lg)', padding: '22px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' },
  cardIconWrap: { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-1)', margin: 0 },
  cardSub: { fontSize: 12, color: 'var(--text-3)', marginTop: 2 },
  uploadZone: { minHeight: 200, marginBottom: 12, padding: 20 },
  uploadZoneHasFile: { padding: 8, minHeight: 'auto' },
  uploadPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' },
  uploadIconWrap: { width: 52, height: 52, borderRadius: 14, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  uploadTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text-1)' },
  uploadSub: { fontSize: 12, color: 'var(--text-3)' },
  preview: { maxWidth: '100%', maxHeight: 280, borderRadius: 10, display: 'block' },
  changeBtn: { display: 'block', background: 'none', border: '1px solid #FECACA', color: '#DC2626', padding: '6px 14px', borderRadius: 7, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', marginBottom: 14, transition: 'background 0.15s' },
  exampleBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', padding: '7px 14px', borderRadius: 7, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', marginBottom: 10 },
  textarea: { height: 220, resize: 'vertical', fontFamily: "'Courier New', monospace", fontSize: 12.5, lineHeight: 1.7 },
  errBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 12px', marginBottom: 14 },
  errText: { color: '#DC2626', fontSize: 13, fontWeight: 500 },
  analyzeBtn: { width: '100%', padding: '12px', marginBottom: 16, borderRadius: 10, fontSize: 14.5, fontWeight: 700 },
  infoBox: { background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 9, padding: '12px 14px' },
  infoHeader: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 },
  infoTitle: { fontSize: 12.5, fontWeight: 700, color: '#0369A1' },
  infoList: { paddingLeft: 16, listStyle: 'disc', fontSize: 12.5, color: '#0369A1', lineHeight: 1.8 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px', textAlign: 'center' },
  emptyOrb: { width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)', border: '2px solid #DDD6FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 },
  emptyText: { fontSize: 13, color: 'var(--text-3)', marginBottom: 14 },
  featureGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, width: '100%' },
  featureChip: { display: 'flex', alignItems: 'center', gap: 6, background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 7, padding: '7px 10px', fontSize: 11.5, color: '#059669', fontWeight: 500 },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px', textAlign: 'center' },
  loadingOrb: { width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  loadingTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 },
  loadingText: { fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.5, maxWidth: 260 },
  docTypeBadge: { display: 'flex', alignItems: 'center', gap: 7, background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--text-2)', marginBottom: 12 },
  balanceStatus: { borderRadius: 10, padding: '12px 14px', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 10 },
  balanceStatusIcon: { flexShrink: 0, marginTop: 1 },
  balanceStatusTitle: { fontSize: 14, fontWeight: 700, marginBottom: 2 },
  balanceStatusSub: { fontSize: 12, color: 'var(--text-2)' },
  errorsSection: { marginBottom: 14 },
  errorsTitle: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 700, color: '#DC2626', marginBottom: 10 },
  errorsCount: { background: '#DC2626', color: '#fff', width: 22, height: 22, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 800, flexShrink: 0 },
  errorCard: { background: '#FFF9F9', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 14px', marginBottom: 8 },
  errorCardTop: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  errorNum: { background: '#DC2626', color: '#fff', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 },
  errorTypeBadge: { background: '#FEE2E2', color: '#DC2626', padding: '2px 9px', borderRadius: 99, fontSize: 11.5, fontWeight: 700 },
  errorRow: { display: 'flex', gap: 8, padding: '5px 0', borderBottom: '1px solid #FEE2E2', fontSize: 12.5 },
  errorRowKey: { color: 'var(--text-3)', fontWeight: 600, flexShrink: 0, minWidth: 70 },
  errorRowVal: { color: 'var(--text-1)', lineHeight: 1.4 },
  noErrors: { display: 'flex', alignItems: 'center', gap: 8, background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 9, padding: '12px 14px', fontSize: 13.5, color: '#059669', fontWeight: 600, marginBottom: 12 },
  warningsBox: { background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 9, padding: '12px 14px', marginBottom: 12 },
  warningsTitle: { fontSize: 12.5, fontWeight: 700, color: '#92400E', marginBottom: 6 },
  warningItem: { fontSize: 12.5, color: '#78350F', lineHeight: 1.6 },
  resumeBox: { background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 9, padding: '12px 14px' },
  resumeTitle: { fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 },
  resumeText: { fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 },
};
