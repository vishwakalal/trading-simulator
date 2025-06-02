import pandas as pd

def custom_strategy(df, fast, slow, stop_loss_pct, take_profit_pct):
    df = df.copy()

    # Ensure 'Date' column exists
    if 'Date' not in df.columns:
        if 'date' in df.columns:
            df.rename(columns={'date': 'Date'}, inplace=True)

    df['fast'] = df['Close'].rolling(window=fast).mean()
    df['slow'] = df['Close'].rolling(window=slow).mean()
    df['date'] = pd.to_datetime(df['Date']).dt.strftime('%Y-%m-%d')

    signals = []
    entry_price = None
    holding = False

    for i in range(1, len(df)):
        prev_fast, prev_slow = df['fast'].iloc[i - 1], df['slow'].iloc[i - 1]
        curr_fast, curr_slow = df['fast'].iloc[i], df['slow'].iloc[i]
        curr_price = df['Close'].iloc[i]
        curr_date = df['date'].iloc[i]

        if pd.isna(prev_fast) or pd.isna(prev_slow) or pd.isna(curr_fast) or pd.isna(curr_slow):
            continue

        if not holding and prev_fast < prev_slow and curr_fast > curr_slow:
            holding = True
            entry_price = curr_price
            signals.append({'date': curr_date, 'type': 'buy', 'price': curr_price})
        elif holding:
            if (curr_price <= entry_price * (1 - stop_loss_pct)) or (curr_price >= entry_price * (1 + take_profit_pct)):
                signals.append({'date': curr_date, 'type': 'sell', 'price': curr_price})
                holding = False
                entry_price = None

    indicators = df[['date', 'fast', 'slow']].dropna(subset=['fast', 'slow']).to_dict(orient='records')

    return signals, indicators
