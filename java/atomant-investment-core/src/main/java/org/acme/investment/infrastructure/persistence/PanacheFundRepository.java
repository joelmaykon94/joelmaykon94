package org.acme.investment.infrastructure.persistence;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.investment.domain.model.Fund;
import org.acme.investment.domain.repository.FundRepository;
import java.util.Optional;

@ApplicationScoped
public class PanacheFundRepository implements FundRepository, PanacheRepositoryBase<FundEntity, Long> {

    @Override
    public void save(Fund fund) {
        FundEntity entity = FundEntity.fromDomain(fund);
        if (entity.getId() == null) {
            persist(entity);
        } else {
            getEntityManager().merge(entity);
        }
        fund.setId(entity.getId());
    }

    @Override
    public Optional<Fund> findByCnpj(String cnpj) {
        return find("cnpj", cnpj)
                .firstResultOptional()
                .map(FundEntity::toDomain);
    }
}
