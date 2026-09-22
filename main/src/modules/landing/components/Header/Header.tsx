import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useScrollHeader } from '../../../../shared/hooks/useScrollHeader';
import { ROUTES } from '../../../../shared/constants/routes';
import styles from './Header.module.scss';

/**
 * Header fixo da landing page com logo Ford One, navegação e CTA.
 */
export function Header() {
  const scrolled   = useScrollHeader(55);
  const [open, setOpen] = useState(false);

  return (
    <header id="header" className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <Link to={ROUTES.HOME} className={styles.logo}>
          <img src="/assets/images/logo/icon_ford_one.png" alt="Ford" className={styles.logoImg} />
          <div className={styles.logoDivider} />
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>FORD ONE</span>
            <span className={styles.logoSub}>PORTAL FORD</span>
          </div>
        </Link>

        <nav className={`${styles.nav} ${open ? styles.open : ''}`} id="nav">
          {[
            { href: '#hero',          label: 'Início' },
            { href: '#tecnologia',    label: 'Tecnologia' },
            { href: '#beneficios',    label: 'Benefícios' },
            { href: '#como-funciona', label: 'Como Funciona' },
            { href: '#ecossistema',   label: 'Ecossistema' },
            { href: '#contato',       label: 'Contato' },
          ].map(({ href, label }) => (
            <a key={href} href={href} className={styles.navLink} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>

        <Link to={ROUTES.ESCOLHER} className={styles.ctaBtn}>
          Começar agora
        </Link>

        <button
          className={`${styles.hamburger} ${open ? styles.hamburgerOpen : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
