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
        adapters = { DadosClienteModel.class, ComponentExporter.class },
        resourceType = DadosClienteModel.RESOURCE_TYPE,
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
@Exporter(
        name = ExporterConstants.SLING_MODEL_EXPORTER_NAME,
        extensions = ExporterConstants.SLING_MODEL_EXTENSION
)
public class DadosClienteModel implements ComponentExporter {

    public static final String RESOURCE_TYPE = "spaReact/components/dadoscliente";

    @ValueMapValue
    @Default(values = "Dados do Cliente (Rota Protegida)")
    private String title;

    @ValueMapValue
    @Default(values = "Informações recuperadas de forma segura via JWT Bearer Token.")
    private String description;

    @JsonProperty("title")
    public String getTitle() {
        return title;
    }

    @JsonProperty("description")
    public String getDescription() {
        return description;
    }

    @Override
    public String getExportedType() {
        return RESOURCE_TYPE;
    }
}
