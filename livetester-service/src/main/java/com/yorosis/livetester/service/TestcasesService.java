package com.yorosis.livetester.service;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.reflect.MethodUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.yorosis.livetester.entities.Categories;
import com.yorosis.livetester.entities.LookupData;
import com.yorosis.livetester.entities.Template;
import com.yorosis.livetester.entities.TestcaseCategories;
import com.yorosis.livetester.entities.Testcases;
import com.yorosis.livetester.entities.Users;
import com.yorosis.livetester.exception.YorosisException;
import com.yorosis.livetester.grid.services.AbstractGridDataService;
import com.yorosis.livetester.grid.vo.PaginationVO;
import com.yorosis.livetester.grid.vo.TableData;
import com.yorosis.livetester.repo.BatchTestcaseRepository;
import com.yorosis.livetester.repo.LookupDataRepository;
import com.yorosis.livetester.repo.TemplateRepository;
import com.yorosis.livetester.repo.TestcaseCategoriesRepository;
import com.yorosis.livetester.repo.TestcaseGroupsRepository;
import com.yorosis.livetester.repo.TestcasesRepository;
import com.yorosis.livetester.repo.UsersRepository;
import com.yorosis.livetester.security.YorosisContext;
import com.yorosis.livetester.vo.ClaimHeaderInternalDiagnosisVO;
import com.yorosis.livetester.vo.ClaimHeaderInternalDiagnosisVO.ClaimHeaderInternalDiagnosisVOBuilder;
import com.yorosis.livetester.vo.ClaimHeaderInternalVO;
import com.yorosis.livetester.vo.ClaimHeaderVO;
import com.yorosis.livetester.vo.ClaimOccuranceCodeVO;
import com.yorosis.livetester.vo.ClaimOccuranceSpanCodeVO;
import com.yorosis.livetester.vo.ClaimServiceInternalModifiersVO;
import com.yorosis.livetester.vo.ClaimServiceInternalModifiersVO.ClaimServiceInternalModifiersVOBuilder;
import com.yorosis.livetester.vo.ClaimServiceInternalVO;
import com.yorosis.livetester.vo.ClaimServiceVO;
import com.yorosis.livetester.vo.ClaimSurgicalCodeVO;
import com.yorosis.livetester.vo.ClaimValueCodeVO;
import com.yorosis.livetester.vo.DuplicateTestcaseVO;
import com.yorosis.livetester.vo.ResponseVO;
import com.yorosis.livetester.vo.TestcaseGroupVO;
import com.yorosis.livetester.vo.TestcaseVO;
import com.yorosis.livetester.vo.TestcaseWrapperVO;

@Service
public class TestcasesService extends AbstractGridDataService {

	@Autowired
	private TemplateRepository templateRepository;

	@Autowired
	private TestcasesRepository testcasesRepository;

	@Autowired
	private TestcaseGroupsRepository testcaseGroupsRepo;

	@Autowired
	private TestcaseCategoriesRepository testcaseCategoriesRepo;

	@Autowired
	private BatchTestcaseRepository batchTestcaseRepo;

	@Autowired
	private LookupDataRepository lookupDataRepository;

	@Autowired
	private UsersRepository userRepository;

	@PersistenceContext
	private EntityManager em;

	private final ObjectMapper mapper = new ObjectMapper();

	@Value("classpath:stylesheet.xsl")
	private Resource resource;

