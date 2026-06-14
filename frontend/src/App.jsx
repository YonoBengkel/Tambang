import React, { useState } from 'react';
import { Database, LineChart, ShieldAlert } from 'lucide-react';
import RawDataTab from './components/RawDataTab';
import TrendsTab from './components/TrendsTab';
import EvaluationTab from './components/EvaluationTab';
import AnimatedBackground from './components/AnimatedBackground';

function App() {
  const [activeTab, setActiveTab] = useState('raw'); // Default ke raw data dulu sesuai request

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row font-sans relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 flex flex-col shadow-sm z-10 md:h-screen sticky top-0 shrink-0">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Mining<span className="text-blue-600">EWS</span></h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Dasbor QA/QC Terpadu</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('raw')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'raw' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Database size={18} /> Data Sensor
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'trends' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <LineChart size={18} /> Analisis Tren
          </button>
          <button
            onClick={() => setActiveTab('evaluation')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'evaluation' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <ShieldAlert size={18} /> Evaluasi Pabrik
          </button>
        </nav>

        {/* Dashboard Description Card */}
        <div className="p-5 m-4 mt-auto bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200 rounded-2xl shadow-sm">
          <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-widest mb-3">Tentang Dasbor Ini</h4>
          
          <div className="space-y-3 text-[11px] text-slate-600 leading-relaxed font-medium text-justify">
            <p>
              Aplikasi cerdas berbasis <strong>Ensemble Learning</strong> untuk memprediksi lonjakan impuritas Silika secara <em>real-time</em> berdasarkan data operasional pabrik.
            </p>
            <div className="pt-2 border-t border-slate-200/60 mt-2">
              <strong className="text-blue-700 block mb-1">Keunggulan Cost-Sensitive:</strong>
              <p>
                Algoritma dirancang ekstra waspada untuk menekan risiko produk cacat, memungkinkan QA/QC mencegah kerugian produksi secara proaktif.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto h-full">
          {activeTab === 'raw' && <RawDataTab />}
          {activeTab === 'trends' && <TrendsTab />}
          {activeTab === 'evaluation' && <EvaluationTab />}
        </div>
      </main>
    </div>
  );
}

export default App;
