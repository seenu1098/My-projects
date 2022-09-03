package com.yorosis.authnz.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroapps.entities.Users;



public interface UsersRepository extends JpaRepository<Users, UUID> {
	public Users findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String userName, String tenantId,
			String activeFlag);

	public Users findByUserNameAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(String userName, String activeFlag,
			String tenantId);

	public Users findByUserIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(UUID id, String activeFlag, String tenantId);

	public Users findByEmailIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(String emailId, String activeFlag,
			String tenantId);
	
	public Users findByUserNameIgnoreCase(String username);
}