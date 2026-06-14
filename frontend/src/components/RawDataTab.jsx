import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { Plus } from 'lucide-react';

const ROW_HEIGHT = 45;
const VISIBLE_ROWS = 25;

// 5 Kolom, masing-masing 2 Baris (Top & Bottom) = Total 10 Deskripsi
const SENSOR_COLUMNS = [
  {
    top: { id: "Starch Flow", title: "Starch Flow", desc: "Aliran reagen Kanji (m³/h). Berfungsi menekan bijih besi agar tidak mengapung." },
    bottom: { id: "Flotation Column Air Flow", title: "Column Air Flow", desc: "Aliran udara (Nm³/h) ditiupkan ke tangki untuk membentuk buih." }
  },
  {
    top: { id: "Amina Flow", title: "Amina Flow", desc: "Aliran reagen Amina (m³/h). Berfungsi mengikat impuritas silika menjadi buih." },
    bottom: { id: "Flotation Column Level", title: "Column Level", desc: "Ketinggian level buih (mm) di dalam tangki flotasi." }
  },
  {
    top: { id: "Ore Pulp Flow", title: "Ore Pulp Flow", desc: "Laju aliran lumpur bijih mentah masuk (t/h) ke tangki flotasi." },
    bottom: { id: "% Silica Feed", title: " Silica Feed", desc: "Kadar Silika bawaan pada bijih mentah awal sebelum diproses (dalam persen)." }
  },
  {
    top: { id: "Ore Pulp Density", title: "Ore Pulp Density", desc: "Kepadatan lumpur bijih (kg/cm³). Menentukan viskositas pemisahan." },
    bottom: { id: "% Iron Feed", title: " Iron Feed", desc: "Kadar Besi bawaan pada bijih mentah awal sebelum proses flotasi (dalam persen)." }
  },
  {
    top: { id: "% Iron Concentrate", title: " Iron Concentrate", desc: "Kadar Besi akhir pada konsentrat (Nilai ideal untuk profitabilitas) (dalam persen)." },
    bottom: { id: "Silica Concentrate", title: " Silica Concentrate", desc: "Kadar Silika akhir pada konsentrat (Nilai anomali kritis jika > 2.67%)." }
  }
];

