package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.yorosis.yoroapps.entities.TableObjectsSecurity;

@Repository
public interface TableObjectSecurityRepository extends JpaRepository<TableObjectsSecurity, UUID> {

	@Query("select u from TableObjectsSecurity u where u.tableObjects.tableObjectsId = :tableId "
			+ " and u.tableObjects.tenantId = :tenantId and u.tableObjects.activeFlag=:activeFlag"
			+ " and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<TableObjectsSecurity> getTableObjectsSecurityListBasedonTableIdTenantIdAndActiveFlag(
			@Param("tableId") UUID tableId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
	
	@Query("select u from TableObjectsSecurity u where u.tableObjects.tableObjectsId = :tableId "
			+ " and u.tableObjects.tenantId = :tenantId and u.tableObjects.activeFlag=:activeFlag"
			+ " and u.tenantId = :tenantId and u.activeFlag=:activeFlag and u.users.userId is not null")
	public List<TableObjectsSecurity> getTableObjectsSecurityListBasedonTableIdTenantIdAndActiveFlagForOwner(
			@Param("tableId") UUID tableId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
	
	@Query("select u from TableObjectsSecurity u where u.tableObjects.tableObjectsId = :tableId "
			+ " and u.tableObjects.tenantId = :tenantId and u.tableObjects.activeFlag=:activeFlag"
			+ " and u.tenantId = :tenantId and u.activeFlag=:activeFlag and u.yoroGroups.id is not null")
	public List<TableObjectsSecurity> getTableObjectsSecurityListBasedonTableIdTenantIdAndActiveFlagForTeam(
			@Param("tableId") UUID tableId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select u from TableObjectsSecurity u where u.tableObjects.tableObjectsId = :tableId "
			+ " and u.tableObjects.tenantId = :tenantId and u.tableObjects.activeFlag=:activeFlag"
			+ " and u.tenantId = :tenantId and u.activeFlag=:activeFlag and "
			+ "(u.users.userId in :userIdList or u.yoroGroups.id in :groupIdList)")
	public List<TableObjectsSecurity> getTableObjectsSecurityListForDelete(@Param("tableId") UUID tableId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, @Param("userIdList") List<UUID> userIdList,
			@Param("groupIdList") List<UUID> groupIdList);
}
