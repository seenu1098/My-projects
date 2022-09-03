package com.yorosis.livetester.service;

import static com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES;
import static com.yorosis.livetester.constants.Constants.FAIL;
import static com.yorosis.livetester.constants.Constants.PASS;
import static com.yorosis.livetester.constants.Constants.SYSTEM;
import static org.apache.xmlgraphics.util.MimeConstants.MIME_PDF;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.io.StringReader;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.xml.transform.Result;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.sax.SAXResult;
import javax.xml.transform.stream.StreamSource;

import org.apache.commons.lang3.StringUtils;
import org.apache.fop.apps.FOPException;
import org.apache.fop.apps.FOUserAgent;
import org.apache.fop.apps.Fop;
import org.apache.fop.apps.FopFactory;
import org.json.JSONObject;
import org.json.XML;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.yorosis.livetester.constants.Constants;
import com.yorosis.livetester.entities.Batch;
import com.yorosis.livetester.entities.BatchTestcases;
import com.yorosis.livetester.entities.BatchTestcasesResult;
import com.yorosis.livetester.entities.Testcases;
import com.yorosis.livetester.exception.YorosisException;
import com.yorosis.livetester.grid.services.AbstractGridDataService;
import com.yorosis.livetester.grid.vo.PaginationVO;
import com.yorosis.livetester.grid.vo.TableData;
import com.yorosis.livetester.repo.BatchRepository;
import com.yorosis.livetester.repo.BatchTestcaseRepository;
import com.yorosis.livetester.repo.BatchTestcaseResultRepository;
import com.yorosis.livetester.repo.TestcasesRepository;
import com.yorosis.livetester.security.YorosisContext;
import com.yorosis.livetester.vo.AddressVO;
import com.yorosis.livetester.vo.BatchRerunVO;
import com.yorosis.livetester.vo.BeneficiaryVO;
import com.yorosis.livetester.vo.ClaimServiceVO;
import com.yorosis.livetester.vo.PdfResponseVO;
import com.yorosis.livetester.vo.PrintTestResultsVO;
import com.yorosis.livetester.vo.ProviderVO;
import com.yorosis.livetester.vo.RequeryResultVO;
import com.yorosis.livetester.vo.ResponseVO;
import com.yorosis.livetester.vo.TestGroupItemVO;
import com.yorosis.livetester.vo.TestcaseVO;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class BatchTestCaseService extends AbstractGridDataService {

	@Autowired
	private BatchTestcaseRepository batchTestcaseRepository;

	@Autowired
	private BatchRepository batchRepository;

	@Autowired
	private BatchTestcaseResultRepository batchTestcaseResultRepository;

	@Autowired
	private TestcasesRepository claimRepository;

	private final ObjectMapper mapper = new ObjectMapper();

	@Value("classpath:stylesheet.xsl")
	private Resource resource;

	@Override
	@Transactional
	public TableData getGridData(PaginationVO pagination) throws YorosisException, ParseException, IOException {
		List<Map<String, String>> list = new ArrayList<>();

		TableData tableData = null;
		Map<String, String> dataMap = null;

		Pageable pageable = getPageableObject(pagination);
		if (StringUtils.isNotBlank(pagination.getId())
				&& StringUtils.equalsIgnoreCase("batchtestcases", pagination.getGridId())) {
			int totalCount = batchTestcaseRepository.countByBatchName(pagination.getId());

			List<BatchTestcases> batchDataList = batchTestcaseRepository.findByBatchName(pageable, pagination.getId());

			tableData = TableData.builder().data(list).totalRecords(Integer.toString(totalCount)).build();
			for (BatchTestcases batchTestcases : batchDataList) {
				dataMap = new HashMap<>();

				ObjectMapper newMapper = new ObjectMapper();
				newMapper.configure(FAIL_ON_UNKNOWN_PROPERTIES, false);
				TestcaseVO claimVO = newMapper.readValue(batchTestcases.getClaims().getJsonData(), TestcaseVO.class);

				dataMap.put("col2", batchTestcases.getClaims().getTestcaseName());
				dataMap.put("col3", batchTestcases.getStatus());
				dataMap.put("col4", claimVO.getFormType());
				dataMap.put("col5", claimVO.getClaimHeader().getSource());
				dataMap.put("col6", claimVO.getClaimHeader().getFrequency());
				dataMap.put("col7", claimVO.getBilling().getNpi());
				dataMap.put("col8", Long.toString(batchTestcases.getId()));

				list.add(dataMap);
			}
		}

		return tableData;
	}

	@Transactional
	public ResponseVO requeryResult(RequeryResultVO requeryResultVO) throws YorosisException {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		String userName = YorosisContext.get().getUserName();

		Batch batch = batchRepository.findByBatchName(requeryResultVO.getBatchId());
		batch.setStatus(Constants.INPROGRESS);
		batch.setUpdatedBy(userName);
		batch.setUpdatedDate(currentTimestamp);
		batchRepository.save(batch);

		PageRequest pageRequest = PageRequest.of(0, 2_000);
		Long[] batchTestcaseId = requeryResultVO.getBatchTestcaseId();
		for (Long batchTestcase : batchTestcaseId) {

			BatchTestcases batchTestcaseData = batchTestcaseRepository.getOne(batchTestcase);
			batchTestcaseData.setStatus(Constants.INPROGRESS);
			batchTestcaseData.setUpdatedBy(userName);
			batchTestcaseData.setUpdatedDate(currentTimestamp);
			batchTestcaseRepository.save(batchTestcaseData);

			List<BatchTestcasesResult> batchTestcasesResultList = batchTestcaseResultRepository
					.getBatchTestcaseResultList(pageRequest, batchTestcaseData.getId());
			for (BatchTestcasesResult batchTestcasesResult : batchTestcasesResultList) {
				batchTestcasesResult.setStatus(Constants.INPROGRESS);
				batchTestcasesResult.setActualValue(null);
				batchTestcasesResult.setUpdatedBy(userName);
				batchTestcasesResult.setUpdatedDate(currentTimestamp);
				batchTestcaseResultRepository.save(batchTestcasesResult);
			}
		}
		log.warn("Requery Result - Updated");

		//batchTestExecutorService.executeBatch(batch);
		return ResponseVO.builder().response("Requery Result - Updated").build();
	}

	@Transactional
	public PdfResponseVO getBatchName(PrintTestResultsVO printTestResultsVO) {
		Long[] batchTestcaseId = printTestResultsVO.getBatchTestcaseId();
		String type = "zip";
		if (StringUtils.equals(printTestResultsVO.getPdfOption(), "Y")) {
			type = "pdf";
		}
		if (batchTestcaseId != null && batchTestcaseId.length > 0) {
			BatchTestcases batchTestcaseData = batchTestcaseRepository.getOne(batchTestcaseId[0]);
			return PdfResponseVO.builder().fileName(batchTestcaseData.getBatch().getBatchName() + "." + type).build();
		}
		return null;

	}

	private byte[] createPDF(String xml, String testcaseName, String batchName, String generatedDate)
			throws FOPException, TransformerException, IOException {
		String test = "<test>" + testcaseName + batchName + generatedDate + xml + "</test>";

		StreamSource xmlSource = new StreamSource(new StringReader(test));
		FopFactory fopFactory = FopFactory.newInstance(new File(".").toURI());
		FOUserAgent foUserAgent = fopFactory.newFOUserAgent();

		try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			getFop(fopFactory, foUserAgent, out, xmlSource);
			return out.toByteArray();
		}
	}

	@Transactional
	public byte[] getPdf(PrintTestResultsVO printTestResultsVO) throws IOException, TransformerException, FOPException {
		Long[] batchTestcaseId = printTestResultsVO.getBatchTestcaseId();

		byte[] documentBytes = null;
		if (StringUtils.equals(printTestResultsVO.getPdfOption(), "Y")) {
			String xml = "";
			String testcaseName = null;
			String batchName = null;
			String generatedDate = null;

			for (Long batchTestcase : batchTestcaseId) {
				BatchTestcases batchTestcaseData = batchTestcaseRepository.getOne(batchTestcase);

				xml = getPdfFop(batchTestcaseData, xml, printTestResultsVO.isPIICheckbox());
				testcaseName = "<testcase_name>" + batchTestcaseData.getClaims().getTestcaseName() + "</testcase_name><test_result>" + batchTestcaseData.getStatus() + "</test_result>";
				batchName = "<batch_name>" + batchTestcaseData.getBatch().getBatchName() + " - (Environment: " + batchTestcaseData.getBatch().getEnvironment().getEnvironmentName() + ")</batch_name>";
				generatedDate = "<generated_date>" + dateToString(batchTestcaseData.getCreatedDate())
						+ "</generated_date>";
			}

			documentBytes = createPDF(xml, testcaseName, batchName, generatedDate);
		} else {
			try (ByteArrayOutputStream zipBytesOut = new ByteArrayOutputStream();
					ZipOutputStream zipOut = new ZipOutputStream(zipBytesOut)) {
				for (Long batchTestcase : batchTestcaseId) {
					BatchTestcases batchTestcaseData = batchTestcaseRepository.getOne(batchTestcase);
					String xml = getPdfFop(batchTestcaseData, "", printTestResultsVO.isPIICheckbox());
					String testcaseName = "<testcase_name>" + batchTestcaseData.getClaims().getTestcaseName() + "</testcase_name><test_result>" + batchTestcaseData.getStatus() + "</test_result>";
					String batchName = "<batch_name>" + batchTestcaseData.getBatch().getBatchName() + " - (Environment: " + batchTestcaseData.getBatch().getEnvironment().getEnvironmentName() + ")</batch_name>";
					String generatedDate = "<generated_date>" + dateToString(batchTestcaseData.getCreatedDate())
							+ "</generated_date>";
					byte[] fileBytes = createPDF(xml, testcaseName, batchName, generatedDate);

					ZipEntry e = new ZipEntry(batchTestcaseData.getClaims().getTestcaseName() + ".pdf");
					zipOut.putNextEntry(e);
					zipOut.write(fileBytes);
					zipOut.closeEntry();

				}
				zipOut.finish();

				documentBytes = zipBytesOut.toByteArray();
			}
		}

		return documentBytes;
	}

	private String getPdfFop(BatchTestcases batchTestcaseData, String xml, boolean canShowPII) throws IOException {
		Testcases claimDetail = claimRepository.getOne(batchTestcaseData.getClaims().getId());
		mapper.configure(FAIL_ON_UNKNOWN_PROPERTIES, false);

		TestcaseVO claimVO = mapper.readValue(batchTestcaseData.getGeneratedJson(), TestcaseVO.class);

		if (claimVO.getSubscriber() != null) {
			String subscriberDob = claimVO.getSubscriber().getDob();
			claimVO.getSubscriber().setDob(formatString(subscriberDob));
		}

		String beneficiaryDob = claimVO.getBeneficiary().getDob();
		claimVO.getBeneficiary().setDob(formatString(beneficiaryDob));

		String fromDateClaimHeader = claimVO.getClaimHeader().getFromDate();
		claimVO.getClaimHeader().setFromDate(formatString(fromDateClaimHeader));

		String toDateClaimHeader = claimVO.getClaimHeader().getToDate();
		claimVO.getClaimHeader().setToDate(formatString(toDateClaimHeader));

		ObjectNode expectedResult = (ObjectNode) claimVO.getClaimHeader().getExpectedResult();
		Set<BatchTestcasesResult> batchTestcasesResult = batchTestcaseData.getBatchTestcasesResult();

		populateExpectedResult(expectedResult, batchTestcasesResult, "Header", 0);

		int seq = 1;
		List<ClaimServiceVO> services = claimVO.getServices();
		for (ClaimServiceVO claimServiceVO : services) {
			String fromDateServiceLine = claimServiceVO.getFromDate();
			claimServiceVO.setFromDate(formatString(fromDateServiceLine));

			String toDateServiceLine = claimServiceVO.getToDate();
			claimServiceVO.setToDate(formatString(toDateServiceLine));

			if (!canShowPII) {
				maskPIIDetails(claimServiceVO.getServicing());
				maskPIIDetails(claimServiceVO.getServiceFacility());
			}

			ObjectNode serviceExpectedResult = mapper.createObjectNode();
			claimServiceVO.setExpectedResult(serviceExpectedResult);

			populateExpectedResult(serviceExpectedResult, batchTestcasesResult, "Line", seq);

			seq++;
		}

		if (!canShowPII) {
			maskPIIDetails(claimVO.getBeneficiary());
			maskPIIDetails(claimVO.getSubscriber());
			maskPIIDetails(claimVO.getBilling());
			maskPIIDetails(claimVO.getServicing());
			maskPIIDetails(claimVO.getClaimHeader().getServiceFacility());
		}

		JSONObject obj = new JSONObject(mapper.writeValueAsString(claimVO));

		String testcaseName = "<testcase_name>" + claimDetail.getTestcaseName() + "</testcase_name><test_result>" + batchTestcaseData.getStatus() + "</test_result>";
		String generatedXml = xml + "<testcase>" + testcaseName + XML.toString(obj) + "</testcase>";
		generatedXml = generatedXml.replace(">null<", "><");

		return generatedXml;
	}

	private void populateExpectedResult(ObjectNode expectedResult, Set<BatchTestcasesResult> batchTestcasesResult,
			String level, int seq) {
		expectedResult.removeAll();

		ArrayNode arrayNode = null;
		for (BatchTestcasesResult result : batchTestcasesResult) {
			if (StringUtils.equalsIgnoreCase(level, result.getElementsConfiguration().getApplicableAt())
					&& seq == result.getSeqNo()) {
				ObjectNode objectNode = mapper.createObjectNode();
				objectNode.put("applicableAt", level);
				objectNode.put("elementName", result.getElementsConfiguration().getElementLabel());
				objectNode.put("expectedValue", result.getExpectedValue());
				objectNode.put("actualValue", result.getActualValue());
				objectNode.put("status", result.getStatus());

				if (arrayNode == null) {
					arrayNode = expectedResult.putArray("result");
				}
				arrayNode.add(objectNode);
			}
		}
	}

	private void maskPIIDetails(BeneficiaryVO beneficiary) {
		if (beneficiary == null) {
			return;
		}

		beneficiary.setIdentifier(getMaskedData(beneficiary.getIdentifier()));
		beneficiary.setDob(getMaskedData(beneficiary.getDob()));
		beneficiary.setFirstName(getMaskedData(beneficiary.getFirstName()));
		beneficiary.setLastName(getMaskedData(beneficiary.getLastName()));
		beneficiary.setGender("X");

		AddressVO address = beneficiary.getAddress();
		if (address != null) {
			address.setAddress(getMaskedData(address.getAddress()));
			address.setCity(getMaskedData(address.getCity()));
		}
	}

	private void maskPIIDetails(ProviderVO provider) {
		if (provider == null) {
			return;
		}

		if (StringUtils.isNotBlank(provider.getTaxId())) {
			provider.setTaxId(getMaskedData(provider.getTaxId()));
		}
	}

	private String getMaskedData(String value) {
		return StringUtils.substring(value == null ? "" : value, 0, 2) + "XXXXXX";
	}

	private void getFop(FopFactory fopFactory, FOUserAgent foUserAgent, OutputStream out, StreamSource xmlSource)
			throws FOPException, TransformerException, IOException {
		Fop fop = fopFactory.newFop(MIME_PDF, foUserAgent, out);

		TransformerFactory factory = new net.sf.saxon.TransformerFactoryImpl();
		Transformer transformer = factory.newTransformer(new StreamSource(resource.getInputStream()));

		Result res = new SAXResult(fop.getDefaultHandler());

		transformer.transform(xmlSource, res);
	}

	public List<Long> getBatchTestcase(Long batchId) {
		List<BatchTestcases> byBatchName = batchTestcaseRepository.findAllByBatchId(batchId);
		List<Long> batchTestcaseIdList = new ArrayList<>();
		for (BatchTestcases batchTestcases : byBatchName) {
			batchTestcaseIdList.add(batchTestcases.getId());
		}
		return batchTestcaseIdList;
	}

	@Override
	public String getGridModuleId() {
		return "batchtestcasesModule";
	}

	private String formatString(String a) {
		String[] split = a.substring(0, 10).split("-");
		return (split[1] + "/" + split[2] + "/" + split[0]);

	}

	@Transactional
	public BatchRerunVO getBatchRerunInfo(Long batchId) throws IOException {
		List<BatchTestcases> byBatchName = batchTestcaseRepository.findAllByBatchId(batchId);
		List<TestGroupItemVO> testGroupItemVOList = new ArrayList<>();
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		for (BatchTestcases batchTestcases : byBatchName) {
			testGroupItemVOList.add(TestGroupItemVO.builder().value(batchTestcases.getClaims().getId().intValue())
					.claim(mapper.readValue(batchTestcases.getClaims().getJsonData(), TestcaseVO.class)).build());
		}
		return BatchRerunVO.builder().batchName(byBatchName.get(0).getBatch().getBatchName())
				.testGroupItemVOList(testGroupItemVOList)
				.environmentName(String.valueOf(byBatchName.get(0).getBatch().getEnvironment().getId())).build();
	}

	@Transactional
	public void processPassOrFailForDemo(Long batchId, String passOrFail) {
		boolean isPass = StringUtils.equalsIgnoreCase(passOrFail, "pass");
		
		List<BatchTestcases> byBatchName = batchTestcaseRepository.findAllByBatchId(batchId);

		String tcnPrefix = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date(System.currentTimeMillis())) + "00";
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		BatchTestcases failedTestcase = null;
		int count = 1;
		for (BatchTestcases batchTestcases : byBatchName) {
			for (BatchTestcasesResult batchTestcasesResult : batchTestcases.getBatchTestcasesResult()) {
				if (StringUtils.isBlank(batchTestcasesResult.getExpectedValue())) {
					batchTestcasesResult.setExpectedValue("");
				}
				batchTestcasesResult.setActualValue(batchTestcasesResult.getExpectedValue());
				
				if (!isPass && failedTestcase == null && StringUtils.isNotBlank(batchTestcasesResult.getExpectedValue())) {
					failedTestcase = batchTestcases;
					batchTestcasesResult.setActualValue("");
				}
				
				if (StringUtils.equalsIgnoreCase(batchTestcasesResult.getActualValue(), batchTestcasesResult.getExpectedValue())) {
					batchTestcasesResult.setStatus(PASS);
				} else {
					batchTestcasesResult.setStatus(FAIL);
				}
				batchTestcasesResult.setUpdatedBy(SYSTEM);
				batchTestcasesResult.setUpdatedDate(timestamp);
				
				batchTestcaseResultRepository.save(batchTestcasesResult);
			}
			
			batchTestcases.setUpdatedBy(SYSTEM);
			batchTestcases.setUpdatedDate(timestamp);
			batchTestcases.setTcn(tcnPrefix + (count++) + "000");
			if (failedTestcase == batchTestcases) {
				batchTestcases.setStatus(FAIL);
			} else {
				batchTestcases.setStatus(PASS);
			}
			batchTestcaseRepository.save(batchTestcases);
		}
		
		if (!byBatchName.isEmpty()) {
			Batch batch = byBatchName.get(0).getBatch();
			long pass = batch.getTotalTestcases();
			long fail = 0;
			if (!isPass) {
				pass--;
				fail = 1;
			}
			batch.setPassPercentage(pass);
			batch.setFailPercentage(fail);
			batch.setStatus(isPass ? PASS : FAIL);
			batch.setEndTime(new Timestamp(System.currentTimeMillis()));
			batch.setUpdatedBy(SYSTEM);
			batch.setUpdatedDate(timestamp);

			batchRepository.save(batch);
		}
	}
}
