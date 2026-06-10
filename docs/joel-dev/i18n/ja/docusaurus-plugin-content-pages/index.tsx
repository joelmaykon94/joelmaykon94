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
      id: 'cef',
      company: 'Caixa Econômica Federal (CEF) / EngeSoftware',
      role: 'シニアソフトウェアプラットフォームアナリスト',
      title: 'コア元帳とセキュリティの近代化',
      description: '高トランザクションの分散処理エコシステムのアーキテクチャ設計および近代化。会計エンジン（複式簿記元帳コア）や中央監査サービス、Keycloakと統合されたフェデレーション識別セキュリティの構築など、ブラジル中央銀行（BACEN）の規制に完全準拠した開発を統括。',
      tech: ['Java 21', 'Quarkus', 'Spring Boot', 'Keycloak', 'Kubernetes'],
      results: '規制要件への完全準拠と、大容量バッチの非同期高速照合を実現。',
    },
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
                { date: '2026年5月 - 現在', title: 'シニアアナリスト @ Caixa Econômica Federal (CEF) / EngeSoftware', desc: '銀行コア元帳の近代化。高スループットの分散型勘定エンジン（複式簿記コア、監査、Keycloak）の設計・開発。' },
                { date: '2025年5月 - 2025年12月', title: '技術负责人 / アーキテクト @ パルナミリン市役所/RN', desc: 'Kubernetes、ArgoCD、GitLab CIを用いた行政レガシーシステムの近代化。Hibernate/JPAのリファクタリングによりパフォーマンスを30%向上。' },
                { date: '2025年3月 - 2025年6月', title: '非常勤講師 @ IFRN', desc: 'Web開発とデータベースの基礎を指導。Python、SQL、ベストプラクティスについて40名以上の学生を育成。' },
                { date: '2023年9月 - 2024年7月', title: 'AI エンジニア @ Vivo Aura / Mutant', desc: 'RAGパイプライン、LangChain、Python、RabbitMQを用いて、バーチャルアシスタント「Aura」（月間1500万件以上の対話）を生成AIへ進化。' },
                { date: '2023年11月 - 2023年12月', title: 'ソフトウェアエンジニア @ J17 Bank', desc: 'PCI DSSに準拠した重要な金融API의維持。MySQLクエリおよびPIX即時決済フローの最適化により、遅延を25%削減。' },
                { date: '2023年1月 - 2023年12月', title: 'フロントエンド開発者 @ Not so Impossible Media', desc: 'ReactJS、Material UI、SASSを用いた、レスポンシブでパフォーマンスの高いWebアプリケーションの構築。' },
                { date: '2022年2月 - 2023年3月', title: '技術负责人 @ Holistix', desc: 'KafkaとRocksetを用いたデータアーキテクチャおよびパイプラインの構築。Node.js、Pythonによる拡張性の高いRESTful API設計、テストカバー率85%以上。' },
                { date: '2021年4月 - 2022年2月', title: 'フルスタックソフトウェアエンジニア @ Stefanini Brasil', desc: 'AWS（Lambda, ECS, EKS）におけるサーバーレスAPI設計により、インフラコストを20%削減。Terraformを用いたIaC（Infrastructure as Code）の実施。' },
                { date: '2020年11月 - 2021年4月', title: 'システムアナリスト @ +A Educação', desc: '.NET Core (C#)、Node.js、Vue.js、PostgreSQLを用いた教育プラットフォーム開発。' },
                { date: '2019年 - 2020年', title: 'システムアナリスト @ ITEP', desc: 'PHP、C#、JavaScript、MongoDBを用いたMVCウェブアプリケーションの開発。' },
                { date: '2018年 - 2019年', title: '研究助手 @ IFRN', desc: '自動化、ウェブスクレイピング、リアルタイムデータ処理のためのPythonスクリプト開発。' }
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
            <div className="hero-badge">🎓 学歴</div>
            <Heading as="h2" className={styles.sectionHeading}>学術背景</Heading>
            <div className={styles.certItem}>
              <h4>計算知能修了（修士課程）</h4>
              <p>北大河州連邦大学 (UFRN) （休学）</p>
            </div>
            <div className={styles.certItem}>
              <h4>システム分析・開発技術学士</h4>
              <p>北大河州連邦教育科学技術学院 (IFRN) (2016 – 2022) — クリーンアーキテクチャ専攻</p>
            </div>
            <div className={styles.certItem}>
              <h4>プログラミング技術コース</h4>
              <p>北大河州連邦大学 (UFRN) (2012)</p>
            </div>
          </div>
          <div className="col col--6">
            <div className="hero-badge">📜 資格とコース</div>
            <Heading as="h2" className={styles.sectionHeading}>認定資格</Heading>
            <div className={styles.certItem}>
              <h4>Python for Data Science</h4>
              <p>データサイエンス & アナリティクス</p>
            </div>
            <div className={styles.certItem}>
              <h4>Microsoft Azure AI Fundamentals (AI-900)</h4>
              <p>Microsoft認定</p>
            </div>
            <div className={styles.certItem}>
              <h4>基本プログラミング / フルスタックブートキャンプ</h4>
              <p>Web開発 & フルスタックエンジニアリング</p>
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
        <EducationSection />
        <ContactSection />
      </main>
    </Layout>
  );
}
