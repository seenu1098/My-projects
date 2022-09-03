package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroapps.entities.MarketPlaceEntity;

public interface MarketPlaceRepository extends JpaRepository<MarketPlaceEntity, UUID> {

	public List<MarketPlaceEntity> findByTenantIdAndActiveFlagIgnoreCase(String tenantId, String activeFlag);

	public MarketPlaceEntity findByProcessDefinitionName(String processDefinitionName);
}
