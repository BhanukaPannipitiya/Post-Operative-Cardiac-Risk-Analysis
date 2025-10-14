# CardioRisk AI - Cardiac Risk Assessment Platform

A comprehensive AI-powered platform for predicting post-operative cardiac complications using multimodal data analysis. The system combines laboratory values, clinical text notes, and BioBERT embeddings to predict three cardiac conditions: Arrhythmia, Heart Failure (HF), and Myocardial Infarction (MI).

## 🏗️ Architecture Overview

The platform follows a modern full-stack architecture with clear separation of concerns:

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐    ML Pipeline    ┌─────────────────┐
│   React Frontend │ ◄─────────────► │  FastAPI Backend │ ◄────────────────► │   ML Models     │
│                 │                 │                 │                   │                 │
│ • PredictionForm│                 │ • /predict      │                   │ • XGBoost       │
│ • Results       │                 │ • Preprocessing │                   │ • BioBERT      │
│ • Multi-step UI │                 │ • Feature Eng.  │                   │ • Text SVD     │
└─────────────────┘                 └─────────────────┘                   └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r app/requirements.txt
cd app
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## 📊 Data Processing Pipeline

### 1. Input Data Structure

The system processes three types of multimodal data:

#### Laboratory Values (10 features)
```python
lab_cols = [
    "Anion Gap", "Bicarbonate", "Calcium, Total", "Creatine Kinase (CK)",
    "Creatine Kinase, MB Isoenzyme", "INR(PT)", "PT", "Potassium", 
    "Sodium", "Troponin T"
]
```

#### Text Features (50 dimensions)
- Clinical notes processed through TF-IDF and SVD dimensionality reduction
- Includes chief complaint, HPI, ECG reports, and other clinical text
- Masked to prevent data leakage (diagnosis terms replaced with [MASK])

#### BioBERT Features (189 dimensions)
- Clinical text processed through BioClinicalBERT embeddings
- PCA reduction applied for dimensionality optimization
- Leakage-protected text preprocessing

### 2. Feature Engineering Process

```python
# backend/utils/preprocessing.py
def prepare_features(input_data, scaler_labs, scaler_text, scaler_bio):
    """
    Converts incoming JSON into model-ready input (numpy array).
    Applies the correct scaling for each modality.
    """
    
    # Lab features
    labs_df = pd.DataFrame([input_data.labs])
    
    # Text features (SVD reduced)
    text_vec = np.array(input_data.text_svd).reshape(1, -1)
    
    # BioBERT features (PCA reduced)
    bio_vec = np.array(input_data.biobert_pca).reshape(1, -1)
    
    # Apply modality-specific scaling
    labs_scaled = scaler_labs.transform(labs_df) if scaler_labs else labs_df.values
    text_scaled = scaler_text.transform(text_vec)
    bio_scaled = scaler_bio.transform(bio_vec)
    
    # Combine all modalities
    X = np.concatenate([labs_scaled, text_scaled, bio_scaled], axis=1)
    return X
```

### 3. Data Leakage Prevention

The system implements comprehensive leakage prevention:

```python
# Diagnosis terms masked in text processing
DIAGNOSIS_TERMS = [
    "myocardial infarction", "infarction", "heart failure", "arrhythmia",
    "atrial fibrillation", "ventricular tachycardia", "cardiac arrest",
    "ischemia", "st elevation", "non-stemi", "nste", "stemi", "mi",
    "hf", "afib", "tachy", "fibrillation", "chf"
]

def clean_and_mask_text(s):
    s = str(s).lower()
    # Mask diagnosis phrases first
    for term in DIAGNOSIS_TERMS:
        s = re.sub(rf"\b{re.escape(term)}\b", " [MASK] ", s, flags=re.IGNORECASE)
    return s
```

## 🤖 Machine Learning Model

### Model Architecture
- **Algorithm**: XGBoost Classifier
- **Objective**: Multi-class classification (3 classes)
- **Classes**: Arrhythmia, Heart Failure (HF), Myocardial Infarction (MI)
- **Training**: 5-fold cross-validation with SMOTE oversampling

### Model Configuration
```python
XGB_PARAMS = {
    "objective": "multi:softprob",
    "num_class": 3,
    "n_estimators": 300,
    "learning_rate": 0.05,
    "max_depth": 7,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "eval_metric": "mlogloss",
    "n_jobs": -1,
    "random_state": 42
}
```

