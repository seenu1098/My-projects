package com.yorosis.livetester.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.livetester.entities.UserRole;

public interface UserRoleRepository extends JpaRepository<UserRole, Integer> {

	@Transactional
	@Modifying
	@Query("delete  from  UserRole c where c.users.userId=:userId")
	public int deleteByUsers(@Param("userId") int userId);
}
