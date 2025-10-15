// PredictionResult.jsx
import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Activity,
  BarChart3,
  Shield
} from 'lucide-react';

export default function PredictionResult({ result, patientInfo, onBack }) {
  const [animatedConfidence, setAnimatedConfidence] = useState(0);
  const [animatedProbabilities, setAnimatedProbabilities] = useState({});

  useEffect(() => {
    const confidenceTimer = setTimeout(() => {
      setAnimatedConfidence(result.confidence || 0);
    }, 500);

    const probabilityTimer = setTimeout(() => {
      setAnimatedProbabilities(result.class_probabilities || {});
    }, 1000);

    return () => {
      clearTimeout(confidenceTimer);
      clearTimeout(probabilityTimer);
    };
  }, [result]);

  // Helper function to get full medical names and considerations
  const getConditionInfo = (condition) => {
    const conditionMap = {
      'MI': {
        fullName: 'Myocardial Infarction',
        commonName: 'Heart Attack',
        description: 'Acute blockage of blood flow to heart muscle',
        considerations: [
          'Immediate ECG and cardiac enzymes required',
          'Time-sensitive intervention critical',
          'Risk of complications: arrhythmias, heart failure',
          'Post-MI monitoring essential'
        ],
        urgency: 'Critical',
        icon: '🫀'
      },
      'HF': {
        fullName: 'Heart Failure',
        commonName: 'Congestive Heart Failure',
        description: 'Heart unable to pump blood effectively',
        considerations: [
          'Echocardiogram for ejection fraction assessment',
          'Monitor fluid balance and weight',
          'Medication optimization needed',
          'Lifestyle modifications crucial'
        ],
        urgency: 'High',
        icon: '💓'
      },
      'Arrhythmia': {
        fullName: 'Cardiac Arrhythmia',
        commonName: 'Irregular Heartbeat',
        description: 'Abnormal electrical activity in the heart',
        considerations: [
          'Continuous ECG monitoring recommended',
          'Assess for underlying causes',
          'Risk of stroke with atrial fibrillation',
          'Antiarrhythmic therapy consideration'
        ],
        urgency: 'Moderate',
        icon: '📈'
      },
      'Angina': {
        fullName: 'Angina Pectoris',
        commonName: 'Chest Pain',
        description: 'Reduced blood flow to heart muscle',
        considerations: [
          'Stress testing for diagnosis confirmation',
          'Coronary angiography consideration',
          'Risk factor modification essential',
          'Medication adherence important'
        ],
        urgency: 'Moderate',
        icon: '⚠️'
      },
      'Cardiomyopathy': {
        fullName: 'Cardiomyopathy',
        commonName: 'Heart Muscle Disease',
        description: 'Disease of the heart muscle affecting pumping',
        considerations: [
          'Genetic testing for inherited forms',
          'Echocardiogram for structural assessment',
          'Family screening recommended',
          'Long-term monitoring required'
        ],
        urgency: 'High',
        icon: '🫁'
      }
    };
    
    return conditionMap[condition] || {
      fullName: condition,
      commonName: condition,
      description: 'Cardiac condition requiring medical attention',
      considerations: ['Medical evaluation recommended', 'Follow-up care needed'],
      urgency: 'Moderate',
      icon: '❤️'
    };
  };

  const getRiskLevel = (confidence) => {
    if (confidence >= 0.8) return { 
      level: "High", 
      color: "#dc2626", // Red for high risk
      bg: "#fef2f2",
      gradient: "linear-gradient(135deg, #dc2626, #b91c1c)",
      icon: "🔴",
      description: "Immediate attention required"
    };
    if (confidence >= 0.6) return { 
      level: "Moderate", 
      color: "#ea580c", // Orange for moderate risk
      bg: "#fff7ed",
      gradient: "linear-gradient(135deg, #ea580c, #c2410c)",
      icon: "🟠",
      description: "Close monitoring recommended"
    };
    if (confidence >= 0.4) return { 
      level: "Elevated", 
      color: "#d97706", // Amber for elevated risk
      bg: "#fffbeb",
      gradient: "linear-gradient(135deg, #d97706, #b45309)",
      icon: "🟡",
      description: "Regular follow-up advised"
    };
    return { 
      level: "Low", 
      color: "#059669", // Green for low risk
      bg: "#ecfdf5",
      gradient: "linear-gradient(135deg, #059669, #047857)",
      icon: "🟢",
      description: "Continue routine monitoring"
    };
  };

  // Oceanic Blues Color Palette (matching form)
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
      overflow: 'hidden',
      marginBottom: '2rem'
    },
    content: {
      padding: '3rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      marginBottom: '2rem'
    },
    riskCard: {
      background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`,
      color: 'white',
      padding: '2.5rem',
      borderRadius: '16px',
      textAlign: 'center'
    },
    probabilityItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.25rem 1.5rem',
      background: colors.neutral[50],
      borderRadius: '12px',
      marginBottom: '0.75rem',
      border: `1px solid ${colors.neutral[200]}`,
      transition: 'all 0.3s ease'
    },
    button: {
      padding: '1rem 2rem',
      borderRadius: '12px',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontFamily: 'inherit',
      background: colors.gradient.primary,
      color: 'white',
      boxShadow: '0 8px 25px rgba(14, 165, 233, 0.4)',
      position: 'relative',
      overflow: 'hidden'
    },
    insightGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem'
    },
    insightCard: {
      background: `linear-gradient(135deg, ${colors.neutral[50]}, white)`,
      padding: '2rem',
      borderRadius: '16px',
      textAlign: 'center',
      border: `1px solid ${colors.neutral[200]}`,
      transition: 'all 0.3s ease'
    },
    iconWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1rem'
    }
  };

  if (result.error) {
    return (
      <div style={styles.app}>
        <div style={styles.header}>
          <div style={styles.container}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                ...styles.iconWrapper,
                background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.secondary[500]})`,
                borderRadius: '12px',
                padding: '0.75rem',
                color: 'white'
              }}>
                <AlertCircle size={28} />
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
                  Analysis Error
                </h1>
                <p style={{ 
                  color: colors.neutral[600], 
                  margin: 0,
                  fontSize: '0.95rem'
                }}>
                  Unable to process patient data
                </p>
              </div>
            </div>
          </div>
        </div>
        <div style={{ ...styles.container, padding: '2rem' }}>
          <div style={styles.card}>
            <div style={{ ...styles.content, textAlign: 'center' }}>
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: '1rem',
                color: colors.accent.red
              }}>
                ❌
              </div>
              <h2 style={{ 
                color: colors.accent.red, 
                marginBottom: '1rem',
                fontSize: '1.5rem'
              }}>
                Processing Error
              </h2>
              <p style={{ 
                color: colors.neutral[600], 
                marginBottom: '2rem',
                fontSize: '1.1rem'
              }}>
                {result.error}
              </p>
              <button onClick={onBack} style={styles.button}>
                <ArrowLeft size={18} />
                Return to Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const riskInfo = getRiskLevel(result.confidence);

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
          top: '10%',
          left: '10%',
          width: '200px',
          height: '200px',
          background: colors.gradient.oceanic,
          borderRadius: '50%',
          opacity: 0.1,
          animation: 'float 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: '150px',
          height: '150px',
          background: colors.gradient.success,
          borderRadius: '50%',
          opacity: 0.08,
          animation: 'float 8s ease-in-out infinite reverse'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '20%',
          width: '100px',
          height: '100px',
          background: colors.gradient.secondary,
          borderRadius: '50%',
          opacity: 0.12,
          animation: 'float 10s ease-in-out infinite'
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
                <BarChart3 size={28} />
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
                  Risk Assessment Report
                </h1>
                <p style={{ 
                  color: colors.neutral[600], 
                  margin: 0,
                  fontSize: '0.95rem'
                }}>
                  AI-Powered Cardiac Analysis Results
                </p>
              </div>
            </div>
            <button onClick={onBack} style={styles.button}>
              <ArrowLeft size={18} />
              New Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ ...styles.container, padding: '2rem', position: 'relative', zIndex: 1 }}>
        {/* Patient Info */}
        <div style={styles.card} className="result-card">
          <div style={styles.content}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'wrap', 
              gap: '1.5rem' 
            }}>
              <div>
                <h3 style={{ 
                  color: colors.neutral[500], 
                  fontSize: '0.9rem', 
                  margin: '0 0 0.5rem 0',
                  fontWeight: '600'
                }}>
                  PATIENT
                </h3>
                <p style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '700', 
                  margin: 0,
                  color: colors.neutral[800]
                }}>
                  {patientInfo?.name || "N/A"}
                </p>
              </div>
              <div>
                <h3 style={{ 
                  color: colors.neutral[500], 
                  fontSize: '0.9rem', 
                  margin: '0 0 0.5rem 0',
                  fontWeight: '600'
                }}>
                  REPORT ID
                </h3>
                <p style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '700', 
                  margin: 0,
                  color: colors.neutral[800]
                }}>
                  #{(Date.now() % 10000).toString().padStart(4, '0')}
                </p>
              </div>
              <div>
                <h3 style={{ 
                  color: colors.neutral[500], 
                  fontSize: '0.9rem', 
                  margin: '0 0 0.5rem 0',
                  fontWeight: '600'
                }}>
                  GENERATED
                </h3>
                <p style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '700', 
                  margin: 0,
                  color: colors.neutral[800]
                }}>
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                background: `linear-gradient(135deg, ${colors.primary[100]}, ${colors.secondary[100]})`, 
                padding: '0.75rem 1.5rem', 
                borderRadius: '20px', 
                color: colors.primary[700],
                fontWeight: '600'
              }}>
                <Shield size={18} />
                <span>AI Analysis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comprehensive Risk Assessment */}
        <div style={styles.card} className="result-card">
          <div style={styles.content}>
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
                <Heart size={24} />
              </div>
              <div>
                <h2 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: colors.neutral[800], 
                  margin: '0 0 0.25rem 0' 
                }}>
                  Comprehensive Risk Assessment
                </h2>
                <p style={{ 
                  color: colors.neutral[600], 
                  margin: 0,
                  fontSize: '1rem'
                }}>
                  AI-powered cardiac evaluation with probability analysis
                </p>
              </div>
            </div>

            {/* Main Risk Display */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {/* Risk Level Card */}
              <div style={{ 
                background: riskInfo.gradient, 
                padding: '2rem', 
                borderRadius: '16px', 
                color: 'white', 
                textAlign: 'center',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                position: 'relative',
                overflow: 'hidden'
              }} className="risk-card">
                <div style={{ 
                  fontSize: '2.5rem', 
                  marginBottom: '0.75rem'
                }}>
                  {riskInfo.icon}
                </div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  opacity: 0.9,
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  RISK LEVEL
                </div>
                <div style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: '800',
                  marginBottom: '0.75rem'
                }}>
                  {riskInfo.level}
                </div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  opacity: 0.8,
                  fontWeight: '500',
                  lineHeight: '1.3'
                }}>
                  {riskInfo.description}
                </div>
              </div>

              {/* Predicted Condition Card */}
              <div style={{ 
                background: 'white', 
                padding: '2rem', 
                borderRadius: '16px',
                border: `2px solid ${riskInfo.color}20`,
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
              }}>
                <div style={{
                  ...styles.iconWrapper,
                  background: riskInfo.bg,
                  borderRadius: '50%',
                  padding: '1rem',
                  color: riskInfo.color,
                  margin: '0 auto 1rem'
                }}>
                  <Heart size={28} />
                </div>
                <h3 style={{ 
                  color: colors.neutral[500], 
                  fontSize: '0.8rem', 
                  margin: '0 0 0.5rem 0',
                  fontWeight: '600'
                }}>
                  PREDICTED CONDITION
                </h3>
                <p style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: '800', 
                  margin: '0 0 0.75rem 0',
                  color: riskInfo.color
                }}>
                  {getConditionInfo(result.prediction).fullName}
                </p>
                <div style={{
                  fontSize: '0.9rem',
                  color: colors.neutral[600],
                  marginBottom: '0.75rem',
                  fontWeight: '500'
                }}>
                  {getConditionInfo(result.prediction).commonName}
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: riskInfo.bg,
                  borderRadius: '20px',
                  border: `1px solid ${riskInfo.color}30`
                }}>
                  <span style={{ fontSize: '1rem' }}>{riskInfo.icon}</span>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '600',
                    color: riskInfo.color
                  }}>
                    {riskInfo.description}
                  </span>
                </div>
              </div>

              {/* Confidence Card */}
              <div style={{ 
                background: 'white', 
                padding: '2rem', 
                borderRadius: '16px',
                border: `2px solid ${riskInfo.color}20`,
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
              }}>
                <div style={{
                  ...styles.iconWrapper,
                  background: colors.secondary[100],
                  borderRadius: '50%',
                  padding: '1rem',
                  color: colors.secondary[600],
                  margin: '0 auto 1rem'
                }}>
                  <BarChart3 size={28} />
                </div>
                <h3 style={{ 
                  color: colors.neutral[500], 
                  fontSize: '0.8rem', 
                  margin: '0 0 1rem 0',
                  fontWeight: '600'
                }}>
                  ALGORITHM CONFIDENCE
                </h3>
                <div style={{ 
                  position: 'relative', 
                  width: '120px', 
                  height: '120px', 
                  margin: '0 auto' 
                }}>
                  <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="60" cy="60" r="45" fill="none" stroke={colors.neutral[200]} strokeWidth="6" />
                    <circle 
                      cx="60" cy="60" r="45" 
                      fill="none" 
                      stroke={riskInfo.color} 
                      strokeWidth="6" 
                      strokeLinecap="round" 
                      strokeDasharray={`${2 * Math.PI * 45}`} 
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - animatedConfidence)}`} 
                      style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} 
                    />
                  </svg>
                  <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    textAlign: 'center' 
                  }}>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: '800', 
                      color: riskInfo.color 
                    }}>
                      {(animatedConfidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Probability Distribution */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '16px',
              border: `1px solid ${colors.neutral[200]}`,
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  ...styles.iconWrapper,
                  background: colors.secondary[100],
                  borderRadius: '50%',
                  padding: '0.75rem',
                  color: colors.secondary[600]
                }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '700', 
                    color: colors.neutral[800],
                    margin: 0
                  }}>
                    Condition Probability Analysis
                  </h3>
                  <p style={{ 
                    color: colors.neutral[600], 
                    margin: 0,
                    fontSize: '0.9rem'
                  }}>
                    AI model confidence across all possible cardiac conditions
                  </p>
                </div>
              </div>
              
              <div style={{
                display: 'grid',
                gap: '1rem'
              }}>
                {Object.entries(animatedProbabilities)
                  .sort(([,a], [,b]) => b - a)
                  .map(([condition, probability], index) => {
                    const isPrimary = index === 0;
                    const conditionInfo = getConditionInfo(condition);
                    const conditionColor = isPrimary ? riskInfo.color : colors.neutral[400];
                    const conditionBg = isPrimary ? riskInfo.bg : colors.neutral[50];
                    
                    if (isPrimary) {
                      // Show primary condition with full details
                      return (
                        <div key={condition} style={{
                          padding: '1.5rem',
                          background: conditionBg,
                          borderRadius: '12px',
                          border: `2px solid ${conditionColor + '30'}`,
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          overflow: 'hidden',
                          marginBottom: '1rem'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: conditionColor
                          }} />
                          
                          {/* Condition Header */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '1rem'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem'
                            }}>
                              <span style={{ fontSize: '1.5rem' }}>{conditionInfo.icon}</span>
                              <div>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  marginBottom: '0.25rem'
                                }}>
                                  <span style={{ 
                                    fontWeight: '800',
                                    color: conditionColor,
                                    fontSize: '1.2rem'
                                  }}>
                                    {conditionInfo.fullName}
                                  </span>
                                  <span style={{
                                    background: conditionColor,
                                    color: 'white',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600'
                                  }}>
                                    PRIMARY
                                  </span>
                                </div>
                                <div style={{
                                  fontSize: '0.9rem',
                                  color: colors.neutral[600],
                                  fontWeight: '500'
                                }}>
                                  {conditionInfo.commonName} • {conditionInfo.description}
                                </div>
                              </div>
                            </div>
                            
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem'
                            }}>
                              <div style={{
                                background: conditionInfo.urgency === 'Critical' ? '#dc2626' : 
                                           conditionInfo.urgency === 'High' ? '#ea580c' :
                                           conditionInfo.urgency === 'Moderate' ? '#d97706' : '#059669',
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}>
                                {conditionInfo.urgency}
                              </div>
                              <span style={{ 
                                fontWeight: '800', 
                                minWidth: '60px', 
                                textAlign: 'right',
                                color: conditionColor,
                                fontSize: '1.2rem'
                              }}>
                                {(probability * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>

                          {/* Probability Bar */}
                          <div style={{ 
                            width: '100%', 
                            height: '12px', 
                            background: colors.neutral[200], 
                            borderRadius: '6px', 
                            overflow: 'hidden',
                            marginBottom: '1rem'
                          }}>
                            <div style={{ 
                              width: `${probability * 100}%`, 
                              height: '100%', 
                              background: conditionColor,
                              transition: 'width 1.2s ease-out',
                              borderRadius: '6px',
                              boxShadow: `0 2px 8px ${conditionColor}40`
                            }}></div>
                          </div>

                          {/* Medical Considerations */}
                          <div style={{
                            background: 'white',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: `1px solid ${colors.neutral[200]}`
                          }}>
                            <div style={{
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              color: colors.neutral[700],
                              marginBottom: '0.75rem'
                            }}>
                              Medical Considerations:
                            </div>
                            <ul style={{
                              margin: 0,
                              paddingLeft: '1.2rem',
                              fontSize: '0.8rem',
                              color: colors.neutral[600],
                              lineHeight: '1.5'
                            }}>
                              {conditionInfo.considerations.map((consideration, idx) => (
                                <li key={idx} style={{ marginBottom: '0.25rem' }}>
                                  {consideration}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    } else {
                      // Show secondary conditions as compact items
                      return (
                        <div key={condition} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          background: colors.neutral[50],
                          borderRadius: '8px',
                          border: `1px solid ${colors.neutral[200]}`,
                          transition: 'all 0.3s ease'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <span style={{ fontSize: '1rem' }}>{conditionInfo.icon}</span>
                            <span style={{ 
                              fontWeight: '600',
                              color: colors.neutral[700],
                              fontSize: '0.9rem'
                            }}>
                              {conditionInfo.fullName}
                            </span>
                          </div>
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                          }}>
                            <div style={{ 
                              width: '80px', 
                              height: '6px', 
                              background: colors.neutral[200], 
                              borderRadius: '3px', 
                              overflow: 'hidden'
                            }}>
                              <div style={{ 
                                width: `${probability * 100}%`, 
                                height: '100%', 
                                background: colors.neutral[400],
                                transition: 'width 1.2s ease-out',
                                borderRadius: '3px'
                              }}></div>
                            </div>
                            <span style={{ 
                              fontWeight: '700', 
                              minWidth: '50px', 
                              textAlign: 'right',
                              color: colors.neutral[600],
                              fontSize: '0.9rem'
                            }}>
                              {(probability * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      );
                    }
                  })}
              </div>
            </div>
          </div>
        </div>


        {/* Criticality Indicators & Risk Factors */}
        <div style={styles.card} className="result-card">
          <div style={styles.content}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                ...styles.iconWrapper,
                background: riskInfo.bg,
                borderRadius: '50%',
                padding: '0.75rem',
                color: riskInfo.color
              }}>
                <Activity size={24} />
              </div>
              <div>
                <h2 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: colors.neutral[800],
                  margin: 0
                }}>
                  Criticality Assessment & Risk Factors
                </h2>
                <p style={{ 
                  color: colors.neutral[600], 
                  margin: 0,
                  fontSize: '1rem'
                }}>
                  Medical indicators and recommended actions based on risk level
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {/* Criticality Level */}
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                border: `2px solid ${riskInfo.color}30`,
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{riskInfo.icon}</span>
                  <h3 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '700', 
                    color: riskInfo.color,
                    margin: 0
                  }}>
                    Criticality Level
                  </h3>
                </div>
                <div style={{
                  background: riskInfo.bg,
                  padding: '1rem',
                  borderRadius: '8px',
                  border: `1px solid ${riskInfo.color}20`
                }}>
                  <div style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '800', 
                    color: riskInfo.color,
                    marginBottom: '0.5rem'
                  }}>
                    {riskInfo.level} Risk
                  </div>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: colors.neutral[600],
                    lineHeight: '1.4'
                  }}>
                    {riskInfo.description}
                  </div>
                </div>
              </div>

              {/* Recommended Actions */}
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                border: `2px solid ${colors.neutral[200]}`,
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    ...styles.iconWrapper,
                    background: colors.primary[100],
                    borderRadius: '50%',
                    padding: '0.5rem',
                    color: colors.primary[600]
                  }}>
                    <CheckCircle size={20} />
                  </div>
                  <h3 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '700', 
                    color: colors.neutral[800],
                    margin: 0
                  }}>
                    Recommended Actions
                  </h3>
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: colors.neutral[600],
                  lineHeight: '1.5'
                }}>
                  {riskInfo.level === 'High' && (
                    <div>
                      <div style={{ fontWeight: '600', color: '#dc2626', marginBottom: '0.5rem' }}>Immediate Actions:</div>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                        <li>Emergency consultation required</li>
                        <li>Continuous monitoring advised</li>
                        <li>Consider immediate intervention</li>
                      </ul>
                    </div>
                  )}
                  {riskInfo.level === 'Moderate' && (
                    <div>
                      <div style={{ fontWeight: '600', color: '#ea580c', marginBottom: '0.5rem' }}>Urgent Actions:</div>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                        <li>Schedule follow-up within 24-48 hours</li>
                        <li>Close monitoring recommended</li>
                        <li>Consider specialist consultation</li>
                      </ul>
                    </div>
                  )}
                  {riskInfo.level === 'Elevated' && (
                    <div>
                      <div style={{ fontWeight: '600', color: '#d97706', marginBottom: '0.5rem' }}>Monitoring Actions:</div>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                        <li>Regular follow-up within 1 week</li>
                        <li>Monitor symptoms closely</li>
                        <li>Consider lifestyle modifications</li>
                      </ul>
                    </div>
                  )}
                  {riskInfo.level === 'Low' && (
                    <div>
                      <div style={{ fontWeight: '600', color: '#059669', marginBottom: '0.5rem' }}>Routine Actions:</div>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                        <li>Continue routine monitoring</li>
                        <li>Maintain healthy lifestyle</li>
                        <li>Regular check-ups as scheduled</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Risk Factor Analysis */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              border: `1px solid ${colors.neutral[200]}`,
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '700', 
                color: colors.neutral[800],
                margin: '0 0 1.5rem 0'
              }}>
                AI-Detected Risk Factors
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: colors.primary[50],
                  borderRadius: '8px',
                  border: `1px solid ${colors.primary[200]}`
                }}>
                  <div style={{
                    ...styles.iconWrapper,
                    background: colors.primary[100],
                    borderRadius: '50%',
                    padding: '0.5rem',
                    color: colors.primary[600]
                  }}>
                    <Heart size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: colors.neutral[800], fontSize: '0.9rem' }}>
                      Biomarker Analysis
                    </div>
                    <div style={{ fontSize: '0.8rem', color: colors.neutral[600] }}>
                      Cardiac markers indicate risk profile
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: colors.secondary[50],
                  borderRadius: '8px',
                  border: `1px solid ${colors.secondary[200]}`
                }}>
                  <div style={{
                    ...styles.iconWrapper,
                    background: colors.secondary[100],
                    borderRadius: '50%',
                    padding: '0.5rem',
                    color: colors.secondary[600]
                  }}>
                    <Activity size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: colors.neutral[800], fontSize: '0.9rem' }}>
                      Pattern Recognition
                    </div>
                    <div style={{ fontSize: '0.8rem', color: colors.neutral[600] }}>
                      AI detected characteristic patterns
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: riskInfo.bg,
                  borderRadius: '8px',
                  border: `1px solid ${riskInfo.color}30`
                }}>
                  <div style={{
                    ...styles.iconWrapper,
                    background: riskInfo.color + '20',
                    borderRadius: '50%',
                    padding: '0.5rem',
                    color: riskInfo.color
                  }}>
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: colors.neutral[800], fontSize: '0.9rem' }}>
                      Predictive Accuracy
                    </div>
                    <div style={{ fontSize: '0.8rem', color: colors.neutral[600] }}>
                      {(animatedConfidence * 100).toFixed(0)}% confidence level
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem',
          padding: '2rem'
        }}>
          <button onClick={onBack} style={styles.button}>
            <ArrowLeft size={18} />
            Perform New Analysis
          </button>
          <p style={{ 
            color: colors.neutral[500], 
            marginTop: '1.5rem',
            fontSize: '0.9rem',
            lineHeight: '1.6'
          }}>
            This assessment is generated by AI and should be reviewed by a qualified healthcare professional.
          </p>
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
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
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
        
        .result-card {
          animation: slideInUp 0.6s ease-out;
        }
        
        .risk-card {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}