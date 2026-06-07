package org.acme.audit.infrastructure.persistence;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.audit.domain.model.BranchAggregation;
import java.time.LocalDate;
import java.util.List;

@ApplicationScoped
public class PanacheCalculationMemoryRepository implements PanacheRepositoryBase<CalculationMemoryEntity, Long> {

    public List<BranchAggregation> aggregateFeesByBranch(LocalDate date) {
        return getEntityManager().createQuery(
                "SELECT new org.acme.audit.domain.model.BranchAggregation(e.branchCode, e.calculationDate, SUM(e.proratedFee)) " +
                "FROM CalculationMemoryEntity e " +
                "WHERE e.calculationDate = :date " +
                "GROUP BY e.branchCode, e.calculationDate", BranchAggregation.class)
                .setParameter("date", date)
                .getResultList();
    }
}
