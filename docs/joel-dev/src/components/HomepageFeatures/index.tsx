
import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import { MdHub, MdPsychology, MdCloudQueue, MdArchitecture } from 'react-icons/md';
import Translate from '@docusaurus/Translate';

type FeatureItem = {
  title: ReactNode;
  description: ReactNode;
  Icon: React.ElementType;
  colSpan: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: (
      <Translate id="homepage.features.distributed.title">
        Sistemas Distribuídos
      </Translate>
    ),
    Icon: MdHub,
    colSpan: 'col--8',
    description: (
      <Translate id="homepage.features.distributed.description">
        Arquiteturas de microserviços resilientes utilizando Java (Spring Boot/Quarkus) 
        e mensageria assíncrona com Kafka e RabbitMQ. Foco em alta disponibilidade 
        e consistência eventual.
      </Translate>
    ),
  },
  {
    title: (
      <Translate id="homepage.features.ai.title">
        IA & LLMs
      </Translate>
    ),
    Icon: MdPsychology,
    colSpan: 'col--4',
    description: (
      <Translate id="homepage.features.ai.description">
        Integração de Inteligência Artificial Generativa, pipelines RAG com LangChain 
        e otimização de fluxos com LLMs para escalas de milhões de usuários.
      </Translate>
    ),
  },
  {
    title: (
      <Translate id="homepage.features.cloud.title">
        Cloud & Kubernetes
      </Translate>
    ),
    Icon: MdCloudQueue,
    colSpan: 'col--4',
    description: (
      <Translate id="homepage.features.cloud.description">
        Especialista no ecossistema AWS e orquestração Kubernetes. Infraestrutura 
        como Código (IaC) com Terraform e CloudFormation.
      </Translate>
    ),
  },
  {
    title: (
      <Translate id="homepage.features.excellence.title">
        Excelência em Engenharia
      </Translate>
    ),
    Icon: MdArchitecture,
    colSpan: 'col--8',
    description: (
      <Translate id="homepage.features.excellence.description">
        Aplicação rigorosa de Clean Architecture, DDD e SOLID. Cultura de testes 
        (TDD/BDD) e automação de entrega contínua com ArgoCD e GitLab CI.
      </Translate>
    ),
  },
];

function Feature({title, description, Icon, colSpan}: FeatureItem) {
  return (
    <div className={clsx('col', colSpan, 'margin-bottom--lg')}>
      <div className={styles.bentoItem}>
        <div className={styles.iconWrapper}>
          <Icon size={32} color="var(--color-storm-cloud)" />
        </div>
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
          <Translate id="homepage.features.section.title">
            Expertise Técnica
          </Translate>
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
