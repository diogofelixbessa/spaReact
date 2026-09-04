import React, { useState, useEffect, useCallback } from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
import { authService } from '../../services/authService';
import './DadosCliente.css';

export const DadosClienteEditConfig = {
  emptyLabel: 'Dados do Cliente (Protected Profile)',
  isEmpty: function (props) {
    return false;
  }
};

export const DadosCliente = (props) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [protectedData, setProtectedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const getLoginUrl = () => {
    const isEditor = window.location.pathname.includes('/editor.html');
    return isEditor
      ? '/editor.html/content/spaReact/us/en/home.html'
      : '/content/spaReact/us/en/home.html';
  };

  const fetchProfileData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const user = authService.getCurrentUser();
    if (!user || !user.accessToken) {
      setCurrentUser(null);
      setIsLoading(false);
      return;
    }

    setCurrentUser(user);

    try {
      // Chama o Servlet Java do AEM (/bin/spaReact/user-profile)
      const data = await authService.getProtectedUserData();
      setProtectedData(data);
    } catch (error) {
      setErrorMessage(error.message || 'Erro ao carregar os dados protegidos do usuário.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleLogout = () => {
    authService.logout();
    window.location.href = getLoginUrl();
  };

  const handleBackToHome = () => {
    window.location.href = getLoginUrl();
  };

  // Se não estiver logado
  if (!isLoading && !currentUser) {
    return (
      <div className="dados-cliente-wrapper">
        <div className="dados-cliente-card dados-cliente-unauthorized">
          <div className="dados-cliente-unauthorized-icon">🔒</div>
          <h2>Acesso Restrito</h2>
          <p>Você precisa estar autenticado com um Token JWT válido para visualizar os dados do cliente.</p>
          <a href={getLoginUrl()} className="btn-client btn-client-primary">
            Ir para a Página de Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="dados-cliente-wrapper">
      <div className="dados-cliente-card">
        {/* Cabeçalho */}
        <div className="dados-cliente-header">
          <div className="dados-cliente-header-text">
            <h2>{props.title || 'Dados do Cliente'}</h2>
            <p>{props.description || 'Painel de dados do usuário autenticado no Spring Boot + JWT'}</p>
          </div>
          {currentUser && (
            <span className="badge-role" style={{ background: '#22c55e', color: '#ffffff', fontSize: '13px', padding: '6px 14px' }}>
              ✓ Sessão Ativa
            </span>
          )}
        </div>

        <div className="dados-cliente-body">
          {isLoading ? (
            <div className="dados-cliente-loading">
              <p>⏳ Carregando dados protegidos da API (/bin/spaReact/user-profile)...</p>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
                  {errorMessage}
                </div>
              )}

              {/* Grid com Dados do Usuário */}
              {currentUser && (
                <div className="dados-cliente-grid">
                  <div className="dados-cliente-info-box">
                    <span className="label">ID do Usuário</span>
                    <span className="value">#{currentUser.id || '1'}</span>
                  </div>

                  <div className="dados-cliente-info-box">
                    <span className="label">Nome de Usuário (Username)</span>
                    <span className="value">{currentUser.username}</span>
                  </div>

                  <div className="dados-cliente-info-box">
                    <span className="label">E-mail Cadastrado</span>
                    <span className="value">{currentUser.email || 'Não informado'}</span>
                  </div>

                  <div className="dados-cliente-info-box">
                    <span className="label">Perfis de Acesso (Roles)</span>
                    <div className="value">
                      {currentUser.roles && currentUser.roles.length > 0 ? (
                        currentUser.roles.map((role, idx) => (
                          <span key={idx} className="badge-role">{role}</span>
                        ))
                      ) : (
                        <span className="badge-role">ROLE_USER</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Seção da Resposta da Rota Protegida da API */}
              <div className="dados-cliente-api-section">
                <h3>
                  <span>Retorno da Rota Protegida</span>
                  <span className="dados-cliente-api-endpoint">GET /bin/spaReact/user-profile</span>
                </h3>

                {protectedData ? (
                  <pre className="dados-cliente-api-response">
                    {typeof protectedData === 'object' 
                      ? JSON.stringify(protectedData, null, 2) 
                      : String(protectedData)}
                  </pre>
                ) : (
                  <p style={{ color: '#64748b', margin: 0, fontSize: '13px' }}>
                    Nenhum dado retornado ou erro ao comunicar com a API externa.
                  </p>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="dados-cliente-actions">
                <button
                  type="button"
                  onClick={handleBackToHome}
                  className="btn-client btn-client-secondary"
                >
                  ← Voltar para Início
                </button>

                <button
                  type="button"
                  onClick={fetchProfileData}
                  className="btn-client btn-client-primary"
                >
                  🔄 Recarregar Dados da API
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-client btn-client-danger"
                >
                  🚪 Sair (Logout)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

MapTo('spaReact/components/dadoscliente')(DadosCliente, DadosClienteEditConfig);
export default DadosCliente;
