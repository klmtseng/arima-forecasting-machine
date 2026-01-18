
import React, { useState } from 'react';
import { Settings, HelpCircle, ChevronRight, Sliders, PlayCircle, History, Info, Wand2, Sparkles, Loader2, Microscope, Sigma, Activity, MoveHorizontal, Calendar } from 'lucide-react';
import { ModelParams, DataPoint, DatasetStats } from '../types';
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
  data: DataPoint[];
  datasetStats: DatasetStats | null; // Added stats prop
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
  data,
  datasetStats
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
    } finally {
      setIsOptimizing(false);
    }
  };

  const trainCount = Math.floor(dataLength * splitRatio);
  const testCount = dataLength - trainCount;

  return (
    <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto hidden md:flex flex-col flex-shrink-0 z-10 shadow-lg">
      <div className="p-4 space-y-6">
        
        {/* WORKBENCH STATS SECTION */}
        {hasData && datasetStats && (
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 space-y-3 animate-in slide-in-from-left-2">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
               <Microscope className="w-4 h-4 text-indigo-600" />
               <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Data Workbench</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-white rounded border border-slate-100">
                 <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Sigma className="w-3 h-3" /> <span className="text-[9px] uppercase font-bold">Mean</span>
                 </div>
                 <div className="font-mono text-sm font-bold text-slate-800">
                    {datasetStats.mean.toLocaleString(undefined, { maximumFractionDigits: 1, notation: "compact" })}
                 </div>
              </div>
              
              <div className="p-2 bg-white rounded border border-slate-100">
                 <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Activity className="w-3 h-3" /> <span className="text-[9px] uppercase font-bold">Volatility</span>
                 </div>
                 <div className={`font-mono text-sm font-bold ${datasetStats.volatility > 20 ? 'text-amber-600' : 'text-slate-800'}`}>
                    {datasetStats.volatility.toFixed(1)}%
                 </div>
              </div>

               <div className="p-2 bg-white rounded border border-slate-100 col-span-2">
                 <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <MoveHorizontal className="w-3 h-3" /> <span className="text-[9px] uppercase font-bold">Min / Max</span>
                 </div>
                 <div className="font-mono text-xs font-semibold text-slate-800 flex justify-between">
                    <span>{datasetStats.min.toLocaleString(undefined, { maximumFractionDigits: 1, notation: "compact" })}</span>
                    <span className="text-slate-300">|</span>
                    <span>{datasetStats.max.toLocaleString(undefined, { maximumFractionDigits: 1, notation: "compact" })}</span>
                 </div>
              </div>

              <div className="p-2 bg-white rounded border border-slate-100 col-span-2">
                 <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Calendar className="w-3 h-3" /> <span className="text-[9px] uppercase font-bold">Date Range</span>
                 </div>
                 <div className="font-mono text-[10px] font-medium text-slate-600 truncate">
                    {data[0]?.date} → {data[data.length-1]?.date}
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* Mode Selector */}
        <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operation Mode</h3>
            <div className="bg-slate-100 p-1 rounded-lg flex">
              <button
                onClick={() => setMode('forecast')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded transition-all ${
                  mode === 'forecast' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <PlayCircle className="w-3.5 h-3.5" />
                Forecast
              </button>
              <button
                onClick={() => setMode('backtest')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded transition-all ${
                  mode === 'backtest' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Backtest
              </button>
            </div>
        </div>

        {/* Backtest Controls */}
        {mode === 'backtest' && hasData && (
          <div className="bg-indigo-50/50 p-3 rounded border border-indigo-100 animate-in slide-in-from-top-2 duration-300">
             <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Training Split</h3>
                <span className="text-[10px] font-mono bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
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
                className="w-full h-1.5 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-2"
             />
             <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-medium">
               <div className="bg-white px-2 py-1 rounded border border-indigo-100 text-center">
                  <span className="block text-indigo-300 text-[9px] uppercase">Train</span>
                  <span className="font-mono font-bold text-indigo-900">{trainCount}</span>
               </div>
               <div className="bg-white px-2 py-1 rounded border border-indigo-100 text-center">
                  <span className="block text-indigo-300 text-[9px] uppercase">Test</span>
                  <span className="font-mono font-bold text-indigo-900">{testCount}</span>
               </div>
             </div>
          </div>
        )}

        <hr className="border-slate-100" />

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Sliders className="w-4 h-4 text-slate-500" />
              <h2>Model Settings</h2>
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
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                  <label className="text-xs font-semibold text-slate-600 flex items-center">
                    AR (p) 
                    <Tooltip title="Autoregressive (p)" text="The number of lag observations included in the model. Uses past values to predict future ones." />
                  </label>
                  <input
                    type="number" min="0" max="10"
                    value={params.p}
                    onChange={(e) => handleChange('p', parseInt(e.target.value) || 0)}
                    className="w-12 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono text-center focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                  <label className="text-xs font-semibold text-slate-600 flex items-center">
                    Diff (d)
                    <Tooltip title="Differencing (d)" text="The number of times raw observations are differenced to make data stationary (removing trends)." />
                  </label>
                  <input
                    type="number" min="0" max="10"
                    value={params.d}
                    onChange={(e) => handleChange('d', parseInt(e.target.value) || 0)}
                    className="w-12 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono text-center focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                  <label className="text-xs font-semibold text-slate-600 flex items-center">
                    MA (q)
                    <Tooltip title="Moving Average (q)" text="The size of the moving average window. Uses past forecast errors to improve current predictions." />
                  </label>
                  <input
                    type="number" min="0" max="10"
                    value={params.q}
                    onChange={(e) => handleChange('q', parseInt(e.target.value) || 0)}
                    className="w-12 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono text-center focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
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
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                  <label className="text-xs font-semibold text-slate-600 flex items-center">
                    SAR (P)
                    <Tooltip title="Seasonal AR (P)" text="Autoregressive lags for the seasonal component. Relates current value to the same period in previous cycles." />
                  </label>
                  <input
                    type="number" min="0" max="10"
                    value={params.P}
                    onChange={(e) => handleChange('P', parseInt(e.target.value) || 0)}
                    className="w-12 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono text-center focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm"
                  />
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                  <label className="text-xs font-semibold text-slate-600 flex items-center">
                     SDiff (D)
                     <Tooltip title="Seasonal Diff (D)" text="Number of seasonal differences. Eg: subtracting this January's sales from last January's sales." />
                  </label>
                  <input
                    type="number" min="0" max="10"
                    value={params.D}
                    onChange={(e) => handleChange('D', parseInt(e.target.value) || 0)}
                    className="w-12 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono text-center focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm"
                  />
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                  <label className="text-xs font-semibold text-slate-600 flex items-center">
                    SMA (Q)
                    <Tooltip title="Seasonal MA (Q)" text="Seasonal Moving Average order. Models seasonal error structures." />
                  </label>
                  <input
                    type="number" min="0" max="10"
                    value={params.Q}
                    onChange={(e) => handleChange('Q', parseInt(e.target.value) || 0)}
                    className="w-12 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono text-center focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm"
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
                    className="w-12 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono text-center focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </aside>
  );
};
