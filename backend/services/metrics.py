import pandas as pd
import numpy as np
from typing import List, Dict


def get_metrics(signals: List[Dict], df: pd.DataFrame) -> Dict:
    if not signals or len(signals) < 2:
        return {
            "total_return": "N/A",
            "sharpe_ratio": "N/A",
            "win_rate": "N/A",
            "max_drawdown": "N/A",
        }
    df["Close"] = pd.to_numeric(df["Close"], errors="coerce")
    trades = []
    for i in range(len(signals) - 1):
        if signals[i]["type"] == "buy" and signals[i + 1]["type"] == "sell":
            buy_price = signals[i]["price"]
            sell_price = signals[i + 1]["price"]
            trade_return = (sell_price - buy_price) / buy_price
            trades.append(trade_return)
    gain = 0
    loss = 0
    for trade in trades:
        if trade > 0:
            gain += trade
        elif trade < 0:
            loss += abs(trade)

    if loss != 0:
        profitFactor = round(gain / loss, 2)
    else:
        profitFactor = "N/A" 

    trade_amount = len(trades)
    total = sum(trades)
    wins = []
    for r in trades:
        if r > 0:
            wins.append(r)
    if len(trades) > 0:
        win_rate = len(wins) / len(trades)
    else:
        win_rate = 0

    df["Date"] = pd.to_datetime(df["Date"])
    portfolio = []
    in_trade = False
    entry_date = None
    entry_price = None

    for signal in signals:
        if signal["type"] == "buy":
            in_trade = True
            entry_date = pd.to_datetime(signal["date"])
            entry_price = signal["price"]

        elif signal["type"] == "sell" and in_trade:
            sell_date = pd.to_datetime(signal["date"])
            sell_price = signal["price"]

            trade_range = df[
                (df["Date"] >= entry_date) & (df["Date"] <= sell_date)
            ].copy()

            if not trade_range.empty and pd.notna(entry_price):
                trade_range["daily_return"] = (
                    trade_range["Close"].pct_change().fillna(0)
                )
                portfolio.extend(trade_range["daily_return"].tolist())

            in_trade = False
    print("Portfolio returns during trades:", portfolio)
    print("Mean:", np.mean(portfolio), "Std:", np.std(portfolio))

    if portfolio and np.std(portfolio) != 0:
        sharpe = (np.mean(portfolio) / np.std(portfolio)) * np.sqrt(252)
    else:
        sharpe = 0

    cumulative = df["Close"].cummax()
    drawdown = (df["Close"] - cumulative) / cumulative
    max_drawdown = drawdown.min()

    starting_capital = 10000
    capital = starting_capital
    for i in range(len(signals) - 1):
        if signals[i]["type"] == "buy" and signals[i + 1]["type"] == "sell":
            buy_price = signals[i]["price"]
            sell_price = signals[i + 1]["price"]

            shares = capital / buy_price
            capital = shares * sell_price
    cap_return = ((capital - starting_capital) / starting_capital) * 100

    return {
        "total return": round(total * 100, 2),
        "sharpe ratio": round(sharpe, 2),
        "win rate": round(win_rate * 100, 2),
        "max drawdown": round(max_drawdown * 100, 2),
        "trade amount": trade_amount,
        "profit factor": profitFactor,
        "ending capital": round(capital, 2),
        "capital return": round(cap_return, 2),
    }
