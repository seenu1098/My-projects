package com.yorosis.taskboard.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.taskboard.taskboard.entities.User;

public interface UsersRepository extends JpaRepository<User, UUID> {

	public User findByUserNameAndTenantId(String userName, String tenantId);

	public User findByUserId(UUID id);

	public User findByEmailId(String emailId);

	public User findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String userName, String tenantId,
			String activeFlag);

	public User findByUserIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(UUID id, String activeFlag, String tenantId);

	public List<User> findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select count(u) from User u where u.emailId=:emailId")
	public int getTotalUsersCount(@Param("emailId") String emailId);

	@Query("select u from User u where u.tenantId=:tenantId and u.userId= :userid")
	public User getUserbyUserIDAndTenantID(@Param("userid") UUID userid, @Param("tenantId") String tenantId);

	public List<User> findByTenantId(String tenantId);

	public User findByUserName(String username);

	@Query("select count(u) from User u where u.emailId=:emailId and u.activeFlag=:activeFlag and u.tenantId=:tenantId")
	public int findByEmailIdCount(@Param("emailId") String emailId, @Param("activeFlag") String activeFlag,
			@Param("tenantId") String tenantId);

	@Query("select u from User u where u.activeFlag=:activeFlag and u.tenantId=:tenantId order by u.firstName asc")
	public List<User> getAllUsers(@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	public User findByUserIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(@Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select p from User p where p.userName=:userName and p.activeFlag=:activeFlag and p.tenantId=:tenantId")
	public User getUserName(@Param("userName") String userName, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select p from User p where p.tenantId=:tenantId and p.activeFlag=:activeFlag order by p.createdOn asc")
	public List<User> getUserNameByTenantId(@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("Select u from User u where u.userId in :listUsers and u.activeFlag='Y' and u.tenantId = :tenantId ")
	public List<User> findUsersByID(@Param("listUsers") List<UUID> listUsers, @Param("tenantId") String tenantId);
}
