package org.acme.audit.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BranchAggregation(
    String branchCode,
    LocalDate calculationDate,
    BigDecimal totalAggregatedFee
) {}
