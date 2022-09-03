package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.CustomMenuMobile;

public interface OrganizationMenuPreferenceRepository extends JpaRepository<CustomMenuMobile, UUID> {
	@Query("select u from CustomMenuMobile u where u.tenantId = :tenantId and u.activeFlag=:activeFlag order by u.defaultMenuName asc")
	public List<CustomMenuMobile> getCustomMenu(@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select u from CustomMenuMobile u where u.defaultMenuName=:defaultMenuName and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<CustomMenuMobile> getCustomMenuWithName(@Param("defaultMenuName") String defaultMenuName, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select u from CustomMenuMobile u where u.id=:id and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public CustomMenuMobile getCustomMenuWithId(@Param("id") UUID id, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
}
