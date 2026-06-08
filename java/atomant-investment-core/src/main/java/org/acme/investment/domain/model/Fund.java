package org.acme.investment.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class Fund {
    private Long id;
    private String cnpj;
    private String name;
    private BigDecimal annualFeeRate;
    private BigDecimal netAssetValue;

    // General Info Module Fields
    private String requestor;
    private String originatingDepartment;
    private LocalDate targetLaunchDate;
    private boolean noForecast;
    private FundType fundType;
    private MasterFundType masterFundType;
    private Long masterFundId;
    private String masterFundName;
    private Boolean mirrorFund;

    // Class Configuration Module Fields
    private ClassStructureType classStructureType;
    private List<FundClass> classes = new ArrayList<>();

    public Fund() {}

    public Fund(Long id, String cnpj, String name, BigDecimal annualFeeRate, BigDecimal netAssetValue) {
        this.id = id;
        this.cnpj = cnpj;
        this.name = name;
        this.annualFeeRate = annualFeeRate;
        this.netAssetValue = netAssetValue;
    }

    public Fund(Long id, String cnpj, String name, BigDecimal annualFeeRate, BigDecimal netAssetValue,
                String requestor, String originatingDepartment, LocalDate targetLaunchDate,
                boolean noForecast, FundType fundType, MasterFundType masterFundType,
                Long masterFundId, String masterFundName, Boolean mirrorFund) {
        this.id = id;
        this.cnpj = cnpj;
        this.name = name;
        this.annualFeeRate = annualFeeRate;
        this.netAssetValue = netAssetValue;
        this.requestor = requestor;
        this.originatingDepartment = originatingDepartment;
        this.targetLaunchDate = targetLaunchDate;
        this.noForecast = noForecast;
        this.fundType = fundType;
        this.masterFundType = masterFundType;
        this.masterFundId = masterFundId;
        this.masterFundName = masterFundName;
        this.mirrorFund = mirrorFund;
    }

    public Fund(Long id, String cnpj, String name, BigDecimal annualFeeRate, BigDecimal netAssetValue,
                String requestor, String originatingDepartment, LocalDate targetLaunchDate,
                boolean noForecast, FundType fundType, MasterFundType masterFundType,
                Long masterFundId, String masterFundName, Boolean mirrorFund,
                ClassStructureType classStructureType, List<FundClass> classes) {
        this.id = id;
        this.cnpj = cnpj;
        this.name = name;
        this.annualFeeRate = annualFeeRate;
        this.netAssetValue = netAssetValue;
        this.requestor = requestor;
        this.originatingDepartment = originatingDepartment;
        this.targetLaunchDate = targetLaunchDate;
        this.noForecast = noForecast;
        this.fundType = fundType;
        this.masterFundType = masterFundType;
        this.masterFundId = masterFundId;
        this.masterFundName = masterFundName;
        this.mirrorFund = mirrorFund;
        this.classStructureType = classStructureType;
        this.classes = classes != null ? classes : new ArrayList<>();
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

    public String getRequestor() {
        return requestor;
    }

    public void setRequestor(String requestor) {
        this.requestor = requestor;
    }

    public String getOriginatingDepartment() {
        return originatingDepartment;
    }

    public void setOriginatingDepartment(String originatingDepartment) {
        this.originatingDepartment = originatingDepartment;
    }

    public LocalDate getTargetLaunchDate() {
        return targetLaunchDate;
    }

    public void setTargetLaunchDate(LocalDate targetLaunchDate) {
        this.targetLaunchDate = targetLaunchDate;
    }

    public boolean isNoForecast() {
        return noForecast;
    }

    public void setNoForecast(boolean noForecast) {
        this.noForecast = noForecast;
    }

    public FundType getFundType() {
        return fundType;
    }

    public void setFundType(FundType fundType) {
        this.fundType = fundType;
    }

    public MasterFundType getMasterFundType() {
        return masterFundType;
    }

    public void setMasterFundType(MasterFundType masterFundType) {
        this.masterFundType = masterFundType;
    }

    public Long getMasterFundId() {
        return masterFundId;
    }

    public void setMasterFundId(Long masterFundId) {
        this.masterFundId = masterFundId;
    }

    public String getMasterFundName() {
        return masterFundName;
    }

    public void setMasterFundName(String masterFundName) {
        this.masterFundName = masterFundName;
    }

    public Boolean getMirrorFund() {
        return mirrorFund;
    }

    public void setMirrorFund(Boolean mirrorFund) {
        this.mirrorFund = mirrorFund;
    }

    public ClassStructureType getClassStructureType() {
        return classStructureType;
    }

    public void setClassStructureType(ClassStructureType classStructureType) {
        this.classStructureType = classStructureType;
    }

    public List<FundClass> getClasses() {
        return classes;
    }

    public void setClasses(List<FundClass> classes) {
        this.classes = classes != null ? classes : new ArrayList<>();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Fund fund = (Fund) o;
        return Objects.equals(id, fund.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
