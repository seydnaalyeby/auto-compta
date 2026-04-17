import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { IconCheck } from '../Icons';

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

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'connexion') {
        await seConnecter({ username: form.username, password: form.password });
      } else {
        await sInscrire(form);
      }
      navigate('/dashboard');
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'object' ? Object.values(d).flat().join(' ') : 'Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  };

  const FEATURES = [
    t('auth.feature_1'),
    t('auth.feature_2'),
    t('auth.feature_3'),
    t('auth.feature_4'),
    t('auth.feature_5'),
  ];

  const fontFamily = isRTL
    ? "'Tajawal', 'Arial', sans-serif"
    : "'Inter', sans-serif";

  return (
    <div style={{ ...s.page, direction: isRTL ? 'rtl' : 'ltr', fontFamily }}>
      {/* Left panel */}
      <div style={s.left}>
        <div style={s.leftInner}>
          <div style={s.badge}>
            <span style={s.badgeLetters}>AC</span>
          </div>
          <h1 style={s.brand}>Auto-Compta</h1>
          <p style={s.tagline}>
            {isRTL
              ? 'محاسبة ذكية للمؤسسات الصغيرة والمتوسطة الموريتانية، مدعومة بالذكاء الاصطناعي.'
              : "Comptabilité intelligente pour les PME mauritaniennes, propulsée par l'IA."}
          </p>
          <div style={s.featureList}>
            {FEATURES.map((f, i) => (
              <div key={i} style={s.featureItem}>
                <div style={s.checkCircle}>
                  <IconCheck size={11} color="#fff" />
                </div>
                <span style={s.featureText}>{f}</span>
              </div>
            ))}
          </div>
          <div style={s.leftFooter}>
            <span style={s.footerText}>
              {isRTL ? 'متوافق مع المخطط المحاسبي BCM 1988' : 'Conforme au Plan Comptable BCM 1988'}
            </span>
          </div>
        </div>
        <div style={{ ...s.decor, width: 320, height: 320, top: -80, right: -80, opacity: 0.06 }} />
        <div style={{ ...s.decor, width: 200, height: 200, bottom: 40, left: -60, opacity: 0.05 }} />
      </div>

      {/* Right panel */}
      <div style={s.right}>
        {/* Language toggle on auth page */}
        <div style={s.langToggleAuth}>
          <button onClick={() => setLang('fr')} style={{ ...s.langBtn, ...(lang === 'fr' ? s.langBtnActive : {}) }}>FR</button>
          <button onClick={() => setLang('ar')} style={{ ...s.langBtn, ...(lang === 'ar' ? s.langBtnActive : {}) }}>ع</button>
        </div>

        <div style={s.formBox}>
          <div style={s.tabs}>
            {['connexion', 'inscription'].map(m => (
              <button key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{ ...s.tab, ...(mode === m ? s.tabActive : {}) }}>
                {m === 'connexion' ? t('auth.login_tab') : t('auth.register_tab')}
              </button>
            ))}
          </div>

          <h2 style={s.formTitle}>
            {mode === 'connexion'
              ? (isRTL ? 'مرحباً بعودتك!' : 'Bon retour !')
              : (isRTL ? 'إنشاء حسابك' : 'Créer votre compte')}
          </h2>
          <p style={s.formSub}>
            {mode === 'connexion'
              ? (isRTL ? 'سجّل الدخول إلى فضائك المحاسبي.' : 'Connectez-vous à votre espace comptable.')
              : (isRTL ? 'ابدأ مع Auto-Compta مجاناً.' : 'Démarrez avec Auto-Compta gratuitement.')}
          </p>

          {error && (
            <div style={s.errBox}>
              <span style={s.errText}>{error}</span>
            </div>
          )}

          <form onSubmit={submit} style={s.form}>
            <Field label={isRTL ? 'اسم المستخدم' : "Nom d'utilisateur"} name="username" value={form.username}
              onChange={change} placeholder={isRTL ? 'المعرف' : 'votre_identifiant'} required />

            {mode === 'inscription' && <>
              <Field label={t('auth.email')} name="email" type="email" value={form.email}
                onChange={change} placeholder="vous@exemple.com" required />
              <Field label={t('auth.company')} name="nom_entreprise" value={form.nom_entreprise}
                onChange={change} placeholder="Ma Société SARL" required />
              <div style={s.row}>
                <Field label={t('auth.sector')} name="secteur" value={form.secteur}
                  onChange={change} placeholder={isRTL ? 'تجارة، صيدلانية…' : 'Commerce, Pharmacie…'} />
                <Field label={isRTL ? 'الهاتف' : 'Téléphone'} name="telephone" value={form.telephone}
                  onChange={change} placeholder="+222 XX XX XX XX" />
              </div>
            </>}

            <Field label={t('auth.password')} name="password" type="password" value={form.password}
              onChange={change} placeholder="••••••••" required />

            {mode === 'inscription' && (
              <Field label={isRTL ? 'تأكيد كلمة المرور' : 'Confirmer le mot de passe'} name="password2" type="password"
                value={form.password2} onChange={change} placeholder="••••••••" required />
            )}

            <button type="submit" style={{ ...s.submitBtn, opacity: loading ? 0.75 : 1 }} disabled={loading}>
              {loading
                ? <><span className="spinner" /> &nbsp;{mode === 'connexion' ? t('auth.loading') : t('auth.registering')}</>
                : mode === 'connexion' ? t('auth.submit_login') : t('auth.submit_register')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      <input name={name} type={type} value={value} onChange={onChange}
        placeholder={placeholder} required={required} style={s.input} />
    </div>
  );
}

