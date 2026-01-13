
import React, { useState } from 'react';
import { Settings, HelpCircle, ChevronRight, Sliders, PlayCircle, History, Info, Wand2, Sparkles, Loader2 } from 'lucide-react';
import { ModelParams, DataPoint } from '../types';
import { optimizeModelParameters } from '../services/arimaService';

interface ParameterSidebarProps {
  params: ModelParams;
  setParams: React.Dispatch<React.SetStateAction<ModelParams>>;
  hasData: boolean;
  mode: 'forecast' | 'backtest';
  setMode: (mode: 'forecast' | 'backtest') => void;
  splitRatio: number;
  setSplitRatio: (ratio: number) => void;
  dataLength: number;
  data: DataPoint[]; // Added data prop to pass to optimizer
}

const Tooltip: React.FC<{ text: string; title: string }> = ({ text, title }) => (
  <div className="group relative inline-block ml-1">
    <Info className="w-3 h-3 text-slate-400 hover:text-indigo-600 cursor-help" />
    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-64 p-3 bg-slate-900 text-white text-xs rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
      <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
      <div className="relative z-10">
        <strong className="block mb-1 text-slate-200">{title}</strong>
        <span className="text-slate-400 leading-tight block">{text}</span>
      </div>
    </div>
  </div>
);

