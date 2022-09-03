package com.yorosis.livetester;

import static org.junit.Assert.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.IOException;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.ParseException;

import javax.sql.DataSource;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.yorosis.livetester.entities.Batch;
import com.yorosis.livetester.entities.BatchTestcases;
import com.yorosis.livetester.entities.BatchTestcasesResult;
import com.yorosis.livetester.entities.ElementsConfiguration;
import com.yorosis.livetester.entities.Environment;
import com.yorosis.livetester.entities.Testcases;
import com.yorosis.livetester.exception.YorosisException;
import com.yorosis.livetester.grid.vo.PaginationVO;
import com.yorosis.livetester.grid.vo.TableData;
import com.yorosis.livetester.repo.BatchRepository;
import com.yorosis.livetester.repo.BatchTestcaseRepository;
import com.yorosis.livetester.repo.BatchTestcaseResultRepository;
import com.yorosis.livetester.repo.ElementConfigRepository;
import com.yorosis.livetester.repo.EnvironmentRepository;
import com.yorosis.livetester.repo.LookupDataRepository;
import com.yorosis.livetester.repo.TemplateRepository;
import com.yorosis.livetester.repo.TestcaseGroupsRepository;
import com.yorosis.livetester.repo.TestcasesRepository;
import com.yorosis.livetester.security.YorosisContext;
import com.yorosis.livetester.service.BatchTestcaseResultService;
import com.yorosis.livetester.service.EnvironmentService;
import com.yorosis.livetester.service.LookupDataService;
import com.yorosis.livetester.service.TemplateService;
import com.yorosis.livetester.service.TestGroupService;
import com.yorosis.livetester.vo.BatchTestcaseResultVO;
import com.yorosis.livetester.vo.BeneficiaryVO;
import com.yorosis.livetester.vo.ClaimHeaderVO;
import com.yorosis.livetester.vo.EnvironmentVO;
import com.yorosis.livetester.vo.LookupDataVO;
import com.yorosis.livetester.vo.ProviderVO;
import com.yorosis.livetester.vo.TestcaseGroupVO;
import com.yorosis.livetester.vo.TestcaseVO;

@SpringBootTest
@ActiveProfiles(profiles = { "default", "test" })
public class BatchTestcaseResultServiceTest extends AbstractBaseTest {

	@Autowired
	private BatchTestcaseResultService batchTestcaseResultService;

	@Autowired
	private BatchTestcaseRepository batchTestcaseRepository;

	@Autowired
	private BatchTestcaseResultRepository batchTestcaseResultRepository;

	@Autowired
	private EnvironmentService environmentService;

	@Autowired
	private EnvironmentRepository environmentRepository;

	@Autowired
	private BatchRepository batchRepository;

	@Autowired
	private TemplateService templateService;

	@Autowired
	private TestGroupService testGroupService;

	@Autowired
	private TemplateRepository templateRepository;

	@Autowired
	private TestcasesRepository claimRepository;

	@Autowired
	private ElementConfigRepository elementConfigRepository;

	@Autowired
	private TestcaseGroupsRepository testcaseGroupsRepository;

	@Autowired
	private LookupDataService lookupDataService;

	@Autowired
	private LookupDataRepository lookupDataRepository;

	@Autowired
	private DataSource datasource;

	private TestcaseGroupVO getTestGroups() {
		return TestcaseGroupVO.builder().testcaseGroupName("Integration Test").description("Integration Test - Desc").build();
	}

	private LookupDataVO getLookupDataVO(Long id) {
		return LookupDataVO.builder().id(id).type("Form Type").code("Test").description("Test - Description").build();
	}

	private TestcaseVO getClaimVO(Long id) {

		BeneficiaryVO beneficiaryVO = BeneficiaryVO.builder().identifier("BI").firstName("First").lastName("last").build();
		ProviderVO providerVO = ProviderVO.builder().npi("npi").taxonomy("tax").build();
		ClaimHeaderVO claimHeaderVO = ClaimHeaderVO.builder().fromDate("2019-02-13").toDate("2019-05-03").frequency("Frequency").source("Source").billedAmount(3.00)
				.billedUnits(4.00).build();

		return TestcaseVO.builder().templateId(id).templateName("first").claimReceiver("receiver").claimSubmitters("submitter").formType(getLookupDataVO(1L).getCode())
				.beneficiary(beneficiaryVO).billing(providerVO).servicing(providerVO).claimHeader(claimHeaderVO).build();
	}

