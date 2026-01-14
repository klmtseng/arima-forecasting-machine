
import React, { useState, useMemo, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart, ReferenceLine, Label, Brush 
} from 'recharts';
import { 
  Activity, Upload, Settings, TrendingUp, BarChart2, Info, RefreshCw, AlertCircle, Trash2, BookOpen, Target, ChevronRight, CheckCircle2, AlertTriangle, XCircle, History, Database, FileText, Microscope, Calendar, Sigma, MoveHorizontal 
} from 'lucide-react';
import { DataPoint, ModelParams, AnalysisResult, ChartData, DatasetStats } from './types';
import { runArimaAnalysis, getDescriptiveStats } from './services/arimaService';
import { ParameterSidebar } from './components/ParameterSidebar';
import { DataUploader } from './components/DataUploader';
import { MacroDataSelector } from './components/MacroDataSelector';
import { StatsSummary } from './components/StatsSummary';
import { ModelGuide } from './components/ModelGuide';

const DEFAULT_PARAMS: ModelParams = {
  p: 1, d: 1, q: 1,
  P: 0, D: 0, Q: 0, s: 0
};

const App: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [datasetStats, setDatasetStats] = useState<DatasetStats | null>(null);
  const [params, setParams] = useState<ModelParams>(DEFAULT_PARAMS);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  
  // Validation / Backtest State
  const [mode, setMode] = useState<'forecast' | 'backtest'>('forecast');
  const [splitRatio, setSplitRatio] = useState(0.8);

  // Initialization Mode
  const [initTab, setInitTab] = useState<'upload' | 'macro'>('macro');
  const [datasetName, setDatasetName] = useState<string>('');

  const handleDataLoad = (loadedData: DataPoint[], name: string) => {
    setData(loadedData);
    setDatasetName(name);
    setDatasetStats(getDescriptiveStats(loadedData));
    setResult(null);
    setError(null);
  };

  const handleClear = () => {
    setData([]);
    setDatasetName('');
    setDatasetStats(null);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (data.length < 5) {
      setError("Please provide at least 5 data points for analysis.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      let analysisInputData = data;
      let steps = 12;
      let splitIndex = -1;

      if (mode === 'backtest') {
        splitIndex = Math.floor(data.length * splitRatio);
        analysisInputData = data.slice(0, splitIndex); // Train on first portion
        steps = data.length - splitIndex; // Predict the rest
      }

      const analysis = await runArimaAnalysis(analysisInputData, params, steps);
      
      // If backtesting, calculate accuracy metrics and align dates
      if (mode === 'backtest' && splitIndex > 0) {
        const testSet = data.slice(splitIndex);
        
        // 1. Align forecast dates to actual test set dates (Gemini might guess wrong dates)
        const alignedForecast = analysis.forecast.map((f, i) => {
          if (testSet[i]) {
            return { ...f, date: testSet[i].date };
          }
          return f;
        });
        analysis.forecast = alignedForecast;

        // 2. Calculate Metrics
        let sumAbsErr = 0;
        let sumSqErr = 0;
        let sumAbsPctErr = 0;
        let count = 0;

        for (let i = 0; i < alignedForecast.length; i++) {
          const predicted = alignedForecast[i].value;
          const actual = testSet[i]?.value;

          if (actual !== undefined && !isNaN(actual)) {
            const err = actual - predicted;
            sumAbsErr += Math.abs(err);
            sumSqErr += err * err;
            if (actual !== 0) {
              sumAbsPctErr += Math.abs(err / actual);
            }
            count++;
          }
        }

        if (count > 0) {
          analysis.metrics = {
            mae: sumAbsErr / count,
            rmse: Math.sqrt(sumSqErr / count),
            mape: (sumAbsPctErr / count) * 100
          };
        }
      }

      setResult(analysis);
    } catch (err) {
      setError("Failed to generate forecast. Check your parameters or data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get the cutoff date string for ReferenceLine
  const splitDate = useMemo(() => {
    if (mode !== 'backtest' || !data.length) return null;
    const idx = Math.floor(data.length * splitRatio);
    return data[idx]?.date;
  }, [data, splitRatio, mode]);

  const chartData: ChartData[] = useMemo(() => {
    if (!data.length) return [];
    
    // Determine split index for visualization
    const splitIdx = mode === 'backtest' ? Math.floor(data.length * splitRatio) : data.length;

    // Construct base data
    const combined: ChartData[] = data.map((d, i) => ({
      timestamp: d.date,
      // If backtest, split actual into train/test lines for visual distinction
      trainValue: mode === 'backtest' ? (i < splitIdx ? d.value : undefined) : undefined,
      testValue: mode === 'backtest' ? (i >= splitIdx - 1 ? d.value : undefined) : undefined, // overlap slightly to connect lines
      actual: mode === 'forecast' ? d.value : undefined, // regular mode
    }));

    if (result) {
      result.forecast.forEach((f, i) => {
        // Find if we have an existing entry for this date (Backtest mode)
        const existingIdx = combined.findIndex(c => c.timestamp === f.date);
        
        const dataPoint = {
          forecast: f.value,
          lower: f.lower,
          upper: f.upper,
        };

        if (existingIdx >= 0) {
          // Merge with existing actual data
          combined[existingIdx] = { ...combined[existingIdx], ...dataPoint };
        } else {
          // Append new future point
          combined.push({
            timestamp: f.date,
            actual: undefined, 
            trainValue: undefined,
            testValue: undefined,
            ...dataPoint
          });
        }
      });
    }

    return combined;
  }, [data, result, mode, splitRatio]);

  // Helper to determine stability rating based on MAPE
  const getStabilityRating = (mape: number) => {
    if (mape < 10) return { label: 'High Stability', color: 'text-emerald-400', icon: CheckCircle2 };
    if (mape < 25) return { label: 'Moderate', color: 'text-yellow-400', icon: AlertTriangle };
    return { label: 'Low Stability', color: 'text-red-400', icon: XCircle };
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden text-slate-900 font-sans">
      <ModelGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Professional Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 text-white rounded flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">QuantForecast<span className="text-slate-400 font-light">.ai</span></h1>
            {datasetName && <span className="text-[10px] text-slate-500 font-mono block">SRC: {datasetName}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-transparent hover:border-slate-200 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            Model Reference
          </button>
          <div className="h-5 w-px bg-slate-300 mx-1"></div>
          {data.length > 0 && (
            <button 
              onClick={handleClear}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
              title="Clear Data"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={handleAnalyze}
            disabled={loading || data.length === 0}
            className={`flex items-center gap-2 px-5 py-2 rounded font-bold text-xs uppercase tracking-wide transition-all duration-200 ${
              loading || data.length === 0 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md active:translate-y-0.5'
            }`}
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5" />}
            {loading ? 'Processing...' : (mode === 'backtest' ? 'Run Validation' : 'Compute Forecast')}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <ParameterSidebar 
          params={params} 
          setParams={setParams} 
          hasData={data.length > 0} 
          mode={mode}
          setMode={setMode}
          splitRatio={splitRatio}
          setSplitRatio={setSplitRatio}
          dataLength={data.length}
          data={data}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-100">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {!data.length && (
              <div className="bg-white border border-slate-200 rounded-lg p-8 text-center shadow-sm mt-8 max-w-4xl mx-auto">
                <div className="mx-auto w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Database className="w-8 h-8 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Macroeconomic Research Terminal</h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                   Connect to live global databases (FRED, World Bank, BLS) or upload proprietary datasets for ARIMA/SARIMA modelling.
                </p>
                
                {/* Initialization Tabs */}
                <div className="mb-8 flex justify-center">
                  <div className="bg-slate-100 p-1 rounded-lg inline-flex">
                    <button
                      onClick={() => setInitTab('macro')}
                      className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${
                        initTab === 'macro' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Database className="w-4 h-4" /> Live Macro Data
                    </button>
                    <button
                      onClick={() => setInitTab('upload')}
                      className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${
                        initTab === 'upload' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <FileText className="w-4 h-4" /> CSV Upload / Sample
                    </button>
                  </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-2">
                   {initTab === 'macro' ? (
                     <MacroDataSelector onDataLoaded={handleDataLoad} />
                   ) : (
                     <DataUploader onUpload={(d) => handleDataLoad(d, "Uploaded Dataset")} />
                   )}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 text-red-700 shadow-sm rounded-r">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm">System Error</p>
                  <p className="text-sm opacity-90">{error}</p>
                </div>
              </div>
            )}

            {data.length > 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* WORKBENCH: Data Context Bar */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                     <Microscope className="w-4 h-4 text-indigo-500" />
                     <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Data Workbench</h3>
                  </div>
                  
                  {datasetStats && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="p-3 bg-slate-50 rounded border border-slate-100">
                         <div className="flex items-center gap-2 text-slate-500 mb-1">
                            <Calendar className="w-3 h-3" /> <span className="text-[10px] uppercase font-bold">Range</span>
                         </div>
                         <div className="font-mono text-xs font-semibold text-slate-800 truncate">
                            {data[0]?.date} <span className="text-slate-400">to</span> {data[data.length-1]?.date}
                         </div>
                      </div>
                      
                      <div className="p-3 bg-slate-50 rounded border border-slate-100">
                         <div className="flex items-center gap-2 text-slate-500 mb-1">
                            <Sigma className="w-3 h-3" /> <span className="text-[10px] uppercase font-bold">Mean</span>
                         </div>
                         <div className="font-mono text-lg font-bold text-slate-800">
                            {datasetStats.mean.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                         </div>
                      </div>

                       <div className="p-3 bg-slate-50 rounded border border-slate-100">
                         <div className="flex items-center gap-2 text-slate-500 mb-1">
                            <MoveHorizontal className="w-3 h-3" /> <span className="text-[10px] uppercase font-bold">Range (Min/Max)</span>
                         </div>
                         <div className="font-mono text-xs font-semibold text-slate-800">
                            L: {datasetStats.min.toLocaleString()} / H: {datasetStats.max.toLocaleString()}
                         </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded border border-slate-100">
                         <div className="flex items-center gap-2 text-slate-500 mb-1">
                            <Activity className="w-3 h-3" /> <span className="text-[10px] uppercase font-bold">Volatility</span>
                         </div>
                         <div className={`font-mono text-lg font-bold ${datasetStats.volatility > 20 ? 'text-amber-600' : 'text-slate-800'}`}>
                            {datasetStats.volatility.toFixed(1)}%
                         </div>
                      </div>
                      
                      <div className="p-3 bg-indigo-50/50 rounded border border-indigo-100 flex flex-col justify-center items-center text-center">
                         <span className="text-[10px] text-indigo-400 uppercase font-bold mb-1">Status</span>
                         <span className="text-xs font-bold text-indigo-700">
                           {result ? 'Analysis Complete' : 'Ready to Forecast'}
                         </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Backtest Metrics Panel (Only shows AFTER analysis) */}
                {result?.metrics && mode === 'backtest' && (
                  <div className="bg-slate-800 text-white p-6 rounded-lg shadow-md flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-700 rounded-lg">
                        <Target className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-100 uppercase tracking-wider">Backtest Validation</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs">
                          Model performance on the hidden test set. Lower percentages indicate higher predictive stability.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-8 items-center border-l border-slate-700 pl-8">
                       <div className="text-right">
                        <div className="flex items-center justify-end gap-2 mb-1">
                          {(() => {
                            const stability = getStabilityRating(result.metrics.mape);
                            const Icon = stability.icon;
                            return (
                              <>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${stability.color}`}>{stability.label}</span>
                                <Icon className={`w-3 h-3 ${stability.color}`} />
                              </>
                            );
                          })()}
                        </div>
                        <div className="text-3xl font-mono font-bold text-white">{result.metrics.mape.toFixed(2)}%</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Mean Abs % Error (MAPE)</div>
                      </div>

                      <div className="text-right hidden sm:block">
                        <div className="text-3xl font-mono font-bold text-slate-300">{result.metrics.rmse.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">RMSE</div>
                      </div>

                      <div className="text-right hidden sm:block">
                        <div className="text-3xl font-mono font-bold text-slate-300">{result.metrics.mae.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">MAE</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Visualization Workbench */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 relative overflow-hidden">
                  {loading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <RefreshCw className="w-10 h-10 text-slate-800 animate-spin" />
                      </div>
                      <p className="font-mono text-xs font-bold text-slate-600 uppercase tracking-widest">Running Computational Models...</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">
                        {result ? (mode === 'backtest' ? 'Backtest Rolling Origin' : 'Forecast Trajectory') : 'Visual Analysis'}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-1">
                        {result ? `MODEL: SARIMA(${params.p},${params.d},${params.q})(${params.P},${params.D},${params.Q})_${params.s}` : 'Raw Time Series Visualization'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
                        <div className="w-2 h-2 rounded-full bg-slate-900"></div> 
                        {mode === 'backtest' ? 'TRAINING HISTORY' : 'HISTORY'}
                      </span>
                      {mode === 'backtest' && (
                        <span className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
                          <div className="w-2 h-2 rounded-full bg-slate-400"></div> VALIDATION
                        </span>
                      )}
                      {result && (
                        <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-100">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> PROJECTION
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="timestamp" 
                          stroke="#64748b" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                          dy={10}
                          minTickGap={30}
                        />
                        <YAxis 
                          stroke="#64748b" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(val) => val.toLocaleString()}
                          dx={-10}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '4px', 
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            fontSize: '12px',
                            fontFamily: 'monospace'
                          }}
                        />
                        <Legend verticalAlign="top" align="right" height={36} iconType="rect" wrapperStyle={{ fontSize: '10px', fontWeight: 600, opacity: 0 }} />
                        
                        {/* Reference Line for Split */}
                        {splitDate && (
                          <ReferenceLine 
                            x={splitDate} 
                            stroke="#dc2626" 
                            strokeDasharray="3 3" 
                            strokeWidth={1.5}
                            label={{ 
                              position: 'top', 
                              value: 'CUTOFF', 
                              fill: '#dc2626', 
                              fontSize: 10, 
                              fontWeight: 'bold', 
                              dy: -10 
                            }} 
                          />
                        )}

                        <Brush 
                            dataKey="timestamp" 
                            height={20} 
                            stroke="#cbd5e1" 
                            fill="#f8fafc" 
                            tickFormatter={() => ''}
                            travellerWidth={10}
                        />

                        {result && (
                            <>
                                <Area 
                                type="monotone" 
                                dataKey="upper" 
                                stroke="none" 
                                fill="#10b981" 
                                fillOpacity={0.1} 
                                legendType="none"
                                />
                                <Area 
                                type="monotone" 
                                dataKey="lower" 
                                stroke="none" 
                                fill="#ffffff" 
                                fillOpacity={1} 
                                legendType="none"
                                />
                            </>
                        )}

                        {/* Standard History (Forecast Mode) */}
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          name="Historical Data"
                          stroke="#0f172a" 
                          strokeWidth={2} 
                          dot={false}
                          activeDot={{ r: 4 }} 
                        />

                        {/* Backtest Training Portion */}
                        <Line 
                          type="monotone" 
                          dataKey="trainValue" 
                          name="Training Window"
                          stroke="#0f172a" 
                          strokeWidth={2} 
                          dot={false}
                        />

                        {/* Backtest Validation Portion (Dashed) */}
                        <Line 
                          type="monotone" 
                          dataKey="testValue" 
                          name="Future (Test Data)"
                          stroke="#94a3b8" 
                          strokeWidth={2} 
                          strokeDasharray="3 3"
                          dot={false} 
                        />

                        <Line 
                          type="monotone" 
                          dataKey="forecast" 
                          name="Model Prediction"
                          stroke="#10b981" 
                          strokeWidth={2} 
                          dot={{ r: 3, fill: '#10b981', strokeWidth: 1, stroke: '#fff' }} 
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Analysis Insights & Stats - Only show if Result exists */}
                {result ? (
                  <>
                    <StatsSummary result={result} dataCount={data.length} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2">
                         <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm col-span-1">
                            <h4 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                               <BarChart2 className="w-4 h-4 text-slate-400" /> Statistical Diagnostics
                            </h4>
                            <div className="space-y-4">
                               <div className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                                  <span className="text-xs font-semibold text-slate-500">AIC Score</span>
                                  <span className="font-mono font-bold text-slate-900">{result.diagnostics.aic.toFixed(2)}</span>
                               </div>
                               <div className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                                  <span className="text-xs font-semibold text-slate-500">BIC Score</span>
                                  <span className="font-mono font-bold text-slate-900">{result.diagnostics.bic.toFixed(2)}</span>
                               </div>
                               <div className="p-3 bg-slate-50 rounded border border-slate-100">
                                  <span className="text-xs font-semibold text-slate-500 block mb-1">Stationarity Check</span>
                                  <span className={`text-xs font-bold ${result.diagnostics.stationarity.includes('Stationary') ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {result.diagnostics.stationarity}
                                  </span>
                               </div>
                            </div>
                         </div>

                         <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm col-span-2">
                            <h4 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                               <Info className="w-4 h-4 text-slate-400" /> Automated Model Interpretation
                            </h4>
                            <div className="prose prose-sm prose-slate max-w-none text-xs leading-relaxed text-slate-600">
                               {result.insights}
                            </div>
                         </div>
                      </div>
                  </>
                ) : (
                    /* Placeholder for Results when in Workbench mode but no analysis run yet */
                    <div className="bg-slate-50 border border-slate-200 border-dashed rounded-lg p-8 text-center">
                        <div className="inline-flex p-3 bg-white rounded-full shadow-sm mb-3">
                            <TrendingUp className="w-5 h-5 text-slate-300" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-600">Ready to Analyze</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                            Configure your ARIMA parameters in the sidebar or click "Auto-Tune" to generate a forecast model.
                        </p>
                    </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
