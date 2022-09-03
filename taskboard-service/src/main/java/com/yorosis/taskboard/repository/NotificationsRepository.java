package com.yorosis.taskboard.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.taskboard.taskboard.entities.Notifications;

public interface NotificationsRepository extends JpaRepository<Notifications, UUID> {

	public List<Notifications> findByToIdAndTenantId(UUID toId, String tenantId);

	@Query("select c from Notifications c where c.toId in :toId and c.taskboardTaskId =:taskboardTaskId and c.tenantId=:tenantId")
	public List<Notifications> getDeleteUserNotifications(@Param("toId") List<UUID> toId,
			@Param("taskboardTaskId") UUID taskboardTaskId, @Param("tenantId") String tenantId);

	@Query("select c from Notifications c where c.toId = :toId and c.groupId = :groupId"
			+ " and c.fromId =:fromId and c.taskId =:taskId and c.tenantId=:tenantId")
	public Notifications checkNotifications(@Param("toId") UUID toId, @Param("groupId") UUID groupId,
			@Param("fromId") UUID fromId, @Param("taskId") UUID taskId, @Param("tenantId") String tenantId);

	@Query("select c.toId from Notifications c where c.toId in :toId "
			+ " and c.fromId =:fromId and c.taskboardTaskId =:taskboardTaskId and c.tenantId=:tenantId")
	public List<UUID> checkNotificationsForTaskboardAssign(@Param("toId") List<UUID> toId, @Param("fromId") UUID fromId,
			@Param("taskboardTaskId") UUID taskboardTaskId, @Param("tenantId") String tenantId);
}
