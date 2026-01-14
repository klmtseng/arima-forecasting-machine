
import React, { useState, useEffect } from 'react';
import { Database, Key, Search, Globe, Building2, Landmark, AlertTriangle, Check, Download, ExternalLink, Factory } from 'lucide-react';
import { macroService, MacroProvider, MACRO_PRESETS } from '../services/macroService';
import { DataPoint } from '../types';

interface MacroDataSelectorProps {
  onDataLoaded: (data: DataPoint[], sourceName: string) => void;
}

export const MacroDataSelector: React.FC<MacroDataSelectorProps> = ({ onDataLoaded }) => {
  const [provider, setProvider] = useState<MacroProvider>('FRED');
  const [apiKey, setApiKey] = useState('');
  const [seriesId, setSeriesId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useProxy, setUseProxy] = useState(true);

  // Load saved keys
  useEffect(() => {
    // ISM shares keys with FRED usually
    const storageKey = provider === 'ISM' ? 'FRED' : provider;
    const savedKey = localStorage.getItem(`API_KEY_${storageKey}`);
    
    if (savedKey) setApiKey(savedKey);
    else setApiKey('');

    // Reset series ID to first preset
    const presets = MACRO_PRESETS[provider as keyof typeof MACRO_PRESETS];
    if (presets && presets.length > 0) {
      // Find first non-header preset
      const firstValid = presets.find(p => p.id !== '');
      setSeriesId(firstValid ? firstValid.id : '');
    } else {
      setSeriesId('');
    }
  }, [provider]);

  const handleSaveKey = () => {
    const storageKey = provider === 'ISM' ? 'FRED' : provider;
    localStorage.setItem(`API_KEY_${storageKey}`, apiKey);
  };

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      // Auto-save key if provided
      if (apiKey) handleSaveKey();

      const data = await macroService.fetchData(provider, {
        apiKey,
        seriesId,
        useProxy
      });

      if (data.length === 0) throw new Error("No data points returned.");
      
      onDataLoaded(data, `${provider}: ${seriesId}`);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (p: MacroProvider) => {
    switch (p) {
      case 'FRED': return <Landmark className="w-4 h-4" />;
      case 'WORLDBANK': return <Globe className="w-4 h-4" />;
      case 'BLS': return <Building2 className="w-4 h-4" />;
      case 'IMF': return <Database className="w-4 h-4" />;
      case 'ISM': return <Factory className="w-4 h-4" />;
    }
  };

  const getRegistrationLink = () => {
    switch (provider) {
      case 'FRED': return "https://fred.stlouisfed.org/docs/api/api_key.html";
      case 'ISM': return "https://fred.stlouisfed.org/docs/api/api_key.html"; // ISM via FRED
      case 'BLS': return "https://www.bls.gov/developers/";
      default: return null;
    }
  };

  const getDatabaseLink = () => {
    switch (provider) {
        case 'FRED': return "https://fred.stlouisfed.org/";
        case 'ISM': return "https://www.ismworld.org/";
        case 'BLS': return "https://www.bls.gov/data/";
        case 'WORLDBANK': return "https://data.worldbank.org/";
        case 'IMF': return "https://www.imf.org/en/Data";
        default: return null;
    }
  };

  const presets = MACRO_PRESETS[provider as keyof typeof MACRO_PRESETS];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Provider Tabs */}
        <div className="w-full md:w-48 flex flex-col gap-2 flex-shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Data Source</span>
          {(['FRED', 'ISM', 'WORLDBANK', 'BLS', 'IMF'] as MacroProvider[]).map((p) => (
            <button
              key={p}
              onClick={() => setProvider(p)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                provider === p 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {getProviderIcon(p)}
              {p === 'WORLDBANK' ? 'World Bank' : p}
            </button>
          ))}
        </div>

        {/* Configuration Area */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              {getProviderIcon(provider)}
              Configure {provider === 'WORLDBANK' ? 'World Bank' : provider} Connection
            </h3>
            
            <div className="flex gap-4">
                {getDatabaseLink() && (
                    <a 
                        href={getDatabaseLink()!} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-slate-500 hover:text-indigo-600 hover:underline flex items-center gap-1 font-medium"
                    >
                        Visit Database <ExternalLink className="w-3 h-3" />
                    </a>
                )}
                {getRegistrationLink() && (
                    <a 
                        href={getRegistrationLink()!} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-bold"
                    >
                        Get API Key <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </div>
          </div>

          {/* API Key Input (if needed) */}
          {(provider === 'FRED' || provider === 'BLS' || provider === 'ISM') && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">API Key {provider === 'ISM' && '(Uses FRED Key)'}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`Paste your ${provider === 'ISM' ? 'FRED' : provider} API Key`}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Keys are stored locally in your browser for future use.
              </p>
            </div>
          )}

          {/* Series Selection */}
          <div>
             <label className="block text-xs font-bold text-slate-500 mb-1">
               Series ID / Indicator
             </label>
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={seriesId}
                  onChange={(e) => setSeriesId(e.target.value)}
                  placeholder={provider === 'FRED' ? "e.g., GDPC1, UNRATE" : "Series ID"}
                  className="w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded text-sm font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
             </div>
             
             {/* Presets */}
             {presets && (
               <div className="mt-3 flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                 {presets.map((preset, idx) => (
                   preset.id === '' ? (
                     <div key={idx} className="w-full text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 mb-1 border-b border-slate-100 pb-1">
                        {preset.label}
                     </div>
                   ) : (
                    <button
                        key={preset.id}
                        onClick={() => setSeriesId(preset.id)}
                        className={`text-[10px] px-2 py-1 rounded border transition-colors text-left ${
                        seriesId === preset.id 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                    >
                        {preset.label}
                    </button>
                   )
                 ))}
               </div>
             )}
          </div>

          {/* Options */}
          <div className="flex items-center justify-between pt-2">
             <label className="flex items-center gap-2 cursor-pointer group">
               <input 
                 type="checkbox" 
                 checked={useProxy} 
                 onChange={(e) => setUseProxy(e.target.checked)}
                 className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
               />
               <span className="text-xs text-slate-600 group-hover:text-slate-900">
                 Use CORS Proxy (Recommended)
               </span>
             </label>

             <button
              onClick={handleFetch}
              disabled={loading || !seriesId}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                loading || !seriesId
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md active:translate-y-0.5'
              }`}
             >
               {loading ? (
                 <>Fetching...</>
               ) : (
                 <>
                   <Download className="w-4 h-4" /> Import Data
                 </>
               )}
             </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded text-xs text-red-600 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-slate-50 p-3 rounded text-[10px] text-slate-500 border border-slate-100">
            <strong>Research Note:</strong> Data is fetched directly from official government APIs. 
            Ensure your API keys are valid. Standard rate limits apply based on your key tier.
          </div>

        </div>
      </div>
    </div>
  );
};
