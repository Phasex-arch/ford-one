import { Link } from 'react-router-dom';
import { useConcessionariaLogin } from './hooks/useConcessionariaLogin';
import { useAnimatedRingsBackground } from './hooks/useAnimatedLoginBackground';
import { ROUTES } from '../../shared/constants/routes';
import styles from './styles/concessionaria-login.module.scss';

/**
 * Tela de login da concessionária — corresponde ao concessionaria.html original.
 */
export function ConcessionariaLoginScreen() {
  useAnimatedRingsBackground('bg');

  const {
    username, setUsername,
    password, setPassword,
    showPass, setShowPass,
    state, handleLogin, handleKeyDown, clearErrors,
  } = useConcessionariaLogin();

  return (
    <div className={styles.page}>
      <canvas id="bg" className={styles.canvas} />

      <header className={styles.header}>
        <Link to={ROUTES.HOME} className={styles.logo}>
          <img src="assets/images/logo/logo-ford.png" alt="Ford" className={styles.logoImg} />
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

      <div className={styles.loginWrap}>
        <div className={styles.loginHeader}>
          <div className={styles.loginTag}>
            <span className={styles.tagDot} />
            Acesso Restrito
          </div>
          <h1 className={styles.loginTitle}>Portal da Concessionária</h1>
          <p className={styles.loginSub}>Insira suas credenciais para continuar.</p>
        </div>

        <div className={styles.loginCard}>
          {state.error && (
            <div className={styles.errorMsg}>
              <i className="fa-solid fa-circle-exclamation" />
              <span>Usuário ou senha incorretos.</span>
            </div>
          )}

          {/* Usuário */}
          <div className={styles.formGroup}>
            <label htmlFor="username">Usuário</label>
            <div className={styles.inputWrap}>
              <i className="fa-solid fa-user" />
              <input
                id="username" type="text"
                placeholder="Digite seu usuário"
                autoComplete="username"
                value={username}
                onChange={(e) => { clearErrors(); setUsername(e.target.value); }}
                onKeyDown={handleKeyDown}
                className={state.usernameError ? styles.inputError : ''}
              />
            </div>
          </div>

          {/* Senha */}
          <div className={styles.formGroup}>
            <label htmlFor="password">Senha</label>
            <div className={styles.inputWrap}>
              <i className="fa-solid fa-lock" />
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                value={password}
                onChange={(e) => { clearErrors(); setPassword(e.target.value); }}
                onKeyDown={handleKeyDown}
                className={state.passwordError ? styles.inputError : ''}
                style={{ paddingRight: '50px' }}
              />
              <button
                type="button"
                className={styles.togglePass}
                onClick={() => setShowPass((v) => !v)}
                aria-label="Mostrar senha"
              >
                <i className={showPass ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'} />
              </button>
            </div>
          </div>

          <button
            className={`${styles.btnLogin} ${state.loading ? styles.loading : ''}`}
            onClick={handleLogin}
            disabled={state.loading}
          >
            {state.loading ? (
              <div className={styles.spinner} />
            ) : (
              <span>Entrar <i className="fa-solid fa-arrow-right" /></span>
            )}
          </button>

          <p className={styles.footerNote}>
            <i className="fa-solid fa-shield-halved" />
            Acesso seguro — Ford Smart Ecosystem
          </p>

          {/* Credenciais visíveis */}
          <div className={styles.credentialsHint}>
            <div className={styles.credentialsTitle}>
              <i className="fa-solid fa-key" />
              Credenciais de acesso
            </div>
            {[
              { label: 'Usuário', value: 'Ford-PhaseX' },
              { label: 'Senha',   value: 'Ford' },
            ].map(({ label, value }) => (
              <div key={label} className={styles.credentialsRow}>
                <span className={styles.credentialsLabel}>{label}</span>
                <span
                  className={styles.credentialsValue}
                  title="Clique para copiar"
                  onClick={() => navigator.clipboard.writeText(value)}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
