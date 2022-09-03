package com.yorosis.taskboard.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.taskboard.taskboard.entities.TaskboardLaunchPermission;

public interface TaskboardLaunchPermissionRepository extends JpaRepository<TaskboardLaunchPermission, UUID> {

	@Query("select t from TaskboardLaunchPermission t where t.taskboard.id =:taskboardId and t.activeFlag = :activeFlag and t.tenantId = :tenantId")
	public List<TaskboardLaunchPermission> getTaskboardLaunchPermissionListByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
			String tenantId, String activeFlag, @Param("taskboardId") UUID taskboardId);

}
