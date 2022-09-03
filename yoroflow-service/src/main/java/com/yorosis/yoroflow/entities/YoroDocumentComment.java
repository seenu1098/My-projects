package com.yorosis.yoroflow.entities;

import java.sql.Timestamp;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode.Exclude;
import lombok.NoArgsConstructor;

@Table(name = "yoro_documents_comments")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class YoroDocumentComment {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "comment_id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "doc_comment", nullable = false)
	private String comment;

	@Column(name = "doc_commented_section", nullable = false)
	private String commentedSection;

	@Column(name = "reply_to_comment_id")
	private UUID replyToCommentId;
	
	@Column(name = "comment_index", nullable = false, length = 60)
	private Long index;

	@Column(name = "comment_length", nullable = false, length = 100)
	private Long length;

	@Column(name = "tenant_id", nullable = false, length = 60)
	private String tenantId;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "modified_by", length = 100)
	private String modifiedBy;

	@Column(name = "modified_on", nullable = false)
	private Timestamp modifiedOn;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

	@Exclude
	@ManyToOne(optional = false)
	@JoinColumn(name = "document_id", nullable = false)
	private YoroDocuments yoroDocuments;
}
