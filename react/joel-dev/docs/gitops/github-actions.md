---
title: "CI com GitHub Actions"
sidebar_label: "GitHub Actions"
---

# <MdCode style={{verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-storm-cloud)'}} /> CI com GitHub Actions

import { MdCode, MdBuild, MdCloudUpload } from 'react-icons/md';

O GitHub Actions é responsável por automatizar o build, os testes e o envio das imagens para o registro.

---

## 🛠️ Exemplo de Workflow

Abaixo um exemplo de um workflow que compila uma aplicação Java e gera uma imagem Docker.

```yaml title=".github/workflows/main.yml"
name: Build and Push Docker Image

on:
  push:
    branches: [ "main" ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 21
      uses: actions/setup-java@v3
      with:
        java-version: '21'
        distribution: 'temurin'
        
    - name: Build with Maven
      run: mvn clean package
      
    - name: Build & Push to Docker Hub
      uses: docker/build-push-action@v4
      with:
        push: true
        tags: joelmaykon/app:latest
