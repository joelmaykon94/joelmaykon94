package org.acme.investment.api.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.acme.investment.api.dto.ClassConfigurationRequestDTO;
import org.acme.investment.domain.model.ClassStructureType;

public class ClassConfigurationRequestValidator implements ConstraintValidator<ValidClassConfiguration, ClassConfigurationRequestDTO> {

    @Override
    public boolean isValid(ClassConfigurationRequestDTO dto, ConstraintValidatorContext context) {
        if (dto == null) {
            return true;
        }

        boolean isValid = true;
        context.disableDefaultConstraintViolation();

        if (dto.classStructureType() == null) {
            return true; // Main @NotNull annotation will handle this
        }

        int classCount = dto.classes() == null ? 0 : dto.classes().size();

        if (dto.classStructureType() == ClassStructureType.SINGLE_CLASS) {
            if (classCount != 1) {
                context.buildConstraintViolationWithTemplate("A single class structure must configure exactly 1 class")
                        .addPropertyNode("classes")
                        .addConstraintViolation();
                isValid = false;
            }
        } else if (dto.classStructureType() == ClassStructureType.MULTI_CLASS) {
            if (classCount < 1 || classCount > 3) {
                context.buildConstraintViolationWithTemplate("A multiple classes structure must configure between 1 and 3 classes")
                        .addPropertyNode("classes")
                        .addConstraintViolation();
                isValid = false;
            }
        }

        return isValid;
    }
}
