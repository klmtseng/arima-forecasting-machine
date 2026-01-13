
import React from 'react';
import { Database, Zap, Compass, CheckCircle2, Info } from 'lucide-react';
import { AnalysisResult } from '../types';

interface StatsSummaryProps {
  result: AnalysisResult | null;
  dataCount: number;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ result, dataCount }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white px-5 py-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-24">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dataset Size</span>
          <Database className="w-4 h-4 text-slate-300" />
        </div>
        <div>
           <span className="text-2xl font-mono font-bold text-slate-800">{dataCount}</span>
           <span className="text-xs text-slate-400 ml-1">observations</span>
        </div>
      </div>

      <div className="bg-white px-5 py-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-24 group relative">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
             AIC Score <Info className="w-3 h-3 text-slate-300 hover:text-indigo-500 cursor-help" />
          </span>
          <Zap className="w-4 h-4 text-slate-300" />
        </div>
        <div>
           <span className="text-2xl font-mono font-bold text-slate-800">{result?.diagnostics.aic.toFixed(1) || '--'}</span>
           <span className="text-xs text-slate-400 ml-1">lower is better</span>
        </div>
        {/* Simple CSS Tooltip */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
           Akaike Information Criterion. Estimates prediction error. Lower values indicate a better balance of accuracy and simplicity.
        </div>
      </div>

      <div className="bg-white px-5 py-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-24">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</span>
          <Compass className="w-4 h-4 text-slate-300" />
        </div>
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${result ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
           <span className="text-sm font-bold text-slate-700">{result ? 'Converged' : 'Waiting'}</span>
        </div>
      </div>

      <div className="bg-white px-5 py-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-24">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Series Type</span>
          <CheckCircle2 className="w-4 h-4 text-slate-300" />
        </div>
        <div>
           <span className={`text-sm font-bold truncate block ${result ? 'text-slate-800' : 'text-slate-400'}`}>
             {result?.diagnostics.stationarity || '---'}
           </span>
        </div>
      </div>
    </div>
  );
};
