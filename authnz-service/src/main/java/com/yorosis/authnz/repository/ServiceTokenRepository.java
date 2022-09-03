package com.yorosis.authnz.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.ServiceToken;

public interface ServiceTokenRepository extends JpaRepository<ServiceToken, UUID> {
	
	public ServiceToken findBySecretKey(String secretKey);
	
	@Query("select st from ServiceToken st where  st.apiKey = :apiKey and st.tenantId = :tenantId")
	public ServiceToken getServiceTokenByApiKey(@Param("apiKey") String apiKey, @Param("tenantId") String tenantId);	
}