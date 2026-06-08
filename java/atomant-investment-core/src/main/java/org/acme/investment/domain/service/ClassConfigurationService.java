package org.acme.investment.domain.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import org.acme.investment.api.dto.ClassConfigurationRequestDTO;
import org.acme.investment.domain.model.Fund;
import org.acme.investment.domain.model.FundClass;
import org.acme.investment.domain.repository.FundRepository;

@ApplicationScoped
public class ClassConfigurationService {

    private final FundRepository fundRepository;

    public ClassConfigurationService(FundRepository fundRepository) {
        this.fundRepository = fundRepository;
    }

    @Transactional
    public Fund configureClasses(Long fundId, ClassConfigurationRequestDTO dto) {
        Fund fund = fundRepository.findFundById(fundId)
                .orElseThrow(() -> new NotFoundException("Fund with ID " + fundId + " not found"));

        fund.setClassStructureType(dto.classStructureType());
        
        var newClasses = dto.classes().stream()
                .map(classDto -> {
                    FundClass fundClass = new FundClass();
                    fundClass.setName(classDto.name());
                    fundClass.setMaxCustodyFee(classDto.maxCustodyFee());
                    fundClass.setHasMinimumRemuneration(classDto.hasMinimumRemuneration());
                    fundClass.setMinRemunerationAmount(classDto.minRemunerationAmount());
                    fundClass.setEconomicIndex(classDto.economicIndex());
                    fundClass.setEsgCategory(classDto.esgCategory());
                    fundClass.setTargetAudience(classDto.targetAudience());
                    return fundClass;
                })
                .toList();

        fund.setClasses(newClasses);
        fundRepository.save(fund);
        return fund;
    }

    public Fund getClassesConfiguration(Long fundId) {
        return fundRepository.findFundById(fundId)
                .orElseThrow(() -> new NotFoundException("Fund with ID " + fundId + " not found"));
    }
}
