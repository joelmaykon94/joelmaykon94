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
          <span className={styles.pulseDot} /> זמין לפרויקטים בעלי אימפקט גבוה
        </div>
        <Heading as="h1" className={clsx(styles.heroTitle, 'animate__animated animate__fadeInUp')}>
          מהנדס תוכנה בכיר <br />
          <span className={styles.heroAccent}>Senior</span>
        </Heading>
        <p className={clsx(styles.heroSubtitle, 'animate__animated animate__fadeInUp')}>
          מתמחה במערכות אקולוגיות של <strong>Java, Python ו-Cloud-Native</strong>. <br />
          הופך מורכבות לארכיטקטורות נקיות, גמישות וניתנות להרחבה.
        </p>
        <div className={clsx(styles.heroButtons, 'animate__animated animate__fadeInUp')}>
          <Link className="button--primary-linear" to="#portfolio">
            צפה בסיפורי הצלחה
          </Link>
          <Link className="button--secondary-linear margin-left--md" to="#about">
            אודותיי
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
              <div className="hero-badge">👋 אודותיי</div>
              <Heading as="h2" className={styles.sectionHeading}>תשוקה להנדסה וחדשנות</Heading>
              <p className={styles.aboutText}>
                עם למעלה מ-<strong>7 שנות ניסיון</strong>, אני מהנדס המונע מסקרנות.
                המיקוד שלי הוא במפגש שבין <strong>תוכנה חזקה</strong> לבין <strong>בינה מלאכותית</strong>, תוך מתן עדיפות לאוטונומיה ופתרונות הפותרים בעיות עסקיות אמיתיות.
              </p>
              <p className={styles.aboutText}>
                אני חוקר בטבעי, מה שמאפשר לי ליישם טכנולוגיות חדשות (כגון LLMs ו-LangChain) תוך שמירה על הקפדנות הארכיטקטונית הנדרשת לסביבות ייצור בקנה מידה גדול.
              </p>
              <div className={styles.aboutStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>7+</span>
                  <span className={styles.statLabel}>שנות ניסיון</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>15M+</span>
                  <span className={styles.statLabel}>משתמשים</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>100%</span>
                  <span className={styles.statLabel}>עבודה מרחוק</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col col--6">
            <div className={styles.aboutGrid}>
              <div className={styles.aboutGridItem}>
                <MdCode size={24} color="var(--color-porcelain)" />
                <h4>חדשנות</h4>
                <p>בינה מלאכותית יוצרת (Generative AI) ו-LLMOps במערכות קריטיות.</p>
              </div>
              <div className={styles.aboutGridItem}>
                <MdRocketLaunch size={24} color="var(--color-porcelain)" />
                <h4>עמידות וגמישות</h4>
                <p>מערכות מבוזרות בעלות זמינות גבוהה.</p>
              </div>
              <div className={styles.aboutGridItem}>
                <MdWork size={24} color="var(--color-porcelain)" />
                <h4>אוטונומיה</h4>
                <p>מנהיגות טכנולוגית וראייה מקצה לקצה.</p>
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
      role: 'مهندس AI',
      title: "צ'אטבוט Aura AI",
      description: 'פיתוח של העוזר הווירטואלי (15 מיליון+ אינטראקציות בחודש) לבינה מלאכותית יוצרת באמצעות Python ו-LangChain.',
      tech: ['Python', 'LangChain', 'RabbitMQ', 'Azure'],
      results: 'תמיכה יציבה בלמעלה מ-15 מיליון משתמשים.',
    },
    {
      id: 'gov',
      company: 'עיריית פרנמירין',
      role: 'מוביל טכנולוגי (Tech Lead)',
      title: 'מודרניזציה ממשלתית',
      description: 'רה-פקטורינג לארכיטקטורה נקייה ופריסה באמצעות Kubernetes ו-ArgoCD.',
      tech: ['Java', 'Quarkus', 'Kubernetes', 'ArgoCD'],
      results: 'צמצום של 40% בזמן הפריסה.',
    },
    {
      id: 'bank',
      company: 'J17 Bank',
      role: 'מהנדס תוכנה',
      title: 'ממשקי API פיננסיים ותשלומי PIX',
      description: 'תמיכה ותחזוקה של תהליכים בנקאיים קריטיים בהתאם לתקן PCI DSS.',
      tech: ['Java', 'MySQL', 'Docker', 'JUnit'],
      results: 'צמצום של 25% בזמן התגובה של העסקאות.',
    },
  ];

  return (
    <section id="portfolio" className={styles.portfolioSection}>
      <div className="container">
        <div className="text--center margin-bottom--xl">
          <div className="hero-badge">🛠️ תיק עבודות</div>
          <Heading as="h2" className={styles.sectionHeading}>סיפורי הצלחה</Heading>
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
                  <strong>תוצאה:</strong> {c.results}
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
            <div className="hero-badge">⏳ ציר זמן</div>
            <Heading as="h2" className={styles.stickyHeading}>קריירה <br /> מקצועית</Heading>
            <p className={styles.experienceIntro}>
              למעלה מ-7 שנים בבניית פתרונות בעלי אימפקט גבוה, מבנקאות ועד AI.
            </p>
          </div>
          <div className="col col--8">
            <div className={styles.timeline}>
              {[
                { date: '2025', title: 'מוביל טכנולוגי (Tech Lead) @ Parnamirim/RN', desc: 'מודרניזציה של מערכות מורשת בעזרת Kubernetes ו-ArgoCD.' },
                { date: '2023 - 2024', title: 'מהנדס AI @ Vivo Aura', desc: 'בינה מלאכותית יוצרת וצינורות RAG המעבדים 15 מיליון+ אינטראקציות.' },
                { date: '2023', title: 'מהנדס תוכנה @ J17 Bank', desc: 'תאימות PCI DSS ואופטימיזציה של ליבת הבנקאות (PIX).' },
                { date: '2022 - 2023', title: 'מוביל טכנולוגי (Tech Lead) @ Holistix', desc: 'ארכיטקטורת נתונים עם Kafka ו-Rockset.' }
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
            <div className="hero-badge">📬 יצירת קשר</div>
            <Heading as="h2" className={styles.heroTitle}>בואו נבנה משהו גדול ביחד?</Heading>
            <p className={styles.heroSubtitle}>
              זמין להזדמנויות <strong>עבודה מרחוק</strong> הכוללות ארכיטקטורות מורכבות ובינה מלאכותית.
            </p>
            <div className={styles.contactButtons}>
              <Link className="button--primary-linear" to="mailto:joelmaykon94@gmail.com">
                <MdEmail size={20} className="margin-right--sm" /> שלח אימייל
              </Link>
              <Link className="button--secondary-linear margin-left--md" to="https://linkedin.com/in/joelmaykon">
                פרופיל LinkedIn <MdArrowForward size={20} className="margin-left--sm" />
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
          <p className={styles.techStackLabel}>טכנולוגיות מובילות</p>
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
      title={`${siteConfig.title} | מהנדס תוכנה בכיר`}
      description="תיק עבודות של יואל מייקון - מהנדס תוכנה בכיר המתמחה ב-Java, Python ו-AI.">
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
