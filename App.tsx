
import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart } from 'recharts';
import { Activity, Upload, Settings, TrendingUp, BarChart2, Info, RefreshCw, AlertCircle, Trash2 } from 'lucide-react';
import { DataPoint, ModelParams, AnalysisResult, ChartData } from './types';
import { runArimaAnalysis } from './services/arimaService';
import { ParameterSidebar } from './components/ParameterSidebar';
import { DataUploader } from './components/DataUploader';
import { StatsSummary } from './components/StatsSummary';

const DEFAULT_PARAMS: ModelParams = {
  p: 1, d: 1, q: 1,
  P: 0, D: 0, Q: 0, s: 0
};

const App: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [params, setParams] = useState<ModelParams>(DEFAULT_PARAMS);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDataUpload = (uploadedData: DataPoint[]) => {
    setData(uploadedData);
    setResult(null);
    setError(null);
  };

  const handleClear = () => {
    setData([]);
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
      const analysis = await runArimaAnalysis(data, params);
      setResult(analysis);
    } catch (err) {
      setError("Failed to generate forecast. Check your parameters or data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData: ChartData[] = React.useMemo(() => {
    if (!data.length) return [];
    
    const combined: ChartData[] = data.map(d => ({
      timestamp: d.date,
      actual: d.value,
    }));

    if (result) {
      result.forecast.forEach(f => {
        combined.push({
          timestamp: f.date,
          forecast: f.value,
          lower: f.lower,
          upper: f.upper,
        });
      });
    }

    return combined;
  }, [data, result]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">ARIMA Forecast Machine</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Predictive Analytics Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {data.length > 0 && (
            <button 
              onClick={handleClear}
              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Clear current dataset"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={handleAnalyze}
            disabled={loading || data.length === 0}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 ${
              loading || data.length === 0 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95'
            }`}
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
            {loading ? 'Processing...' : 'Run Analysis'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <ParameterSidebar 
          params={params} 
          setParams={setParams} 
          hasData={data.length > 0} 
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {!data.length && (
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 text-center shadow-xl shadow-slate-200/50 mt-10">
                <div className="mx-auto w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-8 rotate-3 hover:rotate-0 transition-transform">
                  <Upload className="w-10 h-10 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-3">Welcome to the Forecasting Machine</h2>
                <p className="text-slate-500 mb-10 max-w-lg mx-auto leading-relaxed">
                  Start by uploading your time-series data or try one of our pre-built datasets below to see the machine in action.
                </p>
                <DataUploader onUpload={handleDataUpload} />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold">Analysis Error</p>
                  <p className="text-sm opacity-90">{error}</p>
                </div>
              </div>
            )}

            {data.length > 0 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Stats Summary Cards */}
                <StatsSummary result={result} dataCount={data.length} />

                {/* Main Visualization */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 relative overflow-hidden">
                  {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin" />
                        <Activity className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <p className="font-bold text-slate-800 animate-pulse">Running ARIMA Simulations...</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Forecast Visualization</h3>
                      <p className="text-sm text-slate-500">Time-series decomposition & projected values</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-xl">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-sm shadow-indigo-300"></div> Historical
                      </span>
                      <span className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-xl">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-300"></div> Model Forecast
                      </span>
                    </div>
                  </div>

                  <div className="h-[450px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="timestamp" 
                          stroke="#94a3b8" 
                          fontSize={11} 
                          fontWeight={600}
                          tickLine={false} 
                          axisLine={false} 
                          dy={15}
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          fontSize={11} 
                          fontWeight={600}
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(val) => val.toLocaleString()}
                          dx={-5}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                            padding: '12px'
                          }}
                        />
                        <Legend verticalAlign="top" align="left" height={40} iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 600 }} />
                        
                        <Area 
                          type="monotone" 
                          dataKey="upper" 
                          stroke="none" 
                          fill="#10b981" 
                          fillOpacity={0.08} 
                          name="CI Upper"
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

                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="#4f46e5" 
                          strokeWidth={4} 
                          dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} 
                          activeDot={{ r: 7, strokeWidth: 0 }} 
                          name="Historical Data"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="forecast" 
                          stroke="#10b981" 
                          strokeWidth={4} 
                          strokeDasharray="8 6"
                          dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
                          name="ARIMA Prediction"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Analysis Insights */}
                {result && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-6 text-indigo-600 font-bold uppercase text-xs tracking-widest">
                        <BarChart2 className="w-4 h-4" />
                        Model Efficiency
                      </div>
                      <div className="space-y-6">
                        <p className="text-slate-600 text-sm leading-relaxed">
                          Currently fitting a <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-bold">SARIMA({params.p},{params.d},{params.q})({params.P},{params.D},{params.Q})_{params.s}</span> process to the imported series.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-tighter">AIC (Akaike)</span>
                            <span className="text-xl font-black text-slate-800">{result.diagnostics.aic.toFixed(2)}</span>
                          </div>
                          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-tighter">Stationarity</span>
                            <span className={`text-sm font-bold ${result.diagnostics.stationarity.includes('Stationary') ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {result.diagnostics.stationarity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-6 text-indigo-600 font-bold uppercase text-xs tracking-widest">
                        <Info className="w-4 h-4" />
                        AI Interpretation
                      </div>
                      <div className="text-slate-600 text-sm leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                        {result.insights}
                      </div>
                    </div>
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
