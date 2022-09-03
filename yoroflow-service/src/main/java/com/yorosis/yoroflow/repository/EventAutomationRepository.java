package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.EventAutomation;

public interface EventAutomationRepository extends JpaRepository<EventAutomation, UUID> {

	@Query("select p from EventAutomation p where p.taskboard.id=:id and  p.tenantId=:tenantId and p.activeFlag=:activeFlag")
	public List<EventAutomation> getAutomationList(@Param("id") UUID id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select p from EventAutomation p where p.taskboard.id = :id and p.tenantId = :tenantId and p.activeFlag = :activeFlag and p.ruleActive = 'Y' and p.automationType = :automationType")
	public List<EventAutomation> getAutomationListFor(@Param("id") UUID id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("automationType") String automationType);

	public EventAutomation findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID id, String tenantId,
			String activeFlag);

	@Query("select distinct p.taskboard.id from EventAutomation p where p.tenantId = :tenantId and upper(p.activeFlag) = 'Y' and upper(p.ruleActive) = 'Y' and p.automationType = :automationType")
	public List<UUID> getTaskBoardWithAutomationType(@Param("tenantId") String tenantId,
			@Param("automationType") String automationType);

	@Query("select p from EventAutomation p where p.taskboard.id in :taskboardsIdList and  p.tenantId=:tenantId and p.activeFlag=:activeFlag")
	public List<EventAutomation> getAutomationByTaskboardsIdList(@Param("taskboardsIdList") List<UUID> taskboardsIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
}
