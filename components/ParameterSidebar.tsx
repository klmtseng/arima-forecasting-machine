
import React from 'react';
import { Settings, HelpCircle, ChevronRight, Sliders, PlayCircle, History } from 'lucide-react';
import { ModelParams } from '../types';

interface ParameterSidebarProps {
  params: ModelParams;
  setParams: React.Dispatch<React.SetStateAction<ModelParams>>;
  hasData: boolean;
  mode: 'forecast' | 'backtest';
  setMode: (mode: 'forecast' | 'backtest') => void;
  splitRatio: number;
  setSplitRatio: (ratio: number) => void;
  dataLength: number;
}

export const ParameterSidebar: React.FC<ParameterSidebarProps> = ({ 
  params, 
  setParams, 
  hasData,
  mode,
  setMode,
  splitRatio,
  setSplitRatio,
  dataLength
}) => {
  const handleChange = (key: keyof ModelParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const trainCount = Math.floor(dataLength * splitRatio);
  const testCount = dataLength - trainCount;

  return (
    <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto hidden md:block flex-shrink-0">
      <div className="p-6 space-y-8">
        
        {/* Mode Selector */}
        <div className="bg-slate-100 p-1 rounded-xl flex">
          <button
            onClick={() => setMode('forecast')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'forecast' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Forecast
          </button>
          <button
            onClick={() => setMode('backtest')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'backtest' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Backtest
          </button>
        </div>

        {/* Backtest Controls */}
        {mode === 'backtest' && hasData && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 animate-in slide-in-from-top-2 duration-300">
             <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Historical Validation</h3>
                <span className="text-[10px] font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                  {Math.round(splitRatio * 100)}% Train
                </span>
             </div>
             <input 
                type="range" 
                min="0.5" 
                max="0.9" 
                step="0.05"
                value={splitRatio}
                onChange={(e) => setSplitRatio(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
             />
             <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-medium">
               <span>Train: {trainCount}</span>
               <span>Test: {testCount}</span>
             </div>
             <p className="mt-3 text-[10px] text-slate-400 leading-normal">
               The model is trained on the first <strong>{trainCount}</strong> points and validated against the remaining <strong>{testCount}</strong> known historical points to check accuracy.
             </p>
          </div>
        )}

        <hr className="border-slate-100" />

        <div>
          <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <h2>Model Configuration</h2>
          </div>

          <div className="space-y-6">
            {/* ARIMA Parameters */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                Non-Seasonal (p,d,q)
                <HelpCircle className="w-3.5 h-3.5 cursor-help" />
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {(['p', 'd', 'q'] as const).map((param) => (
                  <div key={param}>
                    <label className="text-xs font-medium text-slate-500 block mb-1.5 uppercase">{param}</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={params[param]}
                      onChange={(e) => handleChange(param, parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* SARIMA Parameters */}
            <section className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                Seasonal (P,D,Q,s)
                <HelpCircle className="w-3.5 h-3.5 cursor-help" />
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {(['P', 'D', 'Q'] as const).map((param) => (
                    <div key={param}>
                      <label className="text-xs font-medium text-slate-500 block mb-1.5 uppercase">{param}</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={params[param]}
                        onChange={(e) => handleChange(param, parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1.5 uppercase">Seasonality Period (s)</label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={params.s}
                    onChange={(e) => handleChange('s', parseInt(e.target.value) || 0)}
                    placeholder="e.g., 12 for Monthly"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-2">Use 12 for monthly, 4 for quarterly data.</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
          <h4 className="text-xs font-bold text-indigo-700 mb-2 uppercase flex items-center gap-2">
            <Settings className="w-3 h-3" /> Machine Presets
          </h4>
          <div className="space-y-2">
            {[
              { name: 'Random Walk', p: 0, d: 1, q: 0 },
              { name: 'Pure AR(2)', p: 2, d: 0, q: 0 },
              { name: 'Pure MA(1)', p: 0, d: 0, q: 1 },
            ].map((preset) => (
              <button
                key={preset.name}
                onClick={() => setParams(prev => ({ ...prev, ...preset }))}
                className="w-full text-left text-xs text-indigo-600 font-medium hover:bg-indigo-100 p-2 rounded-lg transition-colors flex items-center justify-between group"
              >
                {preset.name}
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
