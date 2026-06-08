package org.acme.investment.infrastructure.client;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Alternative;
import jakarta.annotation.Priority;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import java.util.List;

@Alternative
@Priority(1)
@ApplicationScoped
@RestClient
public class MockDepartmentClient implements DepartmentClient {

    @Override
    public List<DepartmentDTO> searchDepartments(String query) {
        if ("error".equalsIgnoreCase(query)) {
            throw new RuntimeException("External service failure");
        }
        if (query == null || query.trim().length() < 3) {
            return List.of();
        }
        return List.of(
            new DepartmentDTO("D01", "Department 1 - " + query),
            new DepartmentDTO("D02", "Department 2 - " + query)
        );
    }
}
