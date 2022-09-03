package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.YoroflowTimeZone;

public interface TimeZoneRepository extends JpaRepository<YoroflowTimeZone, UUID> {

	@Query("select u from YoroflowTimeZone u where u.defaultTimeZone =:defaultTimeZone and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public YoroflowTimeZone getDefaultTimeZone(@Param("defaultTimeZone") String defaultTimeZone, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select u from YoroflowTimeZone u where u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<YoroflowTimeZone> getAllTimeZone(@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
}
