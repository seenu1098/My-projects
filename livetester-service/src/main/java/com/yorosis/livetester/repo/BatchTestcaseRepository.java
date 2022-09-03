package com.yorosis.livetester.repo;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.livetester.entities.BatchTestcases;
import com.yorosis.livetester.vo.DayBasedReportVO;
import com.yorosis.livetester.vo.FormTypeBasedReportVO;

public interface BatchTestcaseRepository extends JpaRepository<BatchTestcases, Long> {

	@Query("select b from BatchTestcases b where b.batch.id=:id")
	public List<BatchTestcases> findByBatchId(Pageable pageable, long id);

	@Query("select b from BatchTestcases b where b.batch.id=:id")
	public List<BatchTestcases> findAllByBatchId(long id);

	@Query("select b from BatchTestcases b where b.batch.batchName =:batchName")
	public List<BatchTestcases> findByBatchName(Pageable pageable, @Param("batchName") String batchName);

	@Query("select count(b) from BatchTestcases b where b.batch.batchName =:batchName")
	public int countByBatchName(@Param("batchName") String batchName);

	public BatchTestcases findById(long id);

	@Query("select count(b) from BatchTestcases b  where b.claims.id =:id ")
	public int countClaimInBatch(Long id);
	
	@Query("select new com.yorosis.livetester.vo.FormTypeBasedReportVO(b.claims.formType.code,sum(b.batch.totalTestcases),sum(b.batch.passPercentage),sum(b.batch.failPercentage)) from BatchTestcases"
			+ " b where b.createdDate between :fromDate and :toDate  group by b.claims.formType.code ")
	public List<FormTypeBasedReportVO> getFormTypeBasedReport(@Param("fromDate") Timestamp fromDate, @Param("toDate") Timestamp toDate);
	
	
	@Query("select new com.yorosis.livetester.vo.DayBasedReportVO(b.batch.createdDate,sum(b.batch.totalTestcases),sum(b.batch.passPercentage),sum(b.batch.failPercentage)) from BatchTestcases"
			+ " b where b.batch.createdDate between :fromDate and :toDate  group by b.batch.createdDate order by b.batch.createdDate")
	public List<DayBasedReportVO> getDayBasedReport(@Param("fromDate") Timestamp fromDate, @Param("toDate") Timestamp toDate);

	@Query("select b from BatchTestcases b where b.claims =:testcaseId")
	public  BatchTestcases  findByClaims(@Param("testcaseId") Long testcaseId);
	
	@Query("select b from BatchTestcases b where b.batch.batchName =:batchName")
	public List<BatchTestcases> getByBatchName(@Param("batchName") String batchName);
}
