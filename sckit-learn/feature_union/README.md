O Feature Union é um recurso do Scikit-Learn que combina várias transformações de características dentro de um pipeline. Em vez de transformar as mesmas características sequencialmente, o Feature Union aplica os dados simultaneamente a vários transformadores para fornecer todas as características transformadas.

Essa funcionalidade é extremamente útil quando diferentes transformadores são necessários para capturar vários aspectos dos dados e precisam estar presentes no conjunto de dados. Por exemplo, um transformador pode ser usado para aplicar a técnica PCA (Principal Component Analysis), enquanto outros podem aplicar o Robust Scaling.

Neste exemplo, vamos utilizar o FeatureUnion para combinar transformadores como o PCA e o transformador de Características Polinomiais.