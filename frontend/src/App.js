// App.js
import React, { useState } from 'react';
import './App.css';
import PredictionForm from './components/PredictionForm';
import PredictionResult from './components/PredictionResult';

function App() {
  const [currentView, setCurrentView] = useState('form');
  const [results, setResults] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);

  const handleFormSubmit = (resultData, patientData) => {
    setResults(resultData);
    setPatientInfo(patientData);
    setCurrentView('results');
  };

  const handleBackToForm = () => {
    setCurrentView('form');
    setResults(null);
    setPatientInfo(null);
  };

  return (
    <div className="App">
      {currentView === 'form' ? (
        <PredictionForm onResults={handleFormSubmit} />
      ) : (
        <PredictionResult result={results} patientInfo={patientInfo} onBack={handleBackToForm} />
      )}
    </div>
  );
}

export default App;