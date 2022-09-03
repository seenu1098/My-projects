package com.yorosis.livetester;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import javax.sql.DataSource;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.yorosis.livetester.constants.Constants;
import com.yorosis.livetester.entities.ElementsConfiguration;
import com.yorosis.livetester.entities.Environment;
import com.yorosis.livetester.entities.EnvironmentPreset;
import com.yorosis.livetester.entities.EnvironmentSavedPreset;
import com.yorosis.livetester.entities.TestcaseCategories;
import com.yorosis.livetester.entities.Testcases;
import com.yorosis.livetester.exception.YorosisException;
import com.yorosis.livetester.repo.BatchRepository;
import com.yorosis.livetester.repo.BatchTestcaseRepository;
import com.yorosis.livetester.repo.ClaimsTestcaseGroupRepository;
import com.yorosis.livetester.repo.ElementConfigRepository;
import com.yorosis.livetester.repo.EnvironmentPresetRepository;
import com.yorosis.livetester.repo.EnvironmentRepository;
import com.yorosis.livetester.repo.EnvironmentSavedPresetRepository;
import com.yorosis.livetester.repo.LookupDataRepository;
import com.yorosis.livetester.repo.TemplateRepository;
import com.yorosis.livetester.repo.TestcaseGroupsRepository;
import com.yorosis.livetester.repo.TestcasesRepository;
import com.yorosis.livetester.security.YorosisContext;
import com.yorosis.livetester.service.EnvironmentService;
import com.yorosis.livetester.service.LookupDataService;
import com.yorosis.livetester.service.TemplateService;
import com.yorosis.livetester.service.TestGroupService;
import com.yorosis.livetester.vo.BeneficiaryVO;
import com.yorosis.livetester.vo.ClaimHeaderVO;
import com.yorosis.livetester.vo.ClaimServiceVO;
import com.yorosis.livetester.vo.EnvironmentPresetVO;
import com.yorosis.livetester.vo.EnvironmentVO;
import com.yorosis.livetester.vo.LookupDataVO;
import com.yorosis.livetester.vo.PayorVO;
import com.yorosis.livetester.vo.ProviderVO;
import com.yorosis.livetester.vo.ReplaceAndExecuteVO;
import com.yorosis.livetester.vo.ReplaceBeneficiaryVO;
import com.yorosis.livetester.vo.ReplacePAVO;
import com.yorosis.livetester.vo.ReplacePayorVO;
import com.yorosis.livetester.vo.ReplaceProviderVO;
import com.yorosis.livetester.vo.ReplacementOptionVO;
import com.yorosis.livetester.vo.ResponseVO;
import com.yorosis.livetester.vo.TestExecutionVO;
import com.yorosis.livetester.vo.TestGroupItemVO;
import com.yorosis.livetester.vo.TestcaseGroupVO;
import com.yorosis.livetester.vo.TestcaseVO;
import com.yorosis.livetester.vo.UniqueBeneficiaryVO;
import com.yorosis.livetester.vo.UniquePAVO;
import com.yorosis.livetester.vo.UniquePayorVO;
import com.yorosis.livetester.vo.UniqueProviderVO;

@SpringBootTest
@ActiveProfiles(profiles = { "default", "test" })
public class TestGroupServiceTest extends AbstractBaseTest {

	@Autowired
	private TestGroupService testGroupService;

	@Autowired
	private ClaimsTestcaseGroupRepository claimsTestcaseGroupRepo;

	@Autowired
	private TestcasesRepository claimRepo;

	@Autowired
	private TemplateRepository templateRepo;

	@Autowired
	private TestcaseGroupsRepository testGroupsRepo;

	@Autowired
	private BatchRepository batchRepository;

	@Autowired
	private TemplateService templateService;

	@Autowired
	private EnvironmentService environmentService;

	@Autowired
	private BatchTestcaseRepository batchTestcaseRepository;

	@Autowired
	private EnvironmentRepository environmentRepository;

	@Autowired
	private LookupDataRepository lookupDataRepository;

	@Autowired
	private DataSource datasource;

	@Autowired
	private LookupDataService lookupDataService;

	@Autowired
	private EnvironmentPresetRepository environmentPresetRepository;

