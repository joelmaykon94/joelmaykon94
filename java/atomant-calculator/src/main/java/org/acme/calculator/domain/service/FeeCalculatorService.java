package org.acme.calculator.domain.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.acme.calculator.domain.model.CalculationInput;
import org.acme.calculator.domain.model.CalculationOutput;
import java.math.BigDecimal;
import java.math.RoundingMode;

@ApplicationScoped
public class FeeCalculatorService {

    private static final BigDecimal WORKING_DAYS_YEAR = BigDecimal.valueOf(252);

    public CalculationOutput calculateProratedFee(CalculationInput input) {
        // Rule 1: Fee Diarization (Daily Fund Fee = NAV * Annual Fee Rate / 252)
        BigDecimal dailyFundFee = input.netAssetValue()
                .multiply(input.annualFeeRate())
                .divide(WORKING_DAYS_YEAR, 4, RoundingMode.HALF_EVEN);

        // Rule 2: Quota holder representation (Representation = Holder Position / Fund Daily PL)
        BigDecimal representationRatio = input.holderQuotas()
                .divide(input.totalFundQuotas(), 8, RoundingMode.HALF_EVEN);

        // Rule 3: Pro-rata Fee Apportionment (Representation * Daily Fund Fee)
        BigDecimal proratedFee = representationRatio
                .multiply(dailyFundFee)
                .setScale(4, RoundingMode.HALF_EVEN);

        return new CalculationOutput(
                input.cnpj(),
                input.quotaHolderId(),
                dailyFundFee,
                representationRatio,
                proratedFee
        );
    }
}
