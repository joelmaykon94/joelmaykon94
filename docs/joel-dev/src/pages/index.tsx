import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import { MdEmail, MdWork, MdCode, MdRocketLaunch, MdArrowForward } from 'react-icons/md';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className="radial-gradient-bg" />
      <div className="container hero-container">
        <div className={styles.avatarWrapper}>
          <div className={styles.avatarGlow} />
          <img 
            src={require('@site/static/img/joel-maykon.png').default} 
            alt="Joel Maykon" 
            className={styles.homeAvatar}
          />
        </div>
        <div className="hero-badge animate__animated animate__fadeInDown">
          <span className={styles.pulseDot} /> Disponível para Projetos de Alto Impacto
        </div>
        <Heading as="h1" className={clsx(styles.heroTitle, 'animate__animated animate__fadeInUp')}>
          Engenheiro de Software <br />
          <span className={styles.heroAccent}>Senior</span>
        </Heading>
        <p className={clsx(styles.heroSubtitle, 'animate__animated animate__fadeInUp')}>
          Especializado em ecossistemas <strong>Java, Python e Cloud-Native</strong>. <br />
          Transformando complexidade em arquiteturas limpas, resilientes e escaláveis.
        </p>
        <div className={clsx(styles.heroButtons, 'animate__animated animate__fadeInUp')}>
          <Link className="button--primary-linear" to="#portfolio">
            Ver Casos de Sucesso
          </Link>
          <Link className="button--secondary-linear margin-left--md" to="#about">
            Sobre Mim
          </Link>
        </div>
      </div>
    </header>
  );
}

