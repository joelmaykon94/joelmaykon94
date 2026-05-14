import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className="radial-gradient-bg" />
      <div className="container hero-container">
        <div className="hero-badge">Disponível para Projetos de Alto Impacto</div>
        <Heading as="h1" className={styles.heroTitle}>
          Crafting Scalable <br />
          <span className={styles.heroAccent}>Distributed Systems</span>
        </Heading>
        <p className={styles.heroSubtitle}>
          Engenheiro de Software Senior especializado em ecossistemas Java, Python e Cloud-Native. 
          Transformando complexidade em arquiteturas limpas e resilientes.
        </p>
        <div className={styles.heroButtons}>
          <Link className="button--primary-linear" to="https://linkedin.com/in/joelmaykon">
            LinkedIn Profile
          </Link>
          <Link className="button--secondary-linear margin-left--md" to="/docs/intro">
            Explorar Conhecimento
          </Link>
        </div>
      </div>
    </header>
  );
}

function ExperienceSection() {
  return (
    <section className={styles.experienceSection}>
      <div className="container">
        <div className="row">
          <div className="col col--5">
            <Heading as="h2" className={styles.stickyHeading}>
              Trajetória <br /> Profissional
            </Heading>
            <p className={styles.experienceIntro}>
              Mais de 7 anos construindo soluções para grandes players do mercado, 
              de assistentes virtuais com 15M+ usuários a sistemas bancários críticos.
            </p>
          </div>
          <div className="col col--7">
            <div className="timeline-item">
              <span className={styles.timelineDate}>2025</span>
              <Heading as="h3">Tech Lead @ Parnamirim/RN</Heading>
              <p>Modernização de sistemas legados, Kubernetes & ArgoCD.</p>
              <div className="tech-tags">
                <span className="tech-tag">Java</span>
                <span className="tech-tag">Kubernetes</span>
                <span className="tech-tag">ArgoCD</span>
              </div>
            </div>
            <div className="timeline-item">
              <span className={styles.timelineDate}>2023 - 2024</span>
              <Heading as="h3">AI Engineer @ Mutant (Vivo Aura)</Heading>
              <p>Evolução da Aura (15M+ interações/mês) com LangChain e LLMs.</p>
              <div className="tech-tags">
                <span className="tech-tag">Python</span>
                <span className="tech-tag">LangChain</span>
                <span className="tech-tag">RabbitMQ</span>
              </div>
            </div>
            <div className="timeline-item">
              <span className={styles.timelineDate}>2022 - 2023</span>
              <Heading as="h3">Tech Lead @ Holistix</Heading>
              <p>Arquitetura de dados e APIs escaláveis com Kafka.</p>
              <div className="tech-tags">
                <span className="tech-tag">Node.js</span>
                <span className="tech-tag">Kafka</span>
                <span className="tech-tag">Rockset</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TechStackSection() {
  const techs = [
    'Spring Boot', 'FastAPI', 'Kubernetes', 'AWS', 'Kafka', 
    'PostgreSQL', 'Terraform', 'React', 'LangChain', 'Splunk'
  ];
  return (
    <section className={styles.techStackSection}>
      <div className="container">
        <div className={styles.techStackWrapper}>
          <p className={styles.techStackLabel}>Trusted Tech Stack</p>
          <div className={styles.techGrid}>
            {techs.map(tech => (
              <div key={tech} className={styles.techItem}>{tech}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} | Senior Software Engineer`}
      description="Portfolio de Joel Maykon - Engenheiro de Software Senior especializado em Java, Python e IA.">
      <HomepageHeader />
      <main>
        <TechStackSection />
        <HomepageFeatures />
        <ExperienceSection />
      </main>
    </Layout>
  );
}