	@Autowired
	private ElementConfigRepository elementConfigRepository;
	
	@Autowired
	private EnvironmentSavedPresetRepository environmentSavedPresetRepository;


	private LookupDataVO getLookupDataVO(Long lookupId) {
		return LookupDataVO.builder().id(lookupId).type("Form Type").code("Test").description("Test - Description").build();
	}

	private TestcaseGroupVO getTestGroupVO(Long id) {
		return TestcaseGroupVO.builder().id(id).testcaseGroupName("Integration Test").description("Integration Test - Desc").build();
	}

	private TestcaseVO getClaimvo(Long id) {
		BeneficiaryVO beneificaryVO = BeneficiaryVO.builder().identifier("test123").firstName("test").build();
		PayorVO payorVO = PayorVO.builder().identifier("test123").name("test").build();
		ProviderVO providerVO = ProviderVO.builder().npi("test").taxonomy("dg").build();

		List<ClaimServiceVO> listclaimService = new ArrayList<>();
		ClaimHeaderVO claimHeader = ClaimHeaderVO.builder().priorAuth1("3").priorAuth2("4").fromDate("2019-08-02").toDate("2019-08-03").build();
		listclaimService.add(ClaimServiceVO.builder().priorAuth1("5").priorAuth2("6").build());

		return TestcaseVO.builder().templateId(id).templateName("test").claimReceiver("receiver").claimSubmitters("submitter").beneficiary(beneificaryVO).billing(providerVO)
				.payor(payorVO).claimHeader(claimHeader).services(listclaimService).formType(getLookupDataVO(1L).getCode()).build();
	}

	private TestExecutionVO getTestExecutionVO() {
		return TestExecutionVO.builder().batchName("First Test").environmentName("1").testGroupItemVOList(getListTestGroupItemVO()).build();
	}

	private List<TestGroupItemVO> getListTestGroupItemVO() {
		List<TestGroupItemVO> list = new ArrayList<>();
		list.add(TestGroupItemVO.builder().value(1).claim(getClaimvo(1L)).build());
		return list;
	}

	private TestcaseGroupVO getTestGroupVOWithoutId(String name) {
		return TestcaseGroupVO.builder().id(null).testcaseGroupName(name).description("Integration Test - Desc").build();
	}

	private EnvironmentVO getEnvironmentVO() {
		return EnvironmentVO.builder().environmentName("test").protocol("test").host("test").port("test").logonType("test").userName("test").password("test").pemText("test")
				.dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test").schemaName("test").build();
	}

	private EnvironmentPreset getEnvironmentPresetProvider(Environment environment) {
		String providerJsonData = "{\"npi\":\"test2\",\"taxonomy\":\"000A\",\"firstName\":\"Srini\",\"lastName\":\"S\",\"organizationName\":\"NKD Org\",\"taxId\":\"12\",\"type\":\"I\",\"address\":{\"address\":\"20, NGM street\",\"city\":\"Selam\",\"state\":\"Tamilnadu\",\"zipcode\":\"65410\"}}";

		return EnvironmentPreset.builder().activeFlag(Constants.ACTIVEFLAG).environment(environment).type("provider").jsonData(providerJsonData).key("test2").build();
	}

	private EnvironmentPreset getEnvironmentPresetBeni(Environment environment) {
		String beniJsonData = "{\"identifier\":\"test1\",\"firstName\":\"test1\",\"lastName\":\"test1\",\"dob\":\"2001-04-30T18:30:00.000Z\",\"gender\":\"Male\",\"address\":{\"address\":\"test1\",\"city\":\"test1\",\"state\":\"test1\",\"zipcode\":\"test1\"}}";

		return EnvironmentPreset.builder().activeFlag(Constants.ACTIVEFLAG).environment(environment).type("beneficiary").jsonData(beniJsonData).key("test1").build();

	}

	private EnvironmentPreset getEnvironmentPresetPayor(Environment environment) {
		String payorJsonData = "{\"identifier\":\"test\",\"name\":\"Karthi\",\"address\":{\"address\":\"KGF Street\",\"city\":\"Cbe\",\"state\":\"TN\",\"zipcode\":\"56666\"}}";
		return EnvironmentPreset.builder().activeFlag(Constants.ACTIVEFLAG).environment(environment).type("payor").jsonData(payorJsonData).key("test").build();

	}

