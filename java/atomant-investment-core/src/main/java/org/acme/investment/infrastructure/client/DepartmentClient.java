package org.acme.investment.infrastructure.client;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import java.util.List;

@RegisterRestClient(configKey = "department-api")
@Path("/departments")
public interface DepartmentClient {

    @GET
    @Path("/search")
    List<DepartmentDTO> searchDepartments(@QueryParam("query") String query);
}
