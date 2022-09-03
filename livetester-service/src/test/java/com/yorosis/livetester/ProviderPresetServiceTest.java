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
import com.yorosis.livetester.service.ProviderPresetService;
import com.yorosis.livetester.vo.AddressVO;
import com.yorosis.livetester.vo.EnvironmentPresetVO;
import com.yorosis.livetester.vo.ProviderVO;
import com.yorosis.livetester.vo.ResponseVO;

@SpringBootTest
@ActiveProfiles(profiles = { "default", "test" })
public class ProviderPresetServiceTest extends AbstractBaseTest {

	@Autowired
	private EnvironmentRepository environmentRepo;

	@Autowired
	private EnvironmentPresetRepository environmentPresetRepository;

	@Autowired
	private ProviderPresetService providerPresetService;

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
	public void testSaveProviderPreset() throws JsonProcessingException {
		YorosisContext.set(new YorosisContext("test", true));

		Environment EnvironmentDetails = Environment.builder().id(1L).environmentName("test").protocol("test").host("test").port("test").logonType("test").username("test")
				.password("test").pemText("test").dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test")
				.schemeName("test").build();

		environmentRepo.save(EnvironmentDetails);

		AddressVO address = AddressVO.builder().address("test").city("test").state("test").zipcode("test").build();

		ProviderVO provider = ProviderVO.builder().firstName("test").lastName("test").npi("test").organizationName("test").taxId("test").address(address).build();

		EnvironmentPresetVO saveEnviromentPresetVO = EnvironmentPresetVO.builder().environmentId(1L).id(0L).key("test").type(Constants.PROVIDER_TYPE).provider(provider).build();

		EnvironmentPresetVO updateEnviromentPresetVO = EnvironmentPresetVO.builder().environmentId(1L).id(1L).key("test").type(Constants.PROVIDER_TYPE).provider(provider).build();

		EnvironmentPresetVO existEnviromentPresetVO = EnvironmentPresetVO.builder().environmentId(1L).id(0L).key("test").type(Constants.PROVIDER_TYPE).provider(provider).build();

		ResponseVO createResponse = providerPresetService.saveProviderPreset(saveEnviromentPresetVO);
		assertEquals("Provider Preset Created successfully", createResponse.getResponse());

		ResponseVO updateResponse = providerPresetService.saveProviderPreset(updateEnviromentPresetVO);
		assertEquals("Provider Preset updated successfully", updateResponse.getResponse());

		ResponseVO existResponse = providerPresetService.saveProviderPreset(existEnviromentPresetVO);
		assertEquals("Npi Already Exist", existResponse.getResponse());

	}

	@Test
	public void testGetEnviromentProviderPresetDetails() throws IOException {

		Environment EnvironmentDetails = Environment.builder().id(1L).environmentName("test").protocol("test").host("test").port("test").logonType("test").username("test")
				.password("test").pemText("test").dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test")
				.schemeName("test").build();
		AddressVO address = AddressVO.builder().address("test").city("test").state("test").zipcode("test").build();

		ProviderVO provider = ProviderVO.builder().firstName("test").lastName("test").npi("test").organizationName("test").taxId("test").address(address).build();

		ObjectWriter writer = new ObjectMapper().writer();
		String jsonData = writer.writeValueAsString(provider);

		environmentRepo.save(EnvironmentDetails);
		EnvironmentPreset preset = EnvironmentPreset.builder().environment(EnvironmentDetails).id(1L).jsonData(jsonData).key("test").type(Constants.PROVIDER_TYPE)
				.activeFlag(Constants.ACTIVEFLAG).build();
		environmentPresetRepository.save(preset);

		EnvironmentPresetVO vo = providerPresetService.getEnviromentProviderPresetDetails(EnvironmentDetails.getEnvironmentName(), "test");
		assertNotNull(vo);

	}

