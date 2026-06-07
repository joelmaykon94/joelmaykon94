package org.acme.ingestion.domain.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.acme.ingestion.domain.model.NormalizedIndicator;
import org.acme.ingestion.infrastructure.client.BacenClient;
import org.acme.ingestion.infrastructure.dto.BacenIndicatorDTO;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@ApplicationScoped
public class IngestionOrchestrator {

    private final BacenClient bacenClient;
    private static final DateTimeFormatter BACEN_DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public IngestionOrchestrator(@RestClient BacenClient bacenClient) {
        this.bacenClient = bacenClient;
    }

    public List<NormalizedIndicator> fetchAndNormalizeSelic() {
        try {
            // "11" is the code for the daily SELIC rate in BACEN SGS
            List<BacenIndicatorDTO> rawRates = bacenClient.getLatestIndicatorValues("11");
            if (rawRates == null) {
                return Collections.emptyList();
            }

            List<NormalizedIndicator> normalized = new ArrayList<>();
            for (BacenIndicatorDTO raw : rawRates) {
                LocalDate date = LocalDate.parse(raw.date(), BACEN_DATE_FORMATTER);
                
                // Normalizing to 4 decimal places
                BigDecimal rate = new BigDecimal(raw.value()).setScale(4, RoundingMode.HALF_UP);
                
                normalized.add(new NormalizedIndicator("SELIC", date, rate));
            }
            return normalized;
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
