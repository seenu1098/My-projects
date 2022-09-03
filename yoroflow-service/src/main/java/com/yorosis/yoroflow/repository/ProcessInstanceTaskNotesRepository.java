package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.entities.ProcessInstanceTaskNotes;

public interface ProcessInstanceTaskNotesRepository extends JpaRepository<ProcessInstanceTaskNotes, UUID> {

	public ProcessInstanceTaskNotes findByTaskNotesAttId(UUID taskNotesAttId);

	@Transactional
	@Modifying
	@Query("delete from ProcessInstanceTaskNotes c where c.taskNotesAttId=:taskNotesAttId and c.tenantId = :tenantId")
	public int deleteByTaskNotesAttId(@Param("taskNotesAttId") UUID taskNotesAttId, @Param("tenantId") String tenantId);

	@Query("select c from ProcessInstanceTaskNotes c where c.processInstanceTask.processInstanceTaskId=:processInstanceTaskId and c.tenantId = :tenantId")
	public List<ProcessInstanceTaskNotes> getNotes(@Param("processInstanceTaskId") UUID processInstanceTaskId,
			@Param("tenantId") String tenantId, Pageable pageable);
	
	@Query("select c from ProcessInstanceTaskNotes c where c.processInstanceTask.processInstanceTaskId in :processInstanceTaskId and c.tenantId = :tenantId")
	public List<ProcessInstanceTaskNotes> getNotesList(@Param("processInstanceTaskId") List<UUID> processInstanceTaskId,
			@Param("tenantId") String tenantId);

	@Query("select c from ProcessInstanceTaskNotes c where c.processInstanceTask.processInstanceTaskId=:processInstanceTaskId and c.tenantId = :tenantId")
	public List<ProcessInstanceTaskNotes> getTaskNotes(@Param("processInstanceTaskId") UUID processInstanceTaskId,
			@Param("tenantId") String tenantId);

	public ProcessInstanceTaskNotes findByTaskNotesAttIdAndTenantIdIgnoreCase(UUID id,
			String tenantId);

	@Query("select c from ProcessInstanceTaskNotes c where c.processInstanceTask.processInstanceTaskId=:processInstanceTaskId and c.tenantId = :tenantId order by createdDate asc")
	public List<ProcessInstanceTaskNotes> getNotesList(@Param("processInstanceTaskId") UUID processInstanceTaskId,
			@Param("tenantId") String tenantId);

	@Query("select c from ProcessInstanceTaskNotes c where c.processInstanceTask.processInstanceTaskId=:processInstanceTaskId and c.parentNotesId=:parentNotesId and c.tenantId = :tenantId order by createdDate asc")
	public List<ProcessInstanceTaskNotes> getNestedNotes(@Param("processInstanceTaskId") UUID processInstanceTaskId,
			@Param("parentNotesId") UUID parentNotesId, @Param("tenantId") String tenantId);

}
