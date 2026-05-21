import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useChooserBackground } from './hooks/useChooserBackground';
import { ROUTES } from '../../shared/constants/routes';
import styles from './styles/escolher-acesso.module.scss';

/**
 * Tela de escolha de acesso — corresponde ao escolher.html original.
 */
export function EscolherAcessoScreen() {
  useChooserBackground('bg-canvas');

  return (
    <div className={styles.page}>
      <canvas id="bg-canvas" className={styles.canvas} />

      <header className={styles.header}>
        <Link to={ROUTES.HOME} className={styles.logo}>
          <img src="assets/images/logo/logo-ford.png" alt="Ford" className={styles.logoImg} />
          <div className={styles.logoDivider} />
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>FORD ONE</span>
            <span className={styles.logoSub}>PORTAL FORD</span>
          </div>
        </Link>
        <Link to={ROUTES.HOME} className={styles.backLink}>
          <i className="fa-solid fa-chevron-left" /> Voltar
        </Link>
      </header>

      <div className={styles.chooser}>
        <div className={styles.chooserHeader}>
          <div className={styles.tag}>
            <span className={styles.tagDot} />
            Ford Smart Ecosystem
          </div>
          <h1 className={styles.title}>Como deseja acessar<br />o Ford One?</h1>
          <p className={styles.sub}>Escolha a plataforma ideal para você.</p>
        </div>

        <div className={styles.cards}>
          <Link to={ROUTES.CONCESSIONARIA} className={styles.card}>
            <div className={styles.cardIcon}><i className="fa-solid fa-display" /></div>
            <span className={styles.cardLabel}>Site da Concessionária</span>
            <p className={styles.cardDesc}>Acesse o portal completo pelo navegador do seu computador ou tablet.</p>
            <div className={styles.cardArrow}><i className="fa-solid fa-arrow-right" /></div>
          </Link>

          <Link to={ROUTES.ACESSO_MOBILE} className={`${styles.card} ${styles.cardDelay}`}>
            <div className={styles.cardIcon}><i className="fa-solid fa-mobile-screen" /></div>
            <span className={styles.cardLabel}>Acesso Mobile</span>
            <p className={styles.cardDesc}>Escaneie o QR Code e acesse o Ford One direto no navegador do seu celular.</p>
            <div className={styles.cardArrow}><i className="fa-solid fa-arrow-right" /></div>
          </Link>
        </div>
      </div>
    </div>
  );
}
