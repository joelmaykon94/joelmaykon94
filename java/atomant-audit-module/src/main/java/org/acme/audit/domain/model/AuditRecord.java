package org.acme.audit.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public class AuditRecord {
    private Long id;
    private String cnpj;
    private LocalDate calculationDate;
    private String quotaHolderId;
    private String branchCode;
    private BigDecimal netAssetValue;
    private BigDecimal annualFeeRate;
    private BigDecimal holderQuotas;
    private BigDecimal totalFundQuotas;
    private BigDecimal dailyFundFee;
    private BigDecimal representationRatio;
    private BigDecimal proratedFee;

    public AuditRecord() {}

    public AuditRecord(Long id, String cnpj, LocalDate calculationDate, String quotaHolderId, String branchCode,
                       BigDecimal netAssetValue, BigDecimal annualFeeRate, BigDecimal holderQuotas,
                       BigDecimal totalFundQuotas, BigDecimal dailyFundFee, BigDecimal representationRatio,
                       BigDecimal proratedFee) {
        this.id = id;
        this.cnpj = cnpj;
        this.calculationDate = calculationDate;
        this.quotaHolderId = quotaHolderId;
        this.branchCode = branchCode;
        this.netAssetValue = netAssetValue;
        this.annualFeeRate = annualFeeRate;
        this.holderQuotas = holderQuotas;
        this.totalFundQuotas = totalFundQuotas;
        this.dailyFundFee = dailyFundFee;
        this.representationRatio = representationRatio;
        this.proratedFee = proratedFee;
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
