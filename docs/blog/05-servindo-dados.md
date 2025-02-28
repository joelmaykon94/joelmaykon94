---
slug: 05-servindo-dados
title: Servindo dados
date: 2024-09-26
prevPost: /blog/04-transformando-dados
nextPost: /blog/06-seguranca-dados
authors:
  name: Joel Maykon
  title: Pesquisador em Inteligência Artificial DIMAp/UFRN
  url: https://github.com/joelmaykon94
  image_url: https://avatars.githubusercontent.com/u/36075156?v=4
tags: [engenharia, dados]
---
copia.

## Copia

Claro! Aqui está a tradução:

---

Uma vez que você tenha ingerido, transformado e armazenado seus dados, você está pronto para a fase final do ciclo de vida da engenharia de dados. A etapa de servir dados vai além de apenas disponibilizar dados. É realmente quando você dá aos stakeholders a oportunidade de extrair valor comercial dos dados. E, como mencionei na semana passada, valor significa coisas diferentes para diferentes partes interessadas. Em geral, os dados têm valor quando são usados para casos de uso práticos, como análises, machine learning, reverse ETL ou outros casos de uso. Neste vídeo, em vez de discutir mecanismos específicos para servir dados, faremos uma breve análise de cada um desses casos de uso para fornecer mais contexto sobre como servir dados pode parecer diferente em diferentes cenários mais adiante. No quarto curso, entraremos nos detalhes de como exatamente você servirá dados para cada um desses casos de uso.

Vamos começar com análises, que é o processo de identificar insights e padrões-chave dentro dos dados. Como engenheiro de dados, você quase certamente servirá dados que alimentam uma ou mais das três formas mais comuns de análises: inteligência de negócios, análises operacionais e análises embutidas. A inteligência de negócios, ou BI, é onde os analistas exploram dados históricos e atuais do negócio para descobrir insights. Como engenheiro de dados, você servirá dados que, em última instância, serão apresentados na forma de relatórios ou painéis que ajudam os usuários a tomar decisões estratégicas e acionáveis. Por exemplo, analistas das equipes de vendas e marketing usarão relatórios e painéis de BI para identificar padrões e tendências, além de monitorar aspectos como o engajamento em campanhas de marketing, vendas regionais e métricas de experiência do cliente. Ou imagine um cenário em que um analista observa um aumento repentino nas devoluções de produtos. Ele pode então investigar relatórios ou painéis existentes para comparar esse fenômeno com tendências históricas. Também pode puxar mais dados executando consultas SQL contra o banco de dados que você forneceu ou pedir que você disponibilize dados adicionais para análises ad hoc.

Em contraste com a natureza reflexiva ou orientada a insights do BI, as análises operacionais tratam de monitorar dados em tempo real para ações imediatas. Por exemplo, uma equipe de uma plataforma de e-commerce pode precisar monitorar um painel com métricas de desempenho em tempo real do site. Se o site cair por algum motivo, seja devido a um aumento no tráfego de usuários ou um data center offline, eles precisam saber imediatamente para que possam triá-lo e colocar o site de volta no ar. E, nesse caso, seu papel como engenheiro de dados seria ingerir, transformar e servir dados de eventos dos logs da aplicação do site para preencher o painel da equipe da plataforma.

Enquanto o BI e as análises operacionais são práticas de dados focadas internamente que estão em uso há várias décadas, uma tendência um pouco mais nova é a análise embutida, voltada para o cliente. Você provavelmente já interagiu com uma variedade de aplicações de análises embutidas. Por exemplo, seu banco pode fornecer painéis que mostram tendências históricas em seus gastos ou como suas compras se distribuem entre diferentes categorias, como alimentação, varejo e utilidades. Ou talvez você tenha um termostato inteligente em sua casa que está conectado a um aplicativo móvel. O aplicativo pode mostrar a temperatura atual dentro de sua casa, além de métricas históricas, como temperatura ao longo do tempo. Quando se trata de análises embutidas, como engenheiro de dados, seu trabalho seria servir dados em tempo real e históricos para uso em aplicações voltadas para o usuário.

