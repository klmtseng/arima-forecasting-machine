
# ARIMA Forecasting Machine

An advanced visual analytics platform for time series forecasting using **ARIMA** (AutoRegressive Integrated Moving Average) and **SARIMA** (Seasonal ARIMA) models. This application integrates the **Google Gemini API** to provide intelligent parameter estimation, model diagnostics, and natural language insights.

![Status](https://img.shields.io/badge/Status-Active-success)
![Tech](https://img.shields.io/badge/Tech-React%20%7C%20TypeScript%20%7C%20Recharts-blue)

## 🚀 Features

*   **Visual Parameter Tuning**: Interactive sidebar to configure `p`, `d`, `q` (non-seasonal) and `P`, `D`, `Q`, `s` (seasonal) parameters.
*   **Intelligent Analysis**: Uses Google Gemini to perform mathematical modelling, calculate forecasts, and provide stationarity checks (AIC/BIC scores).
*   **Interactive Visualization**: Beautiful time-series charts with 95% confidence intervals using Recharts.
*   **Data Flexibility**: 
    *   Upload custom CSV files.
    *   One-click access to sample datasets (Retail Sales, Stock Market, Climate Cycles).
    *   Robust parsing for various CSV formats.
*   **Stats Summary**: Immediate feedback on model performance (AIC scores, drift detection).

## 🛠️ Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/arima-forecasting-machine.git
    cd arima-forecasting-machine
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    *   You need a valid Google Gemini API Key.
    *   Set the `API_KEY` in your environment variables.

4.  **Run the application**
    ```bash
    npm run dev
    ```

## 📊 CSV Format Guide

The application accepts `.csv` files. The preferred format is:

```csv
Date,Value
2023-01-01,100
2023-01-02,105
```

If no date is provided, the machine will auto-generate time steps.

## 🤖 Tech Stack

*   **Frontend**: React 18, TypeScript, Tailwind CSS
*   **Visualization**: Recharts
*   **AI/ML Engine**: Google GenAI SDK (Gemini 1.5 Flash)
*   **Icons**: Lucide React

## 📄 License

This project is licensed under the MIT License.
