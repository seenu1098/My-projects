package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.WorkflowReportPermission;

public interface WorkflowReportPermissionRepository extends JpaRepository<WorkflowReportPermission, UUID> {

	@Query("select u from WorkflowReportPermission u where u.workflowReport.id =:id and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<WorkflowReportPermission> getListBasedonReportId(@Param("id") UUID id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

//	@Query("select u from WorkflowReportPermission u where u.reportId =:reportId and u.tenantId = :tenantId and u.groupId IN :groupId and u.activeFlag=:activeFlag")
//	public List<WorkflowReportPermission> getWorkFlowReport(@Param("reportId") UUID reportId,
//			@Param("groupId") List<UUID> listGroupId, @Param("activeFlag") String activeFlag,
//			@Param("tenantId") String tenantId);

}
