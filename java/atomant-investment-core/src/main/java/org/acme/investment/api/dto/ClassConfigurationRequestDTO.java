package org.acme.investment.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.acme.investment.api.validator.ValidClassConfiguration;
import org.acme.investment.domain.model.ClassStructureType;
import java.util.List;

@ValidClassConfiguration
public record ClassConfigurationRequestDTO(
    @NotNull(message = "Class structure type is required")
    ClassStructureType classStructureType,

    @NotNull(message = "Classes configuration list is required")
    @Valid
    List<FundClassDTO> classes
) {}
