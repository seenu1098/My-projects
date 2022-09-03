package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.TaskboardApplicationConfig;

public interface TaskboardAppConfigRepository extends JpaRepository<TaskboardApplicationConfig, UUID> {
	@Query("select p from TaskboardApplicationConfig p where p.taskboardApplication.id=:id and p.tenantId=:tenantId and p.activeFlag=:activeFlag")
	public TaskboardApplicationConfig getTaskboardApplicationConfigurations(@Param("id") UUID id,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	public List<TaskboardApplicationConfig> findByTaskboardIdAndTenantIdAndActiveFlag(UUID taskboardId, String tenantId,
			String activeFalg);
	
	public TaskboardApplicationConfig findByIdAndTenantIdAndActiveFlag(UUID id, String tenantId,
			String activeFalg);
}
