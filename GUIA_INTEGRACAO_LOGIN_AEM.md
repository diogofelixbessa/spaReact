# 📘 Guia Completo: Autenticação JWT no AEM SPA React do Zero

Este guia foi criado para ensinar passo a passo como funciona e como implementar do zero a integração de autenticação entre uma **SPA React no AEM**, a **camada de Servlets Java do AEM (BFF)** e uma **API externa Spring Boot com JWT**.

---

## 🗺️ 1. Visão Geral da Arquitetura

O fluxo completo funciona em 5 etapas principais:

```
[ Usuário no Navegador ]
         │ (1) Digita usuário/senha e clica em "Entrar"
         ▼
[ React Component (SimpleLogin.js) ]
         │ (2) Envia POST com JSON para /bin/spaReact/login
         ▼
[ AEM Java Servlet (LoginServlet.java) ]
         │ (3) Envia POST seguro Server-to-Server para a API Spring Boot
         ▼
[ API Spring Boot Externa (Railway) ]
         │ (4) Valida credenciais no banco e retorna Token JWT { accessToken: "eyJ..." }
         ▼
[ AEM Java Servlet (LoginServlet.java) ]
         │ Repassa a resposta e o Token
         ▼
[ React Service (authService.js) ]
         │ (5) Salva no localStorage e atualiza estado da tela
         ▼
[ Acesso a Rotas Protegidas ]
         │ Envia "Authorization: Bearer <token>" para consultar perfil / dados restritos
```

---

## 🧱 2. Entendendo os 3 Pilares

| Camada | Tecnologia | Papel no Projeto |
| :--- | :--- | :--- |
| **Frontend** | React SPA (`ui.frontend`) | Captura entradas do usuário, exibe mensagens visuais, gerencia o token no `localStorage` e renderiza os dados protegidos. |
| **BFF / Proxy** | AEM Java OSGi (`core`) | Intermediário seguro no AEM. Recebe as chamadas do React e faz as requisições HTTP seguras para a API externa. |
| **API Externa** | Spring Boot + JWT | Backend corporativo com banco de dados PostgreSQL. Valida a senha (BCrypt) e gera o token de autenticação JWT. |

---

## 🛠️ 3. Passo a Passo da Implementação do Zero

---

### 🔹 PASSO 1: Criar o Servlet de Login no Java AEM (`core`)

Crie a classe `LoginServlet.java` no módulo `core/src/main/java/com/diogo/core/servlets/LoginServlet.java`.

#### Responsabilidade:
Receber o `POST` do React em `/bin/spaReact/login`, extrair o JSON e disparar uma chamada HTTP usando `CloseableHttpClient` para a API Spring Boot.

```java
package com.diogo.core.servlets;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.http.HttpEntity;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.servlets.HttpConstants;
import org.apache.sling.api.servlets.SlingAllMethodsServlet;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.propertytypes.ServiceDescription;

import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;

@Component(
    service = { Servlet.class },
    property = {
        "sling.servlet.paths=/bin/spaReact/login",
        "sling.servlet.methods=" + HttpConstants.METHOD_POST
    }
)
@ServiceDescription("SPA React - Java Authentication Servlet")
public class LoginServlet extends SlingAllMethodsServlet {

    private static final String API_AUTH_URL = "https://spring-boot-jwt-auth-production.up.railway.app/api/auth/signin";
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doPost(final SlingHttpServletRequest request, final SlingHttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // 1. Lê o corpo JSON da requisição do React
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }

        JsonNode jsonNode = objectMapper.readTree(sb.toString());
        String username = jsonNode.get("username").asText();
        String password = jsonNode.get("password").asText();

        // 2. Valida se os campos foram preenchidos
        if (username == null || password == null || username.trim().isEmpty() || password.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"message\": \"Usuário e senha são obrigatórios.\"}");
            return;
        }

        // 3. Monta e executa a requisição HTTP em Java para a API Spring Boot
        RequestConfig config = RequestConfig.custom().setConnectTimeout(5000).setSocketTimeout(5000).build();
        try (CloseableHttpClient httpClient = HttpClients.custom().setDefaultRequestConfig(config).build()) {
            HttpPost httpPost = new HttpPost(API_AUTH_URL);
            httpPost.setHeader("Accept", "application/json");

            ObjectNode payload = objectMapper.createObjectNode();
            payload.put("username", username.trim());
            payload.put("password", password);
            httpPost.setEntity(new StringEntity(objectMapper.writeValueAsString(payload), ContentType.APPLICATION_JSON));

            try (CloseableHttpResponse apiResponse = httpClient.execute(httpPost)) {
                int statusCode = apiResponse.getStatusLine().getStatusCode();
                response.setStatus(statusCode);

                HttpEntity responseEntity = apiResponse.getEntity();
                String responseBody = responseEntity != null ? EntityUtils.toString(responseEntity, "UTF-8") : "{}";
                
                // 4. Devolve o token/resposta da API de volta para o React
                response.getWriter().write(responseBody);
            }
        }
    }
}
```