	private EnvironmentPreset getEnvironmentPresetPa(Environment environment) {

		String paJsonData = "{\"number\":\"1\",\"description\":\"two\"}";
		return EnvironmentPreset.builder().activeFlag(Constants.ACTIVEFLAG).environment(environmentRepository.getOne(1L)).type("pa").jsonData(paJsonData).key("1").build();

	}

	private ReplaceAndExecuteVO getReplaceAndExecuteVO() {
		
		ReplacePayorVO replacePayor = ReplacePayorVO.builder().payorControl("test").payor("test").alwaysReplace("test").build();
		ReplaceBeneficiaryVO replaceBeni = ReplaceBeneficiaryVO.builder().beneficaryControl("test1").beneficaryIdentifier("3454").alwaysReplace("test1").build();
		ReplaceProviderVO replaceProvider = ReplaceProviderVO.builder().providerControl("test2").provider("test1").alwaysReplace("test2").build();
		ReplacePAVO replacePa = ReplacePAVO.builder().paControl("1").pa("1").alwaysReplace("1").build();

		long[] claimId = new long[1];
		claimId[0] = 1L;

		ReplaceBeneficiaryVO[] newBen = new ReplaceBeneficiaryVO[1];
		newBen[0] = replaceBeni;

		ReplaceProviderVO[] newProvivder = new ReplaceProviderVO[1];
		newProvivder[0] = replaceProvider;

		ReplacePayorVO[] newPayor = new ReplacePayorVO[1];
		newPayor[0] = replacePayor;

		ReplacePAVO[] newPa = new ReplacePAVO[1];
		newPa[0] = replacePa;

		return ReplaceAndExecuteVO.builder().voidClaimsFirst("Y").increaseBydays(5).claimSubmitters("Test-Submitter").claimReceiver("Test-Receiver").environmentName("1").batchName("test 123").claimsId(claimId).replacementBeneficiary(newBen).replacementPayor(newPayor)
				.replacementProvider(newProvivder).replacementPa(newPa).voidClaimsFirst("Y").increaseBydays(1).build();
	}

