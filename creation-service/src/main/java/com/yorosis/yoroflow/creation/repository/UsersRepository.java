package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.Users;

public interface UsersRepository extends JpaRepository<Users, UUID> {
	public Users findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String userName, String tenantId,
			String activeFlag);

	public Users findByUserNameAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(String userName, String activeFlag,
			String tenantId);

	public Users findByUserIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(UUID id, String activeFlag, String tenantId);

	public Users findByUserIdAndTenantIdIgnoreCase(UUID id, String tenantId);

	public Users findByEmailIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(String emailId, String activeFlag,
			String tenantId);

	@Query("select u from Users u where u.activeFlag=:activeFlag and u.tenantId=:tenantId")
	public List<Users> getAllUsers(@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select count(u) from Users u where u.activeFlag=:activeFlag and u.tenantId=:tenantId")
	public Long getAllUsersCount(@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select u.userId from Users u where u.activeFlag=:activeFlag and u.tenantId=:tenantId")
	public List<Long> getAllUsersId(@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select count(u) from Users u where u.emailId=:emailId and u.activeFlag=:activeFlag and u.tenantId=:tenantId")
	public int getTotalUsersCount(@Param("emailId") String emailId, @Param("activeFlag") String activeFlag,
			@Param("tenantId") String tenantId);

	public Users findByUserName(String userName);

	public Users findByContactEmailId(String emailId);

	public Users findByUserId(UUID id);

	public Users findByEmailId(String emailId);

	public Users findByUserNameAndTenantId(String userName, String tenantId);

	@Query("select count(u) from Users u where u.emailId=:emailId and u.activeFlag=:activeFlag and u.tenantId=:tenantId")
	public int findByEmailIdCount(@Param("emailId") String emailId, @Param("activeFlag") String activeFlag,
			@Param("tenantId") String tenantId);

	@Query("select u from Users u where u.activeFlag=:activeFlag and u.tenantId=:tenantId and u.otpSecret is not null")
	public List<Users> getAllUsersWithTwoFactorSecret(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select u from Users u where u.userId <> :userId and u.activeFlag=:activeFlag and u.tenantId=:tenantId")
	public List<Users> getAllUsersWithoutAdminRoles(@Param("userId") UUID userId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select u from Users u where u.userId <> :userId and u.tenantId=:tenantId")
	public List<Users> getAllUsersWithPagination(@Param("userId") UUID userId, @Param("tenantId") String tenantId,
			Pageable pageable);

	@Query("select u from Users u where u.userId <> :userId and u.tenantId=:tenantId and u.activeFlag=:activeFlag")
	public List<Users> getAllUsers(@Param("userId") UUID userId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select u from Users u where u.userId not in :usersIdList and u.tenantId=:tenantId and u.activeFlag=:activeFlag")
	public List<Users> getAllUsersForInactivate(@Param("usersIdList") List<UUID> usersIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
	
	@Query("select u from Users u where u.userId in :usersIdList and u.tenantId=:tenantId and u.activeFlag=:activeFlag")
	public List<Users> getAllUsersForOwners(@Param("usersIdList") List<UUID> usersIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select count(u) from Users u where  u.userId <> :userId and u.tenantId=:tenantId")
	public int getAllUsersCount(@Param("userId") UUID userId, @Param("tenantId") String tenantId);

	@Query("select count(u) from Users u where u.tenantId=:tenantId and u.activeFlag=:activeFlag")
	public int getAllUsersCountByCustomer(@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select count(u) from Users u where u.tenantId=:tenantId and u.activeFlag=:activeFlag")
	public Long getAllActiveUsersCount(@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

}