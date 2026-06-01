# Local Infrastructure Setup (SonarQube & Floci)

Este diretório centraliza a configuração da infraestrutura local para desenvolvimento, monitoramento de qualidade e emulação de serviços cloud.

## Serviços Inclusos

- **SonarQube:** Análise de qualidade de código, segurança e dívida técnica.
- **Floci:** Emulador leve de serviços AWS (S3, RDS, Lambda, SQS, etc.).
- **Postgres:** Banco de dados para o SonarQube.

## Como Iniciar

1.  **Acesse o diretório:**
    ```bash
    cd @devops
    ```

2.  **Suba os containers:**
    O comando abaixo lerá o arquivo `.env` automaticamente para configurar ambos os serviços.
    ```bash
    docker-compose up -d
    ```

3.  **Acesse as interfaces:**
    - **SonarQube:** [http://localhost:9000](http://localhost:9000) (Login: `admin` / `admin`)
    - **Floci API:** [http://localhost:4566](http://localhost:4566)

## Configuração (.env)

O arquivo `.env` centraliza as variáveis de ambiente. Você pode ajustar portas, versões de imagens e credenciais lá. 

**Exemplo de variáveis AWS para clientes locais:**
```bash
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
export AWS_ENDPOINT_URL=http://localhost:4566
```

## Rede Docker

Todos os serviços rodam na rede `sonarnet`. Isso permite que, por exemplo, uma função Lambda executada pelo Floci consiga se conectar ao SonarQube usando o nome do host `sonarqube`.

## Como rodar o Scan no seu projeto (Linux)

Execute o comando abaixo na **raiz do projeto**, referenciando o arquivo de configuração dentro da pasta `@devops`:

**Via Docker:**
```bash
docker run \
    --rm \
    --network="host" \
    -e SONAR_HOST_URL="http://localhost:9000" \
    -e SONAR_TOKEN="SEU_TOKEN_AQUI" \
    -v "$(pwd):/usr/src" \
    sonarsource/sonar-scanner-cli \
    -Dproject.settings=@devops/sonar-project.properties
```
