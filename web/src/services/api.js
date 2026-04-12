import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Ajouter le token JWT à chaque requête
API.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Rafraîchir le token si expiré
API.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/connexion';
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const inscription = data => API.post('/auth/inscription/', data);
export const connexion   = data => API.post('/auth/connexion/', data);
export const profil      = ()   => API.get('/auth/profil/');

// ── Opérations ───────────────────────────────────────────────────────────────
export const saisirOperation    = data   => API.post('/operations/saisir/', data);
export const listeOperations    = params => API.get('/operations/', { params });
export const supprimerOperation = id     => API.delete(`/operations/${id}/supprimer/`);
export const listeEcritures     = params => API.get('/operations/ecritures/', { params });

// ── Comptabilité ─────────────────────────────────────────────────────────────
export const getTresorerie     = params => API.get('/comptabilite/tresorerie/', { params });
export const getCompteResultat = params => API.get('/comptabilite/compte-resultat/', { params });
export const getBilan          = params => API.get('/comptabilite/bilan/', { params });
export const getDashboard      = ()     => API.get('/comptabilite/dashboard/');

// ── IA Correction ────────────────────────────────────────────────────────────
export const corrigerImage = formData => API.post('/ia/corriger-image/', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const corrigerTexte = data => API.post('/ia/corriger-texte/', data);

// IA Operation
export const saisirOperationIA = data => API.post('/ia/saisir-operation/', data);

export default API;
