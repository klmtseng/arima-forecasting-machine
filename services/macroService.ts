
import { DataPoint } from "../types";

// Types for the service
export type MacroProvider = 'FRED' | 'WORLDBANK' | 'BLS' | 'IMF' | 'ISM';

interface FetchOptions {
  apiKey?: string;
  seriesId: string;
  useProxy?: boolean;
}

const CORS_PROXY = "https://corsproxy.io/?";

export const MACRO_PRESETS = {
  FRED: [
    { label: '-- Growth & Output --', id: '' },
    { label: 'Real GDP', id: 'GDPC1' },
    { label: 'Real GDP per Capita', id: 'A939RX0Q048SBEA' },
    { label: 'Industrial Production Index', id: 'INDPRO' },
    { label: 'Retail Sales', id: 'RSXFS' },
    { label: 'Capacity Utilization', id: 'TCU' },
    
    { label: '-- Employment --', id: '' },
    { label: 'Unemployment Rate', id: 'UNRATE' },
    { label: 'Nonfarm Payrolls', id: 'PAYEMS' },
    { label: 'Labor Force Part. Rate', id: 'CIVPART' },
    { label: 'Initial Claims', id: 'ICSA' },
    
    { label: '-- Prices & Inflation --', id: '' },
    { label: 'CPI (All Items)', id: 'CPIAUCSL' },
    { label: 'Core CPI', id: 'CPILFESL' },
    { label: 'PCE Price Index', id: 'PCEPI' },
    { label: 'Producer Price Index (Final Demand)', id: 'PPIFIS' },
    { label: '5-Year Breakeven Inflation', id: 'T5YIE' },
    
    { label: '-- Rates & Bonds --', id: '' },
    { label: 'Federal Funds Rate', id: 'FEDFUNDS' },
    { label: '10-Year Treasury Yield', id: 'DGS10' },
    { label: '2-Year Treasury Yield', id: 'DGS2' },
    { label: '10Y-2Y Yield Curve', id: 'T10Y2Y' },
    { label: 'Mortgage Rates (30Y Fixed)', id: 'MORTGAGE30US' },
    { label: 'High Yield Corp Bond Spread', id: 'BAMLH0A0HYM2' },
    
    { label: '-- Money & Banking --', id: '' },
    { label: 'M2 Money Supply', id: 'M2SL' },
    { label: 'Velocity of M2', id: 'M2V' },
    { label: 'Total Assets (Fed Balance Sheet)', id: 'WALCL' },
    
    { label: '-- Housing --', id: '' },
    { label: 'Housing Starts', id: 'HOUST' },
    { label: 'Case-Shiller Home Price Index', id: 'CSUSHPINSA' },
    
    { label: '-- Misc --', id: '' },
    { label: 'CBOE Volatility Index (VIX)', id: 'VIXCLS' },
    { label: 'WTI Crude Oil Price', id: 'DCOILWTICO' },
    { label: 'Gold Price (London Fix)', id: 'GOLDAMGBD228NLBM' },
    { label: 'NBER Recession Indicators', id: 'USREC' },
  ],
  ISM: [
    // Note: Official ISM data is proprietary. We use FRED hosted proxies or related diffusion indices.
    { label: 'Total Business: Inventories', id: 'BUSINV' },
    { label: 'Total Business: Sales', id: 'TOTBUSSMNSA' },
    { label: 'Manufacturers: New Orders', id: 'AMTMNO' },
    { label: 'Manufacturers: Unfilled Orders', id: 'AMTUHO' },
    { label: 'Chicago Fed National Activity', id: 'CFNAI' },
    { label: 'Philly Fed Manufacturing Index', id: 'GACDFSA066MSFRBPHI' },
    { label: 'Empire State Manufacturing', id: 'GACDFSA066MSFRBNY' },
  ],
  WORLDBANK: [
    { label: 'Global GDP Growth (Annual %)', id: 'NY.GDP.MKTP.KD.ZG' },
    { label: 'China GDP Growth', id: 'NY.GDP.MKTP.KD.ZG?locations=CN' },
    { label: 'Global Inflation', id: 'FP.CPI.TOTL.ZG' },
    { label: 'Total Population', id: 'SP.POP.TOTL' },
    { label: 'CO2 Emissions (metric tons per capita)', id: 'EN.ATM.CO2E.PC' },
    { label: 'Electric Power Consumption', id: 'EG.USE.ELEC.KH.PC' },
    { label: 'Trade (% of GDP)', id: 'NE.TRD.GNFS.ZS' },
    { label: 'Foreign Direct Investment', id: 'BX.KLT.DINV.WD.GD.ZS' },
  ],
  BLS: [
    { label: 'Unemployment Rate', id: 'LNS14000000' },
    { label: 'CPI-U (All Items)', id: 'CUUR0000SA0' },
    { label: 'Average Hourly Earnings', id: 'CES0500000003' },
    { label: 'Productivity (Nonfarm Business)', id: 'PRS85006092' },
    { label: 'Unit Labor Costs', id: 'PRS85006112' },
    { label: 'Import Price Index', id: 'EIUIR' },
    { label: 'Export Price Index', id: 'EIUIQ' },
  ],
  IMF: [
    { label: 'Commodity Price Index', id: 'PALLFNF_INDEX' },
    { label: 'Crude Oil Index', id: 'POILAPSP_INDEX' },
    { label: 'Natural Gas Index', id: 'PNGAS_INDEX' },
    { label: 'Consumer Prices (Advanced Econ)', id: 'PCPI_ADV_ECON' },
  ]
};

