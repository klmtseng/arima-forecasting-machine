
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

export interface DatasetStats {
  mean: number;
  min: number;
  max: number;
  stdDev: number;
  count: number;
  volatility: number; // Coeff of variation
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
  metrics?: {
    mae: number;
    rmse: number;
    mape: number;
  };
}

export interface ChartData {
  timestamp: string;
  actual?: number;       // Used for standard full history
  trainValue?: number;   // Used during backtesting (observed)
  testValue?: number;    // Used during backtesting (hidden/ground truth)
  forecast?: number;
  lower?: number;
  upper?: number;
}
