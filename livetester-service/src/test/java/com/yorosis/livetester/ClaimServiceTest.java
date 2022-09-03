package com.yorosis.livetester;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.io.IOException;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.sql.DataSource;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.yorosis.livetester.entities.Batch;
import com.yorosis.livetester.entities.BatchTestcases;
import com.yorosis.livetester.entities.Environment;
import com.yorosis.livetester.entities.Template;
import com.yorosis.livetester.entities.Testcases;
import com.yorosis.livetester.entities.UserRole;
import com.yorosis.livetester.entities.Users;
import com.yorosis.livetester.exception.YorosisException;
import com.yorosis.livetester.grid.vo.PaginationVO;
import com.yorosis.livetester.grid.vo.TableData;
import com.yorosis.livetester.repo.BatchRepository;
import com.yorosis.livetester.repo.BatchTestcaseRepository;
import com.yorosis.livetester.repo.EnvironmentRepository;
import com.yorosis.livetester.repo.LookupDataRepository;
import com.yorosis.livetester.repo.RoleRepository;
import com.yorosis.livetester.repo.TemplateRepository;
import com.yorosis.livetester.repo.TestcaseGroupsRepository;
import com.yorosis.livetester.repo.TestcasesRepository;
import com.yorosis.livetester.repo.UsersRepository;
import com.yorosis.livetester.security.YorosisContext;
import com.yorosis.livetester.service.EnvironmentService;
import com.yorosis.livetester.service.LookupDataService;
import com.yorosis.livetester.service.TemplateService;
import com.yorosis.livetester.service.TestGroupService;
import com.yorosis.livetester.service.TestcasesService;
import com.yorosis.livetester.vo.BeneficiaryVO;
import com.yorosis.livetester.vo.ClaimHeaderVO;
import com.yorosis.livetester.vo.DuplicateTestcaseVO;
import com.yorosis.livetester.vo.EnvironmentVO;
import com.yorosis.livetester.vo.LookupDataVO;
import com.yorosis.livetester.vo.ProviderVO;
import com.yorosis.livetester.vo.ResponseVO;
import com.yorosis.livetester.vo.TestcaseGroupVO;
import com.yorosis.livetester.vo.TestcaseVO;
import com.yorosis.livetester.vo.TestcaseWrapperVO;

@SpringBootTest
@ActiveProfiles(profiles = { "default", "test" })
public class ClaimServiceTest extends AbstractBaseTest {

	@Autowired
	private TestcasesService claimsService;

	@Autowired
	private TestGroupService testGroupService;

	@Autowired
	private TemplateRepository templateRepository;

	@Autowired
	private TemplateService templateService;

	@Autowired
	private BatchRepository batchRepository;

	@Autowired
	private EnvironmentService environmentService;

	@Autowired
	private EnvironmentRepository environmentRepository;

	@Autowired
	private BatchTestcaseRepository batchTestcaseRepository;

	@Autowired
	private TestcasesRepository claimRepository;

	@Autowired
	private TestcaseGroupsRepository testcaseGroupsRepository;

	@Autowired
	private DataSource datasource;

	@Autowired
	private LookupDataService lookupDataService;

	@Autowired
	private LookupDataRepository lookupDataRepository;

	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private RoleRepository roleRepository;

	private TestcaseGroupVO getTestGroups() {
		return TestcaseGroupVO.builder().testcaseGroupName("Integration Test").description("Integration Test - Desc").build();
	}