	@Transactional
	public ResponseVO saveTestcase(TestcaseWrapperVO claimEntityVO) throws IOException, YorosisException {
		String msg = null;
		String user = YorosisContext.get().getUserName();
		int countGetByClaimTestCaseName = testcasesRepository.countGetByTestCaseName(claimEntityVO.getTestCaseName());

		if (countGetByClaimTestCaseName == 0) {
			ObjectWriter writer = new ObjectMapper().writer();

			Long templateId = claimEntityVO.getTemplateId();

			Template templateDetail = templateRepository.getOne(templateId);
			LookupData formTypeLookupData = lookupDataRepository.findByCodeAndType(claimEntityVO.getJsonData().getFormType(), "form_type");

			TestcaseVO claimVO = claimEntityVO.getJsonData();
			JsonNode convertedObject = mapper.readValue(claimVO.getClaimHeader().getExpectedElements(), JsonNode.class);
			claimVO.getClaimHeader().setExpectedResult(convertedObject);

			removeHeaderEmptyNestObjects(claimVO);
			int lineSeqNo = 1;
			for (ClaimServiceVO service : claimVO.getServices()) {
				service.setExpectedResult(mapper.readValue(service.getExpectedElements(), JsonNode.class));
				
				updateInternalObject(lineSeqNo++, service, claimVO.getClaimHeader());
			}

			Testcases testcase = Testcases.builder().testcaseName(claimEntityVO.getTestCaseName()).template(templateDetail).jsonData(writer.writeValueAsString(claimVO))
					.createdBy(user).createdDate(getCurrentTimestamp()).updatedBy(user).updatedDate(getCurrentTimestamp()).formType(formTypeLookupData).build();

			Set<TestcaseCategories> setGroupVO = new HashSet<>();
			TestcaseGroupVO[] testcaseGroups = claimEntityVO.getTestcaseGroups();

			for (TestcaseGroupVO testGroupVO : testcaseGroups) {
				Categories dbTestCaseGroup = testcaseGroupsRepo.getOne(testGroupVO.getId());
				TestcaseCategories claimsTestGroup = TestcaseCategories.builder().createdBy(user).createdDate(getCurrentTimestamp()).testcase(testcase)
						.testCaseGrpID(testGroupVO.getId()).testcaseGroups(dbTestCaseGroup).build();
				setGroupVO.add(claimsTestGroup);
				testcase.setClaimsTestcaseGroups(setGroupVO);
			}

			testcasesRepository.save(testcase);
			msg = "Testcase created successfully";

		} else {
			msg = "Testcase name already exists";
		}
		return ResponseVO.builder().response(msg).build();
	}

	private void removeHeaderEmptyNestObjects(TestcaseVO claimVO) {
		if (StringUtils.equalsIgnoreCase(claimVO.getFormType(), "I")) {
			ClaimHeaderVO claimHeader = claimVO.getClaimHeader();
			
			removeEmptyCodes(claimHeader.getConditionCodeList());
			removeEmptyCodes(claimHeader.getTreatmentCodeList());
			
			removeEmptyOccuranceAndSpanCodes(claimHeader);
			removeEmptySurgicalCodes(claimHeader);
			removeEmptyValueCodes(claimHeader);
		}
	}
	
	private void removeEmptyValueCodes(ClaimHeaderVO claimHeader) {
		if (claimHeader.getValueCodeList() != null) {
			Iterator<ClaimValueCodeVO> iterator = claimHeader.getValueCodeList().iterator();
			while (iterator.hasNext()) {
				ClaimValueCodeVO valueCodeVo = iterator.next();
				if (valueCodeVo == null || StringUtils.isBlank(valueCodeVo.getValueCode())) {
					iterator.remove();
				}
			}
		}
	}

	private void removeEmptySurgicalCodes(ClaimHeaderVO claimHeader) {
		if (claimHeader.getSurgicalCodeList() != null) {
			Iterator<ClaimSurgicalCodeVO> iterator = claimHeader.getSurgicalCodeList().iterator();
			while (iterator.hasNext()) {
				ClaimSurgicalCodeVO surgicalCodeVO = iterator.next();
				if (surgicalCodeVO == null || StringUtils.isBlank(surgicalCodeVO.getSurgicalCode())) {
					iterator.remove();
				}
			}
		}
	}

	private void removeEmptyCodes(List<String> codesList) {
		if (codesList != null) {
			Iterator<String> iterator = codesList.iterator();
			while (iterator.hasNext()) {
				if (StringUtils.isBlank(iterator.next())) {
					iterator.remove();
				}
			}
		}
	}
	