	private String getJsonData() {
		return "{\"templateId\":1,\"claimId\":null,\"templateName\":\"new testcase\",\"claimTestcaseName\":null,\"claimSubmitters\":\"David\",\"claimReceiver\":\"Donald\",\"formType\":\"Institutional\",\"claimType\":\"c200\",\"beneficiary\":{\"identifier\":\"3454\",\"firstName\":\"Siva\",\"lastName\":\"S\",\"dob\":\"2019-06-04T18:30:00.000Z\",\"gender\":\"Male\",\"address\":{\"address\":\"60 MRG Street\",\"city\":\"Ta\",\"state\":\"TN\",\"zipcode\":\"65410\"}},\"billing\":{\"npi\":\"test1\",\"taxonomy\":\"000A\",\"firstName\":\"Srini\",\"lastName\":\"S\",\"organizationName\":\"NKD Org\",\"taxId\":\"12\",\"type\":\"I\",\"address\":{\"address\":\"20, NGM street\",\"city\":\"Selam\",\"state\":\"Tamilnadu\",\"zipcode\":\"65410\"}},\"servicing\":{\"npi\":\"test1\",\"taxonomy\":\"000A\",\"firstName\":\"Srini\",\"lastName\":\"S\",\"organizationName\":\"NKD Org\",\"taxId\":\"12\",\"type\":\"I\",\"address\":{\"address\":\"20, NGM street\",\"city\":\"Selam\",\"state\":\"Tamilnadu\",\"zipcode\":\"65410\"}},\"payor\":{\"identifier\":\"test\",\"name\":\"Karthi\",\"address\":{\"address\":\"KGF Street\",\"city\":\"Cbe\",\"state\":\"TN\",\"zipcode\":\"56666\"}},\"claimHeader\":{\"billedUnits\":12.0,\"billedAmount\":12.0,\"fromDate\":\"2019-06-30T18:30:00.000Z\",\"toDate\":\"2019-07-15T18:30:00.000Z\",\"frequency\":\"frequency one\",\"source\":\"Dental code 3\",\"patientControlNo\":\"12\",\"facilityType\":\"12\",\"serviceFacility\":{\"facilityName\":null,\"npi\":null,\"address\":null},\"primaryDiagnosis\":\"12\",\"secondaryDiagnosisList\":[],\"admitDiagnosis\":null,\"surgicalCode\":null,\"surgicalCodeDate\":null,\"valueCodeList\":[{\"valueCode\":\"\",\"valueCodeAmount\":0.0},{\"valueCode\":\"\",\"valueCodeAmount\":0.0},{\"valueCode\":\"\",\"valueCodeAmount\":0.0}],\"surgicalCodeList\":[{\"surgicalCode\":\"\",\"surgicalDate\":\"\"}],\"occuranceCodeList\":[{\"occuranceCode\":\"\",\"occuranceCodeDate\":\"\"},{\"occuranceCode\":\"\",\"occuranceCodeDate\":\"\"},{\"occuranceCode\":\"\",\"occuranceCodeDate\":\"\"}],\"occuranceSpanCodeList\":[{\"occuranceSpanCode\":\"\",\"occuranceSpanCodeDate\":\"\"},{\"occuranceSpanCode\":\"\",\"occuranceSpanCodeDate\":\"\"},{\"occuranceSpanCode\":\"\",\"occuranceSpanCodeDate\":\"\"}],\"priorAuth1\":1,\"priorAuth2\":1,\"drgCode\":null,\"conditionCodeList\":[],\"treatmentCodeList\":[],\"dental\":{\"toothStatusList\":[]},\"expectedResult\":{\"paidUnits\":12.0,\"paidAmount\":12.0,\"allowedUnits\":0.0,\"allowedAmount\":12.0,\"claimType\":\"c-300\",\"errorCodesList\":[]}},\"services\":[{\"claimServiceId\":null,\"fromDate\":\"2019-06-30T18:30:00.000Z\",\"toDate\":\"2019-07-01T18:30:00.000Z\",\"procedureCode\":\"\",\"revenueCode\":\"\",\"serviceFacility\":{\"facilityName\":null,\"npi\":\"\",\"address\":null},\"servicing\":{\"npi\":\"\",\"taxonomy\":\"\",\"firstName\":\"\",\"lastName\":\"\",\"organizationName\":\"\",\"taxId\":\"\",\"type\":\"\",\"address\":null},\"billedAmount\":12.0,\"billedUnits\":12.0,\"diagnosisCode\":\"12\",\"modifiersList\":[],\"dental\":{\"oralCavityDesignationCodeList\":[],\"toothCodeList\":[]},\"priorAuth1\":\"1\",\"priorAuth2\":\"1\",\"expectedResults\":{\"paidUnits\":12.0,\"paidAmount\":12.0,\"allowedUnits\":12.0,\"allowedAmount\":12.0,\"errorCodesList\":[]}}],\"createdBy\":null}";
	}

	private void saveEnvironmentSavedPreset() {
		EnvironmentSavedPreset build = EnvironmentSavedPreset.builder().replaceIdentifier("3454")
				.environment(environmentRepository.getOne(1L)).type(Constants.BENEFICIARY_TYPE)
				.identifier("test123").build();
				environmentSavedPresetRepository.save(build);
				environmentSavedPresetRepository.save(EnvironmentSavedPreset.builder().replaceIdentifier("test2")
						.environment(environmentRepository.getOne(1L)).type(Constants.PAYOR_TYPE)
						.identifier("test").build());
				
				
	}
	@AfterEach
	public void clearDataTestGroup() throws SQLException {
		environmentSavedPresetRepository.deleteAll();
		batchRepository.deleteAll();
		batchTestcaseRepository.deleteAll();
		batchRepository.deleteAll();
		environmentPresetRepository.deleteAll();
		environmentRepository.deleteAll();
		claimsTestcaseGroupRepo.deleteAll();
		testGroupsRepo.deleteAll();
		claimRepo.deleteAll();
		templateRepo.deleteAll();
		lookupDataRepository.deleteAll();
		elementConfigRepository.deleteAll();
		clearSequences();

	}

	
	@Test
	public void testSaveTestGroup() {
		YorosisContext.set(new YorosisContext("test", true));

		ResponseVO createResponse = testGroupService.saveTestGroup(getTestGroupVO(0L));
		assertEquals("TestGroup created successfully", createResponse.getResponse());

		ResponseVO updateResponse = testGroupService.saveTestGroup(getTestGroupVO(1L));
		assertEquals("TestGroup updated successfully", updateResponse.getResponse());

		ResponseVO createResponseWithoutId = testGroupService.saveTestGroup(getTestGroupVOWithoutId("First"));
		assertEquals("TestGroup created successfully", createResponseWithoutId.getResponse());

		testGroupService.saveTestGroup(getTestGroupVOWithoutId("Second"));
		testGroupService.saveTestGroup(getTestGroupVOWithoutId("Third"));

	}

