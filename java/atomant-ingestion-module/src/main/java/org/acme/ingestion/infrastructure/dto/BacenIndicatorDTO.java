package org.acme.ingestion.infrastructure.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record BacenIndicatorDTO(
    @JsonProperty("data") String date,
    @JsonProperty("valor") String value
) {}
