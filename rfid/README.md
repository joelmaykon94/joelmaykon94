# MVP - Sistema de Gerenciamento com RFID

Este repositório contém o planejamento para o desenvolvimento de um MVP de um sistema que utiliza RFID, aprendizado de máquina, Streamlit e FastAPI para rastrear produtos, evitar perdas e integrar com sistemas ERP.

---

## **Objetivo**
- Criar um sistema básico para gravação, leitura e rastreamento de tags RFID.
- Rastrear a cadeia de suprimentos, mostrando status de vendas e integrando com ERP.
- Implementar funcionalidades para prevenir perdas (furtos e erros de pedidos).
- Fornecer uma interface intuitiva com Streamlit e uma API REST para automação.

---

## **Funcionalidades Principais**
1. **Gerenciamento de RFID**:
   - Escrever e ler informações em tags RFID.
   - Associar tags a produtos e rastreá-los em tempo real.

2. **Monitoramento da Cadeia de Suprimentos**:
   - Histórico completo de movimentação dos produtos.
   - Status dos itens (armazenamento, transporte, em loja, vendido).

3. **Prevenção de Perdas**:
   - Detecção de furtos e erros de pedidos com aprendizado de máquina.
   - Identificação de padrões anômalos.

4. **Integração com ERP**:
   - Sincronizar estoque e status de vendas com ERP via API.

5. **Interface de Controle (Streamlit)**:
   - Dashboard para visualização de rastreamento e relatórios.
   - Configuração do sistema e gerenciamento de produtos.

6. **API REST**:
   - Endpoints para:
     - Registro e consulta de tags RFID.
     - Rastreamento de produtos.
     - Integração com ERP.

---

## **Arquitetura do Sistema**

### **Tecnologias**
- **Frontend**: Streamlit.
- **Backend**: FastAPI.
- **Banco de Dados**: PostgreSQL ou SQLite.
- **Hardware**: Leitores RFID (ex.: MFRC522).
- **Machine Learning**: Scikit-learn ou PyTorch.
- **ERP Integration**: Webhooks ou APIs.

### **Fluxo de Dados**
1. **RFID Tag**: Escreve e lê informações do produto.
2. **Backend**: Processa dados, atualiza o banco e expõe API REST.
3. **Streamlit Dashboard**: Exibe informações e relatórios.
4. **Machine Learning**: Detecta anomalias.
5. **ERP**: Sincroniza status de vendas e estoque.

---

## **Estrutura do Projeto**

```plaintext
mvp_rfid/
├── app/                  # Backend (FastAPI)
│   ├── api/              # Endpoints REST
│   ├── models/           # Modelos de dados
│   ├── services/         # Regras de negócio
├── dashboard/            # Interface (Streamlit)
├── ml/                   # Modelos de aprendizado de máquina
├── rfid/                 # Controle do hardware RFID
├── tests/                # Testes unitários e de integração
├── docker-compose.yml    # Configuração do Docker Compose
├── Dockerfile            # Dockerfile principal
└── requirements.txt      # Dependências
```

## Tutorial do Raspberry Pi Pico & RFID
[![Video Title](https://img.youtube.com/vi/hV9GTqXLMpg/0.jpg)](https://www.youtube.com/watch?v=hV9GTqXLMpg)