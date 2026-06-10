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
          <span className={styles.pulseDot} /> Available for High-Impact Projects
        </div>
        <Heading as="h1" className={clsx(styles.heroTitle, 'animate__animated animate__fadeInUp')}>
          Senior <br />
          <span className={styles.heroAccent}>Software Engineer</span>
        </Heading>
        <p className={clsx(styles.heroSubtitle, 'animate__animated animate__fadeInUp')}>
          Specialized in <strong>Java, Python, and Cloud-Native</strong> ecosystems. <br />
          Transforming complexity into clean, resilient, and scalable architectures.
        </p>
        <div className={clsx(styles.heroButtons, 'animate__animated animate__fadeInUp')}>
          <Link className="button--primary-linear" to="#portfolio">
            View Success Cases
          </Link>
          <Link className="button--secondary-linear margin-left--md" to="#about">
            About Me
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
              <div className="hero-badge">👋 About Me</div>
              <Heading as="h2" className={styles.sectionHeading}>Passion for Engineering <br/> & Innovation</Heading>
              <p className={styles.aboutText}>
                With over <strong>7 years of experience</strong>, I am an engineer driven by curiosity. 
                My focus lies at the intersection of <strong>Robust Software</strong> and <strong>AI</strong>, prioritizing 
                autonomy and solutions that solve real business problems.
              </p>
              <p className={styles.aboutText}>
                I am a researcher by nature, allowing me to apply recent technologies (like LLMs and LangChain) 
                with the architectural rigor required for large-scale production environments.
              </p>
              <div className={styles.aboutStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>7+</span>
                  <span className={styles.statLabel}>Years Exp</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>15M+</span>
                  <span className={styles.statLabel}>Users</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>100%</span>
                  <span className={styles.statLabel}>Remote</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col col--6">
            <div className={styles.aboutGrid}>
              <div className={styles.aboutGridItem}>
                <MdCode size={24} color="var(--color-porcelain)" />
                <h4>Innovation</h4>
                <p>Generative AI and LLMOps in critical systems.</p>
              </div>
              <div className={styles.aboutGridItem}>
                <MdRocketLaunch size={24} color="var(--color-porcelain)" />
                <h4>Resilience</h4>
                <p>High-availability distributed systems.</p>
              </div>
              <div className={styles.aboutGridItem}>
                <MdWork size={24} color="var(--color-porcelain)" />
                <h4>Autonomy</h4>
                <p>Technical leadership and end-to-end vision.</p>
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
      title: 'Core Ledger & Security Modernization',
      description: 'Architecture and modernization of the high-transaction distributed processing ecosystem. Development of the accounting engine (Double-Entry Ledger Core) and centralized auditing services, plus federated identity security integrated with Keycloak, ensuring full regulatory compliance (BACEN).',
      tech: ['Java 21', 'Quarkus', 'Spring Boot', 'Keycloak', 'Kubernetes'],
      results: 'Full regulatory compliance guaranteed and high-performance asynchronous batch reconciliation.',
    },
    {
      id: 'aura',
      company: 'Vivo/Mutant',
      role: 'AI Engineer',
      title: 'Aura AI Chatbot',
      description: 'Evolution of virtual assistant (15M+ interactions/month) to Generative AI with Python and LangChain.',
      tech: ['Python', 'LangChain', 'RabbitMQ', 'Azure'],
      results: 'Stable scalability for 15M+ users.',
    },
    {
      id: 'gov',
      company: 'Parnamirim City Hall',
      role: 'Tech Lead',
      title: 'Gov Modernization',
      description: 'Refactoring to Clean Architecture and deployment via Kubernetes/ArgoCD.',
      tech: ['Java', 'Quarkus', 'Kubernetes', 'ArgoCD'],
      results: '40% reduction in deployment time.',
    },
    {
      id: 'bank',
      company: 'J17 Bank',
      role: 'Software Engineer',
      title: 'Financial APIs & PIX',
      description: 'Sustaining critical banking flows with PCI DSS compliance.',
      tech: ['Java', 'MySQL', 'Docker', 'JUnit'],
      results: '25% reduction in transactional latency.',
    },
  ];

  return (
    <section id="portfolio" className={styles.portfolioSection}>
      <div className="container">
        <div className="text--center margin-bottom--xl">
          <div className="hero-badge">🛠️ Portfolio</div>
          <Heading as="h2" className={styles.sectionHeading}>Success Cases</Heading>
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
                  <strong>Result:</strong> {c.results}
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
            <div className="hero-badge">⏳ Journey</div>
            <Heading as="h2" className={styles.stickyHeading}>Professional <br /> Career</Heading>
            <p className={styles.experienceIntro}>
              Over 7 years building high-impact solutions, from banking to AI.
            </p>
          </div>
          <div className="col col--8">
            <div className={styles.timeline}>
              {[
                { date: 'May/2026 - Present', title: 'Senior Analyst @ Caixa Econômica Federal (CEF) / EngeSoftware', desc: 'Modernization of the Banking Core Ledger, designing high-throughput distributed engines (Double-Entry Ledger Core, Audit and Keycloak).' },
                { date: 'May/2025 - Dec/2025', title: 'Tech Lead / Architect @ Parnamirim/RN City Hall', desc: 'Modernization of government systems using Kubernetes, ArgoCD, and GitLab CI. Refactored Hibernate/JPA modules achieving a 30% performance boost.' },
                { date: 'Mar/2025 - Jun/2025', title: 'Temporary Professor @ IFRN', desc: 'Taught Web Development and Database Fundamentals, training over 40 students in Python, SQL, and best practices.' },
                { date: 'Sep/2023 - Jul/2024', title: 'AI Engineer @ Vivo Aura / Mutant', desc: 'Evolved the Aura virtual assistant (15M+ interactions/month) using RAG pipelines, LangChain, Python, and RabbitMQ.' },
                { date: 'Nov/2023 - Dec/2023', title: 'Software Engineer @ J17 Bank', desc: 'Sustained critical financial APIs with PCI DSS compliance. Optimized MySQL queries and core banking PIX flows, reducing latency by 25%.' },
                { date: 'Jan/2023 - Dec/2023', title: 'Front-end Developer @ Not so Impossible Media', desc: 'Built responsive and optimized web applications using ReactJS, Material UI, and SASS.' },
                { date: 'Feb/2022 - Mar/2023', title: 'Technical Lead @ Holistix', desc: 'Data architecture with Kafka and Rockset. Scalable RESTful APIs with Node.js and Python, achieving over 85% test coverage.' },
                { date: 'Apr/2021 - Feb/2022', title: 'Full Stack Software Engineer @ Stefanini Brasil', desc: 'Designed serverless APIs on AWS (Lambda, ECS, EKS) with 20% cost savings. Infrastructure as Code via Terraform.' },
                { date: 'Nov/2020 - Apr/2021', title: 'Systems Analyst @ +A Educação', desc: 'Developed educational platforms with .NET Core (C#), Node.js, Vue.js, and PostgreSQL.' },
                { date: '2019 - 2020', title: 'Systems Analyst @ ITEP', desc: 'Developed MVC web applications with PHP, C#, JavaScript, and MongoDB.' },
                { date: '2018 - 2019', title: 'Research Assistant @ IFRN', desc: 'Created Python scripts for automation, web scraping, and real-time data processing.' }
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
            <div className="hero-badge">🎓 Education</div>
            <Heading as="h2" className={styles.sectionHeading}>Academic Background</Heading>
            <div className={styles.certItem}>
              <h4>Master's in Computational Intelligence</h4>
              <p>UFRN (Incomplete/Paused)</p>
            </div>
            <div className={styles.certItem}>
              <h4>B.S. in Systems Analysis & Development</h4>
              <p>IFRN (2016 – 2022) — Emphasis on Clean Architecture</p>
            </div>
            <div className={styles.certItem}>
              <h4>Programming Technician</h4>
              <p>UFRN (2012)</p>
            </div>
          </div>
          <div className="col col--6">
            <div className="hero-badge">📜 Certificates</div>
            <Heading as="h2" className={styles.sectionHeading}>Certifications & Courses</Heading>
            <div className={styles.certItem}>
              <h4>Python for Data Science</h4>
              <p>Data Science & Analytics</p>
            </div>
            <div className={styles.certItem}>
              <h4>Microsoft Azure AI Fundamentals (AI-900)</h4>
              <p>Microsoft Certified</p>
            </div>
            <div className={styles.certItem}>
              <h4>Basic Programming / Full Stack Bootcamp</h4>
              <p>Web Development & Full Stack Engineering</p>
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
            <div className="hero-badge">📬 Contact</div>
            <Heading as="h2" className={styles.heroTitle}>Let's Build Something Great?</Heading>
            <p className={styles.heroSubtitle}>
              Available for <strong>remote work</strong> challenges involving complex architectures and AI.
            </p>
            <div className={styles.contactButtons}>
              <Link className="button--primary-linear" to="mailto:joelmaykon94@gmail.com">
                <MdEmail size={20} className="margin-right--sm" /> Send Email
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
      description="Joel Maykon's Single-Page Portfolio - Senior Software Engineer specialized in Java, Python, and AI.">
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
