import React, { useState } from 'react';
import { corrigerImage, corrigerTexte } from '../../services/api';

export default function Correction() {
  const [mode, setMode] = useState('image');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [texte, setTexte] = useState('');
  const [resultat, setResultat] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

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
        setErreur('Veuillez fournir une image ou un texte');
        setChargement(false);
        return;
      }
      setResultat(res.data);
    } catch (err) {
      setErreur(err.response?.data?.error || 'Erreur lors de l\'analyse');
    } finally {
      setChargement(false);
    }
  };

  const exempleTexte = `BILAN AU 31/12/2024
ACTIF:
  Caisse: 5000 MRU
  Banque: 3000 MRU
  Stock: 8000 MRU
TOTAL ACTIF: 14000 MRU

PASSIF:
  Capital: 10000 MRU
  Fournisseurs: 2000 MRU
TOTAL PASSIF: 12000 MRU`;

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.titre}>Correction IA 🔍</h1>
          <p style={styles.sousTitre}>Envoyez une photo ou copiez un document comptable — l'IA détecte les erreurs !</p>
        </div>
      </div>

      {/* Tabs mode */}
      <div style={styles.tabs}>
        {[
          { id: 'image', label: '📷 Photo du document' },
          { id: 'texte', label: '📝 Coller le texte' },
        ].map(t => (
          <button key={t.id} onClick={() => { setMode(t.id); setResultat(null); }}
            style={{ ...styles.tab, ...(mode === t.id ? styles.tabActive : {}) }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={styles.grille}>
        {/* Input */}
        <div style={styles.card}>
          <h2 style={styles.cardTitre}>
            {mode === 'image' ? '📷 Charger une photo' : '📝 Coller votre document'}
          </h2>

          {mode === 'image' ? (
            <div>
              <div style={styles.uploadZone} onClick={() => document.getElementById('fileInput').click()}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Document" style={styles.preview} />
                ) : (
                  <div style={styles.uploadPlaceholder}>
                    <div style={styles.uploadIcon}>📷</div>
                    <p>Cliquez pour choisir une photo</p>
                    <p style={styles.uploadSub}>Bilan, compte de résultat, journal...</p>
                  </div>
                )}
              </div>
              <input id="fileInput" type="file" accept="image/*"
                onChange={choisirImage} style={{ display: 'none' }} />
              {imagePreview && (
                <button onClick={() => { setImage(null); setImagePreview(null); }} style={styles.btnEffacer}>
                  🗑️ Changer l'image
                </button>
              )}
            </div>
          ) : (
            <div>
              <button onClick={() => setTexte(exempleTexte)} style={styles.btnExemple}>
                💡 Charger un exemple
              </button>
              <textarea value={texte} onChange={e => setTexte(e.target.value)}
                placeholder="Collez ici votre bilan, compte de résultat ou journal comptable..."
                style={styles.textarea} rows={12} />
            </div>
          )}

          {erreur && <div style={styles.erreur}>{erreur}</div>}

          <button onClick={analyser} style={{ ...styles.btn, opacity: chargement ? 0.7 : 1 }}
            disabled={chargement}>
            {chargement ? '🤖 Analyse en cours...' : '🔍 Analyser et détecter les erreurs'}
          </button>

          <div style={styles.infoBox}>
            <strong>💡 Comment ça marche :</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8' }}>
              <li>Prenez une photo de votre document comptable</li>
              <li>L'IA lit le document et vérifie les règles du Plan Comptable Mauritanien</li>
              <li>Toutes les erreurs sont listées avec des explications claires</li>
              <li>Des corrections sont suggérées pour chaque erreur</li>
            </ul>
          </div>
        </div>

        {/* Résultats */}
        <div style={styles.card}>
          <h2 style={styles.cardTitre}>🤖 Résultat de l'analyse</h2>

          {!resultat && !chargement && (
            <div style={styles.vide}>
              <div style={styles.videIcon}>🔍</div>
              <p>L'IA analysera votre document et détectera :</p>
              <ul style={styles.listeVide}>
                <li>✅ Déséquilibre Actif ≠ Passif</li>
                <li>✅ Mauvais numéros de comptes (PCM)</li>
                <li>✅ Erreurs de calcul</li>
                <li>✅ Incohérences dans les montants</li>
              </ul>
            </div>
          )}

          {chargement && (
            <div style={styles.chargement}>
              <div style={{ fontSize: '50px', marginBottom: '16px' }}>🤖</div>
              <p>L'IA analyse votre document selon le Plan Comptable Mauritanien...</p>
            </div>
          )}

          {resultat && (
            <div>
              {/* Type de document */}
              <div style={styles.docType}>
                📄 Document détecté : <strong>{resultat.document_type || 'Inconnu'}</strong>
              </div>

              {/* Équilibre */}
              <div style={{
                ...styles.equilibreBox,
                background: resultat.est_equilibre ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${resultat.est_equilibre ? '#6ee7b7' : '#fca5a5'}`
              }}>
                <span style={{ fontSize: '24px' }}>{resultat.est_equilibre ? '✅' : '⚠️'}</span>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px' }}>
                    {resultat.est_equilibre ? 'Document équilibré' : 'Document déséquilibré !'}
                  </div>
                  {resultat.total_actif !== undefined && (
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>
                      Actif: {Number(resultat.total_actif||0).toLocaleString()} MRU |
                      Passif: {Number(resultat.total_passif||0).toLocaleString()} MRU
                    </div>
                  )}
                </div>
              </div>

              {/* Erreurs */}
              {resultat.erreurs?.length > 0 ? (
                <div style={styles.erreursSection}>
                  <h3 style={styles.erreursTitre}>
                    ⚠️ {resultat.erreurs.length} erreur(s) détectée(s)
                  </h3>
                  {resultat.erreurs.map((err, i) => (
                    <div key={i} style={styles.erreurCard}>
                      <div style={styles.erreurHeader}>
                        <span style={styles.erreurNum}>#{i+1}</span>
                        <span style={styles.erreurType}>{err.type_erreur}</span>
                      </div>
                      <div style={styles.erreurLigne}>📍 <strong>Ligne :</strong> {err.ligne}</div>
                      <div style={styles.erreurLigne}>❌ <strong>Problème :</strong> {err.description}</div>
                      <div style={{ ...styles.erreurLigne, color: '#059669' }}>
                        ✅ <strong>Correction :</strong> {err.correction_suggeree}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.pasErreur}>
                  ✅ Aucune erreur détectée ! Document conforme au PCM Mauritanien
                </div>
              )}

              {/* Avertissements */}
              {resultat.avertissements?.length > 0 && (
                <div style={styles.avertissements}>
                  <h3 style={styles.avertissementsTitre}>⚠️ Avertissements</h3>
                  {resultat.avertissements.map((a, i) => (
                    <div key={i} style={styles.avertissement}>• {a}</div>
                  ))}
                </div>
              )}

              {/* Résumé */}
              {resultat.resume && (
                <div style={styles.resume}>
                  <strong>📋 Résumé :</strong> {resultat.resume}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: { marginBottom: '20px' },
  titre: { margin: 0, fontSize: '26px', fontWeight: '800', color: '#111827' },
  sousTitre: { margin: '4px 0 0', color: '#6b7280', fontSize: '14px' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
  tab: { padding: '10px 20px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', background: '#f9fafb', fontSize: '14px', fontWeight: '500', color: '#374151' },
  tabActive: { background: '#1a56db', color: '#fff', border: '1px solid #1a56db' },
  grille: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' },
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' },
  cardTitre: { margin: '0 0 16px', fontSize: '17px', fontWeight: '700', color: '#111827' },
  uploadZone: {
    border: '2px dashed #d1d5db', borderRadius: '10px', padding: '20px',
    cursor: 'pointer', textAlign: 'center', marginBottom: '12px', minHeight: '200px',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  uploadPlaceholder: { color: '#6b7280' },
  uploadIcon: { fontSize: '48px', marginBottom: '12px' },
  uploadSub: { fontSize: '12px', color: '#9ca3af', margin: '4px 0 0' },
  preview: { maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' },
  btnEffacer: { background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginBottom: '12px' },
  btnExemple: { background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1a56db', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginBottom: '10px', fontWeight: '500' },
  textarea: { width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontFamily: 'Courier, monospace', resize: 'vertical', boxSizing: 'border-box', lineHeight: '1.6' },
  erreur: { background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' },
  btn: { width: '100%', padding: '12px', background: 'linear-gradient(135deg, #1a56db, #1e429f)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginBottom: '14px' },
  infoBox: { background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '14px', fontSize: '13px', color: '#0369a1' },
  vide: { textAlign: 'center', padding: '30px', color: '#6b7280' },
  videIcon: { fontSize: '48px', marginBottom: '12px' },
  listeVide: { textAlign: 'left', display: 'inline-block', lineHeight: '2', fontSize: '14px' },
  chargement: { textAlign: 'center', padding: '40px', color: '#6b7280' },
  docType: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', marginBottom: '14px', color: '#374151' },
  equilibreBox: { borderRadius: '8px', padding: '14px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' },
  erreursSection: { marginBottom: '16px' },
  erreursTitre: { margin: '0 0 12px', fontSize: '15px', fontWeight: '700', color: '#dc2626' },
  erreurCard: { background: '#fef9f9', border: '1px solid #fecaca', borderRadius: '8px', padding: '14px', marginBottom: '10px' },
  erreurHeader: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' },
  erreurNum: { background: '#dc2626', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 },
  erreurType: { background: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  erreurLigne: { fontSize: '13px', color: '#374151', marginBottom: '6px', lineHeight: '1.5' },
  pasErreur: { background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#059669', padding: '14px', borderRadius: '8px', fontWeight: '600', textAlign: 'center', marginBottom: '14px' },
  avertissements: { background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '14px', marginBottom: '14px' },
  avertissementsTitre: { margin: '0 0 8px', fontSize: '14px', fontWeight: '700', color: '#92400e' },
  avertissement: { fontSize: '13px', color: '#78350f', marginBottom: '4px' },
  resume: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '14px', fontSize: '13px', color: '#374151', lineHeight: '1.6' },
};
