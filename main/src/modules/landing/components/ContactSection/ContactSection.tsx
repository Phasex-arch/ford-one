import { useContactForm } from '../../hooks/useContactForm';
import styles from './ContactSection.module.scss';

/**
 * Seção de contato com formulário validado e mensagem de sucesso.
 */
export function ContactSection() {
  const { form, errors, success, loading, submitError, setField, handlePhoneInput, handleSubmit } = useContactForm();

  return (
    <section className="section dark-section" id="contato">
      <div className="container">
        <div className={styles.grid}>
          {/* Info */}
          <div className={styles.left}>
            <div className="section-tag light">Contato</div>
            <h2 className="section-title light">
              Entre para o futuro<br /><strong>com a Ford</strong>
            </h2>
            <p className="section-desc light">
              Preencha o formulário e um especialista Ford entrará em contato para apresentar a
              plataforma personalizada para você.
            </p>
            <div className={styles.info}>
              {[
                { icon: 'fa-phone',        text: '0800 703 3673' },
                { icon: 'fa-envelope',     text: 'fordone@ford.com.br' },
                { icon: 'fa-location-dot', text: 'São Paulo, SP — Brasil' },
              ].map(({ icon, text }) => (
                <div key={text} className={styles.infoItem}>
                  <i className={`fa-solid ${icon} ${styles.infoIcon}`} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Formulário */}
          <div className={styles.right}>
            {success ? (
              <div className={styles.successBox}>
                <div className={styles.successIcon}><i className="fa-solid fa-check" /></div>
                <h3>Mensagem enviada!</h3>
                <p>Nossa equipe entrará em contato em até 24 horas. Bem-vindo ao futuro Ford.</p>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {submitError && <div className={styles.fieldError} role="alert">{submitError}</div>}
                <div className={styles.row}>
                  <div className={styles.group}>
                    <label htmlFor="nome">Nome completo *</label>
                    <input
                      id="nome" type="text" placeholder="Seu nome"
                      value={form.nome}
                      onChange={(e) => setField('nome', e.target.value)}
                      className={errors.nome ? styles.inputError : ''}
                    />
                    {errors.nome && <span className={styles.fieldError}>{errors.nome}</span>}
                  </div>
                  <div className={styles.group}>
                    <label htmlFor="email">E-mail *</label>
                    <input
                      id="email" type="email" placeholder="seu@email.com"
                      value={form.email}
                      onChange={(e) => setField('email', e.target.value)}
                      className={errors.email ? styles.inputError : ''}
                    />
                    {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.group}>
                    <label htmlFor="telefone">Telefone *</label>
                    <input
                      id="telefone" type="tel" placeholder="(11) 99999-9999"
                      value={form.telefone}
                      onChange={(e) => handlePhoneInput(e.target.value)}
                      className={errors.telefone ? styles.inputError : ''}
                    />
                    {errors.telefone && <span className={styles.fieldError}>{errors.telefone}</span>}
                  </div>
                  <div className={styles.group}>
                    <label htmlFor="cidade">Cidade *</label>
                    <input
                      id="cidade" type="text" placeholder="Sua cidade"
                      value={form.cidade}
                      onChange={(e) => setField('cidade', e.target.value)}
                      className={errors.cidade ? styles.inputError : ''}
                    />
                    {errors.cidade && <span className={styles.fieldError}>{errors.cidade}</span>}
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.group}>
                    <label htmlFor="interesse">Interesse *</label>
                    <select
                      id="interesse"
                      value={form.interesse}
                      onChange={(e) => setField('interesse', e.target.value)}
                      className={errors.interesse ? styles.inputError : ''}
                    >
                      <option value="">Selecione seu interesse</option>
                      <option value="Comprar veículo">Comprar veículo</option>
                      <option value="Manutenção">Manutenção</option>
                      <option value="Troca">Troca</option>
                      <option value="Tecnologia Ford One">Tecnologia Ford One</option>
                    </select>
                    {errors.interesse && <span className={styles.fieldError}>{errors.interesse}</span>}
                  </div>
                  <div className={styles.group}>
                    <label htmlFor="veiculo">Veículo de interesse *</label>
                    <input
                      id="veiculo" type="text" placeholder="Ex.: Ford Bronco Sport"
                      value={form.veiculo}
                      onChange={(e) => setField('veiculo', e.target.value)}
                      className={errors.veiculo ? styles.inputError : ''}
                    />
                    {errors.veiculo && <span className={styles.fieldError}>{errors.veiculo}</span>}
                  </div>
                </div>

                <div className={`${styles.group} ${styles.full}`}>
                  <label htmlFor="mensagem">Mensagem</label>
                  <textarea
                    id="mensagem" rows={4} placeholder="Deixe sua mensagem..."
                    value={form.mensagem}
                    onChange={(e) => setField('mensagem', e.target.value)}
                  />
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  <span>{loading ? 'Enviando...' : 'Enviar mensagem'}</span>
                  <i className="fa-solid fa-arrow-right" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
