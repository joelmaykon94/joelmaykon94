import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import { MdEmail, MdWork, MdCode, MdRocketLaunch, MdArrowForward } from 'react-icons/md';

import styles from '@site/src/pages/index.module.css';

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
          <span className={styles.pulseDot} /> Disponible para Proyectos de Alto Impacto
        </div>
        <Heading as="h1" className={clsx(styles.heroTitle, 'animate__animated animate__fadeInUp')}>
          Ingeniero de Software <br />
          <span className={styles.heroAccent}>Senior</span>
        </Heading>
        <p className={clsx(styles.heroSubtitle, 'animate__animated animate__fadeInUp')}>
          Especializado en ecosistemas <strong>Java, Python y Cloud-Native</strong>. <br />
          Transformando la complejidad en arquitecturas limpias, resilientes y escalables.
        </p>
        <div className={clsx(styles.heroButtons, 'animate__animated animate__fadeInUp')}>
          <Link className="button--primary-linear" to="#portfolio">
            Ver Casos de Éxito
          </Link>
          <Link className="button--secondary-linear margin-left--md" to="#about">
            Sobre Mí
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
              <div className="hero-badge">👋 Sobre Mí</div>
              <Heading as="h2" className={styles.sectionHeading}>Pasión por la Ingeniería <br/> & Innovación</Heading>
              <p className={styles.aboutText}>
                Con más de <strong>7 años de experiencia</strong>, soy un ingeniero impulsado por la curiosidad. 
                Mi trabajo se centra en la intersección entre <strong>Software Robusto</strong> e <strong>IA</strong>, priorizando 
                la autonomía y soluciones que resuelvan problemas reales de negocio.
              </p>
              <p className={styles.aboutText}>
                Soy investigador por naturaleza, lo que me permite aplicar tecnologías recientes (como LLMs y LangChain) 
                con el rigor arquitectónico necesario para entornos de producción a gran escala.
              </p>
              <div className={styles.aboutStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>7+</span>
                  <span className={styles.statLabel}>Años Exp</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>15M+</span>
                  <span className={styles.statLabel}>Usuarios</span>
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
                <h4>Innovación</h4>
                <p>IA Generativa y LLMOps en sistemas críticos.</p>
              </div>
              <div className={styles.aboutGridItem}>
                <MdRocketLaunch size={24} color="var(--color-porcelain)" />
                <h4>Resiliencia</h4>
                <p>Sistemas distribuidos de alta disponibilidad.</p>
              </div>
              <div className={styles.aboutGridItem}>
                <MdWork size={24} color="var(--color-porcelain)" />
                <h4>Autonomía</h4>
                <p>Liderazgo técnico y visión de extremo a extremo.</p>
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
      title: 'Modernización de Core Ledger & Seguridad',
      description: 'Arquitectura y modernización del ecosistema de procesamiento distribuido de alta transaccionalidad. Desarrollo de motor contable (Double-Entry Ledger Core) y servicios de auditoría y seguridad federada con Keycloak, garantizando la total conformidad regulatoria (BACEN).',
      tech: ['Java 21', 'Quarkus', 'Spring Boot', 'Keycloak', 'Kubernetes'],
      results: 'Garantía de conformidad regulatoria total y conciliación por lotes asíncrona de alto rendimiento.',
    },
    {
      id: 'aura',
      company: 'Vivo/Mutant',
      role: 'AI Engineer',
      title: 'Aura AI Chatbot',
      description: 'Evolución del asistente virtual (15M+ interacciones/mes) a IA Generativa con Python y LangChain.',
      tech: ['Python', 'LangChain', 'RabbitMQ', 'Azure'],
      results: 'Escalabilidad estable para más de 15M de usuarios.',
    },
    {
      id: 'gov',
      company: 'Prefeitura Parnamirim',
      role: 'Tech Lead',
      title: 'Modernización Gubernamental',
      description: 'Refactorización a Clean Architecture y despliegue a través de Kubernetes/ArgoCD.',
      tech: ['Java', 'Quarkus', 'Kubernetes', 'ArgoCD'],
      results: 'Reducción del 40% en el tiempo de despliegue.',
    },
    {
      id: 'bank',
      company: 'J17 Bank',
      role: 'Software Engineer',
      title: 'APIs Financieras & PIX',
      description: 'Soporte de flujos bancarios críticos y seguros con conformidad PCI DSS.',
      tech: ['Java', 'MySQL', 'Docker', 'JUnit'],
      results: 'Reducción del 25% en la latencia transaccional con criptografía de extremo a extremo.',
    },
  ];

  return (
    <section id="portfolio" className={styles.portfolioSection}>
      <div className="container">
        <div className="text--center margin-bottom--xl">
          <div className="hero-badge">🛠️ Portafolio</div>
          <Heading as="h2" className={styles.sectionHeading}>Casos de Éxito</Heading>
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
            <div className="hero-badge">⏳ Trayectoria</div>
            <Heading as="h2" className={styles.stickyHeading}>Carrera <br /> Profesional</Heading>
            <p className={styles.experienceIntro}>
              Más de 7 años construyendo soluciones de alto impacto, desde bancos hasta IA.
            </p>
          </div>
          <div className="col col--8">
            <div className={styles.timeline}>
              {[
                { date: 'May/2026 - Actual', title: 'Analista Senior @ Caixa Econômica Federal (CEF) / EngeSoftware', desc: 'Modernización del Core Ledger bancario, diseñando motores contables distribuidos de alta transaccionalidad (Double-Entry Ledger, Audit y Keycloak).' },
                { date: 'May/2025 - Dic/2025', title: 'Tech Lead / Arquitecto @ Municipalidad de Parnamirim/RN', desc: 'Modernización de sistemas gubernamentales con Kubernetes, ArgoCD y GitLab CI. Refactorización de Hibernate/JPA con 30% de mejora de rendimiento.' },
                { date: 'Mar/2025 - Jun/2025', title: 'Profesor Temporario @ IFRN', desc: 'Impartió Desarrollo Web y Fundamentos de Bases de Datos, capacitando a más de 40 alumnos en Python, SQL y buenas prácticas.' },
                { date: 'Sep/2023 - Jul/2024', title: 'Ingeniero de IA @ Vivo Aura / Mutant', desc: 'Evolución del asistente virtual Aura (15M+ interacciones/mes) con pipelines RAG, LangChain, Python y mensajería RabbitMQ.' },
                { date: 'Nov/2023 - Dic/2023', title: 'Ingeniero de Software @ J17 Bank', desc: 'Soporte de APIs financieras críticas en conformidad con PCI DSS. Optimización de consultas MySQL y procesos core banking (PIX) con reducción de 25% en la latência.' },
                { date: 'Ene/2023 - Dic/2023', title: 'Desarrollador Front-end @ Not so Impossible Media', desc: 'Construcción de aplicaciones web responsivas y optimizadas con ReactJS, Material UI y SASS.' },
                { date: 'Feb/2022 - Mar/2023', title: 'Líder Técnico @ Holistix', desc: 'Arquitectura de datos con Kafka y Rockset. APIs RESTful con Node.js y Python, con pruebas unitarias y cobertura superior al 85%.' },
                { date: 'Abr/2021 - Feb/2022', title: 'Ingeniero de Software Full Stack @ Stefanini Brasil', desc: 'Diseño de APIs serverless en AWS (Lambda, ECS, EKS) con ahorro de 20%. Infraestructura como Código a través de Terraform.' },
                { date: 'Nov/2020 - Abr/2021', title: 'Analista de Sistemas @ +A Educação', desc: 'Desarrollo de plataformas educativas con .NET Core (C#), Node.js, Vue.js y bases de datos PostgreSQL.' },
                { date: '2019 - 2020', title: 'Analista de Sistemas @ ITEP', desc: 'Desarrollo de aplicaciones web MVC con PHP, C#, JavaScript y bases de dados NoSQL MongoDB.' },
                { date: '2018 - 2019', title: 'Asistente de Investigación @ IFRN', desc: 'Creación de scripts de Python para automatización, web scraping y tratamiento de datos en tiempo real.' }
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
            <div className="hero-badge">🎓 Formación</div>
            <Heading as="h2" className={styles.sectionHeading}>Formación Académica</Heading>
            <div className={styles.certItem}>
              <h4>Maestría en Inteligencia Computacional</h4>
              <p>UFRN (Incompleto/Pausado)</p>
            </div>
            <div className={styles.certItem}>
              <h4>Tecnologia en Análise e Desenvolvimento de Sistemas</h4>
              <p>IFRN (2016 – 2022) — Énfasis en Clean Architecture</p>
            </div>
            <div className={styles.certItem}>
              <h4>Técnico en Programación</h4>
              <p>UFRN (2012)</p>
            </div>
          </div>
          <div className="col col--6">
            <div className="hero-badge">📜 Certificados</div>
            <Heading as="h2" className={styles.sectionHeading}>Certificaciones & Cursos</Heading>
            <div className={styles.certItem}>
              <h4>Python for Data Science</h4>
              <p>Ciencia de Datos y Análisis</p>
            </div>
            <div className={styles.certItem}>
              <h4>Microsoft Azure AI Fundamentals (AI-900)</h4>
              <p>Certificado por Microsoft</p>
            </div>
            <div className={styles.certItem}>
              <h4>Curso de Formación en Programación Básica / Full Stack</h4>
              <p>Desarrollo Web & Ingeniería Full Stack</p>
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
            <div className="hero-badge">📬 Contacto</div>
            <Heading as="h2" className={styles.heroTitle}>¿Vamos a Construir Algo Grande?</Heading>
            <p className={styles.heroSubtitle}>
              Disponible para desafíos de <strong>trabajo remoto</strong> que involucren arquitecturas complejas e IA.
            </p>
            <div className={styles.contactButtons}>
              <Link className="button--primary-linear" to="mailto:joelmaykon94@gmail.com">
                <MdEmail size={20} className="margin-right--sm" /> Enviar Correo
              </Link>
              <Link className="button--secondary-linear margin-left--md" to="https://linkedin.com/in/joelmaykon">
                Perfil de LinkedIn <MdArrowForward size={20} className="margin-left--sm" />
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
      description="Portafolio Single-Page de Joel Maykon - Ingeniero de Software Senior especializado en Java, Python e IA.">
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
