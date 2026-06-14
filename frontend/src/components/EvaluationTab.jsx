import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, RefreshCcw, Cpu, ShieldAlert, Activity } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/predict";

export default function EvaluationTab() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Nilai default untuk mempermudah testing
  const [formData, setFormData] = useState({
    "Amina Flow": 12.5,
    "Starch Flow": 25.1,
    "Ore Pulp Flow": 395.7,
    "Ore Pulp Density": 1.6,
    "Flotation Column 01 Air Flow": 250,
    "Flotation Column 02 Air Flow": 250,
    "Flotation Column 03 Air Flow": 250,
    "Flotation Column 04 Air Flow": 295,
    "Flotation Column 05 Air Flow": 295,
    "Flotation Column 06 Air Flow": 295,
    "Flotation Column 07 Air Flow": 295,
    "Flotation Column 01 Level": 450,
    "Flotation Column 02 Level": 450,
    "Flotation Column 03 Level": 450,
    "Flotation Column 04 Level": 450,
    "Flotation Column 05 Level": 450,
    "Flotation Column 06 Level": 450,
    "Flotation Column 07 Level": 450,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  const handleRandomize = () => {
    const newData = { ...formData };
    newData["Amina Flow"] = parseFloat((Math.random() * 50 + 10).toFixed(2));
    newData["Starch Flow"] = parseFloat((Math.random() * 50 + 10).toFixed(2));
    newData["Ore Pulp Flow"] = parseFloat((Math.random() * 100 + 300).toFixed(2));
    newData["Ore Pulp Density"] = parseFloat((Math.random() * 0.5 + 1.3).toFixed(2));

    for (let i = 1; i <= 7; i++) {
      newData[`Flotation Column 0${i} Air Flow`] = parseFloat((Math.random() * 150 + 200).toFixed(2));
      newData[`Flotation Column 0${i} Level`] = parseFloat((Math.random() * 300 + 300).toFixed(2));
    }

    setFormData(newData);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formData })
      });
      if (!response.ok) throw new Error("Gagal terhubung ke API");
      const resData = await response.json();
      setResult(resData);
    } catch (err) {
      setError("Koneksi gagal. Pastikan FastAPI Backend berjalan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col xl:flex-row gap-6 h-[calc(100vh-5rem)] min-h-0">

      {/* Form Area - Fixed layout with natural spacing */}
      <div className="flex-1 bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Evaluasi Parameter Pabrik</h2>
            <p className="text-sm text-slate-800 font-medium">Sesuaikan angka di bawah untuk melihat prediksi AI.</p>
          </div>
          <button
            type="button"
            onClick={handleRandomize}
            className="flex items-center gap-2 text-sm text-slate-800 bg-slate-200/40 hover:bg-slate-300 px-3 py-1.5 rounded-lg transition-colors font-medium shrink-0"
          >
            <RefreshCcw size={16} /> Acak
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 space-y-8">
          {/* Group 1 */}
          <div>
            <h3 className="text-base font-bold text-blue-800 uppercase tracking-wider mb-4">Reagen & Lumpur</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {['Amina Flow', 'Starch Flow', 'Ore Pulp Flow', 'Ore Pulp Density'].map(field => (
                <div key={field} className="relative">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{field}</label>
                  <input
                    type="number" step="any" name={field} value={formData[field]} onChange={handleChange}
                    className="w-full bg-white/40 border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Group 2 */}
          <div>
            <h3 className="text-base font-bold text-blue-800 uppercase tracking-wider mb-4">Aliran Udara Flotasi (Nm³/h)</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7].map(num => (
                <div key={`Flotation Column 0${num} Air Flow`} className="relative">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kolom 0{num} Air</label>
                  <input
                    type="number" step="any" name={`Flotation Column 0${num} Air Flow`} value={formData[`Flotation Column 0${num} Air Flow`]} onChange={handleChange}
                    className="w-full bg-white/40 border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Group 3 */}
          <div>
            <h3 className="text-base font-bold text-blue-800 uppercase tracking-wider mb-4">Ketinggian Buih (Level mm)</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7].map(num => (
                <div key={`Flotation Column 0${num} Level`} className="relative">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kolom 0{num} Level</label>
                  <input
                    type="number" step="any" name={`Flotation Column 0${num} Level`} value={formData[`Flotation Column 0${num} Level`]} onChange={handleChange}
                    className="w-full bg-white/40 border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-4 pb-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-blue-200 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <RefreshCcw className="animate-spin" size={20} /> : <Cpu size={20} />}
              {loading ? 'MEMPROSES...' : 'JALANKAN EVALUASI AI'}
            </button>
          </div>
        </form>
      </div>

      {/* Result Indicator Area - Fixed Size */}
      <div className="w-full xl:w-[400px] flex flex-col shrink-0 h-full">
        <div className={`flex-1 p-8 rounded-2xl border flex flex-col items-center overflow-y-auto custom-scrollbar transition-all duration-500 ${!result ? 'bg-slate-50/40 backdrop-blur-xl border-slate-200 justify-center text-center' :
            result.is_anomaly ? 'bg-red-50/40 backdrop-blur-xl border-red-200 shadow-lg shadow-red-100/50 justify-start' :
              'bg-green-50/40 backdrop-blur-xl border-green-200 shadow-lg shadow-green-100/50 justify-start'
          }`}>

          {!result && !error && (
            <>
              <ShieldAlert size={64} className="text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-900">Menunggu Evaluasi</h3>
              <p className="text-sm text-slate-800 font-medium mt-2">Tekan tombol Jalankan untuk memprediksi.</p>
            </>
          )}

          {error && (
            <>
              <AlertTriangle size={64} className="text-red-400 mb-4" />
              <h3 className="text-lg font-bold text-red-700">Terjadi Kesalahan</h3>
              <p className="text-sm text-red-700 mt-2 text-center font-medium">{error}</p>
            </>
          )}

          {result && result.is_anomaly && (
            <div className="flex flex-col items-center w-full text-center">
              <div className="relative mt-4">
                <AlertTriangle size={80} className="text-red-500 mb-4 animate-pulse relative z-10" />
                <div className="absolute inset-0 bg-red-400 blur-xl opacity-30 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-black text-red-700 tracking-tight">BAHAYA: ANOMALI</h3>
              <p className="text-sm text-red-800 mt-3 font-bold">Prediksi silika akan menembus batas kritis (&gt;2.67%).</p>

              <div className="mt-6 bg-white/40 px-4 py-2 rounded-lg border border-red-200 w-full">
                <span className="text-xs font-bold text-red-700 uppercase tracking-widest">Keyakinan AI</span>
                <div className="text-xl font-black text-red-800">{Math.round(result.anomaly_probability * 100)}%</div>
              </div>
            </div>
          )}

          {result && !result.is_anomaly && (
            <div className="flex flex-col items-center w-full text-center">
              <CheckCircle size={80} className="text-green-500 mb-4 mt-4 drop-shadow-sm" />
              <h3 className="text-2xl font-black text-green-700 tracking-tight">STATUS AMAN</h3>
              <p className="text-sm text-green-800 mt-3 font-bold">Operasional pabrik dalam batas toleransi kualitas optimal.</p>

              <div className="mt-6 bg-white/40 px-4 py-2 rounded-lg border border-green-200 w-full">
                <span className="text-xs font-bold text-green-700 uppercase tracking-widest">Risiko Anomali</span>
                <div className="text-xl font-black text-green-800">{Math.round(result.anomaly_probability * 100)}%</div>
              </div>
            </div>
          )}

          {/* Rekomendasi Mitigasi */}
          {result && result.mitigation && (
            <div className="mt-8 text-left w-full animate-fade-in">
              <div className={`p-5 rounded-2xl border ${result.is_anomaly ? 'bg-white/40 backdrop-blur-xl border-red-200 shadow-sm' : 'bg-white/40 backdrop-blur-xl border-green-200 shadow-sm'}`}>
                <h4 className="font-bold text-[11px] text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Activity size={14} className={result.is_anomaly ? "text-red-500" : "text-emerald-500"} />
                  Rekomendasi Tindakan
                </h4>

                <div className="mb-3">
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Sensor Pemicu Utama</span>
                  <div className={`font-bold text-sm ${result.is_anomaly ? 'text-red-800' : 'text-slate-900'}`}>
                    {result.most_anomalous_feature}
                  </div>
                </div>

                <div className="bg-white/40 p-3 rounded-xl border border-slate-200 mb-3">
                  <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                    {result.mitigation}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 border-t border-slate-100 pt-3">
                  <span>Deviasi Z-Score (Jarak dari Normal)</span>
                  <span className={`px-2 py-0.5 rounded-md ${Math.abs(result.feature_z_score) > 2 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                    {result.feature_z_score > 0 ? '+' : ''}{result.feature_z_score.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