function AboutSection() {
  return (
    <section id="about" className={styles.aboutSection}>
      <div className="container">
        <div className="row">
          <div className="col col--6">
            <div className={styles.aboutContent}>
              <div className="hero-badge">👋 Sobre Mim</div>
              <Heading as="h2" className={styles.sectionHeading}>Paixão por Engenharia <br/> & Inovação</Heading>
              <p className={styles.aboutText}>
                Com mais de <strong>7 anos de experiência</strong>, sou um engenheiro movido pela curiosidade. 
                Minha atuação foca na intersecção entre <strong>Software Robusto</strong> e <strong>IA</strong>, priorizando 
                autonomia e soluções que resolvam problemas de negócio reais.
              </p>
              <p className={styles.aboutText}>
                Sou pesquisador por natureza, o que me permite aplicar tecnologias recentes (como LLMs e LangChain) 
                com o rigor arquitetural necessário para ambientes de produção em larga escala.
              </p>
              <div className={styles.aboutStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>7+</span>
                  <span className={styles.statLabel}>Anos Exp</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>15M+</span>
                  <span className={styles.statLabel}>Usuários</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>100%</span>
                  <span className={styles.statLabel}>Remoto</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col col--6">
            <div className={styles.aboutGrid}>
              <div className={styles.aboutGridItem}>
                <MdCode size={24} color="var(--color-porcelain)" />
                <h4>Inovação</h4>
                <p>IA Generativa e LLMOps em sistemas críticos.</p>
              </div>
              <div className={styles.aboutGridItem}>
                <MdRocketLaunch size={24} color="var(--color-porcelain)" />
                <h4>Resiliência</h4>
                <p>Sistemas distribuídos de alta disponibilidade.</p>
              </div>
              <div className={styles.aboutGridItem}>
                <MdWork size={24} color="var(--color-porcelain)" />
                <h4>Autonomia</h4>
                <p>Liderança técnica e visão ponta-a-ponta.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PortfolioSection() {
  const cases = [
    {
      id: 'cef',
      company: 'Caixa Econômica Federal (CEF)',
      role: 'Senior Software Analyst',
      title: 'Modernização de Core Ledger & Segurança',
      description: 'Arquitetura e modernização do ecossistema de processamento distribuído de alta transacionalidade. Desenvolvimento de motor contábil (Double-Entry Ledger Core) e serviços de auditoria e segurança federada com Keycloak, garantindo conformidade regulatória total (BACEN).',
      tech: ['Java 21', 'Quarkus', 'Spring Boot', 'Keycloak', 'Kubernetes'],
      results: 'Garantia de conformidade regulatória total e conciliação em lote assíncrona de alta performance.',
    },
    {
      id: 'aura',
      company: 'Vivo/Mutant',
      role: 'AI Engineer',
      title: 'Aura AI Chatbot',
      description: 'Evolução do assistente virtual (15M+ interações/mês) para IA Generativa com Python e LangChain.',
      tech: ['Python', 'LangChain', 'RabbitMQ', 'Azure'],
      results: 'Escalabilidade estável para 15M+ usuários.',
    },
    {
      id: 'gov',
      company: 'Prefeitura Parnamirim',
      role: 'Tech Lead',
      title: 'Modernização Governamental',
      description: 'Refatoração para Clean Architecture e deploy via Kubernetes/ArgoCD.',
      tech: ['Java', 'Quarkus', 'Kubernetes', 'ArgoCD'],
      results: 'Redução de 40% no tempo de deploy.',
    },
    {
      id: 'bank',
      company: 'J17 Bank',
      role: 'Software Engineer',
      title: 'APIs Financeiras & PIX',
      description: 'Sustentação de fluxos bancários críticos e seguros com conformidade PCI DSS.',
      tech: ['Java', 'MySQL', 'Docker', 'JUnit'],
      results: 'Redução de 25% na latência transacional com criptografia de ponta.',
    },
  ];

  return (
    <section id="portfolio" className={styles.portfolioSection}>
      <div className="container">
        <div className="text--center margin-bottom--xl">
          <div className="hero-badge">🛠️ Portfólio</div>
          <Heading as="h2" className={styles.sectionHeading}>Casos de Sucesso</Heading>
        </div>
        <div className={styles.caseStack}>
          {cases.map((c, idx) => (
            <div key={idx} className={styles.caseCard}>
              <div className={styles.caseHeader}>
                <div>
                  <span className={styles.caseCompany}>{c.company}</span>
                  <Heading as="h3" className={styles.caseTitle}>{c.title}</Heading>
                </div>
                <span className={styles.caseRole}>{c.role}</span>
              </div>
              <p className={styles.caseDesc}>{c.description}</p>
              <div className={styles.caseFooter}>
                <div className="tech-tags">
                  {c.tech.map(t => <span key={t} className="tech-tag">{t}</span>)}
                </div>
                <div className={styles.caseResult}>
                  <strong>Resultado:</strong> {c.results}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExperienceTimeline() {
  return (
    <section className={styles.experienceSection}>
      <div className="container">
        <div className="row">
          <div className="col col--4">
            <div className="hero-badge">⏳ Trajetória</div>
            <Heading as="h2" className={styles.stickyHeading}>Carreira <br /> Profissional</Heading>
            <p className={styles.experienceIntro}>
              Mais de 7 anos construindo soluções de alto impacto, de bancos a IA.
            </p>
          </div>
          <div className="col col--8">
            <div className={styles.timeline}>
              {[
                { date: 'Mai/2026 - Atual', title: 'Analista Senior @ Caixa Econômica Federal (CEF) / EngeSoftware', desc: 'Modernização do Core Ledger Bancário, projetando motores contábeis distribuídos de alta transacionalidade (Double-Entry Ledger, Audit e Keycloak).' },
                { date: 'Mai/2025 - Dez/2025', title: 'Tech Lead / Arquiteto @ Prefeitura de Parnamirim/RN', desc: 'Modernização de sistemas governamentais com Kubernetes, ArgoCD e GitLab CI. Refatoração de Hibernate/JPA para ganho de 30% em performance.' },
                { date: 'Mar/2025 - Jun/2025', title: 'Professor Temporário @ IFRN', desc: 'Lecionei Desenvolvimento Web e Banco de Dados, capacitando mais de 40 alunos em Python, SQL e boas práticas.' },
                { date: 'Set/2023 - Jul/2024', title: 'Engenheiro de IA @ Vivo Aura / Mutant', desc: 'Evolução do assistente virtual Aura (15M+ interações/mês) com pipelines RAG, LangChain, Python e mensageria RabbitMQ.' },
                { date: 'Nov/2023 - Dez/2023', title: 'Engenheiro de Software @ J17 Bank', desc: 'Sustentação de APIs financeiras em conformidade com PCI DSS. Otimização de queries MySQL e fluxos do PIX com redução de 25% na latência.' },
                { date: 'Jan/2023 - Dez/2023', title: 'Desenvolvedor Front-end @ Not so Impossible Media', desc: 'Construção de aplicações web responsivas e otimizadas com ReactJS, Material UI e SASS.' },
                { date: 'Fev/2022 - Mar/2023', title: 'Líder Técnico @ Holistix', desc: 'Arquitetura de dados com Kafka e Rockset. APIs RESTful com Node.js e Python, com testes JUnit/PyTest e cobertura de 85%.' },
                { date: 'Abr/2021 - Fev/2022', title: 'Engenheiro de Software Full Stack @ Stefanini Brasil', desc: 'Projetei APIs e soluções serverless na AWS (Lambda, ECS, EKS) com economia de 20%. Infraestrutura como Código via Terraform.' },
                { date: 'Nov/2020 - Abr/2021', title: 'Analista de Sistemas @ +A Educação', desc: 'Desenvolvimento de plataformas educacionais com .NET Core (C#), Node.js, Vue.js e banco de dados PostgreSQL.' },
                { date: '2019 - 2020', title: 'Analista de Sistemas @ ITEP', desc: 'Desenvolvimento de aplicações web MVC com PHP, C#, JavaScript e banco de dados NoSQL MongoDB.' },
                { date: '2018 - 2019', title: 'Assistente de Pesquisa @ IFRN', desc: 'Criação de scripts Python para automação, web scraping e tratamento de dados em tempo real.' }
              ].map((item, i) => (
                <div key={i} className="timeline-item">
                  <span className={styles.timelineDate}>{item.date}</span>
                  <Heading as="h3">{item.title}</Heading>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EducationSection() {
  return (
    <section className={styles.educationSection}>
      <div className="container">
        <div className="row">
          <div className="col col--6">
            <div className="hero-badge">🎓 Formação</div>
            <Heading as="h2" className={styles.sectionHeading}>Formação Acadêmica</Heading>
            <div className={styles.certItem}>
              <h4>Mestrado em Inteligência Computacional</h4>
              <p>UFRN (Trancado)</p>
            </div>
            <div className={styles.certItem}>
              <h4>Tecnologia em Análise e Desenvolvimento de Sistemas</h4>
              <p>IFRN (2016 – 2022) — Ênfase em Clean Architecture</p>
            </div>
            <div className={styles.certItem}>
              <h4>Técnico em Programação</h4>
              <p>UFRN (2012)</p>
            </div>
          </div>
          <div className="col col--6">
            <div className="hero-badge">📜 Certificados</div>
            <Heading as="h2" className={styles.sectionHeading}>Certificações & Cursos</Heading>
            <div className={styles.certItem}>
              <h4>Python for Data Science</h4>
              <p>Data Science & Analytics</p>
            </div>
            <div className={styles.certItem}>
              <h4>Microsoft Azure AI Fundamentals (AI-900)</h4>
              <p>Microsoft Certified</p>
            </div>
            <div className={styles.certItem}>
              <h4>Curso de Formação em Programação Básica / Full Stack</h4>
              <p>Desenvolvimento Web & Engenharia Full Stack</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section id="contact" className={styles.contactSection}>
      <div className="container">
        <div className={styles.contactCard}>
          <div className={styles.contactGlow} />
          <div className="text--center">
            <div className="hero-badge">📬 Contato</div>
            <Heading as="h2" className={styles.heroTitle}>Vamos Construir Algo Grande?</Heading>
            <p className={styles.heroSubtitle}>
              Disponível para desafios em <strong>trabalho remoto</strong> envolvendo arquiteturas complexas e IA.
            </p>
            <div className={styles.contactButtons}>
              <Link className="button--primary-linear" to="mailto:joelmaykon94@gmail.com">
                <MdEmail size={20} className="margin-right--sm" /> Enviar E-mail
              </Link>
              <Link className="button--secondary-linear margin-left--md" to="https://linkedin.com/in/joelmaykon">
                LinkedIn Profile <MdArrowForward size={20} className="margin-left--sm" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TechStackSection() {
  const techs = ['Java', 'Python', 'Kubernetes', 'AWS', 'Kafka', 'Quarkus', 'FastAPI', 'LangChain', 'React', 'Terraform'];
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
      description="Portfolio Single-Page de Joel Maykon - Engenheiro de Software Senior especializado em Java, Python e IA.">
      <HomepageHeader />
      <main>
        <TechStackSection />
        <AboutSection />
        <HomepageFeatures />
        <PortfolioSection />
        <ExperienceTimeline />
        <EducationSection />
        <ContactSection />
      </main>
    </Layout>
  );
}
