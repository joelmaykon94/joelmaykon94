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
          <span className={styles.pulseDot} /> 可承接高影响力项目
        </div>
        <Heading as="h1" className={clsx(styles.heroTitle, 'animate__animated animate__fadeInUp')}>
          高级软件工程师 <br />
          <span className={styles.heroAccent}>Senior</span>
        </Heading>
        <p className={clsx(styles.heroSubtitle, 'animate__animated animate__fadeInUp')}>
          专攻 <strong>Java、Python 和云原生</strong> 生态系统。 <br />
          将复杂性转化为清晰、弹性且可扩展的架构。
        </p>
        <div className={clsx(styles.heroButtons, 'animate__animated animate__fadeInUp')}>
          <Link className="button--primary-linear" to="#portfolio">
            查看成功案例
          </Link>
          <Link className="button--secondary-linear margin-left--md" to="#about">
            关于我
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
              <div className="hero-badge">👋 关于我</div>
              <Heading as="h2" className={styles.sectionHeading}>对工程与创新的激情</Heading>
              <p className={styles.aboutText}>
                拥有超过 <strong>7 年的经验</strong>，我是一名由好奇心驱动的工程师。
                我的工作重点位于 <strong>健壮软件</strong> 与 <strong>人工智能</strong> 的交汇处，优先考虑自主性以及解决实际业务问题的解决方案。
              </p>
              <p className={styles.aboutText}>
                我天生是一个研究者，这使我能够将最新的技术（如 LLM 和 LangChain）应用到大规模生产环境所需的架构严谨性中。
              </p>
              <div className={styles.aboutStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>7+</span>
                  <span className={styles.statLabel}>年经验</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>15M+</span>
                  <span className={styles.statLabel}>用户量</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>100%</span>
                  <span className={styles.statLabel}>远程办公</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col col--6">
            <div className={styles.aboutGrid}>
              <div className={styles.aboutGridItem}>
                <MdCode size={24} color="var(--color-porcelain)" />
                <h4>创新</h4>
                <p>关键系统中的生成式 AI 和 LLMOps。</p>
              </div>
              <div className={styles.aboutGridItem}>
                <MdRocketLaunch size={24} color="var(--color-porcelain)" />
                <h4>弹性</h4>
                <p>高可用分布式系统。</p>
              </div>
              <div className={styles.aboutGridItem}>
                <MdWork size={24} color="var(--color-porcelain)" />
                <h4>自主性</h4>
                <p>技术领导力和端到端视野。</p>
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
      role: 'AI 工程师',
      title: 'Aura AI 智能客服',
      description: '使用 Python 和 LangChain 将虚拟助手（每月 1500 万+ 互动）演进为生成式 AI。',
      tech: ['Python', 'LangChain', 'RabbitMQ', 'Azure'],
      results: '为 1500 万+ 用户提供稳定的扩展支持。',
    },
    {
      id: 'gov',
      company: 'Parnamirim 市政府',
      role: '技术负责人 (Tech Lead)',
      title: '政府政务系统现代化',
      description: '重构为清洁架构并使用 Kubernetes/ArgoCD 部署。',
      tech: ['Java', 'Quarkus', 'Kubernetes', 'ArgoCD'],
      results: '部署时间缩短了 40%。',
    },
    {
      id: 'bank',
      company: 'J17 银行',
      role: '软件工程师',
      title: '金融 API & PIX 实时支付',
      description: '支持符合 PCI DSS 规范的关键银行业务流程。',
      tech: ['Java', 'MySQL', 'Docker', 'JUnit'],
      results: '交易延迟降低了 25%。',
    },
  ];

  return (
    <section id="portfolio" className={styles.portfolioSection}>
      <div className="container">
        <div className="text--center margin-bottom--xl">
          <div className="hero-badge">🛠️ 项目作品</div>
          <Heading as="h2" className={styles.sectionHeading}>成功案例</Heading>
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
                  <strong>结果:</strong> {c.results}
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
            <div className="hero-badge">⏳ 发展历程</div>
            <Heading as="h2" className={styles.stickyHeading}>职业生涯 <br /> 专业历程</Heading>
            <p className={styles.experienceIntro}>
              超过 7 年构建高影响力解决方案的经验，从银行业到 AI。
            </p>
          </div>
          <div className="col col--8">
            <div className={styles.timeline}>
              {[
                { date: '2025', title: '技术负责人 (Tech Lead) @ Parnamirim/RN', desc: '使用 Kubernetes 和 ArgoCD 进行遗留系统现代化。' },
                { date: '2023 - 2024', title: 'AI 工程师 @ Vivo Aura', desc: '生成式 AI 和 RAG 流水线，处理 1500 万+ 互动。' },
                { date: '2023', title: '软件工程师 @ J17 银行', desc: 'PCI DSS 合规及核心银行（PIX）优化。' },
                { date: '2022 - 2023', title: '技术负责人 (Tech Lead) @ Holistix', desc: '使用 Kafka 和 Rockset 构建数据架构。' }
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
            <div className="hero-badge">📬 联系方式</div>
            <Heading as="h2" className={styles.heroTitle}>让我们一起构建伟大的事业？</Heading>
            <p className={styles.heroSubtitle}>
              可承接涉及复杂架构和 AI 的 <strong>远程工作</strong> 机会。
            </p>
            <div className={styles.contactButtons}>
              <Link className="button--primary-linear" to="mailto:joelmaykon94@gmail.com">
                <MdEmail size={20} className="margin-right--sm" /> 发送电子邮件
              </Link>
              <Link className="button--secondary-linear margin-left--md" to="https://linkedin.com/in/joelmaykon">
                LinkedIn 个人资料 <MdArrowForward size={20} className="margin-left--sm" />
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
          <p className={styles.techStackLabel}>受信任的技术栈</p>
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
      title={`${siteConfig.title} | 高级软件工程师`}
      description="Joel Maykon 个人作品集 - 专攻 Java、Python 和 AI 的高级软件工程师。">
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
