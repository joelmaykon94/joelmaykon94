package org.acme.investment.domain.repository;

import org.acme.investment.domain.model.Fund;
import java.util.Optional;

public interface FundRepository {
    void save(Fund fund);
    Optional<Fund> findByCnpj(String cnpj);
    Optional<Fund> findFundById(Long id);
}
