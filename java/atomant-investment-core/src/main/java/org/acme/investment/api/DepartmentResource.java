package org.acme.investment.api;

import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.investment.infrastructure.client.DepartmentClient;
import org.eclipse.microprofile.rest.client.inject.RestClient;

@Path("/departments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DepartmentResource {

    private final DepartmentClient departmentClient;

    public DepartmentResource(@RestClient DepartmentClient departmentClient) {
        this.departmentClient = departmentClient;
    }

    @GET
    @Path("/search")
    @RunOnVirtualThread
    public Response searchDepartments(@QueryParam("query") String query) {
        if (query == null || query.trim().length() < 3) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Search query must be at least 3 characters long"))
                    .build();
        }

        try {
            var departments = departmentClient.searchDepartments(query.trim());
            return Response.ok(departments).build();
        } catch (Exception e) {
            return Response.status(Response.Status.SERVICE_UNAVAILABLE)
                    .entity(new ErrorResponse("Failed to fetch departments from external API: " + e.getMessage()))
                    .build();
        }
    }

    public record ErrorResponse(String message) {}
}