/**
 * Helper to fetch with optional CORS proxy
 */
async function fetchWithProxy(url: string, useProxy: boolean): Promise<Response> {
  const finalUrl = useProxy ? `${CORS_PROXY}${encodeURIComponent(url)}` : url;
  return fetch(finalUrl);
}

/**
 * FRED API (Federal Reserve Economic Data)
 * Docs: https://fred.stlouisfed.org/docs/api/fred/
 */
async function fetchFredData({ apiKey, seriesId, useProxy = true }: FetchOptions): Promise<DataPoint[]> {
  if (!apiKey) throw new Error("API Key required for FRED/ISM");
  
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json`;
  
  const response = await fetchWithProxy(url, useProxy);
  if (!response.ok) throw new Error(`FRED API Error: ${response.statusText}. Check your API Key.`);
  
  const data = await response.json();
  if (!data.observations) throw new Error("Invalid FRED response format");

  return data.observations.map((obs: any) => ({
    date: obs.date,
    value: parseFloat(obs.value)
  })).filter((d: DataPoint) => !isNaN(d.value));
}

/**
 * World Bank API
 * Docs: https://datahelpdesk.worldbank.org/knowledgebase/topics/125589
 */
async function fetchWorldBankData({ seriesId, useProxy = false }: FetchOptions): Promise<DataPoint[]> {
  // Parsing ID for location override (e.g., ID?locations=CN)
  const [actualId, params] = seriesId.split('?');
  const country = params && params.includes('locations=') ? params.split('=')[1] : 'US';

  const url = `https://api.worldbank.org/v2/country/${country}/indicator/${actualId}?format=json&per_page=1000`;
  
  const response = await fetchWithProxy(url, useProxy);
  if (!response.ok) throw new Error(`World Bank API Error: ${response.statusText}`);
  
  const data = await response.json();
  
  if (!Array.isArray(data) || data.length < 2) throw new Error("No data found for this World Bank indicator");
  
  // World bank returns data sorted by date desc usually
  const points = data[1].map((obs: any) => ({
    date: `${obs.date}-01-01`, // World Bank annual data usually comes as "2020"
    value: obs.value
  })).filter((d: any) => d.value !== null).reverse(); // Ensure ascending order

  return points;
}

/**
 * BLS API (Bureau of Labor Statistics)
 * Docs: https://www.bls.gov/developers/api_signature_v2.htm
 */
async function fetchBLSData({ apiKey, seriesId, useProxy = true }: FetchOptions): Promise<DataPoint[]> {
  // BLS V2 API (Requires Key for full history, though V1 is free/limited)
  // We use POST for BLS
  const url = `https://api.bls.gov/publicAPI/v2/timeseries/data/`;
  
  const payload = {
    seriesid: [seriesId],
    startyear: "2000", // Default window, ideally dynamic
    endyear: new Date().getFullYear().toString(),
    registrationkey: apiKey
  };

  // Note: BLS is strictly strict on CORS. Proxy almost always needed from browser.
  const finalUrl = useProxy ? `${CORS_PROXY}${encodeURIComponent(url)}` : url;

  const response = await fetch(finalUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error(`BLS API Error: ${response.statusText}`);
  
  const json = await response.json();
  if (json.status !== 'REQUEST_SUCCEEDED' || !json.Results || !json.Results.series[0]) {
    throw new Error(json.message?.[0] || "Failed to fetch BLS data");
  }

  const seriesData = json.Results.series[0].data;
  
  // Convert BLS format (year: "2023", period: "M01") to Date string
  const points = seriesData.map((obs: any) => {
    const month = obs.period.replace('M', '');
    return {
      date: `${obs.year}-${month}-01`,
      value: parseFloat(obs.value)
    };
  }).reverse();

  return points;
}

/**
 * IMF API
 * Uses JSON-REST
 */
async function fetchIMFData({ seriesId, useProxy = true }: FetchOptions): Promise<DataPoint[]> {
  // Example: IFS/A.US.PMP_IX (Producer Prices)
  // This is a simplified fetcher. IMF keys are complex (Dataset/Freq.Country.Indicator).
  // We will assume the user inputs the full resource ID or handle a specific dataset (IFS).
  
  const url = `https://www.imf.org/external/datamapper/api/v1/${seriesId}?regions=US`;
  
  const response = await fetchWithProxy(url, useProxy);
  if (!response.ok) throw new Error(`IMF API Error: ${response.statusText}`);
  
  const json = await response.json();
  
  // IMF structure varies wildly. This handles the DataMapper structure.
  // values: { IMF_SERIES_ID: { "2000": 1.5, "2001": 2.0 } }
  const innerData = json.values?.[seriesId];
  if (!innerData) throw new Error("IMF Data not found in response");

  const points = Object.entries(innerData).map(([year, val]) => ({
    date: `${year}-01-01`,
    value: Number(val)
  })).sort((a, b) => a.date.localeCompare(b.date));

  return points;
}

export const macroService = {
  fetchData: async (provider: MacroProvider, options: FetchOptions): Promise<DataPoint[]> => {
    switch (provider) {
      case 'FRED':
        return fetchFredData(options);
      case 'ISM':
        // ISM data is proprietary, but broadly accessed via FRED aggregators.
        // We reuse the FRED fetcher as the backend is usually St Louis Fed for these series.
        return fetchFredData(options);
      case 'WORLDBANK':
        return fetchWorldBankData(options);
      case 'BLS':
        return fetchBLSData(options);
      case 'IMF':
        return fetchIMFData(options);
      default:
        throw new Error("Unknown Provider");
    }
  }
};
