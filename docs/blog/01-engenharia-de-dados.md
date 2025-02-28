---
slug: engenharia-de-dados
title: Engenharia de dados
date: 2024-09-26
nextPost: /blog/engenharia-de-dados/02-ingestao-de-dados
authors:
  name: Joel Maykon
  title: Pesquisador em Inteligência Artificial DIMAp/UFRN
  url: https://github.com/joelmaykon94
  image_url: https://avatars.githubusercontent.com/u/36075156?v=4
tags: [engenharia, dados, ciclo de vida]
---
Para se aprofundar nos fundamentos da engenharia de dados é necessário compreender o seu ciclo, que começa antes mesmo do trabalho de análise pelo engenheiro de dados.

## O Ciclo de vida da engenharia de dados

Em resumo o ciclo inicia com os sistemas gerandos dados, em seguida se realiza a ingestão, transformação, armazenamento e disponibilização dos dados para serem utilizandos em casos de uso que podem ser análises e aprendizado de máquina. O foco principal é obter dados brutos e transforma-los em algo manejavel em diferentes casos de uso. Adiante será apresentado uma estrutura que ajudará a construir o ciclo utilizando os fundamentos como: segurança, gerenciamento de dados, data ops, arquitetura de dados, orquestração e engenharia de software. Para implementar esse ciclo na nuvem na prática será utilizada a infraestrutura da AWS e será construido um pipeline de dados de ponta a ponta.

## Geração de dados em sistemas de origem

A primeira etapa é o engenheiro de dados consumir dados de diferentes fontes, por exemplo um projeto para construir um pipeline para obter dados de e-commerce, que pode possuir dados sobre transações de vendas, catálogo de produtos e outros dados. Pode ser necessário obter dados de redes sociais através de API e conjuntos de dados de pesquisa de mercado ou até mesmo obter dados de dispositivos da Internet da Coisas (IoT) como rastreados GPS para localizar movimentos de entrega de produtos. Esses sistemas estão fora do controle do engenheiro de dados sendo mantidos por outros profissionais como engenheiro de sistemas, porém é importante saber sobre o seu funcionamento para que consiga construir pipelines de dados a partir dessas fontes.

Os sistemas mais comuns são os bancos de dados, que podem ser relacionais ou não relacionais, possivelmente eles interagem com aplicações web ou móvel. Outra forma de consumir dados é utilizando arquivos como texto, audio ou vídeo, podendo existir outros tipos de arquivos. Uma tipo de fonte dados comum é a API que permite realizar chamadas pela web e obter dados em formato JSONou XML. Como mencionado os dispositivos de IoT podem existir em grupos conhecidos com enxame de dispositivos IoT, gerando grande quantidades de dados normalmente em tempo real. São dados em formato de streaming e salvo em algum banco de dados que podem ser acessados através de uma API.

O ideal seria receber os dados de acordo com o esperado e de forma consistente, porém esses sistemas são imprevisíveis, podendo ficar fora do ar ou até mesmo sofrendo alterações complicando os esquemas já definidos pelo engenheiro de dados, que pode interromper o fluxo de trabalho e deixando muitos stakeholders insatifeitos.
É essencial entender que as configurações dos sistemas e possíveis mudanças possam ser mapeadas, bem interessante procurar os responsáveis pela propriedade do sistema e ter bons relacionamentos com as pessoas envolvidas na gestão dos sistemas para conseguir ter um projeto de dados de sucesso.