### Training Process
1. **Data Split**: Stratified 5-fold cross-validation
2. **Feature Scaling**: Modality-specific StandardScaler
3. **Class Balancing**: SMOTE oversampling for imbalanced classes
4. **Model Training**: XGBoost with hyperparameter optimization
5. **Evaluation**: Accuracy, F1-score, ROC-AUC metrics

## 🌐 Backend API (FastAPI)

### Core Components

#### Application Initialization
```python
# backend/app/app.py
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np

app = FastAPI(
    title="Cardiac AI API",
    description="AI service for predicting post-operative cardiac complications",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Model Loading
```python
# Load pre-trained models and scalers
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "../models")

model = joblib.load(os.path.join(MODEL_DIR, "xgb_final_full_model.joblib"))
label_encoder = joblib.load(os.path.join(MODEL_DIR, "label_encoder.joblib"))
scaler_text = joblib.load(os.path.join(MODEL_DIR, "scaler_text.joblib"))
scaler_bio = joblib.load(os.path.join(MODEL_DIR, "scaler_biobert.joblib"))
```

#### API Endpoints

**Health Check**
```python
@app.get("/")
def root():
    return {"status": "ok", "message": "Cardiac AI API is running 🚀"}
```

**Prediction Endpoint**
```python
@app.post("/predict")
def predict(input_data: PatientInput):
    try:
        X = prepare_features(input_data, scaler_labs, scaler_text, scaler_bio)
        proba = model.predict_proba(X)[0]
        pred_idx = np.argmax(proba)
        prediction = classes[pred_idx]
        return {
            "prediction": prediction,
            "confidence": float(np.max(proba)),
            "class_probabilities": dict(zip(classes, [float(p) for p in proba]))
        }
    except Exception as e:
        return {"error": str(e)}
```

#### Input Schema
```python
class PatientInput(BaseModel):
    labs: dict                    # Laboratory values + missing flags
    text_svd: list               # 50-dimensional text features
    biobert_pca: list            # 189-dimensional BioBERT features
