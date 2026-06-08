package org.acme.investment.api;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.acme.investment.api.dto.ClassConfigurationRequestDTO;
import org.acme.investment.api.dto.FundClassDTO;
import org.acme.investment.api.dto.FundGeneralInfoCreateDTO;
import org.acme.investment.domain.model.ClassStructureType;
import org.acme.investment.domain.model.EconomicIndex;
import org.acme.investment.domain.model.EsgCategory;
import org.acme.investment.domain.model.FundType;
import org.acme.investment.domain.model.MasterFundType;
import org.acme.investment.domain.model.TargetAudience;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
public class FundResourceTest {

    @Test
    public void testCreateValidGeneralInfoNonFeeder() {
        FundGeneralInfoCreateDTO dto = new FundGeneralInfoCreateDTO(
            "John Doe",
            "Department Alpha",
            LocalDate.now().plusDays(30),
            false,
            "Generic Fixed Income Fund",
            FundType.FIXED_INCOME,
            null,
            null,
            null,
            null
        );

        given()
            .contentType(ContentType.JSON)
            .body(dto)
            .when()
            .post("/funds/general-info")
            .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("name", equalTo("Generic Fixed Income Fund"))
            .body("fundType", equalTo("FIXED_INCOME"));
    }

    @Test
    public void testCreateValidGeneralInfoNoForecast() {
        FundGeneralInfoCreateDTO dto = new FundGeneralInfoCreateDTO(
            "Jane Doe",
            "Department Beta",
            null,
            true,
            "Generic Equity Fund",
            FundType.EQUITY,
            null,
            null,
            null,
            null
        );

        given()
            .contentType(ContentType.JSON)
            .body(dto)
            .when()
            .post("/funds/general-info")
            .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("noForecast", equalTo(true))
            .body("targetLaunchDate", nullValue());
    }

    @Test
    public void testValidationFailurePastDate() {
        FundGeneralInfoCreateDTO dto = new FundGeneralInfoCreateDTO(
            "John Doe",
            "Dept",
            LocalDate.now().minusDays(1),
            false,
            "Past Fund",
            FundType.FIXED_INCOME,
            null,
            null,
            null,
            null
        );

        given()
            .contentType(ContentType.JSON)
            .body(dto)
            .when()
            .post("/funds/general-info")
            .then()
            .statusCode(400);
    }

    @Test
    public void testCreateFeederWithExternalMaster() {
        FundGeneralInfoCreateDTO dto = new FundGeneralInfoCreateDTO(
            "John Doe",
            "Dept",
            LocalDate.now().plusDays(10),
            false,
            "Feeder Fund A",
            FundType.FEEDER_FUND,
            MasterFundType.EXTERNAL_MASTER,
            null,
            "External Master Fund LP",
            null
        );

        given()
            .contentType(ContentType.JSON)
            .body(dto)
            .when()
            .post("/funds/general-info")
            .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("mirrorFund", equalTo(false));
    }

    @Test
    public void testCreateFeederWithInternalMasterSuccess() {
        FundGeneralInfoCreateDTO masterDto = new FundGeneralInfoCreateDTO(
            "Manager",
            "HQ",
            LocalDate.now().plusDays(30),
            false,
            "Master Fund Alpha",
            FundType.MULTIMARKET,
            null,
            null,
            null,
            null
        );

        int masterId = given()
            .contentType(ContentType.JSON)
            .body(masterDto)
            .when()
            .post("/funds/general-info")
            .then()
            .statusCode(201)
            .extract()
            .path("id");

        FundGeneralInfoCreateDTO feederDto = new FundGeneralInfoCreateDTO(
            "John Doe",
            "Dept",
            LocalDate.now().plusDays(10),
            false,
            "Feeder Fund D",
            FundType.FEEDER_FUND,
            MasterFundType.INTERNAL_MASTER,
            (long) masterId,
            null,
            null
        );

        given()
            .contentType(ContentType.JSON)
            .body(feederDto)
            .when()
            .post("/funds/general-info")
            .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("masterFundId", equalTo(masterId))
            .body("mirrorFund", equalTo(true));
    }

    @Test
    public void testDepartmentSearchValid() {
        given()
            .queryParam("query", "acc")
            .when()
            .get("/departments/search")
            .then()
            .statusCode(200)
            .body("size()", greaterThan(0))
            .body("[0].code", equalTo("D01"))
            .body("[0].name", containsString("acc"));
    }

    @Test
    public void testDepartmentSearchShortQuery() {
        given()
            .queryParam("query", "ac")
            .when()
            .get("/departments/search")
            .then()
            .statusCode(400)
            .body("message", equalTo("Search query must be at least 3 characters long"));
    }

    @Test
    public void testDepartmentSearchServiceFailure() {
        given()
            .queryParam("query", "error")
            .when()
            .get("/departments/search")
            .then()
            .statusCode(503)
            .body("message", containsString("Failed to fetch departments from external API"));
    }

    // --- CLASS CONFIGURATION MODULE TESTS ---

