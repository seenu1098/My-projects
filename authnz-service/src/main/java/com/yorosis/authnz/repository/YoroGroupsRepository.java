package com.yorosis.authnz.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.yorosis.yoroapps.entities.YoroGroups;

@Repository
public interface YoroGroupsRepository extends JpaRepository<YoroGroups, UUID> {

	public YoroGroups findByIdAndTenantIdAndActiveFlagIgnoreCase(UUID id, String tenantId, String activeFlag);
	
	@Query("select u from YoroGroups u where u.tenantId = :tenantId and u.activeFlag=:activeFlag and u.id in :id")
	public List<YoroGroups> getGroupList(@Param("id") List<UUID> id,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

}
