# Local SonarQube Setup

Configuração local para monitoramento de qualidade de código, segurança e dívida técnica utilizando Docker.

## Como iniciar o SonarQube

1. **Subir os containers:**
   No diretório `@devops/sonarqube`, execute:
   ```bash
   docker-compose up -d
   ```

2. **Acessar o Painel:**
   Aguarde alguns instantes para o serviço iniciar e acesse:
   [http://localhost:9000](http://localhost:9000)
   - **Login Padrão:** `admin`
   - **Senha Padrão:** `admin` (será solicitado a alteração no primeiro acesso)

## Como rodar o Scan no seu projeto (Linux)

Você precisará do `sonar-scanner` instalado na sua máquina ou rodá-lo via Docker.

### 1. Criar um Token
No painel do SonarQube, vá em **My Account > Security** e gere um "User Token".

### 2. Executar o Scanner
No diretório raiz do projeto (`joelmaykon94`), onde está o arquivo `sonar-project.properties`, execute o comando abaixo:

**Via Docker (recomendado para Linux):**
```bash
docker run \
    --rm \
    --network="host" \
    -e SONAR_HOST_URL="http://localhost:9000" \
    -e SONAR_TOKEN="SEU_TOKEN_AQUI" \
    -v "$(pwd):/usr/src" \
    sonarsource/sonar-scanner-cli
```

### Configuração por Linguagem
- **Java:** Para projetos Maven, você pode usar o comando: `mvn sonar:sonar -Dsonar.login=SEU_TOKEN`
- **Angular/React:** O scanner automático já mapeia os arquivos `.ts` e `.tsx` definidos no properties.
- **Python:** Certifique-se de que o scanner tem acesso ao ambiente virtual para melhores resultados de análise.

---
Baseado no guia: [Setting up SonarQube Locally](https://dev.to/ajmal_hasan/setting-up-sonarqube-locally-for-react-native-mern-projects-3hgn)
