package com.yorosis.yoroflow.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.entities.ProcessInstanceTaskFile;

public interface ProcessInstanceTaskFilesRepository extends JpaRepository<ProcessInstanceTaskFile, UUID> {

	@Transactional
	@Modifying
	@Query("delete from ProcessInstanceTaskFile c where c.taskFileAttId=:taskFileAttId and c.tenantId = :tenantId")
	public int deleteByTaskFileAttId(@Param("taskFileAttId") UUID taskFileAttId, @Param("tenantId") String tenantId);
}
