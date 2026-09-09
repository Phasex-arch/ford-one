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
          <img src="assets/images/logo/icon_ford_one.png" alt="Ford" className={styles.logoImg} />
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
            <svg viewBox="0 0 37 37" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
              <rect width="37" height="37" fill="white" />
              {/* Finder top-left */}
              <rect x="1" y="1" width="7" height="7" fill="#00095b" />
              <rect x="2" y="2" width="5" height="5" fill="white" />
              <rect x="3" y="3" width="3" height="3" fill="#00095b" />
              {/* Finder top-right */}
              <rect x="29" y="1" width="7" height="7" fill="#00095b" />
              <rect x="30" y="2" width="5" height="5" fill="white" />
              <rect x="31" y="3" width="3" height="3" fill="#00095b" />
              {/* Finder bottom-left */}
              <rect x="1" y="29" width="7" height="7" fill="#00095b" />
              <rect x="2" y="30" width="5" height="5" fill="white" />
              <rect x="3" y="31" width="3" height="3" fill="#00095b" />
              {/* Timing */}
              <rect x="8"  y="6" width="1" height="1" fill="#00095b" /><rect x="10" y="6" width="1" height="1" fill="#00095b" /><rect x="12" y="6" width="1" height="1" fill="#00095b" /><rect x="14" y="6" width="1" height="1" fill="#00095b" /><rect x="16" y="6" width="1" height="1" fill="#00095b" /><rect x="18" y="6" width="1" height="1" fill="#00095b" /><rect x="20" y="6" width="1" height="1" fill="#00095b" />
              <rect x="6" y="8"  width="1" height="1" fill="#00095b" /><rect x="6" y="10" width="1" height="1" fill="#00095b" /><rect x="6" y="12" width="1" height="1" fill="#00095b" /><rect x="6" y="14" width="1" height="1" fill="#00095b" /><rect x="6" y="16" width="1" height="1" fill="#00095b" /><rect x="6" y="18" width="1" height="1" fill="#00095b" /><rect x="6" y="20" width="1" height="1" fill="#00095b" />
              {/* Data modules */}
              <rect x="8"  y="8"  width="1" height="3" fill="#00095b" /><rect x="10" y="8"  width="3" height="1" fill="#00095b" /><rect x="14" y="8"  width="1" height="2" fill="#00095b" /><rect x="16" y="8"  width="2" height="3" fill="#00095b" /><rect x="19" y="8"  width="1" height="1" fill="#00095b" /><rect x="21" y="8"  width="3" height="2" fill="#00095b" /><rect x="25" y="8"  width="1" height="3" fill="#00095b" /><rect x="27" y="8"  width="2" height="1" fill="#00095b" />
              <rect x="8"  y="12" width="3" height="1" fill="#00095b" /><rect x="12" y="12" width="1" height="3" fill="#00095b" /><rect x="14" y="12" width="3" height="1" fill="#00095b" /><rect x="18" y="12" width="1" height="2" fill="#00095b" /><rect x="20" y="12" width="2" height="1" fill="#00095b" /><rect x="23" y="12" width="1" height="1" fill="#00095b" /><rect x="25" y="12" width="3" height="2" fill="#00095b" /><rect x="29" y="12" width="1" height="1" fill="#00095b" />
              <rect x="8"  y="15" width="1" height="2" fill="#00095b" /><rect x="10" y="15" width="2" height="3" fill="#00095b" /><rect x="13" y="15" width="3" height="1" fill="#00095b" /><rect x="17" y="15" width="1" height="2" fill="#00095b" /><rect x="19" y="15" width="3" height="1" fill="#00095b" /><rect x="23" y="15" width="2" height="3" fill="#00095b" /><rect x="26" y="15" width="1" height="1" fill="#00095b" /><rect x="28" y="15" width="2" height="2" fill="#00095b" />
              <rect x="8"  y="18" width="2" height="3" fill="#00095b" /><rect x="11" y="18" width="1" height="1" fill="#00095b" /><rect x="13" y="18" width="2" height="2" fill="#00095b" /><rect x="16" y="18" width="3" height="1" fill="#00095b" /><rect x="20" y="18" width="1" height="3" fill="#00095b" /><rect x="22" y="18" width="2" height="1" fill="#00095b" /><rect x="25" y="18" width="1" height="2" fill="#00095b" /><rect x="27" y="18" width="3" height="1" fill="#00095b" />
              <rect x="8"  y="22" width="1" height="2" fill="#00095b" /><rect x="10" y="22" width="3" height="1" fill="#00095b" /><rect x="14" y="22" width="1" height="3" fill="#00095b" /><rect x="16" y="22" width="2" height="1" fill="#00095b" /><rect x="19" y="22" width="1" height="2" fill="#00095b" /><rect x="21" y="22" width="3" height="3" fill="#00095b" /><rect x="25" y="22" width="1" height="1" fill="#00095b" /><rect x="27" y="22" width="2" height="2" fill="#00095b" />
              <rect x="22" y="29" width="3" height="1" fill="#00095b" /><rect x="26" y="29" width="1" height="3" fill="#00095b" /><rect x="28" y="29" width="2" height="1" fill="#00095b" /><rect x="22" y="31" width="1" height="3" fill="#00095b" /><rect x="24" y="31" width="3" height="1" fill="#00095b" /><rect x="28" y="31" width="2" height="3" fill="#00095b" /><rect x="22" y="34" width="3" height="1" fill="#00095b" /><rect x="26" y="34" width="1" height="1" fill="#00095b" />
              <rect x="8"  y="29" width="3" height="1" fill="#00095b" /><rect x="12" y="29" width="1" height="3" fill="#00095b" /><rect x="14" y="29" width="2" height="1" fill="#00095b" /><rect x="17" y="29" width="3" height="2" fill="#00095b" /><rect x="8"  y="31" width="1" height="3" fill="#00095b" /><rect x="10" y="31" width="2" height="1" fill="#00095b" /><rect x="13" y="31" width="1" height="1" fill="#00095b" /><rect x="15" y="31" width="3" height="3" fill="#00095b" /><rect x="19" y="31" width="1" height="1" fill="#00095b" /><rect x="8"  y="34" width="2" height="1" fill="#00095b" /><rect x="11" y="34" width="3" height="1" fill="#00095b" /><rect x="15" y="34" width="1" height="1" fill="#00095b" /><rect x="17" y="34" width="2" height="1" fill="#00095b" />
            </svg>
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
