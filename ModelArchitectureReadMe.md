# Model Architecture & Training Documentation

## 🧠 Overview

This document provides a comprehensive technical overview of the CardioRisk AI machine learning model architecture, training pipeline, and implementation details. The system uses a multimodal approach combining laboratory values, clinical text notes, and BioBERT embeddings to predict three cardiac conditions: Arrhythmia, Heart Failure (HF), and Myocardial Infarction (MI).

## 🏗️ Model Architecture

### Core Algorithm
- **Primary Model**: XGBoost Classifier
- **Objective**: Multi-class classification (3 classes)
- **Classes**: Arrhythmia (0), Heart Failure (1), Myocardial Infarction (2)
- **Training Strategy**: 5-fold stratified cross-validation with SMOTEENN balancing

### Model Configuration
```python
XGB_PARAMS = {
    "objective": "multi:softprob",
    "num_class": 3,
    "n_estimators": 500,
    "learning_rate": 0.07,
    "max_depth": 7,
    "subsample": 0.9,
    "colsample_bytree": 0.9,
    "eval_metric": "mlogloss",
    "n_jobs": -1,
    "random_state": 42
}
```

## 📊 Multimodal Feature Architecture

### 1. Laboratory Values (20 features)
**Raw Laboratory Features (10)**:
- Anion Gap, Bicarbonate, Calcium Total, Creatine Kinase (CK)
- Creatine Kinase MB Isoenzyme, INR(PT), PT, Potassium, Sodium, Troponin T

**Missing Data Indicators (10)**:
- Binary flags indicating missing values for each lab test
- Critical for handling incomplete clinical data

**Preprocessing**:
- Median imputation for missing values
- StandardScaler normalization
- Winsorization (1% tail clipping) for outlier handling

### 2. Text Features (50 dimensions)
**Source**: Clinical notes (chief complaint, HPI, ECG reports)

**Processing Pipeline**:
```python
# Text cleaning and masking
DIAGNOSIS_TERMS = [
    "myocardial infarction", "infarction", "heart failure", "arrhythmia",
    "atrial fibrillation", "ventricular tachycardia", "cardiac arrest",
    "ischemia", "st elevation", "non-stemi", "nste", "stemi", "mi",
    "hf", "afib", "tachy", "fibrillation", "chf"
]

def clean_and_mask_text(s):
    s = str(s).lower()
    for term in DIAGNOSIS_TERMS:
        s = re.sub(rf"\b{re.escape(term)}\b", " [MASK] ", s, flags=re.IGNORECASE)
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s
```

**Dimensionality Reduction**:
- TF-IDF vectorization (max_features=2000)
- TruncatedSVD reduction to 50 components
- StandardScaler normalization

### 3. BioBERT Features (189 dimensions)
**Source**: Clinical text processed through BioClinicalBERT

**Model**: `emilyalsentzer/Bio_ClinicalBERT`

**Processing Pipeline**:
```python
# BioBERT embedding generation
def get_biobert_embedding(text):
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=256,
        padding="max_length"
    ).to(device)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).squeeze().cpu().numpy()
```

**Dimensionality Reduction**:
- IncrementalPCA to 189 components (95% variance retention)
- StandardScaler normalization

### 4. Cross-Modality Interactions (160 features)
**Laboratory-BioBERT Interactions**:
- Multiplicative interactions between top 20 BioBERT components and 8 lab features
- Captures synergistic effects between clinical text and lab values

## 🔄 Training Pipeline

### Data Preparation
```python
# 1. Load and merge multimodal data
df = pd.read_csv("preprocessed_multimodal_biobert_interactions.csv")

# 2. Remove leakage-prone features
leakage_cols = ['ICD_I21', 'ICD_I47', 'ICD_I48', 'ICD_I49', 'ICD_I50']
df = df.drop(columns=leakage_cols, errors="ignore")

# 3. Separate features and target
X = df.drop(columns=["Diagnosis_Label"])
y = df["Diagnosis_Label"]
```

### Cross-Validation Strategy
```python
# 5-fold stratified cross-validation
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

for fold_idx, (train_idx, test_idx) in enumerate(skf.split(X, y), 1):
    X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]
    
    # Apply modality-specific scaling
    scaler_text = StandardScaler()
    scaler_bio = StandardScaler()
    
    if text_cols:
        scaler_text.fit(X_train[text_cols])
        X_train[text_cols] = scaler_text.transform(X_train[text_cols])
        X_test[text_cols] = scaler_text.transform(X_test[text_cols])
    
    if biobert_cols:
        scaler_bio.fit(X_train[biobert_cols])
        X_train[biobert_cols] = scaler_bio.transform(X_train[biobert_cols])
        X_test[biobert_cols] = scaler_bio.transform(X_test[biobert_cols])
```

