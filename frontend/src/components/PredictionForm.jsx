import React, { useState } from "react";
import { getPrediction } from "../api/api";

const labFields = [
  "Anion Gap",
  "Bicarbonate",
  "Calcium, Total",
  "Creatine Kinase (CK)",
  "Creatine Kinase, MB Isoenzyme",
  "INR(PT)",
  "PT",
  "Potassium",
  "Sodium",
  "Troponin T"
];

const labMissingFields = labFields.map((f) => `${f}_missing`);

const sampleData = {
  "Anion Gap": 16,
  "Bicarbonate": 25,
  "Calcium, Total": 9.4,
  "Creatine Kinase (CK)": 200,
  "Creatine Kinase, MB Isoenzyme": 6,
  "INR(PT)": 1.1,
  "PT": 11,
  "Potassium": 4.0,
  "Sodium": 137,
  "Troponin T": 0.01,
  "Anion Gap_missing": 0,
  "Bicarbonate_missing": 0,
  "Calcium, Total_missing": 0,
  "Creatine Kinase (CK)_missing": 0,
  "Creatine Kinase, MB Isoenzyme_missing": 0,
  "INR(PT)_missing": 0,
  "PT_missing": 0,
  "Potassium_missing": 0,
  "Sodium_missing": 0,
  "Troponin T_missing": 0
};

const steps = [
  { id: 1, title: "Basic Info", icon: "👤", description: "Patient Overview" },
  { id: 2, title: "Lab Values", icon: "🧪", description: "Laboratory Results" },
  { id: 3, title: "Data Status", icon: "📊", description: "Availability Check" },
  { id: 4, title: "Review", icon: "✅", description: "Final Review" }
];