	private void removeEmptyOccuranceAndSpanCodes(ClaimHeaderVO claimHeader) {
		List<ClaimOccuranceCodeVO> occuranceCodeList = claimHeader.getOccuranceCodeList();
		if (occuranceCodeList != null) {
			Iterator<ClaimOccuranceCodeVO> iterator = occuranceCodeList.iterator();
			while (iterator.hasNext()) {
				ClaimOccuranceCodeVO occuranceCodeVO = iterator.next();
				if (occuranceCodeVO == null || StringUtils.isBlank(occuranceCodeVO.getOccuranceCode())) {
					iterator.remove();
				}
			}
		}
		
		List<ClaimOccuranceSpanCodeVO> occuranceSpanCodeList = claimHeader.getOccuranceSpanCodeList();
		if (occuranceSpanCodeList != null) {
			Iterator<ClaimOccuranceSpanCodeVO> iterator = occuranceSpanCodeList.iterator();
			while (iterator.hasNext()) {
				ClaimOccuranceSpanCodeVO occuranceSpanCodeVO = iterator.next();
				if (occuranceSpanCodeVO == null || StringUtils.isBlank(occuranceSpanCodeVO.getOccuranceSpanCode())) {
					iterator.remove();
				}
			}
		}
	}

	private void updateInternalObject(int lineSeqNo, ClaimServiceVO service, ClaimHeaderVO claimHeader) throws YorosisException {
		if (claimHeader.getInternal() == null || claimHeader.getInternal().getSecondaryDiagnosis() == null) {
			ClaimHeaderInternalDiagnosisVO headerDiagnosisVo = getInternalHeaderDiagnosisCodes(claimHeader.getSecondaryDiagnosisList());
			ClaimHeaderInternalVO secondaryDiagnosis = ClaimHeaderInternalVO.builder().secondaryDiagnosis(headerDiagnosisVo).build();
			claimHeader.setInternal(secondaryDiagnosis);
		}
		
		int diagnosisPointer1 = getDiagnosisPointer(claimHeader, service.getDiagnosisCode1());
		int diagnosisPointer2 = getDiagnosisPointer(claimHeader, service.getDiagnosisCode2());
		int diagnosisPointer3 = getDiagnosisPointer(claimHeader, service.getDiagnosisCode3());
		int diagnosisPointer4 = getDiagnosisPointer(claimHeader, service.getDiagnosisCode4());

		ClaimServiceInternalModifiersVO modifiers = getModifiers(service);
		ClaimServiceInternalVO internalVO = ClaimServiceInternalVO.builder().lineSequenceNo(lineSeqNo).modifiers(modifiers)
				.diagnosisCodePointer1(diagnosisPointer1).diagnosisCodePointer2(diagnosisPointer2).diagnosisCodePointer3(diagnosisPointer3)
				.diagnosisCodePointer4(diagnosisPointer4).build();
		
		service.setInternal(internalVO);		
	}

	private ClaimHeaderInternalDiagnosisVO getInternalHeaderDiagnosisCodes(List<String> secondaryDiagnosisList) throws YorosisException {
		ClaimHeaderInternalDiagnosisVOBuilder diagBuilder = ClaimHeaderInternalDiagnosisVO.builder();
		int index = 1;
		if (secondaryDiagnosisList != null && !secondaryDiagnosisList.isEmpty()) {
			for (String diagnosisCode : secondaryDiagnosisList) {
				setValue(diagBuilder, "diagCode" + index, diagnosisCode);
				index++;
			}			
		}
		for (int i = index; i < 13; i++) {
			setValue(diagBuilder, "diagCode" + index, "");
			index++;
		}
		
		return diagBuilder.build();
	}
	
