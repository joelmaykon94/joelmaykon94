# Zero Trust em Microserviços Financeiros

Em ambientes financeiros, o perímetro de rede é uma ilusão. Um container comprometido ou um Security Group mal configurado transforma a "rede interna" em um playground para movimentação lateral.

## Por que desconfiar de tudo?

### 1. Perigo da confiança implícita
Confiar em outro serviço apenas por IP permite **spoofing** ou exploração do serviço comprometido.

### 2. Mindset Zero Trust
Não existe "interno" ou "externo". Cada requisição deve provar:
- **Quem é** (Identidade)
- **O que pode fazer** (Autorização)
- **Em nome de quem age** (Contexto)

### 3. Validação de identidade com mTLS
- Cada serviço possui um certificado único
- Validação mútua antes da conexão
- Conexão só é estabelecida com certificado válido

### 4. Propagação de contexto
- Não basta saber qual serviço chamou
- É preciso garantir que o **usuário original** autorizou a ação
- Use Token Exchange ou validação de escopos em tokens internos

## Na entrevista técnica
Não foque em VPC Peering ou firewalls. Foque em:
- **Identidade de serviço**
- **Defesa em profundidade**

> *"Como você lida com autenticação entre seus serviços hoje? Confia na rede ou valida cada passo?"*