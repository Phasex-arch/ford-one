import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from './components/Header/Header';
import { Hero } from './components/Hero/Hero';
import { ContactSection } from './components/ContactSection/ContactSection';
import { Footer } from './components/Footer/Footer';
import { useLandingEffects } from './hooks/useLandingEffects';
import { ROUTES } from '../../shared/constants/routes';
import './styles/landing.screen.scss';

/**
 * Tela principal do Ford One — corresponde ao index.html original.
 */
export function LandingScreen() {
  useLandingEffects();

  return (
    <>
      <Header />
      <Hero />

      {/* O QUE É */}
      <section className="section what-is" id="o-que-e" style={{ background: '#f4f6f9' }}>
        <div className="container">
          <div className="section-tag">Conceito</div>
          <div className="what-grid">
            <div className="what-left">
              <h2 className="section-title">O que é o<br /><strong>Ford One?</strong></h2>
              <p className="section-desc">Ford One é a plataforma central do Ford Smart Ecosystem — um sistema digital que une veículo, cliente, concessionária e a própria Ford em uma única experiência inteligente e contínua.</p>
              <p className="section-desc">Mais do que um aplicativo, é uma nova forma de se relacionar com seu veículo: com dados reais, recomendações precisas e suporte proativo em cada etapa da jornada.</p>
              <a href="#como-funciona" className="btn-outline">Ver como funciona</a>
            </div>
            <div className="what-right">
              <div className="concept-cards">
                {[
                  { delay: 0,   icon: 'fa-car',        title: 'Veículo Conectado',      desc: 'Seu Ford transmite dados em tempo real para análise inteligente e diagnóstico preditivo.' },
                  { delay: 120, icon: 'fa-user-check',  title: 'Experiência Personalizada', desc: 'Cada cliente recebe recomendações únicas baseadas no seu perfil e histórico de uso.' },
                  { delay: 240, icon: 'fa-link',         title: 'Ecossistema Integrado',  desc: 'Uma rede viva que conecta você à concessionária certa, no momento certo.' },
                ].map(({ delay, icon, title, desc }) => (
                  <div key={title} className="concept-card" data-delay={delay}>
                    <div className="cc-icon"><i className={`fa-solid ${icon}`} /></div>
                    <div className="cc-text">
                      <h4>{title}</h4>
                      <p>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECNOLOGIA */}
      <section className="section tech-section dark-section" id="tecnologia">
        <div className="tech-bg-anim" />
        <div className="container">
          <div className="section-tag light">Tecnologia &amp; Inteligência</div>
          <h2 className="section-title light center">Inteligência a serviço<br />da sua mobilidade</h2>
          <p className="section-desc light center">Motor de IA proprietário da Ford processando milhões de dados por segundo para antecipar suas necessidades antes mesmo que você as perceba.</p>
          <div className="tech-grid">
            {[
              { delay: 0,   icon: 'fa-database',       title: 'Inteligência de Dados',      desc: 'Coleta e análise de mais de 200 parâmetros do veículo em tempo real, gerando insights precisos sobre desempenho e saúde mecânica.', bar: 92, barLabel: 'Precisão 92%' },
              { delay: 120, icon: 'fa-screwdriver-wrench', title: 'Manutenção Preditiva', desc: 'Algoritmos de machine learning identificam falhas potenciais com até 30 dias de antecedência, evitando paradas inesperadas.', bar: 88, barLabel: 'Antecipação 30 dias' },
              { delay: 240, icon: 'fa-brain',           title: 'Recomendações Inteligentes', desc: 'Sugestões personalizadas de serviços, revisões e upgrades baseadas no histórico real do seu veículo e perfil de condução.', bar: 95, barLabel: 'Relevância 95%' },
              { delay: 360, icon: 'fa-network-wired',   title: 'Integração Digital Total',  desc: 'API aberta integrada a concessionárias, seguradoras e serviços parceiros Ford — tudo em um único ecossistema unificado.', bar: 100, barLabel: 'Integração 100%' },
            ].map(({ delay, icon, title, desc, bar, barLabel }) => (
              <div key={title} className="tech-card" data-delay={delay}>
                <div className="tech-card-icon"><i className={`fa-solid ${icon}`} /></div>
                <h3>{title}</h3>
                <p>{desc}</p>
                <div className="tech-bar"><div className="tech-bar-fill" data-width={bar} /></div>
                <span className="tech-bar-label">{barLabel}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="section benefits-section" id="beneficios">
        <div className="container">
          <div className="section-tag">Benefícios</div>
          <h2 className="section-title">Por que o Ford One<br /><strong>muda tudo?</strong></h2>
          <div className="benefits-grid">
            {[
              { delay: 0,   num: '01', icon: 'fa-wrench',                   title: 'Manutenção Inteligente',  desc: 'Alertas proativos antes que problemas se tornem caros. Seu veículo nunca foi tão bem cuidado.' },
              { delay: 80,  num: '02', icon: 'fa-circle-dollar-to-slot',    title: 'Redução de Custos',       desc: 'Clientes Ford One economizam em média 34% em manutenção anual com intervenções preventivas.' },
              { delay: 160, num: '03', icon: 'fa-shield-halved',            title: 'Segurança Avançada',      desc: 'Monitoramento contínuo de sistemas críticos: freios, suspensão, motor, bateria e muito mais.' },
              { delay: 240, num: '04', icon: 'fa-mobile-screen',            title: 'Conveniência Total',      desc: 'Agende revisões, acesse histórico e fale com a concessionária direto do seu smartphone.' },
              { delay: 320, num: '05', icon: 'fa-sliders',                  title: 'Controle Completo',       desc: 'Painel unificado com todos os dados do seu veículo — quilometragem, diagnósticos e status em tempo real.' },
              { delay: 400, num: '06', icon: 'fa-handshake', accent: true,  title: 'Atendimento Ford',        desc: 'Cada cliente é único. Nossa equipe está sempre pronta para atender você com o mesmo cuidado e dedicação.' },
            ].map(({ delay, num, icon, title, desc, accent }) => (
              <div key={num} className={`benefit-card${accent ? ' benefit-card--accent' : ''}`} data-delay={delay}>
                <div className="benefit-num">{num}</div>
                <div className="benefit-icon"><i className={`fa-solid ${icon}`} /></div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="section how-section dark-section" id="como-funciona">
        <div className="container">
          <div className="section-tag light">Processo</div>
          <h2 className="section-title light center">Como funciona em<br /><strong>5 passos simples</strong></h2>
          <div className="steps-flow">
            {[
              { delay: 0,   num: '01', icon: 'fa-clipboard-list', title: 'Cadastro',              desc: 'Crie sua conta no Ford One em menos de 2 minutos com seus dados básicos e informações do veículo.' },
              { delay: 100, num: '02', icon: 'fa-plug',            title: 'Conexão do Veículo',   desc: 'Vincule seu Ford via OBD-II ou sistema SYNC nativo. A conexão é automática e segura por criptografia AES-256.' },
              { delay: 200, num: '03', icon: 'fa-chart-line',      title: 'Análise de Dados',     desc: 'Nossa IA processa continuamente os dados do veículo, identificando padrões e anomalias em tempo real.' },
              { delay: 300, num: '04', icon: 'fa-lightbulb',       title: 'Recomendações',        desc: 'Você recebe alertas e sugestões personalizadas diretamente no app, por e-mail ou SMS.' },
              { delay: 400, num: '05', icon: 'fa-calendar-check',  title: 'Agendamento',          desc: 'Agende serviços na concessionária parceira mais próxima com um clique, com horário garantido.' },
            ].map(({ delay, num, icon, title, desc }, idx) => (
              <>
                <div key={num} className="step" data-delay={delay}>
                  <div className="step-num-badge">{num}</div>
                  <div className="step-body">
                    <div className="step-icon-wrap"><i className={`fa-solid ${icon}`} /></div>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </div>
                </div>
                {idx < 4 && <div key={`arrow-${idx}`} className="step-arrow"><i className="fa-solid fa-chevron-right" /></div>}
              </>
            ))}
          </div>
        </div>
      </section>

      {/* ECOSSISTEMA */}
      <section className="section ecosystem-section" id="ecossistema" style={{ background: '#f4f6f9' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-tag">Ecossistema</div>
          <h2 className="section-title">Uma rede completa<br /><strong>trabalhando por você</strong></h2>
          <p className="section-desc center">O Ford One não é um produto isolado. É o centro de um ecossistema vivo, onde cada elemento se comunica e se fortalece mutuamente.</p>
          <div className="ecosystem-visual">
            <div className="eco-center">
              <div className="eco-core">
                <span className="eco-core-label">FORD<br />ONE</span>
                <div className="eco-pulse" /><div className="eco-pulse delay-1" /><div className="eco-pulse delay-2" />
              </div>
            </div>
            <div className="eco-nodes">
              {[
                { pos: 'top',    delay: 0,   icon: 'fa-user',      title: 'Cliente',          desc: 'App personalizado, alertas em tempo real e histórico completo do veículo na palma da mão.' },
                { pos: 'right',  delay: 150, icon: 'fa-building',   title: 'Concessionária',   desc: 'Recebe agendamentos inteligentes com diagnóstico prévio, otimizando tempo e estoque.' },
                { pos: 'bottom', delay: 300, icon: 'fa-car-side',   title: 'Veículo',          desc: 'Transmite dados de forma contínua e segura. O carro é o coração do ecossistema.' },
                { pos: 'left',   delay: 450, icon: 'fa-industry',   title: 'Ford',             desc: 'Aprimora continuamente produtos e serviços com base em dados reais da frota global.' },
              ].map(({ pos, delay, icon, title, desc }) => (
                <div key={pos} className={`eco-node ${pos}`} data-delay={delay}>
                  <div className="eco-node-icon"><i className={`fa-solid ${icon}`} /></div>
                  <h4>{title}</h4>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* VEÍCULOS */}
      <section className="section vehicles-section dark-section" id="veiculos">
        <div className="container">
          <div className="section-tag light">Frota</div>
          <h2 className="section-title light">Veículos<br /><strong>Ford compatíveis</strong></h2>
          <p className="section-desc light center">O Ford One está disponível para toda a linha atual Ford. Conecte seu veículo e comece hoje mesmo.</p>
          <div className="vehicles-grid">
            {[
              { delay: 0,   img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80&auto=format', badge: 'Esportivo', name: 'Ford Mustang',  cat: 'Performance & Estilo' },
              { delay: 100, img: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&q=80&auto=format', badge: 'SUV', name: 'Ford Bronco', cat: 'Aventura & Off-Road' },
              { delay: 200, img: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80&auto=format', badge: 'Elétrico', badgeElectric: true, name: 'F-150 Lightning', cat: 'Elétrico & Tecnológico', featured: true },
              { delay: 300, img: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&q=80&auto=format', badge: 'Família', name: 'Ford Explorer', cat: 'Família & Conforto' },
            ].map(({ delay, img, badge, badgeElectric, name, cat, featured }) => (
              <div key={name} className={`vehicle-card${featured ? ' featured-vehicle' : ''}`} data-delay={delay}>
                <div className="vehicle-img-wrap">
                  <img src={img} alt={name} />
                  <div className={`vehicle-badge${badgeElectric ? ' electric' : ''}`}>{badge}</div>
                </div>
                <div className="vehicle-info">
                  <h3>{name}</h3>
                  <span className="vehicle-cat">{cat}</span>
                  <div className="vehicle-compat"><i className="fa-solid fa-circle-check" /> Ford One Ready</div>
                </div>
              </div>
            ))}
          </div>
          <div className="vehicles-cta">
            <p>+ 40 modelos compatíveis com Ford One</p>
            <a href="#contato" className="btn-outline light">Ver todos os modelos</a>
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="section differentials-section" id="diferenciais">
        <div className="container">
          <div className="section-tag">Por que Ford One</div>
          <h2 className="section-title">Inovação que você<br /><strong>pode sentir na prática</strong></h2>
          <div className="diff-split">
            <div className="diff-visual">
              <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=85&auto=format" alt="Tecnologia Ford" className="diff-img" />
              <div className="diff-overlay-card">
                <span className="doc-big">34%</span>
                <span className="doc-small">economia média em manutenção</span>
              </div>
            </div>
            <div className="diff-list">
              {[
                { delay: 0,   title: 'Tecnologia proprietária Ford',      desc: 'Desenvolvida internamente pela equipe global Ford, integrada ao DNA dos veículos desde a fabricação.' },
                { delay: 100, title: 'Confiabilidade comprovada',         desc: 'Mais de 120 anos de história Ford respaldando cada decisão tecnológica da plataforma.' },
                { delay: 200, title: 'Segurança de dados nível bancário', desc: 'Criptografia end-to-end, servidores certificados ISO 27001 e conformidade total com a LGPD.' },
                { delay: 300, title: 'Evolução contínua',                 desc: 'Atualizações automáticas OTA que melhoram o sistema sem que você precise fazer nada.' },
                { delay: 400, title: 'Suporte 24/7 dedicado',             desc: 'Central de atendimento especializada disponível a qualquer hora, pelo app ou telefone.' },
              ].map(({ delay, title, desc }) => (
                <div key={title} className="diff-item" data-delay={delay}>
                  <div className="diff-check"><i className="fa-solid fa-check" /></div>
                  <div><h4>{title}</h4><p>{desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ContactSection />

      {/* CTA FINAL */}
      <section className="cta-final">
        <div className="cta-bg-wrap">
          <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1800&q=85&auto=format" alt="Ford CTA" className="cta-bg-img" />
          <div className="cta-overlay" />
        </div>
        <div className="container cta-content">
          <h2 className="cta-title">Conecte-se ao futuro<br />da mobilidade</h2>
          <p className="cta-desc">Milhares de proprietários Ford já transformaram sua relação com o veículo. A sua vez chegou.</p>
          <Link to={ROUTES.ESCOLHER} className="btn-cta-final">
            Começar agora <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
