# Trading Strategy Simulator

## Project Demo

**Live app:** https://trading-simulator-git-main-vishwas-projects-89530a93.vercel.app/  
**Demo Video(YouTube):** {https://youtu.be/VcHPrtoyJkA}

## Overview

This full-stack web app enables users to build, backtest, and analyze trading strategies on historical stock data. Designed with a focus on software engineering and quantitative finance principles, the app lets users input parameters for technical indicators such as SMA, EMA, RSI, Bollinger Bands, and MACD, and visualize their performance through interactive charts and performance metrics.

## Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, lightweight-charts
- **Backend**: FastAPI, yFinance, Pandas, NumPy
- **Database/Auth**: PostgreSQL (via Supabase)
- **Deployment**: Vercel (frontend),Railway (backend) ,Supabase (backend & user authentication)

## Features

- **Backtesting Engine**: Implements popular strategies (SMA, RSI, Bollinger Bands, MACD) with customizable parameters and metrics like return, drawdown, and win rate.
- **Interactive Visualization**: Lightweight-charts render candlestick charts with BUY/SELL signals, overlays, and performance benchmarks.
- **Saved Strategy Management**: Authenticated users can title, view, and delete past strategies, with sortable lists and timestamp tracking.
- **Custom Strategy Logic**: Users can define entry/exit conditions with stop-loss and take-profit controls.
- **Benchmark Comparison**: Calculates delta performance vs. SPY ETF to contextualize returns.
- **Dark Mode UI**: Fully styled with Tailwind CSS for a minimalist, responsive layout.
- **Loading Animations**: Includes animated glowing logo and spinner effects during async calls.

## Requirements

```bash
Node.js v18+
Python 3.9+
PostgreSQL
Supabase
```

To run locally:

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
