package com.yorosis.authnz.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.LoginHistory;

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, UUID> {

	@Query("select p from LoginHistory p where p.id = :id")
	public LoginHistory findByLoginId(@Param("id") UUID id);
	
	@Query("select p from LoginHistory p where p.id = :id and p.logoutTime is null and p.activeFlag = :activeFlag and p.tenantId = :tenantId")
	public LoginHistory findByLoginIdAndTenantId(@Param("id") UUID id, @Param("activeFlag") String flag,
			@Param("tenantId") String tenantId);
}
