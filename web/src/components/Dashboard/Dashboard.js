import React, { useEffect, useState } from 'react';
import { getDashboard } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [chargement, setChargement] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard().then(r => { setData(r.data); setChargement(false); }).catch(() => setChargement(false));
  }, []);

  if (chargement) return <div style={styles.loading}>Chargement...</div>;

  const stats = data?.stats || {};
  const ops = data?.dernieres_operations || [];

  const cartes = [
    { label: 'Ventes ce mois', valeur: stats.ventes_mois, icon: '💰', couleur: '#059669', bg: '#ecfdf5' },
    { label: 'Dépenses ce mois', valeur: stats.depenses_mois, icon: '💸', couleur: '#dc2626', bg: '#fef2f2' },
    { label: 'Résultat net', valeur: stats.resultat_mois, icon: '📊', couleur: stats.resultat_mois >= 0 ? '#059669' : '#dc2626', bg: stats.resultat_mois >= 0 ? '#ecfdf5' : '#fef2f2' },
    { label: 'Total opérations', valeur: stats.total_operations, icon: '📋', couleur: '#1a56db', bg: '#eff6ff', isMoney: false },
  ];

  return (
    <div>
      {/* En-tête */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.titre}>Tableau de bord 📊</h1>
          <p style={styles.sousTitre}>Bienvenue, <strong>{user?.nom_entreprise}</strong></p>
        </div>
        <button onClick={() => navigate('/saisie')} style={styles.btnSaisie}>
          ✏️ Nouvelle opération
        </button>
      </div>

      {/* Cartes stats */}
      <div style={styles.grille}>
        {cartes.map((c, i) => (
          <div key={i} style={{ ...styles.carte, background: c.bg, borderLeft: `4px solid ${c.couleur}` }}>
            <div style={styles.carteTop}>
              <span style={styles.carteIcon}>{c.icon}</span>
              <span style={{ ...styles.carteValeur, color: c.couleur }}>
                {c.isMoney === false ? c.valeur : `${(c.valeur || 0).toLocaleString()} MRU`}
              </span>
            </div>
            <div style={styles.carteLabel}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Raccourcis */}
      <div style={styles.raccourcisSection}>
        <h2 style={styles.sectionTitre}>Accès rapides</h2>
        <div style={styles.raccourcis}>
          {[
            { icon: '💵', label: 'Trésorerie', path: '/tresorerie' },
            { icon: '📈', label: 'Compte Résultat', path: '/compte-resultat' },
            { icon: '📋', label: 'Bilan', path: '/bilan' },
            { icon: '🔍', label: 'Corriger un document', path: '/correction' },
          ].map((r, i) => (
            <div key={i} style={styles.raccourci} onClick={() => navigate(r.path)}>
              <span style={styles.raccourciIcon}>{r.icon}</span>
              <span style={styles.raccourciLabel}>{r.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dernières opérations */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitre}>Dernières opérations</h2>
        {ops.length === 0 ? (
          <div style={styles.vide}>
            <p>Aucune opération encore.</p>
            <button onClick={() => navigate('/saisie')} style={styles.btnSaisie}>
              ✏️ Ajouter ma première opération
            </button>
          </div>
        ) : (
          <div style={styles.tableau}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Moyen</th>
                  <th style={styles.th}>Montant</th>
                </tr>
              </thead>
              <tbody>
                {ops.map(op => (
                  <tr key={op.id} style={styles.tr}>
                    <td style={styles.td}>{op.date_operation}</td>
                    <td style={styles.td}>{op.description || op.texte_original}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: op.type_operation === 'vente' ? '#ecfdf5' : '#fef2f2',
                        color: op.type_operation === 'vente' ? '#059669' : '#dc2626'
                      }}>
                        {op.type_operation}
                      </span>
                    </td>
                    <td style={styles.td}>{op.moyen_paiement}</td>
                    <td style={{
                      ...styles.td,
                      fontWeight: '600',
                      color: op.type_operation === 'vente' ? '#059669' : '#dc2626'
                    }}>
                      {op.type_operation === 'vente' ? '+' : '-'}{Number(op.montant).toLocaleString()} MRU
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  loading: { padding: '40px', textAlign: 'center', color: '#6b7280' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  titre: { margin: 0, fontSize: '26px', fontWeight: '800', color: '#111827' },
  sousTitre: { margin: '4px 0 0', color: '#6b7280', fontSize: '14px' },
  btnSaisie: {
    background: 'linear-gradient(135deg, #1a56db, #1e429f)', color: '#fff',
    border: 'none', padding: '10px 20px', borderRadius: '8px',
    cursor: 'pointer', fontWeight: '600', fontSize: '14px'
  },
  grille: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' },
  carte: {
    padding: '20px', borderRadius: '12px', cursor: 'default'
  },
  carteTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  carteIcon: { fontSize: '24px' },
  carteValeur: { fontSize: '22px', fontWeight: '800' },
  carteLabel: { fontSize: '13px', color: '#6b7280', fontWeight: '500' },
  raccourcisSection: { marginBottom: '24px' },
  sectionTitre: { fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px' },
  raccourcis: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' },
  raccourci: {
    background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
    padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '8px', cursor: 'pointer', transition: 'box-shadow 0.2s'
  },
  raccourciIcon: { fontSize: '28px' },
  raccourciLabel: { fontSize: '13px', fontWeight: '600', color: '#374151', textAlign: 'center' },
  section: { background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' },
  vide: { textAlign: 'center', padding: '40px', color: '#6b7280' },
  tableau: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHead: { background: '#f9fafb' },
  th: { padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', borderBottom: '1px solid #e5e7eb' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '12px 14px', fontSize: '14px', color: '#374151' },
  badge: { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }
};
