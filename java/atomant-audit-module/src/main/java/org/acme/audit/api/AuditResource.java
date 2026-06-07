package org.acme.audit.api;

import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.audit.domain.model.AuditRecord;
import org.acme.audit.domain.service.AuditPersisterService;
import java.time.LocalDate;
import java.util.List;

@Path("/audit")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuditResource {

    private final AuditPersisterService persisterService;

    public AuditResource(AuditPersisterService persisterService) {
        this.persisterService = persisterService;
    }

    @POST
    @Path("/record")
    @RunOnVirtualThread
    public Response createAuditRecord(AuditRecord record) {
        if (record == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Payload cannot be null").build();
        }
        persisterService.persistAuditRecord(record);
        return Response.status(Response.Status.CREATED).build();
    }

    @POST
    @Path("/batch")
    @RunOnVirtualThread
    public Response createAuditBatch(List<AuditRecord> records) {
        if (records == null || records.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Batch list cannot be empty").build();
        }
        persisterService.persistBatch(records);
        return Response.status(Response.Status.CREATED).entity("Batch stored successfully").build();
    }

    @GET
    @Path("/aggregate/branch/{date}")
    @RunOnVirtualThread
    public Response getBranchAggregations(@PathParam("date") String dateString) {
        try {
            LocalDate date = LocalDate.parse(dateString);
            var aggregations = persisterService.aggregateFees(date);
            return Response.ok(aggregations).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Invalid date format. Expected YYYY-MM-DD.").build();
        }
    }
}
