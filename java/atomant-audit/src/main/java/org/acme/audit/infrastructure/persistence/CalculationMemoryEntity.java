package org.acme.audit.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.acme.audit.domain.model.AuditRecord;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "calculation_memory")
public class CalculationMemoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String cnpj;

    @Column(name = "calculation_date", nullable = false)
    private LocalDate calculationDate;

    @Column(name = "quota_holder_id", nullable = false)
    private String quotaHolderId;

    @Column(name = "branch_code", nullable = false)
    private String branchCode;

    @Column(name = "net_asset_value", nullable = false)
    private BigDecimal netAssetValue;

    @Column(name = "annual_fee_rate", nullable = false)
    private BigDecimal annualFeeRate;

    @Column(name = "holder_quotas", nullable = false)
    private BigDecimal holderQuotas;

    @Column(name = "total_fund_quotas", nullable = false)
    private BigDecimal totalFundQuotas;

    @Column(name = "daily_fund_fee", nullable = false)
    private BigDecimal dailyFundFee;

    @Column(name = "representation_ratio", nullable = false)
    private BigDecimal representationRatio;

    @Column(name = "prorated_fee", nullable = false)
    private BigDecimal proratedFee;

    public CalculationMemoryEntity() {}

    public static CalculationMemoryEntity fromDomain(AuditRecord record) {
        CalculationMemoryEntity entity = new CalculationMemoryEntity();
        entity.id = record.getId();
        entity.cnpj = record.getCnpj();
        entity.calculationDate = record.getCalculationDate();
        entity.quotaHolderId = record.getQuotaHolderId();
        entity.branchCode = record.getBranchCode();
        entity.netAssetValue = record.getNetAssetValue();
        entity.annualFeeRate = record.getAnnualFeeRate();
        entity.holderQuotas = record.getHolderQuotas();
        entity.totalFundQuotas = record.getTotalFundQuotas();
        entity.dailyFundFee = record.getDailyFundFee();
        entity.representationRatio = record.getRepresentationRatio();
        entity.proratedFee = record.getProratedFee();
        return entity;
    }

    public AuditRecord toDomain() {
        return new AuditRecord(
                this.id,
                this.cnpj,
                this.calculationDate,
                this.quotaHolderId,
                this.branchCode,
                this.netAssetValue,
                this.annualFeeRate,
                this.holderQuotas,
                this.totalFundQuotas,
                this.dailyFundFee,
                this.representationRatio,
                this.proratedFee
        );
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

    public LocalDate getCalculationDate() {
        return calculationDate;
    }

    public void setCalculationDate(LocalDate calculationDate) {
        this.calculationDate = calculationDate;
    }

    public String getQuotaHolderId() {
        return quotaHolderId;
    }

    public void setQuotaHolderId(String quotaHolderId) {
        this.quotaHolderId = quotaHolderId;
    }

    public String getBranchCode() {
        return branchCode;
    }

    public void setBranchCode(String branchCode) {
        this.branchCode = branchCode;
    }

    public BigDecimal getNetAssetValue() {
        return netAssetValue;
    }

    public void setNetAssetValue(BigDecimal netAssetValue) {
        this.netAssetValue = netAssetValue;
    }

    public BigDecimal getAnnualFeeRate() {
        return annualFeeRate;
    }

    public void setAnnualFeeRate(BigDecimal annualFeeRate) {
        this.annualFeeRate = annualFeeRate;
    }

    public BigDecimal getHolderQuotas() {
        return holderQuotas;
    }

    public void setHolderQuotas(BigDecimal holderQuotas) {
        this.holderQuotas = holderQuotas;
    }

    public BigDecimal getTotalFundQuotas() {
        return totalFundQuotas;
    }

    public void setTotalFundQuotas(BigDecimal totalFundQuotas) {
        this.totalFundQuotas = totalFundQuotas;
    }

    public BigDecimal getDailyFundFee() {
        return dailyFundFee;
    }

    public void setDailyFundFee(BigDecimal dailyFundFee) {
        this.dailyFundFee = dailyFundFee;
    }

    public BigDecimal getRepresentationRatio() {
        return representationRatio;
    }

    public void setRepresentationRatio(BigDecimal representationRatio) {
        this.representationRatio = representationRatio;
    }

    public BigDecimal getProratedFee() {
        return proratedFee;
    }

    public void setProratedFee(BigDecimal proratedFee) {
        this.proratedFee = proratedFee;
    }
}
