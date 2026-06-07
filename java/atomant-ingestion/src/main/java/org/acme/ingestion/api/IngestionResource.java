package org.acme.ingestion.api;

import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.ingestion.domain.service.IngestionOrchestrator;

@Path("/ingest")
@Produces(MediaType.APPLICATION_JSON)
public class IngestionResource {

    private final IngestionOrchestrator ingestionOrchestrator;

    public IngestionResource(IngestionOrchestrator ingestionOrchestrator) {
        this.ingestionOrchestrator = ingestionOrchestrator;
    }

    @GET
    @Path("/selic")
    @RunOnVirtualThread
    public Response getNormalizedSelic() {
        var rates = ingestionOrchestrator.fetchAndNormalizeSelic();
        if (rates.isEmpty()) {
            return Response.status(Response.Status.SERVICE_UNAVAILABLE)
                    .entity("Could not fetch indicator data from BACEN or resolve fallback.")
                    .build();
        }
        return Response.ok(rates).build();
    }
}
