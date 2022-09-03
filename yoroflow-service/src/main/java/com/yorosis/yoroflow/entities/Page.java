package com.yorosis.yoroflow.entities;

import java.sql.Timestamp;
import java.util.Set;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = "page")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@TypeDef(name = "json", typeClass = JsonNodeBinaryType.class)
public class Page {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "page_name", nullable = false, length = 200)
	private String pageName;

	@Column(name = "page_id", nullable = false, length = 200)
	private String pageId;

	@Column(name = "description", nullable = true)
	private String description;

	@Column(name = "page_link", nullable = true)
	private String pageLink;

	@Type(type = "json")
	@Column(name = "page_data", nullable = false, columnDefinition = "json")
	private JsonNode pageData;

	@Column(name = "tenant_id", nullable = false, length = 60)
	private String tenantId;

	@Column(name = "layout_type", nullable = true, length = 50)
	private String layoutType;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "modified_by", nullable = false, length = 100)
	private String modifiedBy;

	@Column(name = "modified_on", nullable = false)
	private Timestamp modifiedOn;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

	@Column(name = "application_id")
	private UUID applicationId;

	@Column(name = "qualifier")
	private String qualifier;

	@Column(name = "status")
	private String status;

	@Column(name = "page_version")
	private Long version;

	@Column(name = "is_workflow_form")
	private String isWorkflowForm;

	@OneToMany(mappedBy = "page")
	private Set<PagePermissions> pagePermissions;
}