	private PaginationVO getPaginationVOObject(String gridId) {
		return PaginationVO.builder().gridId(gridId).columnName("type").index(0).direction("asc").build();
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

	private LookupDataVO getLookupDataVO(Long lookupId) {
		return LookupDataVO.builder().id(lookupId).type("Receiver").code("Dental").description("Receiver - Description").build();
	}

	private TestcaseVO getClaimVO(Long id) {

		BeneficiaryVO beneficiaryVO = BeneficiaryVO.builder().identifier("BI").firstName("First").lastName("last").build();
		ProviderVO providerVO = ProviderVO.builder().npi("npi").taxonomy("tax").build();
		ClaimHeaderVO claimHeaderVO = ClaimHeaderVO.builder().fromDate("2019-02-13").toDate("2019-05-03").frequency("Frequency").source("Source").billedAmount(3.00)
				.billedUnits(4.00).build();

		return TestcaseVO.builder().templateId(id).templateName("first").claimReceiver("receiver").claimSubmitters("submitter").formType(getLookupDataVO(1L).getCode())
				.beneficiary(beneficiaryVO).billing(providerVO).servicing(providerVO).claimHeader(claimHeaderVO).build();
	}

	private Template getTemplateId(Long templateId) {
		return templateRepository.getOne(templateId);
	}

	private TestcaseWrapperVO getClaimEntityVO(Long claimId) {

		return TestcaseWrapperVO.builder().id(claimId).testCaseName("Professional Claim").templateId(getTemplateId(1L).getId()).jsonData(getClaimVO(1L))
				.testcaseGroups(getTestGroupsArray()).build();
	}

	private Timestamp getTimeStamp() {
		return new Timestamp(System.currentTimeMillis());
	}

	private DuplicateTestcaseVO getDuplicateClaimVO() {
		return DuplicateTestcaseVO.builder().claimId(1L).testCaseName("Dental Claim").testcaseGroups(getTestGroupsArray()).build();
	}

	@AfterEach
	public void clearDataClaimService() throws SQLException {
		batchRepository.deleteAll();
		batchTestcaseRepository.deleteAll();
		environmentRepository.deleteAll();
		claimRepository.deleteAll();
		testcaseGroupsRepository.deleteAll();
		templateRepository.deleteAll();
		lookupDataRepository.deleteAll();
		userRepository.deleteAll();
		roleRepository.deleteAll();
		clearSequences();
	}

	@Test
	public void testSaveClaimDetails() throws IOException, YorosisException {
		YorosisContext.set(new YorosisContext("test", true));

		ResponseVO createLookupResponse = lookupDataService.saveLookupData(getLookupDataVO(0L));
		assertEquals("Lookup Data created successfully", createLookupResponse.getResponse());

		ResponseVO createResponse = templateService.saveTemplate(getClaimVO(0L));
		assertEquals("Template created successfully", createResponse.getResponse());

		TestcaseGroupVO testcaseGroupVO = getTestGroups();
		ResponseVO saveTestGroup = testGroupService.saveTestGroup(testcaseGroupVO);
		assertEquals("TestGroup created successfully", saveTestGroup.getResponse());

		TestcaseWrapperVO newClaimEntity = getClaimEntityVO(0L);
		ResponseVO newClaim = claimsService.saveTestcase(newClaimEntity);
		assertEquals("Testcase created successfully", newClaim.getResponse());
		assertEquals("Professional Claim", newClaimEntity.getTestCaseName());

	}

	@Test
	public void testExistClaim() throws IOException, YorosisException {
		YorosisContext.set(new YorosisContext("test", true));
		lookupDataService.saveLookupData(getLookupDataVO(0L));
		templateService.saveTemplate(getClaimVO(0L));
		TestcaseGroupVO testcaseGroupVO = getTestGroups();
		testGroupService.saveTestGroup(testcaseGroupVO);

		TestcaseWrapperVO newClaimEntity = getClaimEntityVO(0L);
		ResponseVO newClaim = claimsService.saveTestcase(newClaimEntity);
		assertEquals("Testcase created successfully", newClaim.getResponse());

		TestcaseWrapperVO existingClaimEntity = getClaimEntityVO(0L);
		ResponseVO existClaim = claimsService.saveTestcase(existingClaimEntity);
		assertEquals("Testcase name already exists", existClaim.getResponse());
	}

	@Test
	public void testUpdateClaimDetail() throws IOException, YorosisException {
		YorosisContext.set(new YorosisContext("test", true));

		lookupDataService.saveLookupData(getLookupDataVO(0L));
		templateService.saveTemplate(getClaimVO(0L));
		testGroupService.saveTestGroup(getTestGroups());
		claimsService.saveTestcase(getClaimEntityVO(0L));

		TestcaseWrapperVO updateClaimEntityVO = getClaimEntityVO(1L);
		TestcaseVO claimDetails = claimsService.getTestcaseDetails(1L);
		assertNotNull(claimDetails);
		assertEquals("First", claimDetails.getBeneficiary().getFirstName());

		TestcaseWrapperVO claimDetailsUpdate = claimsService.getTestcaseDetailsForUpdate(1L);
		assertNotNull(claimDetailsUpdate);
		assertEquals("Professional Claim", claimDetailsUpdate.getTestCaseName());

		ResponseVO updateClaim = claimsService.updateTestcase(updateClaimEntityVO);
		assertEquals("Testcase updated successfully", updateClaim.getResponse());
	}

	@Test
	public void testgetTestGroup() throws JsonProcessingException, YorosisException {
		YorosisContext.set(new YorosisContext("test", true));

		testGroupService.saveTestGroup(getTestGroups());
		List<TestcaseGroupVO> testGroup = claimsService.getTestGroup();
		assertNotNull(testGroup);
	}

	private PaginationVO getPagination() {
		return PaginationVO.builder().gridId("claims").columnName("testcaseName").index(0).size(10).direction("asc").build();
	}

	@Test
	public void testGridData() throws IOException, YorosisException {

		YorosisContext.set(new YorosisContext("test", true));
		Set<UserRole> emptSet = new HashSet<>();
		Users users = Users.builder().userName("test").userPassword("123").emailId("test@test.com").userRole(emptSet).globalSpecification("Y").build();
		userRepository.save(users);
		userRepository.save(Users.builder().userName("test123").userPassword("123").emailId("test12@test.com").userRole(emptSet).globalSpecification("N").build());

		lookupDataService.saveLookupData(getLookupDataVO(0L));
		templateService.saveTemplate(getClaimVO(0L));
		testGroupService.saveTestGroup(getTestGroups());
		claimsService.saveTestcase(getClaimEntityVO(0L));

		TableData gridData = claimsService.getGridData(getPagination());
		assertEquals("1", gridData.getTotalRecords());
		assertNotNull(gridData);

		YorosisContext.set(new YorosisContext("test", false));
		TableData gridDataForNonGlobalUsers = claimsService.getGridData(getPagination());
		assertEquals("1", gridDataForNonGlobalUsers.getTotalRecords());
		assertNotNull(gridDataForNonGlobalUsers);

		YorosisException invalidTableDataException = Assertions.assertThrows(YorosisException.class, () -> {
			claimsService.getGridData(getPaginationVOObject("test"));
		});
		Assertions.assertEquals("Invalid Grid Id", invalidTableDataException.getMessage());
	}

	@Test
	public void testDeleteClaimDetailWithoutBatch() throws IOException, YorosisException {

		YorosisContext.set(new YorosisContext("test", true));
		lookupDataService.saveLookupData(getLookupDataVO(0L));
		templateService.saveTemplate(getClaimVO(0L));
		testGroupService.saveTestGroup(getTestGroups());
		claimsService.saveTestcase(getClaimEntityVO(0L));

		ResponseVO deleteClaimDetails = claimsService.deleteTestcase(1L);
		assertEquals("Testcase deleted Successfully", deleteClaimDetails.getResponse());
	}

	@Test
	public void testDeleteClaimWithBatch() throws IOException, YorosisException {
		YorosisContext.set(new YorosisContext("test", true));
		lookupDataService.saveLookupData(getLookupDataVO(0L));
		templateService.saveTemplate(getClaimVO(0L));
		testGroupService.saveTestGroup(getTestGroups());
		claimsService.saveTestcase(getClaimEntityVO(0L));

		EnvironmentVO saveEnvironmentDetails = EnvironmentVO.builder().environmentName("test").protocol("test").host("test").port("test").logonType("test").userName("test")
				.password("test").pemText("test").dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test")
				.schemaName("test").build();

		environmentService.saveEnvironmentData(saveEnvironmentDetails);
		Environment environment = environmentRepository.getOne(1L);

		Batch batch = Batch.builder().batchName("Batch Test").environment(environment).totalTestcases(5L).status("submitted").startTime(getTimeStamp()).endTime(getTimeStamp())
				.passPercentage(4L).failPercentage(1L).id(1L).build();

		batchRepository.save(batch);

		Testcases claims = claimRepository.getOne(1L);

		BatchTestcases batchTestcases = BatchTestcases.builder().batch(batch).claims(claims).generatedEdi("TEST").status("submitted").build();
		batchTestcaseRepository.save(batchTestcases);

		ResponseVO deleteClaimDetails = claimsService.deleteTestcase(1L);
		assertEquals("Testcase Assoicate with Batch", deleteClaimDetails.getResponse());
	}

	@Test
	public void testSaveDuplicateClaim() throws YorosisException, IOException {

		YorosisContext.set(new YorosisContext("test", true));
		lookupDataService.saveLookupData(getLookupDataVO(0L));
		templateService.saveTemplate(getClaimVO(0L));
		testGroupService.saveTestGroup(getTestGroups());
		claimsService.saveTestcase(getClaimEntityVO(0L));

		ResponseVO saveDuplicateClaim = claimsService.saveDuplicateTestcase(getDuplicateClaimVO());
		assertEquals("Duplicate Testcase Created Successfully", saveDuplicateClaim.getResponse());

		ResponseVO saveDuplicateClaimExisting = claimsService.saveDuplicateTestcase(getDuplicateClaimVO());
		assertEquals("Testcase name already exists", saveDuplicateClaimExisting.getResponse());

	}

	@Override
	protected DataSource getDatasource() {
		return datasource;
	}

}