	private Timestamp getTimeStamp() {
		return new Timestamp(System.currentTimeMillis());
	}

	private EnvironmentVO getEnvironmentVO() {
		return EnvironmentVO.builder().environmentName("test").protocol("test").host("test").port("test").logonType("test").userName("test").password("test").pemText("test")
				.dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test").schemaName("test").build();
	}

	private Environment getEnvironment(Long id) {
		return Environment.builder().id(id).environmentName("test").protocol("test").host("test").port("test").logonType("test").username("test").password("test").pemText("test")
				.dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test").schemeName("test").build();
	}

	private Batch getBatch(Long id) {
		return Batch.builder().id(id).batchName("Batch Test").environment(getEnvironment(1L)).totalTestcases(5L).status("submitted").startTime(getTimeStamp())
				.endTime(getTimeStamp()).passPercentage(4L).failPercentage(1L).id(1L).build();
	}

	private ElementsConfiguration getElementsConfiguration(Long id) {
		return ElementsConfiguration.builder().id(id).elementLabel("test").fieldName("test").fieldType("test").isMandatory("test").applicableAt("test").build();
	}

	@AfterEach
	public void deleteBatchTestcaseResult() throws SQLException {
		batchTestcaseResultRepository.deleteAll();
		elementConfigRepository.deleteAll();
		batchTestcaseRepository.deleteAll();
		batchRepository.deleteAll();
		environmentRepository.deleteAll();
		claimRepository.deleteAll();
		testcaseGroupsRepository.deleteAll();
		templateRepository.deleteAll();
		lookupDataRepository.deleteAll();
		clearSequences();
	}

	@Test
	public void testBatchTestcaseData() throws YorosisException, IOException {
		YorosisContext.set(new YorosisContext("test", true));

		lookupDataService.saveLookupData(getLookupDataVO(null));
		templateService.saveTemplate(getClaimVO(0L));
		testGroupService.saveTestGroup(getTestGroups());

		String json = "{\"templateId\":1,\"claimId\":null,\"templateName\":\"Inpatient Template - 1\",\"claimTestcaseName\":null,\"claimSubmitters\":\"S1\",\"claimReceiver\":\"R2\",\"claimType\":\"I\",\"beneficiary\":{\"identifier\":\"bid\",\"firstName\":\"bfname\",\"lastName\":\"blname\",\"dob\":\"2019-06-02T04:00:00.000Z\",\"gender\":\"Male\",\"address\":{\"address\":\"address1\",\"city\":\"city\",\"state\":\"st\",\"zipcode\":\"20871\"}},\"billing\":{\"npi\":\"bnpi\",\"taxonomy\":\"btax\",\"firstName\":\"bfname\",\"lastName\":\"blname\",\"organizationName\":\"borgname\",\"taxId\":\"83873373\",\"type\":\"I\",\"address\":{\"address\":\"bpstreet1\",\"city\":\"bcity\",\"state\":\"cs\",\"zipcode\":\"38273\"}},\"servicing\":{\"npi\":\"snpi\",\"taxonomy\":\"stax\",\"firstName\":\"sfname\",\"lastName\":\"slame\",\"organizationName\":\"lorg\",\"taxId\":\"23423234\",\"type\":\"I\",\"address\":{\"address\":\"spaddr\",\"city\":\"scity\",\"state\":\"sp\",\"zipcode\":\"38377\"}},\"payor\":{\"identifier\":\"387ysdn74o3\",\"name\":\"payorname\",\"address\":{\"address\":\"payoraddress\",\"city\":\"paycity\",\"state\":\"pa\",\"zipcode\":\"38462\"}},\"claimHeader\":{\"billedUnits\":10.0,\"billedAmount\":100.0,\"fromDate\":\"2019-06-06T04:00:00.000Z\",\"toDate\":\"2019-06-06T04:00:00.000Z\",\"frequency\":\"1\",\"source\":\"edi\",\"patientControlNo\":\"sadfkuhsd\",\"facilityType\":\"8\",\"serviceFacility\":\"sf\",\"primaryDiagnosis\":\"1000\",\"secondryDiagnosisList\":[\"2827\",\"3843\"],\"expectedResult\":{\"paidUnits\":5.0,\"paidAmount\":50.0,\"allowedUnits\":0.0,\"allowedAmount\":50.0,\"claimType\":\"I\",\"errorCodesList\":[]}},\"services\":[{\"claimServiceId\":null,\"fromDate\":\"2019-06-06T04:00:00.000Z\",\"toDate\":\"2019-06-06T04:00:00.000Z\",\"procedureCode\":\"\",\"revenueCode\":\"1000\",\"serviceFacility\":\"\",\"servicing\":{\"npi\":\"snpi\",\"taxonomy\":\"s1tax\",\"firstName\":\"\",\"lastName\":\"\",\"organizationName\":\"\",\"taxId\":null,\"type\":null,\"address\":null},\"billedAmount\":100.0,\"billedUnits\":10.0,\"diagnosisCode\":\"1000\",\"modifiersList\":[],\"expectedResults\":{\"paidUnits\":5.0,\"paidAmount\":50.0,\"allowedUnits\":5.0,\"allowedAmount\":50.0,\"errorCodesList\":[]}}]}";

		claimRepository.save(
				Testcases.builder().id(2L).formType(lookupDataRepository.getOne(1L)).testcaseName("Claim Test").jsonData(json).template(templateRepository.getOne(1L)).build());

		environmentService.saveEnvironmentData(getEnvironmentVO());

		batchRepository.save(getBatch(0L));

		Testcases claimDetails = claimRepository.getOne(1L);

		BatchTestcases batchTestcases = BatchTestcases.builder().batch(getBatch(1L)).claims(claimDetails).status("submitted").build();
		batchTestcaseRepository.save(batchTestcases);

		elementConfigRepository.save(getElementsConfiguration(0L));

		BatchTestcases batchTestcase = batchTestcaseRepository.findById(1L);
		assertEquals("Batch Test", batchTestcase.getBatch().getBatchName());

	}

