package com.yorosis.livetester;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.sql.SQLException;
import java.util.List;

import javax.sql.DataSource;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.yorosis.livetester.entities.Batch;
import com.yorosis.livetester.entities.BatchTestcases;
import com.yorosis.livetester.entities.BatchTestcasesResult;
import com.yorosis.livetester.entities.ElementsConfiguration;
import com.yorosis.livetester.entities.Environment;
import com.yorosis.livetester.entities.LookupData;
import com.yorosis.livetester.entities.Template;
import com.yorosis.livetester.entities.Testcases;
import com.yorosis.livetester.repo.BatchRepository;
import com.yorosis.livetester.repo.BatchTestcaseRepository;
import com.yorosis.livetester.repo.BatchTestcaseResultRepository;
import com.yorosis.livetester.repo.ElementConfigRepository;
import com.yorosis.livetester.repo.EnvironmentPresetRepository;
import com.yorosis.livetester.repo.EnvironmentRepository;
import com.yorosis.livetester.repo.LookupDataRepository;
import com.yorosis.livetester.repo.TemplateRepository;
import com.yorosis.livetester.repo.TestcasesRepository;
import com.yorosis.livetester.security.YorosisContext;
import com.yorosis.livetester.service.ElementConfigurationService;
import com.yorosis.livetester.vo.ElementConfigListVO;
import com.yorosis.livetester.vo.ElementConfigVO;
import com.yorosis.livetester.vo.ResponseVO;

@SpringBootTest
@ActiveProfiles(profiles = { "default", "test" })
public class ElementsConfigurationTest extends AbstractBaseTest {

	@Autowired
	private ElementConfigRepository elementConfigRepository;

	@Autowired
	private ElementConfigurationService elementConfigService;

	@Autowired
	private BatchTestcaseResultRepository batchTestcaseResultRepository;

	@Autowired
	private BatchTestcaseRepository batchTestcaseRepository;

	@Autowired
	private BatchRepository repo;

	@Autowired
	private EnvironmentRepository environmentRepository;

	@Autowired
	private EnvironmentPresetRepository environmentPresetRepository;

	@Autowired
	private TestcasesRepository claimRepository;

	@Autowired
	private TemplateRepository templateRepository;

	@Autowired
	private DataSource datasource;

	@Autowired
	private LookupDataRepository lookupDataRepository;

	@AfterEach
	public void clearDataElementConfiguration() throws SQLException {
		batchTestcaseResultRepository.deleteAll();
		repo.deleteAll();
		elementConfigRepository.deleteAll();
		batchTestcaseRepository.deleteAll();
		environmentPresetRepository.deleteAll();
		environmentRepository.deleteAll();
		claimRepository.deleteAll();
		templateRepository.deleteAll();
		lookupDataRepository.deleteAll();
		clearSequences();
	}

	@Test
	public void testSaveElementConfigData() throws JsonProcessingException {
		YorosisContext.set(new YorosisContext("test", true));

		ElementConfigVO saveElementConfigDetails = ElementConfigVO.builder().label("test").fieldName("test").fieldType("test").mandatory("test").applicable("test")
				.matchQuery("test").fallbackQuery1("test").fallbackQuery2("test").build();

		ElementConfigVO updateElementConfigDetails = ElementConfigVO.builder().label("test").fieldName("test").fieldType("test").mandatory("test").applicable("test")
				.matchQuery("test").fallbackQuery1("test").fallbackQuery2("test").id(1L).build();

		ResponseVO createResponse = elementConfigService.saveElementConfigurationData(saveElementConfigDetails);
		assertEquals("Element Configuration created successfully", createResponse.getResponse());

		ResponseVO existResponse = elementConfigService.saveElementConfigurationData(saveElementConfigDetails);
		assertEquals("Element Label Already Exist", existResponse.getResponse());

		ResponseVO updateResponse = elementConfigService.saveElementConfigurationData(updateElementConfigDetails);
		assertEquals("Element Configuration updated successfully", updateResponse.getResponse());
	}

	@Test
	public void testGetElementConfigList() {
		ElementsConfiguration ElementConfigDetails = ElementsConfiguration.builder().elementLabel("test").fieldName("test").fieldType("test").isMandatory("test")
				.applicableAt("test").build();

		elementConfigRepository.save(ElementConfigDetails);

		List<ElementConfigListVO> list = elementConfigService.getElementConfigList("list");
		assertNotNull(list);
		assertEquals(1, list.size());
	}

	@Test
	public void testGetElementConfigInfo() {

		ElementsConfiguration ElementConfigDetails = ElementsConfiguration.builder().id(1L).elementLabel("test").fieldName("test").fieldType("test").isMandatory("test")
				.applicableAt("test").build();

		elementConfigRepository.save(ElementConfigDetails);

		ElementConfigVO vo = elementConfigService.getElementConfigInfo(1L);
		assertNotNull(vo);
	}

	@Test
	public void testDeleteElementConfig() {

		ElementsConfiguration ElementConfigDetails = ElementsConfiguration.builder().id(1L).elementLabel("test").fieldName("test").fieldType("test").isMandatory("test").build();

		elementConfigRepository.save(ElementConfigDetails);

		ElementsConfiguration one = elementConfigRepository.getOne(1L);

		lookupDataRepository.save(LookupData.builder().code("Professional").description("Form").type("Form Type").build());

		Testcases claims = claimRepository.save(Testcases.builder().id(1L).formType(lookupDataRepository.getOne(1L)).testcaseName("Claim Test").jsonData("data")
				.template(templateRepository.save(Template.builder().id(1L).jsonData("data").build())).build());

		Batch batch = Batch.builder().id(1L).environment(environmentRepository.save(Environment.builder().id(2L).build())).build();
		repo.save(batch);

		batchTestcaseRepository.save(BatchTestcases.builder().id(1L).batch(batch).claims(claims).build());

		BatchTestcases batchTestcaseId = batchTestcaseRepository.getOne(1L);

		BatchTestcasesResult batchTestcasesResult = BatchTestcasesResult.builder().batchTestcases(batchTestcaseId).id(1L).actualValue("test").elementsConfiguration(one)
				.expectedValue("test").build();
		batchTestcaseResultRepository.save(batchTestcasesResult);

		ResponseVO deletedResponse = elementConfigService.deleteElementConfigInfo(1L);
		assertEquals("Element Configuration have test case result", deletedResponse.getResponse());

		elementConfigRepository.save(ElementsConfiguration.builder().id(2L).build());

		ResponseVO deletedResponses = elementConfigService.deleteElementConfigInfo(2L);
		assertEquals("Element Configuration deleted Successfully", deletedResponses.getResponse());
	}

	@Override
	protected DataSource getDatasource() {
		return datasource;
	}
}
