package com.yorosis.livetester;

import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.sql.DataSource;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.yorosis.livetester.constants.Constants;
import com.yorosis.livetester.entities.Environment;
import com.yorosis.livetester.entities.EnvironmentPreset;
import com.yorosis.livetester.entities.Testcases;
import com.yorosis.livetester.repo.BatchRepository;
import com.yorosis.livetester.repo.BatchTestcaseRepository;
import com.yorosis.livetester.repo.EnvironmentPresetRepository;
import com.yorosis.livetester.repo.EnvironmentRepository;
import com.yorosis.livetester.repo.LookupDataRepository;
import com.yorosis.livetester.repo.TemplateRepository;
import com.yorosis.livetester.repo.TestcasesRepository;
import com.yorosis.livetester.security.YorosisContext;
import com.yorosis.livetester.service.EnvironmentService;
import com.yorosis.livetester.service.LookupDataService;
import com.yorosis.livetester.service.TemplateService;
import com.yorosis.livetester.service.TestGroupService;
import com.yorosis.livetester.service.TestReportService;
import com.yorosis.livetester.vo.BeneficiaryVO;
import com.yorosis.livetester.vo.ClaimHeaderVO;
import com.yorosis.livetester.vo.ClaimServiceVO;
import com.yorosis.livetester.vo.EnvironmentVO;
import com.yorosis.livetester.vo.LookupDataVO;
import com.yorosis.livetester.vo.PayorVO;
import com.yorosis.livetester.vo.ProviderVO;
import com.yorosis.livetester.vo.ReplaceAndExecuteVO;
import com.yorosis.livetester.vo.ReplaceBeneficiaryVO;
import com.yorosis.livetester.vo.ReplacePAVO;
import com.yorosis.livetester.vo.ReplacePayorVO;
import com.yorosis.livetester.vo.ReplaceProviderVO;
import com.yorosis.livetester.vo.TestReportVO;
import com.yorosis.livetester.vo.TestcaseVO;

@SpringBootTest
@ActiveProfiles(profiles = { "default", "test" })
public class TestReportServiceTest extends AbstractBaseTest {

	@Autowired
	private TestReportService testReportService;
	
	@Autowired
	private TestGroupService testGroupService;

	@Autowired
	private TestcasesRepository claimRepo;

	@Autowired
	private TemplateRepository templateRepo;

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

