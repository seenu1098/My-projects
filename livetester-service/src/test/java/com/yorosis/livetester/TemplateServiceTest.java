package com.yorosis.livetester;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.sql.DataSource;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.yorosis.livetester.entities.LookupData;
import com.yorosis.livetester.entities.Testcases;
import com.yorosis.livetester.exception.YorosisException;
import com.yorosis.livetester.repo.LookupDataRepository;
import com.yorosis.livetester.repo.TemplateRepository;
import com.yorosis.livetester.repo.TestcasesRepository;
import com.yorosis.livetester.security.YorosisContext;
import com.yorosis.livetester.service.TemplateService;
import com.yorosis.livetester.vo.ClaimHeaderVO;
import com.yorosis.livetester.vo.ClaimOccuranceCodeVO;
import com.yorosis.livetester.vo.ClaimOccuranceSpanCodeVO;
import com.yorosis.livetester.vo.ClaimSurgicalCodeVO;
import com.yorosis.livetester.vo.ClaimValueCodeVO;
import com.yorosis.livetester.vo.DentalVO;
import com.yorosis.livetester.vo.DuplicateTemplateVO;
import com.yorosis.livetester.vo.ResponseVO;
import com.yorosis.livetester.vo.TemplateVO;
import com.yorosis.livetester.vo.TestcaseVO;
import com.yorosis.livetester.vo.ToothStatusVO;

@SpringBootTest
@ActiveProfiles(profiles = { "default", "test" })
public class TemplateServiceTest extends AbstractBaseTest {

	@Autowired
	private TemplateService templateService;

	@Autowired
	private TestcasesRepository claimRepository;

	@Autowired
	private TemplateRepository templateRepository;

	@Autowired
	private LookupDataRepository lookupDataRepository;

	@Autowired
	private DataSource datasource;

	@AfterEach
	public void deleteTemplateDetails() throws SQLException {
		claimRepository.deleteAll();
		templateRepository.deleteAll();
		lookupDataRepository.deleteAll();
		clearSequences();
	}

	private TestcaseVO getClaimVO() {
		return TestcaseVO.builder().templateName("Template").claimReceiver("receiver").claimSubmitters("submitter").formType("type").build();
	}

	private TestcaseVO getClaimVOWithId(Long id, String name) {
		return TestcaseVO.builder().templateId(id).templateName(name).claimReceiver("receiver").claimSubmitters("submitter").formType("type").createdBy("test").build();
	}

	private TestcaseVO getClaimVOWithoutTemplateId(String name) {
		return TestcaseVO.builder().templateId(null).templateName(name).claimReceiver("receiver").claimSubmitters("submitter").formType("type").build();
	}

	private TestcaseVO getInstitutionalClaimsVO() {
		return TestcaseVO.builder().formType("Institutional").claimHeader(getClaimHeader()).build();
	}

	private ClaimHeaderVO getClaimHeader() {
		List<ClaimSurgicalCodeVO> surgicalCodes = new ArrayList<>();
		surgicalCodes.add(getClaimSurgicalCodeVO());
		List<ClaimOccuranceCodeVO> occuranceCodes = new ArrayList<>();
		occuranceCodes.add(getClaimOccuranceCodeVO());
		List<ClaimOccuranceSpanCodeVO> spanCodes = new ArrayList<>();
		spanCodes.add(getClaimOccuranceSpanCodeVO());
		List<ClaimValueCodeVO> valueCodes = new ArrayList<>();
		valueCodes.add(getClaimValueCodeVO());
		List<String> conditionCodes = new ArrayList<>();
		conditionCodes.add("AASDF");

		return ClaimHeaderVO.builder().conditionCodeList(conditionCodes).surgicalCodeList(surgicalCodes).occuranceCodeList(occuranceCodes).occuranceSpanCodeList(spanCodes)
				.valueCodeList(valueCodes).build();
	}

	private ClaimSurgicalCodeVO getClaimSurgicalCodeVO() {
		return ClaimSurgicalCodeVO.builder().surgicalCode("1").surgicalDate("12/3/2019").build();
	}

	private ClaimOccuranceCodeVO getClaimOccuranceCodeVO() {
		return ClaimOccuranceCodeVO.builder().occuranceCode("1").occuranceCodeDate("12/3/2019").build();
	}

	private ClaimOccuranceSpanCodeVO getClaimOccuranceSpanCodeVO() {
		return ClaimOccuranceSpanCodeVO.builder().occuranceSpanCode("1").occuranceSpanCodeDate("12/3/2019").build();
	}

	private ClaimValueCodeVO getClaimValueCodeVO() {
		return ClaimValueCodeVO.builder().valueCodeAmount(55).valueCode("1").build();
	}

	private TestcaseVO getDentalClaimVO() {

		return TestcaseVO.builder().formType("Dental").claimHeader(getClaimHeaderVOForDental()).build();
	}

	private DuplicateTemplateVO getDuplicateTemplateVO() {
		return DuplicateTemplateVO.builder().templateId(1L).templateName("Duplicate Template").build();
	}

	private ToothStatusVO getToothStatusVO() {
		return ToothStatusVO.builder().toothNumber(21L).toothStatus("removed").build();
	}

