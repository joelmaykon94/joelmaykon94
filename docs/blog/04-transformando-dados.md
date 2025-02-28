---
slug: 04-transformando-dados
title: Transformando dados
date: 2024-09-26
prevPost: /blog/03-armazenamento-de-dados
nextPost: /blog/05-servindo-dados
authors:
  name: Joel Maykon
  title: Pesquisador em Inteligência Artificial DIMAp/UFRN
  url: https://github.com/joelmaykon94
  image_url: https://avatars.githubusercontent.com/u/36075156?v=4
tags: [engenharia, dados]
---
Transformando dados no ciclo de vida...
## Copia

Claro! Aqui está a tradução:

---

A etapa de transformação do ciclo de vida da engenharia de dados é realmente onde você, como engenheiro de dados, começa a agregar valor. Isso acontece porque a etapa anterior à transformação, que consiste em ingerir e armazenar dados brutos de sistemas de origem, não agrega valor direto aos stakeholders downstream. Como eu disse antes, no seu papel como engenheiro de dados, a visão geral é que você obtém dados brutos de algum lugar, transforma-os em algo útil e, em seguida, os disponibiliza para os usuários finais. A transformação é a etapa em que você transforma os dados em algo útil.

Em termos de como "útil" se apresenta, imagine, por exemplo, um analista de negócios como seu usuário downstream. Digamos que ele tenha a tarefa de relatar vendas diárias em uma variedade de produtos. Ele pode precisar de informações como IDs de clientes, nomes de produtos, preços, quantidades, horários de venda, e assim por diante. Embora os analistas de dados frequentemente sejam fluentes em SQL, eles contarão com você para transformar os dados brutos e fornecê-los em um formato que seja rápido e fácil de consultar.

Como outro exemplo, imagine um cientista de dados ou engenheiro de machine learning como seu usuário downstream. Além do SQL, eles podem ser fluentes em várias abordagens potenciais para a transformação de dados, mas sua função principal é realmente usar os dados para análises preditivas, e você pode fornecer um valor enorme a eles ao lidar com a transformação dos dados em estruturas e características que podem ser usadas diretamente para o treinamento de modelos ou análise.

Chamamos essa parte do ciclo de vida da engenharia de dados de transformação. Mas, na realidade, a etapa é composta por três partes: consultas, modelagem e transformação. Eu incluo consultas e modelagem como separadas da transformação aqui porque esses são componentes críticos de qualquer pipeline de dados que realmente agregam valor quando bem feitos e apresentam riscos quando mal executados.

Para ilustrar esse ponto, vamos começar com consultas. Quando você consulta dados, está emitindo um pedido para ler registros de um banco de dados ou de outros sistemas de armazenamento. Por exemplo, você pode precisar consultar dados tabulares e semiestruturados que estão em um data warehouse na nuvem. Existem muitas linguagens que você pode usar para consultar dados, mas neste curso, vamos nos concentrar na linguagem de consulta estruturada, ou SQL, que continua sendo uma linguagem de consulta popular e universal. Sua consulta pode envolver limpar, juntar e agregar dados de muitos conjuntos de dados. Você pode usar expressões SQL para filtrar os dados, de modo que apenas registros específicos sejam recuperados. Não se preocupe se você ainda não estiver familiarizado com os comandos SQL que vê aqui no slide. Em cursos posteriores, você terá a chance de aprender os conceitos básicos de SQL por meio de laboratórios práticos.

Há mais de uma maneira de escrever uma consulta, e consultas mal escritas podem ter consequências negativas, como impactar o desempenho de um banco de dados de origem ou causar uma situação conhecida como "explosão de linhas", onde uma consulta que inclui o que é conhecido como um "join" entre tabelas produz muitos mais registros do que você esperava, o que pode sobrecarregar sua infraestrutura de armazenamento. Em outras circunstâncias, consultas mal escritas podem apenas ser lentas ou amplas e causar atrasos downstream em relatórios ou análises. Na prática, a maioria dos engenheiros de dados pode ler e escrever SQL, mas não está familiarizada com o funcionamento interno das consultas. Isso pode ter consequências imprevistas nas arquiteturas que eles constroem. Vamos entrar nos detalhes de como as consultas funcionam no terceiro curso da especialização.

A próxima coisa que quero discutir é a modelagem de dados. Um modelo de dados representa a forma como os dados se relacionam com o mundo real. A modelagem de dados envolve escolher deliberadamente uma estrutura coerente para seus dados e é um passo crucial para tornar os dados úteis para o negócio. Por exemplo, voltando ao caso do analista de negócios que precisa criar relatórios de vendas de produtos, você pode ter ingerido dados chamados de normalizados a partir de um banco de dados relacional de origem que contém tabelas separadas para informações sobre produtos, detalhes de pedidos, informações sobre clientes, e assim por diante. Esses dados muitas vezes têm relacionamentos complexos entre si. Para atender às necessidades desse analista, pode ser necessário fazer o que é chamado de desnormalização desses dados para modelá-los de uma maneira que permita aos analistas consultar rapidamente e obter os dados de que precisam para os relatórios. Um bom modelo de dados é projetado para refletir da melhor forma os processos, definições, fluxos de trabalho e lógica da sua organização. Por exemplo, o termo "cliente" pode significar coisas diferentes para diferentes departamentos da sua empresa. Para ter sucesso na modelagem de dados, você precisa trabalhar com as partes interessadas para entender a terminologia delas, como o que a palavra "cliente" significa para elas, assim como os objetivos de negócios para os dados. Você aprenderá mais sobre modelagem de dados e normalização no quarto curso da especialização.

Além de consultar e modelar os dados, os dados também devem ser transformados, ou seja, manipulados, aprimorados e preparados para uso downstream. Como mencionei antes, você normalmente transformará os dados várias vezes ao longo do ciclo de vida da engenharia de dados. Por exemplo, os dados podem ser transformados antes mesmo de você tocá-los, como ter um carimbo de data/hora adicionado a um registro enquanto ainda está em um sistema de origem, ou você pode aplicar transformações enquanto seus dados estão em trânsito durante a ingestão. Imediatamente após a ingestão, pode haver transformações básicas para mapear os dados aos tipos corretos e colocar registros em formatos padronizados. Você pode enriquecer um registro dentro de um pipeline de streaming com campos e cálculos adicionais antes que ele seja enviado a um data warehouse. Ainda mais downstream, você pode transformar o esquema dos dados e aplicar desnormalização, agregação em larga escala para relatórios ou dados com características para o treinamento de modelos de machine learning.

Ao longo destes cursos, você estará envolvido em muitos exercícios práticos envolvendo consultas, modelagem e transformação de dados. Por enquanto, vamos seguir para o próximo vídeo, onde veremos a etapa final do ciclo de vida da engenharia de dados: servir dados para casos de uso downstream.

--- 

Se precisar de mais ajuda, é só avisar!