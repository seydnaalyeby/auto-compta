import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import API from '../../services/api';
import { IconSparkles, IconCalculator, IconPlus, IconX, IconCheck, IconAlert, IconActivity } from '../Icons';

const fmt = n => {
  if (n === Infinity || n === undefined || n === null) return '—';
  return typeof n === 'number' ? n.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) : n;
};

const interpretBFR  = v => v < 0 ? { text: 'BFR maîtrisé',            ok: true  } : { text: 'BFR élevé',              ok: false };
const interpretVAN  = v => v > 0 ? { text: 'Projet rentable',           ok: true  } : { text: 'Projet non rentable',   ok: false };
const interpretIP   = v => v > 1 ? { text: 'Rentable',                  ok: true  } : { text: 'Non rentable',          ok: false };
const interpretDRSI = v => {
  if (v === Infinity) return { text: 'Récupération impossible', ok: false };
  if (v < 2) return { text: 'Récupération rapide', ok: true };
  if (v > 4) return { text: 'Risque élevé',        ok: false };
  return { text: 'Récupération normale', ok: null };
};
const interpretCAF  = v => v > 0 ? { text: 'Bonne capacité financière', ok: true } : { text: 'Difficulté financière', ok: false };

function IndicatorCard({ indicator, data }) {
  if (!data) return null;
  const rawVal = data[indicator.key];
  const interp = indicator.interpret(rawVal);
  const displayVal = indicator.key === 'drsi' && rawVal === Infinity ? 'Jamais' : `${fmt(rawVal)}${indicator.unit ? ' ' + indicator.unit : ''}`;
  return (
    <div style={s.indicCard} className="card-hover">
      <div style={s.indicTop}>
        <span style={s.indicCode}>{indicator.label}</span>
        <span style={{ ...s.indicBadge, background: interp.ok === true ? '#ECFDF5' : interp.ok === false ? '#FEF2F2' : '#FFFBEB', color: interp.ok === true ? '#059669' : interp.ok === false ? '#DC2626' : '#D97706' }}>
          {interp.ok === true ? <IconCheck size={10} color="#059669" /> : interp.ok === false ? <IconAlert size={10} color="#DC2626" /> : '~'}
          {interp.text}
        </span>
      </div>
      <div style={s.indicValue}>{displayVal}</div>
      <div style={s.indicName}>{indicator.name}</div>
    </div>
  );
}

