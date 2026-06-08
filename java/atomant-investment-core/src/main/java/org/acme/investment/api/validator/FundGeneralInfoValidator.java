package org.acme.investment.api.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.acme.investment.api.dto.FundGeneralInfoCreateDTO;
import org.acme.investment.domain.model.FundType;
import java.time.LocalDate;

public class FundGeneralInfoValidator implements ConstraintValidator<ValidFundGeneralInfo, FundGeneralInfoCreateDTO> {

    private static final String TARGET_LAUNCH_DATE = "targetLaunchDate";

    @Override
    public boolean isValid(FundGeneralInfoCreateDTO dto, ConstraintValidatorContext context) {
        if (dto == null) {
            return true;
        }

        context.disableDefaultConstraintViolation();

        boolean targetLaunchValid = validateTargetLaunchDate(dto, context);
        boolean masterFeederValid = validateMasterFeederLogic(dto, context);

        return targetLaunchValid && masterFeederValid;
    }

    private boolean validateTargetLaunchDate(FundGeneralInfoCreateDTO dto, ConstraintValidatorContext context) {
        if (dto.noForecast()) {
            if (dto.targetLaunchDate() != null) {
                context.buildConstraintViolationWithTemplate("Target launch date must be empty if 'no forecast' is selected")
                        .addPropertyNode(TARGET_LAUNCH_DATE)
                        .addConstraintViolation();
                return false;
            }
            return true;
        }

        if (dto.targetLaunchDate() == null) {
            context.buildConstraintViolationWithTemplate("Target launch date is required when 'no forecast' is not selected")
                    .addPropertyNode(TARGET_LAUNCH_DATE)
                    .addConstraintViolation();
            return false;
        }

        if (!dto.targetLaunchDate().isAfter(LocalDate.now())) {
            context.buildConstraintViolationWithTemplate("Target launch date must be in the future")
                    .addPropertyNode(TARGET_LAUNCH_DATE)
                    .addConstraintViolation();
            return false;
        }

        return true;
    }

    private boolean validateMasterFeederLogic(FundGeneralInfoCreateDTO dto, ConstraintValidatorContext context) {
        if (dto.fundType() == FundType.FEEDER_FUND) {
            return validateFeederFund(dto, context);
        }
        return validateNonFeederFund(dto, context);
    }

    private boolean validateFeederFund(FundGeneralInfoCreateDTO dto, ConstraintValidatorContext context) {
        if (dto.masterFundType() == null) {
            context.buildConstraintViolationWithTemplate("Master fund type is required for feeder funds")
                    .addPropertyNode("masterFundType")
                    .addConstraintViolation();
            return false;
        }

        switch (dto.masterFundType()) {
            case INTERNAL_MASTER:
                if (dto.masterFundId() == null) {
                    context.buildConstraintViolationWithTemplate("Master fund selection is required for internal master type")
                            .addPropertyNode("masterFundId")
                            .addConstraintViolation();
                    return false;
                }
                break;
            case EXTERNAL_MASTER:
                if (isNullOrBlank(dto.masterFundName())) {
                    context.buildConstraintViolationWithTemplate("Master fund name is required for external master type")
                            .addPropertyNode("masterFundName")
                            .addConstraintViolation();
                    return false;
                }
                break;
            case NEW_INTERNAL_MASTER:
                if (isNullOrBlank(dto.masterFundName())) {
                    context.buildConstraintViolationWithTemplate("New master fund name is required for new internal master type")
                            .addPropertyNode("masterFundName")
                            .addConstraintViolation();
                    return false;
                }
                break;
            default:
                break;
        }

        return true;
    }

    private boolean validateNonFeederFund(FundGeneralInfoCreateDTO dto, ConstraintValidatorContext context) {
        if (dto.masterFundType() != null || dto.masterFundId() != null || dto.masterFundName() != null || dto.mirrorFund() != null) {
            context.buildConstraintViolationWithTemplate("Master fund configurations can only be specified for feeder funds")
                    .addPropertyNode("fundType")
                    .addConstraintViolation();
            return false;
        }
        return true;
    }

    private boolean isNullOrBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
