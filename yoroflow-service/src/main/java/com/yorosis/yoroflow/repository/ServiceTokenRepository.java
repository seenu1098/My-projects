package com.yorosis.yoroflow.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.ServiceToken;

public interface ServiceTokenRepository extends JpaRepository<ServiceToken, UUID> {

	@Query("select st from ServiceToken st where  st.users.userId = :userId and st.internal = 'Y'")
	public ServiceToken getInternalServiceTokenByUserId(@Param("userId") UUID userId);
}