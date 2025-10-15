// PredictionForm.jsx
import React, { useState } from "react";
import { getPrediction } from "../api/api";
import { 
  Heart, 
  User, 
  Beaker, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw
} from "lucide-react";

const labFields = [
  "Anion Gap", "Bicarbonate", "Calcium, Total", "Creatine Kinase (CK)",
  "Creatine Kinase, MB Isoenzyme", "INR(PT)", "PT", "Potassium", "Sodium", "Troponin T"
];

const sampleData = {
  "Anion Gap": 16, "Bicarbonate": 25, "Calcium, Total": 9.4, "Creatine Kinase (CK)": 200,
  "Creatine Kinase, MB Isoenzyme": 6, "INR(PT)": 1.1, "PT": 11, "Potassium": 4.0, "Sodium": 137, "Troponin T": 0.01
};

const steps = ["Patient Info", "Lab Values", "Review"];

export default function PredictionForm({ onResults }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [labs, setLabs] = useState(Object.fromEntries(labFields.map(f => [f, ""])));
  const [loading, setLoading] = useState(false);
  const [patientInfo, setPatientInfo] = useState({ name: "", age: "", gender: "", id: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLabs(prev => ({ ...prev, [name]: value }));
  };

  const handlePatientInfoChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSampleFill = () => {
    setLabs(sampleData);
    setPatientInfo({ name: "John Doe", age: "45", gender: "Male", id: "P-12345" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const labsPayload = Object.fromEntries(Object.entries(labs).map(([k, v]) => [k, parseFloat(v) || 0]));
      const payload = { 
        labs: labsPayload, 
        text_svd: new Array(50).fill(0), 
        biobert_pca: new Array(189).fill(0) 
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
    setLabs(Object.fromEntries(labFields.map(f => [f, ""])));
    setPatientInfo({ name: "", age: "", gender: "", id: "" });
    setCurrentStep(0);
  };

  const nextStep = () => currentStep < steps.length - 1 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 0 && setCurrentStep(currentStep - 1);

  // Helper function for input interactions
  const getInputProps = () => ({
    onFocus: (e) => {
      e.target.className = 'oceanic-input oceanic-input-focus';
    },
    onBlur: (e) => {
      e.target.className = 'oceanic-input';
    },
    onMouseEnter: (e) => {
      if (document.activeElement !== e.target) {
        e.target.className = 'oceanic-input oceanic-input-hover';
      }
    },
    onMouseLeave: (e) => {
      if (document.activeElement !== e.target) {
        e.target.className = 'oceanic-input';
      }
    }
  });

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return patientInfo.name && patientInfo.age && patientInfo.gender;
      case 1: return labFields.every(field => labs[field] && labs[field] !== "");
      case 2: return true;
      default: return false;
    }
  };

  // Oceanic Blues Color Palette
  const colors = {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    secondary: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
    },
    accent: {
      deepBlue: '#1e3a8a',
      oceanBlue: '#0ea5e9',
      teal: '#14b8a6',
      cyan: '#06b6d4',
      aqua: '#22d3ee',
      navy: '#1e40af',
      skyBlue: '#38bdf8',
      turquoise: '#0891b2'
    },
    gradient: {
      primary: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
      secondary: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
      success: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      warning: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
      danger: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
      rainbow: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 25%, #06b6d4 50%, #22d3ee 75%, #1e40af 100%)',
      oceanic: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 50%, #06b6d4 100%)',
      deepOcean: 'linear-gradient(135deg, #1e3a8a 0%, #0ea5e9 50%, #14b8a6 100%)'
    },
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    }
  };

  const styles = {
    app: {
      minHeight: '100vh',
      background: `linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #bae6fd 50%, #ccfbf1 75%, #f0fdfa 100%)`,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      position: 'relative'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${colors.neutral[200]}`,
      padding: '1.5rem 0',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 2rem'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      boxShadow: '0 8px 32px rgba(14, 165, 233, 0.15)',
      border: `1px solid rgba(14, 165, 233, 0.2)`,
      overflow: 'hidden'
    },
    stepIndicator: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2.5rem 2rem',
      background: colors.gradient.oceanic,
      borderBottom: `1px solid ${colors.neutral[200]}`,
      position: 'relative',
      overflow: 'hidden'
    },
    step: {
      display: 'flex',
      alignItems: 'center',
      color: 'white',
      fontSize: '0.9rem',
      fontWeight: '600',
      position: 'relative',
      zIndex: 2
    },
    stepNumber: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 0.75rem',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      border: `2px solid rgba(255, 255, 255, 0.3)`,
      backdropFilter: 'blur(10px)'
    },
    activeStep: {
      background: colors.gradient.success,
      color: 'white',
      borderColor: 'rgba(255, 255, 255, 0.8)',
      transform: 'scale(1.1)',
      boxShadow: '0 8px 25px rgba(6, 182, 212, 0.4)'
    },
    completedStep: {
      background: colors.gradient.secondary,
      color: 'white',
      borderColor: 'rgba(255, 255, 255, 0.8)',
      transform: 'scale(1.05)',
      boxShadow: '0 6px 20px rgba(20, 184, 166, 0.4)'
    },
    stepLine: {
      width: '80px',
      height: '4px',
      background: 'rgba(255, 255, 255, 0.3)',
      margin: '0 0.5rem',
      borderRadius: '2px',
      position: 'relative',
      overflow: 'hidden'
    },
    activeLine: {
      background: colors.gradient.oceanic,
      boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
    },
    content: {
      padding: '3rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: colors.neutral[700],
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    input: {
      padding: '1rem 1.25rem',
      border: `2px solid ${colors.neutral[300]}`,
      borderRadius: '12px',
      fontSize: '1rem',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      background: 'white',
      fontFamily: 'inherit',
      position: 'relative',
      overflow: 'hidden'
    },
    inputFocus: {
      borderColor: colors.accent.oceanBlue,
      boxShadow: `0 0 0 4px ${colors.accent.oceanBlue}20`,
      transform: 'translateY(-2px)',
      background: `linear-gradient(135deg, #ffffff 0%, ${colors.primary[50]} 100%)`
    },
    inputHover: {
      borderColor: colors.accent.cyan,
      transform: 'translateY(-1px)',
      boxShadow: `0 4px 12px ${colors.accent.cyan}20`
    },
    buttonGroup: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '2rem',
      paddingTop: '2rem',
      borderTop: `1px solid ${colors.neutral[200]}`
    },
    button: {
      padding: '1rem 2rem',
      borderRadius: '12px',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontFamily: 'inherit'
    },
    primaryButton: {
      background: colors.gradient.primary,
      color: 'white',
      boxShadow: '0 8px 25px rgba(14, 165, 233, 0.4)',
      position: 'relative',
      overflow: 'hidden'
    },
    primaryButtonHover: {
      transform: 'translateY(-3px)',
      boxShadow: '0 12px 35px rgba(14, 165, 233, 0.6)',
      background: colors.gradient.oceanic
    },
    secondaryButton: {
      background: 'transparent',
      color: colors.accent.oceanBlue,
      border: `2px solid ${colors.accent.cyan}`,
      position: 'relative',
      overflow: 'hidden'
    },
    secondaryButtonHover: {
      background: colors.gradient.success,
      color: 'white',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(6, 182, 212, 0.4)'
    },
    accentButton: {
      background: colors.gradient.deepOcean,
      color: 'white',
      boxShadow: '0 8px 25px rgba(30, 58, 138, 0.4)',
      position: 'relative',
      overflow: 'hidden'
    },
    accentButtonHover: {
      transform: 'translateY(-3px)',
      boxShadow: '0 12px 35px rgba(30, 58, 138, 0.6)',
      background: colors.gradient.oceanic
    },
    labGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.25rem'
    },
    reviewItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 1.5rem',
      borderBottom: `1px solid ${colors.neutral[200]}`,
      transition: 'background-color 0.2s ease'
    },
    reviewItemHover: {
      background: colors.primary[50]
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    spinner: {
      width: '20px',
      height: '20px',
      border: `2px solid transparent`,
      borderTop: `2px solid white`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    headerActions: {
      display: 'flex',
      gap: '1rem'
    },
    iconWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  };

  return (
    <div style={styles.app}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          width: '180px',
          height: '180px',
          background: colors.gradient.oceanic,
          borderRadius: '50%',
          opacity: 0.08,
          animation: 'float 7s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '30%',
          left: '5%',
          width: '120px',
          height: '120px',
          background: colors.gradient.success,
          borderRadius: '50%',
          opacity: 0.1,
          animation: 'float 9s ease-in-out infinite reverse'
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '80px',
          height: '80px',
          background: colors.gradient.secondary,
          borderRadius: '50%',
          opacity: 0.06,
          animation: 'float 11s ease-in-out infinite'
        }} />
      </div>

      {/* Header */}
      <div style={{...styles.header, position: 'relative', zIndex: 1}}>
        <div style={styles.container}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                ...styles.iconWrapper,
                background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.secondary[500]})`,
                borderRadius: '12px',
                padding: '0.75rem',
                color: 'white'
              }}>
                <Heart size={28} />
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: '800', 
                  background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.secondary[600]})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0 
                }}>
                  CardioRisk AI
                </h1>
                <p style={{ 
                  color: colors.neutral[600], 
                  margin: 0,
                  fontSize: '0.95rem'
                }}>
                  Advanced Cardiac Risk Assessment
                </p>
              </div>
            </div>
            <div style={styles.headerActions}>
              <button 
                onClick={handleSampleFill} 
                style={{ 
                  ...styles.button, 
                  ...styles.secondaryButton,
                  padding: '0.75rem 1.5rem'
                }}
              >
                <Beaker size={18} />
                Sample Data
              </button>
              <button 
                onClick={clearForm} 
                style={{ 
                  ...styles.button, 
                  ...styles.secondaryButton,
                  padding: '0.75rem 1.5rem'
                }}
              >
                <RotateCcw size={18} />
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ ...styles.container, padding: '2rem', position: 'relative', zIndex: 1 }}>
        <div style={styles.card} className="form-card">
          {/* Step Indicator */}
          <div style={styles.stepIndicator}>
            {steps.map((step, index) => (
              <React.Fragment key={step}>
                <div style={styles.step}>
                  <div style={{
                    ...styles.stepNumber,
                    ...(currentStep > index ? styles.completedStep : {}),
                    ...(currentStep === index ? styles.activeStep : {})
                  }}>
                    {currentStep > index ? <CheckCircle size={18} /> : index + 1}
                  </div>
                  <span style={{
                    color: currentStep >= index ? colors.primary[700] : colors.neutral[500],
                    fontWeight: currentStep === index ? '700' : '600'
                  }}>
                    {step}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div style={{
                    ...styles.stepLine,
                    ...(currentStep > index ? styles.activeLine : {})
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Form Content */}
          <div style={styles.content}>
            <form onSubmit={handleSubmit}>
              {currentStep === 0 && (
                <div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    marginBottom: '2rem' 
                  }}>
                    <div style={{
                      ...styles.iconWrapper,
                      background: colors.primary[100],
                      borderRadius: '50%',
                      padding: '0.75rem',
                      color: colors.primary[600]
                    }}>
                      <User size={24} />
                    </div>
                    <div>
                      <h2 style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: '700', 
                        color: colors.neutral[800],
                        margin: 0
                      }}>
                        Patient Information
                      </h2>
                      <p style={{ 
                        color: colors.neutral[600], 
                        margin: 0,
                        fontSize: '1rem'
                      }}>
                        Enter basic patient details for assessment
                      </p>
                    </div>
                  </div>
                  
                  <div style={styles.grid}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>
                        <User size={16} />
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={patientInfo.name}
                        onChange={handlePatientInfoChange}
                        placeholder="Enter patient name"
                        className="oceanic-input"
                        {...getInputProps()}
                        required
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>
                        📅 Age
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={patientInfo.age}
                        onChange={handlePatientInfoChange}
                        placeholder="Enter age"
                        className="oceanic-input"
                        min="1"
                        max="120"
                        {...getInputProps()}
                        required
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>
                        ⚧ Gender
                      </label>
                      <select
                        name="gender"
                        value={patientInfo.gender}
                        onChange={handlePatientInfoChange}
                        className="oceanic-input"
                        {...getInputProps()}
                        required
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>
                        🆔 Patient ID
                      </label>
                      <input
                        type="text"
                        name="id"
                        value={patientInfo.id}
                        onChange={handlePatientInfoChange}
                        placeholder="Enter patient ID (optional)"
                        className="oceanic-input"
                        {...getInputProps()}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    marginBottom: '2rem' 
                  }}>
                    <div style={{
                      ...styles.iconWrapper,
                      background: colors.secondary[100],
                      borderRadius: '50%',
                      padding: '0.75rem',
                      color: colors.secondary[600]
                    }}>
                      <Beaker size={24} />
                    </div>
                    <div>
                      <h2 style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: '700', 
                        color: colors.neutral[800],
                        margin: 0
                      }}>
                        Laboratory Values
                      </h2>
                      <p style={{ 
                        color: colors.neutral[600], 
                        margin: 0,
                        fontSize: '1rem'
                      }}>
                        Enter the latest laboratory test results
                      </p>
                    </div>
                  </div>
                  
                  <div style={styles.labGrid}>
                    {labFields.map(field => (
                      <div key={field} style={styles.inputGroup}>
                        <label style={styles.label}>
                          <Beaker size={16} />
                          {field}
                        </label>
                        <input
                          type="number"
                          step="any"
                          name={field}
                          value={labs[field]}
                          onChange={handleChange}
                          placeholder="Enter value"
                          className="oceanic-input"
                          {...getInputProps()}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    marginBottom: '2rem' 
                  }}>
                    <div style={{
                      ...styles.iconWrapper,
                      background: colors.accent.peach,
                      borderRadius: '50%',
                      padding: '0.75rem',
                      color: colors.accent.orange
                    }}>
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <h2 style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: '700', 
                        color: colors.neutral[800],
                        margin: 0
                      }}>
                        Review Information
                      </h2>
                      <p style={{ 
                        color: colors.neutral[600], 
                        margin: 0,
                        fontSize: '1rem'
                      }}>
                        Verify all information before running analysis
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ 
                    background: colors.neutral[50], 
                    padding: '2rem', 
                    borderRadius: '16px',
                    border: `1px solid ${colors.neutral[200]}`
                  }}>
                    <h3 style={{ 
                      color: colors.primary[600], 
                      marginBottom: '1.5rem',
                      fontSize: '1.25rem',
                      fontWeight: '600'
                    }}>
                      Patient Details
                    </h3>
                    <div style={styles.reviewItem}>
                      <span style={{ fontWeight: '600', color: colors.neutral[700] }}>Name:</span>
                      <span style={{ color: colors.neutral[800], fontWeight: '500' }}>{patientInfo.name}</span>
                    </div>
                    <div style={styles.reviewItem}>
                      <span style={{ fontWeight: '600', color: colors.neutral[700] }}>Age:</span>
                      <span style={{ color: colors.neutral[800], fontWeight: '500' }}>{patientInfo.age} years</span>
                    </div>
                    <div style={styles.reviewItem}>
                      <span style={{ fontWeight: '600', color: colors.neutral[700] }}>Gender:</span>
                      <span style={{ color: colors.neutral[800], fontWeight: '500' }}>{patientInfo.gender}</span>
                    </div>
                    
                    <h3 style={{ 
                      color: colors.secondary[600], 
                      marginTop: '2rem', 
                      marginBottom: '1.5rem',
                      fontSize: '1.25rem',
                      fontWeight: '600'
                    }}>
                      Lab Values
                    </h3>
                    {labFields.map(field => (
                      <div key={field} style={styles.reviewItem}>
                        <span style={{ fontWeight: '600', color: colors.neutral[700] }}>{field}:</span>
                        <span style={{ color: colors.neutral[800], fontWeight: '500' }}>{labs[field]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div style={styles.buttonGroup}>
                <div>
                  {currentStep > 0 && (
                    <button 
                      type="button" 
                      onClick={prevStep} 
                      style={{ ...styles.button, ...styles.secondaryButton }}
                    >
                      <ArrowLeft size={18} />
                      Previous
                    </button>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {currentStep < steps.length - 1 ? (
                    <button 
                      type="button" 
                      onClick={nextStep} 
                      style={{ ...styles.button, ...styles.primaryButton }}
                      disabled={!isStepValid()}
                    >
                      Next
                      <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button 
                      type="submit" 
                      style={{ ...styles.button, ...styles.accentButton }}
                      disabled={loading || !isStepValid()}
                    >
                      {loading ? (
                        <div style={styles.loading}>
                          <div style={styles.spinner}></div>
                          Analyzing...
                        </div>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Run Analysis
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .form-card {
          animation: slideInUp 0.6s ease-out;
        }
        
        .oceanic-input {
          padding: 1rem 1.25rem;
          border: 2px solid #cbd5e1;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background: white;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          position: relative;
          overflow: hidden;
          width: 100%;
          box-sizing: border-box;
        }
        
        .oceanic-input:focus {
          outline: none;
          border-color: #0ea5e9;
          box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.2);
          transform: translateY(-2px);
          background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
        }
        
        .oceanic-input:hover:not(:focus) {
          border-color: #06b6d4;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
        }
        
        .oceanic-input::placeholder {
          color: #94a3b8;
          font-weight: 400;
        }
        
        .oceanic-input:focus::placeholder {
          color: #64748b;
        }
      `}</style>
    </div>
  );
}