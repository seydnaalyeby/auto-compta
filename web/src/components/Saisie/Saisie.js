import React, { useState } from 'react';
import { saisirOperation } from '../../services/api';

export default function Saisie() {
  const [texte, setTexte] = useState('');
  const [dateOp, setDateOp] = useState(new Date().toISOString().split('T')[0]);
  const [resultat, setResultat] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  const exemples = [
    "Vendu 30 boîtes de médicaments à 150 MRU en espèces",
    "Payé le loyer du mois 8000 MRU par virement bancaire",
    "Acheté du stock pour 5000 MRU à crédit chez le fournisseur",
    "Reçu paiement client 3500 MRU en espèces",
    "Payé salaire employé 12000 MRU en espèces",
    "Payé impôt 2000 MRU par banque",
  ];

  const soumettre = async e => {
    e.preventDefault();
    if (!texte.trim()) return;
    setChargement(true);
    setErreur('');
    setResultat(null);
    try {
      const res = await saisirOperation({ texte, date_operation: dateOp });
      setResultat(res.data);
      setTexte('');
    } catch (err) {
      setErreur(err.response?.data?.error || 'Erreur lors de l\'analyse');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.titre}>Saisie intelligente ✏️</h1>
        <p style={styles.sousTitre}>Décrivez votre opération en français — l'IA fait le reste !</p>
      </div>

      <div style={styles.grille}>
        {/* Formulaire */}
        <div style={styles.card}>
          <h2 style={styles.cardTitre}>📝 Décrire l'opération</h2>
          <form onSubmit={soumettre}>
            <div style={styles.champ}>
              <label style={styles.label}>Date de l'opération</label>
              <input type="date" value={dateOp} onChange={e => setDateOp(e.target.value)}
                style={styles.input} />
            </div>
            <div style={styles.champ}>
              <label style={styles.label}>Décrivez l'opération en français</label>
              <textarea
                value={texte}
                onChange={e => setTexte(e.target.value)}
                placeholder="Ex: Vendu 50 sacs de riz à 500 MRU en espèces..."
                style={styles.textarea}
                rows={4}
              />
            </div>
            {erreur && <div style={styles.erreur}>{erreur}</div>}
            <button type="submit" style={{ ...styles.btn, opacity: chargement ? 0.7 : 1 }}
              disabled={chargement}>
              {chargement ? '🤖 Analyse en cours...' : '🚀 Analyser et enregistrer'}
            </button>
          </form>

          {/* Exemples */}
          <div style={styles.exemples}>
            <p style={styles.exemplesTitle}>💡 Exemples de saisie :</p>
            {exemples.map((ex, i) => (
              <div key={i} style={styles.exemple} onClick={() => setTexte(ex)}>
                {ex}
              </div>
            ))}
          </div>
        </div>

        {/* Résultat IA */}
        <div style={styles.card}>
          <h2 style={styles.cardTitre}>🤖 Analyse IA</h2>
          {!resultat && !chargement && (
            <div style={styles.vide}>
              <div style={styles.videIcon}>🤖</div>
              <p>L'IA analysera votre opération et générera automatiquement :</p>
              <ul style={styles.liste}>
                <li>✅ L'écriture comptable (Débit/Crédit)</li>
                <li>✅ La mise à jour de la trésorerie</li>
                <li>✅ Le compte de résultat</li>
                <li>✅ Le bilan</li>
              </ul>
            </div>
          )}
          {chargement && (
            <div style={styles.chargement}>
              <div style={styles.spinner}>⏳</div>
              <p>L'IA analyse votre opération selon le Plan Comptable Mauritanien...</p>
            </div>
          )}
          {resultat && (
            <div>
              <div style={styles.succes}>✅ Opération enregistrée avec succès !</div>
              <div style={styles.resultatCard}>
                <div style={styles.resultatLigne}>
                  <span style={styles.resultatKey}>Type</span>
                  <span style={styles.badge}>{resultat.analyse_ia?.type_operation}</span>
                </div>
                <div style={styles.resultatLigne}>
                  <span style={styles.resultatKey}>Montant</span>
                  <span style={styles.resultatVal}>{Number(resultat.operation?.montant).toLocaleString()} MRU</span>
                </div>
                <div style={styles.resultatLigne}>
                  <span style={styles.resultatKey}>Moyen</span>
                  <span style={styles.resultatVal}>{resultat.operation?.moyen_paiement}</span>
                </div>
              </div>

              {/* Écriture comptable */}
              {resultat.analyse_ia && (
                <div style={styles.ecritureBox}>
                  <h3 style={styles.ecritureTitre}>📒 Écriture comptable (PCM Mauritanien)</h3>
                  <div style={styles.ecritureGrille}>
                    <div style={styles.ecritureDebit}>
                      <div style={styles.ecritureLabel}>DÉBIT</div>
                      <div style={styles.ecritureCode}>{resultat.analyse_ia.compte_debit}</div>
                      <div style={styles.ecritureNom}>{resultat.analyse_ia.libelle_debit}</div>
                      <div style={styles.ecritureMontant}>{Number(resultat.operation?.montant).toLocaleString()} MRU</div>
                    </div>
                    <div style={styles.ecritureSlash}>/</div>
                    <div style={styles.ecritureCredit}>
                      <div style={styles.ecritureLabel}>CRÉDIT</div>
                      <div style={styles.ecritureCode}>{resultat.analyse_ia.compte_credit}</div>
                      <div style={styles.ecritureNom}>{resultat.analyse_ia.libelle_credit}</div>
                      <div style={styles.ecritureMontant}>{Number(resultat.operation?.montant).toLocaleString()} MRU</div>
                    </div>
                  </div>
                  {resultat.analyse_ia.explication && (
                    <p style={styles.explication}>💡 {resultat.analyse_ia.explication}</p>
                  )}
                </div>
              )}

              <button onClick={() => setResultat(null)} style={styles.btnNouveau}>
                ✏️ Saisir une nouvelle opération
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: { marginBottom: '24px' },
  titre: { margin: 0, fontSize: '26px', fontWeight: '800', color: '#111827' },
  sousTitre: { margin: '4px 0 0', color: '#6b7280', fontSize: '14px' },
  grille: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' },
  card: { background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb' },
  cardTitre: { margin: '0 0 20px', fontSize: '17px', fontWeight: '700', color: '#111827' },
  champ: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '12px', background: 'linear-gradient(135deg, #1a56db, #1e429f)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  erreur: { background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' },
  exemples: { marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' },
  exemplesTitle: { fontSize: '13px', fontWeight: '600', color: '#374151', margin: '0 0 8px' },
  exemple: { padding: '8px 12px', background: '#f9fafb', borderRadius: '6px', fontSize: '12px', color: '#6b7280', cursor: 'pointer', marginBottom: '6px', border: '1px solid #e5e7eb' },
  vide: { textAlign: 'center', padding: '20px', color: '#6b7280' },
  videIcon: { fontSize: '48px', marginBottom: '12px' },
  liste: { textAlign: 'left', lineHeight: '2' },
  chargement: { textAlign: 'center', padding: '40px', color: '#6b7280' },
  spinner: { fontSize: '40px', marginBottom: '12px' },
  succes: { background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#059669', padding: '10px', borderRadius: '8px', fontWeight: '600', marginBottom: '16px' },
  resultatCard: { background: '#f9fafb', borderRadius: '8px', padding: '14px', marginBottom: '16px' },
  resultatLigne: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #e5e7eb' },
  resultatKey: { fontSize: '13px', color: '#6b7280', fontWeight: '500' },
  resultatVal: { fontSize: '14px', fontWeight: '600', color: '#111827' },
  badge: { background: '#eff6ff', color: '#1a56db', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  ecritureBox: { background: '#f0f4ff', borderRadius: '10px', padding: '16px', marginBottom: '16px', border: '1px solid #c7d7f9' },
  ecritureTitre: { margin: '0 0 14px', fontSize: '14px', fontWeight: '700', color: '#1e429f' },
  ecritureGrille: { display: 'flex', alignItems: 'center', gap: '12px' },
  ecritureDebit: { flex: 1, background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '8px', padding: '12px', textAlign: 'center' },
  ecritureCredit: { flex: 1, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px', textAlign: 'center' },
  ecritureLabel: { fontSize: '11px', fontWeight: '700', color: '#6b7280', marginBottom: '4px' },
  ecritureCode: { fontSize: '20px', fontWeight: '800', color: '#111827' },
  ecritureNom: { fontSize: '11px', color: '#6b7280', marginTop: '2px' },
  ecritureMontant: { fontSize: '14px', fontWeight: '700', color: '#059669', marginTop: '6px' },
  ecritureSlash: { fontSize: '24px', color: '#9ca3af', fontWeight: '300' },
  explication: { margin: '12px 0 0', fontSize: '12px', color: '#4b5563', fontStyle: 'italic' },
  btnNouveau: { width: '100%', padding: '10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#374151' }
};
