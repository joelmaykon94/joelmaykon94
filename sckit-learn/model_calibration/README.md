# Calibração de Modelos de Machine Learning com Scikit-Learn

## Introdução

Ao desenvolver um modelo classificador de machine learning, é essencial garantir não apenas a precisão das previsões, mas também que as probabilidades associadas sejam confiáveis. Esse processo é conhecido como **calibração**.

A calibração ajusta a estimativa de probabilidade do modelo para que ela reflita melhor a verdadeira chance de ocorrência do evento previsto. Um modelo não calibrado pode apresentar previsões superconfiantes ou subestimadas. Por exemplo, um modelo pode prever um evento com 90% de probabilidade, enquanto a taxa real de sucesso é muito menor, indicando um excesso de confiança.

Com a calibração, aumentamos a confiabilidade das previsões e fornecemos informações mais precisas sobre o risco real associado às previsões do modelo.

## Objetivo do Projeto

Este repositório apresenta um exemplo prático de calibração de modelos utilizando a biblioteca Scikit-Learn. Vamos:

- Utilizar o conjunto de dados **Breast Cancer**.
- Treinar um modelo de **Regressão Logística**.
- Comparar a performance do modelo original e do modelo calibrado.
- Visualizar as curvas de calibração.

## Dependências

Antes de rodar o código, instale as bibliotecas necessárias com:

```bash
pip install numpy matplotlib scikit-learn
```

## Execução do Código

### 1. Importação das Bibliotecas e Carregamento dos Dados

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import calibration_curve, CalibratedClassifierCV
from sklearn.model_selection import train_test_split

# Carregar os dados
data = load_breast_cancer()
X, y = data.data, data.target

# Dividir os dados em treino e teste
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)
```

### 2. Treinamento do Modelo Original

```python
# Treinar o modelo de Regressão Logística
lr = LogisticRegression().fit(X_train, y_train)

# Obter as probabilidades previstas
prob_pos_lr = lr.predict_proba(X_test)[:, 1]

# Gerar a curva de calibração
fraction_lr, mean_pred_lr = calibration_curve(y_test, prob_pos_lr, n_bins=10)
```

### 3. Calibração do Modelo

```python
# Aplicar calibração isotônica ao modelo
calibrated_clf = CalibratedClassifierCV(lr, cv='prefit', method='isotonic')
calibrated_clf.fit(X_train, y_train)

# Obter as novas probabilidades calibradas
prob_pos_calibrated = calibrated_clf.predict_proba(X_test)[:, 1]

# Gerar a curva de calibração do modelo calibrado
fraction_cal, mean_pred_cal = calibration_curve(y_test, prob_pos_calibrated, n_bins=10)
```

### 4. Visualização da Calibração

```python
plt.figure(figsize=(8, 6))
plt.plot(mean_pred_lr, fraction_lr, marker='o', label='Original LR')
plt.plot(mean_pred_cal, fraction_cal, marker='s', label='Calibrated LR (Isotonic)')
plt.plot([0, 1], [0, 1], linestyle='--', label='Perfect Calibration')
plt.xlabel("Mean predicted probability")
plt.ylabel("Fraction of positives")
plt.title("Calibration Curve Comparison")
plt.legend(loc="upper left")
plt.show()
```

## Resultados e Conclusão

A curva de calibração mostra que a **Regressão Logística calibrada** está mais próxima do modelo ideal (linha pontilhada) do que a versão original. Isso significa que a calibração melhora a capacidade do modelo de estimar riscos reais de forma mais precisa.

Embora a calibração não torne o modelo perfeito, ela pode reduzir a superconfiança e fornecer previsões mais realistas. 

Experimente aplicar esse método para melhorar a confiabilidade dos modelos de machine learning em seus projetos!