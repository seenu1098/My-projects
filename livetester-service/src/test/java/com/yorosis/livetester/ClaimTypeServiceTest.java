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

import com.yorosis.livetester.repo.ClaimTypeRepository;
import com.yorosis.livetester.security.YorosisContext;
import com.yorosis.livetester.service.ClaimTypeService;
import com.yorosis.livetester.vo.ClaimTypeVO;
import com.yorosis.livetester.vo.ResponseVO;

@SpringBootTest
@ActiveProfiles(profiles = { "default", "test" })
public class ClaimTypeServiceTest extends AbstractBaseTest {

	@Autowired
	private ClaimTypeService claimTypeService;

	@Autowired
	private ClaimTypeRepository claimTypeRepository;

	@Autowired
	private DataSource datasource;

	@AfterEach
	public void deleteClaimTypeDetails() throws SQLException {
		claimTypeRepository.deleteAll();
		clearSequences();
	}

	private ClaimTypeVO getClaimTypeVO(int n) {
		return ClaimTypeVO.builder().id(getClaimTypeId(n)).claimTypeCode("type").description("hello test").formType("form").build();
	}

	private ClaimTypeVO getClaimTypeVOWithoutId() {
		return ClaimTypeVO.builder().id(null).claimTypeCode("second").description("hello test").formType("form").build();
	}

	private Integer getClaimTypeId(int n) {
		return new Integer(n);
	}

	@Test
	public void testSaveClaimType() {
		YorosisContext.set(new YorosisContext("karthi", true));
		ResponseVO response = claimTypeService.saveClaimType(getClaimTypeVO(0));
		assertEquals("ClaimType created succesfully", response.getResponse());
		ResponseVO updateResponse = claimTypeService.saveClaimType(getClaimTypeVO(1));
		assertEquals("ClaimType updated successfully", updateResponse.getResponse());
		ResponseVO responseWihtoutId = claimTypeService.saveClaimType(getClaimTypeVOWithoutId());
		assertEquals("ClaimType created succesfully", responseWihtoutId.getResponse());

	}

	@Test
	public void testDeleteClaimTypeDetail() {
		YorosisContext.set(new YorosisContext("karthi", true));
		claimTypeService.saveClaimType(getClaimTypeVO(0));
		ResponseVO deleteClaimTypeResponse = claimTypeService.deleteClaimTypeDetail(getClaimTypeId(1));
		assertEquals("Claim type deleted succesfully", deleteClaimTypeResponse.getResponse());
	}

	@Test
	public void testGetClaimType() {
		YorosisContext.set(new YorosisContext("karthi", true));
		claimTypeService.saveClaimType(getClaimTypeVO(0));
		List<ClaimTypeVO> claimTypeList = claimTypeService.getClaimType();
		assertNotNull(claimTypeList);
		assertEquals(1, claimTypeList.size());
	}

	@Test
	public void testGetClaimTypeDetail() {
		YorosisContext.set(new YorosisContext("karthi", true));
		claimTypeService.saveClaimType(getClaimTypeVO(0));
		ClaimTypeVO claimTypeVO = claimTypeService.getClaimTypeDetail(getClaimTypeId(1));
		assertNotNull(claimTypeVO);
		assertEquals("type", claimTypeVO.getClaimTypeCode());
	}

	@Override
	protected DataSource getDatasource() {
		return datasource;
	}

}
