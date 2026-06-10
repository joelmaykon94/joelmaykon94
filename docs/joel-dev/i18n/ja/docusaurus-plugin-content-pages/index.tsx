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
          <span className={styles.pulseDot} /> 高インパクトなプロジェクトに対応可能
        </div>
        <Heading as="h1" className={clsx(styles.heroTitle, 'animate__animated animate__fadeInUp')}>
          シニアソフトウェアエンジニア <br />
          <span className={styles.heroAccent}>Senior</span>
        </Heading>
        <p className={clsx(styles.heroSubtitle, 'animate__animated animate__fadeInUp')}>
          <strong>Java、Python、およびクラウドネイティブ</strong> エコシステムに特化。 <br />
          複雑さをクリーンで回復力があり、拡張可能なアーキテクチャに変換します。
        </p>
        <div className={clsx(styles.heroButtons, 'animate__animated animate__fadeInUp')}>
          <Link className="button--primary-linear" to="#portfolio">
            成功事例を見る
          </Link>
          <Link className="button--secondary-linear margin-left--md" to="#about">
            私について
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
              <div className="hero-badge">👋 自己紹介</div>
              <Heading as="h2" className={styles.sectionHeading}>エンジニアリングと <br/>イノベーションへの情熱</Heading>
              <p className={styles.aboutText}>
                <strong>7年以上の経験</strong>を持ち、私は好奇心旺盛なエンジニアです。
                私の仕事の焦点は、<strong>堅牢なソフトウェア</strong>と<strong>AI</strong>の交差点にあり、自律性と実際のビジネス問題を解決するソリューションを優先しています。
              </p>
              <p className={styles.aboutText}>
                私は本来研究者肌であり、大規模な本番環境に必要なアーキテクチャの厳格さを伴って、最新の技術（LLMやLangChainなど）を適用することができます。
              </p>
              <div className={styles.aboutStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>7+</span>
                  <span className={styles.statLabel}>実務年数</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>15M+</span>
                  <span className={styles.statLabel}>ユーザー数</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>100%</span>
                  <span className={styles.statLabel}>リモート</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col col--6">
            <div className={styles.aboutGrid}>
              <div className={styles.aboutGridItem}>
                <MdCode size={24} color="var(--color-porcelain)" />
                <h4>イノベーション</h4>
                <p>ミッションクリティカルなシステムにおける生成AIおよびLLMOps。</p>
              </div>
              <div className={styles.aboutGridItem}>
                <MdRocketLaunch size={24} color="var(--color-porcelain)" />
                <h4>回復力</h4>
                <p>高可用性分散システム。</p>
              </div>
              <div className={styles.aboutGridItem}>
                <MdWork size={24} color="var(--color-porcelain)" />
                <h4>自律性</h4>
                <p>技術的リーダーシップとエンドツーエンドのビジョン。</p>
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
      role: 'AI エンジニア',
      title: 'Aura AI チャットボット',
      description: 'PythonとLangChainを使用して、バーチャルアシスタント（月間1500万回以上の対話）を生成AIに進化。',
      tech: ['Python', 'LangChain', 'RabbitMQ', 'Azure'],
      results: '1500万ユーザー以上の安定したスケーラビリティ。',
    },
    {
      id: 'gov',
      company: 'Parnamirim 市政府',
      role: '技術负责人 (Tech Lead)',
      title: '政府システムの近代化',
      description: 'クリーンアーキテクチャへのリファクタリングおよびKubernetes/ArgoCD経由でのデプロイ。',
      tech: ['Java', 'Quarkus', 'Kubernetes', 'ArgoCD'],
      results: 'デプロイ時間を40%削減。',
    },
    {
      id: 'bank',
      company: 'J17 銀行',
      role: 'ソフトウェアエンジニア',
      title: '金融APIおよびPIX決済',
      description: 'PCI DSSに準拠した重要な銀行フローの維持。',
      tech: ['Java', 'MySQL', 'Docker', 'JUnit'],
      results: 'トランザクションの遅延を25%削減。',
    },
  ];

  return (
    <section id="portfolio" className={styles.portfolioSection}>
      <div className="container">
        <div className="text--center margin-bottom--xl">
          <div className="hero-badge">🛠️ ポートフォリオ</div>
          <Heading as="h2" className={styles.sectionHeading}>成功事例</Heading>
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
                  <strong>結果:</strong> {c.results}
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
            <div className="hero-badge">⏳ 経歴</div>
            <Heading as="h2" className={styles.stickyHeading}>キャリア <br /> タイムライン</Heading>
            <p className={styles.experienceIntro}>
              銀行からAIまで、高インパクトなソリューションの構築に7年以上従事。
            </p>
          </div>
          <div className="col col--8">
            <div className={styles.timeline}>
              {[
                { date: '2025', title: '技術负责人 (Tech Lead) @ Parnamirim/RN', desc: 'KubernetesとArgoCDを使用したレガシーシステムの近代化。' },
                { date: '2023 - 2024', title: 'AI エンジニア @ Vivo Aura', desc: '1500万回以上の対話を処理する生成AIおよびRAGパイプライン。' },
                { date: '2023', title: 'ソフトウェアエンジニア @ J17 銀行', desc: 'PCI DSS準拠およびコアバンキング（PIX）の最適化。' },
                { date: '2022 - 2023', title: '技術负责人 (Tech Lead) @ Holistix', desc: 'KafkaとRocksetを使用したデータアーキテクチャ。' }
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
            <div className="hero-badge">📬 連絡先</div>
            <Heading as="h2" className={styles.heroTitle}>一緒に素晴らしいものを構築しましょう</Heading>
            <p className={styles.heroSubtitle}>
              複雑なアーキテクチャやAIを含む <strong>リモート案件</strong> をお引き受け可能です。
            </p>
            <div className={styles.contactButtons}>
              <Link className="button--primary-linear" to="mailto:joelmaykon94@gmail.com">
                <MdEmail size={20} className="margin-right--sm" /> メールを送る
              </Link>
              <Link className="button--secondary-linear margin-left--md" to="https://linkedin.com/in/joelmaykon">
                LinkedIn プロフィール <MdArrowForward size={20} className="margin-left--sm" />
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
          <p className={styles.techStackLabel}>信頼する技術スタック</p>
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
      title={`${siteConfig.title} | シニアソフトウェアエンジニア`}
      description="Joel Maykon 個人ポートフォリオ - Java、Python、AIを専門とするシニアソフトウェアエンジニア。">
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
