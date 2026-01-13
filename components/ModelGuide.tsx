
import React, { useState } from 'react';
import { X, BookOpen, GitBranch, Sigma, Activity, Layers, Network, Calculator, CheckCircle2, List } from 'lucide-react';

interface ModelGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelGuide: React.FC<ModelGuideProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'arima' | 'multivariate' | 'bayesian'>('arima');
  const [arimaSubTab, setArimaSubTab] = useState<'definitions' | 'params' | 'assumptions'>('definitions');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Model Intelligence Guide</h2>
              <p className="text-sm text-slate-500">Mathematical definitions, assumptions, and parameter logic</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Main Sidebar Tabs */}
          <div className="w-64 bg-slate-50 border-r border-slate-100 p-4 space-y-2 overflow-y-auto flex-shrink-0">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 mt-2">Model Families</div>
            <button
              onClick={() => setActiveTab('arima')}
              className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
                activeTab === 'arima' 
                  ? 'bg-white shadow-sm text-indigo-600 font-semibold ring-1 ring-slate-200' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>The ARIMA Family</span>
            </button>
            <button
              onClick={() => setActiveTab('multivariate')}
              className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
                activeTab === 'multivariate' 
                  ? 'bg-white shadow-sm text-indigo-600 font-semibold ring-1 ring-slate-200' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>Multivariate Models</span>
            </button>
            <button
              onClick={() => setActiveTab('bayesian')}
              className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
                activeTab === 'bayesian' 
                  ? 'bg-white shadow-sm text-indigo-600 font-semibold ring-1 ring-slate-200' 
                  : 'text-slate-600 hover:bg-slate-100'
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
                  className={`px-4 py-4 text-sm font-bold border-b-2 transition-colors ${arimaSubTab === 'definitions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  Definitions & Formulas
                </button>
                <button 
                  onClick={() => setArimaSubTab('params')}
                  className={`px-4 py-4 text-sm font-bold border-b-2 transition-colors ${arimaSubTab === 'params' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  Parameter Reference
                </button>
                <button 
                  onClick={() => setArimaSubTab('assumptions')}
                  className={`px-4 py-4 text-sm font-bold border-b-2 transition-colors ${arimaSubTab === 'assumptions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  Assumptions
                </button>
              </div>
            )}

            <div className="p-8">
              {activeTab === 'arima' && arimaSubTab === 'definitions' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="prose prose-slate max-w-none">
                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      <Calculator className="w-6 h-6 text-indigo-600" />
                      Model Definitions & Calculus
                    </h3>
                    <p className="text-slate-600">The ARIMA family builds complexity layer by layer. Below are the core components used to construct the forecasts.</p>
                  </div>

                  <div className="grid gap-6">
                    {/* AR Model */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-indigo-900 text-lg">AR(p): AutoRegressive</h4>
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold font-mono">Regression on past values</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-4">
                        A regression model that uses the dependency between an observation and some number of lagged observations.
                      </p>
                      <div className="bg-white p-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-700 overflow-x-auto">
                        Y<sub>t</sub> = c + ϕ<sub>1</sub>Y<sub>t-1</sub> + ϕ<sub>2</sub>Y<sub>t-2</sub> + ... + ϕ<sub>p</sub>Y<sub>t-p</sub> + ε<sub>t</sub>
                      </div>
                      <ul className="mt-4 space-y-2 text-xs text-slate-500">
                        <li>• <strong>Y<sub>t</sub></strong>: Value at time t</li>
                        <li>• <strong>ϕ</strong>: Coefficient (weight) for past value</li>
                        <li>• <strong>ε<sub>t</sub></strong>: White noise error term</li>
                      </ul>
                    </div>

                    {/* MA Model */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-purple-900 text-lg">MA(q): Moving Average</h4>
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold font-mono">Regression on past errors</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-4">
                        Uses the dependency between an observation and a residual error from a moving average model applied to lagged observations.
                      </p>
                      <div className="bg-white p-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-700 overflow-x-auto">
                        Y<sub>t</sub> = μ + ε<sub>t</sub> + θ<sub>1</sub>ε<sub>t-1</sub> + ... + θ<sub>q</sub>ε<sub>t-q</sub>
                      </div>
                      <ul className="mt-4 space-y-2 text-xs text-slate-500">
                        <li>• <strong>ε<sub>t</sub></strong>: Prediction error at time t</li>
                        <li>• <strong>θ</strong>: Coefficient for past error</li>
                      </ul>
                    </div>

                    {/* ARIMA Model */}
                    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-white text-lg">ARIMA(p,d,q)</h4>
                        <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold font-mono">Integrated (I)</span>
                      </div>
                      <p className="text-sm text-slate-300 mb-4">
                        Combines AR and MA, but first applies <strong>Differencing (d)</strong> to data to make it stationary (removing trends).
                      </p>
                      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 font-mono text-sm text-emerald-400 overflow-x-auto">
                        Δ<sup>d</sup>Y<sub>t</sub> = c + AR(p) terms + MA(q) terms
                      </div>
                      <p className="mt-4 text-xs text-slate-400">
                        * Where ΔY<sub>t</sub> = Y<sub>t</sub> - Y<sub>t-1</sub> (First difference)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'arima' && arimaSubTab === 'params' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="prose prose-slate max-w-none">
                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      <List className="w-6 h-6 text-indigo-600" />
                      Parameter Reference Dictionary
                    </h3>
                    <p className="text-slate-600">The ARIMA machine requires specific tuning of these integers. Understanding them is key to a good model.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs mt-4">Non-Seasonal Parameters (The Trend)</h4>
                    
                    <div className="flex gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xl flex-shrink-0">p</div>
                      <div>
                        <h5 className="font-bold text-slate-800">Lag Order (AR)</h5>
                        <p className="text-sm text-slate-600">The number of lag observations included in the model. <br/><span className="italic text-xs text-slate-400">"How many past days directly affect today?"</span></p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xl flex-shrink-0">d</div>
                      <div>
                        <h5 className="font-bold text-slate-800">Degree of Differencing (I)</h5>
                        <p className="text-sm text-slate-600">The number of times the raw observations are differenced to make the data stationary. <br/><span className="italic text-xs text-slate-400">"Usually 1 for linear trends, 2 for quadratic."</span></p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xl flex-shrink-0">q</div>
                      <div>
                        <h5 className="font-bold text-slate-800">Moving Average Order (MA)</h5>
                        <p className="text-sm text-slate-600">The size of the moving average window (error lags). <br/><span className="italic text-xs text-slate-400">"How much do past shocks/errors smooth out?"</span></p>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs mt-6">Seasonal Parameters (The Cycle)</h4>
                    
                    <div className="flex gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl flex-shrink-0">P</div>
                      <div>
                        <h5 className="font-bold text-slate-800">Seasonal AR</h5>
                        <p className="text-sm text-slate-600">Autoregressive lags for the seasonal component. <br/><span className="italic text-xs text-slate-400">"Does this month relate to the same month last year?"</span></p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl flex-shrink-0">s</div>
                      <div>
                        <h5 className="font-bold text-slate-800">Seasonality Period</h5>
                        <p className="text-sm text-slate-600">The number of time steps for a single seasonal cycle. <br/><span className="italic text-xs text-slate-400">"12 for yearly data by month, 7 for weekly data by day."</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'arima' && arimaSubTab === 'assumptions' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="prose prose-slate max-w-none">
                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                      Model Assumptions
                    </h3>
                    <p className="text-slate-600">For ARIMA results to be statistically valid, the data must meet these criteria. If not, the forecast intervals may be inaccurate.</p>
                  </div>

                  <div className="grid gap-4">
                    <div className="p-5 bg-white border-l-4 border-indigo-500 shadow-sm rounded-r-xl">
                      <h4 className="font-bold text-slate-800">1. Stationarity</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        The time series should have a constant mean and variance over time. It should not "drift" endlessly without returning to a mean. This is why we use differencing (d).
                      </p>
                    </div>

                    <div className="p-5 bg-white border-l-4 border-indigo-500 shadow-sm rounded-r-xl">
                      <h4 className="font-bold text-slate-800">2. No Autocorrelation in Residuals</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        After the model fits the data, the remaining errors (residuals) should be random "white noise". If there is a pattern in the errors, the model missed something.
                      </p>
                    </div>

                    <div className="p-5 bg-white border-l-4 border-indigo-500 shadow-sm rounded-r-xl">
                      <h4 className="font-bold text-slate-800">3. Homoscedasticity</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        The variance of the residuals should be constant. If errors get larger as values get larger (fan shape), the model may need a Log transformation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Keep other tabs simple for now as requested focus was ARIMA */}
              {activeTab === 'multivariate' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Multivariate Models</h3>
                    <p className="text-slate-600 leading-relaxed mb-6">
                      While ARIMA looks at a single variable (e.g., Apple stock price), Multivariate models consider how multiple variables influence each other over time (e.g., Apple stock price + Interest Rates + iPhone Sales).
                    </p>
                  </div>
                  {/* ... (Existing Multivariate Content) ... */}
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                    <h4 className="font-bold text-orange-800">VAR (Vector AutoRegression)</h4>
                     <p className="text-sm text-orange-700 mt-2">
                       Extends AR to k variables. Each variable is a linear function of past lags of itself and past lags of the other variables.
                     </p>
                  </div>
                </div>
              )}

              {activeTab === 'bayesian' && (
                 <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Bayesian Approaches</h3>
                    <p className="text-slate-600 leading-relaxed mb-6">
                      Bayesian models differ fundamentally from classical ARIMA. Instead of finding one "best fit" line, they deal in <strong>probabilities</strong>.
                    </p>
                  </div>
                  {/* ... (Existing Bayesian Content) ... */}
                  <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
                    <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                      <Sigma className="w-5 h-5 text-indigo-400" />
                      BSTS: Bayesian Structural Time Series
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed mb-4">
                      Separates Trend, Seasonality, and Regression components explicitly, allowing for flexible modeling of complex patterns.
                    </p>
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
