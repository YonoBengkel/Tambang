FROM python:3.10-slim

# Menyiapkan direktori kerja di dalam kontainer Docker
WORKDIR /app

# Menyalin file daftar pustaka yang dibutuhkan
COPY requirements.txt .

# Menginstal semua pustaka Python tanpa menyimpan cache (menghemat memori)
RUN pip install --no-cache-dir -r requirements.txt

# Menyalin semua sisa file backend ke dalam kontainer
COPY . .

# Hugging Face Spaces Docker secara default membutuhkan port 7860
EXPOSE 7860

# Perintah untuk menjalankan server FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