	@Test
	public void testDeleteTestCaseGroup() throws YorosisException, IOException {
		testGroupService.saveTestGroup(getTestGroupVOWithoutId("Four"));
		ResponseVO deletedResponse = testGroupService.deleteTestCaseGroup(1L);

		assertEquals("Test Group case deleted Successfully", deletedResponse.getResponse());

		lookupDataService.saveLookupData(getLookupDataVO(0L));
		testGroupService.saveTestGroup(getTestGroupVOWithoutId("Four"));
		templateService.saveTemplate(getClaimvo(0L));

		String json = "{\"templateId\":1,\"claimId\":null,\"templateName\":\"Inpatient Template - 1\",\"claimTestcaseName\":null,\"claimSubmitters\":\"S1\",\"claimReceiver\":\"R2\",\"formType\":\"I\",\"claimType\":\"I\",\"beneficiary\":{\"identifier\":\"bid\",\"firstName\":\"bfname\",\"lastName\":\"blname\",\"dob\":\"2019-06-02T04:00:00.000Z\",\"gender\":\"Male\",\"address\":{\"address\":\"address1\",\"city\":\"city\",\"state\":\"st\",\"zipcode\":\"20871\"}},\"billing\":{\"npi\":\"bnpi\",\"taxonomy\":\"btax\",\"firstName\":\"bfname\",\"lastName\":\"blname\",\"organizationName\":\"borgname\",\"taxId\":\"83873373\",\"type\":\"I\",\"address\":{\"address\":\"bpstreet1\",\"city\":\"bcity\",\"state\":\"cs\",\"zipcode\":\"38273\"}},\"servicing\":{\"npi\":\"snpi\",\"taxonomy\":\"stax\",\"firstName\":\"sfname\",\"lastName\":\"slame\",\"organizationName\":\"lorg\",\"taxId\":\"23423234\",\"type\":\"I\",\"address\":{\"address\":\"spaddr\",\"city\":\"scity\",\"state\":\"sp\",\"zipcode\":\"38377\"}},\"payor\":{\"identifier\":\"387ysdn74o3\",\"name\":\"payorname\",\"address\":{\"address\":\"payoraddress\",\"city\":\"paycity\",\"state\":\"pa\",\"zipcode\":\"38462\"}},\"claimHeader\":{\"billedUnits\":10.0,\"billedAmount\":100.0,\"fromDate\":\"2019-06-06T04:00:00.000Z\",\"toDate\":\"2019-06-06T04:00:00.000Z\",\"frequency\":\"1\",\"source\":\"edi\",\"patientControlNo\":\"sadfkuhsd\",\"facilityType\":\"8\",\"serviceFacility\":\"sf\",\"primaryDiagnosis\":\"1000\",\"secondryDiagnosisList\":[\"2827\",\"3843\"],\"expectedResult\":{\"paidUnits\":5.0,\"paidAmount\":50.0,\"allowedUnits\":0.0,\"allowedAmount\":50.0,\"claimType\":\"I\",\"errorCodesList\":[]}},\"services\":[{\"claimServiceId\":null,\"fromDate\":\"2019-06-06T04:00:00.000Z\",\"toDate\":\"2019-06-06T04:00:00.000Z\",\"procedureCode\":\"\",\"revenueCode\":\"1000\",\"serviceFacility\":\"\",\"servicing\":{\"npi\":\"snpi\",\"taxonomy\":\"s1tax\",\"firstName\":\"\",\"lastName\":\"\",\"organizationName\":\"\",\"taxId\":null,\"type\":null,\"address\":null},\"billedAmount\":100.0,\"billedUnits\":10.0,\"diagnosisCode\":\"1000\",\"modifiersList\":[],\"expectedResults\":{\"paidUnits\":5.0,\"paidAmount\":50.0,\"allowedUnits\":5.0,\"allowedAmount\":50.0,\"errorCodesList\":[]}}]}";
		Testcases claims = claimRepo
				.save(Testcases.builder().id(1L).formType(lookupDataRepository.getOne(1L)).testcaseName("Claim Test").jsonData(json).template(templateRepo.getOne(1L)).build());

		claimsTestcaseGroupRepo.save(TestcaseCategories.builder().testcase(claims).testcaseGroups(testGroupsRepo.getOne(2L)).build());

		ResponseVO response = testGroupService.deleteTestCaseGroup(2L);
		assertEquals("Test Group case have claim test case group", response.getResponse());

	}

