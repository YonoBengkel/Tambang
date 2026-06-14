# Walkthrough: Sistem EWS Deteksi Anomali Tambang

Dokumen ini merangkum seluruh pencapaian teknis kita dalam membangun **Sistem Rekomendasi / Early Warning System (EWS)** untuk pabrik pengolahan bijih besi.

## 1. Exploratory Data Analysis (EDA)
- **Visualisasi Anomali vs Normal**: Kita membedah distribusi data sensor menggunakan Violin Plots dan Heatmap.
- **Kesimpulan Fisis**: Kita menemukan bahwa sensor aliran reagen (Amina & Starch Flow) memiliki pengaruh besar terhadap lolosnya impuritas Silika. Kolom berpotensi rusak seperti `Ore Pulp pH` berhasil diidentifikasi untuk dibuang.
- **Batas Kritis (Threshold)**: Ditetapkan bahwa konsentrasi Silika > 2.67% (P75) adalah batas di mana pabrik dianggap memproduksi anomali.

## 2. Pembersihan & Pra-pemrosesan Data
- **Transformasi Format Eropa**: Membersihkan nilai string (yang menggunakan titik untuk ribuan dan koma untuk desimal) menjadi bentuk numerik standar.
- **Penanganan Null Mutlak**: Semua nilai `0` pada sensor (yang secara fisis tidak mungkin) diubah menjadi `NaN`.
- **Imputasi Cerdas**: Semua kekosongan data ditambal secara dinamis menggunakan **Interpolasi Linear** sesuai sifat natural sensor berurutan, menghindari manipulasi kasar seperti *mean imputation*.

## 3. Pelatihan Mesin Pemburu Anomali (Cost-Sensitive Learning)
Kita mengadu dua algoritma berbasis Ensemble Learning (Pohon Keputusan Gabungan). Keduanya dipaksa untuk lebih memprioritaskan tangkapan Anomali menggunakan pembobotan kelas `class_weight='balanced'`.

> [!NOTE] 
> Random Forest keluar sebagai pemenang dengan **Recall 84%** dan **Precision 74%**, jauh lebih seimbang dibandingkan HistGradientBoosting.

## 4. Strategi Optimasi Tingkat Lanjut

### A. Threshold Tuning (Penyesuaian Sensitivitas)
Daripada membiarkan model memutuskan dengan keyakinan bawaan (50%), batas keputusan diturunkan menjadi **35% (0.35)**.
> [!TIP]
> Trik ini secara instan mendongkrak tangkapan (Recall) di atas 90%. Walau alarm palsu (*False Alarm*) bertambah, namun kerugian produksi cacat berhasil dicegah!

### B. Hyperparameter Tuning (Optuna)
Untuk memeras potensi terakhir dari arsitektur Random Forest, algoritma evolusioner **Optuna** digunakan untuk mencari kombinasi kedalaman pohon (`max_depth`) dan jumlah estimator (`n_estimators`) terbaik.
> [!WARNING]
> Optuna sangat lambat pada data masif! Oleh karena itu, kita menjalankan Optuna pada 50.000 sampel acak saja agar teknisi tidak perlu menunggu berhari-hari. Parameter yang ditemukan bisa langsung dicolokkan ke model utama.

---
Dengan selesainya tahapan ini, mesin Anda siap mendeteksi anomali pabrik secara *real-time* maupun berdasar *batch* sebelum produk akhir masuk lab.
