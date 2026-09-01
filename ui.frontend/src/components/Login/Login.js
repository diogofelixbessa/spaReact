import React, { useState } from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
import './Login.css';

export const LoginEditConfig = {
  emptyLabel: 'Login Component',
  isEmpty: function(props) {
    return !props || !props.title;
  }
};

export const Login = (props) => {
  const {
    title = 'Acesse sua conta',
    subtitle = 'Informe seu usuário e senha para continuar',
    usernameLabel = 'Usuário ou E-mail',
    usernamePlaceholder = 'Digite seu usuário ou e-mail',
    passwordLabel = 'Senha',
    passwordPlaceholder = 'Digite sua senha',
    rememberMeText = 'Lembrar de mim',
    forgotPasswordText = 'Esqueceu sua senha?',
    forgotPasswordUrl = '#',
    submitButtonText = 'Entrar',
    registerText = 'Não tem uma conta? Cadastre-se',
    registerUrl = '#'
  } = props;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulação visual de envio / login
    setTimeout(() => {
      setIsLoading(false);
      alert(`Demonstração Visual: Dados submetidos para o usuário "${username}"`);
    }, 1200);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">{title}</h1>
          {subtitle && <p className="login-subtitle">{subtitle}</p>}
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {/* Campo de Usuário */}
          <div className="login-field-group">
            <label className="login-label" htmlFor="login-username">
              {usernameLabel}
            </label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                id="login-username"
                type="text"
                className="login-input"
                placeholder={usernamePlaceholder}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Campo de Senha */}
          <div className="login-field-group">
            <label className="login-label" htmlFor="login-password">
              {passwordLabel}
            </label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="login-input has-toggle"
                placeholder={passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="login-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Opções: Lembrar de mim e Esqueci a senha */}
          <div className="login-options-row">
            <label className="login-remember-me">
              <input
                type="checkbox"
                className="login-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <span>{rememberMeText}</span>
            </label>

            {forgotPasswordText && (
              <a href={forgotPasswordUrl} className="login-forgot-link">
                {forgotPasswordText}
              </a>
            )}
          </div>

          {/* Botão de Enviar */}
          <button type="submit" className="login-submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="login-spinner" />
                <span>Carregando...</span>
              </>
            ) : (
              submitButtonText
            )}
          </button>
        </form>

        {/* Rodapé: Link para Cadastro */}
        {registerText && (
          <div className="login-footer">
            <a href={registerUrl} className="login-register-link">
              {registerText}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapTo('spaReact/components/login')(Login, LoginEditConfig);
