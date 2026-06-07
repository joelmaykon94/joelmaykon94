package org.acme.investment.api;

import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.investment.api.dto.FundRegistrationDTO;
import org.acme.investment.domain.model.Fund;
import org.acme.investment.domain.repository.FundRepository;
import org.acme.investment.domain.service.FeeCalculationService;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Path("/funds")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FundResource {

    private final FundRepository fundRepository;
    private final FeeCalculationService feeCalculationService;

    public FundResource(FundRepository fundRepository, FeeCalculationService feeCalculationService) {
        this.fundRepository = fundRepository;
        this.feeCalculationService = feeCalculationService;
    }

    @POST
    @Transactional
    @RunOnVirtualThread
    public Response registerFund(FundRegistrationDTO dto) {
        Fund fund = new Fund(null, dto.cnpj(), dto.name(), dto.annualFeeRate(), dto.netAssetValue());
        fundRepository.save(fund);
        return Response.status(Response.Status.CREATED).entity(fund).build();
    }

    @GET
    @Path("/{cnpj}")
    @RunOnVirtualThread
    public Response getFundByCnpj(@PathParam("cnpj") String cnpj) {
        return fundRepository.findByCnpj(cnpj)
                .map(fund -> Response.ok(fund).build())
                .orElseGet(() -> Response.status(Response.Status.NOT_FOUND).build());
    }

    @GET
    @Path("/{cnpj}/daily-fee")
    @RunOnVirtualThread
    public Response calculateDailyFee(@PathParam("cnpj") String cnpj) {
        return fundRepository.findByCnpj(cnpj)
                .map(fund -> {
                    BigDecimal fee = feeCalculationService.calculateDailyPatrimonialFee(fund);
                    
                    // Mock ownership split for PoC representation
                    Map<String, BigDecimal> dummyRatio = new HashMap<>();
                    dummyRatio.put("cotista-alpha-123", BigDecimal.valueOf(0.60));
                    dummyRatio.put("cotista-beta-456", BigDecimal.valueOf(0.40));
                    
                    var splits = feeCalculationService.splitDailyFee(fee, dummyRatio);
                    
                    Map<String, Object> result = new HashMap<>();
                    result.put("cnpj", fund.getCnpj());
                    result.put("fundName", fund.getName());
                    result.put("netAssetValue", fund.getNetAssetValue());
                    result.put("dailyPatrimonialFee", fee);
                    result.put("splits", splits);
                    
                    return Response.ok(result).build();
                })
                .orElseGet(() -> Response.status(Response.Status.NOT_FOUND).build());
    }
}
