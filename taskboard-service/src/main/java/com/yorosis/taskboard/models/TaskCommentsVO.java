package com.yorosis.taskboard.models;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskCommentsVO {
	private UUID id;
	private UUID taskId;
	private String comments;
	private String createdBy;
	private Timestamp createdOn;
	private Timestamp modifiedOn;
	private UUID parentCommentId;
	private List<NestedCommentsVO> nestedComments;
	private List<String> mentionedUsersEmail;
	private List<UUID> mentionedUsersId;
}
