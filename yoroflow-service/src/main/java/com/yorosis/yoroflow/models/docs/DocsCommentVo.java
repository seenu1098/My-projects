package com.yorosis.yoroflow.models.docs;

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
public class DocsCommentVo {
	private UUID id;
	private UUID parentCommentId;
	private UUID docId;
	private String comment;
	private String commentSection;
	private String createdBy;
	private Timestamp createdOn;
	private Timestamp modifiedOn;
	private Long length;
	private Long index;
	private int commentLength;
	private List<DocsCommentVo> nestedDocsCommentVo;
}
