import styles from './Footer.module.scss';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className="container">
          <div className={styles.grid}>
            <div className={styles.brand}>
              <div className={styles.logo}>
                <img src="assets/images/logo/logo-ford.png" alt="Ford" className={styles.logoImg} />
                <div className={styles.logoDivider} />
                <div className={styles.logoText}>
                  <span className={styles.logoTitle}>FORD ONE</span>
                  <span className={styles.logoSub}>PORTAL FORD</span>
                </div>
              </div>
              <p>A plataforma digital oficial da Ford para uma nova era de mobilidade conectada e inteligente.</p>
              <div className={styles.social}>
                {[
                  { icon: 'fa-brands fa-instagram',   label: 'Instagram' },
                  { icon: 'fa-brands fa-facebook-f',  label: 'Facebook' },
                  { icon: 'fa-brands fa-linkedin-in', label: 'LinkedIn' },
                  { icon: 'fa-brands fa-youtube',     label: 'YouTube' },
                ].map(({ icon, label }) => (
                  <a key={label} href="#" aria-label={label}><i className={icon} /></a>
                ))}
              </div>
            </div>

            {[
              {
                title: 'Plataforma',
                links: [
                  { href: '#o-que-e',      label: 'O que é Ford One' },
                  { href: '#tecnologia',    label: 'Tecnologia' },
                  { href: '#beneficios',   label: 'Benefícios' },
                  { href: '#como-funciona',label: 'Como funciona' },
                  { href: '#veiculos',     label: 'Veículos' },
                ],
              },
              {
                title: 'Ford',
                links: [
                  { href: '#', label: 'Sobre a Ford' },
                  { href: '#', label: 'Concessionárias' },
                  { href: '#', label: 'Imprensa' },
                  { href: '#', label: 'Carreiras' },
                  { href: '#', label: 'Sustentabilidade' },
                ],
              },
              {
                title: 'Suporte',
                links: [
                  { href: '#', label: 'Central de ajuda' },
                  { href: '#', label: 'Fale conosco' },
                  { href: '#', label: 'Política de privacidade' },
                  { href: '#', label: 'Termos de uso' },
                  { href: '#', label: 'LGPD' },
                ],
              },
            ].map(({ title, links }) => (
              <div key={title} className={styles.col}>
                <h5>{title}</h5>
                {links.map(({ href, label }) => (
                  <a key={label} href={href}>{label}</a>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <span>© 2025 Ford Motor Company do Brasil. Todos os direitos reservados.</span>
          <span>Ford One™ — Ford Smart Ecosystem</span>
        </div>
      </div>
    </footer>
  );
}
