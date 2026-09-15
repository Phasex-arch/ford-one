import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useConcessionariaLogin } from './hooks/useConcessionariaLogin';
import { useAnimatedRingsBackground } from './hooks/useAnimatedLoginBackground';
import { ROUTES } from '../../shared/constants/routes';
import styles from './styles/concessionaria-login.module.scss';

// As 3 contas de exemplo criadas pelo seed (prisma/seed.ts) — mesma senha em
// todo ambiente pra ADMIN varia por ADMIN_SENHA; aqui é o valor de produção.
const DEMO_ACCOUNTS = [
  { tab: 'Admin', email: 'admin@ford.com.br', senha: '3htHjrs8CpFo8ZfKpvr1JNsM' },
  { tab: 'Gerente', email: 'ricardo.costa@ford.com.br', senha: 'GerenteFord@2026' },
  { tab: 'Funcionário', email: 'patricia.oliveira@ford.com.br', senha: 'FuncFord@2026' },
] as const;

/**
 * Tela de login da concessionária — corresponde ao concessionaria.html original.
 */
export function ConcessionariaLoginScreen() {
  useAnimatedRingsBackground('bg');
  const [demoTab, setDemoTab] = useState(0);

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

          {/* Email */}
          <div className={styles.formGroup}>
            <label htmlFor="username">Email</label>
            <div className={styles.inputWrap}>
              <i className="fa-solid fa-user" />
              <input
                id="username" type="email"
                placeholder="Digite seu email"
                autoComplete="email"
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

          {/* Credenciais visíveis — em dev sempre aparece (agiliza teste
              manual); em produção só se VITE_SHOW_DEMO_CREDENTIALS=true
              estiver setado no build (ligar só durante a janela de
              demonstração e desligar depois — nunca deixar permanente numa
              página pública). import.meta.env.DEV vira `false` estaticamente
              no build de produção e o bloco morto é removido pelo Vite. */}
          {(import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_CREDENTIALS === 'true') && (
            <div className={styles.credentialsHint}>
              <div className={styles.credentialsTitle}>
                <i className="fa-solid fa-key" />
                Credenciais de acesso (demo)
              </div>

              <div className={styles.credentialsTabs}>
                {DEMO_ACCOUNTS.map((acc, i) => (
                  <button
                    key={acc.tab}
                    type="button"
                    className={`${styles.credentialsTab} ${i === demoTab ? styles.active : ''}`}
                    onClick={() => setDemoTab(i)}
                  >
                    {acc.tab}
                  </button>
                ))}
              </div>

              {[
                { label: 'Usuário', value: DEMO_ACCOUNTS[demoTab].email, fill: () => { clearErrors(); setUsername(DEMO_ACCOUNTS[demoTab].email); } },
                { label: 'Senha',   value: DEMO_ACCOUNTS[demoTab].senha, fill: () => { clearErrors(); setPassword(DEMO_ACCOUNTS[demoTab].senha); } },
              ].map(({ label, value, fill }) => (
                <div key={label} className={styles.credentialsRow}>
                  <span className={styles.credentialsLabel}>{label}</span>
                  <span
                    className={styles.credentialsValue}
                    title="Clique para preencher"
                    onClick={fill}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
