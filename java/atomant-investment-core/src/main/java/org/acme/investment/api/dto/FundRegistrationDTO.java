package org.acme.investment.api.dto;

import java.math.BigDecimal;

public record FundRegistrationDTO(
    String cnpj,
    String name,
    BigDecimal annualFeeRate,
    BigDecimal netAssetValue
) {}
