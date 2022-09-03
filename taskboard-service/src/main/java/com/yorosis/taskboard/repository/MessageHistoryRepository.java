package com.yorosis.taskboard.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.taskboard.taskboard.entities.MessageHistory;

public interface MessageHistoryRepository extends JpaRepository<MessageHistory, UUID> {

	@Query("select m from MessageHistory m where ((m.fromId =:fromId and m.toId =:toId) or (m.fromId =:toId and m.toId =:fromId) ) "
			+ "and m.tenantId =:tenentId order by m.createdOn asc ")
	public List<MessageHistory> getmessageHistory(@Param("fromId") UUID fromId, @Param("toId") UUID toId,
			@Param("tenentId") String tenantId);

	@Query("select count(m) from MessageHistory m where  m.toId =:toId and m.fromId=:fromId "
			+ "and m.tenantId =:tenentId and m.readTime is null ")
	public long getUnReadMessageCount(@Param("toId") UUID toId, @Param("fromId") UUID fromId,
			@Param("tenentId") String tenantId);

	public List<MessageHistory> findByFromIdAndToIdAndTenantId(UUID fromId, UUID toId, String tenantId,
			Pageable pageable);

	@Query("select m from MessageHistory m where m.groupId=:groupId and m.tenantId =:tenentId order by m.createdOn asc ")
	public List<MessageHistory> getGroupMessageHistory(@Param("groupId") UUID groupId,
			@Param("tenentId") String tenantId);
}