export const ParameterSidebar: React.FC<ParameterSidebarProps> = ({ 
  params, 
  setParams, 
  hasData,
  mode,
  setMode,
  splitRatio,
  setSplitRatio,
  dataLength,
  data
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleChange = (key: keyof ModelParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleAutoTune = async () => {
    if (!hasData) return;
    setIsOptimizing(true);
    try {
      const optimalParams = await optimizeModelParameters(data);
      setParams(optimalParams);
    } catch (e) {
      console.error("Optimization failed", e);
      // Optional: Add toast notification here
    } finally {
      setIsOptimizing(false);
    }
  };

  const trainCount = Math.floor(dataLength * splitRatio);
  const testCount = dataLength - trainCount;

  return (
    <aside className="w-72 bg-white border-r border-slate-200 overflow-y-auto hidden md:flex flex-col flex-shrink-0 z-10">
      <div className="p-4 space-y-6">
        
        {/* Mode Selector */}
        <div className="bg-slate-100 p-1 rounded-lg flex">
          <button
            onClick={() => setMode('forecast')}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded transition-all ${
              mode === 'forecast' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Forecast
          </button>
          <button
            onClick={() => setMode('backtest')}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded transition-all ${
              mode === 'backtest' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Backtest
          </button>
        </div>

        {/* Backtest Controls */}
        {mode === 'backtest' && hasData && (
          <div className="bg-slate-50 p-3 rounded border border-slate-200 animate-in slide-in-from-top-2 duration-300">
             <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Training Window</h3>
                <span className="text-[10px] font-mono bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                  {Math.round(splitRatio * 100)}%
                </span>
             </div>
             <input 
                type="range" 
                min="0.5" 
                max="0.9" 
                step="0.05"
                value={splitRatio}
                onChange={(e) => setSplitRatio(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-2"
             />
             <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-medium">
               <div className="bg-white px-2 py-1 rounded border border-slate-100 text-center">
                  <span className="block text-slate-400 text-[9px] uppercase">History</span>
                  <span className="font-mono font-bold text-slate-800">{trainCount}</span>
               </div>
               <div className="bg-white px-2 py-1 rounded border border-slate-100 text-center">
                  <span className="block text-slate-400 text-[9px] uppercase">Predicting</span>
                  <span className="font-mono font-bold text-slate-800">{testCount}</span>
               </div>
             </div>
             <p className="text-[9px] text-slate-400 mt-2 text-center leading-tight">
               Adjust slider to roll the origin forward.
             </p>
          </div>
        )}

        <hr className="border-slate-100" />

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Sliders className="w-4 h-4 text-slate-500" />
              <h2>Parameters</h2>
            </div>
          </div>
          
          {/* AutoML Button */}
          <div className="mb-6">
            <button
              onClick={handleAutoTune}
              disabled={!hasData || isOptimizing}
              className={`w-full relative overflow-hidden group rounded-lg p-0.5 transition-all ${
                 !hasData || isOptimizing ? 'bg-slate-200 cursor-not-allowed' : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95'
              }`}
            >
              <div className={`relative flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-[6px] transition-all ${
                 !hasData || isOptimizing ? 'bg-slate-50' : 'group-hover:bg-opacity-95'
              }`}>
                {isOptimizing ? (
                  <>
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                    <span className="text-xs font-bold text-indigo-600">Optimizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className={`w-4 h-4 ${!hasData ? 'text-slate-400' : 'text-indigo-600'}`} />
                    <span className={`text-xs font-bold ${!hasData ? 'text-slate-400' : 'text-indigo-900'}`}>Auto-Tune Model</span>
                  </>
                )}
              </div>
            </button>
            <p className="text-[9px] text-slate-400 mt-2 text-center">
              Uses AI to find parameters that minimize AIC.
            </p>
          </div>

          <div className="space-y-6">
            {/* ARIMA Parameters */}
            <section>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Trend (Non-Seasonal)
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600 flex items-center">
                    AR (p) 
                    <Tooltip title="Autoregressive (p)" text="The number of lag observations included in the model. Uses past values to predict future ones." />
                  </label>
                  <input
                    type="number" min="0" max="10"
                    value={params.p}
                    onChange={(e) => handleChange('p', parseInt(e.target.value) || 0)}
                    className="w-12 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono text-center focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600 flex items-center">
                    Diff (d)
                    <Tooltip title="Differencing (d)" text="The number of times raw observations are differenced to make data stationary (removing trends)." />
                  </label>
                  <input
                    type="number" min="0" max="10"
                    value={params.d}
                    onChange={(e) => handleChange('d', parseInt(e.target.value) || 0)}
                    className="w-12 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono text-center focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600 flex items-center">
                    MA (q)
                    <Tooltip title="Moving Average (q)" text="The size of the moving average window. Uses past forecast errors to improve current predictions." />
                  </label>
                  <input
                    type="number" min="0" max="10"
                    value={params.q}
                    onChange={(e) => handleChange('q', parseInt(e.target.value) || 0)}
                    className="w-12 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono text-center focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                  />
                </div>
              </div>
            </section>

            {/* SARIMA Parameters */}
            <section className="pt-4 border-t border-slate-100">
               <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Seasonality
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600 flex items-center">
                    SAR (P)
                    <Tooltip title="Seasonal AR (P)" text="Autoregressive lags for the seasonal component. Relates current value to the same period in previous cycles." />
                  </label>
                  <input
                    type="number" min="0" max="10"
                    value={params.P}
                    onChange={(e) => handleChange('P', parseInt(e.target.value) || 0)}
                    className="w-12 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono text-center focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600 flex items-center">
                     SDiff (D)
                     <Tooltip title="Seasonal Diff (D)" text="Number of seasonal differences. Eg: subtracting this January's sales from last January's sales." />
                  </label>
                  <input
                    type="number" min="0" max="10"
                    value={params.D}
                    onChange={(e) => handleChange('D', parseInt(e.target.value) || 0)}
                    className="w-12 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono text-center focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600 flex items-center">
                    SMA (Q)
                    <Tooltip title="Seasonal MA (Q)" text="Seasonal Moving Average order. Models seasonal error structures." />
                  </label>
                  <input
                    type="number" min="0" max="10"
                    value={params.Q}
                    onChange={(e) => handleChange('Q', parseInt(e.target.value) || 0)}
                    className="w-12 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono text-center focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <label className="text-xs font-semibold text-slate-600 flex items-center">
                    Period (s)
                    <Tooltip title="Seasonality Period (s)" text="The length of the seasonal cycle (e.g., 12 for monthly, 4 for quarterly, 7 for weekly)." />
                  </label>
                  <input
                    type="number" min="0" max="365"
                    value={params.s}
                    onChange={(e) => handleChange('s', parseInt(e.target.value) || 0)}
                    className="w-12 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono text-center focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-auto pt-6">
          <h4 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
            Quick Presets
          </h4>
          <div className="space-y-1">
            {[
              { name: 'Random Walk', p: 0, d: 1, q: 0 },
              { name: 'Exponential Smoothing', p: 0, d: 1, q: 1 },
              { name: 'Autoregressive', p: 2, d: 0, q: 0 },
            ].map((preset) => (
              <button
                key={preset.name}
                onClick={() => setParams(prev => ({ ...prev, ...preset }))}
                className="w-full text-left text-xs text-slate-600 hover:text-indigo-600 hover:bg-slate-50 px-2 py-1.5 rounded transition-colors flex items-center justify-between group"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
