package com.diogo.core.models;

import com.adobe.cq.export.json.ComponentExporter;
import com.adobe.cq.export.json.ExporterConstants;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.http.HttpEntity;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Exporter;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

import javax.annotation.PostConstruct;

@Model(adaptables = SlingHttpServletRequest.class, adapters = { ExternalApiModel.class,
        ComponentExporter.class }, resourceType = ExternalApiModel.RESOURCE_TYPE, defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
@Exporter(name = ExporterConstants.SLING_MODEL_EXPORTER_NAME, extensions = ExporterConstants.SLING_MODEL_EXTENSION)
public class ExternalApiModel implements ComponentExporter {

    public static final String RESOURCE_TYPE = "spaReact/components/externalapi";

    @ValueMapValue(name = "postId")
    private String postId;

    @JsonProperty("post")
    private PostDto post;

    @JsonProperty("error")
    private String error;

    @PostConstruct
    protected void init() {
        String idToFetch = (postId != null && !postId.trim().isEmpty()) ? postId.trim() : "1";
        String targetUrl = "https://jsonplaceholder.typicode.com/posts/" + idToFetch;

        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectTimeout(5000)
                .setSocketTimeout(5000)
                .build();

        try (CloseableHttpClient httpClient = HttpClients.custom().setDefaultRequestConfig(requestConfig).build()) {
            HttpGet request = new HttpGet(targetUrl);
            request.setHeader("Accept", "application/json");

            try (CloseableHttpResponse response = httpClient.execute(request)) {
                int statusCode = response.getStatusLine().getStatusCode();
                if (statusCode == 200) {
                    HttpEntity entity = response.getEntity();
                    if (entity != null) {
                        String jsonResponse = EntityUtils.toString(entity);
                        ObjectMapper mapper = new ObjectMapper();
                        this.post = mapper.readValue(jsonResponse, PostDto.class);
                    }
                } else {
                    this.error = "Erro na chamada da API: Código HTTP " + statusCode;
                }
            }
        } catch (Exception e) {
            this.error = "Falha de comunicação: " + e.getMessage();
        }
    }

    public PostDto getPost() {
        return post;
    }

    public String getError() {
        return error;
    }

    @Override
    public String getExportedType() {
        return RESOURCE_TYPE;
    }
}