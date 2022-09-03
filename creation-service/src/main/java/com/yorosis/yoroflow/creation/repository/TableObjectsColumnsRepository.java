package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.TableObjectsColumns;

public interface TableObjectsColumnsRepository extends JpaRepository<TableObjectsColumns, UUID> {

	public TableObjectsColumns findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID id, String tenantId, String activeFlag);

	@Query("select t from TableObjectsColumns t where t.tableObjects.tableObjectsId = :tableObjectsId and t.activeFlag = :activeFlag and t.tenantId=:tenantId")
	public List<TableObjectsColumns> findByTableObjectsIdAndActiveFlagIgnoreCaseAndTenantId(@Param("tableObjectsId") UUID tableObjectsId,
			@Param("activeFlag") String activeFlag, @Param("tenantId") String tenantId);

	@Query("select t from TableObjectsColumns t where t.tableObjects.tableObjectsId = :tableObjectsId"
			+ " and t.columnName=:columnName  and t.activeFlag = :activeFlag and t.tenantId=:tenantId")
	public TableObjectsColumns getTableObjects(@Param("tableObjectsId") UUID tableObjectsId, @Param("columnName") String columnName,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
}
