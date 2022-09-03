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
public class NestedCommentsVO {
	private UUID id;
	private UUID parentCommentId;
	private String nestedComment;
	private String createdBy;
	private Timestamp createdOn;
	private Timestamp modifiedOn;
	private List<NestedCommentsVO> nestedComments;
}
