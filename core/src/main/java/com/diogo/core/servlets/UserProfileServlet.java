package com.diogo.core.servlets;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.http.HttpEntity;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.servlets.HttpConstants;
import org.apache.sling.api.servlets.SlingSafeMethodsServlet;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.propertytypes.ServiceDescription;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Servlet Java no AEM para consulta segura de dados protegidos.
 * Repassa o Bearer Token para a API externa via Java.
 */
@Component(
        service = { Servlet.class },
        property = {
                "sling.servlet.paths=/bin/spaReact/user-profile",
                "sling.servlet.methods=" + HttpConstants.METHOD_GET
        }
)
@ServiceDescription("SPA React - Java User Profile Servlet")
public class UserProfileServlet extends SlingSafeMethodsServlet {

    private static final long serialVersionUID = 1L;
    private static final Logger LOG = LoggerFactory.getLogger(UserProfileServlet.class);
    private static final String API_USER_URL = "https://spring-boot-jwt-auth-production.up.railway.app/api/test/user";
    private static final int TIMEOUT_MS = 5000;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doGet(final SlingHttpServletRequest request, final SlingHttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || authHeader.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            ObjectNode errorJson = objectMapper.createObjectNode();
            errorJson.put("message", "Cabeçalho Authorization com Bearer Token é obrigatório.");
            response.getWriter().write(objectMapper.writeValueAsString(errorJson));
            return;
        }

        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectTimeout(TIMEOUT_MS)
                .setSocketTimeout(TIMEOUT_MS)
                .build();

        try (CloseableHttpClient httpClient = HttpClients.custom()
                .setDefaultRequestConfig(requestConfig)
                .build()) {

            HttpGet httpGet = new HttpGet(API_USER_URL);
            httpGet.setHeader("Accept", "application/json");
            httpGet.setHeader("Authorization", authHeader);

            try (CloseableHttpResponse apiResponse = httpClient.execute(httpGet)) {
                int statusCode = apiResponse.getStatusLine().getStatusCode();
                response.setStatus(statusCode);

                HttpEntity responseEntity = apiResponse.getEntity();
                String responseBody = responseEntity != null ? EntityUtils.toString(responseEntity, "UTF-8") : "{}";

                response.getWriter().write(responseBody);
            }

        } catch (Exception e) {
            LOG.error("Erro ao consultar perfil do usuário: {}", e.getMessage(), e);
            response.setStatus(HttpServletResponse.SC_BAD_GATEWAY);

            ObjectNode errorJson = objectMapper.createObjectNode();
            errorJson.put("message", "Falha ao obter dados protegidos: " + e.getMessage());
            response.getWriter().write(objectMapper.writeValueAsString(errorJson));
        }
    }
}