---

### 🔹 PASSO 2: Liberar a Rota nos Filtros de Segurança do AEM (`ui.config`)

O AEM bloqueia requisições `POST` anônimas por padrão. Criamos 3 arquivos JSON na pasta `ui.config/src/main/content/jcr_root/apps/spaReact/osgiconfig/config/`:

1. **`com.adobe.granite.csrf.impl.CSRFFilter.cfg.json`**:
   ```json
   {
     "filter.excluded.paths": [
       "/bin/spaReact/login",
       "/bin/spaReact/user-profile"
     ]
   }
   ```
   *Dispensa o token CSRF interno do AEM para quem ainda não está logado.*

2. **`org.apache.sling.engine.impl.auth.SlingAuthenticator.cfg.json`**:
   ```json
   {
     "sling.auth.requirements": [
       "-/bin/spaReact"
     ]
   }
   ```
   *Declara `/bin/spaReact` como rota pública (anônima) com o prefixo `-`.*

3. **`org.apache.sling.security.impl.ReferrerFilter.cfg.json`**:
   ```json
   {
     "allow.empty": true,
     "filter.methods": ["POST", "PUT", "DELETE"],
     "allow.hosts": ["localhost:4502", "localhost:3000"],
     "filter.excluded.paths": [
       "/bin/spaReact/login",
       "/bin/spaReact/user-profile"
     ]
   }
   ```
   *Autoriza chamadas de origem confiáveis:*
   * `localhost:4502`: Permite chamadas quando o React roda compilado dentro do AEM.
   * `localhost:3000`: Permite chamadas quando o desenvolvedor roda o React em modo desenvolvimento (`npm start`).

---

### 🔹 PASSO 3: Criar o Serviço de Autenticação no React (`authService.js`)

Crie o arquivo em `ui.frontend/src/services/authService.js`.

#### Responsabilidade:
Centralizar as chamadas HTTP do Frontend, salvar o token no `localStorage` e fornecer métodos utilitários (`getToken`, `logout`, `getCurrentUser`).

```javascript
const AUTH_LOGIN_ENDPOINT = '/bin/spaReact/login';
const USER_PROFILE_ENDPOINT = '/bin/spaReact/user-profile';

export const authService = {
  // 1. Envia credenciais para o Servlet Java do AEM
  async login(username, password) {
    const response = await fetch(AUTH_LOGIN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Credenciais inválidas.');
    }

    // 2. Persiste os dados e o JWT no localStorage do navegador
    if (data.accessToken) {
      localStorage.setItem('auth_user', JSON.stringify(data));
    }

    return data;
  },

  // 3. Consulta dados protegidos enviando o Bearer Token
  async getProtectedUserData() {
    const token = this.getToken();
    if (!token) throw new Error('Usuário não autenticado.');

    const response = await fetch(USER_PROFILE_ENDPOINT, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erro na requisição protegida.');
    return data;
  },

  // 4. Logout (limpa a sessão local)
  logout() {
    localStorage.removeItem('auth_user');
  },

  // 5. Retorna o usuário salvo
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('auth_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  // 6. Retorna o token JWT
  getToken() {
    const user = this.getCurrentUser();
    return user ? user.accessToken : null;
  }
};
```

