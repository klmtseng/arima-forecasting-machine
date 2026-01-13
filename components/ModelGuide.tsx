
import React, { useState } from 'react';
import { X, BookOpen, Sigma, Activity, Network, Calculator, CheckCircle2, List, ExternalLink, BarChart2 } from 'lucide-react';

interface ModelGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelGuide: React.FC<ModelGuideProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'arima' | 'evaluation' | 'multivariate' | 'bayesian'>('arima');
  const [arimaSubTab, setArimaSubTab] = useState<'definitions' | 'params' | 'assumptions'>('definitions');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col border border-slate-200 font-sans">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">QuantForecast Reference Model</h2>
              <p className="text-xs text-slate-500">Documentation & Mathematical Definitions</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Main Sidebar Tabs */}
          <div className="w-60 bg-slate-50 border-r border-slate-200 p-3 space-y-1 overflow-y-auto flex-shrink-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3 mt-2">Core Architectures</div>
            <button
              onClick={() => setActiveTab('arima')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-all text-sm font-medium ${
                activeTab === 'arima' 
                  ? 'bg-white shadow-sm text-indigo-700 ring-1 ring-slate-200' 
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>ARIMA Family</span>
            </button>
            <button
              onClick={() => setActiveTab('evaluation')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-all text-sm font-medium ${
                activeTab === 'evaluation' 
                  ? 'bg-white shadow-sm text-indigo-700 ring-1 ring-slate-200' 
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Evaluation & Metrics</span>
            </button>
            <button
              onClick={() => setActiveTab('multivariate')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-all text-sm font-medium ${
                activeTab === 'multivariate' 
                  ? 'bg-white shadow-sm text-indigo-700 ring-1 ring-slate-200' 
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>Multivariate</span>
            </button>
            <button
              onClick={() => setActiveTab('bayesian')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-all text-sm font-medium ${
                activeTab === 'bayesian' 
                  ? 'bg-white shadow-sm text-indigo-700 ring-1 ring-slate-200' 
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <Sigma className="w-4 h-4" />
              <span>Bayesian Methods</span>
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-0 bg-white flex flex-col">
            
            {/* ARIMA Specific Sub-navigation */}
            {activeTab === 'arima' && (
              <div className="flex border-b border-slate-100 px-6 sticky top-0 bg-white/95 backdrop-blur z-10">
                <button 
                  onClick={() => setArimaSubTab('definitions')}
                  className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors ${arimaSubTab === 'definitions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  Definitions & Formulas
                </button>
                <button 
                  onClick={() => setArimaSubTab('params')}
                  className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors ${arimaSubTab === 'params' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  Parameter Dictionary
                </button>
                <button 
                  onClick={() => setArimaSubTab('assumptions')}
                  className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors ${arimaSubTab === 'assumptions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  Statistical Assumptions
                </button>
              </div>
            )}

            <div className="p-8">
              {activeTab === 'arima' && arimaSubTab === 'definitions' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="prose prose-sm prose-slate max-w-none">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-indigo-600" />
                      Model Calculus
                    </h3>
                    <p className="text-slate-600">
                      The ARIMA (AutoRegressive Integrated Moving Average) model is the cornerstone of classical time-series analysis. 
                      It decomposes a time series into three main components: lags of the stationarized series (AR), lags of the forecast errors (MA), 
                      and differencing to enforce stationarity (I).
                    </p>
                  </div>

                  <div className="grid gap-6">
                    {/* AR Model */}
                    <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-800 text-sm">AR(p): AutoRegressive Model</h4>
                        <span className="bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Correlation</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                        A multiple regression with <strong>lagged values</strong> of Y<sub>t</sub> as predictors. 
                        Essentially, Y<sub>t</sub> depends linearly on its own previous values.
                      </p>
                      <div className="bg-white p-3 rounded border border-slate-200 font-mono text-xs text-slate-700 overflow-x-auto">
                        Y<sub>t</sub> = c + ϕ<sub>1</sub>Y<sub>t-1</sub> + ... + ϕ<sub>p</sub>Y<sub>t-p</sub> + ε<sub>t</sub>
                      </div>
                    </div>

                    {/* MA Model */}
                    <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-800 text-sm">MA(q): Moving Average Model</h4>
                        <span className="bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Smoothing</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                        A multiple regression with <strong>lagged forecast errors</strong> as predictors. 
                        It models the error term as a linear combination of error terms occurring in the past.
                      </p>
                      <div className="bg-white p-3 rounded border border-slate-200 font-mono text-xs text-slate-700 overflow-x-auto">
                        Y<sub>t</sub> = μ + ε<sub>t</sub> + θ<sub>1</sub>ε<sub>t-1</sub> + ... + θ<sub>q</sub>ε<sub>t-q</sub>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'arima' && arimaSubTab === 'params' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                   <div className="prose prose-sm prose-slate max-w-none">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <List className="w-5 h-5 text-indigo-600" />
                      Parameter Dictionary
                    </h3>
                    <p className="text-slate-600">
                      Accurate forecasting relies on tuning the orders of the ARIMA process.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-400 transition-colors">
                      <div className="w-8 h-8 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-lg font-mono flex-shrink-0">p</div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm">Lag Order (AR)</h5>
                        <p className="text-xs text-slate-500 mt-1">The number of past observations to regress against.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-400 transition-colors">
                      <div className="w-8 h-8 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-lg font-mono flex-shrink-0">d</div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm">Degree of Differencing (I)</h5>
                        <p className="text-xs text-slate-500 mt-1">The number of times data is subtracted from itself to remove trends (e.g., linear growth).</p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-400 transition-colors">
                      <div className="w-8 h-8 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-lg font-mono flex-shrink-0">q</div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm">Moving Average Order (MA)</h5>
                        <p className="text-xs text-slate-500 mt-1">The size of the moving average window applied to the error terms.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'arima' && arimaSubTab === 'assumptions' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="prose prose-sm prose-slate max-w-none">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                      Statistical Assumptions
                    </h3>
                    <p className="text-slate-600">
                       Violating these assumptions leads to unreliable confidence intervals and poor out-of-sample forecasts.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-white border-l-2 border-slate-900 shadow-sm">
                      <h4 className="font-bold text-slate-800 text-sm">Stationarity</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        The statistical properties (mean, variance) should not change over time. If a stock price is constantly going up, 
                        it is not stationary. We apply differencing (d=1) to fix this.
                      </p>
                    </div>

                    <div className="p-4 bg-white border-l-2 border-slate-900 shadow-sm">
                      <h4 className="font-bold text-slate-800 text-sm">No Autocorrelation in Residuals</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        After fitting the model, the "leftovers" (errors) should look like random white noise. 
                        If there is a pattern in the errors, the model is missing information (needs higher p or q).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'evaluation' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="prose prose-sm prose-slate max-w-none">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-indigo-600" />
                      Evaluation & Metrics
                    </h3>
                    <p className="text-slate-600">
                      Evaluating a time-series model requires two perspectives: **In-sample fit** (how well does it describe history?) and **Out-of-sample accuracy** (can it predict the unknown?).
                    </p>
                  </div>

                  {/* Diagnostic Scores */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Model Fit Diagnostics</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                       <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                          <h5 className="font-bold text-indigo-900 text-sm mb-2">AIC (Akaike Information Criterion)</h5>
                          <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                             Estimates the quality of the model relative to others. It rewards goodness of fit but <strong>penalizes</strong> overfitting (adding too many parameters).
                          </p>
                          <div className="flex items-center gap-2">
                             <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded">Lower is Better</span>
                          </div>
                       </div>
                       <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                          <h5 className="font-bold text-indigo-900 text-sm mb-2">BIC (Bayesian Information Criterion)</h5>
                          <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                             Similar to AIC but imposes a <strong>larger penalty</strong> for complexity. BIC prefers simpler models and is useful when you have a large dataset.
                          </p>
                          <div className="flex items-center gap-2">
                             <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded">Lower is Better</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Backtest Metrics */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Backtest Accuracy (Stability)</h4>
                    <p className="text-xs text-slate-500">Used during "Backtest" mode to compare predictions vs. actual historical data.</p>
                    
                    <div className="space-y-3">
                      <div className="flex gap-4 p-4 bg-white border border-slate-200 rounded-lg">
                        <div className="w-10 text-center flex-shrink-0">
                           <span className="text-lg font-bold text-slate-700 block">RMSE</span>
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 text-sm">Root Mean Squared Error</h5>
                          <p className="text-xs text-slate-600 mt-1">
                            Measures the standard deviation of the prediction errors. Because errors are squared before averaging, <strong>RMSE gives a relatively high weight to large errors</strong>. Useful if being wrong by a large amount is particularly bad.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 p-4 bg-white border border-slate-200 rounded-lg">
                         <div className="w-10 text-center flex-shrink-0">
                           <span className="text-lg font-bold text-slate-700 block">MAPE</span>
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 text-sm">Mean Absolute Percentage Error</h5>
                          <p className="text-xs text-slate-600 mt-1">
                            Expresses accuracy as a percentage of the error. This is the easiest metric to interpret for business stability.
                          </p>
                          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                             <div className="bg-emerald-50 border border-emerald-100 p-1 rounded">
                                <span className="block text-[10px] font-bold text-emerald-700">High Stability</span>
                                <span className="text-[10px] text-emerald-600">&lt; 10%</span>
                             </div>
                             <div className="bg-amber-50 border border-amber-100 p-1 rounded">
                                <span className="block text-[10px] font-bold text-amber-700">Moderate</span>
                                <span className="text-[10px] text-amber-600">10% - 25%</span>
                             </div>
                             <div className="bg-red-50 border border-red-100 p-1 rounded">
                                <span className="block text-[10px] font-bold text-red-700">Low Stability</span>
                                <span className="text-[10px] text-red-600">&gt; 25%</span>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'multivariate' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Multivariate Models</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-6">
                      Multivariate time series analysis considers the relationship between multiple variables. 
                      This is crucial when endogenous variables influence each other (e.g., GDP and Interest Rates).
                    </p>
                  </div>
                  
                  <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-2">VAR (Vector Autoregression)</h4>
                     <p className="text-xs text-slate-600 mb-3">
                       A generalization of the univariate autoregressive model. Each variable is a linear function of past lags of itself 
                       and past lags of the other variables.
                     </p>
                     <div className="text-[10px] font-mono bg-slate-50 p-2 rounded text-slate-500">
                        Y1(t) = c1 + A11*Y1(t-1) + A12*Y2(t-1) + e1(t)
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'bayesian' && (
                 <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Bayesian Structural Time Series (BSTS)</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-6">
                      BSTS models deal with uncertainty by using probability distributions rather than fixed coefficients. 
                      They are particularly effective for decomposing time series into trend, seasonality, and regression components explicitly.
                    </p>
                  </div>
                  
                  <div className="bg-slate-900 text-white p-6 rounded-lg shadow-lg">
                    <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                      <Sigma className="w-4 h-4 text-emerald-400" />
                      Key Advantages over ARIMA
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                        <li>Handles complex seasonality better (e.g., day-of-week AND day-of-year).</li>
                        <li>Provides transparent "uncertainty intervals" for every component.</li>
                        <li>Allows injection of "Prior" knowledge (e.g., "we know sales drop in January").</li>
                    </ul>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