	@Test
	public void testGetTestGroup() throws IOException, YorosisException {
		YorosisContext.set(new YorosisContext("test", true));
		lookupDataService.saveLookupData(getLookupDataVO(0L));
		testGroupService.saveTestGroup(getTestGroupVOWithoutId("Four"));
		testGroupService.saveTestGroup(getTestGroupVOWithoutId("Hello"));
		templateService.saveTemplate(getClaimvo(0L));

		Testcases claims = claimRepo.save(
				Testcases.builder().id(1L).formType(lookupDataRepository.getOne(1L)).testcaseName("Claim Test").jsonData(getJsonData()).template(templateRepo.getOne(1L)).build());

		claimsTestcaseGroupRepo.save(TestcaseCategories.builder().testcase(claims).testcaseGroups(testGroupsRepo.findByTestcaseGroupName("Four")).build());

		testGroupsRepo.findByTestcaseGroupName("Third");

		List<TestcaseGroupVO> testGroupVOlist = testGroupService.getTestGroup();
		assertNotNull(testGroupVOlist);

		Testcases claimsForNonGlobalUsers = claimRepo.save(Testcases.builder().id(2L).formType(lookupDataRepository.getOne(1L)).testcaseName("Claim Test 2").jsonData(getJsonData())
				.template(templateRepo.getOne(1L)).createdBy("test").build());

		claimsTestcaseGroupRepo
				.save(TestcaseCategories.builder().testcase(claimsForNonGlobalUsers).createdBy("test").testcaseGroups(testGroupsRepo.findByTestcaseGroupName("Four")).build());

		YorosisContext.set(new YorosisContext("test", false));
		List<TestcaseGroupVO> testGroupVOlistForNonGlobalUsers = testGroupService.getTestGroup();
		assertNotNull(testGroupVOlistForNonGlobalUsers);

	}

	@Test
	public void testGetListOfTestCaseInfo() {
		testGroupService.saveTestGroup(getTestGroupVOWithoutId("Four"));
		TestcaseGroupVO testGroup = testGroupService.getListOfTestCaseInfo(1);
		assertNotNull(testGroup);
		assertEquals("Four", testGroup.getTestcaseGroupName());
	}

	@Test
	public void testGetListOfTestCaseGroups() {
		YorosisContext.set(new YorosisContext("test", true));
		testGroupService.saveTestGroup(getTestGroupVO(0L));
		List<TestcaseGroupVO> listTestGroup = testGroupService.getListOfTestCaseGroups();
		assertNotNull(listTestGroup);
		assertEquals(1, listTestGroup.size());

	}

