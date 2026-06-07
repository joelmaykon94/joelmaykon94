package org.acme.ingestion.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public record NormalizedIndicator(
    String name,
    LocalDate date,
    BigDecimal rate
) {}