### Class Balancing
```python
# SMOTEENN for advanced balancing
from imblearn.combine import SMOTEENN

smoteenn = SMOTEENN(random_state=42)
X_resampled, y_resampled = smoteenn.fit_resample(X_train, y_train)
```

### Model Training
```python
# XGBoost training with evaluation sets
model = XGBClassifier(**XGB_PARAMS)
eval_set = [(X_resampled, y_resampled), (X_test, y_test)]
model.fit(X_resampled, y_resampled, eval_set=eval_set, verbose=False)
```

## 📈 Performance Metrics

### Cross-Validation Results
| Modality | Accuracy | F1-Macro | ROC-AUC-Macro |
|----------|----------|----------|---------------|
| Labs Only | 0.79 | 0.70 | 0.90 |
| Text Only | 0.94 | 0.90 | 0.99 |
| BioBERT Only | 0.95 | 0.93 | 0.99 |
| **Full Model** | **0.96** | **0.94** | **0.99** |

### Hold-Out Test Results (20% unseen data)
- **Accuracy**: 0.9879
- **F1-Macro**: 0.9879
- **ROC-AUC-Macro**: 0.9994
- **Per-Class F1**:
  - Arrhythmia: 0.9928
  - Heart Failure: 0.9842
  - Myocardial Infarction: 0.9866

### Calibration Metrics
- **Expected Calibration Error (ECE)**: < 0.015 for all classes
- **Brier Score**: < 0.01 for all classes
- **Reliability**: Excellent probability calibration

## 🔍 Model Interpretability

### SHAP Analysis
The model uses SHAP (SHapley Additive exPlanations) for feature importance analysis:

```python
import shap

# Global SHAP importance
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# Per-class importance
for i, class_name in enumerate(classes):
    importance = np.abs(shap_values[i]).mean(axis=0)
    df_importance = pd.DataFrame({
        "Feature": X.columns,
        "MeanAbsSHAP": importance
    }).sort_values("MeanAbsSHAP", ascending=False)
```

### Top Contributing Features
1. **text_svd_2** (0.524) - Text component capturing cardiac terminology
2. **Troponin T** (0.362) - Critical cardiac biomarker
3. **text_svd_4** (0.311) - Additional text context
4. **Troponin T_missing** (0.309) - Missing data indicator
5. **Creatine Kinase, MB Isoenzyme** (0.294) - Cardiac enzyme

## 🛡️ Data Leakage Prevention

### Comprehensive Masking Strategy
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
    for term in DIAGNOSIS_TERMS:
        s = re.sub(rf"\b{re.escape(term)}\b", " [MASK] ", s, flags=re.IGNORECASE)
    return s
```

### Leakage Verification
- **ICD Code Removal**: All ICD diagnosis codes excluded from training
- **Mutual Information Analysis**: Features with MI > 0.2 flagged
- **Correlation Analysis**: Features with |correlation| > 0.95 with labels removed
- **Sanity Check**: Shuffled labels achieve ~33% accuracy (random baseline)

## 🔧 Production Implementation

### Model Loading
```python
# backend/app/app.py
import joblib
import numpy as np

# Load pre-trained models and scalers
model = joblib.load("models/xgb_final_full_model.joblib")
label_encoder = joblib.load("models/label_encoder.joblib")
scaler_text = joblib.load("models/scaler_text.joblib")
scaler_bio = joblib.load("models/scaler_biobert.joblib")
scaler_labs = joblib.load("models/scaler_labs.joblib")
```

### Feature Preparation
```python
# backend/utils/preprocessing.py
def prepare_features(input_data, scaler_labs, scaler_text, scaler_bio):
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

### API Endpoint
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

## 📊 Robustness Testing

### Stress Tests Performed
1. **Modality Ablation**: Performance drop when removing individual modalities
2. **Missing Data Simulation**: Graceful degradation with increasing missing lab values
3. **Noise Injection**: Robustness to Gaussian noise in text and BioBERT features
4. **Feature Permutation**: Performance collapse when breaking feature-label relationships
5. **Class Prior Shift**: Stability under different class distributions
6. **Sample Size Effects**: Performance with reduced training data

