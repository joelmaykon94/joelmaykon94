---
slug: 08-arquitetura-dados
title: Arquitetura dos dados
date: 2024-09-26
prevPost: /blog/07-gestao-dados
nextPost: /blog/09-dataops
authors:
  name: Joel Maykon
  title: Pesquisador em Inteligência Artificial DIMAp/UFRN
  url: https://github.com/joelmaykon94
  image_url: https://avatars.githubusercontent.com/u/36075156?v=4
tags: [engenharia, dados]
---
copia.

## Claro! Aqui está a tradução:

Claro! Aqui está a tradução:

---

Você pode pensar na arquitetura de dados como um roteiro ou um projeto para seus sistemas de dados. Na primeira semana deste curso, falamos sobre a coleta de requisitos e como transformar as necessidades dos stakeholders em requisitos específicos que você pode usar para fazer escolhas de design e tecnologia. Para mapear requisitos para um design bem-sucedido do seu sistema, você precisa pensar como um arquiteto. 

Agora, apenas para esclarecer, no seu papel como engenheiro de dados, dependendo de onde você trabalha, pode ser que você não seja diretamente responsável por tomar decisões de arquitetura e design. Sua organização pode ter alguém na função de arquiteto de dados, que é responsável por estabelecer o design e passar isso para você implementar. No entanto, na minha experiência, ser capaz de pensar como um arquiteto fará de você um profissional mais bem-sucedido como engenheiro de dados. Em algumas circunstâncias, como se você estiver trabalhando em uma pequena startup, pode, de fato, ser tanto o arquiteto quanto o engenheiro. 

De qualquer forma, eu gostaria que alguém tivesse me ensinado a pensar como um arquiteto quando comecei na engenharia de dados. Neste vídeo, vou apresentar brevemente alguns dos princípios-chave que fazem parte do pensamento arquitetônico. Ao longo desses cursos, revisitaremos esses princípios para que você se sinta confiante em suas habilidades para projetar e construir sistemas de dados robustos. 

No nosso livro "Fundamentos da Engenharia de Dados", Matt Housley e eu definimos arquitetura de dados como o design de sistemas para suportar as necessidades de dados em evolução de uma empresa, alcançado por decisões flexíveis e reversíveis, obtidas por meio de uma avaliação cuidadosa de trade-offs. Vamos analisar essa definição. 

Primeiro, você notará que a arquitetura de dados precisa apoiar as necessidades de dados em evolução da organização. Isso significa que um bom design apoia não apenas as necessidades de dados de hoje, mas também as de amanhã. Na prática, isso significa que a arquitetura de dados é um esforço contínuo, em vez de algo que você faz uma vez e pronto. A próxima parte dessa definição diz que um bom design é alcançado por meio de decisões flexíveis e reversíveis. Isso destaca o fato de que as necessidades de dados da sua empresa podem evoluir de maneiras que você não antecipou, e que você precisará atualizar sua arquitetura ao longo do tempo. Se suas escolhas de design iniciais foram flexíveis e reversíveis desde o início, então você terá muito mais facilidade para evoluir sua arquitetura de acordo com as necessidades da organização. Finalmente, na última parte da definição, você verá que tudo isso é alcançado por meio de uma avaliação cuidadosa de trade-offs, que podem incluir trade-offs em desempenho, custo, escalabilidade ou outros parâmetros. 

Agora, vale a pena mencionar que, na época em que praticamente todas as arquiteturas de dados eram construídas como sistemas locais, tomar decisões flexíveis e reversíveis era muito mais difícil, em alguns casos, impossível. Por exemplo, se você decidisse comprar e instalar milhões de dólares em hardware de servidores, provavelmente estaria comprometido com esse sistema por vários anos, gostando ou não. Hoje em dia, com a maioria das arquiteturas de dados sendo construídas na nuvem, você pode, de certa forma, mudar de ideia quantas vezes quiser sobre as escolhas tecnológicas que fez para sua arquitetura, desde que tenha tomado decisões flexíveis e reversíveis desde o início. 