export default function PredictionForm({ onResults }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [labs, setLabs] = useState(
    Object.fromEntries([...labFields, ...labMissingFields].map((f) => [f, ""]))
  );
  const [textSvd] = useState(new Array(50).fill(0));
  const [bioBert] = useState(new Array(189).fill(0));
  const [loading, setLoading] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    age: "",
    gender: "",
    id: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLabs((prev) => ({ ...prev, [name]: value }));
  };

  const handlePatientInfoChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSampleFill = () => {
    setLabs(sampleData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const labsPayload = Object.fromEntries(
        Object.entries(labs).map(([k, v]) => [k, parseFloat(v) || 0])
      );

      const payload = {
        labs: labsPayload,
        text_svd: textSvd,
        biobert_pca: bioBert
      };

      const response = await getPrediction(payload);
      onResults(response, patientInfo);
    } catch (err) {
      console.error("Prediction error:", err);
      onResults({ error: "Failed to get prediction. Please try again." }, patientInfo);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setLabs(Object.fromEntries([...labFields, ...labMissingFields].map((f) => [f, ""])));
    setPatientInfo({ name: "", age: "", gender: "", id: "" });
    setCurrentStep(1);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 1:
        return patientInfo.name && patientInfo.age && patientInfo.gender;
      case 2:
        return labFields.every(field => labs[field] && labs[field] !== "");
      case 3:
        return labMissingFields.every(field => labs[field] !== "");
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>Patient Information</h2>
              <p>Enter basic patient details for the assessment</p>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Patient Name</label>
                <input
                  type="text"
                  name="name"
                  value={patientInfo.name}
                  onChange={handlePatientInfoChange}
                  placeholder="Enter patient name"
                  className="modern-input"
                />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  value={patientInfo.age}
                  onChange={handlePatientInfoChange}
                  placeholder="Enter age"
                  className="modern-input"
                  min="1"
                  max="120"
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={patientInfo.gender}
                  onChange={handlePatientInfoChange}
                  className="modern-select"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Patient ID</label>
                <input
                  type="text"
                  name="id"
                  value={patientInfo.id}
                  onChange={handlePatientInfoChange}
                  placeholder="Enter patient ID (optional)"
                  className="modern-input"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>Laboratory Values</h2>
              <p>Enter the latest laboratory test results</p>
            </div>
            <div className="lab-grid">
              {labFields.map((key) => (
                <div className="lab-input-group" key={key}>
                  <label className="lab-label">
                    {key}
                    <span className="unit">mg/dL</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    name={key}
                    value={labs[key]}
                    onChange={handleChange}
                    placeholder="Enter value"
                    className="modern-input"
                    required
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>Data Availability</h2>
              <p>Specify which laboratory values are available</p>
            </div>
            <div className="status-grid">
              {labMissingFields.map((key) => (
                <div className="status-input-group" key={key}>
                  <label className="status-label">
                    {key.replace('_missing', '')}
                  </label>
                  <select
                    name={key}
                    value={labs[key]}
                    onChange={handleChange}
                    className="modern-select"
                    required
                  >
                    <option value="">Select status</option>
                    <option value="0">✅ Available</option>
                    <option value="1">❌ Missing</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>Review & Submit</h2>
              <p>Review all information before running the analysis</p>
            </div>
            <div className="review-sections">
              <div className="review-section">
                <h3>Patient Information</h3>
                <div className="review-data">
                  <div className="review-item">
                    <span className="label">Name:</span>
                    <span className="value">{patientInfo.name}</span>
                  </div>
                  <div className="review-item">
                    <span className="label">Age:</span>
                    <span className="value">{patientInfo.age} years</span>
                  </div>
                  <div className="review-item">
                    <span className="label">Gender:</span>
                    <span className="value">{patientInfo.gender}</span>
                  </div>
                  {patientInfo.id && (
                    <div className="review-item">
                      <span className="label">ID:</span>
                      <span className="value">{patientInfo.id}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="review-section">
                <h3>Laboratory Values</h3>
                <div className="review-data">
                  {labFields.map((field) => (
                    <div className="review-item" key={field}>
                      <span className="label">{field}:</span>
                      <span className="value">{labs[field]} mg/dL</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modern-wizard">
      {/* Header */}
      <div className="wizard-header">
        <div className="header-content">
          <div className="medical-icon">❤️</div>
          <div className="header-text">
            <h1 className="app-title">CardioRisk AI</h1>
            <p className="app-subtitle">Advanced Cardiac Risk Assessment Platform</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="wizard-container">
        {/* Sidebar Navigation */}
        <div className="wizard-sidebar">
          <div className="sidebar-header">
            <h3>Assessment Steps</h3>
            <div className="progress-indicator">
              <span className="progress-text">Step {currentStep} of {steps.length}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="step-navigation">
            {steps.map((step) => (
              <div 
                key={step.id}
                className={`step-item ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                onClick={() => setCurrentStep(step.id)}
              >
                <div className="step-icon">
                  {currentStep > step.id ? '✅' : step.icon}
                </div>
                <div className="step-info">
                  <div className="step-title">{step.title}</div>
                  <div className="step-description">{step.description}</div>
                </div>
                {currentStep > step.id && (
                  <div className="step-check">✓</div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="sidebar-actions">
            <button
              type="button"
              onClick={handleSampleFill}
              className="action-btn secondary"
            >
              <span className="btn-icon">🧪</span>
              Load Sample Data
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="action-btn secondary"
            >
              <span className="btn-icon">🗑️</span>
              Clear Form
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="wizard-content">
          <form className="wizard-form" onSubmit={handleSubmit}>
            {renderStepContent()}
            
            {/* Navigation Controls */}
            <div className="wizard-controls">
              <div className="control-buttons">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="nav-btn secondary"
                  >
                    ← Previous
                  </button>
                )}
                
                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="nav-btn primary"
                    disabled={!isStepValid(currentStep)}
                  >
                    Next →
                  </button>
                ) : (
                  <button 
                    className={`submit-btn primary ${loading ? 'loading' : ''}`} 
                    type="submit" 
                    disabled={loading || !isStepValid(currentStep)}
                  >
                    {loading ? (
                      <>
                        <div className="pulse-loader"></div>
                        Analyzing Patient Data...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">📈</span>
                        Run Comprehensive Analysis
                      </>
                    )}
                  </button>
                )}
              </div>
              
              <div className="form-footer">
                <div className="security-badge">
                  <span className="badge-icon">🔒</span>
                  HIPAA Compliant • Secure Data Processing
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}