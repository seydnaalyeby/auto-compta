import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import './FinancialIndicatorsDashboard.css';

const FinancialIndicatorsDashboard = () => {
  const { user } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    investmentInitial: '',
    discountRate: '',
    netResult: '',
    amortization: '',
    receivables: '',
    payables: '',
    cashFlows: ['']
  });

  // Results state
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // AI state
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiResults, setAiResults] = useState(null);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle cash flow changes
  const handleCashFlowChange = (index, value) => {
    const newCashFlows = [...formData.cashFlows];
    newCashFlows[index] = value;
    setFormData(prev => ({
      ...prev,
      cashFlows: newCashFlows
    }));
  };

  // Add new cash flow input
  const addCashFlow = () => {
    setFormData(prev => ({
      ...prev,
      cashFlows: [...prev.cashFlows, '']
    }));
  };

  // Remove cash flow input
  const removeCashFlow = (index) => {
    const newCashFlows = formData.cashFlows.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      cashFlows: newCashFlows
    }));
  };

  // Calculate indicators
  const calculateIndicators = async () => {
    setLoading(true);
    setError('');

    try {
      // Validate form data
      if (!formData.investmentInitial || !formData.discountRate || !formData.netResult || 
          !formData.amortization || !formData.receivables || !formData.payables) {
        setError('Veuillez remplir tous les champs obligatoires');
        setLoading(false);
        return;
      }

      const validCashFlows = formData.cashFlows.filter(cf => cf.trim() !== '');
      if (validCashFlows.length === 0) {
        setError('Veuillez ajouter au moins un flux de trésorerie');
        setLoading(false);
        return;
      }

      const requestData = {
        investmentInitial: parseFloat(formData.investmentInitial),
        discountRate: parseFloat(formData.discountRate) / 100, // Convert percentage to decimal
        netResult: parseFloat(formData.netResult),
        amortization: parseFloat(formData.amortization),
        receivables: parseFloat(formData.receivables),
        payables: parseFloat(formData.payables),
        cashFlows: validCashFlows.map(cf => parseFloat(cf))
      };

      const response = await API.post('/financial-indicators/calculate/', requestData);

      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du calcul des indicateurs');
    } finally {
      setLoading(false);
    }
  };

  // Calculate indicators with AI
  const calculateIndicatorsWithAI = async () => {
    setAiLoading(true);
    setAiError('');

    try {
      if (!aiText.trim()) {
        setAiError('Veuillez entrer une description du projet financier');
        setAiLoading(false);
        return;
      }

      const requestData = {
        text: aiText.trim()
      };

      const response = await API.post('/financial-indicators/calculate-ai/', requestData);

      setAiResults(response.data);
    } catch (err) {
      setAiError(err.response?.data?.error || 'Erreur lors du calcul avec IA');
    } finally {
      setAiLoading(false);
    }
  };

  // Interpretation functions
  const interpretBFR = (value) => {
    if (value < 0) return { text: 'BFR maîtrisé', color: '#10B981' };
    return { text: 'BFR élevé (attention trésorerie)', color: '#EF4444' };
  };

  const interpretVAN = (value) => {
    if (value > 0) return { text: 'Projet rentable', color: '#10B981' };
    return { text: 'Projet non rentable', color: '#EF4444' };
  };

  const interpretIP = (value) => {
    if (value > 1) return { text: 'Rentable', color: '#10B981' };
    return { text: 'Non rentable', color: '#EF4444' };
  };

  const interpretDRSI = (value) => {
    if (value === Infinity) return { text: 'Récupération impossible', color: '#EF4444' };
    if (value < 2) return { text: 'Récupération rapide', color: '#10B981' };
    if (value > 4) return { text: 'Risque élevé', color: '#EF4444' };
    return { text: 'Récupération normale', color: '#F59E0B' };
  };

  const interpretCAF = (value) => {
    if (value > 0) return { text: 'Bonne capacité financière', color: '#10B981' };
    return { text: 'Difficulté financière', color: '#EF4444' };
  };

  if (!user) {
    return (
      <div className="financial-indicators">
        <div className="error-message">
          Veuillez vous connecter pour accéder aux indicateurs financiers
        </div>
      </div>
    );
  }

  return (
    <div className="financial-indicators">
      <div className="container">
        <h1>Indicateurs Financiers</h1>
        
        {/* AI Calculation Section */}
        <div className="ai-section">
          <h2>Calcul avec IA</h2>
          <p className="ai-description">
            Décrivez votre projet financier en langage naturel et l'IA extraira automatiquement les données pour calculer les indicateurs.
          </p>
          
          <div className="ai-form">
            <div className="form-group">
              <label>Description du projet financier</label>
              <textarea
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                placeholder="Exemple: Je veux investir 100000 MRU dans un projet qui générera des revenus de 30000 MRU la première année, 40000 MRU la deuxième année et 50000 MRU la troisième année. Le taux d'actualisation est de 10%. Le résultat net est de 50000 MRU avec un amortissement de 20000 MRU. Les créances sont de 50000 MRU et les dettes de 30000 MRU."
                rows={6}
                className="ai-textarea"
              />
            </div>
            
            <button
              onClick={calculateIndicatorsWithAI}
              disabled={aiLoading}
              className="ai-calculate-button"
            >
              {aiLoading ? 'Analyse en cours...' : 'Calculer avec IA'}
            </button>
            
            {aiError && (
              <div className="error-message">
                {aiError}
              </div>
            )}
          </div>
          
          {aiResults && (
            <div className="ai-results">
              <h3>Données extraites par l'IA</h3>
              <div className="extracted-data-grid">
                <div className="data-item">
                  <label>Investissement initial:</label>
                  <span>{aiResults.extractedData.investmentInitial.toLocaleString()} MRU</span>
                </div>
                <div className="data-item">
                  <label>Flux de trésorerie:</label>
                  <span>[{aiResults.extractedData.cashFlows.map(cf => cf.toLocaleString()).join(', ')}] MRU</span>
                </div>
                <div className="data-item">
                  <label>Taux d'actualisation:</label>
                  <span>{(aiResults.extractedData.discountRate * 100).toFixed(1)}%</span>
                </div>
                <div className="data-item">
                  <label>Résultat net:</label>
                  <span>{aiResults.extractedData.netResult.toLocaleString()} MRU</span>
                </div>
                <div className="data-item">
                  <label>Amortissement:</label>
                  <span>{aiResults.extractedData.amortization.toLocaleString()} MRU</span>
                </div>
                <div className="data-item">
                  <label>Créances:</label>
                  <span>{aiResults.extractedData.receivables.toLocaleString()} MRU</span>
                </div>
                <div className="data-item">
                  <label>Dettes:</label>
                  <span>{aiResults.extractedData.payables.toLocaleString()} MRU</span>
                </div>
              </div>
              
              <h3>Indicateurs calculés</h3>
              <div className="results-grid">
                <div className="result-card">
                  <h3>BFR</h3>
                  <div className="value">{aiResults.indicators.bfr.toLocaleString()} MRU</div>
                  <div className="interpretation" style={{ color: interpretBFR(aiResults.indicators.bfr).color }}>
                    {interpretBFR(aiResults.indicators.bfr).text}
                  </div>
                </div>

                <div className="result-card">
                  <h3>VAN</h3>
                  <div className="value">{aiResults.indicators.van.toLocaleString()} MRU</div>
                  <div className="interpretation" style={{ color: interpretVAN(aiResults.indicators.van).color }}>
                    {interpretVAN(aiResults.indicators.van).text}
                  </div>
                </div>

                <div className="result-card">
                  <h3>IP</h3>
                  <div className="value">{aiResults.indicators.ip}</div>
                  <div className="interpretation" style={{ color: interpretIP(aiResults.indicators.ip).color }}>
                    {interpretIP(aiResults.indicators.ip).text}
                  </div>
                </div>

                <div className="result-card">
                  <h3>DRSI</h3>
                  <div className="value">
                    {aiResults.indicators.drsi === Infinity ? 'Jamais' : `${aiResults.indicators.drsi} ans`}
                  </div>
                  <div className="interpretation" style={{ color: interpretDRSI(aiResults.indicators.drsi).color }}>
                    {interpretDRSI(aiResults.indicators.drsi).text}
                  </div>
                </div>

                <div className="result-card">
                  <h3>CAF</h3>
                  <div className="value">{aiResults.indicators.caf.toLocaleString()} MRU</div>
                  <div className="interpretation" style={{ color: interpretCAF(aiResults.indicators.caf).color }}>
                    {interpretCAF(aiResults.indicators.caf).text}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="form-section">
          <h2>Données d'entrée</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Investissement initial *</label>
              <input
                type="number"
                name="investmentInitial"
                value={formData.investmentInitial}
                onChange={handleInputChange}
                placeholder="100000"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Taux d'actualisation (%) *</label>
              <input
                type="number"
                name="discountRate"
                value={formData.discountRate}
                onChange={handleInputChange}
                placeholder="10"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Résultat net *</label>
              <input
                type="number"
                name="netResult"
                value={formData.netResult}
                onChange={handleInputChange}
                placeholder="50000"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Amortissement *</label>
              <input
                type="number"
                name="amortization"
                value={formData.amortization}
                onChange={handleInputChange}
                placeholder="20000"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Créances *</label>
              <input
                type="number"
                name="receivables"
                value={formData.receivables}
                onChange={handleInputChange}
                placeholder="50000"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Dettes *</label>
              <input
                type="number"
                name="payables"
                value={formData.payables}
                onChange={handleInputChange}
                placeholder="30000"
                step="0.01"
              />
            </div>
          </div>

          <div className="cash-flows-section">
            <label>Flux de trésorerie annuels *</label>
            {formData.cashFlows.map((cashFlow, index) => (
              <div key={index} className="cash-flow-input">
                <input
                  type="number"
                  value={cashFlow}
                  onChange={(e) => handleCashFlowChange(index, e.target.value)}
                  placeholder={`Année ${index + 1}`}
                  step="0.01"
                />
                {formData.cashFlows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCashFlow(index)}
                    className="remove-button"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addCashFlow}
              className="add-button"
            >
              + Ajouter une année
            </button>
          </div>

          <button
            onClick={calculateIndicators}
            disabled={loading}
            className="calculate-button"
          >
            {loading ? 'Calcul en cours...' : 'Calculer les indicateurs'}
          </button>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        {results && (
          <div className="results-section">
            <h2>Résultats</h2>
            
            <div className="results-grid">
              <div className="result-card">
                <h3>BFR</h3>
                <div className="value">{results.bfr.toLocaleString()} MRU</div>
                <div className="interpretation" style={{ color: interpretBFR(results.bfr).color }}>
                  {interpretBFR(results.bfr).text}
                </div>
              </div>

              <div className="result-card">
                <h3>VAN</h3>
                <div className="value">{results.van.toLocaleString()} MRU</div>
                <div className="interpretation" style={{ color: interpretVAN(results.van).color }}>
                  {interpretVAN(results.van).text}
                </div>
              </div>

              <div className="result-card">
                <h3>IP</h3>
                <div className="value">{results.ip}</div>
                <div className="interpretation" style={{ color: interpretIP(results.ip).color }}>
                  {interpretIP(results.ip).text}
                </div>
              </div>

              <div className="result-card">
                <h3>DRSI</h3>
                <div className="value">
                  {results.drsi === Infinity ? 'Jamais' : `${results.drsi} ans`}
                </div>
                <div className="interpretation" style={{ color: interpretDRSI(results.drsi).color }}>
                  {interpretDRSI(results.drsi).text}
                </div>
              </div>

              <div className="result-card">
                <h3>CAF</h3>
                <div className="value">{results.caf.toLocaleString()} MRU</div>
                <div className="interpretation" style={{ color: interpretCAF(results.caf).color }}>
                  {interpretCAF(results.caf).text}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialIndicatorsDashboard;
