
import React, { useState } from 'react';
import { Upload, FileText, Plus, HelpCircle, ChevronDown, ChevronUp, BarChart3, TrendingUp, Sun } from 'lucide-react';
import { DataPoint } from '../types';

interface DataUploaderProps {
  onUpload: (data: DataPoint[]) => void;
}

export const DataUploader: React.FC<DataUploaderProps> = ({ onUpload }) => {
  const [showGuide, setShowGuide] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const rows = text.split('\n').filter(row => row.trim().length > 0);
    
    const parsedData: DataPoint[] = rows.map((row, index) => {
      const parts = row.split(/[,;\t]/);
      if (parts.length >= 2) {
        return { date: parts[0].trim(), value: parseFloat(parts[1]) || 0 };
      }
      return { date: `T-${rows.length - index}`, value: parseFloat(parts[0]) || 0 };
    }).filter(d => !isNaN(d.value));

    if (parsedData.length > 0) {
      onUpload(parsedData);
    }
  };

  const loadSample = (type: 'retail' | 'stock' | 'temp') => {
    let sample: DataPoint[] = [];
    if (type === 'retail') {
      // Seasonal monthly data
      sample = Array.from({ length: 24 }, (_, i) => ({
        date: `2022-${(i % 12 + 1).toString().padStart(2, '0')}`,
        value: 100 + (i * 2) + (Math.sin(i * (Math.PI / 6)) * 20) + (Math.random() * 5)
      }));
    } else if (type === 'stock') {
      // Random walk with drift
      let val = 150;
      sample = Array.from({ length: 30 }, (_, i) => {
        val += (Math.random() - 0.45) * 10;
        return { date: `Day ${i + 1}`, value: parseFloat(val.toFixed(2)) };
      });
    } else if (type === 'temp') {
      // Highly seasonal
      sample = Array.from({ length: 12 }, (_, i) => ({
        date: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        value: 15 + (Math.sin((i - 3) * (Math.PI / 6)) * 15) + (Math.random() * 2)
      }));
    }
    onUpload(sample);
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Upload Actions */}
      <div className="flex flex-wrap justify-center gap-4">
        <label className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl cursor-pointer hover:bg-indigo-700 transition-all font-bold shadow-lg hover:shadow-indigo-200 active:scale-95 group">
          <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
          <span>Upload CSV File</span>
          <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
        </label>
        
        <button 
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center gap-2 bg-white text-slate-600 border border-slate-200 px-6 py-4 rounded-2xl hover:bg-slate-50 transition-all font-semibold shadow-sm active:scale-95"
        >
          <HelpCircle className="w-5 h-5 text-indigo-500" />
          <span>CSV Formatting Guide</span>
          {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Formatting Guide Section */}
      {showGuide && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 text-left animate-in fade-in slide-in-from-top-2">
          <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Required CSV Structure
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-slate-600 mb-2"><strong>Option A: Date & Value (Recommended)</strong></p>
              <pre className="bg-white p-3 rounded-xl border border-indigo-100 font-mono text-xs text-indigo-600">
                Date,Value<br/>
                2023-01-01,152.5<br/>
                2023-01-02,158.2<br/>
                2023-01-03,149.0
              </pre>
            </div>
            <div>
              <p className="text-slate-600 mb-2"><strong>Option B: Value Only</strong></p>
              <pre className="bg-white p-3 rounded-xl border border-indigo-100 font-mono text-xs text-indigo-600">
                152.5<br/>
                158.2<br/>
                149.0
              </pre>
              <p className="mt-2 text-[11px] text-slate-500 italic">The machine will auto-index time steps if no dates are found.</p>
            </div>
          </div>
        </div>
      )}

      {/* Sample Dataset Gallery */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Or Test with Sample Data</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            onClick={() => loadSample('retail')}
            className="flex flex-col items-center gap-3 p-5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all group"
          >
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-center">
              <span className="block font-bold text-slate-800 text-sm">Retail Sales</span>
              <span className="text-[10px] text-slate-400">Monthly + Trend</span>
            </div>
          </button>

          <button 
            onClick={() => loadSample('stock')}
            className="flex flex-col items-center gap-3 p-5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all group"
          >
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <span className="block font-bold text-slate-800 text-sm">Stock Market</span>
              <span className="text-[10px] text-slate-400">Volatile Random Walk</span>
            </div>
          </button>

          <button 
            onClick={() => loadSample('temp')}
            className="flex flex-col items-center gap-3 p-5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all group"
          >
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Sun className="w-5 h-5" />
            </div>
            <div className="text-center">
              <span className="block font-bold text-slate-800 text-sm">Climate Cycle</span>
              <span className="text-[10px] text-slate-400">Strong Seasonality</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
