package com.yorosis.livetester;

import static org.junit.Assert.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.IOException;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;

import javax.sql.DataSource;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.livetester.entities.Batch;
import com.yorosis.livetester.entities.BatchTestcases;
import com.yorosis.livetester.entities.BatchTestcasesResult;
import com.yorosis.livetester.entities.ElementsConfiguration;
import com.yorosis.livetester.entities.Environment;
import com.yorosis.livetester.entities.Template;
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
import com.yorosis.livetester.service.BatchTestCaseService;
import com.yorosis.livetester.service.EnvironmentService;
import com.yorosis.livetester.service.LookupDataService;
import com.yorosis.livetester.service.TemplateService;
import com.yorosis.livetester.service.TestGroupService;
import com.yorosis.livetester.service.TestcasesService;
import com.yorosis.livetester.vo.BeneficiaryVO;
import com.yorosis.livetester.vo.ClaimHeaderVO;
import com.yorosis.livetester.vo.ClaimServiceVO;
import com.yorosis.livetester.vo.EnvironmentVO;
import com.yorosis.livetester.vo.LookupDataVO;
import com.yorosis.livetester.vo.ProviderVO;
import com.yorosis.livetester.vo.RequeryResultVO;
import com.yorosis.livetester.vo.ResponseVO;
import com.yorosis.livetester.vo.TestcaseGroupVO;
import com.yorosis.livetester.vo.TestcaseVO;
import com.yorosis.livetester.vo.TestcaseWrapperVO;

@SpringBootTest
@ActiveProfiles(profiles = { "default", "test" })
public class BatchTestCaseServiceTest extends AbstractBaseTest {

	@Autowired
	private BatchTestCaseService batchTestCaseService;

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
	private TestcasesService claimsService;

	@Autowired
	private TemplateRepository templateRepository;

	@Autowired
	private TestcasesRepository claimRepository;

	@Autowired
	private BatchTestcaseRepository batchTestcaseRepository;

	@Autowired
	private TestcaseGroupsRepository testcaseGroupsRepository;

	@Autowired
	private DataSource datasource;

	@Autowired
	private LookupDataService lookupDataService;

	@Autowired
	private LookupDataRepository lookupDataRepository;

	@Autowired
	private BatchTestcaseResultRepository batchTestcaseResultRepository;
	
	
	@Autowired
	private ElementConfigRepository elementConfigRepository;
	
	private Timestamp getTimeStamp() {
		return new Timestamp(System.currentTimeMillis());
	}

	private TestcaseGroupVO getTestGroups() {
		return TestcaseGroupVO.builder().testcaseGroupName("Integration Test").description("Integration Test - Desc").build();
	}

	private LookupDataVO getLookupDataVO(Long id) {
		return LookupDataVO.builder().id(id).type("Form Type").code("first").description("description").build();
	}

	private TestcaseVO getClaimVO(Long id) throws IOException {

		String json = "{ \"f1\" : \"v1\" } ";

		ObjectMapper objectMapper = new ObjectMapper();

		JsonNode jsonNode = objectMapper.readTree(json);

		BeneficiaryVO beneficiaryVO = BeneficiaryVO.builder().identifier("BI").firstName("First").lastName("last").build();
		ProviderVO providerVO = ProviderVO.builder().npi("npi").taxonomy("tax").build();
		ClaimHeaderVO claimHeaderVO = ClaimHeaderVO.builder().fromDate("2019-02-13").toDate("2019-05-03").frequency("Frequency").source("Source").billedAmount(3.00)
				.billedUnits(4.00).expectedResult(jsonNode).expectedElements(json).build();
		ClaimServiceVO cliamServiceVO = ClaimServiceVO.builder().expectedElements(json).expectedResult(jsonNode).build();

		List<ClaimServiceVO> claimServiceList = new ArrayList<>();
		claimServiceList.add(cliamServiceVO);
		return TestcaseVO.builder().templateId(id).templateName("first").claimReceiver("receiver").claimSubmitters("submitter").formType(getLookupDataVO(1L).getCode())
				.beneficiary(beneficiaryVO).billing(providerVO).servicing(providerVO).claimHeader(claimHeaderVO).services(claimServiceList).build();
	}

	private TestcaseGroupVO[] getTestGroupsArray() {
		List<TestcaseGroupVO> listOfTestCaseGroups = testGroupService.getListOfTestCaseGroups();
		TestcaseGroupVO[] testGrouplist = new TestcaseGroupVO[listOfTestCaseGroups.size()];
		int i = 0;
		for (TestcaseGroupVO testgroupvo : listOfTestCaseGroups) {
			TestcaseGroupVO testGroupVO = TestcaseGroupVO.builder().id(testgroupvo.getId()).build();
			testGrouplist[i++] = testGroupVO;
		}

		return testGrouplist;
	}

	private Template getTemplateId(Long templateId) {
		return templateRepository.getOne(templateId);
	}

	private TestcaseWrapperVO getClaimEntityVO(Long claimId) throws IOException {

		return TestcaseWrapperVO.builder().id(claimId).testCaseName("Professional Claim").templateId(getTemplateId(1L).getId()).jsonData(getClaimVO(1L))
				.testcaseGroups(getTestGroupsArray()).build();
	}

	private EnvironmentVO getEnvironmentVO() {
		return EnvironmentVO.builder().environmentName("test").protocol("test").host("test").port("test").logonType("test").userName("test").password("test").pemText("test")
				.dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test").schemaName("test").build();
	}
	
