package com.yorosis.livetester.repo;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.livetester.entities.BatchTestcasesResult;

public interface BatchTestcaseResultRepository extends JpaRepository<BatchTestcasesResult, Long> {
	@Query("select count(b)  from  BatchTestcasesResult b where b.batchTestcases.id = :id")
	public String getBatchTestcaseResultCount(@Param("id") long id);

	@Query("select b from  BatchTestcasesResult b where b.batchTestcases.id = :id ")
	public List<BatchTestcasesResult> getBatchTestcaseResultList(Pageable pageable, @Param("id") long id);
}
