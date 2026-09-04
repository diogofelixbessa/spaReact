import React, { useState, useEffect } from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
import { authService } from '../../services/authService';
import './SimpleLogin.css';

export const SimpleLoginEditConfig = {
  emptyLabel: 'Simple Login Component',
  isEmpty: function (props) {
    return !props || !props.usernameLabel;
  }
};

export const SimpleLogin = (props) => {
  const {
    usernameLabel = 'Usuário',
    passwordLabel = 'Senha',
    submitButtonText = 'Entrar'
  } = props;

  const title = 'Entrar';
  const subtitle = 'Digite suas credenciais para acessar o sistema';

  const [username, setUsername] = useState('diogoadmin');
  const [password, setPassword] = useState('senha123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [protectedData, setProtectedData] = useState(null);

  useEffect(() => {
    // Carrega usuário existente se já estiver logado
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);
    setProtectedData(null);

    try {
      const data = await authService.login(username, password);
      setCurrentUser(data);
      setStatusMessage({
        type: 'success',
        text: `Autenticado com sucesso! Bem-vindo, ${data.username}.`
      });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: error.message || 'Erro ao realizar login. Verifique suas credenciais.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestProtectedEndpoint = () => {
    // Redireciona para a página dados-cliente criada no AEM preservando o modo editor se estiver presente
    const isEditor = window.location.pathname.includes('/editor.html');
    const targetUrl = isEditor
      ? '/editor.html/content/spaReact/us/en/dados-cliente.html'
      : '/content/spaReact/us/en/dados-cliente.html';
    window.location.href = targetUrl;
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setProtectedData(null);
    setUsername('');
    setPassword('');
    setStatusMessage({
      type: 'info',
      text: 'Você saiu da sua conta.'
    });
  };

  return (
    <div className="simple-login-container">
      <div className="simple-login-card">
        <div className="simple-login-header">
          <h2 className="simple-login-title">{title}</h2>
          <p className="simple-login-subtitle">{subtitle}</p>
        </div>

        {statusMessage && (
          <div className={`simple-login-alert ${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        )}

        {currentUser ? (
          /* Visualização de Usuário Autenticado */
          <div className="simple-login-user-profile">
            <div className="simple-login-user-info">
              <p><strong>Usuário:</strong> {currentUser.username}</p>
              <p><strong>E-mail:</strong> {currentUser.email}</p>
              <p>
                <strong>Perfis (Roles):</strong>{' '}
                <span className="simple-login-badge">
                  {currentUser.roles ? currentUser.roles.join(', ') : 'N/A'}
                </span>
              </p>
            </div>

            <div className="simple-login-actions">
              <button
                type="button"
                className="simple-login-btn-secondary"
                onClick={handleTestProtectedEndpoint}
              >
                🔒 Testar Rota Protegida (Ir para Dados do Cliente) ➔
              </button>
              <button
                type="button"
                className="simple-login-btn-logout"
                onClick={handleLogout}
              >
                Sair
              </button>
            </div>
          </div>
        ) : (
          /* Formulário de Login */
          <form className="simple-login-form" onSubmit={handleSubmit}>
            {/* Campo Usuário */}
            <div className="simple-login-field">
              <label className="simple-login-label" htmlFor="simple-login-user">
                {usernameLabel}
              </label>
              <div className="simple-login-input-wrap">
                <input
                  id="simple-login-user"
                  type="text"
                  className="simple-login-input"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="simple-login-field">
              <label className="simple-login-label" htmlFor="simple-login-pass">
                {passwordLabel}
              </label>
              <div className="simple-login-input-wrap">
                <input
                  id="simple-login-pass"
                  type={showPassword ? 'text' : 'password'}
                  className="simple-login-input has-toggle"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="simple-login-toggle-pass"
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

            {/* Botão Entrar */}
            <button
              type="submit"
              className="simple-login-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="simple-login-spinner" />
              ) : (
                submitButtonText
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default MapTo('spaReact/components/simplelogin')(SimpleLogin, SimpleLoginEditConfig);
