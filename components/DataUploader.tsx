
import React, { useState } from 'react';
import { Upload, FileText, ChevronDown, ChevronUp, BarChart3, TrendingUp, Sun, DollarSign, Bitcoin, Activity, Percent, TrendingDown } from 'lucide-react';
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

  const loadSample = (type: 'retail' | 'sp500' | 'temp' | 'crypto' | 'forex' | 'unemployment' | 'inflation') => {
    let sample: DataPoint[] = [];
    const today = new Date();

    const generateDate = (daysAgo: number) => {
      const d = new Date();
      d.setDate(today.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    if (type === 'retail') {
      // Seasonal monthly data (2 years)
      sample = Array.from({ length: 24 }, (_, i) => ({
        date: `2022-${(i % 12 + 1).toString().padStart(2, '0')}`,
        value: 100 + (i * 2) + (Math.sin(i * (Math.PI / 6)) * 20) + (Math.random() * 5)
      }));
    } else if (type === 'sp500') {
      // Simulated S&P 500: Upward trend with volatility
      let price = 4000;
      sample = Array.from({ length: 60 }, (_, i) => {
        const change = (Math.random() - 0.45) * 40; // Slight upward bias
        price += change;
        return { date: generateDate(60 - i), value: parseFloat(price.toFixed(2)) };
      });
    } else if (type === 'crypto') {
      // Simulated Bitcoin: High Volatility + Shocks
      let price = 30000;
      sample = Array.from({ length: 60 }, (_, i) => {
        // Occasional shock
        const shock = Math.random() > 0.95 ? (Math.random() > 0.5 ? 2000 : -2000) : 0;
        const change = (Math.random() - 0.5) * 800 + shock;
        price += change;
        return { date: generateDate(60 - i), value: parseFloat(price.toFixed(2)) };
      });
    } else if (type === 'forex') {
      // Simulated EUR/USD: Mean reverting around 1.10
      let price = 1.10;
      sample = Array.from({ length: 100 }, (_, i) => {
        const meanReversion = (1.10 - price) * 0.1;
        const noise = (Math.random() - 0.5) * 0.005;
        price += meanReversion + noise;
        return { date: generateDate(100 - i), value: parseFloat(price.toFixed(4)) };
      });
    } else if (type === 'temp') {
      // Highly seasonal
      sample = Array.from({ length: 12 }, (_, i) => ({
        date: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        value: 15 + (Math.sin((i - 3) * (Math.PI / 6)) * 15) + (Math.random() * 2)
      }));
    } else if (type === 'unemployment') {
      // Unemployment Rate: Slow moving, cyclical
      let rate = 4.5;
      sample = Array.from({ length: 48 }, (_, i) => {
        // Slow random walk + cycle
        const change = (Math.random() - 0.5) * 0.2;
        const cycle = Math.sin(i / 10) * 0.1;
        rate += change + cycle;
        if (rate < 3) rate = 3.0;
        if (rate > 10) rate = 10.0;
        return { date: `M-${i + 1}`, value: parseFloat(rate.toFixed(1)) };
      });
    } else if (type === 'inflation') {
      // Inflation: Trending up then down
      sample = Array.from({ length: 36 }, (_, i) => {
        // Bell curve shape approx
        const val = 2 + 5 * Math.exp(-Math.pow(i - 18, 2) / 50) + (Math.random() * 0.5);
        return { date: `M-${i + 1}`, value: parseFloat(val.toFixed(2)) };
      });
    }
    onUpload(sample);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Upload Actions */}
      <div className="flex flex-wrap justify-center gap-4">
        <label className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-lg cursor-pointer hover:bg-slate-800 transition-all font-bold shadow-lg hover:shadow-slate-500/20 active:scale-95 group">
          <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
          <span>Upload CSV File</span>
          <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
        </label>
        
        <button 
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center gap-2 bg-white text-slate-600 border border-slate-200 px-6 py-4 rounded-lg hover:bg-slate-50 transition-all font-semibold shadow-sm active:scale-95"
        >
          <FileText className="w-5 h-5 text-indigo-500" />
          <span>CSV Guide</span>
          {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Formatting Guide Section */}
      {showGuide && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-6 text-left animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-slate-600 mb-2"><strong>Option A: Date & Value (Recommended)</strong></p>
              <pre className="bg-white p-3 rounded border border-indigo-100 font-mono text-xs text-indigo-600">
                Date,Value<br/>
                2023-01-01,152.5<br/>
                2023-01-02,158.2
              </pre>
            </div>
            <div>
              <p className="text-slate-600 mb-2"><strong>Option B: Value Only</strong></p>
              <pre className="bg-white p-3 rounded border border-indigo-100 font-mono text-xs text-indigo-600">
                152.5<br/>
                158.2
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Sample Dataset Gallery */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-6">Load Financial & Macro Datasets</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          <button 
            onClick={() => loadSample('retail')}
            className="flex flex-col items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all group"
          >
            <div className="p-2 bg-blue-50 text-blue-600 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-center">
              <span className="block font-bold text-slate-800 text-xs">Retail Sales</span>
              <span className="text-[10px] text-slate-400">Seasonal</span>
            </div>
          </button>

          <button 
            onClick={() => loadSample('sp500')}
            className="flex flex-col items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all group"
          >
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="text-center">
              <span className="block font-bold text-slate-800 text-xs">S&P 500</span>
              <span className="text-[10px] text-slate-400">Equity Trend</span>
            </div>
          </button>

          <button 
            onClick={() => loadSample('crypto')}
            className="flex flex-col items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all group"
          >
            <div className="p-2 bg-orange-50 text-orange-600 rounded-md group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <Bitcoin className="w-4 h-4" />
            </div>
            <div className="text-center">
              <span className="block font-bold text-slate-800 text-xs">Bitcoin</span>
              <span className="text-[10px] text-slate-400">Volatile</span>
            </div>
          </button>

          <button 
            onClick={() => loadSample('forex')}
            className="flex flex-col items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all group"
          >
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-md group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="text-center">
              <span className="block font-bold text-slate-800 text-xs">EUR/USD</span>
              <span className="text-[10px] text-slate-400">Mean Revert</span>
            </div>
          </button>

          <button 
            onClick={() => loadSample('unemployment')}
            className="flex flex-col items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all group"
          >
            <div className="p-2 bg-red-50 text-red-600 rounded-md group-hover:bg-red-600 group-hover:text-white transition-colors">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div className="text-center">
              <span className="block font-bold text-slate-800 text-xs">Jobless Rate</span>
              <span className="text-[10px] text-slate-400">Cyclical</span>
            </div>
          </button>

          <button 
            onClick={() => loadSample('inflation')}
            className="flex flex-col items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all group"
          >
            <div className="p-2 bg-purple-50 text-purple-600 rounded-md group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Percent className="w-4 h-4" />
            </div>
            <div className="text-center">
              <span className="block font-bold text-slate-800 text-xs">Inflation CPI</span>
              <span className="text-[10px] text-slate-400">Shock</span>
            </div>
          </button>

          <button 
            onClick={() => loadSample('temp')}
            className="flex flex-col items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all group"
          >
            <div className="p-2 bg-amber-50 text-amber-600 rounded-md group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Sun className="w-4 h-4" />
            </div>
            <div className="text-center">
              <span className="block font-bold text-slate-800 text-xs">Climate</span>
              <span className="text-[10px] text-slate-400">Periodic</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
