import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const getCurrentYear = () => {
  return new Date().getFullYear();
};


const FeatureList = [
  {
    title: 'Support Me',
    // Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        <p>Give me a star at here</p>
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/joelmaykon94">
          <div
            style={{
              width: '50px',
              height: '50px',
              backgroundImage: 'url("https://s.magecdn.com/social/tc-github.svg")',
              backgroundSize: 'cover',
              display: 'inline-block',
              borderRadius: '50%', // Faz a imagem virar um círculo
            }}
          ></div>
        </a>
        <br />
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/joelmaykon94">
          GitHub Projects
        </a>
      </>
    ),
  },
  {
    title: 'About Me',
    // Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        I am a technology enthusiast, especially in algorithms and AI (Artificial Intelligence). I have strong skills in computer programming, administration of databases, AI model development, data analysis, and data mining.
      </>
    ),
  },
  {
    title: 'Contact Me',
    // Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        <p>My X or Twitter</p>
        <a target="_blank" rel="noopener noreferrer" href="https://x.com/joelmaykon94">
          <div
            style={{
              width: '50px',
              height: '50px',
              backgroundImage: 'url("https://s.magecdn.com/social/tc-x.svg")',
              backgroundSize: 'cover',
              display: 'inline-block',
              borderRadius: '50%', // Faz a imagem virar um círculo
            }}
          ></div>
        </a>
        <br />
        <a target="_blank" rel="noopener noreferrer" href="https://x.com/joelmaykon94">
          @joelmaykon94
        </a>
        <br />
      </>
    ),
  },
];

function Feature ( { Svg, title, description } ) {
  return (
    <div className={clsx( 'col col--4' )}>
      <div className="text--center">
        {/* <Svg className={styles.featureSvg} role="img" /> */}
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures () {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map( ( props, idx ) => (
            <Feature key={idx} {...props} />
          ) )}

        
        </div>
        <div  className="col col--12" style={{ textAlign: 'center' }}>
            &copy; 2012 - {getCurrentYear()} Joel Maykon. All Rights Reserved.
          </div>

      </div>
    </section>
  );
}
