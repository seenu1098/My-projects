package com.yorosis.livetester.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.livetester.entities.TestcaseCategories;

public interface TestcaseCategoriesRepository extends JpaRepository<TestcaseCategories, Long> {
	@Transactional
	@Modifying
	@Query("delete from TestcaseCategories c where c.testcase.id = :testcaseId")
	public int deleteByTestcases(@Param("testcaseId") Long testcaseId);
	
	@Query("select c from TestcaseCategories c where c.testcase.id = :testcaseId")
	public List<TestcaseCategories> findBTestcaseId(@Param("testcaseId") Long testcaseId);
}
