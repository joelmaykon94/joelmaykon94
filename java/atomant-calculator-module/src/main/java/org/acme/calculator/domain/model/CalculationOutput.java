package org.acme.calculator.domain.model;

import java.math.BigDecimal;

public record CalculationOutput(
    String cnpj,
    String quotaHolderId,
    BigDecimal dailyFundFee,
    BigDecimal representationRatio,
    BigDecimal proratedFee
) {}
