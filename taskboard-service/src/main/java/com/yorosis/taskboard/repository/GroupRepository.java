package com.yorosis.taskboard.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.taskboard.taskboard.entities.Group;

public interface GroupRepository extends JpaRepository<Group, UUID> {
	public List<Group> findByTenantIdIgnoreCaseAndActiveFlagIgnoreCaseAndManagedFlagIgnoreCase(String tenantId, String activeFlag, String managedFlag);

	public Group findByGroupIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCaseAndManagedFlagIgnoreCase(UUID groupId, String tenantId, String activeFlag,
			String managedFlag);

	public Group findByGroupNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String groupName, String tenantId, String activeFlag);

	@Query("select t from Group t where t.groupId in :groupId and t.activeFlag = :activeFlag and t.tenantId = :tenantId")
	public List<Group> getGroupListByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
			String tenantId, String activeFlag, @Param("groupId") List<UUID> groupId);
	
}