### Results Summary
- **Modality Importance**: BioBERT > Text > Labs
- **Missing Data Tolerance**: Maintains >90% accuracy with 50% missing lab values
- **Noise Robustness**: Stable performance up to σ=0.1 noise level
- **Calibration Stability**: ECE remains <0.02 under stress conditions

## 🔬 Advanced Features

### Cross-Modality Interactions
```python
# Laboratory-BioBERT interaction features
def make_interactions(X, labs, embeds, prefix):
    out = {}
    for l, e in product(labs, embeds):
        out[f"{prefix}_{l}__x__{e}"] = X[l] * X[e]
    return pd.DataFrame(out, index=X.index)

# Generate 160 interaction features
inter_df = make_interactions(df, lab_cols, bio_top, "lab_bio")
```

### Incremental PCA for BioBERT
```python
# Memory-efficient PCA for large embedding matrices
from sklearn.decomposition import IncrementalPCA

ipca = IncrementalPCA(n_components=190, batch_size=512)
biobert_reduced = ipca.fit_transform(embeddings_scaled)
```

### SMOTEENN Balancing
```python
# Advanced balancing combining SMOTE and Edited Nearest Neighbors
from imblearn.combine import SMOTEENN

smoteenn = SMOTEENN(random_state=42)
X_resampled, y_resampled = smoteenn.fit_resample(X, y)
```

## 📁 File Structure

```
backend/
├── models/
│   ├── xgb_final_full_model.joblib      # Trained XGBoost model
│   ├── label_encoder.joblib             # Label encoding
│   ├── scaler_text.joblib               # Text feature scaler
│   ├── scaler_biobert.joblib            # BioBERT feature scaler
│   └── scaler_labs.joblib               # Lab feature scaler
├── data_preprocessed/
│   ├── preprocessed_multimodal_biobert_interactions.csv
│   ├── shap_outputs/                    # SHAP analysis results
│   └── ablation_outputs/                # Cross-validation results
├── utils/
│   └── preprocessing.py                 # Feature preparation
└── Notebooks/
    ├── ModelTraining.ipynb              # Training pipeline
    ├── ModelEvaluation.ipynb            # Evaluation metrics
    ├── Preprocess.ipynb                 # Data preprocessing
    └── BioBertEnhancedDatasetAnalysis.ipynb
```

## 🚀 Deployment Considerations

### Model Artifacts
- **Model Size**: ~50MB (XGBoost + scalers)
- **Memory Usage**: ~200MB at inference
- **Inference Time**: <100ms per prediction
- **Scalability**: Horizontal scaling supported

### Monitoring
- **Performance Metrics**: Accuracy, F1-score, calibration error
- **Data Drift**: PSI monitoring for feature distributions
- **Model Drift**: Performance degradation detection
- **Fairness**: Subgroup performance monitoring

### Security
- **Input Validation**: Comprehensive error handling
- **Data Privacy**: No persistent storage of patient data
- **Model Security**: Encrypted model artifacts
- **API Security**: Rate limiting and authentication

## 📚 Dependencies

### Core ML Libraries
```
xgboost>=2.1.1
scikit-learn>=1.5.1
pandas>=2.2.3
numpy>=2.1.1
imbalanced-learn>=0.12.0
shap>=0.44.0
```

### Deep Learning
```
torch>=2.0.0
transformers>=4.30.0
```

### Text Processing
```
scikit-learn>=1.5.1  # TF-IDF, SVD
nltk>=3.8.1
```

## 🔄 Model Updates

### Retraining Pipeline
1. **Data Validation**: Verify new data quality and distribution
2. **Feature Engineering**: Apply same preprocessing pipeline
3. **Model Training**: Retrain with updated hyperparameters
4. **Validation**: Cross-validation and hold-out testing
5. **Deployment**: A/B testing and gradual rollout

### Version Control
- **Model Versioning**: Semantic versioning for model artifacts
- **Experiment Tracking**: MLflow or similar for experiment management
- **Code Versioning**: Git-based version control
- **Data Versioning**: DVC for data pipeline versioning

## 📖 References

1. Chen, T., & Guestrin, C. (2016). XGBoost: A Scalable Tree Boosting System
2. Lee, J., et al. (2020). BioClinicalBERT: A Domain-Specific Language Model for Clinical Text
3. Chawla, N. V., et al. (2002). SMOTE: Synthetic Minority Oversampling Technique
4. Lundberg, S. M., & Lee, S. I. (2017). A Unified Approach to Interpreting Model Predictions

---

**Note**: This model is designed for research and educational purposes. Clinical decisions should always be made by qualified healthcare professionals.
