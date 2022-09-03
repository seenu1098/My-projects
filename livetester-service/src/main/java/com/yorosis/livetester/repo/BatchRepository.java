package com.yorosis.livetester.repo;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.livetester.entities.Batch;

public interface BatchRepository extends JpaRepository<Batch, Long> {

	@Query("select count(b) from Batch b")
	public String getTotalBatchCount();
	
	@Query("select b from Batch b where b.createdDate between :fromDate and :toDate order by b.createdDate")
	public List<Batch> getBatchReport(@Param("fromDate") Timestamp fromDate, @Param("toDate") Timestamp toDate);
	
	@Query("select count(b) from Batch b where b.batchName=:name")
	public int getBatchCount(@Param("name") String name);
	
	public Batch findByBatchName(@Param("batchName") String batchName); 

	public List<Batch> findByStatus(String status);

}