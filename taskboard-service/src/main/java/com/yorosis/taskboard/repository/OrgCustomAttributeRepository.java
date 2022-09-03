package com.yorosis.taskboard.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.taskboard.taskboard.entities.OrgCustomAttributes;

public interface OrgCustomAttributeRepository extends JpaRepository<OrgCustomAttributes, UUID> {

	@Query("select u from OrgCustomAttributes u where u.name = :name and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public OrgCustomAttributes getAttributeBasedOnAttributeName(@Param("name") String name,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select u from OrgCustomAttributes u where u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<OrgCustomAttributes> getListBasedonTenantIdAndActiveFlag(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select count(u) from OrgCustomAttributes u where u.attributeType = 'user' and u.required = 'Y' and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public int getListForUserCustomAttributes(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);
}
