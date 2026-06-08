package org.acme.investment.domain.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.BadRequestException;
import org.acme.investment.api.dto.FundGeneralInfoCreateDTO;
import org.acme.investment.domain.model.Fund;
import org.acme.investment.domain.model.FundType;
import org.acme.investment.domain.model.MasterFundType;
import org.acme.investment.domain.repository.FundRepository;

@ApplicationScoped
public class FundCreationService {

    private final FundRepository fundRepository;

    public FundCreationService(FundRepository fundRepository) {
        this.fundRepository = fundRepository;
    }

    public Fund createFundGeneralInfo(FundGeneralInfoCreateDTO dto) {
        Boolean mirrorFund = dto.mirrorFund();

        if (dto.fundType() == FundType.FEEDER_FUND) {
            // Apply default mirror fund flag if not specified
            if (mirrorFund == null) {
                if (dto.masterFundType() == MasterFundType.INTERNAL_MASTER) {
                    mirrorFund = true;
                } else if (dto.masterFundType() == MasterFundType.EXTERNAL_MASTER) {
                    mirrorFund = false;
                } else if (dto.masterFundType() == MasterFundType.NEW_INTERNAL_MASTER) {
                    mirrorFund = true;
                }
            }

            // Verify master fund exists if internal
            if (dto.masterFundType() == MasterFundType.INTERNAL_MASTER && dto.masterFundId() != null) {
                fundRepository.findFundById(dto.masterFundId())
                        .orElseThrow(() -> new BadRequestException("Referenced internal master fund with ID " + dto.masterFundId() + " does not exist"));
            }
        }

        Fund fund = new Fund(
            null,
            null, // CNPJ is not supplied at general info step
            dto.name(),
            null, // annualFeeRate is not supplied at general info step
            null, // netAssetValue is not supplied at general info step
            dto.requestor(),
            dto.originatingDepartment(),
            dto.targetLaunchDate(),
            dto.noForecast(),
            dto.fundType(),
            dto.masterFundType(),
            dto.masterFundId(),
            dto.masterFundName(),
            mirrorFund
        );

        fundRepository.save(fund);
        return fund;
    }
}
