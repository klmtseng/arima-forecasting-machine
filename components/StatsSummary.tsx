
import React from 'react';
import { Database, Zap, Compass, CheckCircle2 } from 'lucide-react';
import { AnalysisResult } from '../types';

interface StatsSummaryProps {
  result: AnalysisResult | null;
  dataCount: number;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ result, dataCount }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Database className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Historical Load</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-800">{dataCount}</span>
          <span className="text-xs text-slate-400">Points</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
            <Zap className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Akaike Criterion</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-800">{result?.diagnostics.aic.toFixed(1) || 'N/A'}</span>
          <span className="text-xs text-slate-400">AIC</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Model Status</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${result ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
          <span className="text-sm font-semibold text-slate-700">{result ? 'Calibrated' : 'Idle'}</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Drift Detection</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-semibold text-slate-700">{result?.diagnostics.stationarity || 'Unknown'}</span>
        </div>
      </div>
    </div>
  );
};
