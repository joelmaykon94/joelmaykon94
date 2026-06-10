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
      id: 'cef',
      company: 'Caixa Econômica Federal (CEF) / EngeSoftware',
      role: '高级软件平台分析师',
      title: '核心分类账与安全现代化',
      description: '高并发分布式处理生态系统的架构与现代化。设计与开发分布式账本引擎 (Double-Entry Ledger Core) 及集中审计服务，并与 Keycloak 集成实现身份安全联邦，保障符合巴西央行 (BACEN) 的监管合规要求。',
      tech: ['Java 21', 'Quarkus', 'Spring Boot', 'Keycloak', 'Kubernetes'],
      results: '完全保证监管合规，并实现了高性能的异步批量对账。',
    },
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
                { date: '2026年5月 - 至今', title: '高级分析师 @ Caixa Econômica Federal (CEF) / EngeSoftware', desc: '进行银行核心分类账系统现代化建设，设计高并发分布式账本引擎（双分录账本核心、审计和 Keycloak）。' },
                { date: '2025年5月 - 2025年12月', title: '技术负责人 / 架构师 @ Prefeitura de Parnamirim/RN', desc: '使用 Kubernetes、ArgoCD 和 GitLab CI 对政府遗留系统进行现代化改造。重构 Hibernate/JPA 模块，性能提升了 30%。' },
                { date: '2025年3月 - 2025年6月', title: '临时教师 @ IFRN', desc: '授课网页开发及数据库基础，培养了 40 多名学习 Python、SQL 和最佳实践的学生。' },
                { date: '2023年9月 - 2024年7月', title: 'AI 工程师 @ Vivo Aura / Mutant', desc: '使用 RAG 流水线、LangChain、Python 和 RabbitMQ 消息队列优化并演进 Aura 智能虚拟助手（每月处理 1500 万+ 互动）。' },
                { date: '2023年11月 - 2023年12月', title: '软件工程师 @ J17 Bank', desc: '支持符合 PCI DSS 规范的关键金融 API。优化 MySQL 查询和 PIX 核心支付流程，降低交易延迟 25%。' },
                { date: '2023年1月 - 2023年12月', title: '前端开发人员 @ Not so Impossible Media', desc: '使用 ReactJS、Material UI 和 SASS 构建响应式和优化的高性能网页应用。' },
                { date: '2022年2月 - 2023年3月', title: '技术负责人 @ Holistix', desc: '使用 Kafka 和 Rockset 构建数据架构和流水线。使用 Node.js 和 Python 开发可扩展 of RESTful API，测试覆盖率超 85%。' },
                { date: '2021年4月 - 2022年2月', title: '全栈软件工程师 @ Stefanini Brasil', desc: '在 AWS（Lambda、ECS、EKS）上设计无服务器 API，节省 20% 成本。使用 Terraform 进行基础设施即代码（IaC）建设。' },
                { date: '2020年11月 - 2021年4月', title: '系统分析师 @ +A Educação', desc: '使用 .NET Core (C#)、Node.js、Vue.js 和 PostgreSQL 数据库开发教育平台。' },
                { date: '2019年 - 2020年', title: '系统分析师 @ ITEP', desc: '使用 PHP、C#、JavaScript 和 MongoDB 开发 MVC 模式网页应用。' },
                { date: '2018年 - 2019年', title: '研究助理 @ IFRN', desc: '编写 Python 脚本实现自动化、网页爬虫及实时数据处理。' }
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
            <div className="hero-badge">🎓 教育经历</div>
            <Heading as="h2" className={styles.sectionHeading}>教育背景</Heading>
            <div className={styles.certItem}>
              <h4>计算智能硕士</h4>
              <p>巴西北大河州联邦大学 (UFRN) — 暂休</p>
            </div>
            <div className={styles.certItem}>
              <h4>系统分析与开发技术学士</h4>
              <p>巴西北大河州联邦学院 (IFRN) (2016 – 2022) — 专注清洁架构</p>
            </div>
            <div className={styles.certItem}>
              <h4>计算机编程技术员</h4>
              <p>巴西北大河州联邦大学 (UFRN) (2012)</p>
            </div>
          </div>
          <div className="col col--6">
            <div className="hero-badge">📜 认证与课程</div>
            <Heading as="h2" className={styles.sectionHeading}>专业证书</Heading>
            <div className={styles.certItem}>
              <h4>Python for Data Science</h4>
              <p>数据科学与分析证书</p>
            </div>
            <div className={styles.certItem}>
              <h4>Microsoft Azure AI Fundamentals (AI-900)</h4>
              <p>微软认证 AI 基础</p>
            </div>
            <div className={styles.certItem}>
              <h4>基础编程与全栈训练营</h4>
              <p>Web 开发与全栈工程</p>
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
        <EducationSection />
        <ContactSection />
      </main>
    </Layout>
  );
}