	@Test
	public void testGetReplacementDetails() throws IOException, YorosisException {

		YorosisContext.set(new YorosisContext("test", true));

		environmentService.saveEnvironmentData(getEnvironmentVO());

		environmentPresetRepository.save(getEnvironmentPresetProvider(environmentRepository.getOne(1L)));

		ReplacementOptionVO replacementOptionVO = ReplacementOptionVO.builder().enviornmentId(1L).type("provider").build();

		List<EnvironmentPresetVO> replacementDetails = testGroupService.getReplacementDetails(replacementOptionVO);

		assertNotNull(replacementDetails);

		environmentPresetRepository.save(getEnvironmentPresetBeni(environmentRepository.getOne(1L)));

		ReplacementOptionVO replacementOptionVOBeni = ReplacementOptionVO.builder().enviornmentId(1L).type("beneficiary").build();
		List<EnvironmentPresetVO> environmentPresetVOBeni = testGroupService.getReplacementDetails(replacementOptionVOBeni);
		assertNotNull(environmentPresetVOBeni);

		environmentPresetRepository.save(getEnvironmentPresetPayor(environmentRepository.getOne(1L)));
		ReplacementOptionVO replacementOptionVOPayor = ReplacementOptionVO.builder().enviornmentId(1L).type("payor").build();
		List<EnvironmentPresetVO> environmentPresetVOPayor = testGroupService.getReplacementDetails(replacementOptionVOPayor);
		assertNotNull(environmentPresetVOPayor);

		environmentPresetRepository.save(getEnvironmentPresetPa(environmentRepository.getOne(1L)));
		ReplacementOptionVO replacementOptionVOPa = ReplacementOptionVO.builder().enviornmentId(1L).type("pa").build();
		List<EnvironmentPresetVO> environmentPresetVOPa = testGroupService.getReplacementDetails(replacementOptionVOPa);
		assertNotNull(environmentPresetVOPa);

		ReplacementOptionVO replacementOptionVOtest = ReplacementOptionVO.builder().enviornmentId(1L).type("test").build();

		YorosisException typeException = Assertions.assertThrows(YorosisException.class, () -> {
			testGroupService.getReplacementDetails(replacementOptionVOtest);
		});
		Assertions.assertEquals("Invalid Type", typeException.getMessage());

	}

	@Test
	public void testGetUniqueProvider() throws YorosisException, IOException {

		YorosisContext.set(new YorosisContext("test", true));
		lookupDataService.saveLookupData(getLookupDataVO(0L));

		environmentService.saveEnvironmentData(getEnvironmentVO());

		environmentPresetRepository.save(getEnvironmentPresetProvider(environmentRepository.getOne(1L)));

		testGroupService.saveTestGroup(getTestGroupVO(0L));

		templateService.saveTemplate(getClaimvo(0L));

		Testcases claim = claimRepo.save(
				Testcases.builder().id(2L).formType(lookupDataRepository.getOne(1L)).testcaseName("Claim Test").jsonData(getJsonData()).template(templateRepo.getOne(1L)).build());

		claimsTestcaseGroupRepo.save(TestcaseCategories.builder().testcase(claim).testcaseGroups(testGroupsRepo.getOne(1L)).build());

		Set<UniqueProviderVO> uniqueProvider = testGroupService.getUniqueProvider(getTestExecutionVO());
		assertNotNull(uniqueProvider);

	}

	@Test
	public void testGetUniqueBeneficary() throws YorosisException, IOException {

		YorosisContext.set(new YorosisContext("test", true));

		lookupDataService.saveLookupData(getLookupDataVO(0L));
		environmentService.saveEnvironmentData(getEnvironmentVO());
		environmentPresetRepository.save(getEnvironmentPresetBeni(environmentRepository.getOne(1L)));

		testGroupService.saveTestGroup(getTestGroupVO(0L));

		templateService.saveTemplate(getClaimvo(0L));
		EnvironmentSavedPreset environmentSavedPreset = EnvironmentSavedPreset.builder().environment(environmentRepository.getOne(1L)).identifier("test1").replaceIdentifier("3454").type(Constants.BENEFICIARY_TYPE).createdBy("admin").build();
		
		environmentSavedPresetRepository.save(environmentSavedPreset);
				
		Testcases claim = claimRepo.save(
				Testcases.builder().id(2L).formType(lookupDataRepository.getOne(1L)).testcaseName("Claim Test").jsonData(getJsonData()).template(templateRepo.getOne(1L)).build());

		claimsTestcaseGroupRepo.save(TestcaseCategories.builder().testcase(claim).testcaseGroups(testGroupsRepo.getOne(1L)).build());

		Set<UniqueBeneficiaryVO> uniqueBeneficary = testGroupService.getUniqueBeneficary(getTestExecutionVO());
		assertNotNull(uniqueBeneficary);
	}

