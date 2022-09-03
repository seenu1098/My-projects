package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.Menu;

public interface MenuConfigurationRepository extends JpaRepository<Menu, UUID> {

	@Query("select count(c) from Menu c where c.activeFlag=:activeFlag and c.tenantId=:tenantId")
	public String getTotalMenuCount(@Param("activeFlag") String flag, @Param("tenantId") String tenantId);

	@Query("select c from Menu c where c.activeFlag=:activeFlag and c.tenantId=:tenantId")
	public List<Menu> getMenuList(Pageable pageable, @Param("activeFlag") String flag, @Param("tenantId") String tenantId);

	@Query("select c from Menu c where c.id=:id and c.activeFlag=:activeFlag and c.tenantId=:tenantId")
	public Menu getMenuInfo(@Param("id") UUID id, @Param("activeFlag") String flag, @Param("tenantId") String tenantId);

	public List<Menu> findByTenantIdAndActiveFlag(String tenantId, String activeFlag);

	@Query("select c from Menu c where c.application.applicationId=:id and c.activeFlag=:activeFlag and c.tenantId=:tenantId")
	public Menu getMenuByApplicationIdentifier(@Param("id") String id, @Param("activeFlag") String flag, @Param("tenantId") String tenantId);

	public Menu findByApplicationIdAndActiveFlagAndMenuOrientationAndTenantIdIgnoreCase(UUID applicationId, String activeFlag, String menuOrientation,
			String tenantId);

	@Query("select c from Menu c where c.menuName=:menuName and c.tenantId=:tenantId and c.activeFlag=:activeFlag")
	public List<Menu> getMenuName(@Param("menuName") String menuName, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
}
