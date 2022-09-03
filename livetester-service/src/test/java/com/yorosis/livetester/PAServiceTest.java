package com.yorosis.livetester;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

import javax.sql.DataSource;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.yorosis.livetester.constants.Constants;
import com.yorosis.livetester.entities.Environment;
import com.yorosis.livetester.entities.EnvironmentPreset;
import com.yorosis.livetester.exception.YorosisException;
import com.yorosis.livetester.grid.vo.PaginationVO;
import com.yorosis.livetester.grid.vo.TableData;
import com.yorosis.livetester.repo.EnvironmentPresetRepository;
import com.yorosis.livetester.repo.EnvironmentRepository;
import com.yorosis.livetester.security.YorosisContext;
import com.yorosis.livetester.service.PAPresetService;
import com.yorosis.livetester.vo.EnvironmentPresetVO;
import com.yorosis.livetester.vo.PaVO;
import com.yorosis.livetester.vo.ResponseVO;

@SpringBootTest
@ActiveProfiles(profiles = { "default", "test" })
public class PAServiceTest extends AbstractBaseTest {
	@Autowired
	private EnvironmentRepository environmentRepo;

	@Autowired
	private PAPresetService paPresetService;

	@Autowired
	private EnvironmentPresetRepository environmentPresetRepository;

	@Autowired
	private DataSource datasource;

	@AfterEach
	public void deleteEnvironmentDetails() throws SQLException {
		environmentPresetRepository.deleteAll();
		environmentRepo.deleteAll();
		clearSequences();
	}

	private PaginationVO getPaginationVOObject(String gridId) {
		return PaginationVO.builder().gridId(gridId).columnName("type").index(0).direction("asc").build();
	}

	@Override
	protected DataSource getDatasource() {
		return datasource;
	}

	@Test
	public void testSaveBeneficiaryPreset() throws JsonProcessingException {
		YorosisContext.set(new YorosisContext("test", true));

		Environment EnvironmentDetails = Environment.builder().id(1L).environmentName("test").protocol("test").host("test").port("test").logonType("test").username("test")
				.password("test").pemText("test").dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test")
				.schemeName("test").build();

		environmentRepo.save(EnvironmentDetails);

		PaVO paVO = PaVO.builder().number("test").description("test").build();

		EnvironmentPresetVO saveEnviromentPresetVO = EnvironmentPresetVO.builder().environmentId(1L).id(0L).key("test").type(Constants.PA_TYPE).paVO(paVO).build();

		EnvironmentPresetVO updateEnviromentPresetVO = EnvironmentPresetVO.builder().environmentId(1L).id(1L).key("test").type(Constants.PA_TYPE).paVO(paVO).build();

		EnvironmentPresetVO existEnviromentPresetVO = EnvironmentPresetVO.builder().environmentId(1L).id(0L).key("test").type(Constants.PA_TYPE).paVO(paVO).build();

		ResponseVO createResponse = paPresetService.savePaPreset(saveEnviromentPresetVO);
		assertEquals("PA Preset Created successfully", createResponse.getResponse());

		ResponseVO updateResponse = paPresetService.savePaPreset(updateEnviromentPresetVO);
		assertEquals("PA Preset updated successfully", updateResponse.getResponse());

		ResponseVO existResponse = paPresetService.savePaPreset(existEnviromentPresetVO);
		assertEquals("PA number Already Exist", existResponse.getResponse());

	}

	@Test
	public void testGetEnviromentPresetDetails() throws IOException {

		Environment envDetails = Environment.builder().id(1L).environmentName("test").protocol("test").host("test").port("test").logonType("test").username("test")
				.password("test").pemText("test").dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test")
				.schemeName("test").build();

		PaVO paVO = PaVO.builder().number("test").description("test").build();

		ObjectWriter writer = new ObjectMapper().writer();
		String jsonData = writer.writeValueAsString(paVO);

		environmentRepo.save(envDetails);
		EnvironmentPreset preset = EnvironmentPreset.builder().environment(envDetails).id(1L).jsonData(jsonData).key("test").type(Constants.PA_TYPE)
				.activeFlag(Constants.ACTIVEFLAG).build();
		environmentPresetRepository.save(preset);

		EnvironmentPresetVO vo = paPresetService.getEnviromentPaPresetDetails(envDetails.getEnvironmentName(), "test");
		assertNotNull(vo);

	}

	@Test
	public void testDeleteBeneficiaryPreset() throws JsonProcessingException {
		Environment EnvironmentDetails = Environment.builder().id(1L).environmentName("test").protocol("test").host("test").port("test").logonType("test").username("test")
				.password("test").pemText("test").dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test")
				.schemeName("test").build();

		PaVO paVO = PaVO.builder().number("test").description("test").build();

		ObjectWriter writer = new ObjectMapper().writer();
		String jsonData = writer.writeValueAsString(paVO);

		environmentRepo.save(EnvironmentDetails);
		EnvironmentPreset preset = EnvironmentPreset.builder().environment(EnvironmentDetails).id(1L).jsonData(jsonData).key("test").type(Constants.PA_TYPE)
				.activeFlag(Constants.ACTIVEFLAG).build();
		environmentPresetRepository.save(preset);

		ResponseVO deleteResponse = paPresetService.deletePaPreset(1L);
		assertEquals("PA Preset Deleted successfully", deleteResponse.getResponse());

	}

	@Test
	public void testGetGridData() throws YorosisException, IOException {

		Environment EnvironmentDetails = Environment.builder().id(1L).environmentName("test").protocol("test").host("test").port("test").logonType("test").username("test")
				.password("test").pemText("test").dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test")
				.schemeName("test").build();

		PaVO paVO = PaVO.builder().number("test").description("test").build();

		ObjectWriter writer = new ObjectMapper().writer();
		String jsonData = writer.writeValueAsString(paVO);

		environmentRepo.save(EnvironmentDetails);
		EnvironmentPreset preset = EnvironmentPreset.builder().environment(EnvironmentDetails).id(1L).jsonData(jsonData).key("test").type(Constants.PA_TYPE)
				.activeFlag(Constants.ACTIVEFLAG).build();
		environmentPresetRepository.save(preset);

		TableData beneficiaryPresetdata = paPresetService.getGridData(getPaginationVOObject(Constants.PA_TYPE));
		assertNotNull(beneficiaryPresetdata);

		YorosisException invalidTableDataException = Assertions.assertThrows(YorosisException.class, () -> {
			paPresetService.getGridData(getPaginationVOObject("test"));
		});
		Assertions.assertEquals("Invalid Grid Id", invalidTableDataException.getMessage());
	}

	@Test
	public void testGetPaVOList() throws IOException {
		Environment EnvironmentDetails = Environment.builder().id(1L).environmentName("test").protocol("test").host("test").port("test").logonType("test").username("test")
				.password("test").pemText("test").dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test")
				.schemeName("test").build();

		PaVO paVO = PaVO.builder().number("test").description("test").build();

		ObjectWriter writer = new ObjectMapper().writer();
		String jsonData = writer.writeValueAsString(paVO);

		environmentRepo.save(EnvironmentDetails);
		EnvironmentPreset preset = EnvironmentPreset.builder().environment(EnvironmentDetails).id(1L).jsonData(jsonData).key("test").type(Constants.PA_TYPE)
				.activeFlag(Constants.ACTIVEFLAG).build();
		environmentPresetRepository.save(preset);
		List<PaVO> paVOList = paPresetService.getPaVOList("test");
		Assertions.assertEquals(1, paVOList.size());

	}

}
