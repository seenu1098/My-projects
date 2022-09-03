package com.yorosis.taskboard.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.taskboard.taskboard.entities.EventAutomationCategories;

public interface EventAutomationCategoriesRepository extends JpaRepository<EventAutomationCategories, UUID> {
	public List<EventAutomationCategories> findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String tenantId,
			String activeFlag);

	@Query("select a from EventAutomationCategories a where a.tenantId=:tenantId and a.activeFlag=:activeFlag and (a.appName is null or a.appName in :appList)")
	public List<EventAutomationCategories> getAutomationsByCategories(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("appList") List<String> appList);
}