Para expandir um pouco mais essas ideias, vamos dar uma olhada em um conjunto de princípios de boa arquitetura de dados que revisaremos ao longo desses cursos. Antes de entrar nesses princípios, vou apenas dizer que você não precisa se preocupar em memorizar nada agora. Quero apenas dar uma prévia do que está por vir nesses cursos e fazer você começar a pensar como um arquiteto. 

Princípio número um: escolha componentes comuns com sabedoria. Componentes comuns são as partes da sua arquitetura que serão usadas por várias pessoas e equipes em sua organização. Uma boa escolha de componentes comuns é aquela que oferece o conjunto certo de funcionalidades para projetos individuais e, ao mesmo tempo, facilita a colaboração entre equipes. 

Princípio número dois: planeje para falhas. Isso significa exatamente o que diz. Uma boa arquitetura é projetada não apenas para o caso em que tudo está funcionando como esperado, mas também para quando as coisas quebram. 

Princípio número três: projete para escalabilidade. Sistemas escaláveis podem aumentar para atender à demanda conforme necessário e diminuir para minimizar custos quando a demanda recua. Quando você constrói escalabilidade em sua arquitetura, pode ser responsivo a uma demanda em mudança e otimizar custos ao mesmo tempo. 

Princípio número quatro: arquitetura é liderança. Embora o princípio da arquitetura como liderança possa não se aplicar diretamente a você em seu papel como engenheiro de dados, se você trabalhar para pensar como um arquiteto e buscar mentoria de arquitetos de dados, será melhor capaz de liderar e orientar outros membros da equipe à medida que suas habilidades se desenvolvem e você se torna mais sênior. Eventualmente, você pode ocupar o papel de arquiteto de dados. 

Princípio número cinco: esteja sempre arquitetando. Como disse antes, o design da arquitetura não é algo que acontece apenas uma vez. Em vez disso, você estará constantemente avaliando seus sistemas em relação às necessidades em evolução de sua organização e re-arquitetando de forma contínua. 

Princípios seis e sete: construa sistemas desacoplados e tome decisões reversíveis. Um sistema desacoplado é aquele que é construído a partir de componentes individuais que podem ser facilmente trocados por outros sem ter que re-arquitetar todo o sistema. Ao optar por construir com componentes facilmente intercambiáveis assim, você está tomando um conjunto de decisões reversíveis, ou seja, se mudar de ideia ou as necessidades de sua organização evoluírem, poderá facilmente reverter seu conjunto anterior de decisões e trocar componentes de sua arquitetura para atender às novas especificações de design. 

Princípio número oito: priorize a segurança. Já analisamos alguns princípios de segurança, como o princípio do menor privilégio, e mais adiante em nossas discussões sobre arquitetura, abordaremos outros, como o princípio de zero trust. A principal mensagem com todos esses princípios é que a segurança é central ao seu papel como engenheiro de dados. 

Princípio número nove: abrace o FinOps. A estrutura de custos dos dados evoluiu dramaticamente na era da nuvem. O FinOps é um movimento para unir as prioridades empresariais de finanças e DevOps, ou, neste caso, DataOps. Na nuvem, a maioria dos sistemas de dados é paga conforme o uso e é prontamente escalável. Ao abraçar o FinOps, você pode projetar seus sistemas para serem simultaneamente otimizados em termos de custo e potencial geração de receita. 

Essa foi uma rápida visão geral dos princípios-chave de boa arquitetura de dados. Na próxima semana, neste curso, olharemos mais de perto esses princípios e a boa arquitetura de dados em geral. Mas, por enquanto, vamos passar para a próxima corrente subjacente do ciclo de vida da engenharia de dados. Junte-se a mim no próximo vídeo para explorar o DataOps.