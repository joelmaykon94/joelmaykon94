Visão Geral
Dados do mundo real raramente são limpos e, muitas vezes, estão repletos de outliers. Embora um outlier não seja intrinsecamente ruim e possa fornecer informações que contribuem para o insight real, em certos casos ele pode distorcer os resultados do nosso modelo.

Existem muitas técnicas para escalar nossos outliers, mas, em alguns casos, elas podem introduzir viés. Por isso, a escala robusta é importante para ajudar a pré-processar nossos dados. A escala robusta transforma os dados removendo a mediana e escalando-os de acordo com o IQR (Intervalo Interquartílico), ao invés de usar a média e o desvio padrão.

O RobustScaler é adequado para situações onde há apenas alguns outliers em posições extremas. Ao aplicá-lo, o conjunto de dados fica estável e não é muito influenciado pelos outliers, o que o torna útil para o desenvolvimento de qualquer modelo de aprendizado de máquina.