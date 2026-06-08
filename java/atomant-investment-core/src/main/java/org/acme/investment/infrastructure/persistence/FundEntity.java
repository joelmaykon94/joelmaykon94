package org.acme.investment.infrastructure.persistence;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import org.acme.investment.domain.model.ClassStructureType;
import org.acme.investment.domain.model.Fund;
import org.acme.investment.domain.model.FundType;
import org.acme.investment.domain.model.MasterFundType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "funds")
public class FundEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = true)
    private String cnpj;

    @Column(nullable = false, length = 300)
    private String name;

    @Column(name = "annual_fee_rate", nullable = true)
    private BigDecimal annualFeeRate;

    @Column(name = "net_asset_value", nullable = true)
    private BigDecimal netAssetValue;

    @Column(name = "requestor", nullable = false)
    private String requestor;

    @Column(name = "originating_department", nullable = false)
    private String originatingDepartment;

    @Column(name = "target_launch_date", nullable = true)
    private LocalDate targetLaunchDate;

    @Column(name = "no_forecast", nullable = false)
    private boolean noForecast;

    @Enumerated(EnumType.STRING)
    @Column(name = "fund_type", nullable = false)
    private FundType fundType;

    @Enumerated(EnumType.STRING)
    @Column(name = "master_fund_type", nullable = true)
    private MasterFundType masterFundType;

    @Column(name = "master_fund_id", nullable = true)
    private Long masterFundId;

    @Column(name = "master_fund_name", nullable = true)
    private String masterFundName;

    @Column(name = "mirror_fund", nullable = true)
    private Boolean mirrorFund;

    // Class Configuration Module Fields
    @Enumerated(EnumType.STRING)
    @Column(name = "class_structure_type", nullable = true)
    private ClassStructureType classStructureType;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "fund_id")
    private List<FundClassEntity> classes = new ArrayList<>();

    public FundEntity() {
        // Required by JPA for entity instantiation via reflection
    }

    public static FundEntity fromDomain(Fund fund) {
        FundEntity entity = new FundEntity();
        entity.id = fund.getId();
        entity.cnpj = fund.getCnpj();
        entity.name = fund.getName();
        entity.annualFeeRate = fund.getAnnualFeeRate();
        entity.netAssetValue = fund.getNetAssetValue();
        entity.requestor = fund.getRequestor();
        entity.originatingDepartment = fund.getOriginatingDepartment();
        entity.targetLaunchDate = fund.getTargetLaunchDate();
        entity.noForecast = fund.isNoForecast();
        entity.fundType = fund.getFundType();
        entity.masterFundType = fund.getMasterFundType();
        entity.masterFundId = fund.getMasterFundId();
        entity.masterFundName = fund.getMasterFundName();
        entity.mirrorFund = fund.getMirrorFund();
        entity.classStructureType = fund.getClassStructureType();
        if (fund.getClasses() != null) {
            entity.classes = fund.getClasses().stream()
                    .map(FundClassEntity::fromDomain)
                    .toList();
        }
        return entity;
    }

    public Fund toDomain() {
        var domainClasses = this.classes == null ? null : this.classes.stream()
                .map(FundClassEntity::toDomain)
                .toList();

        return new Fund(
                this.id,
                this.cnpj,
                this.name,
                this.annualFeeRate,
                this.netAssetValue,
                this.requestor,
                this.originatingDepartment,
                this.targetLaunchDate,
                this.noForecast,
                this.fundType,
                this.masterFundType,
                this.masterFundId,
                this.masterFundName,
                this.mirrorFund,
                this.classStructureType,
                domainClasses
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

    public List<FundClassEntity> getClasses() {
        return classes;
    }

    public void setClasses(List<FundClassEntity> classes) {
        this.classes = classes != null ? classes : new ArrayList<>();
    }
}
