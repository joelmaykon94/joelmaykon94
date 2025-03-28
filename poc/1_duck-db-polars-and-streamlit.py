# https://datavizuniverse.substack.com/p/stunning-charts-with-python
# https://python-graph-gallery.com/web-area-chart-with-different-colors-for-positive-and-negative-values/
import streamlit as st
import polars as pl
import matplotlib.pyplot as plt
import numpy as np
from scipy.interpolate import make_interp_spline


# --------- Dados de exemplo ---------
@st.cache_data
def load_data():
    np.random.seed(42)
    x = np.arange(0, 100)
    y = np.random.randn(100).cumsum()
    return pl.DataFrame({"x": x, "y": y})

df = load_data()



st.subheader("Gráfico Suavizado com Área Colorida")

# Interpolação para suavizar
x = df["x"].to_numpy()
y = df["y"].to_numpy()

x_smooth = np.linspace(x.min(), x.max(), 500)
spl = make_interp_spline(x, y, k=3)  # spline cúbica
y_smooth = spl(x_smooth)

# Separando positivos e negativos suavizados
y_pos_smooth = np.where(y_smooth >= 0, y_smooth, 0)
y_neg_smooth = np.where(y_smooth < 0, y_smooth, 0)

fig, ax = plt.subplots(figsize=(10, 5))

# Gradiente simples simulando preenchimento suave
ax.fill_between(x_smooth, y_pos_smooth, color='#88d498', alpha=0.6, label="Positivo")
ax.fill_between(x_smooth, y_neg_smooth, color='#ff6b6b', alpha=0.6, label="Negativo")

# Linha suavizada
ax.plot(x_smooth, y_smooth, color="#222222", linewidth=1.5)

# Linha zero
ax.axhline(0, color='grey', linewidth=0.8, linestyle='--')

# Estética geral
ax.set_xlabel("X", fontsize=12)
ax.set_ylabel("Y", fontsize=12)
ax.set_title("Área Positiva (Verde) e Negativa (Vermelha)", fontsize=14, fontweight='bold')
ax.legend()

st.pyplot(fig)
