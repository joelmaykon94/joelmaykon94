import streamlit as st
import polars as pl
import duckdb
import matplotlib.pyplot as plt
import numpy as np

# --------- Dados de exemplo ---------
@st.cache_data
def load_data():
    np.random.seed(42)
    x = np.arange(0, 100)
    y = np.random.randn(100).cumsum()
    return pl.DataFrame({"x": x, "y": y})

df = load_data()

# --------- Consulta com DuckDB ---------
st.header("Exemplo Streamlit + Polars + DuckDB")

query = """
SELECT x, y FROM df WHERE x BETWEEN 20 AND 80
"""
result = duckdb.query(query).to_df()

st.subheader("Resultado filtrado com DuckDB")
st.dataframe(result)

# --------- Gráfico estilo python-graph-gallery ---------
st.subheader("Gráfico de Área com Cores Diferentes para Positivos e Negativos")

fig, ax = plt.subplots(figsize=(10, 5))

# Áreas positivas
ax.fill_between(result["x"], result["y"], where=(result["y"] >= 0), interpolate=True, color='green', alpha=0.5, label="Positivo")

# Áreas negativas
ax.fill_between(result["x"], result["y"], where=(result["y"] < 0), interpolate=True, color='red', alpha=0.5, label="Negativo")

ax.plot(result["x"], result["y"], color="black", linewidth=1)

ax.axhline(0, color='grey', linewidth=0.8, linestyle='--')
ax.legend()
ax.set_xlabel("X")
ax.set_ylabel("Y")
ax.set_title("Área Positiva (Verde) e Negativa (Vermelha)")

st.pyplot(fig)
