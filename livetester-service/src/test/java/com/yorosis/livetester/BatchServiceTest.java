package com.yorosis.livetester;

import static org.junit.Assert.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.IOException;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.ParseException;

import javax.sql.DataSource;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.yorosis.livetester.entities.Batch;
import com.yorosis.livetester.entities.Environment;
import com.yorosis.livetester.exception.YorosisException;
import com.yorosis.livetester.grid.vo.FilterValueVO;
import com.yorosis.livetester.grid.vo.PaginationVO;
import com.yorosis.livetester.grid.vo.TableData;
import com.yorosis.livetester.repo.BatchRepository;
import com.yorosis.livetester.repo.EnvironmentRepository;
import com.yorosis.livetester.security.YorosisContext;
import com.yorosis.livetester.service.BatchService;
import com.yorosis.livetester.service.EnvironmentService;
import com.yorosis.livetester.vo.EnvironmentVO;

@SpringBootTest
@ActiveProfiles(profiles = { "default", "test" })
public class BatchServiceTest extends AbstractBaseTest {

	@Autowired
	private BatchService testcaseResultService;

	@Autowired
	private BatchRepository batchRepository;

	@Autowired
	private EnvironmentService environmentService;

	@Autowired
	private EnvironmentRepository environmentRepository;

	@Autowired
	private DataSource datasource;

	@AfterEach
	public void clearData() throws SQLException {
		batchRepository.deleteAll();
		environmentRepository.deleteAll();
		clearSequences();
	}

	@Test
	public void testSaveBatchData() throws JsonProcessingException {
		YorosisContext.set(new YorosisContext("test", true));
		EnvironmentVO saveEnvironmentDetails = EnvironmentVO.builder().environmentName("test").protocol("test").host("test").port("test").logonType("test").userName("test")
				.password("test").pemText("test").dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test")
				.schemaName("test").build();

		environmentService.saveEnvironmentData(saveEnvironmentDetails);

		Environment environment = environmentRepository.getOne(1L);

		Timestamp currentTime = new Timestamp(System.currentTimeMillis());
		Batch batch = Batch.builder().batchName("Batch Test").environment(environment).totalTestcases(5L).status("submitted").startTime(currentTime).endTime(currentTime)
				.passPercentage(4L).failPercentage(1L).id(1L).build();

		batchRepository.save(batch);
	}

	private PaginationVO getPagination() {
		FilterValueVO[] filterarray = new FilterValueVO[0];
		return PaginationVO.builder().gridId("batch").columnName("batchName").index(0).size(10).filterValue(filterarray).direction("asc").build();
	}

	@Test
	public void testGetGridData() throws IOException, YorosisException, ParseException {
		YorosisContext.set(new YorosisContext("test", true));

		EnvironmentVO environmentVo = EnvironmentVO.builder().environmentName("test").protocol("test").host("test").port("test").logonType("test").userName("test").password("test")
				.pemText("test").dbType("test").dbHost("test").dbPort("test").dbName("test").dbUsername("test").dbPassword("test").targetFolder("test").schemaName("test").build();
		environmentService.saveEnvironmentData(environmentVo);

		Environment environment = environmentRepository.findById(1L);

		Timestamp currentTime = new Timestamp(System.currentTimeMillis());
		Batch batch = Batch.builder().batchName("Batch Test").environment(environment).totalTestcases(5L).status("submitted").startTime(currentTime).endTime(currentTime)
				.passPercentage(4L).failPercentage(1L).id(1L).build();

		batchRepository.save(batch);

		TableData gridData = testcaseResultService.getGridData(getPagination());
		assertNotNull(gridData);
		assertEquals("1", gridData.getTotalRecords());
	}

	@Override
	protected DataSource getDatasource() {
		return datasource;
	}

}