    @Test
    public void testConfigureClassesSingleClassSuccess() {
        // First create a fund
        FundGeneralInfoCreateDTO fundDto = new FundGeneralInfoCreateDTO(
            "John Doe", "Dept", LocalDate.now().plusDays(10), false,
            "Fund Single Class Test", FundType.EQUITY, null, null, null, null
        );
        int fundId = given()
            .contentType(ContentType.JSON)
            .body(fundDto)
            .post("/funds/general-info")
            .then()
            .statusCode(201)
            .extract().path("id");

        // Now configure its classes
        FundClassDTO classDto = new FundClassDTO(
            "Class A Shares",
            new BigDecimal("0.8500"),
            false,
            null,
            null,
            EsgCategory.ESG_INTEGRATION,
            TargetAudience.GENERAL
        );

        ClassConfigurationRequestDTO configDto = new ClassConfigurationRequestDTO(
            ClassStructureType.SINGLE_CLASS,
            List.of(classDto)
        );

        given()
            .contentType(ContentType.JSON)
            .body(configDto)
            .when()
            .post("/funds/" + fundId + "/class-configuration")
            .then()
            .statusCode(200)
            .body("classStructureType", equalTo("SINGLE_CLASS"))
            .body("classes", hasSize(1))
            .body("classes[0].name", equalTo("Class A Shares"))
            .body("classes[0].maxCustodyFee", equalTo(0.85f))
            .body("classes[0].hasMinimumRemuneration", equalTo(false))
            .body("classes[0].esgCategory", equalTo("ESG_INTEGRATION"))
            .body("classes[0].targetAudience", equalTo("GENERAL"));
    }

    @Test
    public void testConfigureClassesMultiClassWithMinimumRemunerationSuccess() {
        FundGeneralInfoCreateDTO fundDto = new FundGeneralInfoCreateDTO(
            "John Doe", "Dept", LocalDate.now().plusDays(10), false,
            "Fund Multi Class Test", FundType.MULTIMARKET, null, null, null, null
        );
        int fundId = given()
            .contentType(ContentType.JSON)
            .body(fundDto)
            .post("/funds/general-info")
            .then()
            .statusCode(201)
            .extract().path("id");

        // Configure multiple classes (Class A with min fee and correction index, Class B without)
        FundClassDTO classA = new FundClassDTO(
            "Class Retail",
            new BigDecimal("1.2500"),
            true,
            new BigDecimal("1500.50"),
            EconomicIndex.IPCA,
            EsgCategory.NOT_APPLICABLE,
            TargetAudience.GENERAL
        );

        FundClassDTO classB = new FundClassDTO(
            "Class Institutional",
            new BigDecimal("0.5000"),
            false,
            null,
            null,
            EsgCategory.ESG_INVESTMENT,
            TargetAudience.PROFESSIONAL
        );

        ClassConfigurationRequestDTO configDto = new ClassConfigurationRequestDTO(
            ClassStructureType.MULTI_CLASS,
            List.of(classA, classB)
        );

        given()
            .contentType(ContentType.JSON)
            .body(configDto)
            .when()
            .post("/funds/" + fundId + "/class-configuration")
            .then()
            .statusCode(200)
            .body("classStructureType", equalTo("MULTI_CLASS"))
            .body("classes", hasSize(2))
            .body("classes[0].name", equalTo("Class Retail"))
            .body("classes[0].hasMinimumRemuneration", equalTo(true))
            .body("classes[0].minRemunerationAmount", equalTo(1500.5f))
            .body("classes[0].economicIndex", equalTo("IPCA"))
            .body("classes[1].name", equalTo("Class Institutional"))
            .body("classes[1].hasMinimumRemuneration", equalTo(false))
            .body("classes[1].minRemunerationAmount", nullValue())
            .body("classes[1].economicIndex", nullValue());

        // Test GET to retrieve same configuration
        given()
            .when()
            .get("/funds/" + fundId + "/class-configuration")
            .then()
            .statusCode(200)
            .body("classStructureType", equalTo("MULTI_CLASS"))
            .body("classes", hasSize(2));
    }

    @Test
    public void testConfigureClassesValidationSingleClassTooManyClasses() {
        FundGeneralInfoCreateDTO fundDto = new FundGeneralInfoCreateDTO(
            "John Doe", "Dept", LocalDate.now().plusDays(10), false,
            "Fund Fail Test 1", FundType.EQUITY, null, null, null, null
        );
        int fundId = given()
            .contentType(ContentType.JSON)
            .body(fundDto)
            .post("/funds/general-info")
            .then()
            .statusCode(201)
            .extract().path("id");

        // Two classes defined when SINGLE_CLASS structure type is selected
        FundClassDTO class1 = new FundClassDTO("C1", new BigDecimal("1.0000"), false, null, null, EsgCategory.NOT_APPLICABLE, TargetAudience.GENERAL);
        FundClassDTO class2 = new FundClassDTO("C2", new BigDecimal("1.0000"), false, null, null, EsgCategory.NOT_APPLICABLE, TargetAudience.GENERAL);

        ClassConfigurationRequestDTO configDto = new ClassConfigurationRequestDTO(
            ClassStructureType.SINGLE_CLASS,
            List.of(class1, class2)
        );

        given()
            .contentType(ContentType.JSON)
            .body(configDto)
            .when()
            .post("/funds/" + fundId + "/class-configuration")
            .then()
            .statusCode(400);
    }

