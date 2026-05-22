/**
 * @file login.screen.tsx
 * @module auth
 * @description Tela de login da aplicacao Ford One.
 *
 * Renderizada pelo AppShell quando nao ha sessao ativa. Envia POST /auth/login
 * via AuthContext e, em sucesso, o proprio AppShell re-renderiza no AppLayout.
 */

import React, { useState } from 'react';
import { useAuth } from '../../shared/auth/AuthContext';

export const LoginScreen: React.FC = () => {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !senha) {
      setLocalError('Informe email e senha.');
      return;
    }
    try {
      await login(email.trim(), senha);
    } catch {
      /* erro ja capturado no contexto */
    }
  };

  const errMessage = localError ?? error;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at 20% 20%, rgba(23,0,244,0.18), transparent 55%), radial-gradient(circle at 80% 80%, rgba(0,9,91,0.35), transparent 60%), #050a36',
        padding: 24,
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--c-card, #fff)',
          color: 'var(--c-text, #0a1228)',
          borderRadius: 18,
          padding: '32px 30px',
          boxShadow:
            '0 30px 80px rgba(0, 9, 91, 0.45), 0 6px 20px rgba(0, 0, 0, 0.18)',
          border: '1px solid var(--c-border, rgba(0,0,0,0.06))',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--ford-vivid, #1700f4)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 20,
              letterSpacing: 1,
            }}
          >
            F1
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.1 }}>
              Ford One
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--c-mid, #5b6b8a)',
                marginTop: 2,
              }}
            >
              Portal da Concessionaria
            </div>
          </div>
        </div>

        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            margin: 0,
            marginBottom: 4,
          }}
        >
          Entrar
        </h1>
        <p
          style={{
            fontSize: 13,
            color: 'var(--c-mid, #5b6b8a)',
            margin: 0,
            marginBottom: 22,
          }}
        >
          Use suas credenciais corporativas para acessar o sistema.
        </p>

        <label style={{ display: 'block', marginBottom: 14 }}>
          <span
            style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              color: 'var(--c-mid, #5b6b8a)',
              marginBottom: 6,
            }}
          >
            E-mail
          </span>
          <input
            type="email"
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@ford.com.br"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '11px 13px',
              border: '1px solid var(--c-border, #d4dbeb)',
              borderRadius: 10,
              fontSize: 14,
              background: 'var(--c-input, #fff)',
              color: 'var(--c-text, #0a1228)',
            }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: 18 }}>
          <span
            style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              color: 'var(--c-mid, #5b6b8a)',
              marginBottom: 6,
            }}
          >
            Senha
          </span>
          <div style={{ position: 'relative' }}>
            <input
              type={showPwd ? 'text' : 'password'}
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="********"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '11px 42px 11px 13px',
                border: '1px solid var(--c-border, #d4dbeb)',
                borderRadius: 10,
                fontSize: 14,
                background: 'var(--c-input, #fff)',
                color: 'var(--c-text, #0a1228)',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPwd((p) => !p)}
              aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--c-mid, #5b6b8a)',
                padding: 6,
                lineHeight: 0,
              }}
            >
              <i className={`ph-bold ${showPwd ? 'ph-eye-slash' : 'ph-eye'}`} />
            </button>
          </div>
        </label>

        {errMessage && (
          <div
            role="alert"
            style={{
              background: 'rgba(220, 38, 38, 0.08)',
              color: '#b91c1c',
              border: '1px solid rgba(220, 38, 38, 0.25)',
              borderRadius: 10,
              padding: '10px 12px',
              fontSize: 13,
              marginBottom: 14,
            }}
          >
            {errMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-prim"
          style={{
            width: '100%',
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: 15,
            fontWeight: 600,
            opacity: loading ? 0.75 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <>
              <span
                style={{
                  display: 'inline-block',
                  width: 14,
                  height: 14,
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'fordSpin 0.7s linear infinite',
                }}
              />
              Entrando...
            </>
          ) : (
            <>
              <i className="ph-bold ph-sign-in" /> Entrar
            </>
          )}
        </button>

        <div
          style={{
            marginTop: 18,
            fontSize: 12,
            color: 'var(--c-mid, #5b6b8a)',
            textAlign: 'center',
          }}
        >
          Acesso restrito a colaboradores autorizados.
        </div>

        <style>{`@keyframes fordSpin { to { transform: rotate(360deg); } }`}</style>
      </form>
    </div>
  );
};
