package com.yorosis.livetester.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.livetester.entities.Environment;

public interface EnvironmentRepository extends JpaRepository<Environment, Long> {

	public Environment findById(long id);

	public Environment findByEnvironmentNameIgnoreCase(String name);

	public List<Environment> findAllByOrderByIdDesc();

	@Query("select count(e) from Environment e where e.environmentName=:environmentName")
	public int getEnvironmentNameCount(@Param("environmentName") String environmentName);
}
