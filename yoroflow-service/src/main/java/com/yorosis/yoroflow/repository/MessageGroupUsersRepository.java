package com.yorosis.yoroflow.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.MessageGroupUsers;

public interface MessageGroupUsersRepository extends JpaRepository<MessageGroupUsers, UUID> {

	@Query("select c from MessageGroupUsers c where c.messageGroups.id=:groupId and c.users.userId=:userId and c.tenantId=:tenantId")
	public MessageGroupUsers getMessageGroupUser(@Param("groupId") UUID groupId, @Param("userId") UUID userId, @Param("tenantId") String tenantId);

}
