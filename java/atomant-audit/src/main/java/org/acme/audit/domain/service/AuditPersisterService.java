package org.acme.audit.domain.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import org.acme.audit.domain.model.AuditRecord;
import org.acme.audit.domain.model.BranchAggregation;
import org.acme.audit.infrastructure.persistence.CalculationMemoryEntity;
import org.acme.audit.infrastructure.persistence.PanacheCalculationMemoryRepository;

import java.time.LocalDate;
import java.util.List;

@ApplicationScoped
public class AuditPersisterService {

    private final PanacheCalculationMemoryRepository repository;

    public AuditPersisterService(PanacheCalculationMemoryRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void persistAuditRecord(AuditRecord record) {
        CalculationMemoryEntity entity = CalculationMemoryEntity.fromDomain(record);
        repository.persist(entity);
    }

    @Transactional
    public void persistBatch(List<AuditRecord> records) {
        int i = 0;
        for (AuditRecord r : records) {
            repository.persist(CalculationMemoryEntity.fromDomain(r));
            i++;
            // Batch flush/clear to release memory during high-volume insertion
            if (i % 50 == 0) {
                repository.getEntityManager().flush();
                repository.getEntityManager().clear();
            }
        }
    }

    public List<BranchAggregation> aggregateFees(LocalDate date) {
        return repository.aggregateFeesByBranch(date);
    }
}
