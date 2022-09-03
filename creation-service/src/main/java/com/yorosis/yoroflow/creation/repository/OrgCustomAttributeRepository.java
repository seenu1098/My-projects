package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.OrgCustomAttributes;

public interface OrgCustomAttributeRepository extends JpaRepository<OrgCustomAttributes, UUID> {

	@Query("select u from OrgCustomAttributes u where u.id=:id and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public OrgCustomAttributes getListBasedonIdAndTenantIdAndActiveFlag(@Param("id") UUID id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select u from OrgCustomAttributes u where u.name not in :name and u.attributeType = 'user' and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<OrgCustomAttributes> getListForUserCustomAttributes(@Param("name") List<String> name, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select u from OrgCustomAttributes u where u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<OrgCustomAttributes> getListBasedonUserNameAndTenantIdAndActiveFlag(@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
}
