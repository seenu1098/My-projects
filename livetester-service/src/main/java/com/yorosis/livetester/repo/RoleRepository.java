package com.yorosis.livetester.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.livetester.entities.Roles;

public interface RoleRepository extends JpaRepository<Roles, Integer> {
	public Roles findByRoleId(int id);
}
