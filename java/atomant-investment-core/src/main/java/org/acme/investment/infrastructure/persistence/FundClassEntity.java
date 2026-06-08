package org.acme.investment.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.acme.investment.domain.model.EconomicIndex;
import org.acme.investment.domain.model.EsgCategory;
import org.acme.investment.domain.model.FundClass;
import org.acme.investment.domain.model.TargetAudience;
import java.math.BigDecimal;

@Entity
@Table(name = "fund_classes")
public class FundClassEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "max_custody_fee", nullable = false, precision = 7, scale = 4)
    private BigDecimal maxCustodyFee;

    @Column(name = "has_minimum_remuneration", nullable = false)
    private boolean hasMinimumRemuneration;

    @Column(name = "min_remuneration_amount", nullable = true, precision = 18, scale = 2)
    private BigDecimal minRemunerationAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "economic_index", nullable = true)
    private EconomicIndex economicIndex;

    @Enumerated(EnumType.STRING)
    @Column(name = "esg_category", nullable = false)
    private EsgCategory esgCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_audience", nullable = false)
    private TargetAudience targetAudience;

    public FundClassEntity() {}

    public static FundClassEntity fromDomain(FundClass domain) {
        FundClassEntity entity = new FundClassEntity();
        entity.id = domain.getId();
        entity.name = domain.getName();
        entity.maxCustodyFee = domain.getMaxCustodyFee();
        entity.hasMinimumRemuneration = domain.isHasMinimumRemuneration();
        entity.minRemunerationAmount = domain.getMinRemunerationAmount();
        entity.economicIndex = domain.getEconomicIndex();
        entity.esgCategory = domain.getEsgCategory();
        entity.targetAudience = domain.getTargetAudience();
        return entity;
    }

    public FundClass toDomain() {
        return new FundClass(
            this.id,
            this.name,
            this.maxCustodyFee,
            this.hasMinimumRemuneration,
            this.minRemunerationAmount,
            this.economicIndex,
            this.esgCategory,
            this.targetAudience
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getMaxCustodyFee() {
        return maxCustodyFee;
    }

    public void setMaxCustodyFee(BigDecimal maxCustodyFee) {
        this.maxCustodyFee = maxCustodyFee;
    }

    public boolean isHasMinimumRemuneration() {
        return hasMinimumRemuneration;
    }

    public void setHasMinimumRemuneration(boolean hasMinimumRemuneration) {
        this.hasMinimumRemuneration = hasMinimumRemuneration;
    }

    public BigDecimal getMinRemunerationAmount() {
        return minRemunerationAmount;
    }

    public void setMinRemunerationAmount(BigDecimal minRemunerationAmount) {
        this.minRemunerationAmount = minRemunerationAmount;
    }

    public EconomicIndex getEconomicIndex() {
        return economicIndex;
    }

    public void setEconomicIndex(EconomicIndex economicIndex) {
        this.economicIndex = economicIndex;
    }

    public EsgCategory getEsgCategory() {
        return esgCategory;
    }

    public void setEsgCategory(EsgCategory esgCategory) {
        this.esgCategory = esgCategory;
    }

    public TargetAudience getTargetAudience() {
        return targetAudience;
    }

    public void setTargetAudience(TargetAudience targetAudience) {
        this.targetAudience = targetAudience;
    }
}
