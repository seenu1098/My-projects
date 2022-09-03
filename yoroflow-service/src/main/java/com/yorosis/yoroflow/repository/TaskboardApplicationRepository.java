package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.Taskboard;
import com.yorosis.yoroflow.entities.TaskboardApplication;

public interface TaskboardApplicationRepository extends JpaRepository<TaskboardApplication, UUID> {
	public List<TaskboardApplication> findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String tenantId,
			String activeFlag);

	public TaskboardApplication findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID id, String tenantId,
			String activeFlag);

	public List<TaskboardApplication> findByAppNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String appName,
			String tenantId, String activeFlag);

	public List<TaskboardApplication> findByTaskboardAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(Taskboard taskboard,
			String tenantId, String activeFlag);

	@Query("select p from TaskboardApplication p where p.taskboard.id=:taskboardId and p.appName=:appName and p.tenantId=:tenantId and p.activeFlag=:activeFlag")
	public TaskboardApplication getApplication(@Param("taskboardId") UUID taskboardId, @Param("appName") String appName,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
}