export default function RawDataTab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollTop, setScrollTop] = useState(0);

  // State array untuk 5 kolom. Nilai: 0 = Idle, 1 = Top Expanded, 2 = Bottom Expanded
  const [expandedCols, setExpandedCols] = useState([0, 0, 0, 0, 0]);

  const tableContainerRef = useRef(null);

  useEffect(() => {
    Papa.parse('/Mining_sample.csv', {
      download: true,
      header: true,
      preview: 20000,
      complete: (results) => {
        setData(results.data);
        setLoading(false);
      }
    });
  }, []);

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  const handleToggle = (colIndex, position) => {
    setExpandedCols(prev => {
      const newState = [...prev];
      if (newState[colIndex] === position) {
        newState[colIndex] = 0; // Collapse jika di-klik lagi
      } else {
        newState[colIndex] = position; // Expand yang di-klik, shrink pasangannya
      }
      return newState;
    });
  };

  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  const totalRows = data.length;
  const totalHeight = totalRows * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 2);
  const endIndex = Math.min(totalRows - 1, startIndex + VISIBLE_ROWS + 4);
  const visibleData = data.slice(startIndex, endIndex + 1);
  const topPadding = startIndex * ROW_HEIGHT;
  const bottomPadding = Math.max(0, totalHeight - (endIndex + 1) * ROW_HEIGHT);

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] animate-fade-in">
      {/* Header Statis */}
      <div className="mb-4 flex-shrink-0">
        <h2 className="text-2xl font-bold text-slate-900">Eksplorasi Data Mentah</h2>
        <p className="text-slate-800 font-medium text-sm mt-1">
          Menampilkan rekaman lengkap historis sensor pabrik. Klik kotak di bawah untuk melihat Kamus Data.
        </p>
      </div>

      {/* Kamus Data (Info Cards) - 21st.dev Accordion Concept */}
      <div className="flex-shrink-0 mb-6 h-56">
        <div className="grid grid-cols-5 gap-3 h-full">
          {SENSOR_COLUMNS.map((col, idx) => {
            const state = expandedCols[idx];
            const isTopExpanded = state === 1;
            const isBottomExpanded = state === 2;
            const isTopShrunk = state === 2;
            const isBottomShrunk = state === 1;

            return (
              <div key={idx} className="flex flex-col gap-3 h-full">
                {/* Kotak Baris 1 (Top) */}
                <div
                  onClick={() => handleToggle(idx, 1)}
                  className={`bg-white/40 backdrop-blur-xl rounded-xl border border-slate-200 shadow-sm cursor-pointer overflow-hidden relative transition-all duration-300 ease-in-out ${isTopExpanded ? 'flex-[3]' : isTopShrunk ? 'flex-[1]' : 'flex-[2]'
                    }`}
                >
                  <div className="absolute inset-0">
                    {/* Plus Icon */}
                    <Plus
                      size={16}
                      strokeWidth={2}
                      className={`absolute top-3 right-3 text-slate-400 transition-all duration-300 z-10 [&>path:last-child]:origin-center [&>path:last-child]:transition-all [&>path:last-child]:duration-300 ${isTopExpanded
                        ? '[&>path:last-child]:rotate-90 [&>path:last-child]:opacity-0 rotate-180'
                        : isTopShrunk ? 'opacity-0' : 'opacity-100'
                        }`}
                    />

                    {/* Title Wrapper */}
                    <div className={`absolute w-full left-0 px-3 transition-all duration-300 flex flex-col items-center ${isTopExpanded ? 'top-4' : 'top-1/2 -translate-y-1/2'}`}>
                      <h4 className={`font-bold text-slate-900 text-center px-4 transition-all duration-300 ${isTopShrunk ? 'text-[11px]' : 'text-sm'}`}>
                        {col.top.title}
                      </h4>
                    </div>

                    {/* Description Wrapper - Centered in remaining space */}
                    <div className={`absolute left-0 w-full bottom-0 flex items-center justify-center px-3 pb-2 transition-all duration-300 ${isTopExpanded ? 'top-10 opacity-100' : 'top-[60%] opacity-0 pointer-events-none'}`}>
                      <p className="text-xs text-slate-900 font-medium text-center leading-relaxed">
                        {col.top.desc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Kotak Baris 2 (Bottom) */}
                <div
                  onClick={() => handleToggle(idx, 2)}
                  className={`bg-white/40 backdrop-blur-xl rounded-xl border border-slate-200 shadow-sm cursor-pointer overflow-hidden relative transition-all duration-300 ease-in-out ${isBottomExpanded ? 'flex-[3]' : isBottomShrunk ? 'flex-[1]' : 'flex-[2]'
                    }`}
                >
                  <div className="absolute inset-0">
                    {/* Plus Icon */}
                    <Plus
                      size={16}
                      strokeWidth={2}
                      className={`absolute top-3 right-3 text-slate-400 transition-all duration-300 z-10 [&>path:last-child]:origin-center [&>path:last-child]:transition-all [&>path:last-child]:duration-300 ${isBottomExpanded
                        ? '[&>path:last-child]:rotate-90 [&>path:last-child]:opacity-0 rotate-180'
                        : isBottomShrunk ? 'opacity-0' : 'opacity-100'
                        }`}
                    />

                    {/* Title Wrapper */}
                    <div className={`absolute w-full left-0 px-3 transition-all duration-300 flex flex-col items-center ${isBottomExpanded ? 'top-4' : 'top-1/2 -translate-y-1/2'}`}>
                      <h4 className={`font-bold text-slate-900 text-center px-4 transition-all duration-300 ${isBottomShrunk ? 'text-[11px]' : 'text-sm'}`}>
                        {col.bottom.title}
                      </h4>
                    </div>

                    {/* Description Wrapper - Centered in remaining space */}
                    <div className={`absolute left-0 w-full bottom-0 flex items-center justify-center px-3 pb-2 transition-all duration-300 ${isBottomExpanded ? 'top-10 opacity-100' : 'top-[60%] opacity-0 pointer-events-none'}`}>
                      <p className="text-xs text-slate-900 font-medium text-center leading-relaxed">
                        {col.bottom.desc}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Tabel Data - Fixed Header, Virtualized Rows, Scrollbar on Left */}
      <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-800 font-bold">
            <span className="animate-pulse">Memuat dataset Mining_sample.csv...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-auto custom-scrollbar" dir="rtl" onScroll={handleScroll} ref={tableContainerRef}>
            <div dir="ltr" className="w-max min-w-full">
              <table className="w-full text-sm text-left border-collapse">
                {/* Header Tabel Di-Freeze (Sticky) */}
                <thead className="bg-slate-50/40 backdrop-blur-md text-slate-900 font-extrabold border-b border-slate-200 sticky top-0 z-20 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap bg-slate-50/40 backdrop-blur-md/40 backdrop-blur-md border-r border-slate-200 sticky left-0 z-30">No.</th>
                    {headers.map(header => (
                      <th key={header} className="px-4 py-3 whitespace-nowrap bg-slate-50/40 backdrop-blur-md">
                        {header === 'date' ? 'Timestamp' : header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 relative z-0">
                  {/* Spacer Atas untuk Virtual Scroll */}
                  {topPadding > 0 && (
                    <tr aria-hidden="true">
                      <td colSpan={headers.length + 1} style={{ height: `${topPadding}px`, padding: 0, border: 0 }}></td>
                    </tr>
                  )}

                  {/* Data Baris Aktual */}
                  {visibleData.map((row, i) => (
                    <tr key={startIndex + i} className="hover:bg-blue-50/50 transition-colors" style={{ height: `${ROW_HEIGHT}px` }}>
                      <td className="px-4 py-2 text-slate-700 font-bold whitespace-nowrap border-r border-slate-100 sticky left-0 bg-white/40 backdrop-blur-md z-10">
                        {startIndex + i + 1}
                      </td>
                      {headers.map(header => (
                        <td key={header} className="px-4 py-2 text-slate-900 font-medium whitespace-nowrap">
                          {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Spacer Bawah untuk Virtual Scroll */}
                  {bottomPadding > 0 && (
                    <tr aria-hidden="true">
                      <td colSpan={headers.length + 1} style={{ height: `${bottomPadding}px`, padding: 0, border: 0 }}></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
