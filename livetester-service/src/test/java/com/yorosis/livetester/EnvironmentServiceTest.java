package com.yorosis.livetester;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

import javax.sql.DataSource;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.yorosis.livetester.entities.Batch;
import com.yorosis.livetester.entities.Environment;
import com.yorosis.livetester.repo.BatchRepository;
import com.yorosis.livetester.repo.EnvironmentRepository;
import com.yorosis.livetester.security.YorosisContext;
import com.yorosis.livetester.service.EnvironmentService;
import com.yorosis.livetester.vo.EnvironmentListVO;
import com.yorosis.livetester.vo.EnvironmentVO;
import com.yorosis.livetester.vo.ResponseVO;

@SpringBootTest
@ActiveProfiles(profiles = { "default", "test" })
public class EnvironmentServiceTest extends AbstractBaseTest {

	@Autowired
	private EnvironmentRepository environmentRepo;

	@Autowired
	private EnvironmentService environmentService;

	@Autowired
	private BatchRepository batchRepo;

	@Autowired
	private DataSource datasource;

	@AfterEach
	public void deleteEnvironmentDetails() throws SQLException {
		batchRepo.deleteAll();
		environmentRepo.deleteAll();
		clearSequences();
	}

	@Test
	public void testSaveEnvironmentDetails() throws JsonProcessingException {
		YorosisContext.set(new YorosisContext("test", true));

		EnvironmentVO saveEnvironmentDetails = EnvironmentVO.builder().environmentName("test").protocol("test").host("test").port("test").logonType("test").userName("test")
				.password("test").pemText("test").dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test")
				.schemaName("test").build();

		EnvironmentVO updateEnvironmentDetails = EnvironmentVO.builder().environmentId(1L).environmentName("test").protocol("test").host("test").port("test").logonType("test")
				.userName("test").password("test").pemText("test").dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test")
				.targetFolder("test").schemaName("test").build();

		ResponseVO createResponse = environmentService.saveEnvironmentData(saveEnvironmentDetails);
		assertEquals("Environment created successfully", createResponse.getResponse());

		ResponseVO existResponse = environmentService.saveEnvironmentData(saveEnvironmentDetails);
		assertEquals("Environment Name Already Exist", existResponse.getResponse());

		ResponseVO updateResponse = environmentService.saveEnvironmentData(updateEnvironmentDetails);
		assertEquals("Environment updated successfully", updateResponse.getResponse());
	}

	@Test
	public void testEnvironmentList() {
		Environment EnvironmentDetails = Environment.builder().id(1L).environmentName("test").protocol("test").host("test").port("test").logonType("test").username("test")
				.password("test").pemText("test").dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test")
				.schemeName("test").build();

		environmentRepo.save(EnvironmentDetails);

		List<EnvironmentListVO> list = environmentService.getEnvironmentList();
		assertNotNull(list);
		assertEquals(1, list.size());
	}

	@Test
	public void testDetailsFetchForEnvironment() throws JsonParseException, JsonMappingException, IOException {
		Environment EnvironmentDetails = Environment.builder().id(1L).environmentName("test").protocol("test").host("test").port("test").logonType("test").username("test")
				.password("test").pemText("test").dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test")
				.schemeName("test").build();

		environmentRepo.save(EnvironmentDetails);

		EnvironmentVO vo = environmentService.getEnvironmentInfo(1L);
		assertNotNull(vo);
	}

	@Test
	public void testDeleteEnvironmentInfo() {
		Environment EnvironmentDetails = Environment.builder().id(1L).environmentName("test").protocol("test").host("test").port("test").logonType("test").username("test")
				.password("test").pemText("test").dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test")
				.schemeName("test").build();

		environmentRepo.save(EnvironmentDetails);

		Environment one = environmentRepo.getOne(1L);

		Batch batch = Batch.builder().id(1L).environment(one).build();
		batchRepo.save(batch);

		ResponseVO deletedResponse = environmentService.deleteEnvironmentInfo(1L);
		assertEquals("Environment have some batches", deletedResponse.getResponse());

		environmentRepo.save(Environment.builder().id(2L).build());

		ResponseVO deletedResponses = environmentService.deleteEnvironmentInfo(2L);
		assertEquals("Environment deleted Successfully", deletedResponses.getResponse());
	}

	@Override
	protected DataSource getDatasource() {
		return datasource;
	}
}
