import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Auth from './components/Auth/Auth';
import Dashboard from './components/Dashboard/Dashboard';
import Saisie from './components/Saisie/Saisie';
import Tresorerie from './components/Tresorerie/Tresorerie';
import CompteResultat from './components/Resultat/CompteResultat';
import Bilan from './components/Bilan/Bilan';
import Journal from './components/Journal/Journal';
import Correction from './components/Correction/Correction';
import FinancialIndicatorsDashboard from './components/FinancialIndicators/FinancialIndicatorsDashboard';

function RouteProtegee({ children }) {
  const { user } = useAuth();
  return user ? <Layout>{children}</Layout> : <Navigate to="/connexion" />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/connexion" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
      <Route path="/dashboard"       element={<RouteProtegee><Dashboard /></RouteProtegee>} />
      <Route path="/saisie"          element={<RouteProtegee><Saisie /></RouteProtegee>} />
      <Route path="/tresorerie"      element={<RouteProtegee><Tresorerie /></RouteProtegee>} />
      <Route path="/compte-resultat" element={<RouteProtegee><CompteResultat /></RouteProtegee>} />
      <Route path="/bilan"           element={<RouteProtegee><Bilan /></RouteProtegee>} />
      <Route path="/journal"         element={<RouteProtegee><Journal /></RouteProtegee>} />
      <Route path="/correction"      element={<RouteProtegee><Correction /></RouteProtegee>} />
      <Route path="/indicateurs-financiers" element={<RouteProtegee><FinancialIndicatorsDashboard /></RouteProtegee>} />
      <Route path="*"                element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
