package com.yorosis.authnz.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.AuthAssociateRoles;

public interface AuthAssociateRolesRepository extends JpaRepository<AuthAssociateRoles, UUID> {

	@Query("select u.roleId from AuthAssociateRoles u where u.tenantId = :tenantId and u.activeFlag=:activeFlag and u.authMethods.id =:authMethodId")
	public List<UUID> getAuthAssociateRolesListBasedOnAuthMethod(@Param("authMethodId") UUID authMethodId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

}