```

## 🎨 Frontend (React)

### Component Architecture

#### Main Application Flow
```javascript
// src/App.js
function App() {
  const [currentView, setCurrentView] = useState('form');
  const [results, setResults] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);

  const handleFormSubmit = (resultData, patientData) => {
    setResults(resultData);
    setPatientInfo(patientData);
    setCurrentView('results');
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
```

#### Multi-Step Form Component
The `PredictionForm` component implements a 4-step wizard:

1. **Patient Information**: Basic demographics
2. **Laboratory Values**: 10 cardiac biomarkers
3. **Data Availability**: Missing data flags
4. **Review & Submit**: Final validation

```javascript
// src/components/PredictionForm.jsx
const steps = [
  { id: 1, title: "Basic Info", icon: "👤", description: "Patient Overview" },
  { id: 2, title: "Lab Values", icon: "🧪", description: "Laboratory Results" },
  { id: 3, title: "Data Status", icon: "📊", description: "Availability Check" },
  { id: 4, title: "Review", icon: "✅", description: "Final Review" }
];
```

#### API Integration
```javascript
// src/api/api.js
const API_URL = "http://localhost:8000/predict";

export const getPrediction = async (payload) => {
  try {
    const response = await axios.post(API_URL, payload);
    return response.data;
  } catch (error) {
    console.error("Prediction Error:", error);
    throw error;
  }
};
```

#### Results Visualization
The `PredictionResult` component provides:
- Risk level assessment (High/Moderate/Elevated/Low)
- Confidence visualization with animated progress circles
- Probability distribution across all conditions
- Clinical recommendations based on risk level
- Interactive detailed breakdown

```javascript
// Risk level determination
const getRiskLevel = (confidence) => {
  if (confidence >= 0.8) return { level: "High", color: "#dc2626", bg: "#fef2f2" };
  if (confidence >= 0.6) return { level: "Moderate", color: "#d97706", bg: "#fffbeb" };
  if (confidence >= 0.4) return { level: "Elevated", color: "#ca8a04", bg: "#fefce8" };
  return { level: "Low", color: "#059669", bg: "#f0fdf4" };
};
```

## 📁 Project Structure

```
Project/
├── backend/
│   ├── app/
│   │   ├── app.py                 # FastAPI application
│   │   └── requirements.txt       # Python dependencies
│   ├── data/                      # Raw datasets
│   ├── data_preprocessed/         # Processed features & models
│   │   ├── *.pkl                 # Preprocessing artifacts
│   │   ├── *.csv                 # Processed datasets
│   │   └── shap_outputs/         # Model explainability
│   ├── models/                   # Trained models
│   │   ├── xgb_final_full_model.joblib
│   │   ├── label_encoder.joblib
│   │   ├── scaler_text.joblib
│   │   └── scaler_biobert.joblib
│   ├── Notebooks/                # Jupyter analysis notebooks
│   └── utils/
│       └── preprocessing.py      # Feature preparation
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── PredictionForm.jsx
    │   │   └── PredictionResult.jsx
    │   ├── api/
    │   │   └── api.js            # API client
    │   └── App.js                # Main application
    └── package.json              # Node.js dependencies
```

## 🔬 Model Performance

The system achieves robust performance through:

- **Cross-validation**: 5-fold stratified CV ensures generalizability
- **Class balancing**: SMOTE oversampling handles class imbalance
- **Feature engineering**: Multimodal fusion of labs, text, and BioBERT
- **Leakage prevention**: Comprehensive masking of diagnostic terms
- **Explainability**: SHAP analysis for model interpretability

### Key Metrics
- **Accuracy**: Optimized through hyperparameter tuning
- **F1-Score**: Macro-averaged across all classes
- **ROC-AUC**: Multi-class one-vs-rest evaluation

## 🛡️ Security & Compliance

- **HIPAA Compliance**: Secure data processing protocols
- **Data Privacy**: No persistent storage of patient data
- **Input Validation**: Comprehensive error handling and validation
- **CORS Configuration**: Controlled cross-origin resource sharing

## 🚀 Deployment Considerations

### Production Setup
1. **Environment Variables**: Configure API URLs and model paths
2. **Model Serving**: Consider model versioning and A/B testing
3. **Monitoring**: Implement logging and performance metrics
4. **Scaling**: Use container orchestration (Docker/Kubernetes)
5. **Security**: Implement authentication and rate limiting

### Docker Deployment
```dockerfile
# Backend Dockerfile example
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📚 Dependencies

### Backend (Python)
```
fastapi>=0.111.0
uvicorn>=0.30.1
numpy>=2.1.1
pandas>=2.2.3
joblib>=1.4.2
scikit-learn>=1.5.1
xgboost>=2.1.1
```

### Frontend (Node.js)
```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "axios": "^1.12.2",
    "react-scripts": "5.0.1"
  }
}
```

## 🔧 Development

### Adding New Features
1. **Backend**: Extend API endpoints in `app.py`
2. **Frontend**: Add components in `src/components/`
3. **Models**: Update preprocessing pipeline in `utils/preprocessing.py`
4. **Testing**: Implement unit tests for new functionality

### Model Updates
1. Retrain models using notebooks in `backend/Notebooks/`
2. Update model artifacts in `backend/models/`
3. Test API endpoints with new models
4. Deploy updated models to production

## 📖 Usage Examples

### API Request Example
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "labs": {
      "Anion Gap": 16,
      "Bicarbonate": 25,
      "Calcium, Total": 9.4,
      "Creatine Kinase (CK)": 200,
      "Creatine Kinase, MB Isoenzyme": 6,
      "INR(PT)": 1.1,
      "PT": 11,
      "Potassium": 4.0,
      "Sodium": 137,
      "Troponin T": 0.01
    },
    "text_svd": [0.1, 0.2, ...],  # 50 dimensions
    "biobert_pca": [0.3, 0.4, ...]  # 189 dimensions
  }'
```

### API Response Example
```json
{
  "prediction": "Myocardial Infarction",
  "confidence": 0.85,
  "class_probabilities": {
    "Arrhythmia": 0.10,
    "Heart Failure": 0.05,
    "Myocardial Infarction": 0.85
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request
5. Ensure CI/CD pipeline passes

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Review the documentation in `backend/Notebooks/`

---

**Disclaimer**: This AI system is for research and educational purposes. Clinical decisions should always be made by qualified healthcare professionals.
