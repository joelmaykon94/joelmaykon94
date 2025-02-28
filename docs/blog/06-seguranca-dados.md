---
slug: 06-seguranca-dados
title: Segurança dos dados
date: 2024-09-26
prevPost: /blog/05-servindo-dados
nextPost: /blog/07-gestao-dados
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

Antes de entrar em como a segurança se aplica ao seu papel como engenheiro de dados, gostaria que você pensasse por um momento sobre como as preocupações de segurança se aplicam aos seus próprios dados pessoais no dia a dia. Por exemplo, você provavelmente não divulga suas informações bancárias para qualquer pessoa e não publica as senhas de todas as suas contas online onde outras pessoas possam vê-las. Da mesma forma, você não entregaria as chaves da sua casa a alguém que não conhece. No seu papel como engenheiro de dados, você é responsável por dados sensíveis, seja as informações pessoais e privadas de seus clientes ou informações empresariais confidenciais. Os proprietários desses dados confiam que você manterá suas informações seguras. É importante reconhecer seu papel em reunir o conjunto certo de princípios, protocolos e práticas culturais para garantir a segurança nos sistemas que você constrói. Neste vídeo, abordarei alguns desses princípios fundamentais e melhores práticas para a segurança dos dados.

Ao gerenciar um pipeline de dados e fornecer dados a usuários finais, você precisará conceder acesso aos dados e recursos do sistema a outros usuários ou aplicações. Um princípio de segurança chave a ser lembrado ao fazer isso é o princípio do menor privilégio. Isso significa que você deve dar a usuários ou aplicações acesso apenas aos dados e recursos essenciais que eles precisam para realizar suas tarefas e apenas pela duração necessária. Você precisa aplicar o princípio do menor privilégio não apenas a outros em sua organização, mas também a si mesmo. Isso significa, por exemplo, que assim como você não dá acesso de administrador a todos, em seu próprio trabalho, não opere a partir do shell root quando não for necessário e não use permissões de administrador ou superusuário, a menos que seja absolutamente essencial.

Quando você pensa em como proteger melhor os dados no seu trabalho, deve considerar não apenas o acesso aos dados, mas também a sensibilidade dos dados. Aderir ao princípio do menor privilégio significa tornar informações sensíveis visíveis aos usuários apenas quando absolutamente necessário. Além disso, a melhor maneira de proteger dados sensíveis é não ingeri-los no seu sistema em primeiro lugar. Se você não tiver um propósito claro para ingerir e armazenar dados sensíveis, simplesmente não faça isso, e você terá removido completamente o risco de vazar acidentalmente esses dados.

No mundo atual, centrado na nuvem, a segurança assume mais uma dimensão, uma que exige que você entenda coisas como gerenciamento de identidade e acesso, métodos de criptografia e protocolos de rede. Você verá mais sobre esses tópicos ao longo da especialização, à medida que aprofundarmos a segurança dos seus pipelines de dados. Além disso, a segurança não se trata apenas de princípios e protocolos, mas também de pessoas. A segurança começa e termina com você, o indivíduo, assim como com outros indivíduos em sua organização. Quando se trata de segurança, você deve adotar uma mentalidade defensiva. Esteja sempre atento quando solicitado a fornecer credenciais ou dados sensíveis e confidenciais. Imagine cenários potenciais de ataque e vazamento e projete seus pipelines de dados e sistemas de armazenamento com isso em mente.

Em relação a vazamentos de dados no mundo real, pessoas individuais foram a fonte de muitas das maiores violações de segurança. Pessoas ignorando precauções básicas, como compartilhar suas senhas de maneira insegura, pessoas se tornando vítimas de ataques de phishing, onde um invasor tenta roubar informações sensíveis ao se passar por uma figura de autoridade ou alguém em quem confiam, ou pessoas agindo irresponsavelmente enquanto trabalham nos sistemas e dados da empresa. Quando se trata de segurança e engenharia de dados, nunca deixo de me surpreender com a frequência com que vejo engenheiros de dados deixarem um bucket S3 da AWS, um servidor ou um banco de dados exposto à Internet pública quando essa não era a intenção. Existem algumas correções simples para evitar que isso aconteça. Mas muitas vezes vejo isso acontecer porque o engenheiro de dados simplesmente não conhece as melhores práticas de segurança ou esqueceu acidentalmente de aplicá-las.

Quando se trata de segurança em nível organizacional, percebo que, muitas vezes, as organizações são configuradas com uma fachada de segurança. Talvez um conjunto de checklists para mostrar que estão em conformidade com regulamentos ou padrões de conformidade, mas uma verdadeira cultura de segurança está faltando. Essa abordagem de aderir à letra da segurança, sem uma cultura e espírito de segurança, é o que eu chamo de teatro de segurança. A segurança emerge de uma cultura onde cada membro da equipe reconhece seu papel na proteção dos dados e onde todos, de cima a baixo, abraçam a segurança como uma prioridade e um hábito. 

Em sua jornada como engenheiro de dados, lembre-se de que, embora princípios e protocolos, assim como ferramentas e tecnologias, sejam seus aliados ao garantir a segurança dos dados, uma verdadeira cultura de segurança emana de uma compreensão compartilhada de responsabilidades e vulnerabilidades em toda a organização. À medida que avançamos na especialização, você terá experiência prática com considerações de segurança à medida que se aplicam a todos os aspectos da sua arquitetura de dados. No próximo vídeo, veremos a próxima corrente subjacente no ciclo de vida da engenharia de dados: Gestão de Dados.