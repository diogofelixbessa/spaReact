package com.diogo.core.models;

import com.adobe.cq.export.json.ComponentExporter;
import com.adobe.cq.export.json.ExporterConstants;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.models.annotations.Default;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Exporter;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(
        adaptables = SlingHttpServletRequest.class,
        adapters = { SimpleLoginModel.class, ComponentExporter.class },
        resourceType = SimpleLoginModel.RESOURCE_TYPE,
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
@Exporter(
        name = ExporterConstants.SLING_MODEL_EXPORTER_NAME,
        extensions = ExporterConstants.SLING_MODEL_EXTENSION
)
public class SimpleLoginModel implements ComponentExporter {

    public static final String RESOURCE_TYPE = "spaReact/components/simplelogin";

    @ValueMapValue
    @Default(values = "Usuário")
    private String usernameLabel;

    @ValueMapValue
    @Default(values = "Senha")
    private String passwordLabel;

    @ValueMapValue
    @Default(values = "Entrar")
    private String submitButtonText;

    @JsonProperty("usernameLabel")
    public String getUsernameLabel() {
        return usernameLabel;
    }

    @JsonProperty("passwordLabel")
    public String getPasswordLabel() {
        return passwordLabel;
    }

    @JsonProperty("submitButtonText")
    public String getSubmitButtonText() {
        return submitButtonText;
    }

    @Override
    public String getExportedType() {
        return RESOURCE_TYPE;
    }
}