	private LookupDataVO getLookupDataVO(Long lookupId) {
		return LookupDataVO.builder().id(lookupId).type("Form Type").code("Test").description("Test - Description").build();
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

    private TestReportVO getTestReportVO(String reportType) {
		Timestamp ts = new Timestamp(new Date().getTime());
		return TestReportVO.builder().reportType(reportType).fromDate(ts).toDate(ts).build();

	}

	private EnvironmentVO getEnvironmentVO() {
		return EnvironmentVO.builder().environmentName("test").protocol("test").host("test").port("test").logonType("test").userName("test").password("test").pemText("test")
				.dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test").schemaName("test").build();
	}


	private EnvironmentPreset getEnvironmentPresetPayor(Environment environment) {
		String payorJsonData = "{\"identifier\":\"100A\",\"name\":\"Karthi\",\"address\":{\"address\":\"20\",\"city\":\"Dindigul\",\"state\":\"Jharkhand\",\"zipcode\":\"65410\"}}";
		return EnvironmentPreset.builder().activeFlag(Constants.ACTIVEFLAG).environment(environment).type("payor").jsonData(payorJsonData).key("test123").build();

	}

	
	private String getJsonData() {
		return "{\"templateId\":1,\"claimId\":null,\"templateName\":\"Updated Institutional Template\",\"claimTestcaseName\":null,\"claimSubmitters\":\"David\",\"claimReceiver\":\"Donald\",\"formType\":\"Institutional\",\"claimType\":\"c100\",\"beneficiary\":{\"identifier\":\"23SD\",\"firstName\":\"David\",\"lastName\":\"D\",\"dob\":\"2019-07-09T18:30:00.000Z\",\"gender\":\"Male\",\"address\":{\"address\":\"20\",\"city\":\"Coimbatore\",\"state\":\"Tamilnadu\",\"zipcode\":\"65410\"}},\"billing\":{\"npi\":\"23SSS\",\"taxonomy\":\"2300A\",\"firstName\":\"Karthi\",\"lastName\":\"D\",\"organizationName\":\"DFG\",\"taxId\":\"200\",\"type\":\"I\",\"address\":{\"address\":\"20\",\"city\":\"Coimbatore\",\"state\":\"Tamilnadu\",\"zipcode\":\"65410\"}},\"servicing\":{\"npi\":\"23SSS\",\"taxonomy\":\"2300A\",\"firstName\":\"Karthi\",\"lastName\":\"D\",\"organizationName\":\"DFG\",\"taxId\":\"200\",\"type\":\"I\",\"address\":{\"address\":\"20\",\"city\":\"Coimbatore\",\"state\":\"Tamilnadu\",\"zipcode\":\"65410\"}},\"payor\":{\"identifier\":\"100A\",\"name\":\"Karthi\",\"address\":{\"address\":\"20\",\"city\":\"Dindigul\",\"state\":\"Jharkhand\",\"zipcode\":\"65410\"}},\"claimHeader\":{\"billedUnits\":23.0,\"billedAmount\":23.0,\"fromDate\":\"2019-07-10T18:30:00.000Z\",\"toDate\":\"2019-07-02T18:30:00.000Z\",\"frequency\":\"frequency one\",\"source\":\"Dental code 3\",\"patientControlNo\":\"34\",\"facilityType\":\"FF\",\"serviceFacility\":{\"facilityName\":null,\"npi\":\"2FF\",\"address\":null},\"primaryDiagnosis\":\"DD\",\"secondaryDiagnosisList\":[\"GG\",\"SS\",\"RR\",\"SS\",\"RR\",\"SS\"],\"admitDiagnosis\":null,\"surgicalCode\":null,\"surgicalCodeDate\":null,\"valueCodeList\":[{\"valueCode\":\"1\",\"valueCodeAmount\":34.0},{\"valueCode\":\"2\",\"valueCodeAmount\":345.0},{\"valueCode\":\"3\",\"valueCodeAmount\":345.0},{\"valueCode\":\"4\",\"valueCodeAmount\":456.0},{\"valueCode\":\"5\",\"valueCodeAmount\":45.0},{\"valueCode\":\"6\",\"valueCodeAmount\":45.0}],\"surgicalCodeList\":[{\"surgicalCode\":\"1\",\"surgicalDate\":\"2019-07-03T18:30:00.000Z\"},{\"surgicalCode\":\"2\",\"surgicalDate\":\"2019-07-02T18:30:00.000Z\"},{\"surgicalCode\":\"3\",\"surgicalDate\":\"2019-07-01T18:30:00.000Z\"},{\"surgicalCode\":\"4\",\"surgicalDate\":\"2019-07-16T18:30:00.000Z\"},{\"surgicalCode\":\"5\",\"surgicalDate\":\"2019-07-16T18:30:00.000Z\"},{\"surgicalCode\":\"6\",\"surgicalDate\":\"2019-07-09T18:30:00.000Z\"}],\"occuranceCodeList\":[{\"occuranceCode\":\"1\",\"occuranceCodeDate\":\"2019-07-03T18:30:00.000Z\"},{\"occuranceCode\":\"2\",\"occuranceCodeDate\":\"2019-07-02T18:30:00.000Z\"},{\"occuranceCode\":\"3\",\"occuranceCodeDate\":\"2019-07-03T18:30:00.000Z\"},{\"occuranceCode\":\"4\",\"occuranceCodeDate\":\"2019-07-10T18:30:00.000Z\"},{\"occuranceCode\":\"5\",\"occuranceCodeDate\":\"2019-07-16T18:30:00.000Z\"},{\"occuranceCode\":\"6\",\"occuranceCodeDate\":\"2019-07-09T18:30:00.000Z\"}],\"occuranceSpanCodeList\":[{\"occuranceSpanCode\":\"1\",\"occuranceSpanCodeDate\":\"2019-07-10T18:30:00.000Z\"},{\"occuranceSpanCode\":\"2\",\"occuranceSpanCodeDate\":\"2019-07-10T18:30:00.000Z\"},{\"occuranceSpanCode\":\"3\",\"occuranceSpanCodeDate\":\"2019-07-10T18:30:00.000Z\"},{\"occuranceSpanCode\":\"4\",\"occuranceSpanCodeDate\":\"2019-07-10T18:30:00.000Z\"},{\"occuranceSpanCode\":\"5\",\"occuranceSpanCodeDate\":\"2019-07-10T18:30:00.000Z\"},{\"occuranceSpanCode\":\"6\",\"occuranceSpanCodeDate\":\"2019-07-09T18:30:00.000Z\"}],\"priorAuth1\":\"Auth 00A\",\"priorAuth2\":\"Auth 00B\",\"drgCode\":\"SDS\",\"conditionCodeList\":[\"GG\",\"SS\",\"RR\",\"SS\",\"RR\",\"HH\",\"DD\"],\"treatmentCodeList\":[\"RR\",\"SS\",\"AA\",\"RR\",\"GG\",\"RR\"],\"dental\":{\"toothStatusList\":[]},\"expectedResult\":{\"paidUnits\":34.0,\"paidAmount\":23.0,\"allowedUnits\":0.0,\"allowedAmount\":23.0,\"claimType\":\"c-300\",\"errorCodesList\":[\"HH\",\"SS\",\"GG\",\"EF\"]}},\"services\":[{\"claimServiceId\":null,\"fromDate\":\"2019-07-03T18:30:00.000Z\",\"toDate\":\"2019-07-04T18:30:00.000Z\",\"procedureCode\":\"200GG\",\"revenueCode\":\"WR00\",\"serviceFacility\":{\"facilityName\":null,\"npi\":\"GG\",\"address\":null},\"servicing\":{\"npi\":\"23AA\",\"taxonomy\":\"1OOAS\",\"firstName\":\"\",\"lastName\":\"\",\"organizationName\":\"\",\"taxId\":\"\",\"type\":\"\",\"address\":null},\"billedAmount\":23.0,\"billedUnits\":23.0,\"diagnosisCode\":\"GG\",\"modifiersList\":[\"HH\",\"DD\",\"SS\",\"RR\"],\"dental\":{\"oralCavityDesignationCodeList\":[],\"toothCodeList\":[]},\"priorAuth1\":\"Auth 00A\",\"priorAuth2\":\"Auth 00B\",\"expectedResults\":{\"paidUnits\":34.0,\"paidAmount\":23.0,\"allowedUnits\":34.0,\"allowedAmount\":34.0,\"errorCodesList\":[\"G\",\"SS\"]}},{\"claimServiceId\":null,\"fromDate\":\"2019-07-04T18:30:00.000Z\",\"toDate\":\"2019-07-02T18:30:00.000Z\",\"procedureCode\":\"34500\",\"revenueCode\":\"23\",\"serviceFacility\":{\"facilityName\":null,\"npi\":\"GG\",\"address\":null},\"servicing\":{\"npi\":\"FF099\",\"taxonomy\":\"EE44\",\"firstName\":\"\",\"lastName\":\"\",\"organizationName\":\"\",\"taxId\":\"\",\"type\":\"\",\"address\":null},\"billedAmount\":34.0,\"billedUnits\":34.0,\"diagnosisCode\":\"GG\",\"modifiersList\":[\"HH\"],\"dental\":{\"oralCavityDesignationCodeList\":[],\"toothCodeList\":[]},\"priorAuth1\":\"Auth 00A\",\"priorAuth2\":\"Auth 00B\",\"expectedResults\":{\"paidUnits\":34.0,\"paidAmount\":34.0,\"allowedUnits\":34.0,\"allowedAmount\":34.0,\"errorCodesList\":[\"FG\",\"FG\",\"F\",\"FG\"]}}]}";
	}
	
	private ReplaceAndExecuteVO getReplaceAndExecuteVO() {

		ReplacePayorVO replacePayor = ReplacePayorVO.builder().payorControl("test").payor("test2").build();
		ReplaceBeneficiaryVO replaceBeni = ReplaceBeneficiaryVO.builder().beneficaryControl("test1").beneficaryIdentifier("3454").build();
		ReplaceProviderVO replaceProvider = ReplaceProviderVO.builder().providerControl("test2").provider("test12").build();
		ReplacePAVO replacePa = ReplacePAVO.builder().paControl("1").pa("1").build();

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


	@AfterEach
	public void clearDataTestGroup() throws SQLException {
		batchRepository.deleteAll();
		batchTestcaseRepository.deleteAll();
	}

	@Test
	public void testGetTestReport() throws Exception {
		YorosisContext.set(new YorosisContext("test", true));

		environmentService.saveEnvironmentData(getEnvironmentVO());

		lookupDataService.saveLookupData(getLookupDataVO(0L));

		templateService.saveTemplate(getClaimvo(0L));

		claimRepo.save(
				Testcases.builder().id(2L).formType(lookupDataRepository.getOne(1L)).testcaseName("Claim Test").jsonData(getJsonData()).template(templateRepo.getOne(1L)).build());
		environmentPresetRepository.save(getEnvironmentPresetPayor(environmentRepository.getOne(1L)));
		testGroupService.replaceAndExecute(getReplaceAndExecuteVO());

		TestReportVO testReport = testReportService.getTestReport(getTestReportVO("Batch Report"));
		assertNotNull(testReport);

		TestReportVO formTypeBasedReport = testReportService.getTestReport(getTestReportVO("Form Type Based Report"));
		assertNotNull(formTypeBasedReport);

		TestReportVO dayBasedReport = testReportService.getTestReport(getTestReportVO("Day Based Report"));
		assertNotNull(dayBasedReport);

	}

	@Override
	protected DataSource getDatasource() {

		return datasource;
	}
}
