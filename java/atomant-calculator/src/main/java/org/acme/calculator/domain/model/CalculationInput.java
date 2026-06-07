package org.acme.calculator.domain.model;

import java.math.BigDecimal;

public record CalculationInput(
    String cnpj,
    BigDecimal netAssetValue,
    BigDecimal annualFeeRate,
    String quotaHolderId,
    BigDecimal holderQuotas,
    BigDecimal totalFundQuotas
) {}
