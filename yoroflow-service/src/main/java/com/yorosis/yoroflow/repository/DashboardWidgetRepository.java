package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.DashboardWidgets;

public interface DashboardWidgetRepository extends JpaRepository<DashboardWidgets, UUID> {

	@Query("select c from DashboardWidgets c where c.dashboard.id =:dashboardId and c.activeFlag =:activeFlag and c.tenantId=:tenantId")
	public List<DashboardWidgets> getDashboardWidgetsByDashboardId(@Param("dashboardId") UUID dashboardId,
			@Param("activeFlag") String activeFlag, @Param("tenantId") String tenantId);

	@Query("select c from DashboardWidgets c where c.dashboard.id =:dashboardId and c.activeFlag =:activeFlag and c.tenantId=:tenantId "
			+ "order by c.rowNum asc, c.columnNum asc")
	public List<DashboardWidgets> getDashboardWidgetsOrderByRowAndColumnNum(@Param("dashboardId") UUID dashboardId,
			@Param("activeFlag") String activeFlag, @Param("tenantId") String tenantId);

	public List<DashboardWidgets> findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(@Param("id") UUID id,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

}
