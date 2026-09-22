import { Link } from 'react-router-dom';
import { useMobileBackground } from './hooks/useMobileBackground';
import { ROUTES } from '../../shared/constants/routes';
import styles from './styles/acesso-mobile.module.scss';

/**
 * Tela de acesso mobile com QR Code — corresponde ao app-mobile.html original.
 */
export function AcessoMobileScreen() {
  useMobileBackground('bg-mobile');

  return (
    <div className={styles.page}>
      <canvas id="bg-mobile" className={styles.canvas} />

      <header className={styles.header}>
        <Link to={ROUTES.HOME} className={styles.logo}>
          <img src="/assets/images/logo/icon_ford_one.png" alt="Ford" className={styles.logoImg} />
          <div className={styles.logoDivider} />
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>FORD ONE</span>
            <span className={styles.logoSub}>PORTAL FORD</span>
          </div>
        </Link>
        <Link to={ROUTES.ESCOLHER} className={styles.backLink}>
          <i className="fa-solid fa-chevron-left" /> Voltar
        </Link>
      </header>

      <div className={styles.wrapper}>
        <div className={styles.tag}>
          <span className={styles.tagDot} />
          Acesso Mobile
        </div>

        <h1 className={styles.title}>Ford One no celular</h1>
        <p className={styles.sub}>
          Escaneie o QR Code com a câmera do seu smartphone para acessar o Ford One pelo
          navegador mobile.
        </p>

        <div className={styles.card}>
          <div className={styles.typeBadge}>
            <i className="fa-solid fa-mobile-screen" /> Acesso Mobile
          </div>

          <div className={styles.qrWrap}>
            <img
              src="/assets/images/qrcode/qrcode-ford-one.jpg"
              alt="QR Code para acessar o Ford One pelo celular"
            />
          </div>

          <span className={styles.label}>Aponte a câmera para acessar</span>
          <div className={styles.hint}>
            <i className="fa-solid fa-circle-info" />
            Abre direto no navegador do celular
          </div>
        </div>
      </div>
    </div>
  );
}
