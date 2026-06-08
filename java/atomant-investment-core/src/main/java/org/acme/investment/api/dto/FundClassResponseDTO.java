package org.acme.investment.api.dto;

import org.acme.investment.domain.model.EconomicIndex;
import org.acme.investment.domain.model.EsgCategory;
import org.acme.investment.domain.model.FundClass;
import org.acme.investment.domain.model.TargetAudience;
import java.math.BigDecimal;

public record FundClassResponseDTO(
    Long id,
    String name,
    BigDecimal maxCustodyFee,
    boolean hasMinimumRemuneration,
    BigDecimal minRemunerationAmount,
    EconomicIndex economicIndex,
    EsgCategory esgCategory,
    TargetAudience targetAudience
) {
    public static FundClassResponseDTO fromDomain(FundClass domain) {
        return new FundClassResponseDTO(
            domain.getId(),
            domain.getName(),
            domain.getMaxCustodyFee(),
            domain.isHasMinimumRemuneration(),
            domain.getMinRemunerationAmount(),
            domain.getEconomicIndex(),
            domain.getEsgCategory(),
            domain.getTargetAudience()
        );
    }
}