	private ClaimHeaderVO getClaimHeaderVOForDental() {
		List<ToothStatusVO> toothStatus = new ArrayList<>();
		toothStatus.add(getToothStatusVO());

		return ClaimHeaderVO.builder().dental(DentalVO.builder().toothStatusList(toothStatus).build()).build();
	}

	@Test
	public void testSaveTemplate() throws YorosisException, IOException {
		YorosisContext.set(new YorosisContext("test", true));

		ResponseVO createResponse = templateService.saveTemplate(getClaimVO());

		assertEquals("Template created successfully", createResponse.getResponse());
		templateService.getTemplateList();

		ResponseVO updateResponse = templateService.saveTemplate(getClaimVOWithId(1L, "First"));
		assertEquals("Template updated successfully", updateResponse.getResponse());
		YorosisException exceptionInvalidId = Assertions.assertThrows(YorosisException.class, () -> {
			templateService.saveTemplate(getClaimVOWithId(5L, "Not in db"));
		});
		Assertions.assertEquals("Templated id not in db", exceptionInvalidId.getMessage());
		ResponseVO createResponseWithoutId = templateService.saveTemplate(getClaimVOWithoutTemplateId("second"));

		assertEquals("Template created successfully", createResponseWithoutId.getResponse());
		templateService.saveTemplate(getClaimVOWithId(0L, "Hello"));
		ResponseVO existResponseWithoutId = templateService.saveTemplate(getClaimVOWithoutTemplateId("second"));

		assertEquals("Template Name already exist", existResponseWithoutId.getResponse());

	}

	@Test
	public void testGetTemplateDetails() throws IOException, YorosisException {
		YorosisContext.set(new YorosisContext("test", true));

		templateService.saveTemplate(getClaimVOWithoutTemplateId("Four"));
		TestcaseVO claimVO = templateService.getTemplateDetails(1L);
		assertNotNull(claimVO);
		templateService.deleteTemplateDetails(1L);

		templateService.saveTemplate(getInstitutionalClaimsVO());
		TestcaseVO institutionalClaimVO = templateService.getTemplateDetails(2L);
		assertEquals("Institutional", institutionalClaimVO.getFormType());
		assertEquals(1, institutionalClaimVO.getClaimHeader().getSurgicalCodeList().size());
		assertEquals(1, institutionalClaimVO.getClaimHeader().getOccuranceCodeList().size());
		assertEquals(1, institutionalClaimVO.getClaimHeader().getOccuranceSpanCodeList().size());
		assertEquals(1, institutionalClaimVO.getClaimHeader().getValueCodeList().size());

		templateService.saveTemplate(getDentalClaimVO());
		TestcaseVO dentalClaimVO = templateService.getTemplateDetails(3L);
		assertEquals("Dental", dentalClaimVO.getFormType());
		assertEquals(1, dentalClaimVO.getClaimHeader().getDental().getToothStatusList().size());

	}

	@Test
	public void testDeleteTemplateDetails() throws YorosisException, IOException {
		YorosisContext.set(new YorosisContext("test", true));

		templateService.saveTemplate(getClaimVOWithoutTemplateId("third"));
		ResponseVO deletedResponse = templateService.deleteTemplateDetails(1L);
		assertEquals("Template deleted Successfully", deletedResponse.getResponse());
		lookupDataRepository.save(LookupData.builder().code("Professional").description("Form").type("Form Type").build());
		templateService.saveTemplate(getClaimVOWithoutTemplateId("Claim Template"));
		claimRepository.save(Testcases.builder().id(1L).testcaseName("Claim Test").jsonData("data").formType(lookupDataRepository.getOne(1L))
				.template(templateRepository.findByTemplateName("Claim Template")).build());

		ResponseVO deletedResponseWithClaim = templateService.deleteTemplateDetails(2L);
		assertEquals("Claims uses this template", deletedResponseWithClaim.getResponse());

	}

	@Test
	public void testGetTemplateList() throws YorosisException, IOException {
		templateService.saveTemplate(getClaimVOWithId(0L, "List"));
		List<TemplateVO> templateList = templateService.getTemplateList();
		assertNotNull(templateList);
		assertEquals(1, templateList.size());
	}

	@Test
	public void testGetAccess() throws YorosisException, IOException {
		YorosisContext.set(new YorosisContext("test", true));
		templateService.saveTemplate(getClaimVOWithId(0L, "List"));
		boolean access = templateService.getAccess(0L);
		assertEquals(true, access);

		YorosisContext.set(new YorosisContext("test1", true));
		TestcaseVO vo = TestcaseVO.builder().templateId(1L).templateName("List1").claimReceiver("receiver").claimSubmitters("submitter").formType("type").createdBy("test1").build();
		templateService.saveTemplate(vo);
		boolean nonAccess = templateService.getAccess(1L);
		assertEquals(true, nonAccess);
	}

	@Test
	public void testSaveDuplicateTemplate() throws YorosisException, IOException {
		YorosisContext.set(new YorosisContext("test", true));

		templateService.saveTemplate(getClaimVOWithoutTemplateId("third"));
		ResponseVO saveDuplicateTemplate = templateService.saveDuplicateTemplate(getDuplicateTemplateVO());
		assertEquals("Duplicate Template Created Successfully", saveDuplicateTemplate.getResponse());

	}

	@Override
	protected DataSource getDatasource() {
		return datasource;
	}

}
