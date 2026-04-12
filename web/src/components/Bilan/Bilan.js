import React, { useEffect, useState } from 'react';
import { getBilan } from '../../services/api';

export default function Bilan() {
  const [data, setData] = useState(null);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [mois, setMois] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    getBilan({ annee, mois }).then(r => setData(r.data));
  }, [annee, mois]);

  if (!data) return <div style={styles.loading}>Chargement...</div>;

  const { actif, passif, equilibre } = data;

  const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.titre}>Bilan 📋</h1>
          <p style={styles.sousTitre}>Photo complète de votre situation financière</p>
        </div>
        <div style={styles.filtres}>
          <select value={mois} onChange={e => setMois(e.target.value)} style={styles.select}>
            {moisNoms.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={annee} onChange={e => setAnnee(e.target.value)} style={styles.select}>
            {[2023,2024,2025,2026].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Date du bilan */}
      <div style={styles.dateBilan}>
        📅 Bilan au {moisNoms[mois-1]} {annee}
        <span style={{
          ...styles.equilibreBadge,
          background: equilibre ? '#ecfdf5' : '#fef2f2',
          color: equilibre ? '#059669' : '#dc2626'
        }}>
          {equilibre ? '✅ Équilibré' : '⚠️ Déséquilibré'}
        </span>
      </div>

      {/* Bilan côte à côte */}
      <div style={styles.bilanGrille}>
        {/* ACTIF */}
        <div style={styles.actifCard}>
          <h2 style={styles.bilanTitre}>ACTIF — Ce que vous possédez</h2>
          <p style={styles.bilanSous}>Classes 1 & 2 du Plan Comptable Mauritanien</p>

          <div style={styles.bilanSection}>
            <div style={styles.sectionTitre}>💵 Trésorerie (Classe 1 PCM)</div>
            <div style={styles.bilanLigne}>
              <span>Caisse — Compte 100 (espèces)</span>
              <span style={styles.valPositive}>{Number(actif?.tresorerie?.caisse||0).toLocaleString()} MRU</span>
            </div>
            <div style={styles.bilanLigne}>
              <span>Banque — Compte 12 (virements)</span>
              <span style={styles.valPositive}>{Number(actif?.tresorerie?.banque||0).toLocaleString()} MRU</span>
            </div>
            <div style={styles.sousTotal}>
              <span>Sous-total Trésorerie</span>
              <span>{Number(actif?.tresorerie?.total||0).toLocaleString()} MRU</span>
            </div>
          </div>

          <div style={styles.bilanSection}>
            <div style={styles.sectionTitre}>👥 Créances Clients (Compte 210 PCM)</div>
            <div style={styles.bilanLigne}>
              <span>Clients à payer (ventes à crédit)</span>
              <span style={styles.valPositive}>{Number(actif?.creances_clients||0).toLocaleString()} MRU</span>
            </div>
          </div>

          <div style={styles.totalFinal}>
            <span style={styles.totalLabel}>TOTAL ACTIF</span>
            <span style={styles.totalActif}>{Number(actif?.total_actif||0).toLocaleString()} MRU</span>
          </div>
        </div>

        {/* PASSIF */}
        <div style={styles.passifCard}>
          <h2 style={styles.bilanTitre}>PASSIF — D'où vient ce que vous possédez</h2>
          <p style={styles.bilanSous}>Classes 3 & 5 du Plan Comptable Mauritanien</p>

          <div style={styles.bilanSection}>
            <div style={styles.sectionTitre}>💼 Capitaux Propres (Classe 5 PCM)</div>
            <div style={styles.bilanLigne}>
              <span>Capital — Compte 59</span>
              <span style={styles.valPositive}>{Number(passif?.capital||0).toLocaleString()} MRU</span>
            </div>
          </div>

          <div style={styles.bilanSection}>
            <div style={styles.sectionTitre}>📄 Dettes (Classe 3 PCM)</div>
            <div style={styles.bilanLigne}>
              <span>Fournisseurs — Compte 320</span>
              <span style={styles.valNegative}>{Number(passif?.dettes?.fournisseurs||0).toLocaleString()} MRU</span>
            </div>
            <div style={styles.bilanLigne}>
              <span>Loyer dû — Compte 320</span>
              <span style={styles.valNegative}>{Number(passif?.dettes?.loyer_du||0).toLocaleString()} MRU</span>
            </div>
            <div style={styles.sousTotal}>
              <span>Sous-total Dettes</span>
              <span>{Number(passif?.dettes?.total||0).toLocaleString()} MRU</span>
            </div>
          </div>

          <div style={styles.totalFinal}>
            <span style={styles.totalLabel}>TOTAL PASSIF</span>
            <span style={styles.totalPassif}>{Number(passif?.total_passif||0).toLocaleString()} MRU</span>
          </div>
        </div>
      </div>

      {/* Règle comptable */}
      <div style={{
        ...styles.regle,
        background: equilibre ? '#ecfdf5' : '#fef2f2',
        border: `1px solid ${equilibre ? '#6ee7b7' : '#fca5a5'}`
      }}>
        <span style={{ fontSize: '20px' }}>{equilibre ? '✅' : '⚠️'}</span>
        <div>
          <strong>Règle du Bilan (PCM Mauritanien) :</strong> ACTIF = PASSIF
          <br />
          <span style={{ fontSize: '14px' }}>
            {Number(actif?.total_actif||0).toLocaleString()} MRU = {Number(passif?.total_passif||0).toLocaleString()} MRU
            {' '}{equilibre ? '✅ Les deux côtés sont égaux !' : '⚠️ Déséquilibre détecté — vérifiez vos opérations'}
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  loading: { padding: '40px', textAlign: 'center', color: '#6b7280' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  titre: { margin: 0, fontSize: '26px', fontWeight: '800', color: '#111827' },
  sousTitre: { margin: '4px 0 0', color: '#6b7280', fontSize: '14px' },
  filtres: { display: 'flex', gap: '10px' },
  select: { padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' },
  dateBilan: { background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontWeight: '600', color: '#1e429f', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  equilibreBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' },
  bilanGrille: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' },
  actifCard: { background: '#fff', border: '2px solid #6ee7b7', borderRadius: '12px', padding: '20px' },
  passifCard: { background: '#fff', border: '2px solid #93c5fd', borderRadius: '12px', padding: '20px' },
  bilanTitre: { margin: '0 0 4px', fontSize: '15px', fontWeight: '800', color: '#111827' },
  bilanSous: { margin: '0 0 16px', fontSize: '12px', color: '#6b7280' },
  bilanSection: { marginBottom: '16px', background: '#f9fafb', borderRadius: '8px', padding: '12px' },
  sectionTitre: { fontWeight: '700', fontSize: '13px', color: '#374151', marginBottom: '8px' },
  bilanLigne: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280', padding: '4px 0' },
  sousTotal: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', color: '#374151', padding: '6px 0', borderTop: '1px dashed #e5e7eb', marginTop: '6px' },
  totalFinal: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f3f4f6', borderRadius: '8px', marginTop: '12px' },
  totalLabel: { fontWeight: '800', fontSize: '14px', color: '#111827' },
  totalActif: { fontWeight: '900', fontSize: '20px', color: '#059669' },
  totalPassif: { fontWeight: '900', fontSize: '20px', color: '#1a56db' },
  valPositive: { fontWeight: '600', color: '#059669' },
  valNegative: { fontWeight: '600', color: '#dc2626' },
  regle: { borderRadius: '10px', padding: '16px', display: 'flex', gap: '14px', alignItems: 'flex-start', lineHeight: '1.6' },
};
