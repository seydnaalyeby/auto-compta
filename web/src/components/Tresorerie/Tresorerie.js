import React, { useEffect, useState } from 'react';
import { getTresorerie } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Tresorerie() {
  const [data, setData] = useState(null);
  const [annee, setAnnee] = useState(new Date().getFullYear());

  useEffect(() => {
    getTresorerie({ annee }).then(r => setData(r.data));
  }, [annee]);

  if (!data) return <div style={styles.loading}>Chargement...</div>;

  const historique = (data.historique || []).map(h => ({
    mois: new Date(h.mois).toLocaleDateString('fr-FR', { month: 'short' }),
    Entrées: parseFloat(h.entrees || 0),
    Sorties: parseFloat(h.sorties || 0),
  }));

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.titre}>Trésorerie 💵</h1>
          <p style={styles.sousTitre}>Argent disponible en temps réel</p>
        </div>
        <select value={annee} onChange={e => setAnnee(e.target.value)} style={styles.select}>
          {[2023, 2024, 2025, 2026].map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {data.alerte && (
        <div style={styles.alerte}>⚠️ Attention : votre trésorerie est négative !</div>
      )}

      {/* Cartes */}
      <div style={styles.grille}>
        {[
          { label: 'Total disponible', val: data.total, icon: '💰', couleur: data.total >= 0 ? '#059669' : '#dc2626' },
          { label: 'Caisse (espèces)', val: data.caisse, icon: '💵', couleur: '#1a56db' },
          { label: 'Banque', val: data.banque, icon: '🏦', couleur: '#7c3aed' },
          { label: 'Total entrées', val: data.entrees_caisse + data.entrees_banque, icon: '⬆️', couleur: '#059669' },
          { label: 'Total sorties', val: data.sorties_caisse + data.sorties_banque, icon: '⬇️', couleur: '#dc2626' },
        ].map((c, i) => (
          <div key={i} style={styles.carte}>
            <div style={styles.carteIcon}>{c.icon}</div>
            <div style={{ ...styles.carteVal, color: c.couleur }}>{Number(c.val || 0).toLocaleString()} MRU</div>
            <div style={styles.carteLabel}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Graphique */}
      <div style={styles.graphCard}>
        <h2 style={styles.graphTitre}>Évolution mensuelle {annee}</h2>
        {historique.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={historique}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip formatter={v => `${Number(v).toLocaleString()} MRU`} />
              <Legend />
              <Bar dataKey="Entrées" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Sorties" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={styles.vide}>Aucune donnée pour cette période</div>
        )}
      </div>

      {/* Détail caisse/banque */}
      <div style={styles.detail}>
        {[
          { titre: '💵 Détail Caisse (Compte 100 PCM)', entrees: data.entrees_caisse, sorties: data.sorties_caisse, solde: data.caisse },
          { titre: '🏦 Détail Banque (Compte 12 PCM)', entrees: data.entrees_banque, sorties: data.sorties_banque, solde: data.banque },
        ].map((d, i) => (
          <div key={i} style={styles.detailCard}>
            <h3 style={styles.detailTitre}>{d.titre}</h3>
            <div style={styles.detailLigne}>
              <span>Entrées</span><span style={{ color: '#059669', fontWeight: '600' }}>+{Number(d.entrees || 0).toLocaleString()} MRU</span>
            </div>
            <div style={styles.detailLigne}>
              <span>Sorties</span><span style={{ color: '#dc2626', fontWeight: '600' }}>-{Number(d.sorties || 0).toLocaleString()} MRU</span>
            </div>
            <div style={{ ...styles.detailLigne, borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '4px' }}>
              <span style={{ fontWeight: '700' }}>Solde</span>
              <span style={{ fontWeight: '800', color: d.solde >= 0 ? '#059669' : '#dc2626', fontSize: '16px' }}>
                {Number(d.solde || 0).toLocaleString()} MRU
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  loading: { padding: '40px', textAlign: 'center', color: '#6b7280' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  titre: { margin: 0, fontSize: '26px', fontWeight: '800', color: '#111827' },
  sousTitre: { margin: '4px 0 0', color: '#6b7280', fontSize: '14px' },
  select: { padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' },
  alerte: { background: '#fef3c7', border: '1px solid #f59e0b', color: '#92400e', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontWeight: '600' },
  grille: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' },
  carte: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', textAlign: 'center' },
  carteIcon: { fontSize: '28px', marginBottom: '8px' },
  carteVal: { fontSize: '20px', fontWeight: '800', marginBottom: '4px' },
  carteLabel: { fontSize: '12px', color: '#6b7280' },
  graphCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '20px' },
  graphTitre: { margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#111827' },
  vide: { textAlign: 'center', padding: '40px', color: '#6b7280' },
  detail: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' },
  detailCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px' },
  detailTitre: { margin: '0 0 14px', fontSize: '14px', fontWeight: '700', color: '#111827' },
  detailLigne: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px', color: '#374151' },
};
