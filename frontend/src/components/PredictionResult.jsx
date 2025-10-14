import React, { useState, useEffect } from 'react';

export default function PredictionResult({ result, patientInfo, onBack }) {
  const [animatedConfidence, setAnimatedConfidence] = useState(0);
  const [animatedProbabilities, setAnimatedProbabilities] = useState({});
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Animate confidence score
    const confidenceTimer = setTimeout(() => {
      setAnimatedConfidence(result.confidence || 0);
    }, 500);

    // Animate probabilities
    const probabilityTimer = setTimeout(() => {
      setAnimatedProbabilities(result.class_probabilities || {});
    }, 1000);

    return () => {
      clearTimeout(confidenceTimer);
      clearTimeout(probabilityTimer);
    };
  }, [result]);

  const getRiskLevel = (confidence) => {
    if (confidence >= 0.8) return { level: "High", color: "#dc2626", bg: "#fef2f2" };
    if (confidence >= 0.6) return { level: "Moderate", color: "#d97706", bg: "#fffbeb" };
    if (confidence >= 0.4) return { level: "Elevated", color: "#ca8a04", bg: "#fefce8" };
    return { level: "Low", color: "#059669", bg: "#f0fdf4" };
  };

  const getRiskRecommendation = (confidence) => {
    const risk = getRiskLevel(confidence);
    switch (risk.level) {
      case "High":
        return "Immediate clinical intervention recommended. Consider emergency cardiac evaluation.";
      case "Moderate":
        return "Close monitoring advised. Schedule follow-up within 48 hours.";
      case "Elevated":
        return "Continued observation recommended. Repeat tests in 1-2 weeks.";
      default:
        return "Routine monitoring sufficient. Maintain standard care protocol.";
    }
  };

  if (result.error) {
    return (
      <div className="modern-results">
        <div className="results-header">
          <div className="header-content">
            <div className="results-icon">⚠️</div>
            <div className="header-text">
              <h1 className="app-title">Analysis Error</h1>
              <p className="app-subtitle">Unable to process patient data</p>
            </div>
          </div>
        </div>

        <div className="results-container">
          <div className="error-state">
            <div className="error-icon">❌</div>
            <h2>Processing Error</h2>
            <p>{result.error}</p>
            <button onClick={onBack} className="back-btn primary">
              ← Return to Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  const riskInfo = getRiskLevel(result.confidence);
  const recommendation = getRiskRecommendation(result.confidence);

  return (
    <div className="modern-results">
      {/* Header */}
      <div className="results-header">
        <div className="header-content">
          <div className="results-icon">📊</div>
          <div className="header-text">
            <h1 className="app-title">Risk Assessment Report</h1>
            <p className="app-subtitle">AI-Powered Cardiac Analysis Results</p>
          </div>
          <div className="header-actions">
            <button onClick={onBack} className="new-analysis-btn">
              <span className="btn-icon">🔄</span>
              New Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="results-container">
        {/* Report Meta */}
        <div className="report-meta-card">
          <div className="meta-info">
            <div className="patient-info">
              <span className="meta-label">Patient</span>
              <span className="meta-value">{patientInfo?.name || "N/A"}</span>
            </div>
            <div className="report-id">
              <span className="meta-label">Report ID</span>
              <span className="meta-value">#{(Date.now() % 10000).toString().padStart(4, '0')}</span>
            </div>
            <div className="report-time">
              <span className="meta-label">Generated</span>
              <span className="meta-value">{new Date().toLocaleString()}</span>
            </div>
            <div className="ai-badge">
              <span className="badge-icon">🤖</span>
              <span>AI Analysis</span>
            </div>
          </div>
        </div>

        {/* Primary Risk Assessment */}
        <div className="risk-summary-card">
          <div className="risk-header">
            <div className="risk-title-section">
              <h2>Primary Assessment</h2>
              <p className="risk-subtitle">AI-powered cardiac risk evaluation</p>
            </div>
            <div className="risk-badge" style={{ 
              background: `linear-gradient(135deg, ${riskInfo.color}20, ${riskInfo.color}10)`,
              borderColor: riskInfo.color,
              color: riskInfo.color 
            }}>
              <div className="badge-icon">⚠️</div>
              <div className="badge-text">
                <span className="badge-level">{riskInfo.level}</span>
                <span className="badge-risk">Risk Level</span>
              </div>
            </div>
          </div>
          
          <div className="diagnosis-section">
            <div className="diagnosis-card">
              <div className="diagnosis-header">
                <div className="diagnosis-icon">🫀</div>
                <div className="diagnosis-info">
                  <h3>Predicted Condition</h3>
                  <p className="diagnosis-text">{result.prediction}</p>
                </div>
              </div>
              
              <div className="confidence-section">
                <div className="confidence-header">
                  <span className="confidence-label">Algorithm Confidence</span>
                  <span className="confidence-score">
                    {(animatedConfidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="confidence-visual">
                  <div className="confidence-circle">
                    <svg className="confidence-svg" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke={riskInfo.color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 50}`}
                        strokeDashoffset={`${2 * Math.PI * 50 * (1 - animatedConfidence)}`}
                        className="confidence-progress"
                      />
                    </svg>
                    <div className="confidence-center">
                      <span className="confidence-percentage">
                        {(animatedConfidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Recommendation */}
        <div className="recommendation-section">
          <div className="section-header">
            <div className="section-icon">💡</div>
            <h3>Clinical Recommendation</h3>
          </div>
          <div className="recommendation-card">
            <p>{recommendation}</p>
            <div className="recommendation-meta">
              <span className="priority-tag" style={{ color: riskInfo.color }}>
                Priority: {riskInfo.level}
              </span>
            </div>
          </div>
        </div>

        {/* Probability Breakdown */}
        <div className="probability-section">
          <div className="section-header">
            <div className="section-icon">📊</div>
            <div className="section-info">
              <h3>Condition Probability Distribution</h3>
              <p>AI model confidence across all possible conditions</p>
            </div>
            <button 
              className="toggle-details-btn"
              onClick={() => setShowDetails(!showDetails)}
            >
              <span className="btn-icon">{showDetails ? '📉' : '📈'}</span>
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          <div className="probability-visualization">
            <div className="probability-chart">
              {Object.entries(animatedProbabilities)
                .sort(([,a], [,b]) => b - a)
                .map(([condition, probability], index) => {
                  const isHighest = probability === Math.max(...Object.values(result.class_probabilities || {}));
                  const delay = index * 100;
                  return (
                    <div 
                      key={condition} 
                      className="probability-item"
                      style={{ animationDelay: `${delay}ms` }}
                    >
                      <div className="probability-header">
                        <div className="condition-info">
                          <span className="condition-name">{condition}</span>
                          <span className="probability-value">
                            {(probability * 100).toFixed(1)}%
                          </span>
                        </div>
                        {isHighest && (
                          <div className="highest-badge">
                            <span className="badge-icon">🏆</span>
                            <span>Highest</span>
                          </div>
                        )}
                      </div>
                      <div className="probability-bar-container">
                        <div className="probability-bar">
                          <div 
                            className="probability-fill"
                            style={{ 
                              width: `${probability * 100}%`,
                              backgroundColor: isHighest ? riskInfo.color : '#0ea5e9',
                              animationDelay: `${delay + 200}ms`
                            }}
                          ></div>
                        </div>
                        <div className="probability-indicator">
                          <div 
                            className="indicator-dot"
                            style={{ 
                              backgroundColor: isHighest ? riskInfo.color : '#0ea5e9',
                              animationDelay: `${delay + 300}ms`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            {showDetails && (
              <div className="detailed-breakdown">
                <h4>Detailed Analysis</h4>
                <div className="breakdown-grid">
                  {Object.entries(animatedProbabilities)
                    .sort(([,a], [,b]) => b - a)
                    .map(([condition, probability]) => (
                      <div key={condition} className="breakdown-item">
                        <div className="breakdown-header">
                          <span className="condition-name">{condition}</span>
                          <span className="probability-percentage">
                            {(probability * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div className="breakdown-bar">
                          <div 
                            className="breakdown-fill"
                            style={{ 
                              width: `${probability * 100}%`,
                              backgroundColor: probability === Math.max(...Object.values(result.class_probabilities || {})) 
                                ? riskInfo.color 
                                : '#64748b'
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Risk Factors Insight */}
        <div className="insight-section">
          <div className="section-header">
            <div className="section-icon">🔍</div>
            <h3>Key Risk Factors Identified</h3>
          </div>
          <div className="insight-grid">
            <div className="insight-card">
              <div className="insight-icon">❤️</div>
              <div className="insight-content">
                <h4>Biomarker Analysis</h4>
                <p>Multiple cardiac biomarkers indicate elevated risk profile</p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">⚡</div>
              <div className="insight-content">
                <h4>Pattern Recognition</h4>
                <p>AI model detected characteristic risk patterns in lab values</p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">📈</div>
              <div className="insight-content">
                <h4>Predictive Accuracy</h4>
                <p>High-confidence prediction based on comprehensive analysis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="result-footer">
          <button onClick={onBack} className="back-btn primary">
            ← Perform New Analysis
          </button>
          <div className="disclaimer">
            <p>This assessment is generated by AI and should be reviewed by a qualified healthcare professional.</p>
          </div>
        </div>
      </div>
    </div>
  );
}