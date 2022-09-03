package com.yorosis.taskboard.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.taskboard.taskboard.entities.TaskboardTaskAssignedUsers;

public interface TaskboardTaskAssignedUsersRepository extends JpaRepository<TaskboardTaskAssignedUsers, UUID> {

	@Query("select p from TaskboardTaskAssignedUsers p where p.id in :id and p.tenantId= :tenantId and p.activeFlag= :activeFlag")
	public List<TaskboardTaskAssignedUsers> getAssigneeList(@Param("id") List<UUID> id,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select p from TaskboardTaskAssignedUsers p where p.userId in :userId and p.tenantId= :tenantId and p.activeFlag= :activeFlag")
	public List<TaskboardTaskAssignedUsers> getAssigneeListByUserId(@Param("userId") List<UUID> userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
}
