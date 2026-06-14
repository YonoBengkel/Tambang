import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Lightbulb, AlertTriangle } from 'lucide-react';

export default function TrendsTab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSensor, setSelectedSensor] = useState('Amina Flow');

  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    Papa.parse('/Mining.csv', {
      download: true,
      header: true,
      preview: 300,
      complete: (results) => {
        const cleanedData = results.data.map((row, index) => {
          const newRow = { time: `T+${index}` };
          for (let key in row) {
            if (key !== 'date') {
              let val = String(row[key]).replace(/\./g, '').replace(',', '.');
              newRow[key] = parseFloat(val) || 0;
            }
          }
          return newRow;
        });
        setData(cleanedData);
        setLoading(false);
      }
    });
  }, []);

  const sensors = data.length > 0
    ? Object.keys(data[0]).filter(k => k !== 'time' && !k.toLowerCase().includes('silica concentrate'))
    : [];

  // Hitung Metrik & Korelasi Pearson
  const stats = useMemo(() => {
    if (!data || data.length === 0) return { mean: 0, max: 0, min: 0, correlation: 0, corrText: "-", corrColor: "text-slate-500", corrBg: "bg-slate-50" };

    let max = -Infinity, min = Infinity, sum = 0;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    const n = data.length;

    data.forEach(row => {
      const val = row[selectedSensor] || 0;
      const y = row['% Silica Concentrate'] || 0;

      if (val > max) max = val;
      if (val < min) min = val;
      sum += val;

      sumX += val;
      sumY += y;
      sumXY += val * y;
      sumX2 += val * val;
      sumY2 += y * y;
    });

    const mean = sum / n;

    const num = (n * sumXY) - (sumX * sumY);
    const varX = (n * sumX2 - sumX * sumX);
    const varY = (n * sumY2 - sumY * sumY);
    const den = Math.sqrt(Math.max(0, varX) * Math.max(0, varY));
    const correlation = den === 0 ? 0 : num / den;

    let corrText = "Korelasi Diabaikan";
    let corrColor = "text-slate-500";
    let corrBg = "bg-slate-50/40 border-slate-200";

    if (correlation > 0.5) { corrText = "Positif Kuat"; corrColor = "text-rose-700"; corrBg = "bg-rose-50/40 border-rose-100"; }
    else if (correlation > 0.2) { corrText = "Positif Lemah"; corrColor = "text-orange-600"; corrBg = "bg-orange-50/40 border-orange-100"; }
    else if (correlation < -0.5) { corrText = "Negatif Kuat"; corrColor = "text-emerald-700"; corrBg = "bg-emerald-50/40 border-emerald-100"; }
    else if (correlation < -0.2) { corrText = "Negatif Lemah"; corrColor = "text-teal-600"; corrBg = "bg-teal-50/40 border-teal-100"; }

    return {
      mean: mean.toFixed(2),
      max: max.toFixed(2),
      min: min.toFixed(2),
      correlation: correlation.toFixed(2),
      corrText,
      corrColor,
      corrBg
    };
  }, [data, selectedSensor]);

  // Penjelasan Dinamis berdasarkan Sensor
  const getInsightText = () => {
    switch (selectedSensor) {
      case 'Amina Flow':
        return "Ketika laju Amina meningkat, buih silika lebih banyak diikat ke atas. Namun dosis berlebih berisiko mengurangi volume produk besi. Perhatikan bagaimana lonjakan Amina bereaksi terbalik dengan sisa Silika di produk akhir.";
      case 'Starch Flow':
        return "Tepung kanji (Starch) berfungsi memberatkan besi agar tenggelam. Jika aliran kanji turun drastis, besi akan ikut mengapung bersama silika, merusak kemurnian konsentrat besi Anda.";
      case 'Ore Pulp Flow':
        return "Laju pasokan lumpur mentah yang tidak stabil seringkali menjadi akar masalah utama. Mesin flotasi akan kesulitan menyeimbangkan injeksi udara dan reagen saat aliran lumpur berfluktuasi ekstrem.";
      case 'Ore Pulp Density':
        return "Kepadatan lumpur mempengaruhi viskositas. Kepadatan terlalu tinggi bisa menghambat interaksi silika dengan gelembung udara, menyebabkan silika lolos ke produk akhir.";
      default:
        if (selectedSensor.includes('Air Flow')) {
          return "Aliran udara membentuk gelembung untuk mengangkat silika. Anomali udara sering menyebabkan buih pecah sebelum silika dibuang.";
        } else if (selectedSensor.includes('Level')) {
          return "Level buih di dalam kolom flotasi. Jika level jatuh terlalu rendah, silika tidak akan meluap keluar dan justru terbuang ke penampungan besi.";
        }
        return "Amati bagaimana fluktuasi pada sensor ini mendahului atau bertepatan dengan lonjakan kadar Silika pada produk akhir.";
    }
  }

  // Menutup dropdown jika klik di luar komponen
  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-5rem)]">

      {/* Header Ekstensif (Tanpa Insight) */}
      <div className="flex-shrink-0">
        <h2 className="text-2xl font-bold text-slate-800">Analisis Tren & Korelasi Historis</h2>
        <p className="text-slate-800 font-medium text-sm mt-1 mb-2">
          Halaman ini bukan sekadar garis acak. Ini adalah jendela Anda menuju masa lalu pabrik.
          Dengan membandingkan grafik sensor secara langsung terhadap lonjakan impuritas Silika,
          QA/QC dapat menemukan <span className="font-semibold text-slate-700">Pola Akar Masalah (Root Cause)</span> mengapa anomali kualitas bisa terjadi pada jam-jam tertentu.
        </p>
      </div>

      {/* Split Layout: Kiri Grafik (70%), Kanan Panel Analitik (30%) */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">

        {/* KIRI - Kontrol & Grafik */}
        <div className="lg:w-[70%] bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-6 flex-shrink-0">
            <div className="flex items-center gap-2 text-slate-700">
              <Activity size={20} className="text-blue-500" />
              <h3 className="font-bold text-lg">Komparasi: {selectedSensor} vs Silika</h3>
            </div>

            {/* Custom Dropdown */}
            <div className="relative w-64" onClick={(e) => e.stopPropagation()}>
              <div
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer flex justify-between items-center shadow-sm hover:bg-slate-100 transition-colors"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="truncate">{selectedSensor}</span>
                <svg className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ml-2 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>

              {dropdownOpen && (
                <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl mt-2 max-h-[190px] overflow-y-auto shadow-xl custom-scrollbar py-1 animate-fade-in">
                  {sensors.map(s => (
                    <li
                      key={s}
                      onClick={() => { setSelectedSensor(s); setDropdownOpen(false); }}
                      className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${selectedSensor === s ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 font-medium">Menyusun grafik cerdas...</div>
          ) : (
            <div className="flex-1 min-h-0 w-full relative">
              {/* Hint Peringatan Anomali */}
              <div className="absolute top-2 right-4 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg border border-rose-100 text-[10px] font-bold flex items-center gap-1.5 z-10 opacity-80 pointer-events-none">
                <AlertTriangle size={12} /> Garis Merah Titik-titik = Batas Bahaya Silika
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    labelStyle={{ fontWeight: '900', color: '#0f172a', marginBottom: '4px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px', fontWeight: '500' }} />

                  <Line
                    name={`Fluktuasi ${selectedSensor}`}
                    type="monotone"
                    dataKey={selectedSensor}
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
                    animationDuration={1500}
                  />

                  <Line
                    name="Kadar Impuritas Silika (%)"
                    type="monotone"
                    dataKey="% Silica Concentrate"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    activeDot={{ r: 4, fill: '#ef4444' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* KANAN - Panel Analisis Pintar (30%) */}
        <div className="lg:w-[30%] flex flex-col gap-4 h-full">

          {/* Kartu 1: Insight Pakar */}
          <div className="bg-gradient-to-br from-blue-50/40 to-indigo-50/40 backdrop-blur-xl border border-blue-100 p-5 rounded-2xl shadow-sm flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white p-2 rounded-xl text-blue-500 shadow-sm shrink-0">
                <Lightbulb size={20} />
              </div>
              <h4 className="font-bold text-blue-900 text-sm">Analisis Pakar</h4>
            </div>
            <p className="text-blue-950 text-[12.5px] leading-relaxed font-semibold">
              {getInsightText()}
            </p>
          </div>

          {/* Kartu 2: Korelasi Otomatis */}
          <div className={`${stats.corrBg} backdrop-blur-xl border p-5 rounded-2xl shadow-sm flex-1 flex flex-col justify-center`}>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-wide">Skor Korelasi (Pearson)</h4>
              <div className={`text-[10px] font-black px-2 py-1 rounded-md bg-white shadow-sm shrink-0 ${stats.corrColor}`}>
                {stats.corrText}
              </div>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-4xl font-black ${stats.corrColor}`}>{stats.correlation}</span>
            </div>
            <p className="text-[11px] text-slate-800 font-medium mt-3 leading-relaxed">
              {parseFloat(stats.correlation) < -0.2
                ? <span>Ketika nilai sensor ini <b>NAIK</b>, kadar Silika cenderung <b>TURUN</b>. Hubungan yang bagus untuk menjaga kemurnian.</span>
                : parseFloat(stats.correlation) > 0.2
                  ? <span>Ketika nilai sensor ini <b>NAIK</b>, kadar Silika cenderung ikut <b>NAIK</b>. Waspadai lonjakan pada sensor ini!</span>
                  : <span>Pergerakan sensor ini tidak memiliki pola hubungan matematis yang searah terhadap kualitas Silika.</span>}
            </p>
          </div>

          {/* Kartu 3: Statistik Kilat */}
          <div className="bg-white/40 backdrop-blur-xl border border-slate-200 p-5 rounded-2xl shadow-sm flex-1 flex flex-col justify-center">
            <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-wide mb-4">Statistik Rentang Historis</h4>

            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Rata-Rata (Mean)</div>
                <div className="text-xl font-bold text-slate-900">{stats.mean}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-100/50 flex flex-col justify-between">
                  <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Nilai Puncak</div>
                  <div className="text-base font-bold text-emerald-800">{stats.max}</div>
                </div>
                <div className="bg-rose-50/40 p-3 rounded-xl border border-rose-100/50 flex flex-col justify-between">
                  <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Nilai Dasar</div>
                  <div className="text-base font-bold text-rose-800">{stats.min}</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
