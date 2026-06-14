from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from inference import predict_anomaly

app = FastAPI(title="EWS Tambang API", description="API untuk Early Warning System Prediksi Anomali Tambang")

# Setup CORS agar frontend bisa memanggil API dengan aman dari port yang berbeda
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Definisi struktur input JSON dari UI Frontend
class SensorData(BaseModel):
    data: dict

@app.post("/api/predict")
def predict(payload: SensorData):
    # Memproses payload JSON menuju script logika inference ML
    result = predict_anomaly(payload.data)
    return result

if __name__ == "__main__":
    print("Menghidupkan Server EWS Tambang API...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
