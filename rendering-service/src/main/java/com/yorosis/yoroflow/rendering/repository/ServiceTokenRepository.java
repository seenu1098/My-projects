package com.yorosis.yoroflow.rendering.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.ServiceToken;

public interface ServiceTokenRepository extends JpaRepository<ServiceToken, UUID> {

	@Query("select st from ServiceToken st where  st.tenantId = :tenantId and st.internal = 'Y'")
	public ServiceToken getInternalServiceTokenByTenantId(@Param("tenantId") String tenantId);
}