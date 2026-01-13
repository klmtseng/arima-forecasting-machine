
export interface DataPoint {
  date: string;
  value: number;
}

export interface ModelParams {
  p: number;
  d: number;
  q: number;
  P: number;
  D: number;
  Q: number;
  s: number;
}

export interface ForecastPoint extends DataPoint {
  lower?: number;
  upper?: number;
  isForecast?: boolean;
}

export interface AnalysisResult {
  forecast: ForecastPoint[];
  diagnostics: {
    aic: number;
    bic: number;
    stationarity: string;
    description: string;
  };
  insights: string;
}

export interface ChartData {
  timestamp: string;
  actual?: number;
  forecast?: number;
  lower?: number;
  upper?: number;
}