	@Test
	public void testDeleteBeneficiaryPreset() throws JsonProcessingException {
		Environment EnvironmentDetails = Environment.builder().id(1L).environmentName("test").protocol("test").host("test").port("test").logonType("test").username("test")
				.password("test").pemText("test").dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test")
				.schemeName("test").build();
		AddressVO address = AddressVO.builder().address("test").city("test").state("test").zipcode("test").build();

		ProviderVO provider = ProviderVO.builder().firstName("test").lastName("test").npi("test").organizationName("test").taxId("test").address(address).build();

		ObjectWriter writer = new ObjectMapper().writer();
		String jsonData = writer.writeValueAsString(provider);

		environmentRepo.save(EnvironmentDetails);
		EnvironmentPreset preset = EnvironmentPreset.builder().environment(EnvironmentDetails).id(1L).jsonData(jsonData).key("test").type(Constants.BENEFICIARY_TYPE)
				.activeFlag(Constants.ACTIVEFLAG).build();
		environmentPresetRepository.save(preset);

		ResponseVO deleteResponse = providerPresetService.deleteProviderPreset(1L);
		assertEquals("Provider Preset Deleted successfully", deleteResponse.getResponse());

	}

	@Test
	public void testGetGridData() throws YorosisException, IOException {

		Environment EnvironmentDetails = Environment.builder().id(1L).environmentName("test").protocol("test").host("test").port("test").logonType("test").username("test")
				.password("test").pemText("test").dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test")
				.schemeName("test").build();
		AddressVO address = AddressVO.builder().address("test").city("test").state("test").zipcode("test").build();

		ProviderVO provider = ProviderVO.builder().firstName("test").lastName("test").npi("test").organizationName("test").taxId("test").address(address).taxId("test")
				.taxonomy("test").type("test").build();

		ObjectWriter writer = new ObjectMapper().writer();
		String jsonData = writer.writeValueAsString(provider);

		environmentRepo.save(EnvironmentDetails);
		EnvironmentPreset preset = EnvironmentPreset.builder().environment(EnvironmentDetails).id(1L).jsonData(jsonData).key("test").type(Constants.PROVIDER_TYPE)
				.activeFlag(Constants.ACTIVEFLAG).build();
		environmentPresetRepository.save(preset);

		TableData beneficiaryPresetdata = providerPresetService.getGridData(getPaginationVOObject(Constants.PROVIDER_TYPE));
		assertNotNull(beneficiaryPresetdata);

		YorosisException invalidTableDataException = Assertions.assertThrows(YorosisException.class, () -> {
			providerPresetService.getGridData(getPaginationVOObject("test"));
		});
		Assertions.assertEquals("Invalid Grid Id", invalidTableDataException.getMessage());
	}

	@Test
	public void testGetProviderVOList() throws IOException {
		Environment EnvironmentDetails = Environment.builder().id(1L).environmentName("test").protocol("test").host("test").port("test").logonType("test").username("test")
				.password("test").pemText("test").dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test")
				.schemeName("test").build();
		AddressVO address = AddressVO.builder().address("test").city("test").state("test").zipcode("test").build();

		ProviderVO provider = ProviderVO.builder().firstName("test").lastName("test").npi("test").organizationName("test").taxId("test").address(address).taxId("test")
				.taxonomy("test").type("test").build();

		ObjectWriter writer = new ObjectMapper().writer();
		String jsonData = writer.writeValueAsString(provider);

		environmentRepo.save(EnvironmentDetails);
		EnvironmentPreset preset = EnvironmentPreset.builder().environment(EnvironmentDetails).id(1L).jsonData(jsonData).key("test").type(Constants.PROVIDER_TYPE)
				.activeFlag(Constants.ACTIVEFLAG).build();
		environmentPresetRepository.save(preset);
		List<ProviderVO> providerVOList = providerPresetService.getProviderVOList("test");
		Assertions.assertEquals(1, providerVOList.size());
	}

	@Override
	protected DataSource getDatasource() {
		return datasource;
	}

}
