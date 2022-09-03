package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.TaskboardColumnsSecurity;

public interface TaskboardColumnsSecurityRepository extends JpaRepository<TaskboardColumnsSecurity, UUID> {

	public TaskboardColumnsSecurity findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID id, String tenantId,
			String activeFlag);

	@Query("select t from TaskboardColumnsSecurity t where t.taskboardColumns.id = :id and t.activeFlag = :activeFlag and t.tenantId=:tenantId")
	public List<TaskboardColumnsSecurity> getTaskBoardColumnIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
			@Param("id") UUID id, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select t from TaskboardColumnsSecurity t where t.taskboardColumns.id = :id and t.groupId=:groupId and t.activeFlag = :activeFlag and t.tenantId=:tenantId")
	public List<TaskboardColumnsSecurity> getTaskboardColumnSecurityWithGroupId(@Param("id") UUID id,
			@Param("groupId") UUID groupId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

}