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

import com.yorosis.livetester.repo.LookupDataRepository;
import com.yorosis.livetester.security.YorosisContext;
import com.yorosis.livetester.service.LookupDataService;
import com.yorosis.livetester.vo.LookupDataVO;
import com.yorosis.livetester.vo.ResponseVO;

@SpringBootTest
@ActiveProfiles(profiles = { "default", "test" })
public class LookupDataServiceTest extends AbstractBaseTest {

	@Autowired
	private LookupDataService lookupDataService;

	@Autowired
	private LookupDataRepository lookupDataRepository;

	@Autowired
	private DataSource datasource;

	private LookupDataVO getLookupDataVO(Long id) {
		return LookupDataVO.builder().id(id).type("Receiver").code("Dental").description("Receiver - Description").build();
	}

	@AfterEach
	public void deleteLookupData() throws SQLException {
		lookupDataRepository.deleteAll();
		clearSequences();
	}

	@Test
	public void testSaveLookupData() {
		YorosisContext.set(new YorosisContext("karthi", true));
		ResponseVO createResponse = lookupDataService.saveLookupData(getLookupDataVO(0L));
		assertEquals("Lookup Data created successfully", createResponse.getResponse());

	}

	@Test
	public void testUpdateLookupData() {
		YorosisContext.set(new YorosisContext("karthi", true));
		lookupDataService.saveLookupData(getLookupDataVO(0L));
		ResponseVO updateLookupData = lookupDataService.saveLookupData(getLookupDataVO(1L));
		assertEquals("Lookup Data updated successfully", updateLookupData.getResponse());

	}
	@Test
	public void testGetLookupDataInfo() {
		YorosisContext.set(new YorosisContext("karthi", true));
		lookupDataService.saveLookupData(getLookupDataVO(null));

		LookupDataVO lookupData = lookupDataService.getLookupDataInfo(1L);
		assertNotNull(lookupData);
		assertEquals("Dental", lookupData.getCode());
	}

	@Test
	public void testGetLookupDataList() {
		YorosisContext.set(new YorosisContext("karthi", true));

		lookupDataService.saveLookupData(getLookupDataVO(null));
		List<LookupDataVO> lookuplist = lookupDataService.getlookupDataListVO();
		assertNotNull(lookuplist);
		assertEquals(1, lookuplist.size());
	}

	@Test
	public void testDeletelookupDataList() {
		YorosisContext.set(new YorosisContext("karthi", true));
		lookupDataService.saveLookupData(getLookupDataVO(null));

		ResponseVO deleteResponse = lookupDataService.deletelookupDataList(1L);
		assertEquals("Lookup Data deleted successfully", deleteResponse.getResponse());

		List<LookupDataVO> lookuplist = lookupDataService.getlookupDataListVO();
		assertNotNull(lookuplist);
		assertEquals(0, lookuplist.size());
	}

	@Test
	public void testGetLookupDataListUsingType() {
		YorosisContext.set(new YorosisContext("karthi", true));
		lookupDataService.saveLookupData(getLookupDataVO(null));

		List<LookupDataVO> lookuplist = lookupDataService.getlookupDataList("Receiver");
		assertNotNull(lookuplist);
		assertEquals(1, lookuplist.size());
	}

	@Override
	protected DataSource getDatasource() {
		return datasource;
	}

}
