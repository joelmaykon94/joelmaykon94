package org.acme.investment.api.dto;

import org.acme.investment.domain.model.Fund;
import org.acme.investment.domain.model.FundType;
import org.acme.investment.domain.model.MasterFundType;
import java.time.LocalDate;

public record FundGeneralInfoResponseDTO(
    Long id,
    String requestor,
    String originatingDepartment,
    LocalDate targetLaunchDate,
    boolean noForecast,
    String name,
    FundType fundType,
    MasterFundType masterFundType,
    Long masterFundId,
    String masterFundName,
    Boolean mirrorFund
) {
    public static FundGeneralInfoResponseDTO fromDomain(Fund fund) {
        return new FundGeneralInfoResponseDTO(
            fund.getId(),
            fund.getRequestor(),
            fund.getOriginatingDepartment(),
            fund.getTargetLaunchDate(),
            fund.isNoForecast(),
            fund.getName(),
            fund.getFundType(),
            fund.getMasterFundType(),
            fund.getMasterFundId(),
            fund.getMasterFundName(),
            fund.getMirrorFund()
        );
    }
}
