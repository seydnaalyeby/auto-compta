import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { IconCheck } from '../Icons';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return isMobile;
}

export default function Auth() {
  const [mode, setMode] = useState('connexion');
  const [form, setForm] = useState({
    username: '', email: '', password: '', password2: '',
    nom_entreprise: '', secteur: '', telephone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { seConnecter, sInscrire } = useAuth();
  const { t, lang, setLang, isRTL } = useLanguage();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (mode === 'connexion') await seConnecter({ username: form.username, password: form.password });
      else await sInscrire(form);
      navigate('/dashboard');
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'object' ? Object.values(d).flat().join(' ') : 'Erreur de connexion.');
    } finally { setLoading(false); }
  };

  const FEATURES = [
    t('auth.feature_1'), t('auth.feature_2'), t('auth.feature_3'),
    t('auth.feature_4'), t('auth.feature_5'),
  ];

  const font = isRTL ? "'Tajawal', Arial, sans-serif" : "'Plus Jakarta Sans', system-ui, sans-serif";

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      minHeight: '100vh',
      fontFamily: font,
      direction: isRTL ? 'rtl' : 'ltr',
    }}>

      {/* ══════ LEFT PANEL ══════ */}
      {isMobile ? (
        /* Mobile: compact top banner */
        <div style={s.mobileBanner}>
          <div style={s.brand}>
            <div style={s.brandIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 3h7v7H3z" fill="#93C5FD"/>
                <path d="M14 3h7v7h-7z" fill="#A5B4FC" opacity=".9"/>
                <path d="M3 14h7v7H3z" fill="#6EE7B7" opacity=".9"/>
                <path d="M14 14h7v7h-7z" fill="#FDE68A" opacity=".9"/>
              </svg>
            </div>
            <span style={s.brandName}>Auto-Compta</span>
          </div>
          <p style={s.mobileSub}>
            {isRTL ? 'محاسبة ذكية · BCM 1988' : 'Comptabilité intelligente · BCM 1988'}
          </p>
        </div>
      ) : (
        /* Desktop: full left panel */
        <div style={s.left}>
          <div style={{ ...s.ring, width: 480, height: 480, top: -160, right: -160, opacity: 0.04 }} />
          <div style={{ ...s.ring, width: 300, height: 300, bottom: -60, left: -100, opacity: 0.04 }} />
          <div style={{ ...s.dot, top: '28%', right: '14%' }} />
          <div style={{ ...s.dot, bottom: '32%', left: '16%', width: 7, height: 7 }} />

          <div style={s.leftInner}>
            <div style={s.brand}>
              <div style={s.brandIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3h7v7H3z" fill="#93C5FD"/>
                  <path d="M14 3h7v7h-7z" fill="#A5B4FC" opacity=".9"/>
                  <path d="M3 14h7v7H3z" fill="#6EE7B7" opacity=".9"/>
                  <path d="M14 14h7v7h-7z" fill="#FDE68A" opacity=".9"/>
                </svg>
              </div>
              <span style={s.brandName}>Auto-Compta</span>
            </div>

            <h1 style={s.hero}>
              {isRTL ? 'محاسبة ذكية لمؤسستك' : 'La comptabilité\nintelligente'}
            </h1>
            <p style={s.tagline}>
              {isRTL
                ? 'حلول محاسبية متكاملة للمؤسسات الصغيرة والمتوسطة الموريتانية، مدعومة بالذكاء الاصطناعي.'
                : "Conforme au Plan Comptable Mauritanien BCM 1988. Propulsé par l'IA Gemini."}
            </p>

            <div style={s.featureList}>
              {FEATURES.map((f, i) => (
                <div key={i} style={s.feature}>
                  <div style={s.checkWrap}><IconCheck size={10} color="#60A5FA" /></div>
                  <span style={s.featureText}>{f}</span>
                </div>
              ))}
            </div>

            <div style={s.statsBar}>
              {[
                { v: 'BCM', l: isRTL ? 'المعيار' : 'Norme' },
                { v: 'PCM', l: isRTL ? 'المخطط' : 'Plan' },
                { v: '1988', l: isRTL ? 'إصدار' : 'Version' },
              ].map((stat, i, arr) => (
                <React.Fragment key={i}>
                  <div style={s.statItem}>
                    <span style={s.statVal}>{stat.v}</span>
                    <span style={s.statLbl}>{stat.l}</span>
                  </div>
                  {i < arr.length - 1 && <div style={s.statSep} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════ RIGHT PANEL ══════ */}
      <div style={{
        ...s.right,
        padding: isMobile ? '20px 16px 40px' : '40px 24px',
        justifyContent: isMobile ? 'flex-start' : 'center',
      }}>
        {/* Language toggle */}
        <div style={{ ...s.langRow, position: isMobile ? 'static' : 'absolute', marginBottom: isMobile ? 16 : 0, alignSelf: 'flex-end' }}>
          {['fr', 'ar'].map(l => (
            <button key={l} onClick={() => setLang(l)}
              style={{ ...s.langBtn, ...(lang === l ? s.langBtnOn : {}) }}>
              {l === 'fr' ? 'FR' : 'ع'}
            </button>
          ))}
        </div>

        <div style={{
          ...s.formWrap,
          padding: isMobile ? '24px 20px' : '40px 40px',
          borderRadius: isMobile ? 18 : 24,
        }}>
          {/* Tabs */}
          <div style={s.tabs}>
            {['connexion', 'inscription'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                style={{ ...s.tab, ...(mode === m ? s.tabOn : {}) }}>
                {m === 'connexion' ? t('auth.login_tab') : t('auth.register_tab')}
              </button>
            ))}
          </div>

          <h2 style={{ ...s.formTitle, fontSize: isMobile ? 20 : 24 }}>
            {mode === 'connexion'
              ? (isRTL ? 'مرحباً بعودتك !' : 'Bon retour !')
              : (isRTL ? 'إنشاء حسابك' : 'Créer votre compte')}
          </h2>
          <p style={s.formSub}>
            {mode === 'connexion'
              ? (isRTL ? 'سجّل الدخول إلى فضائك المحاسبي.' : 'Connectez-vous à votre espace comptable.')
              : (isRTL ? 'ابدأ مع Auto-Compta مجاناً.' : 'Démarrez avec Auto-Compta gratuitement.')}
          </p>

          {error && (
            <div style={s.errBox}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span style={s.errText}>{error}</span>
            </div>
          )}

          <form onSubmit={submit} style={s.form}>
            <Field label={isRTL ? 'اسم المستخدم' : "Nom d'utilisateur"}
              name="username" value={form.username} onChange={change}
              placeholder={isRTL ? 'المعرف' : 'votre_identifiant'} required />

            {mode === 'inscription' && <>
              <Field label={t('auth.email')} name="email" type="email"
                value={form.email} onChange={change} placeholder="vous@exemple.com" required />
              <Field label={t('auth.company')} name="nom_entreprise"
                value={form.nom_entreprise} onChange={change} placeholder="Ma Société SARL" required />
              <div style={{ ...s.twoCol, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
                <Field label={t('auth.sector')} name="secteur" value={form.secteur}
                  onChange={change} placeholder={isRTL ? 'تجارة…' : 'Commerce…'} />
                <Field label={isRTL ? 'الهاتف' : 'Téléphone'} name="telephone"
                  value={form.telephone} onChange={change} placeholder="+222 XX XX XX" />
              </div>
            </>}

            <Field label={t('auth.password')} name="password" type="password"
              value={form.password} onChange={change} placeholder="••••••••" required />

            {mode === 'inscription' && (
              <Field label={isRTL ? 'تأكيد كلمة المرور' : 'Confirmer le mot de passe'}
                name="password2" type="password"
                value={form.password2} onChange={change} placeholder="••••••••" required />
            )}

            <button type="submit" style={{ ...s.submitBtn, opacity: loading ? 0.75 : 1 }} disabled={loading}>
              {loading
                ? <><span className="spinner" />&nbsp;{mode === 'connexion' ? t('auth.loading') : t('auth.registering')}</>
                : mode === 'connexion' ? t('auth.submit_login') : t('auth.submit_register')}
            </button>
          </form>

          <div style={s.footer}>
            <span style={s.footerText}>
              {mode === 'connexion'
                ? (isRTL ? 'ليس لديك حساب؟' : "Pas encore de compte ?")
                : (isRTL ? 'لديك حساب؟' : "Vous avez déjà un compte ?")}
            </span>
            <button onClick={() => { setMode(mode === 'connexion' ? 'inscription' : 'connexion'); setError(''); }}
              style={s.switchBtn}>
              {mode === 'connexion'
                ? (isRTL ? 'أنشئ حساباً' : "Créer un compte")
                : (isRTL ? 'تسجيل الدخول' : "Se connecter")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div style={sf.field}>
      <label style={sf.label}>{label}</label>
      <input name={name} type={type} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        className="input-field" style={sf.input} />
    </div>
  );
}

const s = {
  mobileBanner: {
    background: 'linear-gradient(135deg, #0A1628 0%, #1D4ED8 100%)',
    padding: '20px 20px 18px',
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  mobileSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 },

  left: {
    flex: '0 0 44%',
    background: 'linear-gradient(145deg, #0A1628 0%, #0F2040 45%, #162E5C 75%, #1D4ED8 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '60px 52px', position: 'relative', overflow: 'hidden',
  },
  leftInner: { position: 'relative', zIndex: 2, maxWidth: 400, width: '100%' },
  ring: { position: 'absolute', borderRadius: '50%', border: '1px solid #fff', pointerEvents: 'none' },
  dot:  { position: 'absolute', width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', pointerEvents: 'none' },

  brand: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 },
  brandIcon: {
    width: 40, height: 40, borderRadius: 12,
    background: 'rgba(255,255,255,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
  },
  brandName: { color: '#fff', fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' },

  hero: {
    fontSize: 38, fontWeight: 900, color: '#fff',
    letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: 16,
    whiteSpace: 'pre-line',
  },
  tagline: { color: 'rgba(255,255,255,0.5)', fontSize: 14.5, lineHeight: 1.7, marginBottom: 36 },

  featureList: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 },
  feature: { display: 'flex', alignItems: 'center', gap: 12 },
  checkWrap: {
    width: 22, height: 22, borderRadius: '50%',
    background: 'rgba(96,165,250,0.12)',
    border: '1.5px solid rgba(96,165,250,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  featureText: { color: 'rgba(255,255,255,0.65)', fontSize: 13.5, lineHeight: 1.4 },

  statsBar: {
    display: 'flex', alignItems: 'center',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 14, padding: '14px 22px',
  },
  statItem:  { flex: 1, textAlign: 'center' },
  statVal:   { display: 'block', color: '#93C5FD', fontSize: 17, fontWeight: 900, letterSpacing: '-0.01em' },
  statLbl:   { display: 'block', color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' },
  statSep:   { width: 1, height: 38, background: 'rgba(255,255,255,0.08)', flexShrink: 0 },

  right: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center',
    background: '#F5F7FD', position: 'relative',
  },
  langRow: {
    display: 'flex', background: '#E8EDF7', borderRadius: 10, padding: 3, gap: 2,
    top: 22, right: 22,
  },
  langBtn: {
    padding: '5px 14px', borderRadius: 8, border: 'none',
    background: 'transparent', color: '#6B7A99',
    fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: 'all 0.15s',
  },
  langBtnOn: { background: '#fff', color: '#2563EB', boxShadow: '0 1px 6px rgba(0,0,0,0.12)' },

  formWrap: {
    background: '#fff',
    width: '100%', maxWidth: 460,
    boxShadow: '0 4px 6px rgba(13,21,38,0.04), 0 20px 60px rgba(13,21,38,0.10)',
    border: '1px solid rgba(13,21,38,0.06)',
  },

  tabs: {
    display: 'flex', background: '#F0F4FB', borderRadius: 12, padding: 4, gap: 3, marginBottom: 24,
  },
  tab: {
    flex: 1, padding: '9px', border: 'none', borderRadius: 9,
    background: 'transparent', cursor: 'pointer',
    fontSize: 13.5, fontWeight: 600, color: '#6B7A99', transition: 'all 0.15s',
  },
  tabOn: {
    background: '#fff', color: '#0D1526', fontWeight: 800,
    boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
  },

  formTitle: { fontWeight: 900, color: '#0D1526', letterSpacing: '-0.025em', marginBottom: 6 },
  formSub:   { fontSize: 13.5, color: '#6B7A99', marginBottom: 20, lineHeight: 1.5 },

  errBox: {
    display: 'flex', alignItems: 'center', gap: 9,
    background: '#FEF2F2', border: '1px solid #FECACA',
    borderRadius: 10, padding: '11px 14px', marginBottom: 16,
  },
  errText: { color: '#DC2626', fontSize: 13, fontWeight: 600 },

  form:   { display: 'flex', flexDirection: 'column', gap: 14 },
  twoCol: { display: 'grid', gap: 12 },

  submitBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '13px', marginTop: 4,
    background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
    color: '#fff', border: 'none', borderRadius: 12,
    fontSize: 15, fontWeight: 800, cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(37,99,235,0.38)',
    transition: 'opacity 0.15s, transform 0.15s',
    letterSpacing: '-0.01em',
  },

  footer: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 7, marginTop: 20, flexWrap: 'wrap',
  },
  footerText: { fontSize: 13, color: '#6B7A99' },
  switchBtn: {
    fontSize: 13, fontWeight: 800, color: '#2563EB',
    background: 'none', border: 'none', cursor: 'pointer',
    textDecoration: 'underline', textUnderlineOffset: 3,
  },
};

const sf = {
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12.5, fontWeight: 700, color: '#374151', letterSpacing: '0.01em' },
  input: { fontSize: 14, borderRadius: 10 },
};
