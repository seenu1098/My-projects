package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.TaskboardTaskComments;

public interface TaskboardTaskCommentsRepository extends JpaRepository<TaskboardTaskComments, UUID> {

	public TaskboardTaskComments findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID id, String tenantId, String activeFlag);

	@Query("select c from TaskboardTaskComments c where  c.taskboardTask.id = :id and c.taskboardTask.activeFlag = :activeFlag and c.taskboardTask.tenantId = :tenantId and c.activeFlag = :activeFlag and c.tenantId = :tenantId")
	public List<TaskboardTaskComments> getTaskboardTaskComments(@Param("id") UUID id, @Param("tenantId") String tenantId, @Param("activeFlag") String flag);

	@Query("select c from TaskboardTaskComments c where  c.taskboardTask.id = :taskId and c.replyToCommentId = :parentCommentId and c.taskboardTask.activeFlag = :activeFlag and c.taskboardTask.tenantId = :tenantId and c.activeFlag = :activeFlag and c.tenantId = :tenantId order by c.createdOn asc")
	public List<TaskboardTaskComments> getTaskboardTaskParentComments(@Param("taskId") UUID taskId, @Param("parentCommentId") UUID parentCommentId, @Param("tenantId") String tenantId, @Param("activeFlag") String flag);
	
}
