import { Link } from 'react-router-dom';
import { ROUTES } from '../../../../shared/constants/routes';
import styles from './Hero.module.scss';

/**
 * Seção hero da landing page com título, CTAs e estatísticas.
 */
export function Hero() {
  return (
    <section className={styles.hero} id="hero">
      <div className={styles.heroBg}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroGridLines} />
      </div>

      <div className={styles.heroContent}>
        <div className={styles.heroBadge}>
          <span className={styles.badgeDot} />
          Ford Smart Ecosystem &mdash; Nova Geração
        </div>

        <h1 className={styles.heroTitle}>
          Ford One.<br />
          <em>O futuro da<br />mobilidade começa agora.</em>
        </h1>

        <p className={styles.heroSub}>
          A plataforma digital que conecta você ao seu veículo, à concessionária e ao universo
          Ford &mdash; com inteligência, dados em tempo real e experiência sem igual.
        </p>

        <div className={styles.heroActions}>
          <a href="#o-que-e" className={styles.btnPrimary}>Conhecer a plataforma</a>
          <a href="#contato"  className={styles.btnGhost}>Agendar com concessionária</a>
        </div>

        <div className={styles.heroStats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>2M+</span>
            <span className={styles.statLabel}>Veículos conectados</span>
          </div>
          <div className={styles.statSep} />
          <div className={styles.stat}>
            <span className={styles.statNum}>98%</span>
            <span className={styles.statLabel}>Satisfação dos clientes</span>
          </div>
          <div className={styles.statSep} />
          <div className={styles.stat}>
            <span className={styles.statNum}>150+</span>
            <span className={styles.statLabel}>Concessionárias parceiras</span>
          </div>
        </div>
      </div>

      <div className={styles.heroCar}>
        <div className={styles.carGlow} />
        <img
          src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=90&auto=format"
          alt="Ford veículo premium"
          className={styles.carImg}
        />
        <div className={styles.carHud}>
          {[
            { icon: 'fa-bolt',          label: 'Motor ativo' },
            { icon: 'fa-wifi',          label: 'Conectado' },
            { icon: 'fa-shield-halved', label: 'Sistema OK' },
          ].map(({ icon, label }) => (
            <div key={label} className={styles.hudItem}>
              <i className={`fa-solid ${icon} ${styles.hudIcon}`} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.scrollHint}>
        <span>Rolar</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
}
