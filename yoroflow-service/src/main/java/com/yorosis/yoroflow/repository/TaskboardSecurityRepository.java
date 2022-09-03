package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.TaskboardSecurity;

public interface TaskboardSecurityRepository extends JpaRepository<TaskboardSecurity, UUID> {

	public TaskboardSecurity findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID id, String tenantId,
			String activeFlag);

	@Query("select t from TaskboardSecurity t where t.taskboard.id=:taskboardId and t.userId=:userId and t.tenantId= :tenantId and t.activeFlag= :activeFlag")
	public TaskboardSecurity findByIdAndUserIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
			@Param("taskboardId") UUID taskboardId, @Param("userId") UUID userId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select t from TaskboardSecurity t where t.taskboard.id=:taskboardId and t.groupId=:groupId and t.tenantId= :tenantId and t.activeFlag= :activeFlag")
	public TaskboardSecurity findByIdAndGroupIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
			@Param("taskboardId") UUID taskboardId, @Param("groupId") UUID groupId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select t from TaskboardSecurity t where t.taskboard.id=:taskboardId and t.groupId=:groupId and t.tenantId= :tenantId and t.activeFlag= :activeFlag")
	public List<TaskboardSecurity> getTaskboardSecurityList(@Param("taskboardId") UUID taskboardId,
			@Param("groupId") UUID groupId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select t from TaskboardSecurity t where t.taskboard.id=:taskboardId and t.userId=:userId and t.tenantId= :tenantId and t.activeFlag= :activeFlag")
	public List<TaskboardSecurity> getTaskboardSecurityListByUser(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select t from TaskboardSecurity t where t.userId in :userId and t.tenantId= :tenantId and t.activeFlag= :activeFlag")
	public List<TaskboardSecurity> getTaskboardSecurityListByUserId(@Param("userId") List<UUID> userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

}
