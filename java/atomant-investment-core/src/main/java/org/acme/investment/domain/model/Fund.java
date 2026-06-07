package org.acme.investment.domain.model;

import java.math.BigDecimal;
import java.util.Objects;

public class Fund {
    private Long id;
    private String cnpj;
    private String name;
    private BigDecimal annualFeeRate;
    private BigDecimal netAssetValue;

    public Fund() {}

    public Fund(Long id, String cnpj, String name, BigDecimal annualFeeRate, BigDecimal netAssetValue) {
        this.id = id;
        this.cnpj = cnpj;
        this.name = name;
        this.annualFeeRate = annualFeeRate;
        this.netAssetValue = netAssetValue;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getAnnualFeeRate() {
        return annualFeeRate;
    }

    public void setAnnualFeeRate(BigDecimal annualFeeRate) {
        this.annualFeeRate = annualFeeRate;
    }

    public BigDecimal getNetAssetValue() {
        return netAssetValue;
    }

    public void setNetAssetValue(BigDecimal netAssetValue) {
        this.netAssetValue = netAssetValue;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Fund fund = (Fund) o;
        return Objects.equals(cnpj, fund.cnpj);
    }

    @Override
    public int hashCode() {
        return Objects.hash(cnpj);
    }
}
