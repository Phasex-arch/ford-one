import { Link } from 'react-router-dom';
import { ROUTES } from '../../../../shared/constants/routes';
import styles from './Footer.module.scss';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className="container">
          <div className={styles.grid}>
            <div className={styles.brand}>
              <div className={styles.logo}>
                <img src="/assets/images/logo/icon_ford_one.png" alt="Ford" className={styles.logoImg} />
                <div className={styles.logoDivider} />
                <div className={styles.logoText}>
                  <span className={styles.logoTitle}>FORD ONE</span>
                  <span className={styles.logoSub}>PORTAL FORD</span>
                </div>
              </div>
              <p>A plataforma digital oficial da Ford para uma nova era de mobilidade conectada e inteligente.</p>
            </div>

            <div className={styles.col}>
              <h5>Plataforma</h5>
              {[
                { href: '#o-que-e',      label: 'O que é Ford One' },
                { href: '#tecnologia',    label: 'Tecnologia' },
                { href: '#beneficios',   label: 'Benefícios' },
                { href: '#como-funciona',label: 'Como funciona' },
                { href: '#veiculos',     label: 'Veículos' },
              ].map(({ href, label }) => (
                <a key={label} href={href}>{label}</a>
              ))}
            </div>

            <div className={styles.col}>
              <h5>Acesso</h5>
              <Link to={ROUTES.CONCESSIONARIA}>Portal da concessionária</Link>
              <Link to={ROUTES.ACESSO_MOBILE}>Acesso mobile</Link>
              <a href="#contato">Fale conosco</a>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <span>© 2026 Ford Motor Company do Brasil. Todos os direitos reservados.</span>
          <span>Ford One™ — Ford Smart Ecosystem</span>
        </div>
      </div>
    </footer>
  );
}
