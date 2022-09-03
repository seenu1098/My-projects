// Generated with g9.

package com.yorosis.yoroflow.entities;

import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "process_def_task_properties")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TypeDef(name = "json", typeClass = JsonBinaryType.class)
public class ProcessDefTaskProperty extends BaseEntity {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "task_properties_id", unique = true, nullable = false)
	private UUID taskPropertiesId;

	@Column(name = "property_name", length = 50)
	private String propertyName;

	@Column(name = "property_value", nullable = false)
	@Type(type = "json")
	private JsonNode propertyValue;

	@Column(name = "process_definition_id", nullable = false, length = 100)
	private String processDefinitionId;

	@Column(name = "created_by", length = 100)
	private String createdBy;

	@Column(name = "updated_by", length = 100)
	private String updatedBy;

	@Column(name = "tenant_id", length = 60)
	private String tenantId;

	@ManyToOne
	@JoinColumn(name = "task_id")
	private ProcessDefinitionTask processDefinitionTask;
}
