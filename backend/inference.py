import joblib
import pandas as pd
import numpy as np
import os

# Load artifacts saat script diimport
DIR = os.path.dirname(__file__)
model = joblib.load(os.path.join(DIR, 'model.pkl'))
scaler = joblib.load(os.path.join(DIR, 'scaler.pkl'))
feature_names = joblib.load(os.path.join(DIR, 'feature_names.pkl'))

# Threshold tuning yang disepakati (lebih waspada/paranoid)
CUSTOM_THRESHOLD = 0.35

def preprocess_input(data_dict: dict) -> pd.DataFrame:
    """
    Mengubah raw JSON dict menjadi DataFrame yang siap diprediksi.
    """
    df = pd.DataFrame([data_dict])
    
    # Pastikan urutan kolom sama persis dengan saat training
    for col in feature_names:
        if col not in df.columns:
            df[col] = np.nan
            
    df = df[feature_names]
    
    # Jika input dari sensor 0, ganti NaN (sesuai tahap preprocessing awal)
    sensor_cols = [c for c in feature_names if 'Flow' in c or 'Level' in c or 'Density' in c]
    for col in sensor_cols:
        df[col] = df[col].replace(0, np.nan)
        
    # Karena API menerima data per 1 baris, interpolasi berurutan tidak bisa dilakukan.
    # Kita menggunakan fillna(0) sebagai fallback aman jika ada sensor kosong.
    df = df.fillna(0) 
    
    # Penskalaan (Scaling)
    df_scaled = scaler.transform(df)
    return df_scaled

def predict_anomaly(data_dict: dict) -> dict:
    df_scaled = preprocess_input(data_dict)
    
    # Ambil probabilitas untuk kelas 1 (Anomali)
    prob_anomaly = model.predict_proba(df_scaled)[0, 1]
    
    # Terapkan batas sensitivitas (Threshold)
    is_anomaly = bool(prob_anomaly >= CUSTOM_THRESHOLD)
    
    # Temukan variabel yang paling anomali (Z-score absolut tertinggi)
    abs_scaled = np.abs(df_scaled[0])
    max_idx = np.argmax(abs_scaled)
    most_anomalous_feature = feature_names[max_idx]
    feature_z_score = float(df_scaled[0][max_idx])

    # Buat saran mitigasi rule-based sederhana
    mitigation = "Periksa sensor dan sesuaikan dengan standar operasional."
    if "Air Flow" in most_anomalous_feature:
        if feature_z_score > 0:
            mitigation = f"Udara pada {most_anomalous_feature} terlalu tinggi. Kurangi putaran blower untuk mencegah turbulensi buih."
        else:
            mitigation = f"Udara pada {most_anomalous_feature} terlalu rendah. Tambah putaran blower agar gelembung bisa mengangkat silika."
    elif "Level" in most_anomalous_feature:
        if feature_z_score > 0:
            mitigation = f"Level pada {most_anomalous_feature} terlalu tinggi. Buka perlahan katup tailing untuk membuang air dan menurunkan level."
        else:
            mitigation = f"Level pada {most_anomalous_feature} terlalu dangkal. Tutup sedikit katup tailing agar buih bisa meluap ke bibir tangki."
    elif "Amina" in most_anomalous_feature:
        if feature_z_score > 0:
            mitigation = "Dosis reagen Amina berlebihan. Segera turunkan stroke pompa dosing agar besi tidak ikut terbuang."
        else:
            mitigation = "Kekurangan reagen Amina. Tingkatkan dosis agar impuritas silika bisa diikat secara optimal menjadi buih."
    elif "Starch" in most_anomalous_feature:
        if feature_z_score > 0:
            mitigation = "Dosis Kanji (Starch) terlalu tinggi. Pemborosan reagen, kurangi aliran secukupnya."
        else:
            mitigation = "Kekurangan Kanji (Starch). Tambah dosis kanji untuk memberatkan bijih besi agar mau tenggelam ke bawah."
    elif "Pulp" in most_anomalous_feature:
        mitigation = "Pasokan lumpur bijih (Ore Pulp) dari sirkuit penggilingan tidak standar. Berkoordinasi dengan operator Milling untuk menstabilkan aliran."
    
    return {
        "is_anomaly": is_anomaly,
        "anomaly_probability": float(prob_anomaly),
        "threshold": CUSTOM_THRESHOLD,
        "most_anomalous_feature": most_anomalous_feature,
        "feature_z_score": feature_z_score,
        "mitigation": mitigation
    }
