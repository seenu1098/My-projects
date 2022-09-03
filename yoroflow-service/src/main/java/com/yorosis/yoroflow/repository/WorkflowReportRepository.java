package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.yorosis.yoroflow.entities.WorkflowReport;

@Repository
public interface WorkflowReportRepository extends JpaRepository<WorkflowReport, UUID> {

	@Query("select pdp.workflowReport from WorkflowReportPermission pdp where pdp.workflowReport.id =:id and pdp.groupId IN :groupId and pdp.workflowReport.tenantId = :tenantId and pdp.workflowReport.activeFlag=:activeFlag")
	public WorkflowReport getWorkFlowReport(@Param("id") UUID id, @Param("groupId") List<UUID> listGroupId, @Param("activeFlag") String activeFlag,
			@Param("tenantId") String tenantId);

}
