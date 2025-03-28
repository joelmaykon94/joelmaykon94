# Validação de Hiperparâmetros com Validation Curve no SVC

Este repositório apresenta um exemplo de uso da função `validation_curve` do scikit-learn para avaliar o impacto do hiperparâmetro `gamma` no desempenho do modelo `SVC` (Support Vector Classification) utilizando o conjunto de dados Iris.

## Dependências

Certifique-se de ter as seguintes bibliotecas instaladas antes de executar o código:

```bash
pip install numpy matplotlib scikit-learn
```

## Descrição do Código

O código carrega o conjunto de dados Iris e realiza uma análise de validação cruzada para explorar como diferentes valores do hiperparâmetro `gamma` impactam a precisão do modelo `SVC`.

### Etapas do Código:

1. **Carregamento do conjunto de dados**: Utiliza `load_iris()` para carregar o dataset.
2. **Definição do intervalo de hiperparâmetros**: Cria uma faixa de valores para `gamma` usando `np.logspace(-3, 3, 5)`.
3. **Cálculo da curva de validação**:
   - Utiliza `validation_curve` para avaliar a precisão do modelo `SVC` em diferentes valores de `gamma`.
   - A métrica utilizada é `accuracy` e é aplicada uma validação cruzada de 5 folds (`cv=5`).
4. **Visualização dos resultados**: O resultado pode ser plotado para observar o impacto do hiperparâmetro na performance do modelo.

## Exemplo de Uso

O seguinte trecho de código pode ser adicionado para visualizar a curva de validação:

```python
import matplotlib.pyplot as plt
import numpy as np

# Média e desvio padrão dos scores
train_mean = np.mean(train_scores, axis=1)
test_mean = np.mean(test_scores, axis=1)

plt.figure(figsize=(8, 6))
plt.plot(param_range, train_mean, label="Training score", color="blue", marker="o")
plt.plot(param_range, test_mean, label="Cross-validation score", color="green", marker="s")
plt.xscale("log") 
plt.xlabel("Gamma")
plt.ylabel("Accuracy")
plt.title("Validation Curve for SVC (gamma parameter)")
plt.legend(loc="best")
plt.show()
```

## Conclusão

A curva de validação nos ensina como os hiperparâmetros afetam o desempenho do modelo. Utilizando essa técnica, podemos encontrar o valor ótimo para o hiperparâmetro e estimá-lo de forma mais precisa do que apenas confiando na divisão simples de treino e teste.

Experimente usar a curva de validação no seu processo de desenvolvimento de modelos para guiar a construção do melhor modelo possível e evitar problemas como overfitting.

