package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.yorosis.yoroflow.entities.ActivityLog;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID> {

	@Query("select t from ActivityLog t where t.childId =:taskId and t.parentId =:taskboardId "
			+ "and t.activeFlag = :activeFlag and t.tenantId = :tenantId")
	public List<ActivityLog> getTaskBoardTaskActivityLogList(String tenantId, String activeFlag,
			@Param("taskId") UUID taskId, @Param("taskboardId") UUID taskboardId, Pageable pageable);

	@Query("select count(t) from ActivityLog t where t.childId =:taskId and t.parentId =:taskboardId "
			+ "and t.activeFlag = :activeFlag and t.tenantId = :tenantId")
	public Long getTaskBoardTaskActivityLogListCount(String tenantId, String activeFlag, @Param("taskId") UUID taskId,
			@Param("taskboardId") UUID taskboardId);

	@Query("select t from ActivityLog t where t.parentId =:instanceId "
			+ "and t.activeFlag = :activeFlag and t.tenantId = :tenantId")
	public List<ActivityLog> getWorkflowActivityLogList(String tenantId, String activeFlag,
			@Param("instanceId") UUID instanceId, Pageable pageable);

	@Query("select count(t) from ActivityLog t where t.parentId =:instanceId "
			+ "and t.activeFlag = :activeFlag and t.tenantId = :tenantId")
	public Long getWorkflowActivityLogListCount(String tenantId, String activeFlag, @Param("instanceId") UUID instanceId);

}
