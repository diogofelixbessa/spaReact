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
        adapters = { LoginModel.class, ComponentExporter.class },
        resourceType = LoginModel.RESOURCE_TYPE,
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
@Exporter(
        name = ExporterConstants.SLING_MODEL_EXPORTER_NAME,
        extensions = ExporterConstants.SLING_MODEL_EXTENSION
)
public class LoginModel implements ComponentExporter {

    public static final String RESOURCE_TYPE = "spaReact/components/login";

    @ValueMapValue
    @Default(values = "Acesse sua conta")
    private String title;

    @ValueMapValue
    @Default(values = "Informe seu usuário e senha para continuar")
    private String subtitle;

    @ValueMapValue
    @Default(values = "Usuário ou E-mail")
    private String usernameLabel;

    @ValueMapValue
    @Default(values = "Digite seu usuário ou e-mail")
    private String usernamePlaceholder;

    @ValueMapValue
    @Default(values = "Senha")
    private String passwordLabel;

    @ValueMapValue
    @Default(values = "Digite sua senha")
    private String passwordPlaceholder;

    @ValueMapValue
    @Default(values = "Lembrar de mim")
    private String rememberMeText;

    @ValueMapValue
    @Default(values = "Esqueceu sua senha?")
    private String forgotPasswordText;

    @ValueMapValue
    @Default(values = "#")
    private String forgotPasswordUrl;

    @ValueMapValue
    @Default(values = "Entrar")
    private String submitButtonText;

    @ValueMapValue
    @Default(values = "Não tem uma conta? Cadastre-se")
    private String registerText;

    @ValueMapValue
    @Default(values = "#")
    private String registerUrl;

    @JsonProperty("title")
    public String getTitle() {
        return title;
    }

    @JsonProperty("subtitle")
    public String getSubtitle() {
        return subtitle;
    }

    @JsonProperty("usernameLabel")
    public String getUsernameLabel() {
        return usernameLabel;
    }

    @JsonProperty("usernamePlaceholder")
    public String getUsernamePlaceholder() {
        return usernamePlaceholder;
    }

    @JsonProperty("passwordLabel")
    public String getPasswordLabel() {
        return passwordLabel;
    }

    @JsonProperty("passwordPlaceholder")
    public String getPasswordPlaceholder() {
        return passwordPlaceholder;
    }

    @JsonProperty("rememberMeText")
    public String getRememberMeText() {
        return rememberMeText;
    }

    @JsonProperty("forgotPasswordText")
    public String getForgotPasswordText() {
        return forgotPasswordText;
    }

    @JsonProperty("forgotPasswordUrl")
    public String getForgotPasswordUrl() {
        return forgotPasswordUrl;
    }

    @JsonProperty("submitButtonText")
    public String getSubmitButtonText() {
        return submitButtonText;
    }

    @JsonProperty("registerText")
    public String getRegisterText() {
        return registerText;
    }

    @JsonProperty("registerUrl")
    public String getRegisterUrl() {
        return registerUrl;
    }

    @Override
    public String getExportedType() {
        return RESOURCE_TYPE;
    }
}
