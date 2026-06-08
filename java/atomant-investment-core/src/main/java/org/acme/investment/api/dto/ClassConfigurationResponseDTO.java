package org.acme.investment.api.dto;

import org.acme.investment.domain.model.ClassStructureType;
import org.acme.investment.domain.model.Fund;
import java.util.List;
import java.util.stream.Collectors;

public record ClassConfigurationResponseDTO(
    Long fundId,
    ClassStructureType classStructureType,
    List<FundClassResponseDTO> classes
) {
    public static ClassConfigurationResponseDTO fromDomain(Fund fund) {
        var classes = fund.getClasses() == null ? List.<FundClassResponseDTO>of() : fund.getClasses().stream()
                .map(FundClassResponseDTO::fromDomain)
                .collect(Collectors.toList());
        return new ClassConfigurationResponseDTO(
            fund.getId(),
            fund.getClassStructureType(),
            classes
        );
    }
}
