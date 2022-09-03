
package com.yorosis.livetester.repo;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.livetester.entities.Testcases;

public interface TestcasesRepository extends JpaRepository<Testcases, Long> {

	@Query("select count(c) from Testcases c where c.testcaseName = :testCaseName")
	public int countGetByTestCaseName(String testCaseName);

	@Query("select c from Testcases c")
	public List<Testcases> getTestcasesList(Pageable pageable);

	@Query("select c from Testcases c where c.createdBy=:user")
	public List<Testcases> getTestcasesListForNonAccessUsers(Pageable pageable, @Param("user") String user);

	@Query("select count(c) from Testcases c")
	public String getTotalTestcasesCount();

}
