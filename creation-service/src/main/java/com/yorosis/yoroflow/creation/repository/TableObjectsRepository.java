package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.TableObjects;

public interface TableObjectsRepository extends JpaRepository<TableObjects, UUID> {

	public TableObjects findByTableObjectsIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(UUID tableObjectsId,
			String activeFlag, String tenantId);

	public List<TableObjects> findByActiveFlagIgnoreCaseAndTenantIdIgnoreCase(String activeFlag, String tenantId);

	public TableObjects findByTableNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String tableName, String tenantId,
			String activeFlag);

	public TableObjects findByTableIdentifierAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String tableIdentifier,
			String tenantId, String activeFlag);

	@Query("select t from TableObjects t where t.activeFlag = :activeFlag and t.tenantId = :tenantId and "
			+ "exists (select s from TableObjectsSecurity s where s.tableObjects.tableObjectsId = t.tableObjectsId and "
			+ "s.activeFlag = :activeFlag and s.tenantId = :tenantId and (s.users.userId =:userId or s.yoroGroups.id in :groupIdList)) order by t.createdOn desc")
	public List<TableObjects> findByActiveFlagIgnoreCaseAndTenantIdIgnoreCaseWithPermission(
			@Param("activeFlag") String activeFlag, @Param("tenantId") String tenantId, @Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList);
}
