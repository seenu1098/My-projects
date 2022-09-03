package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.AuthAssociateGroups;

public interface AuthAssociateGroupsRepository extends JpaRepository<AuthAssociateGroups, UUID> {

	@Query("select u from AuthAssociateGroups u where u.tenantId = :tenantId and u.activeFlag=:activeFlag and u.authMethods.id =:id")
	public List<AuthAssociateGroups> getAccosiateGroupListBasedOnAuthMethod(@Param("id") UUID id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);
}
