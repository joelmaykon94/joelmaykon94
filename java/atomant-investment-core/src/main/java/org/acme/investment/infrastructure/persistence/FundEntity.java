package org.acme.investment.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.acme.investment.domain.model.Fund;
import java.math.BigDecimal;

@Entity
@Table(name = "funds")
public class FundEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String cnpj;

    @Column(nullable = false)
    private String name;

    @Column(name = "annual_fee_rate", nullable = false)
    private BigDecimal annualFeeRate;

    @Column(name = "net_asset_value", nullable = false)
    private BigDecimal netAssetValue;

    public FundEntity() {}

    public static FundEntity fromDomain(Fund fund) {
        FundEntity entity = new FundEntity();
        entity.id = fund.getId();
        entity.cnpj = fund.getCnpj();
        entity.name = fund.getName();
        entity.annualFeeRate = fund.getAnnualFeeRate();
        entity.netAssetValue = fund.getNetAssetValue();
        return entity;
    }

    public Fund toDomain() {
        return new Fund(this.id, this.cnpj, this.name, this.annualFeeRate, this.netAssetValue);
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
}
