---
slug: ingestao-de-dados
title: Ingestão de dados
date: 2024-09-26
prevPost: /blog/01-engenharia-de-dados
nextPost: /blog/03-armazenamento-de-dados
authors:
  name: Joel Maykon
  title: Pesquisador em Inteligência Artificial DIMAp/UFRN
  url: https://github.com/joelmaykon94
  image_url: https://avatars.githubusercontent.com/u/36075156?v=4
tags: [engenharia, dados, ingestão]
---
Movendo dados brutos gerados pelos sistemas para o processamento do pipeline de dados posteriormente.

## Começando a arquitetura
Na minha experiência o maior tempo gasto no ciclo de vida de um projeto de dados, é na ingestão de dados e o consumo das fontes de sistemas de origem. Se foi possivel conversar com os proprietários dos sistemas já é um caminho mais tranquilo a ser percorrido, porém quando não temos ciência das alterações que impactam o funcionamento da pipeline e ao longo do tempo esse mudançam podem gerar gargalos no projeto.

A descisão mais crítica que você pode tomar ao projetar a ingestão de dados, a frequência que será necessária para executar a ingestão, com que frequência precisa movimentar os dados para o pipeline de dados. Em resumo podemos dizer que pode ser consumido em lotes quando temos horários predefinidos ou em streaming quando se quer mostrar eventos quase em tempo real.

## Ingestão em lotes
A ingestão por lotes de dados podem ser visto como uma série contínua de eventos, podendo ser a quantidade de visitas em um site, medidas de pulsos de algum aparelho optico ou qualquer outra coisa. O eventos ocorrem de forma continuada e uma maneira mais fácil de realizar o consumo desses dados é definir uma quantidade em tempo ou em tamanho do lote para acionar a ingestão dos dados.

## Ingestão em streaming
Por outro lado quando os sistema fornecem dados que ficam disponíveis em curto espaço de tempo, o processo de ingestão pode ser quase em tempo real, porém precisa escolher as ferramentas adequadas para esse propósito, como usar plataforma de streaming de eventos ou uma fila de mensagens. Por causa de alguns impedimentos essa não é a melhor abordagem para todos os casos de uso relacionados a ingestão de dados, sendo necessário comparar as duas abordagem, lote ou streaming.

Alguns orientações são realizar questionamentos quanto as ações que são melhores em tempo real do que um fluxo de ingestão em lote, qual o custo de cada abordagem, o que a forma escolhinda para ingestão influencia nas próximas etapas do pipeline de dados e assim definir os limites de cada abordagem.

## Suporte a mudanças nos dados
Além da abordagem é importante implementar ações que permitam identificar mudanças nos dados (CDC, em inglês), para que alguns processos durante a ingestão sejam acionados e também pode adotar uma abordagem push ou pull, ou seja se você irar puxar os dados para a ingestão ou se o sistema de origem irá enviar os dados.