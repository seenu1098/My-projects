package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.ProcessDefTaskPrmsn;

public interface ProcessDefTaskPrmsnRepository extends JpaRepository<ProcessDefTaskPrmsn, UUID> {
	@Query("select p from ProcessDefTaskPrmsn p where p.processDefinitionTask.taskId = :taskId")
	public List<ProcessDefTaskPrmsn> getPermissionList(@Param("taskId") UUID taskId);

	@Query("select p from ProcessDefTaskPrmsn p where p.processDefinitionTask.taskId = :taskId and p.userId= :userId")
	public List<ProcessDefTaskPrmsn> getPermissionListByUser(@Param("taskId") UUID taskId, @Param("userId") UUID userId);

	@Query("select p from ProcessDefTaskPrmsn p where p.processDefinitionTask.taskId = :taskId and p.groupId IN :groupId")
	public List<ProcessDefTaskPrmsn> getPermissionListByGroup(@Param("taskId") UUID taskId, @Param("groupId") List<UUID> groupId);

	@Query("select p from ProcessDefTaskPrmsn p where p.processDefinitionTask.taskId = :taskId and (p.userId= :userId or p.groupId IN :groupId)")
	public List<ProcessDefTaskPrmsn> getPermissionListByUserAndGroup(@Param("taskId") UUID taskId, @Param("userId") UUID userId,
			@Param("groupId") List<UUID> groupId);

	@Query("select p.groupId from ProcessDefTaskPrmsn p where p.processDefinitionTask.taskId = :taskId and p.groupId is not null")
	public List<UUID> getPermissionListByTaskId(@Param("taskId") UUID taskId);

}
