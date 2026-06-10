import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Joel Maykon',
  tagline: 'Software Engineer Senior | Java & Python | Cloud & DevOps',
  favicon: 'https://github.com/joelmaykon94.png',

  future: {
    v4: true,
  },

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  // Netlify Configuration
  url: 'https://joelmaykon.netlify.app',
  baseUrl: '/',

  organizationName: 'joelmaykon94',
  projectName: 'joelmaykon94', // Name of the main repo

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR', 'en', 'zh-Hans', 'he', 'ja'],
    localeConfigs: {
      'pt-BR': {
        label: 'Português',
        direction: 'ltr',
        htmlLang: 'pt-BR',
      },
      en: {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en-US',
      },
      'zh-Hans': {
        label: '中文 (简体)',
        direction: 'ltr',
        htmlLang: 'zh-CN',
      },
      he: {
        label: 'עברית',
        direction: 'rtl',
        htmlLang: 'he-IL',
      },
      ja: {
        label: '日本語',
        direction: 'ltr',
        htmlLang: 'ja-JP',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/joelmaykon94/joelmaykon94/tree/main/docs/joel-dev/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl:
            'https://github.com/joelmaykon94/joelmaykon94/tree/main/docs/joel-dev/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Joel Maykon',
      logo: {
        alt: 'Joel Maykon Logo',
        src: 'https://github.com/joelmaykon94.png',
        style: { borderRadius: '50%' },
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Práticas',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/joelmaykon94',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Links',
          items: [
            {
              label: 'LinkedIn',
              href: 'https://linkedin.com/in/joelmaykon',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/joelmaykon94',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Joel Maykon. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
