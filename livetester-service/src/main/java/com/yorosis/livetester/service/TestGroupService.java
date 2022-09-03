package com.yorosis.livetester.service;

import java.io.IOException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import javax.annotation.PostConstruct;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.Transactional;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.yorosis.livetester.constants.Constants;
import com.yorosis.livetester.entities.Batch;
import com.yorosis.livetester.entities.BatchTestcases;
import com.yorosis.livetester.entities.BatchTestcasesResult;
import com.yorosis.livetester.entities.Categories;
import com.yorosis.livetester.entities.ElementsConfiguration;
import com.yorosis.livetester.entities.Environment;
import com.yorosis.livetester.entities.EnvironmentPreset;
import com.yorosis.livetester.entities.EnvironmentSavedPreset;
import com.yorosis.livetester.entities.TestcaseCategories;
import com.yorosis.livetester.entities.Testcases;
import com.yorosis.livetester.exception.YorosisException;
import com.yorosis.livetester.repo.BatchRepository;
import com.yorosis.livetester.repo.ElementConfigRepository;
import com.yorosis.livetester.repo.EnvironmentPresetRepository;
import com.yorosis.livetester.repo.EnvironmentRepository;
import com.yorosis.livetester.repo.EnvironmentSavedPresetRepository;
import com.yorosis.livetester.repo.TestcaseGroupsRepository;
import com.yorosis.livetester.repo.TestcasesRepository;
import com.yorosis.livetester.security.YorosisContext;
import com.yorosis.livetester.vo.BeneficiaryVO;
import com.yorosis.livetester.vo.ClaimServiceVO;
import com.yorosis.livetester.vo.EnvironmentPresetVO;
import com.yorosis.livetester.vo.PaVO;
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

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class TestGroupService {
	private static final String SUBMITTED = "submitted";

	@Autowired
	private TestcaseGroupsRepository testcaseGroupsRepository;

	@Autowired
	private BatchRepository batchRepository;

	@Autowired
	private EnvironmentRepository environmentRepository;

	@Autowired
	private TestcasesRepository testcaseRepository;

	@Autowired
	private ElementConfigRepository elementsConfigRepository;

	@Autowired
	private BatchTestCaseExecutorService batchTestCaseExecutorService;

	@Autowired
	private EnvironmentPresetRepository environmentPresetRepository;

	@Autowired
	private EnvironmentSavedPresetRepository environmentSavedPresetRepository;

	@PersistenceContext
	private EntityManager em;

	private final ObjectMapper mapper = new ObjectMapper();
	
	@PostConstruct
	private void postConstruct() {
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
	}
		
	private TestcaseGroupVO constructDTOToVO(Categories testGroup) {
		return TestcaseGroupVO.builder().testcaseGroupName(testGroup.getTestcaseGroupName()).description(testGroup.getDescription()).id(testGroup.getId()).build();
	}

	@Transactional
	public ResponseVO saveTestGroup(TestcaseGroupVO testGroupVO) {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		String userName = YorosisContext.get().getUserName();

		Categories testGroup = Categories.builder().testcaseGroupName(testGroupVO.getTestcaseGroupName()).description(testGroupVO.getDescription()).createdDate(currentTimestamp)
				.updatedDate(currentTimestamp).createdBy(userName).updatedBy(userName).build();
		String message = "TestGroup created successfully";

		if (testGroupVO.getId() != null && testGroupVO.getId() > 0) {
			testGroup = testcaseGroupsRepository.findByTestcaseGroupName(testGroupVO.getTestcaseGroupName());
			testGroup.setDescription(testGroupVO.getDescription());
			testGroup.setUpdatedBy(userName);
			testGroup.setUpdatedDate(currentTimestamp);
			message = "TestGroup updated successfully";
		}

		testcaseGroupsRepository.save(testGroup);
		return ResponseVO.builder().response(message).build();
	}

	@Transactional
	public List<TestcaseGroupVO> getListOfTestCaseGroups() {
		List<TestcaseGroupVO> listTestGroup = new ArrayList<>();

		List<Categories> testcaseGroups = testcaseGroupsRepository.findAllByOrderByIdDesc();
		for (Categories testGroup : testcaseGroups) {
			TestcaseGroupVO vo = constructDTOToVO(testGroup);
			listTestGroup.add(vo);
		}

		return listTestGroup;
	}

	@Transactional
	public List<TestcaseGroupVO> getTestGroup() throws IOException {
		List<TestcaseGroupVO> list = new ArrayList<>();
		List<TestcaseVO> testcaseVoList = null;
		for (Categories testcaseGroup : testcaseGroupsRepository.findAll()) {
			if (!testcaseGroup.getTestcaseCategories().isEmpty()) {
				if (!YorosisContext.get().isGlobalAccess()) {
					testcaseVoList = getTestcaseCategoriesListForNonGlobalUsers(testcaseGroup);
				} else {
					testcaseVoList = getTestcaseCategoriesListForGlobalUsers(testcaseGroup);
				}

				TestcaseGroupVO testcaseGroupVO = TestcaseGroupVO.builder().id(testcaseGroup.getId()).testcaseGroupName(testcaseGroup.getTestcaseGroupName())
						.description(testcaseGroup.getDescription()).claimVO(testcaseVoList).build();

				list.add(testcaseGroupVO);
			}
		}
		return list;
	}

	private List<TestcaseVO> getTestcaseCategoriesListForNonGlobalUsers(Categories testcaseGroup) throws IOException {
		List<TestcaseVO> claimVoList = new ArrayList<>();
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		for (TestcaseCategories testList : testcaseGroup.getTestcaseCategories()) {
			if ((testList.getTestcaseGroups().getId() == testcaseGroup.getId()) && StringUtils.equalsIgnoreCase(YorosisContext.get().getUserName(), testList.getCreatedBy())) {
				TestcaseVO claimVo = mapper.readValue(testList.getTestcase().getJsonData(), TestcaseVO.class);
				claimVo.setClaimTestcaseName(testList.getTestcase().getTestcaseName());
				claimVo.setClaimId(testList.getTestcase().getId());
				claimVoList.add(claimVo);
			}
		}
		return claimVoList;
	}

	private List<TestcaseVO> getTestcaseCategoriesListForGlobalUsers(Categories testcaseGroup) throws IOException {
		List<TestcaseVO> testcaseVoList = new ArrayList<>();
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		for (TestcaseCategories testList : testcaseGroup.getTestcaseCategories()) {
			if (testList.getTestcaseGroups().getId() == testcaseGroup.getId()) {
				TestcaseVO testcaseVo = mapper.readValue(testList.getTestcase().getJsonData(), TestcaseVO.class);
				testcaseVo.setClaimTestcaseName(testList.getTestcase().getTestcaseName());
				testcaseVo.setClaimId(testList.getTestcase().getId());
				testcaseVoList.add(testcaseVo);
			}

		}
		return testcaseVoList;
	}

	@Transactional
	public TestcaseGroupVO getListOfTestCaseInfo(long id) {
		Categories testcaseGroup = testcaseGroupsRepository.getOne(id);
		return constructDTOToVO(testcaseGroup);
	}

	private Set<BatchTestcasesResult> buildBatchTestcasesResult(Map<String, ElementsConfiguration> elementsConfigMap, Testcases claim, BatchTestcases batchTestcases) throws IOException {
		TestcaseVO claimVO = mapper.readValue(claim.getJsonData(), TestcaseVO.class);

		Set<BatchTestcasesResult> batchTestcasesResult = new LinkedHashSet<>();
		buildExpectedResults(batchTestcasesResult, "header", 0, claimVO.getClaimHeader().getExpectedResult(), elementsConfigMap, batchTestcases);
		
		List<ClaimServiceVO> services = claimVO.getServices();
		int seqNo = 1;
		for (ClaimServiceVO claimServiceVO : services) {
			buildExpectedResults(batchTestcasesResult, "line", seqNo++, claimServiceVO.getExpectedResult(), elementsConfigMap, batchTestcases);
		}

		return batchTestcasesResult;
	}
	
	private void buildExpectedResults(Set<BatchTestcasesResult> batchTestcasesResult, String applicableAt, int seqNo, JsonNode expectedResults, Map<String, ElementsConfiguration> elementsConfigMap, BatchTestcases batchTestcases) {
		if (expectedResults != null) {
			Iterator<Entry<String, JsonNode>> fields = expectedResults.fields();
			while (fields.hasNext()) {
				Entry<String, JsonNode> entry = fields.next();
				
				String key = applicableAt.trim().toLowerCase() + "-" + entry.getKey().toLowerCase().trim();
				ElementsConfiguration elementsConfiguration = elementsConfigMap.get(key);
				if (elementsConfiguration != null) {
					BatchTestcasesResult testcasesResult = BatchTestcasesResult.builder().expectedValue(entry.getValue() != null ? entry.getValue().asText() : "").build();
					updateBatchTestcasesResult(testcasesResult, batchTestcases, new Timestamp(System.currentTimeMillis()), elementsConfiguration, seqNo, batchTestcasesResult);
				}
			}
		}
	}

	private void updateBatchTestcasesResult(BatchTestcasesResult testcasesResult, BatchTestcases batchTestcases, Timestamp currentTimestamp, 
			ElementsConfiguration elementsConfiguration, int seqNo, Set<BatchTestcasesResult> batchTestcasesResult) {
		if (elementsConfiguration == null) {
			return;
		}

		testcasesResult.setBatchTestcases(batchTestcases);
		testcasesResult.setCreatedBy(YorosisContext.get().getUserName());
		testcasesResult.setCreatedDate(currentTimestamp);
		testcasesResult.setUpdatedBy(YorosisContext.get().getUserName());
		testcasesResult.setUpdatedDate(currentTimestamp);
		testcasesResult.setElementsConfiguration(elementsConfiguration);
		testcasesResult.setStatus(SUBMITTED);
		testcasesResult.setSeqNo(seqNo);

		batchTestcasesResult.add(testcasesResult);
	}

	@Transactional
	public ResponseVO deleteTestCaseGroup(Long id) {
		String message = "Test Group case have testcase(s) assigned";
		int deleted = 0;

		if (testcaseGroupsRepository.getOne(id).getTestcaseCategories().isEmpty()) {
			testcaseGroupsRepository.deleteById(id);
			message = "Testcase Group deleted successfully";
			deleted = 1;
		}

		return ResponseVO.builder().response(message).isDeleted(deleted).build();
	}

	@Transactional
	public List<EnvironmentPresetVO> getReplacementDetails(ReplacementOptionVO replacementOptionVO) throws IOException, YorosisException {
		List<EnvironmentPresetVO> envPresetVO = new ArrayList<>();
		List<EnvironmentPreset> jsonDetailList = environmentPresetRepository.getJsonDetail(replacementOptionVO.getEnviornmentId(), replacementOptionVO.getType(),
				Constants.ACTIVEFLAG);

		if (StringUtils.equals(Constants.BENEFICIARY_TYPE, replacementOptionVO.getType())) {

			for (EnvironmentPreset environmentPreset : jsonDetailList) {
				BeneficiaryVO readValue = mapper.readValue(environmentPreset.getJsonData(), BeneficiaryVO.class);
				envPresetVO
						.add(EnvironmentPresetVO.builder().environmentId(environmentPreset.getEnvironment().getId()).id(environmentPreset.getId()).beneficiary(readValue).build());
			}

		} else if (StringUtils.equals(Constants.PROVIDER_TYPE, replacementOptionVO.getType())) {

			for (EnvironmentPreset environmentPreset : jsonDetailList) {
				ProviderVO readValue = mapper.readValue(environmentPreset.getJsonData(), ProviderVO.class);
				envPresetVO.add(EnvironmentPresetVO.builder().environmentId(environmentPreset.getEnvironment().getId()).id(environmentPreset.getId()).provider(readValue).build());
			}

		} else if (StringUtils.equals(Constants.PAYOR_TYPE, replacementOptionVO.getType())) {

			for (EnvironmentPreset environmentPreset : jsonDetailList) {
				PayorVO readValue = mapper.readValue(environmentPreset.getJsonData(), PayorVO.class);
				envPresetVO.add(EnvironmentPresetVO.builder().environmentId(environmentPreset.getEnvironment().getId()).id(environmentPreset.getId()).payor(readValue).build());
			}
		} else if (StringUtils.equals(Constants.PA_TYPE, replacementOptionVO.getType())) {

			for (EnvironmentPreset environmentPreset : jsonDetailList) {
				PaVO readValue = mapper.readValue(environmentPreset.getJsonData(), PaVO.class);
				envPresetVO.add(EnvironmentPresetVO.builder().environmentId(environmentPreset.getEnvironment().getId()).id(environmentPreset.getId()).paVO(readValue).build());
			}

		} else {
			throw new YorosisException("Invalid Type");
		}
		return envPresetVO;

	}

	@Transactional
	public Set<UniqueProviderVO> getUniqueProvider(TestExecutionVO testExecutionVO) {
		List<UniqueProviderVO> providerList = new ArrayList<>();
		for (TestGroupItemVO TestGroupItemVO : testExecutionVO.getTestGroupItemVOList()) {
			String identifier = TestGroupItemVO.getClaim().getBilling().getNpi();

			EnvironmentSavedPreset findByIdentifier = environmentSavedPresetRepository.findByIdentifier(identifier, Long.valueOf(testExecutionVO.getEnvironmentName()),
					Constants.PROVIDER_TYPE);
			if (findByIdentifier != null) {
				providerList.add(UniqueProviderVO.builder().providerVO(TestGroupItemVO.getClaim().getBilling()).alwaysReplace(findByIdentifier.getReplaceIdentifier()).build());
			} else {
				providerList.add(UniqueProviderVO.builder().providerVO(TestGroupItemVO.getClaim().getBilling()).build());
			}
		}
		
		Set<UniqueProviderVO> finalSet = new LinkedHashSet<>();
		Set<String> processed = new HashSet<>();
		for (UniqueProviderVO uniqueProviderVO : providerList) {
			if (!processed.contains(uniqueProviderVO.getProviderVO().getNpi())) {
				finalSet.add(uniqueProviderVO);
			}
			processed.add(uniqueProviderVO.getProviderVO().getNpi());
		}
		
		return finalSet;
	}

	@Transactional
	public Set<UniqueBeneficiaryVO> getUniqueBeneficary(TestExecutionVO testExecutionVO) {
		List<UniqueBeneficiaryVO> beneficaryList = new ArrayList<>();
		for (TestGroupItemVO TestGroupItemVO : testExecutionVO.getTestGroupItemVOList()) {
			String identifier = TestGroupItemVO.getClaim().getBeneficiary().getIdentifier();
					
			EnvironmentSavedPreset findByIdentifier = environmentSavedPresetRepository.findByIdentifier(identifier, Long.valueOf(testExecutionVO.getEnvironmentName()),
					Constants.BENEFICIARY_TYPE);
			if (findByIdentifier != null) {
				beneficaryList.add(
						UniqueBeneficiaryVO.builder().beneficiaryVO(TestGroupItemVO.getClaim().getBeneficiary()).alwaysReplace(findByIdentifier.getReplaceIdentifier()).build());
			} else {
				beneficaryList.add(UniqueBeneficiaryVO.builder().beneficiaryVO(TestGroupItemVO.getClaim().getBeneficiary()).build());
			}
		}
		
		Set<UniqueBeneficiaryVO> finalSet = new LinkedHashSet<>();
		Set<String> processed = new HashSet<>();
		for (UniqueBeneficiaryVO uniqueBeneficiaryVO : beneficaryList) {
			if (!processed.contains(uniqueBeneficiaryVO.getBeneficiaryVO().getIdentifier())) {
				finalSet.add(uniqueBeneficiaryVO);
			}
			processed.add(uniqueBeneficiaryVO.getBeneficiaryVO().getIdentifier());
		}
		
		return finalSet;
	}

	@Transactional
	public Set<UniquePayorVO> getUniquePayor(TestExecutionVO testExecutionVO) {
		List<UniquePayorVO> payorList = new ArrayList<>();
		for (TestGroupItemVO TestGroupItemVO : testExecutionVO.getTestGroupItemVOList()) {
			String identifier = TestGroupItemVO.getClaim().getPayor().getIdentifier();
			EnvironmentSavedPreset findByIdentifier = environmentSavedPresetRepository.findByIdentifier(identifier, Long.valueOf(testExecutionVO.getEnvironmentName()),
					Constants.PAYOR_TYPE);
			if (findByIdentifier != null) {
				payorList.add(UniquePayorVO.builder().payorVO(TestGroupItemVO.getClaim().getPayor()).alwaysReplace(findByIdentifier.getReplaceIdentifier()).build());
			} else {
				payorList.add(UniquePayorVO.builder().payorVO(TestGroupItemVO.getClaim().getPayor()).build());
			}
		}
		
		Set<UniquePayorVO> finalSet = new LinkedHashSet<>();
		Set<String> processed = new HashSet<>();
		for (UniquePayorVO uniquePayorVO : payorList) {
			if (!processed.contains(uniquePayorVO.getPayorVO().getIdentifier())) {
				finalSet.add(uniquePayorVO);
			}
			
			processed.add(uniquePayorVO.getPayorVO().getIdentifier());
		}
		return finalSet;
	}

	@Transactional
	public Set<UniquePAVO> getUniquePA(TestExecutionVO testExecutionVO) {
		List<UniquePAVO> paSet = new ArrayList<>();
		for (TestGroupItemVO testGroupItemVO : testExecutionVO.getTestGroupItemVOList()) {

			if (StringUtils.isNotBlank(testGroupItemVO.getClaim().getClaimHeader().getPriorAuth1())) {
				String identifier = testGroupItemVO.getClaim().getClaimHeader().getPriorAuth1();
				EnvironmentSavedPreset findByIdentifier = environmentSavedPresetRepository.findByIdentifier(identifier, Long.valueOf(testExecutionVO.getEnvironmentName()),
						Constants.PA_TYPE);
				if (findByIdentifier != null) {
					paSet.add(UniquePAVO.builder().pa(testGroupItemVO.getClaim().getClaimHeader().getPriorAuth1()).alwaysReplace(findByIdentifier.getReplaceIdentifier()).build());
				} else {
					paSet.add(UniquePAVO.builder().pa(testGroupItemVO.getClaim().getClaimHeader().getPriorAuth1()).build());
				}
			}
			if (StringUtils.isNotBlank(testGroupItemVO.getClaim().getClaimHeader().getPriorAuth2())) {
				String identifier = testGroupItemVO.getClaim().getClaimHeader().getPriorAuth2();
				EnvironmentSavedPreset findByIdentifier = environmentSavedPresetRepository.findByIdentifier(identifier, Long.valueOf(testExecutionVO.getEnvironmentName()),
						Constants.PA_TYPE);
				if (findByIdentifier != null) {
					paSet.add(UniquePAVO.builder().pa(testGroupItemVO.getClaim().getClaimHeader().getPriorAuth2()).alwaysReplace(findByIdentifier.getReplaceIdentifier()).build());
				} else {
					paSet.add(UniquePAVO.builder().pa(testGroupItemVO.getClaim().getClaimHeader().getPriorAuth2()).build());
				}
			}
			List<UniquePAVO> uniquePAServiceLine = getUniquePAServiceLine(testGroupItemVO , testExecutionVO.getEnvironmentName());
			paSet.addAll(uniquePAServiceLine);
		}


		Set<UniquePAVO> finalSet = new LinkedHashSet<>();
		Set<String> processed = new HashSet<>();
		for (UniquePAVO uniquePAVO : paSet) {
			if (!processed.contains(uniquePAVO.getPa())) {
				finalSet.add(uniquePAVO);
			}
			
			processed.add(uniquePAVO.getPa());
		}
		return finalSet;
	}

	@Transactional
	private List<UniquePAVO> getUniquePAServiceLine(TestGroupItemVO testGroupItemVO , String environmentName) {
		List<UniquePAVO> paSet = new ArrayList<>();
		for (int i = 0; i < testGroupItemVO.getClaim().getServices().size(); i++) {
			if (StringUtils.isNotBlank(testGroupItemVO.getClaim().getServices().get(i).getPriorAuth1())) {
				String identifier = testGroupItemVO.getClaim().getServices().get(i).getPriorAuth1();
				EnvironmentSavedPreset findByIdentifier = environmentSavedPresetRepository.findByIdentifier(identifier, Long.valueOf(environmentName),Constants.PA_TYPE);
				if (findByIdentifier != null) {
					paSet.add(UniquePAVO.builder().pa(testGroupItemVO.getClaim().getServices().get(i).getPriorAuth1()).alwaysReplace(findByIdentifier.getReplaceIdentifier())
							.build());
				} else {
					paSet.add(UniquePAVO.builder().pa(testGroupItemVO.getClaim().getServices().get(i).getPriorAuth1()).build());
				}
			}

			if (StringUtils.isNotBlank(testGroupItemVO.getClaim().getServices().get(i).getPriorAuth2())) {
				String identifier = testGroupItemVO.getClaim().getServices().get(i).getPriorAuth2();
				EnvironmentSavedPreset findByIdentifier = environmentSavedPresetRepository.findByIdentifier(identifier, Long.valueOf(environmentName),	Constants.PA_TYPE);
				if (findByIdentifier != null) {
					paSet.add(UniquePAVO.builder().pa(testGroupItemVO.getClaim().getServices().get(i).getPriorAuth2()).alwaysReplace(findByIdentifier.getReplaceIdentifier())
							.build());
				} else {
					paSet.add(UniquePAVO.builder().pa(testGroupItemVO.getClaim().getServices().get(i).getPriorAuth2()).build());
				}
			}
			
		}
	
		return paSet;
	}
	
	@Transactional
	public int checkBatchName(String batchName) {
		return batchRepository.getBatchCount(batchName);
	}

	@Transactional
	public ResponseVO replaceAndExecute(ReplaceAndExecuteVO replacementAndExecuteVO) throws IOException {
		String userName = YorosisContext.get().getUserName();
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());

		List<ElementsConfiguration> elementsConfigList = elementsConfigRepository.findAll();
		Map<String, ElementsConfiguration> elementsConfigMap = new HashMap<>();
		for (ElementsConfiguration elementsConfiguration : elementsConfigList) {
			elementsConfigMap.put(elementsConfiguration.getApplicableAt().trim().toLowerCase() + "-" + elementsConfiguration.getFieldName().toLowerCase().trim(), elementsConfiguration);
		}

		Batch batch = getBatchBuilder(replacementAndExecuteVO);
		Set<BatchTestcases> batchTestcasesSet = new HashSet<>();
		ObjectWriter writer = new ObjectMapper().writer();

		long[] claimsId = replacementAndExecuteVO.getClaimsId();

		for (Long claim : claimsId) {
			Testcases individualClaim = testcaseRepository.getOne(claim);
			TestcaseVO readValue = mapper.readValue(individualClaim.getJsonData(), TestcaseVO.class);

			ReplaceBeneficiaryVO[] replacementBeneficiaryVO = replacementAndExecuteVO.getReplacementBeneficiary();
			ReplaceProviderVO[] replacementProvider = replacementAndExecuteVO.getReplacementProvider();
			ReplacePayorVO[] replacementPayor = replacementAndExecuteVO.getReplacementPayor();
			ReplacePAVO[] replacementPa = replacementAndExecuteVO.getReplacementPa();

			if (StringUtils.isNotEmpty(replacementAndExecuteVO.getClaimSubmitters())) {
				readValue.setClaimSubmitters(replacementAndExecuteVO.getClaimSubmitters());
			}
			
			if (StringUtils.isNotEmpty(replacementAndExecuteVO.getClaimReceiver())) {
				readValue.setClaimReceiver(replacementAndExecuteVO.getClaimReceiver());
			}

			getClaimBeneficaryVO(replacementBeneficiaryVO, readValue , replacementAndExecuteVO.getEnvironmentName());
			getClaimProviderVO(replacementProvider, readValue ,  replacementAndExecuteVO.getEnvironmentName());
	    	getClaimPayorVO(replacementPayor, readValue ,  replacementAndExecuteVO.getEnvironmentName());
			getClaimPAVO(replacementPa, readValue , replacementAndExecuteVO.getEnvironmentName());


			if (replacementAndExecuteVO.getIncreaseBydays() != 0) {
				getIncreaseDays(replacementAndExecuteVO, readValue);
			}

			BatchTestcases batchTestcases = BatchTestcases.builder().batch(batch).claimID(individualClaim.getId()).claims(individualClaim).createdDate(currentTimestamp)
					.createdBy(userName).updatedDate(currentTimestamp).updatedBy(userName).status(SUBMITTED).jsonData(writer.writeValueAsString(readValue)).build();

			Set<BatchTestcasesResult> batchTestcasesResult = buildBatchTestcasesResult(elementsConfigMap, individualClaim, batchTestcases);

			batchTestcases.setBatchTestcasesResult(batchTestcasesResult);

			batchTestcasesSet.add(batchTestcases);
			batch.setBatchTestcases(batchTestcasesSet);
		}
		
		batch.setTotalTestcases(batchTestcasesSet.size());
		saveAlwaysReplaceBeneficiary(replacementAndExecuteVO);
		saveAlwaysReplaceProvider(replacementAndExecuteVO);
		saveAlwaysReplacePayor(replacementAndExecuteVO);
		saveAlwaysReplacePa(replacementAndExecuteVO);
		
		batchRepository.save(batch);
		log.warn("Submitted for Batch");
		batchTestCaseExecutorService.executeBatch(batch);
		return ResponseVO.builder().response("Test Executed Successfully").build();
	}

	private void saveAlwaysReplaceBeneficiary(ReplaceAndExecuteVO replacementAndExecuteVO) {

		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		String userName = YorosisContext.get().getUserName();

		Environment environment = environmentRepository.getOne(Long.valueOf(replacementAndExecuteVO.getEnvironmentName()));

		ReplaceBeneficiaryVO[] replacementBeneficiaryVO = replacementAndExecuteVO.getReplacementBeneficiary();
		for (ReplaceBeneficiaryVO replacementBeneficiary : replacementBeneficiaryVO) {
			if (StringUtils.isNotBlank(replacementBeneficiary.getAlwaysReplace())) {
				EnvironmentSavedPreset environmentSavedPreset = environmentSavedPresetRepository.findByIdentifier(replacementBeneficiary.getBeneficaryIdentifier(), Long.valueOf(replacementAndExecuteVO.getEnvironmentName()),
						Constants.BENEFICIARY_TYPE);

				if (environmentSavedPreset == null) {

					EnvironmentSavedPreset build = EnvironmentSavedPreset.builder().replaceIdentifier(replacementBeneficiary.getBeneficaryControl()).environment(environment)
							.type(Constants.BENEFICIARY_TYPE).identifier(replacementBeneficiary.getBeneficaryIdentifier()).createdBy(userName).createdDate(currentTimestamp)
							.updatedBy(userName).updatedDate(currentTimestamp).build();
					environmentSavedPresetRepository.save(build);

				} else {
					if (!StringUtils.equals(environmentSavedPreset.getReplaceIdentifier(), replacementBeneficiary.getBeneficaryControl())) {

						environmentSavedPreset.setReplaceIdentifier(replacementBeneficiary.getBeneficaryControl());
						environmentSavedPreset.setUpdatedBy(userName);
						environmentSavedPreset.setUpdatedDate(currentTimestamp);
						environmentSavedPresetRepository.save(environmentSavedPreset);
					}
				}
			}
		}
	}

	private void saveAlwaysReplaceProvider(ReplaceAndExecuteVO replacementAndExecuteVO) {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		String userName = YorosisContext.get().getUserName();

		Environment environment = environmentRepository.getOne(Long.valueOf(replacementAndExecuteVO.getEnvironmentName()));
		ReplaceProviderVO[] replacementProvider = replacementAndExecuteVO.getReplacementProvider();
		for (ReplaceProviderVO replaceProvider : replacementProvider) {
			if (StringUtils.isNotBlank(replaceProvider.getAlwaysReplace())) {
				EnvironmentSavedPreset environmentSavedPreset = environmentSavedPresetRepository.findByIdentifier(replaceProvider.getProvider(),Long.valueOf(replacementAndExecuteVO.getEnvironmentName()), Constants.PROVIDER_TYPE
						);
				if (environmentSavedPreset == null) {

					EnvironmentSavedPreset build = EnvironmentSavedPreset.builder().replaceIdentifier(replaceProvider.getProviderControl()).environment(environment)
							.type(Constants.PROVIDER_TYPE).identifier(replaceProvider.getProvider()).createdBy(userName).createdDate(currentTimestamp).updatedBy(userName)
							.updatedDate(currentTimestamp).build();
					environmentSavedPresetRepository.save(build);

				} else {
					if (!StringUtils.equals(environmentSavedPreset.getReplaceIdentifier(), replaceProvider.getProviderControl())) {

						environmentSavedPreset.setReplaceIdentifier(replaceProvider.getProviderControl());
						environmentSavedPreset.setUpdatedBy(userName);
						environmentSavedPreset.setUpdatedDate(currentTimestamp);
						environmentSavedPresetRepository.save(environmentSavedPreset);
					}
				}
			}
		}
	}

	private void saveAlwaysReplacePayor(ReplaceAndExecuteVO replacementAndExecuteVO) {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		String userName = YorosisContext.get().getUserName();
		Environment environment = environmentRepository.getOne(Long.valueOf(replacementAndExecuteVO.getEnvironmentName()));

		ReplacePayorVO[] replacementPayor = replacementAndExecuteVO.getReplacementPayor();
		for (ReplacePayorVO replacePayor : replacementPayor) {
			if (StringUtils.isNotBlank(replacePayor.getAlwaysReplace())) {
				EnvironmentSavedPreset environmentSavedPreset = environmentSavedPresetRepository.findByIdentifier(replacePayor.getPayor() , Long.valueOf(replacementAndExecuteVO.getEnvironmentName()), Constants.PAYOR_TYPE);
				if (environmentSavedPreset == null) {

					EnvironmentSavedPreset build = EnvironmentSavedPreset.builder().replaceIdentifier(replacePayor.getPayorControl()).environment(environment)
							.type(Constants.PAYOR_TYPE).identifier(replacePayor.getPayor()).createdBy(userName).createdDate(currentTimestamp).updatedBy(userName)
							.updatedDate(currentTimestamp).build();
					environmentSavedPresetRepository.save(build);

				} else {
					if (!StringUtils.equals(environmentSavedPreset.getReplaceIdentifier(), replacePayor.getPayorControl())) {

						environmentSavedPreset.setReplaceIdentifier(replacePayor.getPayorControl());
						environmentSavedPreset.setUpdatedBy(userName);
						environmentSavedPreset.setUpdatedDate(currentTimestamp);
						environmentSavedPresetRepository.save(environmentSavedPreset);
					}
				}
			}
		}
	}

	private void saveAlwaysReplacePa(ReplaceAndExecuteVO replacementAndExecuteVO) {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		String userName = YorosisContext.get().getUserName();
		Environment environment = environmentRepository.getOne(Long.valueOf(replacementAndExecuteVO.getEnvironmentName()));
		ReplacePAVO[] replacementPa = replacementAndExecuteVO.getReplacementPa();
		for (ReplacePAVO replacePa : replacementPa) {
			if (StringUtils.isNotBlank(replacePa.getAlwaysReplace())) {
				EnvironmentSavedPreset environmentSavedPreset = environmentSavedPresetRepository.findByIdentifier(replacePa.getPa(),Long.valueOf(replacementAndExecuteVO.getEnvironmentName()),Constants.PA_TYPE);
				if (environmentSavedPreset == null) {

					EnvironmentSavedPreset build = EnvironmentSavedPreset.builder().environment(environment).type(Constants.PA_TYPE).identifier(replacePa.getPa())
							.replaceIdentifier(replacePa.getPaControl()).createdBy(userName).createdDate(currentTimestamp).updatedBy(userName).updatedDate(currentTimestamp)
							.build();
					environmentSavedPresetRepository.save(build);

				} else {
					if (!StringUtils.equals(environmentSavedPreset.getReplaceIdentifier(), replacePa.getPaControl())) {

						environmentSavedPreset.setReplaceIdentifier(replacePa.getPaControl());
						environmentSavedPreset.setUpdatedBy(userName);
						environmentSavedPreset.setUpdatedDate(currentTimestamp);
						environmentSavedPresetRepository.save(environmentSavedPreset);
					}
				}
			}
		}
	}

	private void getClaimBeneficaryVO(ReplaceBeneficiaryVO[] replacementBeneficiaryVO, TestcaseVO claimreadValue , String  environmentName) throws IOException {

		for (ReplaceBeneficiaryVO replacementBeneficiary : replacementBeneficiaryVO) {
			if (StringUtils.equals(claimreadValue.getBeneficiary().getIdentifier(), replacementBeneficiary.getBeneficaryIdentifier())
					&& (!StringUtils.equals(replacementBeneficiary.getBeneficaryControl(), "-1") && replacementBeneficiary.getBeneficaryControl() != null)) {
	
				EnvironmentPreset getBeneifcary = environmentPresetRepository.getKey(replacementBeneficiary.getBeneficaryControl() ,Long.valueOf(environmentName) , Constants.BENEFICIARY_TYPE , Constants.ACTIVEFLAG );

				BeneficiaryVO beneifcaryVO = mapper.readValue(getBeneifcary.getJsonData(), BeneficiaryVO.class);
				claimreadValue.setBeneficiary(beneifcaryVO);
				
			}

		}
	}

	private void getClaimProviderVO(ReplaceProviderVO[] replacementProvider, TestcaseVO readValue , String  environmentName) throws IOException {

		for (ReplaceProviderVO replaceProvider : replacementProvider) {
			String getProviderControl = replaceProvider.getProviderControl();
			if (StringUtils.equals(readValue.getBilling().getNpi(), replaceProvider.getProvider()) && (!StringUtils.equals(getProviderControl,"-1") && getProviderControl != null)) {
				EnvironmentPreset getProvider = environmentPresetRepository.getKey(replaceProvider.getProviderControl() , Long.valueOf(environmentName) , Constants.PROVIDER_TYPE , Constants.ACTIVEFLAG  );
				ProviderVO providerVO = mapper.readValue(getProvider.getJsonData(), ProviderVO.class);
				readValue.setBilling(providerVO);
				readValue.setServicing(providerVO);
			}
		}
	}

	private LocalDateTime stringToLocalDateTime(String dateString) {
		DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.ENGLISH);
		return LocalDateTime.parse(dateString, inputFormatter);
	}

	private void getIncreaseDays(ReplaceAndExecuteVO replacementAndExecuteVO, TestcaseVO readValue) {
		readValue.getClaimHeader().setFromDate((stringToLocalDateTime(readValue.getClaimHeader().getFromDate())).plusDays(replacementAndExecuteVO.getIncreaseBydays()).toString());
		readValue.getClaimHeader().setToDate((stringToLocalDateTime(readValue.getClaimHeader().getToDate())).plusDays(replacementAndExecuteVO.getIncreaseBydays()).toString());
		for (int i = 0; i < readValue.getServices().size(); i++) {
			readValue.getServices().get(i)
					.setFromDate((stringToLocalDateTime(readValue.getServices().get(i).getFromDate())).plusDays(replacementAndExecuteVO.getIncreaseBydays()).toString());
			readValue.getServices().get(i)
					.setToDate((stringToLocalDateTime(readValue.getServices().get(i).getToDate())).plusDays(replacementAndExecuteVO.getIncreaseBydays()).toString());
		}
	}

	private void getClaimPayorVO(ReplacePayorVO[] replacementPayor, TestcaseVO readValue , String  environmentName) throws IOException {

		for (ReplacePayorVO replacePayor : replacementPayor) {
			String getPayorControl = replacePayor.getPayorControl();
			if (StringUtils.equals(readValue.getPayor().getIdentifier(), replacePayor.getPayor()) && (!StringUtils.equals(getPayorControl , "-1") && getPayorControl != null)) {
				EnvironmentPreset getPayor = environmentPresetRepository.getKey(replacePayor.getPayorControl() ,  Long.valueOf(environmentName) , Constants.PAYOR_TYPE , Constants.ACTIVEFLAG );
			    PayorVO payorVO = mapper.readValue(getPayor.getJsonData(), PayorVO.class);
				readValue.setPayor(payorVO);
			}
		}

	}

	private void getClaimPAVO(ReplacePAVO[] replacementPa, TestcaseVO readValue , String  environmentName) throws IOException {

		for (ReplacePAVO replacePa : replacementPa) {
			String getPaControl = replacePa.getPaControl();
			if (StringUtils.equalsIgnoreCase(readValue.getClaimHeader().getPriorAuth1(), replacePa.getPa()) && (!StringUtils.equals(getPaControl ,"-1") && getPaControl != null)) {
				readValue.getClaimHeader().setPriorAuth1(getClaimHeaderPA(replacePa ,  environmentName).getNumber());
			}
			if (StringUtils.equalsIgnoreCase(readValue.getClaimHeader().getPriorAuth2(), replacePa.getPa()) && (!StringUtils.equals(getPaControl ,"-1") && getPaControl != null)) {
				readValue.getClaimHeader().setPriorAuth2(getClaimHeaderPA(replacePa , environmentName).getNumber() );
			}
			getClaimServiceVO(replacePa, readValue , environmentName);

		}

	}

	private void getClaimServiceVO(ReplacePAVO replacePa, TestcaseVO readValue , String  environmentName) throws IOException {
		for (int i = 0; i < readValue.getServices().size(); i++) {
			String getPaControl = replacePa.getPaControl();
			if (StringUtils.equalsIgnoreCase(readValue.getServices().get(i).getPriorAuth1(), replacePa.getPa()) && (!StringUtils.equals(getPaControl ,"-1") && getPaControl != null)) {
				readValue.getServices().get(i).setPriorAuth1(getClaimHeaderPA(replacePa , environmentName).getNumber());
			}
			if (StringUtils.equalsIgnoreCase(readValue.getServices().get(i).getPriorAuth2(), replacePa.getPa()) && (!StringUtils.equals(getPaControl ,"-1") && getPaControl != null)) {
				readValue.getServices().get(i).setPriorAuth2(getClaimHeaderPA(replacePa , environmentName).getNumber()) ;
			}
		}
	}

	private PaVO getClaimHeaderPA(ReplacePAVO replacePa , String environmentName) throws IOException {
		EnvironmentPreset getPa = environmentPresetRepository.getKey(replacePa.getPaControl() , Long.valueOf(environmentName) , Constants.PA_TYPE , Constants.ACTIVEFLAG );
		return mapper.readValue(getPa.getJsonData(), PaVO.class);
	}

	private Batch getBatchBuilder(ReplaceAndExecuteVO replacementAndExecuteVO) {
		Environment environment = environmentRepository.getOne(Long.valueOf(replacementAndExecuteVO.getEnvironmentName()));
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());

		String userName = YorosisContext.get().getUserName();
		return Batch.builder().batchName(replacementAndExecuteVO.getBatchName()).createdBy(userName).createdDate(currentTimestamp).updatedDate(currentTimestamp).updatedBy(userName)
				.environment(environment).startTime(currentTimestamp).endTime(currentTimestamp).totalTestcases(replacementAndExecuteVO.getClaimsId().length).status(SUBMITTED)
				.voidFirstBefore(replacementAndExecuteVO.getVoidClaimsFirst()).increaseByDays(replacementAndExecuteVO.getIncreaseBydays()).build();
	}

}
