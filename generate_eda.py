import json

notebook = {
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# Exploratory Data Analysis (EDA) - Kualitas Hasil Tambang\n",
    "Notebook ini bertujuan untuk melakukan eksplorasi data awal pada `Mining.csv`. \n",
    "Langkah-langkah yang akan dilakukan:\n",
    "1. Memuat dataset dan menangani format desimal Eropa (koma menjadi titik).\n",
    "2. Mengecek tipe data dan *missing values*.\n",
    "3. Menganalisis distribusi target `% Silica Concentrate` untuk menentukan *threshold* anomali (P75).\n",
    "4. Menganalisis fitur `Ore Pulp pH` yang dicurigai rusak.\n",
    "5. Menganalisis korelasi antar fitur."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "import pandas as pd\n",
    "import numpy as np\n",
    "import matplotlib.pyplot as plt\n",
    "import seaborn as sns\n",
    "\n",
    "# Setting gaya visualisasi\n",
    "sns.set_theme(style=\"whitegrid\")\n",
    "plt.rcParams[\"figure.figsize\"] = (10, 6)"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 1. Memuat Dataset"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Dataset menggunakan format desimal koma (,)\n",
    "# Kita baca dengan parameter decimal=',' agar langsung menjadi float\n",
    "df = pd.read_csv('Mining.csv', decimal=',')\n",
    "df.head()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 2. Inspeksi Data Dasar"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Mengecek tipe data dan jumlah missing values\n",
    "df.info()"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Persentase missing values tiap kolom\n",
    "missing_pct = df.isnull().mean() * 100\n",
    "missing_pct[missing_pct > 0].sort_values(ascending=False)"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 3. Analisis Distribusi Target (% Silica Concentrate)\n",
    "Kita akan melihat distribusi dari target kita dan menentukan nilai Persentil 75 (P75) yang akan dijadikan ambang batas (threshold) untuk label Anomali."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "target_col = '% Silica Concentrate'\n",
    "\n",
    "# Membuang missing values pada target untuk visualisasi\n",
    "target_data = df[target_col].dropna()\n",
    "\n",
    "p75 = np.percentile(target_data, 75)\n",
    "print(f\"Nilai Persentil 75 (P75) untuk % Silica Concentrate: {p75:.2f}%\")\n",
    "\n",
    "plt.figure(figsize=(12, 6))\n",
    "sns.histplot(target_data, bins=100, kde=True, color='skyblue')\n",
    "plt.axvline(p75, color='red', linestyle='--', label=f'Threshold Anomali (P75 = {p75:.2f}%)')\n",
    "plt.title('Distribusi % Silica Concentrate')\n",
    "plt.xlabel('% Silica Concentrate')\n",
    "plt.ylabel('Frekuensi')\n",
    "plt.legend()\n",
    "plt.show()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 4. Analisis Fitur Rusak (Ore Pulp pH)\n",
    "Menurut diskusi sebelumnya, `Ore Pulp pH` memiliki nilai yang tidak masuk akal (rentang pH normal 0-14)."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "ph_col = 'Ore Pulp pH'\n",
    "\n",
    "if ph_col in df.columns:\n",
    "    invalid_ph = df[(df[ph_col] < 0) | (df[ph_col] > 14)][ph_col]\n",
    "    invalid_pct = (len(invalid_ph) / len(df[ph_col].dropna())) * 100\n",
    "    \n",
    "    print(f\"Persentase nilai {ph_col} di luar rentang valid (0-14): {invalid_pct:.2f}%\")\n",
    "    print(\"Contoh nilai tidak valid:\")\n",
    "    print(invalid_ph.head())\n",
    "    \n",
    "    plt.figure(figsize=(10, 5))\n",
    "    sns.boxplot(x=df[ph_col])\n",
    "    plt.title('Distribusi Ore Pulp pH (Menunjukkan adanya outlier ekstrem)')\n",
    "    plt.show()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 5. Korelasi Antar Fitur Operasional dan Target\n",
    "Kita akan membuang fitur-fitur yang menyebabkan data leakage sebelum melihat korelasi."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Eliminasi kolom yang tidak dipakai/leakage\n",
    "cols_to_drop = ['date', '% Iron Feed', '% Silica Feed', '% Iron Concentrate', 'Ore Pulp pH']\n",
    "df_clean = df.drop(columns=[c for c in cols_to_drop if c in df.columns])\n",
    "\n",
    "# Menghitung korelasi\n",
    "corr = df_clean.corr()\n",
    "\n",
    "# Fokus korelasi terhadap target\n",
    "target_corr = corr[target_col].sort_values(ascending=False)\n",
    "\n",
    "plt.figure(figsize=(8, 8))\n",
    "sns.barplot(x=target_corr.values, y=target_corr.index, palette='coolwarm')\n",
    "plt.title('Korelasi Fitur Operasional terhadap % Silica Concentrate')\n",
    "plt.xlabel('Nilai Korelasi (Pearson)')\n",
    "plt.ylabel('Fitur')\n",
    "plt.show()"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "codemirror_mode": {
    "name": "ipython",
    "version": 3
   },
   "file_extension": ".py",
   "mimetype": "text/x-python",
   "name": "python",
   "nbconvert_exporter": "python",
   "pygments_lexer": "ipython3",
   "version": "3.9.0"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 4
}

with open('d:/CODE/Rekomendasi Sistem/Projek/EDA.ipynb', 'w', encoding='utf-8') as f:
    json.dump(notebook, f, indent=1, ensure_ascii=False)
