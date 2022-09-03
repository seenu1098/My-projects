package com.yorosis.taskboard.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.taskboard.taskboard.entities.TaskboardColumns;

public interface TaskboardColumnsRepository extends JpaRepository<TaskboardColumns, UUID> {

	public TaskboardColumns findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID id, String tenantId,
			String activeFlag);

	@Query(value = "select tc.column_name from taskboard_columns tc where tc.column_order = "
			+ "(select max(column_order) from taskboard_columns where taskboard_id = :taskboardId) and "
			+ "taskboard_id = :taskboardId and tc.tenant_id =:tenantId and tc.active_flag =:activeFlag", nativeQuery = true)
	public String getDoneColumnForWaitingOn(@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("taskboardId") UUID taskboardId);

	@Query("select tc from TaskboardColumns tc where "
			+ "tc.taskboard.id = :taskboardId and tc.tenantId =:tenantId and tc.activeFlag =:activeFlag")
	public List<TaskboardColumns> getFirstTaskboardColumn(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("taskboardId") UUID taskboardId, Pageable pageable);
}