    @Test
    public void testConfigureClassesValidationMultiClassTooManyClasses() {
        FundGeneralInfoCreateDTO fundDto = new FundGeneralInfoCreateDTO(
            "John Doe", "Dept", LocalDate.now().plusDays(10), false,
            "Fund Fail Test 2", FundType.EQUITY, null, null, null, null
        );
        int fundId = given()
            .contentType(ContentType.JSON)
            .body(fundDto)
            .post("/funds/general-info")
            .then()
            .statusCode(201)
            .extract().path("id");

        // Four classes defined when max is 3
        FundClassDTO c1 = new FundClassDTO("C1", new BigDecimal("1.0000"), false, null, null, EsgCategory.NOT_APPLICABLE, TargetAudience.GENERAL);
        FundClassDTO c2 = new FundClassDTO("C2", new BigDecimal("1.0000"), false, null, null, EsgCategory.NOT_APPLICABLE, TargetAudience.GENERAL);
        FundClassDTO c3 = new FundClassDTO("C3", new BigDecimal("1.0000"), false, null, null, EsgCategory.NOT_APPLICABLE, TargetAudience.GENERAL);
        FundClassDTO c4 = new FundClassDTO("C4", new BigDecimal("1.0000"), false, null, null, EsgCategory.NOT_APPLICABLE, TargetAudience.GENERAL);

        ClassConfigurationRequestDTO configDto = new ClassConfigurationRequestDTO(
            ClassStructureType.MULTI_CLASS,
            List.of(c1, c2, c3, c4)
        );

        given()
            .contentType(ContentType.JSON)
            .body(configDto)
            .when()
            .post("/funds/" + fundId + "/class-configuration")
            .then()
            .statusCode(400);
    }

    @Test
    public void testConfigureClassesValidationMinimumRemunerationConditionalFailure() {
        FundGeneralInfoCreateDTO fundDto = new FundGeneralInfoCreateDTO(
            "John Doe", "Dept", LocalDate.now().plusDays(10), false,
            "Fund Fail Test 3", FundType.EQUITY, null, null, null, null
        );
        int fundId = given()
            .contentType(ContentType.JSON)
            .body(fundDto)
            .post("/funds/general-info")
            .then()
            .statusCode(201)
            .extract().path("id");

        // Minimum remuneration enabled, but amount and index missing
        FundClassDTO classDto = new FundClassDTO(
            "Class A Shares",
            new BigDecimal("0.8500"),
            true, // enabled
            null, // missing
            null, // missing
            EsgCategory.ESG_INTEGRATION,
            TargetAudience.GENERAL
        );

        ClassConfigurationRequestDTO configDto = new ClassConfigurationRequestDTO(
            ClassStructureType.SINGLE_CLASS,
            List.of(classDto)
        );

        given()
            .contentType(ContentType.JSON)
            .body(configDto)
            .when()
            .post("/funds/" + fundId + "/class-configuration")
            .then()
            .statusCode(400);
    }

    @Test
    public void testConfigureClassesValidationMaxCustodyFeeScaleFailure() {
        FundGeneralInfoCreateDTO fundDto = new FundGeneralInfoCreateDTO(
            "John Doe", "Dept", LocalDate.now().plusDays(10), false,
            "Fund Fail Test 4", FundType.EQUITY, null, null, null, null
        );
        int fundId = given()
            .contentType(ContentType.JSON)
            .body(fundDto)
            .post("/funds/general-info")
            .then()
            .statusCode(201)
            .extract().path("id");

        // maxCustodyFee has 5 decimal places (scale limit is 4)
        FundClassDTO classDto = new FundClassDTO(
            "Class A Shares",
            new BigDecimal("0.85001"), // invalid scale
            false,
            null,
            null,
            EsgCategory.ESG_INTEGRATION,
            TargetAudience.GENERAL
        );

        ClassConfigurationRequestDTO configDto = new ClassConfigurationRequestDTO(
            ClassStructureType.SINGLE_CLASS,
            List.of(classDto)
        );

        given()
            .contentType(ContentType.JSON)
            .body(configDto)
            .when()
            .post("/funds/" + fundId + "/class-configuration")
            .then()
            .statusCode(400);
    }

    @Test
    public void testConfigureClassesNotFound() {
        FundClassDTO classDto = new FundClassDTO("C1", new BigDecimal("1.0000"), false, null, null, EsgCategory.NOT_APPLICABLE, TargetAudience.GENERAL);
        ClassConfigurationRequestDTO configDto = new ClassConfigurationRequestDTO(ClassStructureType.SINGLE_CLASS, List.of(classDto));

        given()
            .contentType(ContentType.JSON)
            .body(configDto)
            .when()
            .post("/funds/999999/class-configuration")
            .then()
            .statusCode(404);
    }
}
