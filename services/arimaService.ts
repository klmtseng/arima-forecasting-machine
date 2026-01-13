
import { GoogleGenAI, Type } from "@google/genai";
import { DataPoint, ModelParams, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function runArimaAnalysis(data: DataPoint[], params: ModelParams): Promise<AnalysisResult> {
  const dataString = data.map(d => `${d.date}: ${d.value}`).join(', ');
  
  const prompt = `
    Perform a professional ARIMA analysis on the following time series data: [${dataString}].
    Use the following model parameters:
    Non-seasonal: p=${params.p}, d=${params.d}, q=${params.q}
    Seasonal: P=${params.P}, D=${params.D}, Q=${params.Q}, s=${params.s} (if s > 0).

    Calculate a 12-point forecast with 95% confidence intervals (upper and lower bounds).
    Also evaluate model diagnostics like AIC, BIC, and provide stationarity insights.
    
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