export default function FinancialIndicatorsDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const INDICATORS = [
    { key: 'bfr',  label: 'BFR',  name: t('indic.bfr'),  unit: 'MRU', interpret: interpretBFR },
    { key: 'van',  label: 'VAN',  name: t('indic.van'),  unit: 'MRU', interpret: interpretVAN },
    { key: 'ip',   label: 'IP',   name: t('indic.ip'),   unit: '',    interpret: interpretIP },
    { key: 'drsi', label: 'DRSI', name: t('indic.drsi'), unit: 'ans', interpret: interpretDRSI },
    { key: 'caf',  label: 'CAF',  name: t('indic.caf'),  unit: 'MRU', interpret: interpretCAF },
  ];

  const [formData, setFormData] = useState({
    investmentInitial: '', discountRate: '', netResult: '',
    amortization: '', receivables: '', payables: '',
    cashFlows: [''],
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiResults, setAiResults] = useState(null);

  const handleInput = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleCF = (i, v) => { const cf = [...formData.cashFlows]; cf[i] = v; setFormData(p => ({ ...p, cashFlows: cf })); };
  const addCF    = () => setFormData(p => ({ ...p, cashFlows: [...p.cashFlows, ''] }));
  const removeCF = i  => setFormData(p => ({ ...p, cashFlows: p.cashFlows.filter((_, idx) => idx !== i) }));

  const calculate = async () => {
    setLoading(true); setError('');
    try {
      const { investmentInitial, discountRate, netResult, amortization, receivables, payables, cashFlows } = formData;
      if (!investmentInitial || !discountRate || !netResult || !amortization || !receivables || !payables) {
        setError('Veuillez remplir tous les champs obligatoires.'); setLoading(false); return;
      }
      const validCF = cashFlows.filter(c => c.trim() !== '');
      if (validCF.length === 0) { setError('Ajoutez au moins un flux de trésorerie.'); setLoading(false); return; }
      const res = await API.post('/financial-indicators/calculate/', {
        investmentInitial: parseFloat(investmentInitial),
        discountRate: parseFloat(discountRate) / 100,
        netResult: parseFloat(netResult),
        amortization: parseFloat(amortization),
        receivables: parseFloat(receivables),
        payables: parseFloat(payables),
        cashFlows: validCF.map(c => parseFloat(c)),
      });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du calcul.');
    } finally { setLoading(false); }
  };

  const calculateAI = async () => {
    setAiLoading(true); setAiError('');
    try {
      if (!aiText.trim()) { setAiError('Décrivez votre projet financier.'); setAiLoading(false); return; }
      const res = await API.post('/financial-indicators/calculate-ai/', { text: aiText.trim() });
      setAiResults(res.data);
    } catch (err) {
      setAiError(err.response?.data?.error || 'Erreur lors du calcul avec IA.');
    } finally { setAiLoading(false); }
  };

  if (!user) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '20px 28px', color: '#DC2626', fontWeight: 500 }}>
        Veuillez vous connecter pour accéder aux indicateurs financiers.
      </div>
    </div>
  );

  const FORM_FIELDS = [
    { name: 'investmentInitial', label: 'Investissement initial *', placeholder: '100 000' },
    { name: 'discountRate',      label: "Taux d'actualisation (%) *", placeholder: '10' },
    { name: 'netResult',         label: 'Résultat net *',    placeholder: '50 000' },
    { name: 'amortization',      label: 'Amortissement *',   placeholder: '20 000' },
    { name: 'receivables',       label: 'Créances *',        placeholder: '50 000' },
    { name: 'payables',          label: 'Dettes *',          placeholder: '30 000' },
  ];

  return (
    <div className="fade-in">
      <div style={s.header}>
        <div>
          <h1 style={s.title}>{t('indic.title')}</h1>
          <p style={s.subtitle}>{t('indic.subtitle')}</p>
        </div>
      </div>

      {/* AI Section */}
      <div style={s.aiCard}>
        <div style={s.aiCardHeader}>
          <div style={s.aiIconWrap}><IconSparkles size={18} color="#fff" /></div>
          <div>
            <h2 style={s.aiTitle}>{t('indic.ai_tab')}</h2>
            <p style={s.aiSub}>Décrivez votre projet en langage naturel — l'IA extrait les données et calcule les indicateurs.</p>
          </div>
        </div>

        <textarea
          value={aiText}
          onChange={e => setAiText(e.target.value)}
          placeholder="Ex : Je veux investir 100 000 MRU dans un projet qui générera 30 000 MRU la 1ère année, 40 000 MRU la 2e et 50 000 MRU la 3e. Taux d'actualisation : 10%. Résultat net : 50 000 MRU, amortissement : 20 000 MRU, créances : 50 000 MRU, dettes : 30 000 MRU."
          rows={5}
          style={s.aiTextarea}
        />

        {aiError && (
          <div style={s.aiError}>
            <IconAlert size={14} color="#DC2626" />
            <span>{aiError}</span>
          </div>
        )}

        <button onClick={calculateAI} disabled={aiLoading} style={{ ...s.aiBtn, opacity: aiLoading ? 0.75 : 1 }}>
          {aiLoading
            ? <><span className="spinner" /> {t('indic.ai_analyzing')}</>
            : <><IconSparkles size={15} color="#5B21B6" /> {t('indic.ai_analyze')}</>}
        </button>

        {aiResults && (
          <div style={s.aiResultsWrap} className="fade-in">
            <div style={s.aiResultsHeader}>
              <IconCheck size={14} color="#059669" />
              <span style={s.aiResultsTitle}>{t('indic.results')}</span>
            </div>
            <div style={s.extractedGrid}>
              {[
                { label: 'Investissement', val: `${aiResults.extractedData.investmentInitial?.toLocaleString()} MRU` },
                { label: "Taux d'actu.", val: `${(aiResults.extractedData.discountRate * 100).toFixed(1)}%` },
                { label: 'Résultat net', val: `${aiResults.extractedData.netResult?.toLocaleString()} MRU` },
                { label: 'Amortissement', val: `${aiResults.extractedData.amortization?.toLocaleString()} MRU` },
                { label: 'Créances', val: `${aiResults.extractedData.receivables?.toLocaleString()} MRU` },
                { label: 'Dettes', val: `${aiResults.extractedData.payables?.toLocaleString()} MRU` },
                { label: t('indic.cashflow_label'), val: `[${aiResults.extractedData.cashFlows?.map(c => c.toLocaleString()).join(', ')}] MRU` },
              ].map((item, i) => (
                <div key={i} style={s.extractedItem}>
                  <span style={s.extractedLabel}>{item.label}</span>
                  <span style={s.extractedValue}>{item.val}</span>
                </div>
              ))}
            </div>
            <p style={s.indicatorsSubtitle}>{t('indic.results')}</p>
            <div style={s.indicGrid}>
              {INDICATORS.map(ind => <IndicatorCard key={ind.key} indicator={ind} data={aiResults.indicators} />)}
            </div>
          </div>
        )}
      </div>

      {/* Manual form */}
      <div style={s.formCard}>
        <div style={s.formCardHeader}>
          <div style={s.formIconWrap}><IconCalculator size={17} color="#2563EB" /></div>
          <div>
            <h2 style={s.formTitle}>{t('indic.manual_tab')}</h2>
            <p style={s.formSub}>Saisissez les données financières pour calculer les indicateurs</p>
          </div>
        </div>

        <div style={s.formGrid}>
          {FORM_FIELDS.map(f => (
            <div key={f.name} style={s.field}>
              <label style={s.label}>{f.label}</label>
              <input type="number" name={f.name} value={formData[f.name]}
                onChange={handleInput} placeholder={f.placeholder}
                step="0.01" className="input-field" />
            </div>
          ))}
        </div>

        <div style={s.cfSection}>
          <label style={s.label}>{t('indic.cashflow_label')} *</label>
          <div style={s.cfList}>
            {formData.cashFlows.map((cf, i) => (
              <div key={i} style={s.cfRow}>
                <span style={s.cfLabel}>Année {i + 1}</span>
                <input type="number" value={cf} onChange={e => handleCF(i, e.target.value)}
                  placeholder="0" step="0.01" className="input-field" style={s.cfInput} />
                {formData.cashFlows.length > 1 && (
                  <button onClick={() => removeCF(i)} style={s.cfRemoveBtn} title="Supprimer">
                    <IconX size={13} color="#DC2626" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addCF} style={s.cfAddBtn}>
            <IconPlus size={13} color="#059669" />
            {t('indic.add_cashflow')}
          </button>
        </div>

        {error && (
          <div style={s.formError}>
            <IconAlert size={14} color="#DC2626" />
            <span>{error}</span>
          </div>
        )}

        <button onClick={calculate} disabled={loading} className="btn-primary"
          style={{ ...s.calcBtn, opacity: loading ? 0.75 : 1 }}>
          {loading
            ? <><span className="spinner" /> Calcul en cours…</>
            : <><IconActivity size={16} color="#fff" /> {t('indic.calculate')}</>}
        </button>
      </div>

      {results && (
        <div style={s.resultsCard} className="fade-in">
          <div style={s.resultsHeader}>
            <div style={s.resultsIconWrap}><IconCheck size={16} color="#059669" /></div>
            <h2 style={s.resultsTitle}>{t('indic.results')}</h2>
          </div>
          <div style={s.indicGrid}>
            {INDICATORS.map(ind => <IndicatorCard key={ind.key} indicator={ind} data={results} />)}
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.025em', margin: 0 },
  subtitle: { marginTop: 4, fontSize: 13, color: 'var(--text-3)' },
  aiCard: { background: 'linear-gradient(135deg, #1E1B4B 0%, #2D1B69 60%, #4C1D95 100%)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: 20, boxShadow: 'var(--shadow-md)' },
  aiCardHeader: { display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 },
  aiIconWrap: { width: 40, height: 40, borderRadius: 11, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  aiTitle: { fontSize: 17, fontWeight: 700, color: '#fff', margin: 0 },
  aiSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4, lineHeight: 1.5 },
  aiTextarea: { width: '100%', padding: '13px 14px', background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 13.5, color: '#fff', resize: 'vertical', lineHeight: 1.6, marginBottom: 12, fontFamily: 'inherit' },
  aiError: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, padding: '9px 12px', marginBottom: 12, fontSize: 13, color: '#FCA5A5' },
  aiBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px', background: '#fff', border: 'none', borderRadius: 10, fontSize: 14.5, fontWeight: 700, color: '#5B21B6', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
  aiResultsWrap: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '18px', marginTop: 20 },
  aiResultsHeader: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 },
  aiResultsTitle: { fontSize: 13.5, fontWeight: 700, color: '#A7F3D0' },
  extractedGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8, marginBottom: 20 },
  extractedItem: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px' },
  extractedLabel: { display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' },
  extractedValue: { fontSize: 13.5, fontWeight: 700, color: '#fff' },
  indicatorsSubtitle: { fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 },
  formCard: { background: 'var(--card)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: 20, boxShadow: 'var(--shadow)', border: '1px solid var(--border)' },
  formCardHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22, paddingBottom: 16, borderBottom: '1px solid var(--border)' },
  formIconWrap: { width: 38, height: 38, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  formTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-1)', margin: 0 },
  formSub: { fontSize: 12, color: 'var(--text-3)', marginTop: 2 },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 16, marginBottom: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)' },
  cfSection: { marginBottom: 20 },
  cfList: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, marginBottom: 10 },
  cfRow: { display: 'flex', alignItems: 'center', gap: 10 },
  cfLabel: { fontSize: 12.5, fontWeight: 600, color: 'var(--text-3)', minWidth: 60, flexShrink: 0 },
  cfInput: { flex: 1 },
  cfRemoveBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, background: '#FEF2F2', border: '1px solid #FECACA', cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s' },
  cfAddBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#059669', cursor: 'pointer' },
  formError: { display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 12px', marginBottom: 14, fontSize: 13, color: '#DC2626', fontWeight: 500 },
  calcBtn: { width: '100%', padding: '13px', borderRadius: 10, fontSize: 14.5, fontWeight: 700 },
  resultsCard: { background: 'var(--card)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' },
  resultsHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' },
  resultsIconWrap: { width: 32, height: 32, borderRadius: 9, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  resultsTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-1)', margin: 0 },
  indicGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 },
  indicCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px', boxShadow: 'var(--shadow-sm)' },
  indicTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 6 },
  indicCode: { fontSize: 11, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', background: '#F1F5F9', padding: '3px 7px', borderRadius: 5 },
  indicBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 99, fontSize: 10.5, fontWeight: 700 },
  indicValue: { fontSize: 20, fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.02em', marginBottom: 4, fontVariantNumeric: 'tabular-nums' },
  indicName: { fontSize: 11.5, color: 'var(--text-3)', fontWeight: 500, lineHeight: 1.3 },
};
