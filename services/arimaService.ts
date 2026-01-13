
import { GoogleGenAI, Type } from "@google/genai";
import { DataPoint, ModelParams, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Optimized data formatter to save tokens
const formatDataForPrompt = (data: DataPoint[]) => {
  // If data is too large, take a representative sample (start, middle, end) to preserve trend/seasonality context
  // but for < 500 points, we send it all.
  const limit = 300;
  let processedData = data;
  
  if (data.length > limit) {
    const step = Math.ceil(data.length / limit);
    processedData = data.filter((_, index) => index % step === 0);
  }

  return processedData.map(d => `${d.date}:${d.value}`).join('|');
};

export async function optimizeModelParameters(data: DataPoint[]): Promise<ModelParams> {
  const dataString = formatDataForPrompt(data);

  const prompt = `
    Act as an expert Data Scientist performing an "Auto-ARIMA" procedure.
    Analyze the following time series data: [${dataString}].

    YOUR TASK:
    Determine the optimal SARIMA(p,d,q)(P,D,Q)s parameters that would minimize the AIC (Akaike Information Criterion).
    
    STEPS:
    1. Check for Stationarity (determine 'd'). If trending, d=1.
    2. Check for Seasonality (determine 's', 'P', 'D', 'Q'). Look for repeating cycles.
    3. Analyze ACF/PACF characteristics to estimate 'p' and 'q'.
    
    CONSTRAINTS:
    - Return ONLY the integer parameters.
    - 's' should be 0 if no clear seasonality is found, or the period length (e.g., 12, 7, 4) if found.
    - Be conservative to avoid overfitting (prefer simpler models).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          p: { type: Type.INTEGER },
          d: { type: Type.INTEGER },
          q: { type: Type.INTEGER },
          P: { type: Type.INTEGER },
          D: { type: Type.INTEGER },
          Q: { type: Type.INTEGER },
          s: { type: Type.INTEGER }
        },
        required: ["p", "d", "q", "P", "D", "Q", "s"]
      },
      // Using a slightly higher temperature to allow creative pattern recognition, 
      // but low enough to maintain structure.
      temperature: 0.2 
    }
  });

  const jsonResult = JSON.parse(response.text || '{}');
  return jsonResult as ModelParams;
}

export async function runArimaAnalysis(data: DataPoint[], params: ModelParams, steps: number = 12): Promise<AnalysisResult> {
  const dataString = formatDataForPrompt(data);
  
  const prompt = `
    Perform a professional time series analysis on the following data: [${dataString}].
    
    TASK 1: CALCULATE FORECAST
    Use a SARIMA model with these parameters:
    Non-seasonal: p=${params.p}, d=${params.d}, q=${params.q}
    Seasonal: P=${params.P}, D=${params.D}, Q=${params.Q}, s=${params.s} (if s > 0).
    Calculate a ${steps}-point forecast with 95% confidence intervals (upper and lower bounds).
    
    TASK 2: DIAGNOSTICS
    Evaluate model diagnostics like AIC, BIC, and stationarity.

    TASK 3: ADVANCED INSIGHTS
    Provide a text summary (under 'insights') that:
    1. Explains the trend and seasonality found in the data.
    2. Critically evaluates if this ARIMA model is appropriate.
    3. **CRITICAL**: Briefly discuss if a **Bayesian Structural Time Series (BSTS)** approach or a **Multivariate (VAR/ARIMAX)** model would potentially offer better results for this specific data pattern, and why. Use this to educate the user on alternative modeling perspectives.
    
    Data context: ${data.length} observations.
    Assume the user wants the most accurate mathematical approximation possible given these constraints.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          forecast: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                value: { type: Type.NUMBER },
                lower: { type: Type.NUMBER },
                upper: { type: Type.NUMBER }
              },
              required: ["date", "value", "lower", "upper"]
            }
          },
          diagnostics: {
            type: Type.OBJECT,
            properties: {
              aic: { type: Type.NUMBER },
              bic: { type: Type.NUMBER },
              stationarity: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["aic", "bic", "stationarity", "description"]
          },
          insights: { type: Type.STRING }
        },
        required: ["forecast", "diagnostics", "insights"]
      },
    }
  });

  const jsonResult = JSON.parse(response.text || '{}');
  return jsonResult as AnalysisResult;
}
