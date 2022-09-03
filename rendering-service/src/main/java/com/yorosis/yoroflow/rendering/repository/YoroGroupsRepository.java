package com.yorosis.yoroflow.rendering.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.YoroGroups;

public interface YoroGroupsRepository extends JpaRepository<YoroGroups, UUID> {
	public YoroGroups findByGroupNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCaseAndManagedFlagIgnoreCase(
			String name, String tenantId, String activeFlag, String managedFlag);

	public YoroGroups findByGroupNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String name,
			String tenantId, String activeFlag);

	public YoroGroups findByIdAndTenantIdAndActiveFlagIgnoreCaseAndManagedFlagIgnoreCase(UUID id, String tenantId,
			String activeFlag, String managedFlag);

	public List<YoroGroups> findByGroupNameContainingIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCaseAndManagedFlagIgnoreCase(
			String name, String tenantId, String activeFlag, String managedFlag);

	@Query("select count(c) from YoroGroups c where  c.groupName = :name and c.activeFlag = :activeFlag and c.tenantId=:tenantId and c.managedFlag =:managedFlag")
	public int checkGroupExistOrNot(@Param("name") String name, @Param("activeFlag") String flag,
			@Param("tenantId") String tenantId, @Param("managedFlag") String managedFlag);

	@Query("select u from YoroGroups u where u.tenantId=:tenantId and u.activeFlag = :activeFlag and u.managedFlag =:managedFlag order by u.groupName asc")
	public List<YoroGroups> getAllYoroGroups(@Param("tenantId") String tenantId, @Param("activeFlag") String flag,
			@Param("managedFlag") String managedFlag);

	@Query("select count(u) from YoroGroups u where u.tenantId=:tenantId and u.activeFlag = :activeFlag and u.managedFlag =:managedFlag")
	public int getAllYoroGroupsCount(@Param("tenantId") String tenantId, @Param("activeFlag") String flag,
			@Param("managedFlag") String managedFlag);
	
	@Query("select u from YoroGroups u where u.id in :groupId and u.tenantId=:tenantId and u.activeFlag = :activeFlag and u.managedFlag =:managedFlag order by u.groupName asc")
	public List<YoroGroups> getAllYoroGroupsById(@Param("groupId") List<UUID> groupId, @Param("tenantId") String tenantId, @Param("activeFlag") String flag,
			@Param("managedFlag") String managedFlag);

}
