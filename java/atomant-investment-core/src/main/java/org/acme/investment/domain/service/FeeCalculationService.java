package org.acme.investment.domain.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.acme.investment.domain.model.FeeSplit;
import org.acme.investment.domain.model.Fund;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class FeeCalculationService {

    private static final BigDecimal DAYS_IN_YEAR = BigDecimal.valueOf(252); // Business days convention

    public BigDecimal calculateDailyPatrimonialFee(Fund fund) {
        if (fund.getNetAssetValue() == null || fund.getAnnualFeeRate() == null) {
            return BigDecimal.ZERO;
        }
        
        // Fee = NAV * (annualFeeRate / 252)
        return fund.getNetAssetValue()
                .multiply(fund.getAnnualFeeRate())
                .divide(DAYS_IN_YEAR, 4, RoundingMode.HALF_UP);
    }

    public List<FeeSplit> splitDailyFee(BigDecimal dailyFee, Map<String, BigDecimal> quotaHoldersOwnershipRatio) {
        List<FeeSplit> splits = new ArrayList<>();
        
        for (Map.Entry<String, BigDecimal> entry : quotaHoldersOwnershipRatio.entrySet()) {
            String holderId = entry.getKey();
            BigDecimal ratio = entry.getValue(); // e.g., 0.35 for 35%
            
            BigDecimal calculatedFee = dailyFee.multiply(ratio).setScale(4, RoundingMode.HALF_UP);
            splits.add(new FeeSplit(holderId, ratio, calculatedFee));
        }
        
        return splits;
    }
}
