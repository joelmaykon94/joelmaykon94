package org.acme.investment.api.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import org.acme.investment.api.validator.ValidFundClass;
import org.acme.investment.domain.model.EconomicIndex;
import org.acme.investment.domain.model.EsgCategory;
import org.acme.investment.domain.model.TargetAudience;
import java.math.BigDecimal;

@ValidFundClass
public record FundClassDTO(
    @NotBlank(message = "Class name is required")
    String name,

    @NotNull(message = "Maximum custody fee % is required")
    @PositiveOrZero(message = "Maximum custody fee % must be positive or zero")
    @Digits(integer = 3, fraction = 4, message = "Maximum custody fee must have up to 4 decimal places (format 0.0000)")
    BigDecimal maxCustodyFee,

    boolean hasMinimumRemuneration,

    @Digits(integer = 15, fraction = 2, message = "Minimum remuneration must have up to 2 decimal places (R$ 0.00 mask)")
    BigDecimal minRemunerationAmount,

    EconomicIndex economicIndex,

    @NotNull(message = "ESG category is required")
    EsgCategory esgCategory,

    @NotNull(message = "Target audience is required")
    TargetAudience targetAudience
) {}