	private void setValue(Object object, String methodName, Object... args) throws YorosisException {
		try {
			MethodUtils.invokeExactMethod(object, methodName, args);
		} catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
			throw new YorosisException(e);
		}
	}

	private int getDiagnosisPointer(ClaimHeaderVO claimHeader, String diagnosisCode) {
		int diagnosisPointer = -1;
		if (StringUtils.isNotBlank(diagnosisCode)) {
			if (StringUtils.equalsIgnoreCase(claimHeader.getPrimaryDiagnosis(), diagnosisCode)) {
				diagnosisPointer = 1;
			} else if (StringUtils.equalsIgnoreCase(claimHeader.getAdmitDiagnosis(), diagnosisCode)) { 
				diagnosisPointer = 31;
			} else if (claimHeader.getSecondaryDiagnosisList() != null && !claimHeader.getSecondaryDiagnosisList().isEmpty()) {
				int index = 2;
				for (String diagCode : claimHeader.getSecondaryDiagnosisList()) {
					if (StringUtils.equalsIgnoreCase(diagCode, diagnosisCode)) {
						diagnosisPointer = index;
						break;
					}
					index++;
				}
			}
		}
		
		return diagnosisPointer;
	}

	private ClaimServiceInternalModifiersVO getModifiers(ClaimServiceVO service) {
		ClaimServiceInternalModifiersVOBuilder modifiersBuilder = ClaimServiceInternalModifiersVO.builder().modifier1("").modifier2("").modifier3("").modifier4("");
		List<String> modifiersList = service.getModifiersList();
		if (modifiersList != null && !modifiersList.isEmpty()) {
			Iterator<String> iterator = modifiersList.iterator();

			if (iterator.hasNext()) {
				modifiersBuilder.modifier1(iterator.next());
			}
			
			if (iterator.hasNext()) {
				modifiersBuilder.modifier2(iterator.next());
			}
			
			if (iterator.hasNext()) {
				modifiersBuilder.modifier3(iterator.next());
			}
			
			if (iterator.hasNext()) {
				modifiersBuilder.modifier4(iterator.next());
			}
		}
		
		return modifiersBuilder.build();
	}

	@Transactional
	public ResponseVO updateTestcase(TestcaseWrapperVO claimEntityVO) throws IOException, YorosisException {
		Long testcaseId = claimEntityVO.getId();
		String user = YorosisContext.get().getUserName();
		ObjectWriter writer = new ObjectMapper().writer();
		Testcases existingTestcase = testcasesRepository.getOne(testcaseId);

		LookupData formTypeLookupData = lookupDataRepository.findByCodeAndType(claimEntityVO.getJsonData().getFormType(), "form_type");

		testcaseCategoriesRepo.deleteByTestcases(claimEntityVO.getId());

		Set<TestcaseCategories> setGroupVO = new HashSet<>();
		TestcaseGroupVO[] testcaseGroups = claimEntityVO.getTestcaseGroups();

		for (TestcaseGroupVO testGroupVO : testcaseGroups) {
			Categories dbTestCaseGroup = testcaseGroupsRepo.getOne(testGroupVO.getId());
			TestcaseCategories claimsTestGroup = TestcaseCategories.builder().updatedBy(user).updatedDate(getCurrentTimestamp()).testcase(existingTestcase)
					.testCaseGrpID(testGroupVO.getId()).testcaseGroups(dbTestCaseGroup).build();
			setGroupVO.add(claimsTestGroup);
			existingTestcase.setClaimsTestcaseGroups(setGroupVO);
		}

		TestcaseVO claimVO = claimEntityVO.getJsonData();
		JsonNode convertedObject = mapper.readValue(claimVO.getClaimHeader().getExpectedElements(), JsonNode.class);
		claimVO.getClaimHeader().setExpectedResult(convertedObject);
		
		removeHeaderEmptyNestObjects(claimVO);

		int lineSeqNo = 1;
		for (ClaimServiceVO service : claimVO.getServices()) {
			service.setExpectedResult(mapper.readValue(service.getExpectedElements(), JsonNode.class));
			updateInternalObject(lineSeqNo++, service, claimVO.getClaimHeader());
		}

		existingTestcase.setJsonData(writer.writeValueAsString(claimVO));
		existingTestcase.setTestcaseName(claimEntityVO.getTestCaseName());
		existingTestcase.setUpdatedBy(user);
		existingTestcase.setUpdatedDate(getCurrentTimestamp());
		existingTestcase.setFormType(formTypeLookupData);
		testcasesRepository.save(existingTestcase);

		return ResponseVO.builder().response("Testcase updated successfully").build();
	}

	@Transactional
	public List<TestcaseGroupVO> getTestGroup() {
		List<TestcaseGroupVO> testGroupList = new ArrayList<>();
		List<Categories> testCaseGroupList = testcaseGroupsRepo.findAll();
		for (Categories testCaseGroup : testCaseGroupList) {
			testGroupList.add(
					TestcaseGroupVO.builder().testcaseGroupName(testCaseGroup.getTestcaseGroupName()).id(testCaseGroup.getId()).description(testCaseGroup.getDescription()).build());
		}
		return testGroupList;

	}

	@Override
	@Transactional
	public TableData getGridData(PaginationVO pagination) throws IOException, YorosisException {
		List<Map<String, String>> list = new ArrayList<>();

		String totalCount = null;
		TableData tableData = null;
		Map<String, String> dataMap = null;
		List<Testcases> testcasesDataList = null;
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

		Pageable pageable = getPageableObject(pagination);

		if (StringUtils.equalsIgnoreCase("claims", pagination.getGridId())) {
			totalCount = testcasesRepository.getTotalTestcasesCount();

			if (!YorosisContext.get().isGlobalAccess()) {
				testcasesDataList = testcasesRepository.getTestcasesListForNonAccessUsers(pageable, YorosisContext.get().getUserName());

			} else {
				testcasesDataList = testcasesRepository.getTestcasesList(pageable);
			}

			tableData = TableData.builder().data(list).totalRecords(totalCount).build();
			for (Testcases claim : testcasesDataList) {
				TestcaseVO claimVO = mapper.readValue(claim.getJsonData(), TestcaseVO.class);

				dataMap = new HashMap<>();
				dataMap.put("col19", Long.toString(claim.getId()));
				Users user = userRepository.findByUserName(claim.getCreatedBy());
				dataMap.put("col1", user.getFirstName() + " " + user.getLastName());
				dataMap.put("col2", claim.getTestcaseName());
				dataMap.put("col3", claim.getTemplate().getTemplateName());
				dataMap.put("col4", claimVO.getFormType());
				dataMap.put("col5", claimVO.getBeneficiary().getIdentifier());
				dataMap.put("col6", claimVO.getBeneficiary().getFirstName());
				dataMap.put("col7", claimVO.getBeneficiary().getLastName());
				dataMap.put("col8", claimVO.getBilling().getNpi());
				dataMap.put("col9", claimVO.getBilling().getTaxonomy());
				dataMap.put("col10", claimVO.getServicing().getNpi());
				dataMap.put("col11", claimVO.getServicing().getTaxonomy());
				dataMap.put("col12", formatString(claimVO.getClaimHeader().getFromDate()));
				dataMap.put("col13", formatString(claimVO.getClaimHeader().getToDate()));
				dataMap.put("col14", claimVO.getClaimHeader().getFrequency());
				dataMap.put("col15", claimVO.getClaimHeader().getSource());
				dataMap.put("col16", Double.toString(claimVO.getClaimHeader().getBilledAmount()));
				dataMap.put("col17", Double.toString(claimVO.getClaimHeader().getBilledUnits()));

				list.add(dataMap);
			}
		} else {
			throw new YorosisException("Invalid Grid Id");
		}
		return tableData;
	}

	@Transactional
	public TestcaseVO getTestcaseDetails(Long id) throws IOException {
		Testcases claim = testcasesRepository.getOne(id);
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		return mapper.readValue(claim.getJsonData(), TestcaseVO.class);
	}

	@Override
	public String getGridModuleId() {
		return "claims";
	}

	private String formatString(String a) {
		String[] split = a.substring(0, 10).split("-");
		return (split[1] + "/" + split[2] + "/" + split[0]);

	}

	@Transactional
	public TestcaseWrapperVO getTestcaseDetailsForUpdate(Long id) throws IOException {
		Testcases claimDetails = testcasesRepository.getOne(id);

		Set<TestcaseCategories> claimsTestcaseGroups = claimDetails.getClaimsTestcaseGroups();

		TestcaseGroupVO[] testGrouplist = new TestcaseGroupVO[claimsTestcaseGroups.size()];
		int i = 0;
		for (TestcaseCategories claimTestGroup : claimDetails.getClaimsTestcaseGroups()) {
			TestcaseGroupVO testGroupVO = TestcaseGroupVO.builder().id(claimTestGroup.getTestcaseGroups().getId()).build();
			testGrouplist[i++] = testGroupVO;
		}

		TestcaseVO claimVO = mapper.readValue(claimDetails.getJsonData(), TestcaseVO.class);

		return TestcaseWrapperVO.builder().id(id).templateId(claimDetails.getTemplate().getId()).testCaseName(claimDetails.getTestcaseName()).jsonData(claimVO)
				.testcaseGroups(testGrouplist).build();
	}

	private Timestamp getCurrentTimestamp() {
		Date date = new Date();
		long time = date.getTime();
		return new Timestamp(time);
	}

	public ResponseVO deleteTestcase(Long id) {
		String message = null;
		int deleted = 0;

		if (batchTestcaseRepo.countClaimInBatch(id) > 0) {
			message = "Testcase Assoicate with Batch";
		} else {
			testcasesRepository.deleteById(id);
			message = "Testcase deleted Successfully";
			deleted = 1;
		}

		return ResponseVO.builder().response(message).isDeleted(deleted).build();
	}

	@Transactional
	public ResponseVO saveDuplicateTestcase(DuplicateTestcaseVO duplicateClaimVO) {
		String user = YorosisContext.get().getUserName();

		String msg = null;

		int countGetByClaimTestCaseName = testcasesRepository.countGetByTestCaseName(duplicateClaimVO.getTestCaseName());

		if (countGetByClaimTestCaseName > 0) {
			msg = "Testcase name already exists";
		} else {
			Testcases testcase = testcasesRepository.getOne(duplicateClaimVO.getClaimId());

			Testcases testcaseDuplicate = Testcases.builder().testcaseName(duplicateClaimVO.getTestCaseName()).template(testcase.getTemplate()).jsonData(testcase.getJsonData())
					.createdBy(user).createdDate(getCurrentTimestamp()).updatedBy(user).updatedDate(getCurrentTimestamp()).formType(testcase.getFormType()).build();

			Set<TestcaseCategories> setGroupVO = new HashSet<>();
			TestcaseGroupVO[] testcaseGroups = duplicateClaimVO.getTestcaseGroups();

			for (TestcaseGroupVO testGroupVO : testcaseGroups) {
				Categories dbTestCaseGroup = testcaseGroupsRepo.getOne(testGroupVO.getId());
				TestcaseCategories claimsTestGroup = TestcaseCategories.builder().createdBy(user).createdDate(getCurrentTimestamp()).testcase(testcaseDuplicate)
						.testCaseGrpID(testGroupVO.getId()).testcaseGroups(dbTestCaseGroup).build();
				setGroupVO.add(claimsTestGroup);
				testcaseDuplicate.setClaimsTestcaseGroups(setGroupVO);
			}
			testcasesRepository.save(testcaseDuplicate);
			msg = "Duplicate Testcase Created Successfully";
		}
		return ResponseVO.builder().response(msg).build();
	}

}
