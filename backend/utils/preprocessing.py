# backend/utils/preprocessing.py
import numpy as np
import pandas as pd

def prepare_features(input_data, scaler_labs, scaler_text, scaler_bio):
    """
    Converts incoming JSON into model-ready input (numpy array).
    Applies the correct scaling for each modality.
    """

    # feature configuration
    lab_cols = [
        "Anion Gap","Bicarbonate","Calcium, Total","Creatine Kinase (CK)",
        "Creatine Kinase, MB Isoenzyme","INR(PT)","PT","Potassium","Sodium","Troponin T"
    ]
    text_dim = 50
    bio_dim = 189  # Model expects 189 biobert features (0-188)

    # --- LAB FEATURES ---
    labs_df = pd.DataFrame([input_data.labs])

    # --- TEXT FEATURES ---
    text_vec = np.array(input_data.text_svd).reshape(1, -1)
    if text_vec.shape[1] != text_dim:
        raise ValueError(f"Expected {text_dim} text features, got {text_vec.shape[1]}")

    # --- BIOBERT FEATURES ---
    bio_vec = np.array(input_data.biobert_pca).reshape(1, -1)
    if bio_vec.shape[1] != bio_dim:
        raise ValueError(f"Expected {bio_dim} biobert features, got {bio_vec.shape[1]}")

    # --- APPLY SCALERS ---
    if scaler_labs:
        labs_scaled = scaler_labs.transform(labs_df)
    else:
        labs_scaled = labs_df.values  # use raw values if unscaled

    text_scaled = scaler_text.transform(text_vec)
    bio_scaled = scaler_bio.transform(bio_vec)

    # --- COMBINE ---
    # Order: labs (10) + text (50) + biobert (189) = 249
    # But model expects 259, so we need 10 more features
    # These are likely the missing value indicators
    missing_indicators = []
    for col in lab_cols:
        if col in input_data.labs:
            # 1 if value is missing/NaN, 0 if present
            missing_indicators.append(1 if pd.isna(input_data.labs[col]) or input_data.labs[col] == "" else 0)
        else:
            missing_indicators.append(1)  # Missing if not provided
    
    missing_array = np.array(missing_indicators).reshape(1, -1)
    
    # Combine: labs + missing indicators + text + biobert
    X = np.concatenate([labs_scaled, missing_array, text_scaled, bio_scaled], axis=1)
    
    return X
