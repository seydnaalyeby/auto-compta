import React, { useEffect, useState } from 'react';
import { getCompteResultat } from '../../services/api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CompteResultat() {
  const [data, setData] = useState(null);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [mois, setMois] = useState('');

  useEffect(() => {
    getCompteResultat({ annee, mois: mois || undefined }).then(r => setData(r.data));
  }, [annee, mois]);

  if (!data) return <div style={styles.loading}>Chargement...</div>;

  const { produits, charges, resultat_net, est_benefice } = data;

  const pieData = [
    { name: 'Ventes', value: parseFloat(produits?.ventes || 0) },
    { name: 'Encaissements', value: parseFloat(produits?.encaissements || 0) },
  ].filter(d => d.value > 0);

  const pieCharges = [
    { name: 'Achats', value: parseFloat(charges?.achats || 0) },
    { name: 'Salaires', value: parseFloat(charges?.salaires || 0) },
    { name: 'Loyers', value: parseFloat(charges?.loyers || 0) },
    { name: 'Impôts', value: parseFloat(charges?.impots || 0) },
    { name: 'Autres', value: parseFloat(charges?.autres_paiements || 0) },
  ].filter(d => d.value > 0);

  const COLORS = ['#1a56db', '#059669', '#7c3aed', '#d97706', '#dc2626'];

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.titre}>Compte de Résultat 📈</h1>
          <p style={styles.sousTitre}>Gains vs Dépenses — Est-ce que vous êtes rentable ?</p>
        </div>
        <div style={styles.filtres}>
          <select value={mois} onChange={e => setMois(e.target.value)} style={styles.select}>
            <option value="">Toute l'année</option>
            {['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
              .map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={annee} onChange={e => setAnnee(e.target.value)} style={styles.select}>
            {[2023,2024,2025,2026].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Résultat net en haut */}
      <div style={{
        ...styles.resultatBanner,
        background: est_benefice ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #dc2626, #b91c1c)'
      }}>
        <div style={styles.resultatIcon}>{est_benefice ? '✅' : '⚠️'}</div>
        <div>
          <div style={styles.resultatLabel}>Résultat net</div>
          <div style={styles.resultatValeur}>{Number(resultat_net || 0).toLocaleString()} MRU</div>
        </div>
        <div style={styles.resultatStatus}>{est_benefice ? 'BÉNÉFICE' : 'PERTE'}</div>
      </div>

      {/* Tableau compte de résultat */}
      <div style={styles.grille}>
        {/* Produits (Classe 7 PCM) */}
        <div style={styles.card}>
          <h2 style={styles.cardTitre}>📈 PRODUITS (Classe 7 PCM)</h2>
          <div style={styles.ligneTotal}>
            <span>Ventes (Compte 702)</span>
            <span style={{ color: '#059669', fontWeight: '700' }}>
              +{Number(produits?.ventes || 0).toLocaleString()} MRU
            </span>
          </div>
          <div style={styles.ligne}>
            <span>Encaissements divers (Compte 71)</span>
            <span style={{ color: '#059669' }}>
              +{Number(produits?.encaissements || 0).toLocaleString()} MRU
            </span>
          </div>
          <div style={styles.totalLigne}>
            <span style={styles.totalLabel}>TOTAL PRODUITS</span>
            <span style={{ color: '#059669', fontWeight: '800', fontSize: '18px' }}>
              {Number(produits?.total || 0).toLocaleString()} MRU
            </span>
          </div>
          {pieData.length > 0 && (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={v => `${Number(v).toLocaleString()} MRU`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Charges (Classe 6 PCM) */}
        <div style={styles.card}>
          <h2 style={styles.cardTitre}>📉 CHARGES (Classe 6 PCM)</h2>
          {[
            { label: 'Achats marchandises (Compte 60)', val: charges?.achats },
            { label: 'Salaires et charges (Compte 650)', val: charges?.salaires },
            { label: 'Loyers (Compte 620)', val: charges?.loyers },
            { label: 'Impôts et taxes (Compte 66)', val: charges?.impots },
            { label: 'Autres paiements (Compte 63)', val: charges?.autres_paiements },
          ].map((c, i) => (
            <div key={i} style={styles.ligne}>
              <span>{c.label}</span>
              <span style={{ color: '#dc2626' }}>
                -{Number(c.val || 0).toLocaleString()} MRU
              </span>
            </div>
          ))}
          <div style={styles.totalLigne}>
            <span style={styles.totalLabel}>TOTAL CHARGES</span>
            <span style={{ color: '#dc2626', fontWeight: '800', fontSize: '18px' }}>
              {Number(charges?.total || 0).toLocaleString()} MRU
            </span>
          </div>
          {pieCharges.length > 0 && (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieCharges} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                  {pieCharges.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={v => `${Number(v).toLocaleString()} MRU`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Résumé calcul */}
      <div style={styles.calcul}>
        <h2 style={styles.cardTitre}>📊 Calcul du Résultat</h2>
        <div style={styles.calculLigne}>
          <span>Total Produits</span>
          <span style={{ color: '#059669', fontWeight: '700' }}>+{Number(produits?.total||0).toLocaleString()} MRU</span>
        </div>
        <div style={styles.calculLigne}>
          <span>Total Charges</span>
          <span style={{ color: '#dc2626', fontWeight: '700' }}>-{Number(charges?.total||0).toLocaleString()} MRU</span>
        </div>
        <div style={{ ...styles.calculLigne, borderTop: '2px solid #e5e7eb', paddingTop: '12px', marginTop: '8px' }}>
          <span style={{ fontWeight: '800', fontSize: '16px' }}>RÉSULTAT NET</span>
          <span style={{ fontWeight: '800', fontSize: '20px', color: est_benefice ? '#059669' : '#dc2626' }}>
            {Number(resultat_net||0).toLocaleString()} MRU
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  loading: { padding: '40px', textAlign: 'center', color: '#6b7280' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  titre: { margin: 0, fontSize: '26px', fontWeight: '800', color: '#111827' },
  sousTitre: { margin: '4px 0 0', color: '#6b7280', fontSize: '14px' },
  filtres: { display: 'flex', gap: '10px' },
  select: { padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' },
  resultatBanner: {
    borderRadius: '12px', padding: '20px 24px', marginBottom: '24px',
    display: 'flex', alignItems: 'center', gap: '20px', color: '#fff'
  },
  resultatIcon: { fontSize: '40px' },
  resultatLabel: { fontSize: '13px', opacity: 0.8, marginBottom: '4px' },
  resultatValeur: { fontSize: '28px', fontWeight: '800' },
  resultatStatus: { marginLeft: 'auto', fontSize: '18px', fontWeight: '800', opacity: 0.9 },
  grille: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' },
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' },
  cardTitre: { margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#111827' },
  ligne: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: '13px', color: '#374151' },
  ligneTotal: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: '13px', color: '#374151', fontWeight: '600' },
  totalLigne: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 8px', marginTop: '8px' },
  totalLabel: { fontWeight: '700', fontSize: '14px', color: '#111827' },
  calcul: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' },
  calculLigne: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', fontSize: '15px', color: '#374151' },
};
