import React, { useEffect, useState } from 'react';
import { listeEcritures } from '../../services/api';

export default function Journal() {
  const [ecritures, setEcritures] = useState([]);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [mois, setMois] = useState('');

  useEffect(() => {
    listeEcritures({ annee, mois: mois || undefined }).then(r => setEcritures(r.data));
  }, [annee, mois]);

  const totalDebit  = ecritures.reduce((s, e) => s + parseFloat(e.montant||0), 0);
  const totalCredit = totalDebit; // toujours égaux en comptabilité

  const moisNoms = ['','Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.titre}>Journal Comptable 📝</h1>
          <p style={styles.sousTitre}>Toutes les écritures selon le Plan Comptable Mauritanien (PCM)</p>
        </div>
        <div style={styles.filtres}>
          <select value={mois} onChange={e => setMois(e.target.value)} style={styles.select}>
            <option value="">Toute l'année</option>
            {moisNoms.slice(1).map((m,i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={annee} onChange={e => setAnnee(e.target.value)} style={styles.select}>
            {[2023,2024,2025,2026].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Totaux */}
      <div style={styles.totaux}>
        <div style={styles.totalBox}>
          <span style={styles.totalLabel}>Total Débits</span>
          <span style={{ color: '#059669', fontWeight: '800', fontSize: '20px' }}>{totalDebit.toLocaleString()} MRU</span>
        </div>
        <div style={styles.egal}>=</div>
        <div style={styles.totalBox}>
          <span style={styles.totalLabel}>Total Crédits</span>
          <span style={{ color: '#1a56db', fontWeight: '800', fontSize: '20px' }}>{totalCredit.toLocaleString()} MRU</span>
        </div>
        <div style={styles.equilibreBox}>
          ✅ Journal équilibré — Débit = Crédit
        </div>
      </div>

      {/* Table des écritures */}
      <div style={styles.card}>
        {ecritures.length === 0 ? (
          <div style={styles.vide}>Aucune écriture pour cette période</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Libellé</th>
                  <th style={{ ...styles.th, background: '#ecfdf5', color: '#059669' }}>Compte Débit</th>
                  <th style={{ ...styles.th, background: '#ecfdf5', color: '#059669' }}>Libellé Débit</th>
                  <th style={{ ...styles.th, background: '#eff6ff', color: '#1a56db' }}>Compte Crédit</th>
                  <th style={{ ...styles.th, background: '#eff6ff', color: '#1a56db' }}>Libellé Crédit</th>
                  <th style={styles.th}>Montant</th>
                </tr>
              </thead>
              <tbody>
                {ecritures.map((e, i) => (
                  <tr key={e.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={styles.td}>{e.date_ecriture}</td>
                    <td style={{ ...styles.td, maxWidth: '200px', fontSize: '12px' }}>{e.libelle}</td>
                    <td style={{ ...styles.td, fontWeight: '700', color: '#059669', textAlign: 'center' }}>
                      <span style={styles.compteBadgeDebit}>{e.compte_debit}</span>
                    </td>
                    <td style={{ ...styles.td, fontSize: '12px', color: '#059669' }}>{e.libelle_debit}</td>
                    <td style={{ ...styles.td, fontWeight: '700', color: '#1a56db', textAlign: 'center' }}>
                      <span style={styles.compteBadgeCredit}>{e.compte_credit}</span>
                    </td>
                    <td style={{ ...styles.td, fontSize: '12px', color: '#1a56db' }}>{e.libelle_credit}</td>
                    <td style={{ ...styles.td, fontWeight: '700', color: '#111827' }}>
                      {Number(e.montant).toLocaleString()} MRU
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f3f4f6' }}>
                  <td colSpan={2} style={{ ...styles.td, fontWeight: '800' }}>TOTAUX</td>
                  <td colSpan={2} style={{ ...styles.td, fontWeight: '800', color: '#059669' }}>
                    Débit: {totalDebit.toLocaleString()} MRU
                  </td>
                  <td colSpan={2} style={{ ...styles.td, fontWeight: '800', color: '#1a56db' }}>
                    Crédit: {totalCredit.toLocaleString()} MRU
                  </td>
                  <td style={{ ...styles.td, fontWeight: '800' }}>{totalDebit.toLocaleString()} MRU</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Légende PCM */}
      <div style={styles.legende}>
        <h3 style={styles.legendeTitre}>📖 Classes du Plan Comptable Mauritanien (PCM)</h3>
        <div style={styles.legendeGrille}>
          {[
            { code: '1xx', label: 'Trésorerie & Opérations bancaires', ex: '100=Caisse, 12=Banque' },
            { code: '2xx', label: 'Opérations avec la clientèle', ex: '210=Comptes clients' },
            { code: '3xx', label: 'Autres comptes financiers', ex: '320=Fournisseurs, 322=Personnel' },
            { code: '4xx', label: 'Valeurs immobilisées', ex: '42=Immobilisations corporelles' },
            { code: '5xx', label: 'Capitaux permanents', ex: '59=Capital, 58=Réserves' },
            { code: '6xx', label: 'Charges', ex: '620=Loyers, 650=Salaires, 66=Impôts' },
            { code: '7xx', label: 'Produits', ex: '702=Ventes, 71=Produits accessoires' },
            { code: '8xx', label: 'Résultats', ex: '87=Résultat net de la période' },
          ].map((l, i) => (
            <div key={i} style={styles.legendeItem}>
              <span style={styles.legendeCode}>{l.code}</span>
              <div>
                <div style={styles.legendeLabel}>{l.label}</div>
                <div style={styles.legendeEx}>{l.ex}</div>
              </div>
            </div>
          ))}
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
  totaux: { display: 'flex', alignItems: 'center', gap: '16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px 24px', marginBottom: '20px', flexWrap: 'wrap' },
  totalBox: { display: 'flex', flexDirection: 'column', gap: '4px' },
  totalLabel: { fontSize: '12px', color: '#6b7280', fontWeight: '600' },
  egal: { fontSize: '24px', color: '#9ca3af', fontWeight: '300' },
  equilibreBox: { marginLeft: 'auto', background: '#ecfdf5', color: '#059669', padding: '8px 14px', borderRadius: '8px', fontWeight: '600', fontSize: '13px' },
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '20px' },
  vide: { textAlign: 'center', padding: '40px', color: '#6b7280' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  thead: { background: '#f9fafb' },
  th: { padding: '10px 12px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', color: '#374151', borderBottom: '1px solid #f3f4f6' },
  compteBadgeDebit: { background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '13px' },
  compteBadgeCredit: { background: '#eff6ff', color: '#1a56db', padding: '3px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '13px' },
  legende: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' },
  legendeTitre: { margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: '#111827' },
  legendeGrille: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' },
  legendeItem: { display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '8px', background: '#f9fafb', borderRadius: '8px' },
  legendeCode: { background: '#1e429f', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '12px', flexShrink: 0 },
  legendeLabel: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  legendeEx: { fontSize: '11px', color: '#6b7280', marginTop: '2px' },
};
