// Endpoint dos Servlets Java no AEM
const AUTH_LOGIN_ENDPOINT = '/bin/spaReact/login';
const USER_PROFILE_ENDPOINT = '/bin/spaReact/user-profile';

export const authService = {
  /**
   * Realiza login enviando as credenciais para o Servlet Java do AEM (/bin/spaReact/login)
   */
  async login(username, password) {
    try {
      const response = await fetch(AUTH_LOGIN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || 'Credenciais inválidas. Verifique seu usuário e senha.';
        throw new Error(errorMessage);
      }

      // Persiste os dados do usuário autenticado no localStorage
      if (data.accessToken) {
        localStorage.setItem('auth_user', JSON.stringify(data));
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Falha ao conectar com o servidor AEM (Servlet Java). Verifique se o AEM está em execução.');
      }
      throw error;
    }
  },

  /**
   * Consulta os dados protegidos do usuário via Servlet Java do AEM (/bin/spaReact/user-profile)
   */
  async getProtectedUserData() {
    const token = this.getToken();
    if (!token) {
      throw new Error('Usuário não autenticado.');
    }

    const response = await fetch(USER_PROFILE_ENDPOINT, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Erro na requisição protegida: Status ${response.status}`);
    }

    return data;
  },

  /**
   * Realiza logout removendo os dados salvos
   */
  logout() {
    localStorage.removeItem('auth_user');
  },

  /**
   * Retorna os dados do usuário salvos no navegador
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('auth_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Retorna o token JWT do usuário
   */
  getToken() {
    const user = this.getCurrentUser();
    return user ? user.accessToken : null;
  },

  /**
   * Retorna se o usuário está logado
   */
  isAuthenticated() {
    return !!this.getToken();
  }
};
