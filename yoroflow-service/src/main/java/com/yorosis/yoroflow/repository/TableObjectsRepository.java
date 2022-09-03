package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroflow.entities.TableObjects;

public interface TableObjectsRepository extends JpaRepository<TableObjects, UUID> {

	public TableObjects findByTableObjectsIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(UUID tableObjectsId, String activeFlag, String tenantId);

	public List<TableObjects> findByActiveFlagIgnoreCaseAndTenantIdIgnoreCase(String activeFlag, String tenantId);

	public TableObjects findByTableNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String tableName, String tenantId, String activeFlag);

}
