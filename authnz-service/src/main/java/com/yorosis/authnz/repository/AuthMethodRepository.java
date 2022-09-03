package com.yorosis.authnz.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.yorosis.yoroapps.entities.AuthMethods;

@Repository
public interface AuthMethodRepository extends JpaRepository<AuthMethods, UUID> {
	@Query("select p from AuthMethods p where p.providerName = :providerName and p.activeFlag = :activeFlag and p.tenantId = :tenantId")
	public AuthMethods findByProviderName(@Param("providerName") String providerName, @Param("activeFlag") String flag,
			@Param("tenantId") String tenantId);
}
