package org.acme.investment.domain.model;

import java.math.BigDecimal;

public record FeeSplit(
    String quotaHolderId,
    BigDecimal splitPercentage,
    BigDecimal calculatedFee
) {}
