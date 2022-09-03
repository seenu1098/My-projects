package com.yorosis.yoroflow.entities;

import java.sql.Timestamp;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = "yoro_documents")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class YoroDocuments {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "document_id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "document_name", nullable = false, length = 100)
	private String documentName;

	@Column(name = "document_key", nullable = false, length = 100)
	private String documentKey;

	@Column(name = "document_data", length = 100)
	private String documentData;

	@Column(name = "parent_document_id")
	private UUID parentDocumentId;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "modified_by", length = 100)
	private String modifiedBy;

	@Column(name = "modified_on")
	private Timestamp modifiedOn;

	@Column(name = "tenant_id", nullable = false, length = 60)
	private String tenantId;
	
	@Column(name = "workspace_id")
	private UUID workspaceId;
}
