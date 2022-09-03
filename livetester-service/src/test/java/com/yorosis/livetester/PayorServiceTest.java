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
import com.yorosis.livetester.service.PayorPresetService;
import com.yorosis.livetester.vo.AddressVO;
import com.yorosis.livetester.vo.EnvironmentPresetVO;
import com.yorosis.livetester.vo.PayorVO;
import com.yorosis.livetester.vo.ResponseVO;

@SpringBootTest
@ActiveProfiles(profiles = { "default", "test" })
public class PayorServiceTest extends AbstractBaseTest {

	@Autowired
	private EnvironmentRepository environmentRepo;

	@Autowired
	private PayorPresetService payorPresetService;

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

	@Test
	public void testSaveBeneficiaryPreset() throws JsonProcessingException {
		YorosisContext.set(new YorosisContext("test", true));

		Environment EnvironmentDetails = Environment.builder().id(1L).environmentName("test").protocol("test").host("test").port("test").logonType("test").username("test")
				.password("test").pemText("test").dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test")
				.schemeName("test").build();

		environmentRepo.save(EnvironmentDetails);

		AddressVO address = AddressVO.builder().address("test").city("test").state("test").zipcode("test").build();

		PayorVO payor = PayorVO.builder().identifier("test").name("test").address(address).build();

		EnvironmentPresetVO saveEnviromentPresetVO = EnvironmentPresetVO.builder().environmentId(1L).id(0L).key("test").type(Constants.PAYOR_TYPE).payor(payor).build();

		EnvironmentPresetVO updateEnviromentPresetVO = EnvironmentPresetVO.builder().environmentId(1L).id(1L).key("test").type(Constants.PAYOR_TYPE).payor(payor).build();

		EnvironmentPresetVO existEnviromentPresetVO = EnvironmentPresetVO.builder().environmentId(1L).id(0L).key("test").type(Constants.PAYOR_TYPE).payor(payor).build();

		ResponseVO createResponse = payorPresetService.savePayorPreset(saveEnviromentPresetVO);
		assertEquals("Payor Preset Created successfully", createResponse.getResponse());

		ResponseVO updateResponse = payorPresetService.savePayorPreset(updateEnviromentPresetVO);
		assertEquals("Payor Preset updated successfully", updateResponse.getResponse());

		ResponseVO existResponse = payorPresetService.savePayorPreset(existEnviromentPresetVO);
		assertEquals("Payor Identifier Already Exist", existResponse.getResponse());

	}

	@Test
	public void testGetEnviromentPresetDetails() throws IOException {

		Environment environmentDetails = Environment.builder().id(1L).environmentName("test").protocol("test").host("test").port("test").logonType("test").username("test")
				.password("test").pemText("test").dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test")
				.schemeName("test").build();
		AddressVO address = AddressVO.builder().address("test").city("test").state("test").zipcode("test").build();

		PayorVO payor = PayorVO.builder().identifier("test").name("test").address(address).build();

		ObjectWriter writer = new ObjectMapper().writer();
		String jsonData = writer.writeValueAsString(payor);

		environmentRepo.save(environmentDetails);
		EnvironmentPreset preset = EnvironmentPreset.builder().environment(environmentDetails).id(1L).jsonData(jsonData).key("test").type(Constants.PAYOR_TYPE)
				.activeFlag(Constants.ACTIVEFLAG).build();
		environmentPresetRepository.save(preset);

		EnvironmentPresetVO vo = payorPresetService.getEnviromentPayorPresetDetails(environmentDetails.getEnvironmentName(), "test");
		assertNotNull(vo);

	}

	@Test
	public void testDeleteBeneficiaryPreset() throws JsonProcessingException {
		Environment EnvironmentDetails = Environment.builder().id(1L).environmentName("test").protocol("test").host("test").port("test").logonType("test").username("test")
				.password("test").pemText("test").dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test")
				.schemeName("test").build();
		AddressVO address = AddressVO.builder().address("test").city("test").state("test").zipcode("test").build();

		PayorVO payor = PayorVO.builder().identifier("test").name("test").address(address).build();

		ObjectWriter writer = new ObjectMapper().writer();
		String jsonData = writer.writeValueAsString(payor);

		environmentRepo.save(EnvironmentDetails);
		EnvironmentPreset preset = EnvironmentPreset.builder().environment(EnvironmentDetails).id(1L).jsonData(jsonData).key("test").type(Constants.PAYOR_TYPE)
				.activeFlag(Constants.ACTIVEFLAG).build();
		environmentPresetRepository.save(preset);

		ResponseVO deleteResponse = payorPresetService.deletePayorPreset(1L);
		assertEquals("Payor Preset Deleted successfully", deleteResponse.getResponse());

	}

	@Test
	public void testGetGridData() throws YorosisException, IOException {

		Environment EnvironmentDetails = Environment.builder().id(1L).environmentName("test").protocol("test").host("test").port("test").logonType("test").username("test")
				.password("test").pemText("test").dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test")
				.schemeName("test").build();
		AddressVO address = AddressVO.builder().address("test").city("test").state("test").zipcode("test").build();

		PayorVO payor = PayorVO.builder().identifier("test").name("test").address(address).build();

		ObjectWriter writer = new ObjectMapper().writer();
		String jsonData = writer.writeValueAsString(payor);

		environmentRepo.save(EnvironmentDetails);
		EnvironmentPreset preset = EnvironmentPreset.builder().environment(EnvironmentDetails).id(1L).jsonData(jsonData).key("test").type(Constants.PAYOR_TYPE)
				.activeFlag(Constants.ACTIVEFLAG).build();
		environmentPresetRepository.save(preset);

		TableData beneficiaryPresetdata = payorPresetService.getGridData(getPaginationVOObject(Constants.PAYOR_TYPE));
		assertNotNull(beneficiaryPresetdata);

		YorosisException invalidTableDataException = Assertions.assertThrows(YorosisException.class, () -> {
			payorPresetService.getGridData(getPaginationVOObject("test"));
		});
		Assertions.assertEquals("Invalid Grid Id", invalidTableDataException.getMessage());
	}

	@Test
	public void testGetPayorVOList() throws IOException {
		Environment EnvironmentDetails = Environment.builder().id(1L).environmentName("test").protocol("test").host("test").port("test").logonType("test").username("test")
				.password("test").pemText("test").dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test")
				.schemeName("test").build();
		AddressVO address = AddressVO.builder().address("test").city("test").state("test").zipcode("test").build();

		PayorVO payor = PayorVO.builder().identifier("test").name("test").address(address).build();

		ObjectWriter writer = new ObjectMapper().writer();
		String jsonData = writer.writeValueAsString(payor);

		environmentRepo.save(EnvironmentDetails);
		EnvironmentPreset preset = EnvironmentPreset.builder().environment(EnvironmentDetails).id(1L).jsonData(jsonData).key("test").type(Constants.PAYOR_TYPE)
				.activeFlag(Constants.ACTIVEFLAG).build();
		environmentPresetRepository.save(preset);
		List<PayorVO> payorVOList = payorPresetService.getPayorVOList("test");
		Assertions.assertEquals(1, payorVOList.size());
	}

	@Override
	protected DataSource getDatasource() {
		return datasource;
	}

}
