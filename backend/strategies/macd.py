import pandas as pd

def macd_strategy(data, fast_period=12, slow_period=26, signal_period=9):
    df = data.copy()
    df['EMA_fast'] = df['Close'].ewm(span=fast_period, adjust=False).mean()
    df['EMA_slow'] = df['Close'].ewm(span=slow_period, adjust=False).mean()
    
    df['MACD'] = df['EMA_fast'] - df['EMA_slow']
    df['Signal'] = df['MACD'].ewm(span=signal_period, adjust=False).mean()
    df['Histogram'] = df['MACD'] - df['Signal']
    
    df['Signal_Type'] = ''
    df['Signal_Price'] = None

    for i in range(1, len(df)):
        if df['MACD'].iloc[i-1] < df['Signal'].iloc[i-1] and df['MACD'].iloc[i] > df['Signal'].iloc[i]:
            df.at[df.index[i], 'Signal_Type'] = 'buy'
            df.at[df.index[i], 'Signal_Price'] = df['Close'].iloc[i]
        elif df['MACD'].iloc[i-1] > df['Signal'].iloc[i-1] and df['MACD'].iloc[i] < df['Signal'].iloc[i]:
            df.at[df.index[i], 'Signal_Type'] = 'sell'
            df.at[df.index[i], 'Signal_Price'] = df['Close'].iloc[i]

    df['Date'] = pd.to_datetime(df['Date']).dt.strftime("%Y-%m-%d")

    indicators = df[['Date', 'MACD', 'Signal', 'Histogram']].rename(columns={
        'MACD': 'macd_line',
        'Signal': 'signal_line',
        'Histogram': 'histogram',
        'Date': 'date'
    }).to_dict(orient='records')
    df['Date'] = pd.to_datetime(df['Date']).dt.strftime('%Y-%m-%d')


    signals = df[df['Signal_Type'] != ''][['Date', 'Signal_Type', 'Signal_Price']].rename(columns={
        'Signal_Type': 'type',
        'Signal_Price': 'price',
        'Date': 'date'
    }).to_dict(orient='records')

    return signals, indicators