	@Test
	public void testGetBatchTestcaseResultData() throws YorosisException, IOException {

		YorosisContext.set(new YorosisContext("test", true));
		lookupDataService.saveLookupData(getLookupDataVO(null));
		templateService.saveTemplate(getClaimVO(0L));
		testGroupService.saveTestGroup(getTestGroups());
		String json = "{\"templateId\":1,\"claimId\":null,\"templateName\":\"Inpatient Template - 1\",\"claimTestcaseName\":null,\"claimSubmitters\":\"S1\",\"claimReceiver\":\"R2\",\"claimType\":\"I\",\"beneficiary\":{\"identifier\":\"bid\",\"firstName\":\"bfname\",\"lastName\":\"blname\",\"dob\":\"2019-06-02T04:00:00.000Z\",\"gender\":\"Male\",\"address\":{\"address\":\"address1\",\"city\":\"city\",\"state\":\"st\",\"zipcode\":\"20871\"}},\"billing\":{\"npi\":\"bnpi\",\"taxonomy\":\"btax\",\"firstName\":\"bfname\",\"lastName\":\"blname\",\"organizationName\":\"borgname\",\"taxId\":\"83873373\",\"type\":\"I\",\"address\":{\"address\":\"bpstreet1\",\"city\":\"bcity\",\"state\":\"cs\",\"zipcode\":\"38273\"}},\"servicing\":{\"npi\":\"snpi\",\"taxonomy\":\"stax\",\"firstName\":\"sfname\",\"lastName\":\"slame\",\"organizationName\":\"lorg\",\"taxId\":\"23423234\",\"type\":\"I\",\"address\":{\"address\":\"spaddr\",\"city\":\"scity\",\"state\":\"sp\",\"zipcode\":\"38377\"}},\"payor\":{\"identifier\":\"387ysdn74o3\",\"name\":\"payorname\",\"address\":{\"address\":\"payoraddress\",\"city\":\"paycity\",\"state\":\"pa\",\"zipcode\":\"38462\"}},\"claimHeader\":{\"billedUnits\":10.0,\"billedAmount\":100.0,\"fromDate\":\"2019-06-06T04:00:00.000Z\",\"toDate\":\"2019-06-06T04:00:00.000Z\",\"frequency\":\"1\",\"source\":\"edi\",\"patientControlNo\":\"sadfkuhsd\",\"facilityType\":\"8\",\"serviceFacility\":\"sf\",\"primaryDiagnosis\":\"1000\",\"secondryDiagnosisList\":[\"2827\",\"3843\"],\"expectedResult\":{\"paidUnits\":5.0,\"paidAmount\":50.0,\"allowedUnits\":0.0,\"allowedAmount\":50.0,\"claimType\":\"I\",\"errorCodesList\":[]}},\"services\":[{\"claimServiceId\":null,\"fromDate\":\"2019-06-06T04:00:00.000Z\",\"toDate\":\"2019-06-06T04:00:00.000Z\",\"procedureCode\":\"\",\"revenueCode\":\"1000\",\"serviceFacility\":\"\",\"servicing\":{\"npi\":\"snpi\",\"taxonomy\":\"s1tax\",\"firstName\":\"\",\"lastName\":\"\",\"organizationName\":\"\",\"taxId\":null,\"type\":null,\"address\":null},\"billedAmount\":100.0,\"billedUnits\":10.0,\"diagnosisCode\":\"1000\",\"modifiersList\":[],\"expectedResults\":{\"paidUnits\":5.0,\"paidAmount\":50.0,\"allowedUnits\":5.0,\"allowedAmount\":50.0,\"errorCodesList\":[]}}]}";

		claimRepository.save(
				Testcases.builder().id(2L).formType(lookupDataRepository.getOne(1L)).testcaseName("Claim Test").jsonData(json).template(templateRepository.getOne(1L)).build());

		environmentService.saveEnvironmentData(getEnvironmentVO());
		Environment environment = environmentRepository.getOne(1L);

		Batch batch = Batch.builder().batchName("Batch Test").environment(environment).totalTestcases(5L).status("submitted").startTime(getTimeStamp()).endTime(getTimeStamp())
				.passPercentage(4L).failPercentage(1L).id(1L).build();
		batchRepository.save(batch);

		Testcases claimDetails = claimRepository.getOne(1L);

		BatchTestcases batchTestcases = BatchTestcases.builder().batch(batch).claims(claimDetails).status("submitted").build();
		batchTestcaseRepository.save(batchTestcases);

		ElementsConfiguration saveElementConfigDetails = ElementsConfiguration.builder().elementLabel("test").fieldName("test").fieldType("test").isMandatory("test")
				.applicableAt("test").build();

		elementConfigRepository.save(saveElementConfigDetails);
		BatchTestcasesResult batchTestcasesResult = BatchTestcasesResult.builder().batchTestcases(batchTestcases).elementsConfiguration(getElementsConfiguration(1L))
				.actualValue("Pass").expectedValue("Pass").status("completed").build();
		batchTestcaseResultRepository.save(batchTestcasesResult);

		BatchTestcasesResult saveBatchTestcaseResult = batchTestcaseResultRepository.save(batchTestcasesResult);
		assertNotNull(saveBatchTestcaseResult);
		assertEquals("Pass", batchTestcasesResult.getActualValue());

		BatchTestcaseResultVO batchTestcaseResultData = batchTestcaseResultService.getBatchTestcaseResultData(1L);
		assertEquals("Batch Test", batchTestcaseResultData.getBatchName());

	}

