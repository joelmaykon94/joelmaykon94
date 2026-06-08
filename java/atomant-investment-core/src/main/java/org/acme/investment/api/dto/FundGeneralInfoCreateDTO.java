package org.acme.investment.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.acme.investment.api.validator.ValidFundGeneralInfo;
import org.acme.investment.domain.model.FundType;
import org.acme.investment.domain.model.MasterFundType;
import java.time.LocalDate;

@ValidFundGeneralInfo
public record FundGeneralInfoCreateDTO(
    @NotBlank(message = "Requestor is required")
    String requestor,

    @NotBlank(message = "Originating department is required")
    String originatingDepartment,

    LocalDate targetLaunchDate,

    boolean noForecast,

    @NotBlank(message = "Fund name is required")
    @Size(max = 300, message = "Fund name cannot exceed 300 characters")
    String name,

    @NotNull(message = "Fund type is required")
    FundType fundType,

    MasterFundType masterFundType,
    Long masterFundId,
    String masterFundName,
    Boolean mirrorFund
) {}