Com o aumento do machine learning nas últimas décadas, é bastante provável que seu papel como engenheiro de dados envolva servir dados para casos de uso de machine learning. E estes cursos tratarão o machine learning como separado de outros casos de uso de servir dados, simplesmente porque pode envolver complexidades adicionais que queremos examinar em detalhes. Por exemplo, em um caso de uso de machine learning, você pode ser responsável por servir armazenamentos de características de dados que facilitem o treinamento de modelos, e você também pode precisar servir dados para inferência em tempo real ou apoiar sistemas de metadados e catalogação que rastreiam a história e a linhagem dos dados. Vamos olhar mais de perto todos esses cenários mais adiante nestes cursos.

Além de análises e machine learning, outro caso de uso comum para servir dados é o que hoje é chamado de reverse ETL. Com o reverse ETL, você pegará dados transformados, bem como análises e, talvez, a saída de um modelo de machine learning, e os alimentará de volta em sistemas de origem. Por exemplo, digamos que você tenha ingerido dados de um sistema de gestão de relacionamento com clientes, ou CRM, e isso pode incluir informações como nomes, dados de contato, dados de formulários ou outras informações relevantes dos clientes, e você então transformou os dados no formato apropriado e os armazenou em um data warehouse. Os analistas podem então recuperar os dados para treinar um modelo de pontuação de leads, que é um modelo que tenta indicar quais clientes são os mais promissores para vários engajamentos ou ofertas de produtos. Os resultados do modelo podem então ser retornados ao data warehouse e empurrados de volta para o CRM como uma melhoria dos dados dos clientes já armazenados lá.

Agora, só vou dizer que o nome reverse ETL para esse processo não é tanto uma tentativa de descrever o que está acontecendo, mas sim a falta de um nome melhor para descrever esse processo que já existe há bastante tempo. De qualquer forma, essa prática está se tornando cada vez mais comum, e no seu trabalho como engenheiro de dados, é provável que você esteja envolvido em reverse ETL, ou como quer que seja chamado no futuro, como parte do seu papel.

E com isso, fizemos uma rápida análise de todas as fases do ciclo de vida da engenharia de dados, incluindo sistemas de origem, ingestão, transformação, armazenamento e serviço. Na próxima lição, mudaremos nosso foco para as correntes subjacentes do ciclo de vida para abordar todas essas fases. Vejo você na próxima lição.

Temos observado o ciclo de vida da engenharia de dados e como você irá ingerir dados de sistemas de origem, transformá-los, armazená-los e servi-los aos usuários finais. Como campo, a engenharia de dados está se desenvolvendo rapidamente; há apenas uma década, o papel de um engenheiro de dados estava principalmente focado na camada de tecnologia. A contínua abstração e simplificação das ferramentas ampliou o escopo desse papel. A engenharia de dados agora abrange muito mais do que apenas ferramentas e tecnologias. Em outras palavras, o campo está subindo na cadeia de valor, o que é uma ótima notícia para você como engenheiro de dados. A engenharia de dados moderna incorpora práticas tradicionais de empresas, como gerenciamento de dados e otimização de custos, bem como práticas mais novas, como DataOps.

Quando se trata do trabalho de um engenheiro de dados, há um conjunto de práticas que se aplicam ao seu trabalho em todo o ciclo de vida. No livro "Fundamentos da Engenharia de Dados", descrevemos essas práticas como as correntes subjacentes do ciclo de vida da engenharia de dados. Essas correntes incluem segurança, gerenciamento de dados, DataOps, arquitetura de dados, orquestração e engenharia de software. Nos próximos vídeos, vamos analisar mais de perto cada uma dessas correntes. Depois disso, você começará a explorar como o ciclo de vida de dados e as correntes subjacentes se concretizam na prática na AWS Cloud. Vamos começar.

