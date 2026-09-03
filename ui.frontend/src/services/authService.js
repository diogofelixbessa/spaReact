const API_BASE_URL = 'https://spring-boot-jwt-auth-production.up.railway.app/api';

export const authService = {
  /**
   * Realiza login enviando username e password para o endpoint /api/auth/signin
   */
  async login(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
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
        throw new Error('Falha ao conectar com o servidor de autenticação. Verifique sua conexão com a internet.');
      }
      throw error;
    }
  },

  /**
   * Consulta os dados protegidos do usuário via /api/test/user usando o Bearer Token
   */
  async getProtectedUserData() {
    const token = this.getToken();
    if (!token) {
      throw new Error('Usuário não autenticado.');
    }

    const response = await fetch(`${API_BASE_URL}/test/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição protegida: Status ${response.status}`);
    }

    return await response.json();
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
