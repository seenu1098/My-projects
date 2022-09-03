package com.yorosis.taskboard.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.taskboard.taskboard.entities.EventAutomationConfig;

public interface EventAutomationConfigurationRepository extends JpaRepository<EventAutomationConfig, UUID> {

	public List<EventAutomationConfig> findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String tenantId,
			String activeFlag);

	public List<EventAutomationConfig> findByParentAutomationIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
			UUID parentAutomationId, String tenantId, String activeFlag);

	@Query("select a from EventAutomationConfig a where a.tenantId=:tenantId and a.activeFlag=:activeFlag and (a.appName is null or a.appName in :appList)")
	public List<EventAutomationConfig> getAutomationConfigurationList(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("appList") List<String> appList);
}