const s = {
  page: { display: 'flex', minHeight: '100vh' },
  left: { flex: '0 0 42%', background: 'linear-gradient(160deg, #0F172A 0%, #1E3A8A 60%, #1D4ED8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 48px', position: 'relative', overflow: 'hidden' },
  leftInner: { position: 'relative', zIndex: 2, maxWidth: 380 },
  badge: { width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #60A5FA, #A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 8px 24px rgba(96,165,250,0.35)' },
  badgeLetters: { color: '#fff', fontWeight: 900, fontSize: 20, letterSpacing: '-0.02em' },
  brand: { color: '#fff', fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 12, lineHeight: 1.1 },
  tagline: { color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.6, marginBottom: 36 },
  featureList: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 48 },
  featureItem: { display: 'flex', alignItems: 'center', gap: 12 },
  checkCircle: { width: 20, height: 20, borderRadius: '50%', background: 'rgba(96,165,250,0.2)', border: '1.5px solid rgba(96,165,250,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  featureText: { color: 'rgba(255,255,255,0.75)', fontSize: 13.5, fontWeight: 400 },
  leftFooter: { paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)' },
  footerText: { color: 'rgba(255,255,255,0.35)', fontSize: 12 },
  decor: { position: 'absolute', borderRadius: '50%', background: '#fff', pointerEvents: 'none' },
  right: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '40px 24px', position: 'relative' },
  langToggleAuth: { position: 'absolute', top: 20, right: 20, display: 'flex', background: '#E2E8F0', borderRadius: 8, padding: 3, gap: 2 },
  langBtn: { padding: '4px 12px', borderRadius: 6, border: 'none', background: 'transparent', color: '#64748B', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' },
  langBtnActive: { background: '#fff', color: '#2563EB', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  formBox: { background: '#fff', borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' },
  tabs: { display: 'flex', borderRadius: 10, background: '#F1F5F9', padding: 4, marginBottom: 28 },
  tab: { flex: 1, padding: '9px 0', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13.5, fontWeight: 500, color: '#64748B', transition: 'background 0.15s, color 0.15s' },
  tabActive: { background: '#fff', color: '#0F172A', fontWeight: 700, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  formTitle: { fontSize: 22, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 6 },
  formSub: { fontSize: 13, color: '#64748B', marginBottom: 24 },
  errBox: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '10px 14px', marginBottom: 16 },
  errText: { color: '#DC2626', fontSize: 13, fontWeight: 500 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 12.5, fontWeight: 600, color: '#374151', letterSpacing: '0.01em' },
  input: { padding: '11px 13px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 14, color: '#0F172A', background: '#FAFAFA', transition: 'border-color 0.15s', outline: 'none' },
  submitBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4, boxShadow: '0 4px 16px rgba(37,99,235,0.35)', transition: 'opacity 0.15s', letterSpacing: '-0.01em' },
};
