package org.acme.investment.domain.model;

import java.math.BigDecimal;

public class FundClass {
    private Long id;
    private String name;
    private BigDecimal maxCustodyFee;
    private boolean hasMinimumRemuneration;
    private BigDecimal minRemunerationAmount;
    private EconomicIndex economicIndex;
    private EsgCategory esgCategory;
    private TargetAudience targetAudience;

    public FundClass() {}

    public FundClass(Long id, String name, BigDecimal maxCustodyFee, boolean hasMinimumRemuneration,
                     BigDecimal minRemunerationAmount, EconomicIndex economicIndex,
                     EsgCategory esgCategory, TargetAudience targetAudience) {
        this.id = id;
        this.name = name;
        this.maxCustodyFee = maxCustodyFee;
        this.hasMinimumRemuneration = hasMinimumRemuneration;
        this.minRemunerationAmount = minRemunerationAmount;
        this.economicIndex = economicIndex;
        this.esgCategory = esgCategory;
        this.targetAudience = targetAudience;
    }

    private FundClass(Builder builder) {
        this.id = builder.id;
        this.name = builder.name;
        this.maxCustodyFee = builder.maxCustodyFee;
        this.hasMinimumRemuneration = builder.hasMinimumRemuneration;
        this.minRemunerationAmount = builder.minRemunerationAmount;
        this.economicIndex = builder.economicIndex;
        this.esgCategory = builder.esgCategory;
        this.targetAudience = builder.targetAudience;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String name;
        private BigDecimal maxCustodyFee;
        private boolean hasMinimumRemuneration;
        private BigDecimal minRemunerationAmount;
        private EconomicIndex economicIndex;
        private EsgCategory esgCategory;
        private TargetAudience targetAudience;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder maxCustodyFee(BigDecimal maxCustodyFee) { this.maxCustodyFee = maxCustodyFee; return this; }
        public Builder hasMinimumRemuneration(boolean hasMinimumRemuneration) { this.hasMinimumRemuneration = hasMinimumRemuneration; return this; }
        public Builder minRemunerationAmount(BigDecimal minRemunerationAmount) { this.minRemunerationAmount = minRemunerationAmount; return this; }
        public Builder economicIndex(EconomicIndex economicIndex) { this.economicIndex = economicIndex; return this; }
        public Builder esgCategory(EsgCategory esgCategory) { this.esgCategory = esgCategory; return this; }
        public Builder targetAudience(TargetAudience targetAudience) { this.targetAudience = targetAudience; return this; }

        public FundClass build() {
            return new FundClass(this);
        }
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
