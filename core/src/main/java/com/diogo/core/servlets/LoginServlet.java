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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;

/**
 * Servlet Java no AEM para autenticação segura (BFF).
 * Recebe as credenciais da SPA e faz a chamada ao backend Spring Boot via Java.
 */
@Component(
        service = { Servlet.class },
        property = {
                "sling.servlet.paths=/bin/spaReact/login",
                "sling.servlet.methods=" + HttpConstants.METHOD_POST
        }
)
@ServiceDescription("SPA React - Java Authentication Servlet")
public class LoginServlet extends SlingAllMethodsServlet {

    private static final long serialVersionUID = 1L;
    private static final Logger LOG = LoggerFactory.getLogger(LoginServlet.class);
    private static final String API_AUTH_URL = "https://spring-boot-jwt-auth-production.up.railway.app/api/auth/signin";
    private static final int TIMEOUT_MS = 5000;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doPost(final SlingHttpServletRequest request, final SlingHttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String username = null;
        String password = null;

        // 1. Tenta extrair credenciais do Body JSON ou parâmetros de formulário
        try {
            StringBuilder sb = new StringBuilder();
            try (BufferedReader reader = request.getReader()) {
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
            }

            String requestBody = sb.toString().trim();
            if (!requestBody.isEmpty()) {
                JsonNode jsonNode = objectMapper.readTree(requestBody);
                if (jsonNode.has("username")) {
                    username = jsonNode.get("username").asText();
                }
                if (jsonNode.has("password")) {
                    password = jsonNode.get("password").asText();
                }
            }
        } catch (Exception e) {
            LOG.warn("Não foi possível ler o body como JSON, tentando parâmetros de requisição: {}", e.getMessage());
        }

        if (username == null || username.trim().isEmpty()) {
            username = request.getParameter("username");
        }
        if (password == null || password.trim().isEmpty()) {
            password = request.getParameter("password");
        }

        // 2. Validação básica de entrada
        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            ObjectNode errorJson = objectMapper.createObjectNode();
            errorJson.put("message", "Usuário e senha são obrigatórios.");
            response.getWriter().write(objectMapper.writeValueAsString(errorJson));
            return;
        }

        LOG.info("Iniciando autenticação Java para o usuário: {}", username);

        // 3. Chamada HTTP segura server-side em Java
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectTimeout(TIMEOUT_MS)
                .setSocketTimeout(TIMEOUT_MS)
                .build();

        try (CloseableHttpClient httpClient = HttpClients.custom()
                .setDefaultRequestConfig(requestConfig)
                .build()) {

            HttpPost httpPost = new HttpPost(API_AUTH_URL);
            httpPost.setHeader("Accept", "application/json");

            ObjectNode payload = objectMapper.createObjectNode();
            payload.put("username", username.trim());
            payload.put("password", password);

            StringEntity entity = new StringEntity(objectMapper.writeValueAsString(payload), ContentType.APPLICATION_JSON);
            httpPost.setEntity(entity);

            try (CloseableHttpResponse apiResponse = httpClient.execute(httpPost)) {
                int statusCode = apiResponse.getStatusLine().getStatusCode();
                response.setStatus(statusCode);

                HttpEntity responseEntity = apiResponse.getEntity();
                String responseBody = responseEntity != null ? EntityUtils.toString(responseEntity, "UTF-8") : "{}";

                LOG.info("Resposta da API de autenticação recebida com status code: {}", statusCode);
                response.getWriter().write(responseBody);
            }

        } catch (Exception e) {
            LOG.error("Erro ao comunicar com a API de autenticação: {}", e.getMessage(), e);
            response.setStatus(HttpServletResponse.SC_BAD_GATEWAY);

            ObjectNode errorJson = objectMapper.createObjectNode();
            errorJson.put("message", "Erro de comunicação com o servidor de autenticação: " + e.getMessage());
            response.getWriter().write(objectMapper.writeValueAsString(errorJson));
        }
    }
}
