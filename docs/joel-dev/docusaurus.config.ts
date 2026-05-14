import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Joel Maykon',
  tagline: 'Software Engineer Senior | Java & Python | Cloud & DevOps',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // Netlify Configuration
  url: 'https://joelmaykon.netlify.app',
  baseUrl: '/',

  organizationName: 'joelmaykon94',
  projectName: 'joelmaykon94', // Name of the main repo

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR', 'en'],
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
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Conhecimento',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
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
