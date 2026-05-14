import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
  icon: string;
  colSpan: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Sistemas Distribuídos',
    icon: '🌐',
    colSpan: 'col--8',
    description: (
      <>
        Arquiteturas de microsserviços resilientes utilizando Java (Spring Boot/Quarkus) 
        e mensageria assíncrona com Kafka e RabbitMQ. Foco em alta disponibilidade e 
        consistência eventual.
      </>
    ),
  },
  {
    title: 'IA & LLMs',
    icon: '🤖',
    colSpan: 'col--4',
    description: (
      <>
        Integração de Inteligência Artificial Generativa, RAG pipelines com LangChain 
        e otimização de fluxos com LLMs para escala de milhões de usuários.
      </>
    ),
  },
  {
    title: 'Cloud & Kubernetes',
    icon: '☁️',
    colSpan: 'col--4',
    description: (
      <>
        Especialista em ecossistema AWS e orquestração Kubernetes. Infraestrutura como 
        Código (IaC) com Terraform e CloudFormation.
      </>
    ),
  },
  {
    title: 'Excelência em Engenharia',
    icon: '🏗️',
    colSpan: 'col--8',
    description: (
      <>
        Aplicação rigorosa de Clean Architecture, DDD e SOLID. Cultura de testes 
        (TDD/BDD) e automação de entrega contínua com ArgoCD e GitLab CI.
      </>
    ),
  },
];

function Feature({title, description, icon, colSpan}: FeatureItem) {
  return (
    <div className={clsx('col', colSpan, 'margin-bottom--lg')}>
      <div className={styles.bentoItem}>
        <div className={styles.iconWrapper}>{icon}</div>
        <Heading as="h3" className={styles.bentoTitle}>{title}</Heading>
        <p className={styles.bentoDescription}>{description}</p>
        <div className={styles.bentoGlow} />
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.featuresSection}>
      <div className="container">
        <Heading as="h2" className={styles.sectionHeading}>
          Expertise Técnica
        </Heading>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
