---
title: "סקירה כללית"
sidebar_label: "סקירה כללית"
sidebar_position: 1
---

# <MdExplore style={{verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-storm-cloud)'}} /> סקירה כללית של סביבת העבודה

import { MdExplore, MdSyncAlt, MdBarChart, MdFolderZip } from 'react-icons/md';

ברוכים הבאים לתיעוד הטכני של סביבת העבודה. מערכת זו מרכזת את <span className="text-highlight">שיטות ההנדסה</span>, האוטומציה והניטור המשמשים בפרויקטים שלנו.

---

## 🚀 מה תמצאו כאן

התיעוד מחולק לנדבכים בסיסיים על מנת להבטיח את מדרגיות התוכנה ואיכותה:

<div className="doc-featured-section">
  <h3><MdSyncAlt style={{verticalAlign: 'middle', marginRight: '8px'}} /> יישום GitOps</h3>
  <p>
    פרטים על צינור ה-<strong>CI/CD</strong> שלנו באמצעות <strong>GitHub Actions</strong> ו-<strong>ArgoCD</strong>.
  </p>
  <a href="/he/docs/category/implementação-gitops" className="text-highlight">צפה בתיעוד GitOps ←</a>
</div>

<div className="doc-featured-section">
  <h3><MdBarChart style={{verticalAlign: 'middle', marginRight: '8px'}} /> איכות וניטור</h3>
  <p>
    מדריך לשימוש ב-<strong>SonarQube</strong> לניתוח קוד סטטי (SAST).
  </p>
  <a href="/he/docs/category/qualidade--monitoramento" className="text-highlight">צפה בתיעוד הניטור ←</a>
</div>

---

## <MdFolderZip style={{verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-storm-cloud)'}} /> מיפוי מאגרים

כל המימושים המתוארים במסמכים אלה נמצאים ישירות במאגר זה. להלן המדריך לאיתור כל חלק מהקוד:

| רכיב | מיקום | תיאור |
| :--- | :--- | :--- |
| **Java Backend** | `@java/atomant-auth/` | מיקרו-שירות של Spring Boot/Quarkus המתמקד ב-Auth. |
| **Angular Frontend** | `@angular/financial/` | אפליקציית אינטרנט לניהול פיננסי. |
| **Python Scripts** | `@python/poetry/` | אוטומציות ולוגיקת פייתון באמצעות Poetry. |
| **SonarQube Infra** | `@devops/sonarqube/` | קובצי Docker והגדרות שרת איכות. |
| **CI Pipeline** | `.github/workflows/` | הגדרות אוטומציה של GitHub Actions. |
| **פורטפוליו/מסמכים** | `docs/joel-dev/` | קוד המקור של פורטל Docusaurus זה. |

---

## 🏗️ פילוסופיית עבודה

המערכת האקולוגית שלנו מונחית על ידי עקרונות של **Clean Architecture**, **DDD** ו-**Infrastructure as Code**. המטרה היא להפחית את החיכוך בין פיתוח לתפעול.

:::info
הפניה ישירה
תוכלו לגשת לקוד המקור המלא על ידי ניווט בתיקיות המפורטות לעיל בדפדפן הקבצים שלכם או ישירות ב-[GitHub](https://github.com/joelmaykon94/joelmaykon94).
:::
