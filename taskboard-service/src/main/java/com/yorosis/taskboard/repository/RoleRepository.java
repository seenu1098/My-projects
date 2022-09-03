package com.yorosis.taskboard.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.taskboard.taskboard.entities.Role;

public interface RoleRepository extends JpaRepository<Role, UUID> {
	public Role findByRoleIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID id, String tenantId, String activeFlag);
}
