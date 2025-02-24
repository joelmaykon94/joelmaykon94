import pandas as pd
import numpy as np

def optimize_dataframe(df):
    # Converter colunas Object para Category
    for col in df.select_dtypes(include='object').columns:
        df[col] = df[col].astype('category')
    
    # Converter colunas Float64 para Float32
    for col in df.select_dtypes(include='float64').columns:
        # Verifica se a conversão para float32 mantém os valores
        if np.allclose(df[col], df[col].astype('float32'), equal_nan=True):
            df[col] = df[col].astype('float32')
    
    # Converter colunas Int64 para Int32
    for col in df.select_dtypes(include='int64').columns:
        # Verifica se os valores cabem dentro do range de Int32
        if df[col].min() >= np.iinfo('int32').min and df[col].max() <= np.iinfo('int32').max:
            df[col] = df[col].astype('int32')
    
    return df