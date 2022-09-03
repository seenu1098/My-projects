package com.yorosis.taskboard.taskboard.entities;

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

@Entity
@Table(name = "org_custom_attributes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrgCustomAttributes {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id")
	private UUID id;

	@Column(name = "attribute_name")
	private String name;

	@Column(name = "tenant_id")
	private String tenantId;

	@Column(name = "attribute_value")
	private String value;

	@Column(name = "attribute_datatype")
	private String dataType;

	@Column(name = "attribute_type")
	private String attributeType;

	@Column(name = "attribute_size")
	private Long size;

	@Column(name = "attribute_required")
	private String required;

	@Column(name = "active_flag")
	private String activeFlag;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "created_on")
	private Timestamp createdDate;

	@Column(name = "modified_by", nullable = false, length = 100)
	private String modifiedBy;

	@Column(name = "modified_on", nullable = false)
	private Timestamp modifiedOn;
}
