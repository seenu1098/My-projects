package com.yorosis.yoroflow.creation.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroapps.entities.GridFilter;

public interface GridFilterRepository extends JpaRepository<GridFilter, UUID> {

	public GridFilter findByFilterIdAndActiveFlagAndTenantIdIgnoreCase(UUID filterId, String flag, String tenantId);

}
