package org.acme.ingestion.infrastructure.client;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.acme.ingestion.infrastructure.dto.BacenIndicatorDTO;
import org.eclipse.microprofile.faulttolerance.CircuitBreaker;
import org.eclipse.microprofile.faulttolerance.Retry;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import java.util.List;

@RegisterRestClient
@Path("/v1/dados/serie")
public interface BacenClient {

    @GET
    @Path("/bcdata.sgs.{seriesCode}/dados/ultimos/10")
    @Produces(MediaType.APPLICATION_JSON)
    @Retry(maxRetries = 3, delay = 1000, jitter = 200)
    @CircuitBreaker(requestVolumeThreshold = 10, failureRatio = 0.50, delay = 10000)
    List<BacenIndicatorDTO> getLatestIndicatorValues(@PathParam("seriesCode") String seriesCode);
}