	private PaginationVO getPagination() {
		return PaginationVO.builder().gridId("batch-testcase-result").columnName("status").index(0).size(10).id(Long.toString(1)).direction("asc").build();
	}

	@Test
	public void testGetGridData() throws ParseException, IOException, YorosisException {

		YorosisContext.set(new YorosisContext("test", true));
		lookupDataService.saveLookupData(getLookupDataVO(null));
		templateService.saveTemplate(getClaimVO(0L));
		testGroupService.saveTestGroup(getTestGroups());
		String json = "{\"templateId\":1,\"claimId\":null,\"templateName\":\"Inpatient Template - 1\",\"claimTestcaseName\":null,\"claimSubmitters\":\"S1\",\"claimReceiver\":\"R2\",\"claimType\":\"I\",\"beneficiary\":{\"identifier\":\"bid\",\"firstName\":\"bfname\",\"lastName\":\"blname\",\"dob\":\"2019-06-02T04:00:00.000Z\",\"gender\":\"Male\",\"address\":{\"address\":\"address1\",\"city\":\"city\",\"state\":\"st\",\"zipcode\":\"20871\"}},\"billing\":{\"npi\":\"bnpi\",\"taxonomy\":\"btax\",\"firstName\":\"bfname\",\"lastName\":\"blname\",\"organizationName\":\"borgname\",\"taxId\":\"83873373\",\"type\":\"I\",\"address\":{\"address\":\"bpstreet1\",\"city\":\"bcity\",\"state\":\"cs\",\"zipcode\":\"38273\"}},\"servicing\":{\"npi\":\"snpi\",\"taxonomy\":\"stax\",\"firstName\":\"sfname\",\"lastName\":\"slame\",\"organizationName\":\"lorg\",\"taxId\":\"23423234\",\"type\":\"I\",\"address\":{\"address\":\"spaddr\",\"city\":\"scity\",\"state\":\"sp\",\"zipcode\":\"38377\"}},\"payor\":{\"identifier\":\"387ysdn74o3\",\"name\":\"payorname\",\"address\":{\"address\":\"payoraddress\",\"city\":\"paycity\",\"state\":\"pa\",\"zipcode\":\"38462\"}},\"claimHeader\":{\"billedUnits\":10.0,\"billedAmount\":100.0,\"fromDate\":\"2019-06-06T04:00:00.000Z\",\"toDate\":\"2019-06-06T04:00:00.000Z\",\"frequency\":\"1\",\"source\":\"edi\",\"patientControlNo\":\"sadfkuhsd\",\"facilityType\":\"8\",\"serviceFacility\":\"sf\",\"primaryDiagnosis\":\"1000\",\"secondryDiagnosisList\":[\"2827\",\"3843\"],\"expectedResult\":{\"paidUnits\":5.0,\"paidAmount\":50.0,\"allowedUnits\":0.0,\"allowedAmount\":50.0,\"claimType\":\"I\",\"errorCodesList\":[]}},\"services\":[{\"claimServiceId\":null,\"fromDate\":\"2019-06-06T04:00:00.000Z\",\"toDate\":\"2019-06-06T04:00:00.000Z\",\"procedureCode\":\"\",\"revenueCode\":\"1000\",\"serviceFacility\":\"\",\"servicing\":{\"npi\":\"snpi\",\"taxonomy\":\"s1tax\",\"firstName\":\"\",\"lastName\":\"\",\"organizationName\":\"\",\"taxId\":null,\"type\":null,\"address\":null},\"billedAmount\":100.0,\"billedUnits\":10.0,\"diagnosisCode\":\"1000\",\"modifiersList\":[],\"expectedResults\":{\"paidUnits\":5.0,\"paidAmount\":50.0,\"allowedUnits\":5.0,\"allowedAmount\":50.0,\"errorCodesList\":[]}}]}";

		claimRepository.save(
				Testcases.builder().id(2L).formType(lookupDataRepository.getOne(1L)).testcaseName("Claim Test").jsonData(json).template(templateRepository.getOne(1L)).build());

		environmentService.saveEnvironmentData(getEnvironmentVO());
		batchRepository.save(getBatch(0L));

		Testcases claimDetails = claimRepository.getOne(1L);

		BatchTestcases batchTestcases = BatchTestcases.builder().batch(getBatch(1L)).claims(claimDetails).status("submitted").claimID(1L).build();
		batchTestcaseRepository.save(batchTestcases);

		elementConfigRepository.save(getElementsConfiguration(0L));

		BatchTestcasesResult batchTestcasesResult = BatchTestcasesResult.builder().batchTestcases(batchTestcases).elementsConfiguration(getElementsConfiguration(1L))
				.actualValue("Pass").expectedValue("Pass").status("completed").build();

		batchTestcaseResultRepository.save(batchTestcasesResult);
		TableData gridData = batchTestcaseResultService.getGridData(getPagination());
		assertNotNull(gridData);
		assertEquals("1", gridData.getTotalRecords());
	}

	@Override
	protected DataSource getDatasource() {
		return datasource;
	}

}
