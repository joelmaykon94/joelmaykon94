package org.acme.investment.api.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.acme.investment.api.dto.FundClassDTO;
import java.math.BigDecimal;

public class FundClassValidator implements ConstraintValidator<ValidFundClass, FundClassDTO> {

    @Override
    public boolean isValid(FundClassDTO dto, ConstraintValidatorContext context) {
        if (dto == null) {
            return true;
        }

        boolean isValid = true;
        context.disableDefaultConstraintViolation();

        if (dto.hasMinimumRemuneration()) {
            if (dto.minRemunerationAmount() == null) {
                context.buildConstraintViolationWithTemplate("Minimum remuneration amount is required when minimum remuneration is enabled")
                        .addPropertyNode("minRemunerationAmount")
                        .addConstraintViolation();
                isValid = false;
            } else if (dto.minRemunerationAmount().compareTo(BigDecimal.ZERO) <= 0) {
                context.buildConstraintViolationWithTemplate("Minimum remuneration amount must be greater than zero")
                        .addPropertyNode("minRemunerationAmount")
                        .addConstraintViolation();
                isValid = false;
            }

            if (dto.economicIndex() == null) {
                context.buildConstraintViolationWithTemplate("Economic Index is required when minimum remuneration is enabled")
                        .addPropertyNode("economicIndex")
                        .addConstraintViolation();
                isValid = false;
            }
        } else {
            if (dto.minRemunerationAmount() != null) {
                context.buildConstraintViolationWithTemplate("Minimum remuneration amount must be null when minimum remuneration is disabled")
                        .addPropertyNode("minRemunerationAmount")
                        .addConstraintViolation();
                isValid = false;
            }

            if (dto.economicIndex() != null) {
                context.buildConstraintViolationWithTemplate("Economic Index must be null when minimum remuneration is disabled")
                        .addPropertyNode("economicIndex")
                        .addConstraintViolation();
                isValid = false;
            }
        }

        return isValid;
    }
}
