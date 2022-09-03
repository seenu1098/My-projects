package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.TaskboardColumns;
import com.yorosis.yoroflow.entities.TaskboardSubStatus;

public interface TaskboardSubStatusRepository extends JpaRepository<TaskboardSubStatus, UUID> {
	@Query("select p from TaskboardSubStatus p where p.taskboardColumnId = :taskboardColumnId and p.tenantId = :tenantId and p.activeFlag = :activeFlag order by columnOrder asc")
	public List<TaskboardSubStatus> getSubStatusList(@Param("taskboardColumnId") TaskboardColumns taskboardColumnId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	public TaskboardSubStatus findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID id, String tenantId, String activeFlag);

	@Query("select p from TaskboardSubStatus p where p.id in :id and p.tenantId = :tenantId and p.activeFlag = :activeFlag")
	public List<TaskboardSubStatus> getIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(@Param("id") List<UUID> id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);
}
