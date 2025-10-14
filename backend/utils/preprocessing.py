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
    bio_dim = 189

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
    X = np.concatenate([labs_scaled, text_scaled, bio_scaled], axis=1)
    return X
