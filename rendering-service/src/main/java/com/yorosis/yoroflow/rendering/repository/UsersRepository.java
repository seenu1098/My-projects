package com.yorosis.yoroflow.rendering.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.Users;

public interface UsersRepository extends JpaRepository<Users, UUID> {
	public Users findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String userName, String tenantId,
			String activeFlag);

	public Users findByUserNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String userName, String tenantId,
			String activeFlag);

	public Users findByUserIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(UUID id, String activeFlag, String tenantId);

	public Users findByEmailIdAndTenantIdIgnoreCase(String emailId, String tenantId);

	@Query("select u from Users u where u.activeFlag='Y' and u.tenantId=:tenantId order by u.id desc")
	public List<Users> getAllUsers(@Param("tenantId") String tenantId);

	@Query("select u.userId from Users u where u.activeFlag='Y' and u.tenantId=:tenantId")
	public List<UUID> getAllUsersId(@Param("tenantId") String tenantId);

	@Query("select count(u) from Users u where u.emailId=:emailId and u.activeFlag=:activeFlag and u.tenantId=:tenantId")
	public int getTotalUsersCount(@Param("emailId") String emailId, @Param("activeFlag") String activeFlag,
			@Param("tenantId") String tenantId);

	public Users findByUserId(UUID id);

	public Users findByUserNameAndTenantId(String userName, String tenantId);

}