---

### 🔹 PASSO 4: Criar o Componente React Visual (`SimpleLogin.js`)

Crie o arquivo em `ui.frontend/src/components/SimpleLogin/SimpleLogin.js`.

#### Responsabilidade:
Gerenciar a interface, capturar o submit do formulário, exibir mensagens de sucesso/erro e alternar a tela quando logado.

```jsx
import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import './SimpleLogin.css';

export const SimpleLogin = (props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [protectedData, setProtectedData] = useState(null);

  // Ao abrir a página, verifica se o usuário já estava logado
  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) setCurrentUser(savedUser);
  }, []);

  // Handler de envio do formulário de login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const user = await authService.login(username, password);
      setCurrentUser(user);
      setStatusMessage({ type: 'success', text: `Bem-vindo, ${user.username}!` });
    } catch (error) {
      setStatusMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para testar rota protegida
  const handleFetchProtected = async () => {
    try {
      const data = await authService.getProtectedUserData();
      setProtectedData(data);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  // Handler de Logout
  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setProtectedData(null);
    setUsername('');
    setPassword('');
  };

  // ── SE O USUÁRIO JÁ ESTIVER LOGADO ────────────────────────
  if (currentUser) {
    return (
      <div className="login-container authenticated">
        <h2>🎉 Usuário Autenticado</h2>
        <p><strong>Usuário:</strong> {currentUser.username}</p>
        <p><strong>Email:</strong> {currentUser.email}</p>
        <p><strong>Perfis (Roles):</strong> {currentUser.roles?.join(', ')}</p>

        <button onClick={handleFetchProtected} className="btn-secondary">
          🔒 Testar Rota Protegida com Bearer Token
        </button>

        {protectedData && (
          <div className="protected-box">
            <h4>Dados Retornados da API Protegida:</h4>
            <pre>{JSON.stringify(protectedData, null, 2)}</pre>
          </div>
        )}

        <button onClick={handleLogout} className="btn-logout">Sair (Logout)</button>
      </div>
    );
  }

  // ── SE NÃO ESTIVER LOGADO (EXIBE FORMULÁRIO) ──────────────
  return (
    <div className="login-container">
      <h2>{props.title || 'Acessar Conta'}</h2>

      {statusMessage && (
        <div className={`alert alert-${statusMessage.type}`}>
          {statusMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Usuário:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Ex: diogoadmin"
          />
        </div>

        <div className="form-group">
          <label>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? 'Autenticando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};
```

---

## 🧪 4. Como Testar e Validar no Navegador

1. **Abra a página no AEM:** `http://localhost:4502/content/spaReact/us/en/home.html`.
2. **Abra o DevTools (`F12`):**
   * **Aba Network (Rede):** Ao clicar em "Entrar", você verá uma requisição `POST` para `/bin/spaReact/login` com status `200 OK`.
   * **Aba Application -> Local Storage:** Você verá o item `auth_user` gravado com o token JWT.
3. **Clique no botão "Testar Rota Protegida":**
   * **Aba Network (Rede):** selecione o filtro Fetch/XHR, Você verá a requisição user-profile aparecer na lista:
     * Headers (Cabeçalhos): Você verá o método GET, a URL /bin/spaReact/user-profile e o cabeçalho Authorization: Bearer eyJhbGci....
     * Response (Resposta): Você verá a resposta retornada pela API (ex: {"message": "User Content."}).
4. **Clique em "Logout":**
   * O `localStorage` será limpo e o formulário de login reaparecerá.

---

## 💡 5. Dicas de Ouro

* **Onde o token fica salvo?** No `localStorage` do navegador para persistir entre recarregamentos de página (`F5`), e no `useState` do React para atualizar a interface instantaneamente.
* **Por que o React não chama a API direto?** Porque passando pelo Java do AEM você pode esconder segredos da API, aplicar logs no servidor e transformar dados antes de entregar à tela.
* **O que fazer se der erro 403 Forbidden?** Verifique se os arquivos `.cfg.json` em `ui.config` foram compilados e instalados no AEM com `mvn clean install -PautoInstallSinglePackage`.
