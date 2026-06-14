import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

def main():
    print("1. Memuat dataset...")
    df = pd.read_csv('../Mining.csv')
    
    numeric_cols = [col for col in df.columns if col != 'date']
    
    print("2. Memperbaiki format Eropa secara paksa...")
    for col in numeric_cols:
        # Paksa konversi ke string, hilangkan titik ribuan, ubah koma desimal, lalu ubah ke float
        df[col] = df[col].astype(str).str.replace('.', '', regex=False)
        df[col] = df[col].str.replace(',', '.', regex=False)
        df[col] = pd.to_numeric(df[col], errors='coerce')
            
    print("3. Mengubah nilai 0 menjadi NaN pada sensor...")
    sensor_cols = [c for c in numeric_cols if 'Flow' in c or 'Level' in c or 'Density' in c]
    for col in sensor_cols:
        df[col] = df[col].replace(0, np.nan)
        
    print("4. Membuang kolom tidak relevan...")
    cols_to_drop = ['date', '% Iron Feed', '% Silica Feed', '% Iron Concentrate', 'Ore Pulp pH']
    df = df.drop(columns=[c for c in cols_to_drop if c in df.columns])
    
    print("5. Melakukan interpolasi linear...")
    # Paksa semua kolom menjadi float agar pandas tidak melempar error str dtype
    df = df.astype(float)
    df = df.interpolate(method='linear', limit_direction='both')
    
    print("6. Membentuk label anomali...")
    target_col = '% Silica Concentrate'
    threshold = 2.67
    df['Is_Anomaly'] = (df[target_col] > threshold).astype(int)
    
    X = df.drop(columns=[target_col, 'Is_Anomaly'])
    y = df['Is_Anomaly']
    
    print("7. Membagi data dan melakukan penskalaan...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    
    print("8. Melatih model Random Forest...")
    model = RandomForestClassifier(class_weight='balanced', random_state=42, n_jobs=-1, max_depth=15)
    model.fit(X_train_scaled, y_train)
    
    print("9. Menyimpan model dan scaler ke disk...")
    joblib.dump(scaler, 'scaler.pkl')
    joblib.dump(model, 'model.pkl')
    
    # Menyimpan daftar fitur (nama kolom) untuk memastikan input inference nanti urutannya sesuai
    joblib.dump(list(X.columns), 'feature_names.pkl')
    
    print("Selesai! model.pkl dan scaler.pkl berhasil dibuat di folder backend.")

if __name__ == "__main__":
    main()
