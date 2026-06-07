package org.acme.calculator.api;

import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.calculator.domain.model.CalculationInput;
import org.acme.calculator.domain.model.CalculationOutput;
import org.acme.calculator.domain.service.FeeCalculatorService;

@Path("/calculate")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CalculatorResource {

    private final FeeCalculatorService feeCalculatorService;

    public CalculatorResource(FeeCalculatorService feeCalculatorService) {
        this.feeCalculatorService = feeCalculatorService;
    }

    @POST
    @RunOnVirtualThread
    public Response performFeeApportionment(CalculationInput input) {
        if (input == null || input.netAssetValue() == null || input.totalFundQuotas() == null || input.holderQuotas() == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Invalid calculation input parameters.")
                    .build();
        }
        CalculationOutput output = feeCalculatorService.calculateProratedFee(input);
        return Response.ok(output).build();
    }
}
