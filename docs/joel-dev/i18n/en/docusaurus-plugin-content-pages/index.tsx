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
            src="https://github.com/joelmaykon94.png" 
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
                <MdCode size={24} color="var(--color-neon-lime)" />
                <h4>Innovation</h4>
                <p>Generative AI and LLMOps in critical systems.</p>
              </div>
              <div className={styles.aboutGridItem}>
                <MdRocketLaunch size={24} color="var(--color-neon-lime)" />
                <h4>Resilience</h4>
                <p>High-availability distributed systems.</p>
              </div>
              <div className={styles.aboutGridItem}>
                <MdWork size={24} color="var(--color-neon-lime)" />
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
                { date: '2025', title: 'Tech Lead @ Parnamirim/RN', desc: 'Modernizing legacy systems with Kubernetes and ArgoCD.' },
                { date: '2023 - 2024', title: 'AI Engineer @ Vivo Aura', desc: 'Generative AI and RAG pipelines processing 15M+ interactions.' },
                { date: '2023', title: 'Software Engineer @ J17 Bank', desc: 'PCI DSS compliance and core banking (PIX) optimization.' },
                { date: '2022 - 2023', title: 'Tech Lead @ Holistix', desc: 'Data architecture with Kafka and Rockset.' }
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
        <ContactSection />
      </main>
    </Layout>
  );
}