	private ElementsConfiguration getElementsConfiguration(Long id) {
		return ElementsConfiguration.builder().id(id).elementLabel("test").fieldName("test").fieldType("test").isMandatory("test").applicableAt("test").build();
	}

	@Test
	public void testSaveBatchTestCase() throws YorosisException, IOException {
		YorosisContext.set(new YorosisContext("test", true));
		lookupDataService.saveLookupData(getLookupDataVO(null));
		templateService.saveTemplate(getClaimVO(0L));

		testGroupService.saveTestGroup(getTestGroups());
		claimsService.saveTestcase(getClaimEntityVO(0L));

		environmentService.saveEnvironmentData(getEnvironmentVO());
		Environment environment = environmentRepository.getOne(1L);

		Batch batch = Batch.builder().batchName("Batch Test").environment(environment).totalTestcases(5L).status("submitted").startTime(getTimeStamp()).endTime(getTimeStamp())
				.passPercentage(4L).failPercentage(1L).id(1L).build();
		batchRepository.save(batch);

		Testcases claimDetails = claimRepository.getOne(1L);

		BatchTestcases batchTestcases = BatchTestcases.builder().batch(batch).claims(claimDetails).status("submitted").build();
		batchTestcaseRepository.save(batchTestcases);

	}

	private PaginationVO getPagination() {
		return PaginationVO.builder().gridId("batchtestcases").columnName("status").index(0).size(10).direction("asc").id("Batch Test").build();
	}

	@AfterEach
	public void clearDataBatchTestCaseService() throws SQLException {
		batchRepository.deleteAll();
		batchTestcaseRepository.deleteAll();
		environmentRepository.deleteAll();
		elementConfigRepository.deleteAll();
		claimRepository.deleteAll();
		testcaseGroupsRepository.deleteAll();
		templateRepository.deleteAll();
		lookupDataRepository.deleteAll();
		clearSequences();
	}

	@Test
	public void testGetGridData() throws IOException, YorosisException, ParseException {

		YorosisContext.set(new YorosisContext("test", true));

		lookupDataService.saveLookupData(getLookupDataVO(null));
		templateService.saveTemplate(getClaimVO(0L));
		testGroupService.saveTestGroup(getTestGroups());
		claimsService.saveTestcase(getClaimEntityVO(0L));

		environmentService.saveEnvironmentData(getEnvironmentVO());
		Environment environment = environmentRepository.getOne(1L);

		Batch batch = Batch.builder().batchName("Batch Test").environment(environment).totalTestcases(5L).status("submitted").startTime(getTimeStamp()).endTime(getTimeStamp())
				.passPercentage(4L).failPercentage(1L).id(1L).build();
		batchRepository.save(batch);

		Testcases claimDetails = claimRepository.getOne(1L);

		BatchTestcases batchTestcases = BatchTestcases.builder().batch(batch).claims(claimDetails).status("submitted").build();
		batchTestcaseRepository.save(batchTestcases);
		TableData gridData = batchTestCaseService.getGridData(getPagination());
		assertNotNull(gridData);
		assertEquals("1", gridData.getTotalRecords());
	}

	@Test
	public void testRequeryResult() throws YorosisException, IOException {

		YorosisContext.set(new YorosisContext("test", true));

		lookupDataService.saveLookupData(getLookupDataVO(null));
		templateService.saveTemplate(getClaimVO(0L));
		testGroupService.saveTestGroup(getTestGroups());
		claimsService.saveTestcase(getClaimEntityVO(0L));

		environmentService.saveEnvironmentData(getEnvironmentVO());
		Environment environment = environmentRepository.getOne(1L);

		ElementsConfiguration saveElementConfigDetails = ElementsConfiguration.builder().elementLabel("test").fieldName("test").fieldType("test").isMandatory("test")
				.applicableAt("test").build();

		elementConfigRepository.save(saveElementConfigDetails);
		
		Testcases claimDetails = claimRepository.getOne(1L);

		
		Batch batch = Batch.builder().batchName("Batch Test").environment(environment).totalTestcases(5L).status("submitted").startTime(getTimeStamp()).endTime(getTimeStamp())
				.passPercentage(4L).failPercentage(1L).id(1L).build();
		batchRepository.save(batch);
		
		BatchTestcases batchTestcases = BatchTestcases.builder().batch(batch).claims(claimDetails).status("submitted").build();
		batchTestcaseRepository.save(batchTestcases);
		
		
		BatchTestcasesResult batchTestcasesResult = BatchTestcasesResult.builder().batchTestcases(batchTestcases).elementsConfiguration(getElementsConfiguration(1L))
				.actualValue("Pass").expectedValue("Pass").status("completed").build();
		batchTestcaseResultRepository.save(batchTestcasesResult);
		
		BatchTestcasesResult batchTestcasesResultData = batchTestcaseResultRepository.getOne(1L);

		Long[] batchTestcaseId = new Long[1];
		batchTestcaseId[0] = batchTestcasesResultData.getId();

		RequeryResultVO requeryResultVO = RequeryResultVO.builder().batchId("Batch Test").batchTestcaseId(batchTestcaseId).build();

		ResponseVO requeryResult = batchTestCaseService.requeryResult(requeryResultVO);
		assertEquals("Requery Result - Updated", requeryResult.getResponse());

	}

	@Override
	protected DataSource getDatasource() {
		return datasource;
	}

}