	@Test
	public void testGetUniquePA() throws YorosisException, IOException {

		YorosisContext.set(new YorosisContext("test", true));

		lookupDataService.saveLookupData(getLookupDataVO(0L));
		environmentService.saveEnvironmentData(getEnvironmentVO());
		environmentPresetRepository.save(getEnvironmentPresetPa(environmentRepository.getOne(1L)));

		testGroupService.saveTestGroup(getTestGroupVO(0L));

		templateService.saveTemplate(getClaimvo(0L));

		Testcases claim = claimRepo
				.save(Testcases.builder().formType(lookupDataRepository.getOne(1L)).testcaseName("Claim Test").jsonData(getJsonData()).template(templateRepo.getOne(1L)).build());

		claimsTestcaseGroupRepo.save(TestcaseCategories.builder().testcase(claim).testcaseGroups(testGroupsRepo.getOne(1L)).build());

		Set<UniquePAVO> uniquePA = testGroupService.getUniquePA(getTestExecutionVO());
		assertNotNull(uniquePA);
	}

	@Test
	public void testGetUniquePayor() throws YorosisException, IOException {

		YorosisContext.set(new YorosisContext("test", true));

		lookupDataService.saveLookupData(getLookupDataVO(0L));
		environmentService.saveEnvironmentData(getEnvironmentVO());
		environmentPresetRepository.save(getEnvironmentPresetPayor(environmentRepository.getOne(1L)));

		testGroupService.saveTestGroup(getTestGroupVO(0L));

		templateService.saveTemplate(getClaimvo(0L));

		Testcases claim = claimRepo.save(
				Testcases.builder().id(2L).formType(lookupDataRepository.getOne(1L)).testcaseName("Claim Test").jsonData(getJsonData()).template(templateRepo.getOne(1L)).build());

		claimsTestcaseGroupRepo.save(TestcaseCategories.builder().testcase(claim).testcaseGroups(testGroupsRepo.getOne(1L)).build());

		Set<UniquePayorVO> uniquePayor = testGroupService.getUniquePayor(getTestExecutionVO());
		assertNotNull(uniquePayor);
	}

	@Test
	public void testReplaceAndExecute() throws YorosisException, IOException {
		YorosisContext.set(new YorosisContext("test", true));

		ElementsConfiguration ElementConfigDetails = ElementsConfiguration.builder().elementLabel("headerPaidAmount").fieldName("headerPaidAmount").fieldType("Number").isMandatory("Yes")
				.applicableAt("Header").build();

		elementConfigRepository.save(ElementConfigDetails);

		lookupDataService.saveLookupData(getLookupDataVO(0L));
		environmentService.saveEnvironmentData(getEnvironmentVO());

		environmentPresetRepository.save(getEnvironmentPresetPayor(environmentRepository.getOne(1L)));
		environmentPresetRepository.save(getEnvironmentPresetBeni(environmentRepository.getOne(1L)));
		environmentPresetRepository.save(getEnvironmentPresetProvider(environmentRepository.getOne(1L)));
		environmentPresetRepository.save(getEnvironmentPresetPa(environmentRepository.getOne(1L)));

		testGroupService.saveTestGroup(getTestGroupVO(0L));

		templateService.saveTemplate(getClaimvo(0L));

		Testcases claim = claimRepo
				.save(Testcases.builder().formType(lookupDataRepository.getOne(1L)).testcaseName("Claim Test").jsonData(getJsonData()).template(templateRepo.getOne(1L)).build());

		claimsTestcaseGroupRepo.save(TestcaseCategories.builder().testcase(claim).testcaseGroups(testGroupsRepo.getOne(1L)).build());

		
		saveEnvironmentSavedPreset();
			
		ResponseVO replaceAndExecute = testGroupService.replaceAndExecute(getReplaceAndExecuteVO());
		assertEquals("Test Executed Successfully", replaceAndExecute.getResponse());

	}

	@Test
	public void testCheckBatchName() {
		
		int checkBatchName = testGroupService.checkBatchName("Test");
		assertEquals(0, checkBatchName);
	}
	
	@Override
	protected DataSource getDatasource() {
		return datasource;
	}

}
