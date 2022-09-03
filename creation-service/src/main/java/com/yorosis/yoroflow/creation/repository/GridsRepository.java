package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.Grids;

public interface GridsRepository extends JpaRepository<Grids, UUID> {

	public Grids findByGridNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String gridName, String tenantId, String activeFlag);

	@Query("select g from Grids g where  g.gridName = :gridName and g.activeFlag = :activeFlag and g.tenantId=:tenantId")
	public Grids getGrid(@Param("gridName") String name, @Param("activeFlag") String flag, @Param("tenantId") String tenantId);

	@Query("select g from Grids g where activeFlag = :activeFlag and g.tenantId=:tenantId")
	public List<Grids> getAll(@Param("activeFlag") String activeFlag, @Param("tenantId") String tenantId);
}
