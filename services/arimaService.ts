
import { GoogleGenAI, Type } from "@google/genai";
import { DataPoint, ModelParams, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function runArimaAnalysis(data: DataPoint[], params: ModelParams, steps: number = 12): Promise<AnalysisResult> {
  const dataString = data.map(d => `${d.date}: ${d.value}`).join(', ');
  
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
