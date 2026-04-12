import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Auth() {
  const [mode, setMode] = useState('connexion');
  const [form, setForm] = useState({
    username: '', email: '', password: '', password2: '',
    nom_entreprise: '', secteur: '', telephone: ''
  });
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const { seConnecter, sInscrire } = useAuth();
  const navigate = useNavigate();

  const changer = e => setForm({ ...form, [e.target.name]: e.target.value });

  const soumettre = async e => {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      if (mode === 'connexion') {
        await seConnecter({ username: form.username, password: form.password });
      } else {
        await sInscrire(form);
      }
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object') {
        setErreur(Object.values(data).flat().join(' '));
      } else {
        setErreur('Erreur de connexion. Vérifiez vos informations.');
      }
    } finally {
      setChargement(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>AC</div>
          <h1 style={styles.logoText}>Auto-Compta</h1>
          <p style={styles.logoSub}>Comptabilité intelligente pour la Mauritanie</p>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {['connexion', 'inscription'].map(m => (
            <button key={m} style={{
              ...styles.tab,
              ...(mode === m ? styles.tabActive : {})
            }} onClick={() => setMode(m)}>
              {m === 'connexion' ? 'Se connecter' : "S'inscrire"}
            </button>
          ))}
        </div>

        <form onSubmit={soumettre} style={styles.form}>
          {erreur && <div style={styles.erreur}>{erreur}</div>}

          <input name="username" placeholder="Nom d'utilisateur" value={form.username}
            onChange={changer} style={styles.input} required />

          {mode === 'inscription' && (
            <>
              <input name="email" type="email" placeholder="Email" value={form.email}
                onChange={changer} style={styles.input} required />
              <input name="nom_entreprise" placeholder="Nom de l'entreprise"
                value={form.nom_entreprise} onChange={changer} style={styles.input} required />
              <input name="secteur" placeholder="Secteur d'activité (ex: Pharmacie)"
                value={form.secteur} onChange={changer} style={styles.input} />
              <input name="telephone" placeholder="Téléphone"
                value={form.telephone} onChange={changer} style={styles.input} />
            </>
          )}

          <input name="password" type="password" placeholder="Mot de passe"
            value={form.password} onChange={changer} style={styles.input} required />

          {mode === 'inscription' && (
            <input name="password2" type="password" placeholder="Confirmer le mot de passe"
              value={form.password2} onChange={changer} style={styles.input} required />
          )}

          <button type="submit" style={{
            ...styles.btn,
            opacity: chargement ? 0.7 : 1
          }} disabled={chargement}>
            {chargement ? 'Chargement...' : mode === 'connexion' ? 'Se connecter' : "Créer mon compte"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'linear-gradient(135deg, #1a56db 0%, #1e429f 100%)',
    padding: '20px'
  },
  card: {
    background: '#fff', borderRadius: '16px', padding: '40px',
    width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
  },
  logo: { textAlign: 'center', marginBottom: '24px' },
  logoIcon: {
    width: '64px', height: '64px', borderRadius: '16px',
    background: 'linear-gradient(135deg, #1a56db, #1e429f)',
    color: '#fff', fontSize: '22px', fontWeight: 'bold',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 12px'
  },
  logoText: { margin: 0, fontSize: '24px', fontWeight: '800', color: '#1e429f' },
  logoSub: { margin: '4px 0 0', fontSize: '13px', color: '#6b7280' },
  tabs: { display: 'flex', marginBottom: '24px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' },
  tab: {
    flex: 1, padding: '10px', border: 'none', background: '#f9fafb',
    cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#6b7280'
  },
  tabActive: { background: '#1a56db', color: '#fff' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: {
    padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '8px',
    fontSize: '14px', outline: 'none', fontFamily: 'inherit'
  },
  btn: {
    padding: '13px', background: 'linear-gradient(135deg, #1a56db, #1e429f)',
    color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '8px'
  },
  erreur: {
    background: '#fef2f2', border: '1px solid #fca5a5',
    color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px'
  }
};
